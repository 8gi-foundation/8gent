/**
 * 8gent Enterprise Toolshed - Audit Schemas
 *
 * IMMUTABLE audit log schemas for compliance-grade tracking.
 * SHA-256 chain integrity for tamper detection.
 */

import { z } from "zod"
import type { InvocationContext } from "./context"
import type { EnterpriseTool } from "./tool"

// ============================================
// AUDIT ACTION TYPES
// ============================================

export const AUDIT_ACTIONS = [
  // Tool lifecycle
  "tool.registered",
  "tool.updated",
  "tool.deprecated",
  "tool.deleted",

  // Tool invocation
  "tool.invoked",
  "tool.completed",
  "tool.failed",
  "tool.timeout",

  // Access control
  "access.granted",
  "access.denied",
  "access.revoked",

  // Rate limiting
  "rate_limit.exceeded",
  "rate_limit.warning",

  // Admin
  "admin.config_changed",
  "admin.settings_changed",
] as const

export type AuditAction = (typeof AUDIT_ACTIONS)[number]

// ============================================
// AUDIT LOG ENTRY (IMMUTABLE)
// ============================================

/**
 * Immutable audit log entry.
 * Once created, these records CANNOT be modified or deleted.
 */
export const AuditLogEntrySchema = z.object({
  // Identity
  id: z.string().uuid(),
  user_id: z.string().uuid(),

  // Temporal
  timestamp: z.number().int(),
  sequence_number: z.number().int(), // For ordering within user

  // Actor
  actor_type: z.enum(["user", "agent", "system", "service", "scheduled"]),
  actor_id: z.string().uuid(),
  actor_name: z.string(),

  // Action
  action: z.enum(AUDIT_ACTIONS),
  action_category: z.enum([
    "tool_lifecycle",
    "tool_invocation",
    "access_control",
    "rate_limiting",
    "admin",
  ]),

  // Target
  tool_id: z.string().uuid().optional(),
  tool_name: z.string().optional(),
  tool_version: z.string().optional(),

  // Context
  session_id: z.string().uuid(),
  thread_id: z.string().uuid().optional(),
  correlation_id: z.string().uuid().optional(),

  // Data (hashed for security, raw stored separately if needed)
  input_hash: z.string().optional(), // SHA-256 of input
  output_hash: z.string().optional(), // SHA-256 of output
  input_size_bytes: z.number().int().optional(),
  output_size_bytes: z.number().int().optional(),

  // Result
  success: z.boolean(),
  error_code: z.string().optional(),
  error_message: z.string().max(1000).optional(),

  // Performance
  duration_ms: z.number().int().optional(),

  // Request metadata
  source: z.enum(["api", "agent", "workflow", "manual", "scheduled", "webhook"]),
  ip_address: z.string().ip().optional(),
  user_agent: z.string().max(500).optional(),

  // Integrity (for tamper detection)
  checksum: z.string(), // SHA-256 hash of all fields above
  previous_checksum: z.string().optional(), // Chain to previous entry
})

export type AuditLogEntry = z.infer<typeof AuditLogEntrySchema>

// ============================================
// AUDIT LOG QUERY
// ============================================

/**
 * Schema for querying audit logs.
 */
export const AuditLogQuerySchema = z.object({
  // Time range
  start_time: z.number().int().optional(),
  end_time: z.number().int().optional(),

  // Actor filters
  actor_type: z.enum(["user", "agent", "system", "service", "scheduled"]).optional(),
  actor_id: z.string().uuid().optional(),

  // Action filters
  action: z.enum(AUDIT_ACTIONS).optional(),
  actions: z.array(z.enum(AUDIT_ACTIONS)).optional(),
  action_category: z.enum([
    "tool_lifecycle",
    "tool_invocation",
    "access_control",
    "rate_limiting",
    "admin",
  ]).optional(),

  // Target filters
  tool_id: z.string().uuid().optional(),
  tool_name: z.string().optional(),

  // Context filters
  session_id: z.string().uuid().optional(),
  thread_id: z.string().uuid().optional(),
  correlation_id: z.string().uuid().optional(),

  // Result filters
  success: z.boolean().optional(),
  has_error: z.boolean().optional(),

  // Pagination
  limit: z.number().int().min(1).max(1000).default(100),
  offset: z.number().int().min(0).default(0),
  cursor: z.string().optional(),

  // Sorting
  sort_by: z.enum(["timestamp", "sequence_number", "duration_ms"]).default("timestamp"),
  sort_order: z.enum(["asc", "desc"]).default("desc"),
})

