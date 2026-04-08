import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { VESSEL_SCAFFOLD_SYSTEM_PROMPT } from '@/lib/prompts/vessel-scaffold';
import type { VesselWorkflow } from '@/lib/vessel/types';

// ============================================================================
// REQUEST SCHEMA
// ============================================================================

const ScaffoldRequestSchema = z.object({
  description: z.string().min(1).max(2000),
  existingWorkflow: z.unknown().optional(),
});

// ============================================================================
// RESPONSE SCHEMA (mirrors VesselWorkflow type)
// ============================================================================

const WorkflowToolSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  inputSchema: z.record(z.unknown()),
});

const VesselDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.enum(['orchestrator', 'worker', 'critic', 'tool_executor', 'handoff']),
  systemPrompt: z.string(),
  tools: z.array(z.string()),
  handoffTo: z.array(z.string()).optional(),
  model: z.string().optional(),
});

const WorkflowMetadataSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  version: z.string(),
  createdAt: z.string(),
  defaultModel: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

const VesselWorkflowSchema = z.object({
  startVessel: z.string(),
  vessels: z.array(VesselDefinitionSchema).min(1),
  tools: z.array(WorkflowToolSchema),
  metadata: WorkflowMetadataSchema,
});

// ============================================================================
// HANDLER
// ============================================================================

export async function POST(request: Request): Promise<NextResponse> {
  // Parse request body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = ScaffoldRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { description, existingWorkflow } = parsed.data;

  // Build user message
  const userMessage = existingWorkflow
    ? `Description: ${description}\n\nExisting workflow (modify or extend as needed):\n${JSON.stringify(existingWorkflow, null, 2)}`
    : `Description: ${description}`;

  // Call Anthropic SDK
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 });
  }

  const client = new Anthropic({ apiKey });

  let rawContent: string;
  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 2048,
      system: VESSEL_SCAFFOLD_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    });

    const firstBlock = message.content[0];
    if (firstBlock.type !== 'text') {
      return NextResponse.json({ error: 'Unexpected response format from LLM' }, { status: 500 });
    }
    rawContent = firstBlock.text;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'LLM call failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }

  // Parse and validate JSON from LLM
  let workflowJson: unknown;
  try {
    // Strip any accidental markdown code fences the model might add
    const stripped = rawContent.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    workflowJson = JSON.parse(stripped);
  } catch {
    return NextResponse.json(
      { error: 'LLM returned non-JSON response', raw: rawContent.slice(0, 500) },
      { status: 400 }
    );
  }

  const workflowParsed = VesselWorkflowSchema.safeParse(workflowJson);
  if (!workflowParsed.success) {
    return NextResponse.json(
      {
        error: 'LLM response does not match VesselWorkflow schema',
        details: workflowParsed.error.flatten(),
        raw: rawContent.slice(0, 500),
      },
      { status: 400 }
    );
  }

  const workflow: VesselWorkflow = workflowParsed.data;

  // Generate a short explanation
  const explanation = `Generated workflow "${workflow.metadata.name}" with ${workflow.vessels.length} vessel${workflow.vessels.length === 1 ? '' : 's'} and ${workflow.tools.length} tool${workflow.tools.length === 1 ? '' : 's'}. Entry point: ${workflow.startVessel}.`;

  return NextResponse.json({ workflow, explanation });
}
