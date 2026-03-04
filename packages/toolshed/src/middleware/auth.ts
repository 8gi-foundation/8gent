/**
 * 8gent Enterprise Toolshed - Auth Middleware
 *
 * Validates user context on every request.
 * Ensures multi-tenant isolation and role-based access.
 */

import { createMiddleware } from "hono/factory"
import type { Context, Next } from "hono"
import {
  InvocationContextSchema,
  RequiredHeaders,
  extractContextFromHeaders,
  type InvocationContext,
} from "../schemas/context"
import { logger } from "../lib/logger"

// ============================================
// TYPES
// ============================================

export interface AuthVariables {
  context: InvocationContext
  userId: string
  agentId: string
  roles: string[]
}

// ============================================
// AUTH MIDDLEWARE
// ============================================

/**
 * Validates user context from headers.
 * Required headers: x-user-id, x-agent-id, x-session-id
 */
export const authMiddleware = createMiddleware<{
  Variables: AuthVariables
}>(async (c, next) => {
  const startTime = Date.now()

  try {
    // Extract context from headers
    const context = extractContextFromHeaders(c.req.raw.headers)

    // Store in context for downstream use
    c.set("context", context)
    c.set("userId", context.user_id)
    c.set("agentId", context.agent_id)

    // TODO: Fetch roles from database based on user_id
    // For now, default to owner role (each user owns their account)
    c.set("roles", ["owner"])

    await next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown auth error"

    logger.warn({
      event: "auth_failed",
      error: errorMessage,
      headers: {
        user_id: c.req.header(RequiredHeaders.USER_ID) ?? "missing",
        agent_id: c.req.header(RequiredHeaders.AGENT_ID) ?? "missing",
        session_id: c.req.header(RequiredHeaders.SESSION_ID) ?? "missing",
      },
      duration_ms: Date.now() - startTime,
    })

    return c.json(
      {
        error: "Authentication failed",
        message: errorMessage,
        required_headers: [
          RequiredHeaders.USER_ID,
          RequiredHeaders.AGENT_ID,
          RequiredHeaders.SESSION_ID,
        ],
      },
      401
    )
  }
})

/**
 * Validates that the user_id in path matches the one in headers.
 */
export const userMatchMiddleware = createMiddleware<{
  Variables: AuthVariables
}>(async (c, next) => {
  const pathUserId = c.req.param("user_id")
  const headerUserId = c.get("userId")

  if (pathUserId && pathUserId !== headerUserId) {
    logger.warn({
      event: "user_mismatch",
      path_user_id: pathUserId,
      header_user_id: headerUserId,
    })

    return c.json(
      {
        error: "User mismatch",
        message: "The user_id in the path does not match the authenticated user",
      },
      403
    )
  }

  await next()
})

/**
 * Role-based access control middleware.
 * Consumer-friendly roles: owner, admin, collaborator, viewer, agent
 */
export function roleGuard(...requiredRoles: string[]) {
  return createMiddleware<{
    Variables: AuthVariables
  }>(async (c, next) => {
    const userRoles = c.get("roles")

    const hasAccess = requiredRoles.some((role) => userRoles.includes(role))

    if (!hasAccess) {
      logger.warn({
        event: "role_access_denied",
        required_roles: requiredRoles,
        user_roles: userRoles,
        user_id: c.get("userId"),
      })

      return c.json(
        {
          error: "Access denied",
          message: `This action requires one of the following roles: ${requiredRoles.join(", ")}`,
          required_roles: requiredRoles,
          user_roles: userRoles,
        },
        403
      )
    }

    await next()
  })
}

/**
 * Optional auth middleware - doesn't fail if no auth, just sets context if present.
 */
export const optionalAuthMiddleware = createMiddleware<{
  Variables: Partial<AuthVariables>
}>(async (c, next) => {
  try {
    const context = extractContextFromHeaders(c.req.raw.headers)
    c.set("context", context)
    c.set("userId", context.user_id)
    c.set("agentId", context.agent_id)
    c.set("roles", ["owner"])
  } catch {
    // Auth is optional, continue without context
  }

  await next()
})

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Extract user_id from either path param or header.
 */
export function getUserId(c: Context<{ Variables: AuthVariables }>): string {
  return c.req.param("user_id") ?? c.get("userId")
}

/**
 * Get full invocation context.
 */
export function getContext(c: Context<{ Variables: AuthVariables }>): InvocationContext {
  return c.get("context")
}
