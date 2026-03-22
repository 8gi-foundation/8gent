'use client'

import type {
  ClientMessage,
  ConnectionStatus,
  DaemonEventMap,
  DaemonEventName,
  ServerMessage,
} from './types'

type StatusListener = (status: ConnectionStatus) => void
type EventHandler<K extends DaemonEventName> = (payload: DaemonEventMap[K]) => void

const PING_INTERVAL = 30_000
const MAX_RETRIES = 10

class DaemonClient {
  private ws: WebSocket | null = null
  private url: string
  private token: string | null
  private retryCount = 0
  private retryTimer: ReturnType<typeof setTimeout> | null = null
  private pingTimer: ReturnType<typeof setInterval> | null = null
  private _status: ConnectionStatus = 'disconnected'
  private _sessionId: string | null = null
  private statusListeners = new Set<StatusListener>()
  private eventListeners = new Map<DaemonEventName, Set<EventHandler<never>>>()
  private intentionalClose = false

  constructor() {
    this.url = (typeof window !== 'undefined'
      ? process.env.NEXT_PUBLIC_DAEMON_URL
      : undefined) ?? 'ws://localhost:18789'
    this.token = (typeof window !== 'undefined'
      ? process.env.NEXT_PUBLIC_DAEMON_AUTH_TOKEN
      : undefined) ?? null
  }

  // --- Public API ---

  get status(): ConnectionStatus {
    return this._status
  }

  get sessionId(): string | null {
    return this._sessionId
  }

  get isConnected(): boolean {
    return this._status === 'authenticated' || this._status === 'connected'
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN || this.ws?.readyState === WebSocket.CONNECTING) return
    this.intentionalClose = false
    this.doConnect()
  }

  disconnect(): void {
    this.intentionalClose = true
    this.stopPing()
    if (this.retryTimer) {
      clearTimeout(this.retryTimer)
      this.retryTimer = null
    }
    this.ws?.close()
    this.ws = null
    this._sessionId = null
    this.setStatus('disconnected')
  }

  sendPrompt(text: string): void {
    if (!this.isConnected) {
      console.warn('[Daemon] Not connected, cannot send prompt')
      return
    }
    this.send({ type: 'prompt', text })
  }

  requestHealth(): void {
    this.send({ type: 'health' })
  }

  onStatus(listener: StatusListener): () => void {
    this.statusListeners.add(listener)
    return () => { this.statusListeners.delete(listener) }
  }

  onEvent<K extends DaemonEventName>(event: K, handler: EventHandler<K>): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set())
    }
    const handlers = this.eventListeners.get(event)!
    handlers.add(handler as EventHandler<never>)
    return () => { handlers.delete(handler as EventHandler<never>) }
  }

  // --- Internal ---

  private setStatus(status: ConnectionStatus) {
    if (this._status === status) return
    this._status = status
    for (const listener of this.statusListeners) {
      try { listener(status) } catch (e) { console.error('[Daemon] Status listener error:', e) }
    }
  }

  private emitEvent<K extends DaemonEventName>(event: K, payload: DaemonEventMap[K]) {
    const handlers = this.eventListeners.get(event)
    if (!handlers) return
    for (const handler of handlers) {
      try { (handler as EventHandler<K>)(payload) } catch (e) {
        console.error(`[Daemon] Event handler error for ${event}:`, e)
      }
    }
  }

  private send(msg: ClientMessage): void {
    if (this.ws?.readyState !== WebSocket.OPEN) return
    this.ws.send(JSON.stringify(msg))
  }

  private doConnect(): void {
    this.setStatus('connecting')

    try {
      this.ws = new WebSocket(this.url)

      this.ws.onopen = () => {
        this.retryCount = 0

        // If we have a token, authenticate first
        if (this.token) {
          this.send({ type: 'auth', token: this.token })
        } else {
          // No auth required, go straight to session
          this.setStatus('connected')
          this.createOrResumeSession()
        }

        this.startPing()
      }

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data as string) as ServerMessage
          this.handleMessage(msg)
        } catch {
          console.warn('[Daemon] Failed to parse message:', event.data)
        }
      }

      this.ws.onclose = () => {
        this.stopPing()
        if (!this.intentionalClose) {
          this.setStatus('disconnected')
          this.scheduleReconnect()
        }
      }

      this.ws.onerror = () => {
        this.setStatus('error')
      }
    } catch {
      this.setStatus('error')
      this.scheduleReconnect()
    }
  }

  private handleMessage(msg: ServerMessage): void {
    switch (msg.type) {
      case 'auth:ok':
        this.setStatus('authenticated')
        this.createOrResumeSession()
        break

      case 'auth:fail':
        console.error('[Daemon] Authentication failed')
        this.setStatus('error')
        this.disconnect()
        break

      case 'session:created':
        this._sessionId = msg.sessionId
        break

      case 'session:resumed':
        this._sessionId = msg.sessionId
        break

      case 'pong':
        // Keep-alive acknowledged
        break

      case 'health':
        // Could emit as a custom event if needed
        break

      case 'event':
        this.emitEvent(msg.event, msg.payload)
        break
    }
  }

  private createOrResumeSession(): void {
    if (this._sessionId) {
      this.send({ type: 'session:resume', sessionId: this._sessionId })
    } else {
      this.send({ type: 'session:create', channel: 'os' })
    }
  }

  private startPing(): void {
    this.stopPing()
    this.pingTimer = setInterval(() => {
      this.send({ type: 'ping' })
    }, PING_INTERVAL)
  }

  private stopPing(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer)
      this.pingTimer = null
    }
  }

  private scheduleReconnect(): void {
    if (this.intentionalClose) return
    if (this.retryCount >= MAX_RETRIES) {
      console.warn('[Daemon] Max retries reached, giving up')
      return
    }
    if (this.retryTimer) clearTimeout(this.retryTimer)

    const delay = Math.min(1000 * Math.pow(2, this.retryCount), 30_000)
    this.retryCount++

    this.retryTimer = setTimeout(() => {
      this.doConnect()
    }, delay)
  }
}

// --- Singleton ---

let instance: DaemonClient | null = null

export function getDaemonClient(): DaemonClient {
  if (!instance) {
    instance = new DaemonClient()
  }
  return instance
}

export { DaemonClient }
