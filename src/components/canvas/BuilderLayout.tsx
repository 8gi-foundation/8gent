"use client";

import { useState, useCallback } from "react";
import {
  PanelGroup,
  Panel,
  PanelResizeHandle,
} from "react-resizable-panels";
import type { VesselWorkflow, WorkflowVessel } from "./types";
import { VesselList } from "./VesselList";
import { VesselEditor } from "./VesselEditor";

interface BuilderLayoutProps {
  workflow: VesselWorkflow;
  onWorkflowChange?: (workflow: VesselWorkflow) => void;
}

export function BuilderLayout({ workflow, onWorkflowChange }: BuilderLayoutProps) {
  const [selectedVesselId, setSelectedVesselId] = useState<string | null>(
    workflow.vessels[0]?.id ?? null
  );

  const selectedVessel: WorkflowVessel | null =
    workflow.vessels.find((v) => v.id === selectedVesselId) ?? null;

  const handleAddVessel = useCallback(() => {
    // Placeholder: does not persist yet
    console.log("[BuilderLayout] Add vessel placeholder");
  }, []);

  const handleSaveInstructions = useCallback(
    (vesselId: string, instructions: string) => {
      if (!onWorkflowChange) return;
      const updated: VesselWorkflow = {
        ...workflow,
        vessels: workflow.vessels.map((v) =>
          v.id === vesselId ? { ...v, _instructions: instructions } as WorkflowVessel : v
        ),
      };
      onWorkflowChange(updated);
    },
    [workflow, onWorkflowChange]
  );

  return (
    <div className="flex h-full w-full bg-background overflow-hidden">
      <PanelGroup direction="horizontal" className="h-full w-full">
        {/* Left: vessel/tool list (20%) */}
        <Panel defaultSize={20} minSize={12} collapsible>
          <div className="h-full border-r border-white/10">
            <VesselList
              workflow={workflow}
              selectedVesselId={selectedVesselId}
              onSelectVessel={setSelectedVesselId}
              onAddVessel={handleAddVessel}
            />
          </div>
        </Panel>

        <PanelResizeHandle className="w-px bg-white/10 hover:bg-white/20 transition-colors cursor-col-resize" />

        {/* Center: instruction editor (55%) */}
        <Panel defaultSize={55} minSize={30}>
          <div className="h-full">
            <VesselEditor
              vessel={selectedVessel}
              workflow={workflow}
              onSave={handleSaveInstructions}
            />
          </div>
        </Panel>

        <PanelResizeHandle className="w-px bg-white/10 hover:bg-white/20 transition-colors cursor-col-resize" />

        {/* Right: copilot placeholder (25%) */}
        <Panel defaultSize={25} minSize={12} collapsible>
          <div className="h-full border-l border-white/10 flex flex-col items-center justify-center gap-3 p-6">
            <div className="w-10 h-10 rounded-sm bg-muted flex items-center justify-center">
              <span className="text-lg">✦</span>
            </div>
            <p className="font-mono text-sm text-muted-foreground text-center">
              Copilot coming soon
            </p>
            <p className="font-mono text-xs text-muted-foreground/50 text-center">
              AI-assisted vessel authoring will appear here
            </p>
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}
