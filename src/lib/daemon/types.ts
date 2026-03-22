// Eight daemon WebSocket protocol types

// --- Connection status ---

export type ConnectionStatus = 'connecting' | 'connected' | 'authenticated' | 'disconnected' | 'error'

// --- Client → Server messages ---

export interface AuthMessage {
  type: 'auth'
  token: string
}

export interface SessionCreateMessage {
  type: 'session:create'
  channel: 'os'
}

export interface SessionResumeMessage {
  type: 'session:resume'
  sessionId: string
}

export interface PromptMessage {
  type: 'prompt'
  text: string
}

export interface PingMessage {
  type: 'ping'
}

export interface HealthMessage {
  type: 'health'
}

export type ClientMessage =
  | AuthMessage
  | SessionCreateMessage
  | SessionResumeMessage
  | PromptMessage
  | PingMessage
  | HealthMessage

// --- Server → Client messages ---

export interface AuthOkMessage {
  type: 'auth:ok'
}

export interface AuthFailMessage {
  type: 'auth:fail'
}

export interface SessionCreatedMessage {
  type: 'session:created'
  sessionId: string
}

export interface SessionResumedMessage {
  type: 'session:resumed'
  sessionId: string
}

export interface PongMessage {
  type: 'pong'
}

export interface HealthResponseMessage {
  type: 'health'
  data: {
    status: string
    sessions: number
    uptime: number
  }
}

// --- Server event messages ---

export interface AgentThinkingEvent {
  type: 'event'
  event: 'agent:thinking'
  payload: { sessionId: string }
}

export interface ToolStartEvent {
  type: 'event'
  event: 'tool:start'
  payload: { sessionId: string; tool: string; input: unknown }
}

export interface ToolResultEvent {
  type: 'event'
  event: 'tool:result'
  payload: { sessionId: string; tool: string; output: string; durationMs: number }
}

export interface AgentStreamEvent {
  type: 'event'
  event: 'agent:stream'
  payload: { sessionId: string; chunk: string; final?: boolean }
}

export interface AgentErrorEvent {
  type: 'event'
  event: 'agent:error'
  payload: { sessionId: string; error: string }
}

export interface SessionEndEvent {
  type: 'event'
  event: 'session:end'
  payload: { sessionId: string; reason: string }
}

export type DaemonEvent =
  | AgentThinkingEvent
  | ToolStartEvent
  | ToolResultEvent
  | AgentStreamEvent
  | AgentErrorEvent
  | SessionEndEvent

export type ServerMessage =
  | AuthOkMessage
  | AuthFailMessage
  | SessionCreatedMessage
  | SessionResumedMessage
  | PongMessage
  | HealthResponseMessage
  | DaemonEvent

// --- Event callback map (for subscribers) ---

export type DaemonEventMap = {
  'agent:thinking': AgentThinkingEvent['payload']
  'tool:start': ToolStartEvent['payload']
  'tool:result': ToolResultEvent['payload']
  'agent:stream': AgentStreamEvent['payload']
  'agent:error': AgentErrorEvent['payload']
  'session:end': SessionEndEvent['payload']
}

export type DaemonEventName = keyof DaemonEventMap
