/**
 * 8gent Enterprise Toolshed - Context Schemas
 *
 * Multi-tenant context for tool invocations.
 * 8gent model: Each user is their own "org" with their agents.
 */

import { z } from "zod"

// ============================================
// INVOCATION CONTEXT (REQUIRED ON EVERY CALL)
// ============================================

/**
 * Complete invocation context - MUST be present on every tool call.
 * For 8gent: user_id IS the org_id (each user is their own tenant).
 */
export const InvocationContextSchema = z.object({
  // User/tenant isolation (REQUIRED)
  // In 8gent, each user is their own "org"
  user_id: z.string().uuid({
    message: "user_id must be a valid UUID - required for tenant isolation",
  }),

  // Agent identification (REQUIRED)
  agent_id: z.string().uuid({
    message: "agent_id must be a valid UUID - identifies calling agent",
  }),

  // Session tracking (REQUIRED)
  session_id: z.string().uuid({
    message: "session_id must be a valid UUID - groups related calls",
  }),

  // Thread context (OPTIONAL)
  thread_id: z.string().uuid().optional(),

  // Timing (REQUIRED)
  timestamp: z.number().int().positive({
    message: "timestamp must be a positive Unix timestamp in milliseconds",
  }),

  // Source classification (REQUIRED)
  source: z.enum(["api", "agent", "workflow", "manual", "scheduled", "webhook"], {
    errorMap: () => ({
      message:
        "source must be one of: api, agent, workflow, manual, scheduled, webhook",
    }),
  }),

  // Optional correlation for distributed tracing
  correlation_id: z.string().uuid().optional(),

  // Request metadata (for audit)
  ip_address: z.string().ip().optional(),
  user_agent: z.string().max(500).optional(),
})

export type InvocationContext = z.infer<typeof InvocationContextSchema>

// ============================================
// ACTOR CONTEXT
// ============================================

/**
 * Expanded actor information for detailed audit logging.
 */
export const ActorContextSchema = z.object({
  // Identity
  id: z.string().uuid(),
  type: z.enum(["user", "agent", "system", "service", "scheduled"]),
  name: z.string().min(1).max(255),
  email: z.string().email().optional(),

  // Agent-specific
  agent_model: z.string().max(100).optional(),
  agent_version: z.string().regex(/^\d+\.\d+\.\d+$/).optional(),

  // Role context - consumer-friendly naming
  roles: z.array(z.enum(["owner", "admin", "collaborator", "viewer", "agent"])),

  // Authentication context
  auth_method: z.enum(["api_key", "jwt", "oauth", "service_account", "internal"]),
  auth_provider: z.string().optional(),
})

export type ActorContext = z.infer<typeof ActorContextSchema>

// ============================================
// HEADER EXTRACTION
// ============================================

/**
 * Expected headers for context extraction.
 */
export const RequiredHeaders = {
  USER_ID: "x-user-id",
  AGENT_ID: "x-agent-id",
  SESSION_ID: "x-session-id",
  THREAD_ID: "x-thread-id",
  SOURCE: "x-source",
  CORRELATION_ID: "x-correlation-id",
} as const

/**
 * Extract context from HTTP headers.
 */
export function extractContextFromHeaders(
  headers: Headers,
  overrides?: Partial<InvocationContext>
): InvocationContext {
  const raw = {
    user_id: headers.get(RequiredHeaders.USER_ID),
    agent_id: headers.get(RequiredHeaders.AGENT_ID),
    session_id: headers.get(RequiredHeaders.SESSION_ID),
    thread_id: headers.get(RequiredHeaders.THREAD_ID) ?? undefined,
    source: headers.get(RequiredHeaders.SOURCE) ?? "api",
    correlation_id: headers.get(RequiredHeaders.CORRELATION_ID) ?? undefined,
    timestamp: Date.now(),
    ip_address: headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? undefined,
    user_agent: headers.get("user-agent") ?? undefined,
    ...overrides,
  }

  return InvocationContextSchema.parse(raw)
}

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Validate that context belongs to a specific user.
 */
export function validateUserAccess(
  context: InvocationContext,
  requiredUserId: string
): boolean {
  return context.user_id === requiredUserId
}

/**
 * Create a minimal valid context (for testing/internal use).
 */
export function createMinimalContext(
  user_id: string,
  agent_id: string,
  source: InvocationContext["source"] = "api"
): InvocationContext {
  return InvocationContextSchema.parse({
    user_id,
    agent_id,
    session_id: crypto.randomUUID(),
    timestamp: Date.now(),
    source,
  })
}
