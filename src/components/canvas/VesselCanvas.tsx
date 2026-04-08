"use client";

import { useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { VesselNode, type VesselNodeData } from "./VesselNode";
import { ToolNode, type ToolNodeData } from "./ToolNode";
import type { VesselWorkflow } from "./types";

const NODE_TYPES = {
  vessel: VesselNode,
  tool: ToolNode,
} as const;

const VESSEL_X = 120;
const TOOL_X = 400;
const ROW_HEIGHT = 120;

interface VesselCanvasProps {
  workflow: VesselWorkflow;
}

export function VesselCanvas({ workflow }: VesselCanvasProps) {
  const { nodes, edges } = useMemo(() => {
    const flowNodes: Node[] = [];
    const flowEdges: Edge[] = [];

    workflow.vessels.forEach((vessel, i) => {
      const vesselNodeData: VesselNodeData = {
        name: vessel.name,
        model: vessel.model,
        toolCount: vessel.toolIds.length,
      };
      flowNodes.push({
        id: vessel.id,
        type: "vessel",
        position: { x: VESSEL_X, y: i * ROW_HEIGHT + 40 },
        data: vesselNodeData,
      });

      if (i > 0) {
        flowEdges.push({
          id: `edge-vessel-${i - 1}-${i}`,
          source: workflow.vessels[i - 1].id,
          target: vessel.id,
          style: { stroke: "rgba(255,255,255,0.12)" },
        });
      }
    });

    workflow.tools.forEach((tool, i) => {
      const toolNodeData: ToolNodeData = {
        name: tool.name,
        toolType: tool.toolType,
      };
      flowNodes.push({
        id: tool.id,
        type: "tool",
        position: { x: TOOL_X, y: i * ROW_HEIGHT + 40 },
        data: toolNodeData,
      });

      if (tool.vesselId) {
        flowEdges.push({
          id: `edge-tool-${tool.id}`,
          source: tool.vesselId,
          target: tool.id,
          style: { stroke: "rgba(255,255,255,0.08)", strokeDasharray: "4 2" },
        });
      }
    });

    return { nodes: flowNodes, edges: flowEdges };
  }, [workflow]);

  return (
    <div className="w-full h-full bg-background">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={NODE_TYPES}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="rgba(255,255,255,0.06)"
        />
        <Controls className="[&>button]:bg-card [&>button]:border-white/10 [&>button]:text-foreground" />
        <MiniMap
          className="!bg-card !border-white/10"
          nodeColor="rgba(255,255,255,0.15)"
          maskColor="rgba(0,0,0,0.5)"
        />
      </ReactFlow>
    </div>
  );
}
