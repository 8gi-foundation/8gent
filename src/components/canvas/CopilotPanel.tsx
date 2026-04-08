'use client';

import { useState, useRef, useEffect } from 'react';
import type { VesselWorkflow, VesselDefinition } from '@/lib/vessel/types';

// ============================================================================
// TYPES
// ============================================================================

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  workflow?: VesselWorkflow;
  explanation?: string;
}

interface PendingDiff {
  workflow: VesselWorkflow;
  explanation: string;
  added: string[];
  modified: string[];
}

interface CopilotPanelProps {
  workflow: VesselWorkflow | null;
  onApply: (w: VesselWorkflow) => void;
}

// ============================================================================
// HELPERS
// ============================================================================

function computeDiff(
  current: VesselWorkflow | null,
  next: VesselWorkflow
): { added: string[]; modified: string[] } {
  if (!current) {
    return {
      added: next.vessels.map((v) => v.name),
      modified: [],
    };
  }

  const currentIds = new Set(current.vessels.map((v: VesselDefinition) => v.id));
  const added: string[] = [];
  const modified: string[] = [];

  for (const vessel of next.vessels) {
    if (!currentIds.has(vessel.id)) {
      added.push(vessel.name);
    } else {
      const existing = current.vessels.find((v: VesselDefinition) => v.id === vessel.id);
      if (existing && JSON.stringify(existing) !== JSON.stringify(vessel)) {
        modified.push(vessel.name);
      }
    }
  }

  return { added, modified };
}

// ============================================================================
// COMPONENT
// ============================================================================

export function CopilotPanel({ workflow, onApply }: CopilotPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingDiff, setPendingDiff] = useState<PendingDiff | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, pendingDiff]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    setInput('');
    setError(null);
    setPendingDiff(null);

    const userMsg: ChatMessage = { role: 'user', content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch('/api/canvas/scaffold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: trimmed,
          existingWorkflow: workflow ?? undefined,
        }),
      });

      const data: unknown = await res.json();

      if (!res.ok) {
        const errData = data as { error?: string };
        throw new Error(errData.error ?? `Request failed: ${res.status}`);
      }

      const successData = data as { workflow: VesselWorkflow; explanation: string };
      const { workflow: newWorkflow, explanation } = successData;

      const { added, modified } = computeDiff(workflow, newWorkflow);
      setPendingDiff({ workflow: newWorkflow, explanation, added, modified });

      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: explanation,
        workflow: newWorkflow,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setError(msg);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Error: ${msg}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleApply() {
    if (!pendingDiff) return;
    onApply(pendingDiff.workflow);
    setPendingDiff(null);
  }

  function handleReject() {
    setPendingDiff(null);
  }

  return (
    <div className="flex flex-col h-full bg-zinc-900 text-zinc-100 border-l border-zinc-800">
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-800 shrink-0">
        <h2 className="text-sm font-semibold text-zinc-200">Vessel Copilot</h2>
        <p className="text-xs text-zinc-500 mt-0.5">Describe a workflow and let the copilot scaffold it</p>
      </div>

      {/* Chat history */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
        {messages.length === 0 && (
          <p className="text-xs text-zinc-500 italic">
            Describe what you want to build and the copilot will generate a vessel workflow.
          </p>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-800 text-zinc-200'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-400">
              <span className="animate-pulse">Scaffolding workflow...</span>
            </div>
          </div>
        )}

        {/* Diff preview */}
        {pendingDiff && (
          <div className="border border-zinc-700 rounded-lg p-3 bg-zinc-800 space-y-3">
            <p className="text-xs font-semibold text-zinc-300">Proposed changes</p>

            {pendingDiff.added.length > 0 && (
              <div>
                <p className="text-xs text-zinc-500 mb-1">New vessels</p>
                <ul className="space-y-0.5">
                  {pendingDiff.added.map((name) => (
                    <li key={name} className="text-xs text-green-400 flex items-center gap-1">
                      <span>+</span>
                      <span>{name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {pendingDiff.modified.length > 0 && (
              <div>
                <p className="text-xs text-zinc-500 mb-1">Modified vessels</p>
                <ul className="space-y-0.5">
                  {pendingDiff.modified.map((name) => (
                    <li key={name} className="text-xs text-amber-400 flex items-center gap-1">
                      <span>~</span>
                      <span>{name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {pendingDiff.added.length === 0 && pendingDiff.modified.length === 0 && (
              <p className="text-xs text-zinc-500">No structural changes detected.</p>
            )}

            <div className="flex gap-2 pt-1">
              <button
                onClick={handleApply}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium py-1.5 px-3 rounded transition-colors"
              >
                Apply
              </button>
              <button
                onClick={handleReject}
                className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 text-xs font-medium py-1.5 px-3 rounded transition-colors"
              >
                Reject
              </button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error banner */}
      {error && (
        <div className="mx-4 mb-2 px-3 py-2 bg-red-950 border border-red-800 rounded text-xs text-red-400 shrink-0">
          {error}
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="px-4 py-3 border-t border-zinc-800 shrink-0"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe a workflow..."
            disabled={loading}
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors"
          >
            {loading ? '...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
}
