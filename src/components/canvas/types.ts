export type ToolType = "mcp" | "webhook" | "mock";

export interface WorkflowTool {
  id: string;
  name: string;
  toolType: ToolType;
  /** Optional: which vessel id this tool belongs to */
  vesselId?: string;
}

export interface WorkflowVessel {
  id: string;
  name: string;
  model: string;
  toolIds: string[];
  /** Editable instructions for this vessel (local state only until persistence is wired) */
  _instructions?: string;
}

export interface VesselWorkflow {
  vessels: WorkflowVessel[];
  tools: WorkflowTool[];
}
