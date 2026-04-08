import { z } from 'zod'

// Control type determines what happens when a vessel finishes
export const VesselControlType = z.enum([
  'retain',
  'relinquish_to_parent',
  'relinquish_to_start',
])
export type VesselControlType = z.infer<typeof VesselControlType>

// A tool available within a workflow
export const WorkflowTool = z.object({
  name: z.string(),
  type: z.enum(['mcp', 'webhook', 'mock', 'builtin']),
  description: z.string(),
  mockInstructions: z.string().optional(),
})
export type WorkflowTool = z.infer<typeof WorkflowTool>

// A vessel (agent) within a workflow
export const WorkflowVessel = z.object({
  name: z.string(),
  instructions: z.string(),
  model: z.string(),
  controlType: VesselControlType,
  tools: z.array(z.string()),
  outputVisibility: z.enum(['user_facing', 'internal']),
})
export type WorkflowVessel = z.infer<typeof WorkflowVessel>

// Workflow metadata
const WorkflowMetadata = z.object({
  name: z.string(),
  description: z.string(),
  createdAt: z.string(),
})

// Core workflow definition
export const VesselWorkflow = z.object({
  vessels: z.array(WorkflowVessel),
  tools: z.array(WorkflowTool),
  startVessel: z.string(),
  metadata: WorkflowMetadata,
})
export type VesselWorkflow = z.infer<typeof VesselWorkflow>

// Lifecycle state of a workflow document
export const WorkflowState = z.enum(['draft', 'live'])
export type WorkflowState = z.infer<typeof WorkflowState>

// Persisted workflow document with draft/live versioning
export const VesselWorkflowDocument = VesselWorkflow.extend({
  id: z.string(),
  state: WorkflowState,
  draftWorkflow: VesselWorkflow.optional(),
  liveWorkflow: VesselWorkflow.optional(),
})
export type VesselWorkflowDocument = z.infer<typeof VesselWorkflowDocument>
