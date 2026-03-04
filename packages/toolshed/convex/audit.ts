/**
 * 8gent Enterprise Toolshed - Audit Log Operations
 *
 * IMMUTABLE audit trail with SHA-256 chain integrity.
 * Records cannot be modified or deleted after creation.
 */

import { v } from "convex/values"
import { mutation, query, internalMutation, internalQuery } from "./_generated/server"

// ============================================
// UTILITY FUNCTIONS
// ============================================

function generateUUID(): string {
  return crypto.randomUUID()
}

async function hashData(data: unknown): Promise<string> {
  const text = typeof data === "string" ? data : JSON.stringify(data)
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

// ============================================
// SEQUENCE NUMBER MANAGEMENT
// ============================================

/**
 * Get and increment the sequence number for a user (internal).
 */
export const getNextSequence = internalMutation({
  args: { user_id: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("user_sequence")
      .withIndex("by_user", (q) => q.eq("user_id", args.user_id))
      .first()

    if (existing) {
      const nextSeq = existing.last_sequence + 1
      await ctx.db.patch(existing._id, {
        last_sequence: nextSeq,
        updated_at: Date.now(),
      })
      return nextSeq
    } else {
      await ctx.db.insert("user_sequence", {
        user_id: args.user_id,
        last_sequence: 1,
        updated_at: Date.now(),
      })
      return 1
    }
  },
})

/**
 * Get the last checksum for a user (for chain integrity).
 */
export const getLastChecksum = internalQuery({
  args: { user_id: v.string() },
  handler: async (ctx, args) => {
    const lastEntry = await ctx.db
      .query("audit_log")
      .withIndex("by_user_sequence", (q) => q.eq("user_id", args.user_id))
      .order("desc")
      .first()

    return lastEntry?.checksum
  },
})

// ============================================
// AUDIT LOG MUTATIONS
// ============================================

/**
 * Log a tool invocation event.
 */
export const logToolInvocation = mutation({
  args: {
    // Context (REQUIRED)
    user_id: v.string(),
    session_id: v.string(),
    thread_id: v.optional(v.string()),
    correlation_id: v.optional(v.string()),

    // Actor
    actor_type: v.union(
      v.literal("user"),
      v.literal("agent"),
      v.literal("system"),
      v.literal("service"),
      v.literal("scheduled")
    ),
    actor_id: v.string(),
    actor_name: v.string(),

    // Action
    action: v.string(),
    action_category: v.union(
      v.literal("tool_lifecycle"),
      v.literal("tool_invocation"),
      v.literal("access_control"),
      v.literal("rate_limiting"),
      v.literal("admin")
    ),

    // Target
    tool_id: v.optional(v.string()),
    tool_name: v.optional(v.string()),
    tool_version: v.optional(v.string()),

    // Data (raw data for hashing - NOT stored)
    input_data: v.optional(v.any()),
    output_data: v.optional(v.any()),

    // Result
    success: v.boolean(),
    error_code: v.optional(v.string()),
    error_message: v.optional(v.string()),

    // Performance
    duration_ms: v.optional(v.number()),

    // Request metadata
    source: v.union(
      v.literal("api"),
      v.literal("agent"),
      v.literal("workflow"),
      v.literal("manual"),
      v.literal("scheduled"),
      v.literal("webhook")
    ),
    ip_address: v.optional(v.string()),
    user_agent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    const auditId = generateUUID()

    // Get sequence number
    const existing = await ctx.db
      .query("user_sequence")
      .withIndex("by_user", (q) => q.eq("user_id", args.user_id))
      .first()

    let sequenceNumber: number
    if (existing) {
      sequenceNumber = existing.last_sequence + 1
      await ctx.db.patch(existing._id, {
        last_sequence: sequenceNumber,
        updated_at: now,
      })
    } else {
      sequenceNumber = 1
      await ctx.db.insert("user_sequence", {
        user_id: args.user_id,
        last_sequence: 1,
        updated_at: now,
      })
    }

    // Get previous checksum for chain integrity
    const lastEntry = await ctx.db
      .query("audit_log")
      .withIndex("by_user_sequence", (q) => q.eq("user_id", args.user_id))
      .order("desc")
      .first()

    const previousChecksum = lastEntry?.checksum

    // Hash input/output data
    const inputHash = args.input_data ? await hashData(args.input_data) : undefined
    const outputHash = args.output_data ? await hashData(args.output_data) : undefined
    const inputSize = args.input_data ? JSON.stringify(args.input_data).length : undefined
    const outputSize = args.output_data ? JSON.stringify(args.output_data).length : undefined

    // Build entry for checksum
    const entryForHash = {
      audit_id: auditId,
      user_id: args.user_id,
      sequence_number: sequenceNumber,
      timestamp: now,
      actor_type: args.actor_type,
      actor_id: args.actor_id,
      actor_name: args.actor_name,
      action: args.action,
      action_category: args.action_category,
      tool_id: args.tool_id,
      tool_name: args.tool_name,
      session_id: args.session_id,
      success: args.success,
      input_hash: inputHash,
      output_hash: outputHash,
      previous_checksum: previousChecksum,
    }

    const checksum = await hashData(entryForHash)

    // Insert audit log entry
    const entry = await ctx.db.insert("audit_log", {
      audit_id: auditId,
      user_id: args.user_id,
      sequence_number: sequenceNumber,
      timestamp: now,
      actor_type: args.actor_type,
      actor_id: args.actor_id,
      actor_name: args.actor_name,
      action: args.action,
      action_category: args.action_category,
      tool_id: args.tool_id,
      tool_name: args.tool_name,
      tool_version: args.tool_version,
      session_id: args.session_id,
      thread_id: args.thread_id,
      correlation_id: args.correlation_id,
      input_hash: inputHash,
      output_hash: outputHash,
      input_size_bytes: inputSize,
      output_size_bytes: outputSize,
      success: args.success,
      error_code: args.error_code,
      error_message: args.error_message,
      duration_ms: args.duration_ms,
      source: args.source,
      ip_address: args.ip_address,
      user_agent: args.user_agent,
      checksum,
      previous_checksum: previousChecksum,
    })

    return { audit_id: auditId, sequence_number: sequenceNumber, _id: entry }
  },
})

// ============================================
// AUDIT LOG QUERIES
// ============================================

/**
 * Get audit log entries for a user.
 */
export const getAuditLog = query({
  args: {
    user_id: v.string(),
    start_time: v.optional(v.number()),
    end_time: v.optional(v.number()),
    action: v.optional(v.string()),
    action_category: v.optional(
      v.union(
        v.literal("tool_lifecycle"),
        v.literal("tool_invocation"),
        v.literal("access_control"),
        v.literal("rate_limiting"),
        v.literal("admin")
      )
    ),
    tool_id: v.optional(v.string()),
    actor_id: v.optional(v.string()),
    session_id: v.optional(v.string()),
    success: v.optional(v.boolean()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100
    const offset = args.offset ?? 0

    // Query by user and timestamp
    let entries = await ctx.db
      .query("audit_log")
      .withIndex("by_user_timestamp", (q) => q.eq("user_id", args.user_id))
      .order("desc")
      .take(1000) // Get more to filter

    // Apply filters
    if (args.start_time) {
      entries = entries.filter((e) => e.timestamp >= args.start_time!)
    }
    if (args.end_time) {
      entries = entries.filter((e) => e.timestamp <= args.end_time!)
    }
    if (args.action) {
      entries = entries.filter((e) => e.action === args.action)
    }
    if (args.action_category) {
      entries = entries.filter((e) => e.action_category === args.action_category)
    }
    if (args.tool_id) {
      entries = entries.filter((e) => e.tool_id === args.tool_id)
    }
    if (args.actor_id) {
      entries = entries.filter((e) => e.actor_id === args.actor_id)
    }
    if (args.session_id) {
      entries = entries.filter((e) => e.session_id === args.session_id)
    }
    if (args.success !== undefined) {
      entries = entries.filter((e) => e.success === args.success)
    }

    // Paginate
    const total = entries.length
    const paginated = entries.slice(offset, offset + limit)

    return {
      entries: paginated,
      total,
      has_more: offset + limit < total,
    }
  },
})

/**
 * Get audit statistics for a user.
 */
export const getAuditStats = query({
  args: {
    user_id: v.string(),
    start_time: v.number(),
    end_time: v.number(),
  },
  handler: async (ctx, args) => {
    const entries = await ctx.db
      .query("audit_log")
      .withIndex("by_user_timestamp", (q) => q.eq("user_id", args.user_id))
      .filter((q) =>
        q.and(
          q.gte(q.field("timestamp"), args.start_time),
          q.lte(q.field("timestamp"), args.end_time)
        )
      )
      .collect()

    // Calculate stats
    const invocations = entries.filter(
      (e) => e.action_category === "tool_invocation"
    )
    const successful = invocations.filter((e) => e.success)
    const failed = invocations.filter((e) => !e.success)

    // By category
    const byCategory: Record<string, number> = {}
    for (const entry of entries) {
      byCategory[entry.action_category] = (byCategory[entry.action_category] ?? 0) + 1
    }

    // By tool
    const toolStats: Record<string, { count: number; success: number; error: number; durations: number[] }> = {}
    for (const entry of invocations) {
      if (!entry.tool_id) continue
      if (!toolStats[entry.tool_id]) {
        toolStats[entry.tool_id] = { count: 0, success: 0, error: 0, durations: [] }
      }
      toolStats[entry.tool_id].count++
      if (entry.success) {
        toolStats[entry.tool_id].success++
      } else {
        toolStats[entry.tool_id].error++
      }
      if (entry.duration_ms) {
        toolStats[entry.tool_id].durations.push(entry.duration_ms)
      }
    }

    const byTool = Object.entries(toolStats).map(([tool_id, stats]) => ({
      tool_id,
      tool_name: invocations.find((e) => e.tool_id === tool_id)?.tool_name ?? "Unknown",
      count: stats.count,
      success_count: stats.success,
      error_count: stats.error,
      avg_duration_ms:
        stats.durations.length > 0
          ? stats.durations.reduce((a, b) => a + b, 0) / stats.durations.length
          : 0,
    }))

    // Performance stats
    const durations = invocations
      .map((e) => e.duration_ms)
      .filter((d): d is number => d !== undefined)
      .sort((a, b) => a - b)

    const p50 = durations[Math.floor(durations.length * 0.5)] ?? 0
    const p95 = durations[Math.floor(durations.length * 0.95)] ?? 0
    const p99 = durations[Math.floor(durations.length * 0.99)] ?? 0
    const avgDuration =
      durations.length > 0
        ? durations.reduce((a, b) => a + b, 0) / durations.length
        : 0

    return {
      user_id: args.user_id,
      period_start: args.start_time,
      period_end: args.end_time,
      total_events: entries.length,
      total_invocations: invocations.length,
      successful_invocations: successful.length,
      failed_invocations: failed.length,
      by_category: byCategory,
      by_tool: byTool.sort((a, b) => b.count - a.count).slice(0, 20),
      avg_duration_ms: Math.round(avgDuration),
      p50_duration_ms: p50,
      p95_duration_ms: p95,
      p99_duration_ms: p99,
    }
  },
})

/**
 * Verify audit chain integrity.
 */
export const verifyAuditIntegrity = query({
  args: {
    user_id: v.string(),
    start_sequence: v.optional(v.number()),
    end_sequence: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const entries = await ctx.db
      .query("audit_log")
      .withIndex("by_user_sequence", (q) => q.eq("user_id", args.user_id))
      .order("asc")
      .collect()

    // Filter by sequence range
    let filtered = entries
    if (args.start_sequence) {
      filtered = filtered.filter((e) => e.sequence_number >= args.start_sequence!)
    }
    if (args.end_sequence) {
      filtered = filtered.filter((e) => e.sequence_number <= args.end_sequence!)
    }

    // Verify chain
    const issues: Array<{ sequence: number; issue: string }> = []
    let previousChecksum: string | undefined

    for (const entry of filtered) {
      // Check previous checksum linkage
      if (previousChecksum && entry.previous_checksum !== previousChecksum) {
        issues.push({
          sequence: entry.sequence_number,
          issue: `Previous checksum mismatch: expected ${previousChecksum}, got ${entry.previous_checksum}`,
        })
      }

      previousChecksum = entry.checksum
    }

    return {
      user_id: args.user_id,
      entries_checked: filtered.length,
      integrity_valid: issues.length === 0,
      issues,
    }
  },
})
