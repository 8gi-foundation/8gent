'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { getDaemonClient } from './client'
import type { ConnectionStatus, DaemonEventMap, DaemonEventName } from './types'

export function useDaemon() {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [events, setEvents] = useState<Array<{ event: DaemonEventName; payload: DaemonEventMap[DaemonEventName]; ts: number }>>([])
  const clientRef = useRef(getDaemonClient())

  useEffect(() => {
    const client = clientRef.current

    // Connect on mount
    client.connect()

    // Sync initial state
    setStatus(client.status)
    setSessionId(client.sessionId)

    // Subscribe to status changes
    const unsubStatus = client.onStatus((s) => {
      setStatus(s)
      setSessionId(client.sessionId)
    })

    // Subscribe to all daemon events
    const eventNames: DaemonEventName[] = [
      'agent:thinking',
      'tool:start',
      'tool:result',
      'agent:stream',
      'agent:error',
      'session:end',
    ]

    const unsubs = eventNames.map((name) =>
      client.onEvent(name, (payload) => {
        setEvents((prev) => {
          const next = [...prev, { event: name, payload, ts: Date.now() }]
          // Keep last 200 events to avoid unbounded growth
          return next.length > 200 ? next.slice(-200) : next
        })
        // Update sessionId from events if present
        if ('sessionId' in (payload as Record<string, unknown>)) {
          setSessionId(client.sessionId)
        }
      }),
    )

    return () => {
      unsubStatus()
      unsubs.forEach((u) => u())
    }
  }, [])

  const sendPrompt = useCallback((text: string) => {
    clientRef.current.sendPrompt(text)
  }, [])

  const clearEvents = useCallback(() => {
    setEvents([])
  }, [])

  return {
    status,
    sessionId,
    isConnected: status === 'authenticated' || status === 'connected',
    events,
    sendPrompt,
    clearEvents,
  }
}
