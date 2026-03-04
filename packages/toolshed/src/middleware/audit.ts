/**
 * 8gent Enterprise Toolshed - Audit Middleware
 *
 * Logs every request for compliance tracking.
 * Integrates with Convex audit_log table.
 */

import { createMiddleware } from "hono/factory"
import type { AuthVariables } from "./auth"
import { logger } from "../lib/logger"
import { getActionCategory, type AuditAction } from "../schemas/audit"

// ============================================
// TYPES
// ============================================

export interface AuditVariables extends AuthVariables {
  requestId: string
  requestStartTime: number
}

// ============================================
// AUDIT MIDDLEWARE
// ============================================

/**
 * Adds request tracking and timing to all requests.
 */
export const requestTrackingMiddleware = createMiddleware<{
  Variables: AuditVariables
}>(async (c, next) => {
  const requestId = crypto.randomUUID()
  const startTime = Date.now()

  c.set("requestId", requestId)
  c.set("requestStartTime", startTime)

  // Add request ID to response headers
  c.header("x-request-id", requestId)

  await next()

  // Log request completion
  const duration = Date.now() - startTime
  const status = c.res.status

  logger.info({
    event: "request_completed",
    request_id: requestId,
    method: c.req.method,
    path: c.req.path,
    status,
    duration_ms: duration,
    user_id: c.get("userId"),
  })
})

/**
 * Creates audit log entry for specific actions.
 * Should be called explicitly in route handlers, not as global middleware.
 */
export async function createAuditEntry(
  convexClient: {
    mutation: (fn: unknown, args: unknown) => Promise<unknown>
  },
  params: {
    context: AuditVariables
    action: AuditAction
    tool_id?: string
    tool_name?: string
    tool_version?: string
    input_data?: unknown
    output_data?: unknown
    success: boolean
    error_code?: string
    error_message?: string
    duration_ms?: number
  }
): Promise<{ audit_id: string }> {
  try {
    // This would call the Convex mutation
    // For now, return a mock response
    const auditId = crypto.randomUUID()

    logger.info({
      event: "audit_logged",
      audit_id: auditId,
      action: params.action,
      action_category: getActionCategory(params.action),
      user_id: params.context.userId,
      agent_id: params.context.agentId,
      tool_id: params.tool_id,
      success: params.success,
      duration_ms: params.duration_ms,
    })

    return { audit_id: auditId }
  } catch (error) {
    logger.error({
      event: "audit_log_failed",
      error: error instanceof Error ? error.message : "Unknown error",
      action: params.action,
      user_id: params.context.userId,
    })

    // Don't fail the request if audit logging fails
    return { audit_id: "audit-failed" }
  }
}

// ============================================
// AUDIT HELPERS
// ============================================

/**
 * Log a tool invocation event.
 */
export function logToolInvocation(
  requestId: string,
  params: {
    user_id: string
    agent_id: string
    tool_id: string
    tool_name: string
    tool_version: string
    input: unknown
    source: string
  }
): void {
  logger.info({
    event: "tool_invocation_started",
    request_id: requestId,
    ...params,
  })
}

/**
 * Log a tool completion event.
 */
export function logToolCompletion(
  requestId: string,
  params: {
    user_id: string
    tool_id: string
    tool_name: string
    success: boolean
    duration_ms: number
    error_code?: string
    error_message?: string
  }
): void {
  const level = params.success ? "info" : "warn"

  logger[level]({
    event: params.success ? "tool_invocation_completed" : "tool_invocation_failed",
    request_id: requestId,
    ...params,
  })
}

/**
 * Log an access control event.
 */
export function logAccessEvent(
  requestId: string,
  params: {
    user_id: string
    agent_id: string
    action: "access.granted" | "access.denied" | "access.revoked"
    resource_type: string
    resource_id: string
    reason?: string
  }
): void {
  const level = params.action === "access.granted" ? "info" : "warn"

  logger[level]({
    event: params.action.replace(".", "_"),
    request_id: requestId,
    ...params,
  })
}

/**
 * Log a rate limit event.
 */
export function logRateLimitEvent(
  requestId: string,
  params: {
    user_id: string
    tool_id: string
    limit_type: "minute" | "hour" | "day"
    current_count: number
    limit: number
    exceeded: boolean
  }
): void {
  const level = params.exceeded ? "warn" : "info"

  logger[level]({
    event: params.exceeded ? "rate_limit_exceeded" : "rate_limit_warning",
    request_id: requestId,
    ...params,
  })
}
