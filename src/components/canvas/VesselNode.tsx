"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";

export type VesselNodeData = {
  name: string;
  model: string;
  toolCount: number;
};

function VesselNodeComponent({ data, selected }: NodeProps & { data: VesselNodeData }) {
  return (
    <div
      className={[
        "bg-card border px-4 py-3 rounded-sm min-w-[180px] shadow-md",
        selected ? "border-blue-500/60" : "border-white/10",
      ].join(" ")}
    >
      <Handle type="target" position={Position.Top} className="!bg-white/20 !border-white/20" />

      <div className="space-y-2">
        <p className="font-mono font-bold text-sm text-foreground leading-tight truncate">
          {data.name}
        </p>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-mono truncate max-w-[100px]">
            {data.model}
          </span>
          {data.toolCount > 0 && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono shrink-0">
              {data.toolCount} tools
            </span>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-white/20 !border-white/20" />
    </div>
  );
}

export const VesselNode = memo(VesselNodeComponent);
