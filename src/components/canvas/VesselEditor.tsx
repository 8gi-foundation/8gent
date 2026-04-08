"use client";

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import type { VesselWorkflow, WorkflowVessel } from "./types";

interface MentionOption {
  id: string;
  label: string;
  type: "vessel" | "tool";
}

interface VesselEditorProps {
  vessel: WorkflowVessel | null;
  workflow: VesselWorkflow;
  onSave: (vesselId: string, instructions: string) => void;
}

export function VesselEditor({ vessel, workflow, onSave }: VesselEditorProps) {
  const [instructions, setInstructions] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionIndex, setMentionIndex] = useState(0);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Reset on vessel change
  useEffect(() => {
    setInstructions(vessel?.name ? `# ${vessel.name} instructions\n` : "");
    setIsDirty(false);
    setMentionQuery(null);
  }, [vessel?.id, vessel?.name]);

  const mentionOptions: MentionOption[] = [
    ...workflow.vessels.map((v) => ({ id: v.id, label: v.name, type: "vessel" as const })),
    ...workflow.tools.map((t) => ({ id: t.id, label: t.name, type: "tool" as const })),
  ];

  const filteredOptions = mentionQuery !== null
    ? mentionOptions.filter((o) =>
        o.label.toLowerCase().includes(mentionQuery.toLowerCase())
      )
    : [];

  const handleChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInstructions(val);
    setIsDirty(true);

    // Detect @ mention
    const cursor = e.target.selectionStart;
    const textBefore = val.slice(0, cursor);
    const atMatch = textBefore.match(/@(\w*)$/);
    if (atMatch) {
      setMentionQuery(atMatch[1]);
      setMentionIndex(0);
    } else {
      setMentionQuery(null);
    }

    // Debounced save
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      if (vessel) onSave(vessel.id, val);
    }, 800);
  }, [vessel, onSave]);

  const insertMention = useCallback((option: MentionOption) => {
    if (!textareaRef.current) return;
    const el = textareaRef.current;
    const cursor = el.selectionStart;
    const textBefore = instructions.slice(0, cursor);
    const textAfter = instructions.slice(cursor);
    const trimmed = textBefore.replace(/@\w*$/, "");
    const newVal = `${trimmed}@${option.label} ${textAfter}`;
    setInstructions(newVal);
    setMentionQuery(null);
    setIsDirty(true);
    setTimeout(() => {
      el.focus();
      const pos = trimmed.length + option.label.length + 2;
      el.setSelectionRange(pos, pos);
    }, 0);
  }, [instructions]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (mentionQuery === null || filteredOptions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setMentionIndex((i) => Math.min(i + 1, filteredOptions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setMentionIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      insertMention(filteredOptions[mentionIndex]);
    } else if (e.key === "Escape") {
      setMentionQuery(null);
    }
  }, [mentionQuery, filteredOptions, mentionIndex, insertMention]);

  const handleSaveNow = useCallback(() => {
    if (vessel && isDirty) {
      onSave(vessel.id, instructions);
      setIsDirty(false);
    }
  }, [vessel, isDirty, instructions, onSave]);

  if (!vessel) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-muted-foreground font-mono">
        Select a vessel to edit
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
        <h2 className="font-mono font-bold text-sm text-foreground truncate">{vessel.name}</h2>
        <button
          onClick={handleSaveNow}
          disabled={!isDirty}
          className="text-xs font-mono px-3 py-1 rounded-sm bg-blue-600 text-white disabled:opacity-30 hover:bg-blue-500 transition-colors"
        >
          Save
        </button>
      </div>

      {/* Editor area */}
      <div className="relative flex-1">
        <textarea
          ref={textareaRef}
          value={instructions}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Write vessel instructions... Type @ to mention a vessel or tool"
          className="w-full h-full resize-none bg-transparent text-sm text-foreground font-mono p-4 focus:outline-none placeholder:text-muted-foreground/40"
          spellCheck={false}
        />

        {/* @mention dropdown */}
        {mentionQuery !== null && filteredOptions.length > 0 && (
          <div className="absolute left-4 bottom-8 z-10 w-56 bg-card border border-white/10 rounded-sm shadow-lg overflow-hidden">
            {filteredOptions.slice(0, 8).map((opt, i) => (
              <button
                key={opt.id}
                onMouseDown={(e) => {
                  e.preventDefault();
                  insertMention(opt);
                }}
                className={[
                  "w-full flex items-center justify-between px-3 py-2 text-xs font-mono transition-colors",
                  i === mentionIndex
                    ? "bg-blue-500/20 text-blue-300"
                    : "hover:bg-muted text-muted-foreground",
                ].join(" ")}
              >
                <span>{opt.label}</span>
                <span className="text-muted-foreground/60 text-[10px] uppercase">{opt.type}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
