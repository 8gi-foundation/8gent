/**
 * 8gent Enterprise Toolshed - Audit Routes
 *
 * Audit log queries and integrity verification.
 */

import { Hono } from "hono"
import { ConvexHttpClient } from "convex/browser"
import { api } from "../../convex/_generated/api"
import type { AuthVariables } from "../middleware/auth"
import type { AuditVariables } from "../middleware/audit"
import { logger } from "../lib/logger"

type Variables = AuthVariables & AuditVariables

const audit = new Hono<{ Variables: Variables }>()

// Get Convex client
const getConvex = () => {
  const url = process.env.CONVEX_URL
  if (!url) throw new Error("CONVEX_URL not set")
  return new ConvexHttpClient(url)
}

// ============================================
// GET AUDIT LOG
// ============================================

/**
 * GET /api/:user_id/audit
 * Get audit log entries for a user.
 */
audit.get("/:user_id/audit", async (c) => {
  const convex = getConvex()
  const userId = c.req.param("user_id")

  const startTime = c.req.query("start_time") ? parseInt(c.req.query("start_time")!, 10) : undefined
  const endTime = c.req.query("end_time") ? parseInt(c.req.query("end_time")!, 10) : undefined
  const action = c.req.query("action")
  const actionCategory = c.req.query("action_category")
  const toolId = c.req.query("tool_id")
  const actorId = c.req.query("actor_id")
  const sessionId = c.req.query("session_id")
  const success = c.req.query("success") !== undefined ? c.req.query("success") === "true" : undefined
  const limit = parseInt(c.req.query("limit") ?? "100", 10)
  const offset = parseInt(c.req.query("offset") ?? "0", 10)

  try {
    const result = await convex.query(api.audit.getAuditLog, {
      user_id: userId,
      start_time: startTime,
      end_time: endTime,
      action,
      action_category: actionCategory as any,
      tool_id: toolId,
      actor_id: actorId,
      session_id: sessionId,
      success,
      limit,
      offset,
    })

    return c.json({
      success: true,
      entries: result.entries,
      total: result.total,
      has_more: result.has_more,
    })
  } catch (error) {
    logger.error({
      event: "get_audit_log_error",
      user_id: userId,
      error: String(error),
    })
    return c.json({ success: false, error: String(error) }, 500)
  }
})

// ============================================
// GET AUDIT STATS
// ============================================

/**
 * GET /api/:user_id/audit/stats
 * Get audit statistics for a time period.
 */
audit.get("/:user_id/audit/stats", async (c) => {
  const convex = getConvex()
  const userId = c.req.param("user_id")

  const startTime = c.req.query("start_time")
  const endTime = c.req.query("end_time")

  if (!startTime || !endTime) {
    return c.json({
      success: false,
      error: "start_time and end_time parameters required",
    }, 400)
  }

  try {
    const stats = await convex.query(api.audit.getAuditStats, {
      user_id: userId,
      start_time: parseInt(startTime, 10),
      end_time: parseInt(endTime, 10),
    })

    return c.json({ success: true, stats })
  } catch (error) {
    logger.error({
      event: "get_audit_stats_error",
      user_id: userId,
      error: String(error),
    })
    return c.json({ success: false, error: String(error) }, 500)
  }
})

// ============================================
// VERIFY AUDIT INTEGRITY
// ============================================

/**
 * GET /api/:user_id/audit/verify
 * Verify audit chain integrity using SHA-256 checksums.
 */
audit.get("/:user_id/audit/verify", async (c) => {
  const convex = getConvex()
  const userId = c.req.param("user_id")

  const startSequence = c.req.query("start_sequence")
    ? parseInt(c.req.query("start_sequence")!, 10)
    : undefined
  const endSequence = c.req.query("end_sequence")
    ? parseInt(c.req.query("end_sequence")!, 10)
    : undefined

  try {
    const result = await convex.query(api.audit.verifyAuditIntegrity, {
      user_id: userId,
      start_sequence: startSequence,
      end_sequence: endSequence,
    })

    return c.json({
      success: true,
      user_id: result.user_id,
      entries_checked: result.entries_checked,
      integrity_valid: result.integrity_valid,
      issues: result.issues,
    })
  } catch (error) {
    logger.error({
      event: "verify_audit_integrity_error",
      user_id: userId,
      error: String(error),
    })
    return c.json({ success: false, error: String(error) }, 500)
  }
})

// ============================================
// GET USAGE ANALYTICS
// ============================================

/**
 * GET /api/:user_id/analytics
 * Get usage analytics for tools.
 */
audit.get("/:user_id/analytics", async (c) => {
  const convex = getConvex()
  const userId = c.req.param("user_id")

  const toolId = c.req.query("tool_id")
  const startDate = c.req.query("start_date")
  const endDate = c.req.query("end_date")

  try {
    const analytics = await convex.query(api.config.getUsageAnalytics, {
      user_id: userId,
      tool_id: toolId,
      start_date: startDate,
      end_date: endDate,
    })

    return c.json({ success: true, analytics })
  } catch (error) {
    logger.error({
      event: "get_usage_analytics_error",
      user_id: userId,
      error: String(error),
    })
    return c.json({ success: false, error: String(error) }, 500)
  }
})

// ============================================
// GET RATE LIMIT STATUS
// ============================================

/**
 * GET /api/:user_id/tools/:tool_id/rate-limit
 * Get current rate limit status for a tool.
 */
audit.get("/:user_id/tools/:tool_id/rate-limit", async (c) => {
  const convex = getConvex()
  const userId = c.req.param("user_id")
  const toolId = c.req.param("tool_id")

  try {
    const status = await convex.query(api.config.getRateLimitStatus, {
      user_id: userId,
      tool_id: toolId,
    })

    return c.json({ success: true, ...status })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

export default audit