export type AuditLogQuery = z.infer<typeof AuditLogQuerySchema>

// ============================================
// AUDIT STATISTICS
// ============================================

/**
 * Aggregated audit statistics.
 */
export const AuditStatsSchema = z.object({
  user_id: z.string().uuid(),
  period_start: z.number().int(),
  period_end: z.number().int(),

  // Counts
  total_events: z.number().int(),
  total_invocations: z.number().int(),
  successful_invocations: z.number().int(),
  failed_invocations: z.number().int(),

  // By action category
  by_category: z.record(z.number().int()),

  // By tool
  by_tool: z.array(z.object({
    tool_id: z.string().uuid(),
    tool_name: z.string(),
    count: z.number().int(),
    success_count: z.number().int(),
    error_count: z.number().int(),
    avg_duration_ms: z.number(),
  })),

  // Performance
  avg_duration_ms: z.number(),
  p50_duration_ms: z.number(),
  p95_duration_ms: z.number(),
  p99_duration_ms: z.number(),
})

export type AuditStats = z.infer<typeof AuditStatsSchema>

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Create a SHA-256 hash of data (for audit purposes).
 */
export async function hashData(data: unknown): Promise<string> {
  const text = typeof data === "string" ? data : JSON.stringify(data)
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

/**
 * Calculate checksum for audit entry integrity.
 */
export async function calculateChecksum(
  entry: Omit<AuditLogEntry, "checksum" | "previous_checksum">
): Promise<string> {
  return hashData(entry)
}

/**
 * Determine action category from action.
 */
export function getActionCategory(
  action: AuditAction
): AuditLogEntry["action_category"] {
  if (action.startsWith("tool.registered") || action.startsWith("tool.updated") ||
      action.startsWith("tool.deprecated") || action.startsWith("tool.deleted")) {
    return "tool_lifecycle"
  }
  if (action.startsWith("tool.invoked") || action.startsWith("tool.completed") ||
      action.startsWith("tool.failed") || action.startsWith("tool.timeout")) {
    return "tool_invocation"
  }
  if (action.startsWith("access.")) {
    return "access_control"
  }
  if (action.startsWith("rate_limit.")) {
    return "rate_limiting"
  }
  return "admin"
}

/**
 * Create an audit log entry from context and tool info.
 */
export async function createAuditEntry(
  context: InvocationContext,
  action: AuditAction,
  tool: EnterpriseTool | null,
  result: {
    success: boolean
    error_code?: string
    error_message?: string
    duration_ms?: number
    input?: unknown
    output?: unknown
  },
  sequenceNumber: number,
  previousChecksum?: string
): Promise<AuditLogEntry> {
  const entry: Omit<AuditLogEntry, "checksum"> = {
    id: crypto.randomUUID(),
    user_id: context.user_id,
    timestamp: Date.now(),
    sequence_number: sequenceNumber,

    actor_type: context.source === "agent" ? "agent" : context.source === "scheduled" ? "scheduled" : "user",
    actor_id: context.source === "agent" ? context.agent_id : context.user_id,
    actor_name: "Unknown", // Should be enriched by caller

    action,
    action_category: getActionCategory(action),

    tool_id: tool?.id,
    tool_name: tool?.name,
    tool_version: tool?.version,

    session_id: context.session_id,
    thread_id: context.thread_id,
    correlation_id: context.correlation_id,

    input_hash: result.input ? await hashData(result.input) : undefined,
    output_hash: result.output ? await hashData(result.output) : undefined,
    input_size_bytes: result.input ? JSON.stringify(result.input).length : undefined,
    output_size_bytes: result.output ? JSON.stringify(result.output).length : undefined,

    success: result.success,
    error_code: result.error_code,
    error_message: result.error_message,
    duration_ms: result.duration_ms,

    source: context.source,
    ip_address: context.ip_address,
    user_agent: context.user_agent,

    previous_checksum: previousChecksum,
  }

  const checksum = await calculateChecksum(entry)

  return { ...entry, checksum }
}
