/**
 * VesselWorkflow types — shared schema for vessel builder and copilot.
 *
 * A VesselWorkflow describes an agent pipeline: a graph of vessels (agents),
 * the tools they have access to, which vessel runs first, and top-level metadata.
 */

// ============================================================================
// VESSEL TYPES
// ============================================================================

export type VesselRole = 'orchestrator' | 'worker' | 'critic' | 'tool_executor' | 'handoff';

export interface VesselDefinition {
  /** Unique ID within this workflow */
  id: string;
  /** Human-readable name */
  name: string;
  /** Role this vessel plays in the pipeline */
  role: VesselRole;
  /** System prompt / instructions for this vessel */
  systemPrompt: string;
  /** IDs of tools this vessel can call (references WorkflowTool.id) */
  tools: string[];
  /** IDs of vessels this vessel can hand off to */
  handoffTo?: string[];
  /** Optional model override (defaults to workflow-level model) */
  model?: string;
}

export interface WorkflowTool {
  id: string;
  name: string;
  description: string;
  /** JSON Schema for tool input parameters */
  inputSchema: Record<string, unknown>;
}

export interface WorkflowMetadata {
  name: string;
  description?: string;
  version: string;
  createdAt: string;
  /** Default model for all vessels unless overridden */
  defaultModel?: string;
  tags?: string[];
}

export interface VesselWorkflow {
  /** ID of the first vessel to run */
  startVessel: string;
  vessels: VesselDefinition[];
  tools: WorkflowTool[];
  metadata: WorkflowMetadata;
}
