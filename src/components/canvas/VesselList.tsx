"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { VesselWorkflow } from "./types";

type Tab = "vessels" | "tools" | "prompts";

interface VesselListProps {
  workflow: VesselWorkflow;
  selectedVesselId: string | null;
  onSelectVessel: (id: string) => void;
  onAddVessel: () => void;
}

export function VesselList({
  workflow,
  selectedVesselId,
  onSelectVessel,
  onAddVessel,
}: VesselListProps) {
  const [tab, setTab] = useState<Tab>("vessels");

  return (
    <div className="flex flex-col h-full text-sm">
      {/* Tab bar */}
      <div className="flex border-b border-white/10 shrink-0">
        {(["vessels", "tools", "prompts"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={[
              "flex-1 py-2 text-xs font-mono capitalize transition-colors",
              tab === t
                ? "text-foreground border-b-2 border-blue-500"
                : "text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {tab === "vessels" && (
          <>
            {workflow.vessels.map((vessel) => (
              <button
                key={vessel.id}
                onClick={() => onSelectVessel(vessel.id)}
                className={[
                  "w-full text-left px-3 py-2 rounded-sm font-mono text-xs transition-colors",
                  selectedVesselId === vessel.id
                    ? "bg-blue-500/20 text-blue-300"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                {vessel.name}
              </button>
            ))}
            <button
              onClick={onAddVessel}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded-sm transition-colors font-mono"
            >
              <Plus className="w-3 h-3" />
              Add vessel
            </button>
          </>
        )}

        {tab === "tools" && (
          <>
            {workflow.tools.map((tool) => (
              <div
                key={tool.id}
                className="px-3 py-2 rounded-sm font-mono text-xs text-muted-foreground"
              >
                {tool.name}
              </div>
            ))}
            {workflow.tools.length === 0 && (
              <p className="px-3 py-2 text-xs text-muted-foreground/60 font-mono">No tools yet</p>
            )}
          </>
        )}

        {tab === "prompts" && (
          <p className="px-3 py-4 text-xs text-muted-foreground/60 font-mono">
            Prompt library coming soon
          </p>
        )}
      </div>
    </div>
  );
}
