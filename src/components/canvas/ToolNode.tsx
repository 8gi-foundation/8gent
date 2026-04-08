"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";

export type ToolType = "mcp" | "webhook" | "mock";

export type ToolNodeData = {
  name: string;
  toolType: ToolType;
};

const TYPE_BADGE: Record<ToolType, string> = {
  mcp: "bg-blue-500/20 text-blue-400",
  webhook: "bg-amber-500/20 text-amber-400",
  mock: "bg-purple-500/20 text-purple-400",
};

function ToolNodeComponent({ data }: NodeProps & { data: ToolNodeData }) {
  return (
    <div className="bg-muted/40 border border-dashed border-white/10 px-3 py-2 rounded-sm min-w-[140px] shadow-sm">
      <Handle type="target" position={Position.Top} className="!bg-white/20 !border-white/20" />

      <div className="space-y-1.5">
        <p className="font-mono text-xs text-foreground/80 truncate">{data.name}</p>
        <span
          className={[
            "text-[10px] px-1.5 py-0.5 rounded font-mono uppercase tracking-wide",
            TYPE_BADGE[data.toolType],
          ].join(" ")}
        >
          {data.toolType}
        </span>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-white/20 !border-white/20" />
    </div>
  );
}

export const ToolNode = memo(ToolNodeComponent);
