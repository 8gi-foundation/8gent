"use client";

import { useState } from "react";
import { BuilderLayout } from "@/components/canvas/BuilderLayout";
import type { VesselWorkflow } from "@/components/canvas/types";

const DEMO_WORKFLOW: VesselWorkflow = {
  vessels: [
    {
      id: "vessel-1",
      name: "research-agent",
      model: "claude-3-5-sonnet",
      toolIds: ["tool-1", "tool-2"],
    },
    {
      id: "vessel-2",
      name: "writer-agent",
      model: "gpt-4o",
      toolIds: ["tool-3"],
    },
  ],
  tools: [
    { id: "tool-1", name: "web-search", toolType: "mcp", vesselId: "vessel-1" },
    { id: "tool-2", name: "file-reader", toolType: "mcp", vesselId: "vessel-1" },
    { id: "tool-3", name: "slack-notify", toolType: "webhook", vesselId: "vessel-2" },
  ],
};

export default function BuilderPage() {
  const [workflow, setWorkflow] = useState<VesselWorkflow>(DEMO_WORKFLOW);

  return (
    <div className="h-screen w-screen bg-background overflow-hidden flex flex-col">
      <header className="shrink-0 border-b border-white/10 px-4 h-12 flex items-center gap-3">
        <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
          8gent
        </span>
        <span className="text-white/10">/</span>
        <span className="font-mono text-sm text-foreground">Vessel Builder</span>
      </header>
      <div className="flex-1 overflow-hidden">
        <BuilderLayout workflow={workflow} onWorkflowChange={setWorkflow} />
      </div>
    </div>
  );
}
