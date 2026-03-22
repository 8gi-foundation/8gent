'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type {
  ConnectionStatus,
  ClientMessage,
  ServerMessage,
  DaemonEvent,
  DaemonEventName,
  DaemonEventMap,
} from '@/lib/daemon/types';

// ---------------------------------------------------------------------------
// useDaemon — connects to the 8gent daemon via WebSocket when
// NEXT_PUBLIC_DAEMON_URL is set. Falls back gracefully when not configured.
// ---------------------------------------------------------------------------

const DAEMON_URL = process.env.NEXT_PUBLIC_DAEMON_URL ?? '';

export interface UseDaemonReturn {
  status: ConnectionStatus;
  isConnected: boolean;
  sessionId: string | null;
  sendPrompt: (text: string) => void;
  /** Subscribe to a daemon event. Returns an unsubscribe function. */
  on: <E extends DaemonEventName>(event: E, cb: (payload: DaemonEventMap[E]) => void) => () => void;
}

export function useDaemon(): UseDaemonReturn {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const listenersRef = useRef<Map<string, Set<(payload: unknown) => void>>>(new Map());
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // -- helpers ---------------------------------------------------------------

  const send = useCallback((msg: ClientMessage) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg));
    }
  }, []);

  const emit = useCallback((event: string, payload: unknown) => {
    const cbs = listenersRef.current.get(event);
    if (cbs) {
      cbs.forEach((cb) => cb(payload));
    }
  }, []);

  // -- connect / reconnect ---------------------------------------------------

  const connect = useCallback(() => {
    if (!DAEMON_URL) return;

    // Clean up any previous socket
    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.close();
    }

    setStatus('connecting');
    const ws = new WebSocket(DAEMON_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus('connected');
      // Create a session for the OS channel
      send({ type: 'session:create', channel: 'os' });
    };

    ws.onmessage = (evt) => {
      let msg: ServerMessage;
      try {
        msg = JSON.parse(evt.data) as ServerMessage;
      } catch {
        return;
      }

      switch (msg.type) {
        case 'auth:ok':
          setStatus('authenticated');
          break;
        case 'session:created':
        case 'session:resumed':
          setSessionId(msg.sessionId);
          setStatus('authenticated');
          break;
        case 'event':
          emit((msg as DaemonEvent).event, (msg as DaemonEvent).payload);
          break;
        case 'pong':
          // heartbeat ack — no-op
          break;
        default:
          break;
      }
    };

    ws.onerror = () => {
      setStatus('error');
    };

    ws.onclose = () => {
      setStatus('disconnected');
      wsRef.current = null;
      // Auto-reconnect after 3s
      reconnectTimer.current = setTimeout(() => connect(), 3000);
    };
  }, [send, emit]);

  // -- lifecycle -------------------------------------------------------------

  useEffect(() => {
    if (!DAEMON_URL) return;
    connect();

    // Heartbeat every 25s
    const heartbeat = setInterval(() => {
      send({ type: 'ping' });
    }, 25_000);

    return () => {
      clearInterval(heartbeat);
      clearTimeout(reconnectTimer.current);
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, [connect, send]);

  // -- public API ------------------------------------------------------------

  const sendPrompt = useCallback((text: string) => {
    send({ type: 'prompt', text });
  }, [send]);

  const on = useCallback(<E extends DaemonEventName>(
    event: E,
    cb: (payload: DaemonEventMap[E]) => void,
  ): (() => void) => {
    if (!listenersRef.current.has(event)) {
      listenersRef.current.set(event, new Set());
    }
    const set = listenersRef.current.get(event)!;
    const wrapped = cb as (payload: unknown) => void;
    set.add(wrapped);
    return () => {
      set.delete(wrapped);
    };
  }, []);

  return {
    status,
    isConnected: status === 'authenticated' || status === 'connected',
    sessionId,
    sendPrompt,
    on,
  };
}
