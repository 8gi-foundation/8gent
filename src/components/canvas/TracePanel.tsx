'use client';

import { useState } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface TraceEvent {
  id: string;
  type: 'vessel' | 'tool_call' | 'handoff' | 'error';
  vesselName: string;
  content: string;
  timestamp: string;
  durationMs?: number;
}

interface TracePanelProps {
  events: TraceEvent[];
}

// ============================================================================
// MOCK DATA
// ============================================================================

export const MOCK_TRACE_EVENTS: TraceEvent[] = [
  {
    id: 'trace-001',
    type: 'vessel',
    vesselName: 'Orchestrator',
    content: 'Received task: research and summarize AI regulation landscape. Routing to Research Worker.',
    timestamp: '2026-04-08T10:00:00.000Z',
    durationMs: 312,
  },
  {
    id: 'trace-002',
    type: 'tool_call',
    vesselName: 'Research Worker',
    content: JSON.stringify({
      tool: 'web_search',
      input: { query: 'AI regulation 2026 EU US legislation' },
      output: { results: ['EU AI Act enforcement begins...', 'US NIST AI framework v2...'] },
    }, null, 2),
    timestamp: '2026-04-08T10:00:00.312Z',
    durationMs: 1204,
  },
  {
    id: 'trace-003',
    type: 'vessel',
    vesselName: 'Research Worker',
    content: 'Completed research phase. Collected 8 sources. Passing to Summarizer vessel.',
    timestamp: '2026-04-08T10:00:01.516Z',
    durationMs: 88,
  },
  {
    id: 'trace-004',
    type: 'handoff',
    vesselName: 'Research Worker',
    content: JSON.stringify({
      from: 'Research Worker',
      to: 'Summarizer',
      context: 'Passing 8 research results for summarization.',
    }, null, 2),
    timestamp: '2026-04-08T10:00:01.604Z',
    durationMs: 12,
  },
  {
    id: 'trace-005',
    type: 'tool_call',
    vesselName: 'Summarizer',
    content: JSON.stringify({
      tool: 'format_output',
      input: { format: 'markdown', sections: ['Overview', 'Key Regulations', 'Timeline'] },
      output: { formatted: '# AI Regulation Summary\n...' },
    }, null, 2),
    timestamp: '2026-04-08T10:00:01.616Z',
    durationMs: 920,
  },
  {
    id: 'trace-006',
    type: 'vessel',
    vesselName: 'Summarizer',
    content: 'Summary complete. 3 sections generated. Total pipeline duration: 2.5s.',
    timestamp: '2026-04-08T10:00:02.536Z',
    durationMs: 45,
  },
];

// ============================================================================
// HELPERS
// ============================================================================

const TYPE_CONFIG: Record<
  TraceEvent['type'],
  { label: string; color: string; bg: string; border: string }
> = {
  vessel: {
    label: 'VESSEL',
    color: 'text-blue-400',
    bg: 'bg-blue-950',
    border: 'border-blue-800',
  },
  tool_call: {
    label: 'TOOL',
    color: 'text-amber-400',
    bg: 'bg-amber-950',
    border: 'border-amber-800',
  },
  handoff: {
    label: 'HANDOFF',
    color: 'text-purple-400',
    bg: 'bg-purple-950',
    border: 'border-purple-800',
  },
  error: {
    label: 'ERROR',
    color: 'text-red-400',
    bg: 'bg-red-950',
    border: 'border-red-800',
  },
};

function formatTimestamp(ts: string): string {
  try {
    return new Date(ts).toLocaleTimeString('en-IE', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    });
  } catch {
    return ts;
  }
}

// ============================================================================
// TRACE EVENT ROW
// ============================================================================

function TraceEventRow({ event }: { event: TraceEvent }) {
  const [expanded, setExpanded] = useState(false);
  const config = TYPE_CONFIG[event.type];

  return (
    <div
      className={`border rounded-lg overflow-hidden ${config.border} ${config.bg} transition-all`}
    >
      {/* Header row (always visible, clickable) */}
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full flex items-center gap-3 px-3 py-2 text-left hover:opacity-90 transition-opacity"
      >
        {/* Type badge */}
        <span
          className={`text-[10px] font-bold uppercase tracking-widest ${config.color} w-16 shrink-0`}
        >
          {config.label}
        </span>

        {/* Vessel name */}
        <span className="text-xs font-medium text-zinc-200 truncate flex-1">
          {event.vesselName}
        </span>

        {/* Duration */}
        {event.durationMs !== undefined && (
          <span className="text-[10px] text-zinc-500 shrink-0">
            {event.durationMs}ms
          </span>
        )}

        {/* Timestamp */}
        <span className="text-[10px] text-zinc-600 shrink-0">
          {formatTimestamp(event.timestamp)}
        </span>

        {/* Expand chevron */}
        <span className={`text-zinc-500 text-xs shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}>
          v
        </span>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-3 pb-3 border-t border-zinc-800">
          <pre className="mt-2 text-xs text-zinc-300 whitespace-pre-wrap break-words font-mono leading-relaxed">
            {event.content}
          </pre>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// TRACE PANEL
// ============================================================================

export function TracePanel({ events }: TracePanelProps) {
  return (
    <div className="flex flex-col h-full bg-zinc-900 text-zinc-100 border-l border-zinc-800">
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-800 shrink-0 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-zinc-200">Run Trace</h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            {events.length} event{events.length !== 1 ? 's' : ''}
          </p>
        </div>
        {events.length > 0 && (
          <div className="flex gap-2 text-[10px] text-zinc-500">
            <span className="text-blue-400">vessel</span>
            <span className="text-amber-400">tool</span>
            <span className="text-purple-400">handoff</span>
            <span className="text-red-400">error</span>
          </div>
        )}
      </div>

      {/* Event list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 min-h-0">
        {events.length === 0 ? (
          <p className="text-xs text-zinc-500 italic">
            No trace events yet. Run a workflow to see the execution trace.
          </p>
        ) : (
          events.map((event) => (
            <TraceEventRow key={event.id} event={event} />
          ))
        )}
      </div>
    </div>
  );
}
