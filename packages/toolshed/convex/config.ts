/**
 * 8gent Enterprise Toolshed - User Tool Config & Rate Limiting
 *
 * Per-user tool configuration and rate limiting.
 */

import { v } from "convex/values"
import { mutation, query, internalMutation } from "./_generated/server"

// ============================================
// UTILITY FUNCTIONS
// ============================================

function generateUUID(): string {
  return crypto.randomUUID()
}

// ============================================
// USER TOOL CONFIG
// ============================================

/**
 * Get user-specific config for a tool.
 */
export const getUserToolConfig = query({
  args: {
    user_id: v.string(),
    tool_id: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("user_tool_config")
      .withIndex("by_user_tool", (q) =>
        q.eq("user_id", args.user_id).eq("tool_id", args.tool_id)
      )
      .first()
  },
})

/**
 * Get all tool configs for a user.
 */
export const getUserToolConfigs = query({
  args: {
    user_id: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("user_tool_config")
      .withIndex("by_user", (q) => q.eq("user_id", args.user_id))
      .collect()
  },
})

/**
 * Set user-specific config for a tool.
 */
export const setUserToolConfig = mutation({
  args: {
    user_id: v.string(),
    tool_id: v.string(),
    configured_by: v.string(),

    // Config options
    enabled: v.optional(v.boolean()),
    role_overrides: v.optional(v.string()),
    allowed_agents_override: v.optional(v.array(v.string())),
    denied_agents_override: v.optional(v.array(v.string())),
    rate_limit_override: v.optional(v.string()),
    timeout_ms_override: v.optional(v.number()),
    custom_config: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Check if config exists
    const existing = await ctx.db
      .query("user_tool_config")
      .withIndex("by_user_tool", (q) =>
        q.eq("user_id", args.user_id).eq("tool_id", args.tool_id)
      )
      .first()

    if (existing) {
      // Update existing
      const updates: Record<string, unknown> = {
        configured_by: args.configured_by,
        updated_at: now,
      }

      if (args.enabled !== undefined) {
        updates.enabled = args.enabled
        updates[args.enabled ? "enabled_at" : "disabled_at"] = now
      }
      if (args.role_overrides !== undefined) {
        updates.role_overrides = args.role_overrides
      }
      if (args.allowed_agents_override !== undefined) {
        updates.allowed_agents_override = args.allowed_agents_override
      }
      if (args.denied_agents_override !== undefined) {
        updates.denied_agents_override = args.denied_agents_override
      }
      if (args.rate_limit_override !== undefined) {
        updates.rate_limit_override = args.rate_limit_override
      }
      if (args.timeout_ms_override !== undefined) {
        updates.timeout_ms_override = args.timeout_ms_override
      }
      if (args.custom_config !== undefined) {
        updates.custom_config = args.custom_config
      }

      await ctx.db.patch(existing._id, updates)
      return { config_id: existing.config_id, updated: true }
    } else {
      // Create new
      const configId = generateUUID()
      await ctx.db.insert("user_tool_config", {
        config_id: configId,
        user_id: args.user_id,
        tool_id: args.tool_id,
        enabled: args.enabled ?? true,
        enabled_at: args.enabled !== false ? now : undefined,
        disabled_at: args.enabled === false ? now : undefined,
        disabled_reason: undefined,
        role_overrides: args.role_overrides,
        allowed_agents_override: args.allowed_agents_override,
        denied_agents_override: args.denied_agents_override,
        rate_limit_override: args.rate_limit_override,
        timeout_ms_override: args.timeout_ms_override,
        custom_config: args.custom_config,
        configured_by: args.configured_by,
        created_at: now,
        updated_at: now,
      })
      return { config_id: configId, created: true }
    }
  },
})

/**
 * Disable a tool for a user.
 */
export const disableToolForUser = mutation({
  args: {
    user_id: v.string(),
    tool_id: v.string(),
    disabled_by: v.string(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    const existing = await ctx.db
      .query("user_tool_config")
      .withIndex("by_user_tool", (q) =>
        q.eq("user_id", args.user_id).eq("tool_id", args.tool_id)
      )
      .first()

    if (existing) {
      await ctx.db.patch(existing._id, {
        enabled: false,
        disabled_at: now,
        disabled_reason: args.reason,
        configured_by: args.disabled_by,
        updated_at: now,
      })
      return { success: true }
    } else {
      const configId = generateUUID()
      await ctx.db.insert("user_tool_config", {
        config_id: configId,
        user_id: args.user_id,
        tool_id: args.tool_id,
        enabled: false,
        disabled_at: now,
        disabled_reason: args.reason,
        configured_by: args.disabled_by,
        created_at: now,
        updated_at: now,
      })
      return { success: true, config_id: configId }
    }
  },
})

// ============================================
// RATE LIMITING
// ============================================

/**
 * Check and update rate limits.
 * Returns { allowed: boolean, current: { minute, hour, day }, limits: { minute, hour, day } }
 */
export const checkRateLimit = internalMutation({
  args: {
    user_id: v.string(),
    tool_id: v.string(),
    limits: v.object({
      requests_per_minute: v.number(),
      requests_per_hour: v.number(),
      requests_per_day: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    const minuteStart = Math.floor(now / 60000) * 60000
    const hourStart = Math.floor(now / 3600000) * 3600000
    const dayStart = Math.floor(now / 86400000) * 86400000

    // Get current state
    const state = await ctx.db
      .query("rate_limit_state")
      .withIndex("by_user_tool", (q) =>
        q.eq("user_id", args.user_id).eq("tool_id", args.tool_id)
      )
      .first()

    if (!state) {
      // First request - create state
      await ctx.db.insert("rate_limit_state", {
        user_id: args.user_id,
        tool_id: args.tool_id,
        minute_window: minuteStart,
        minute_count: 1,
        hour_window: hourStart,
        hour_count: 1,
        day_window: dayStart,
        day_count: 1,
        updated_at: now,
      })

      return {
        allowed: true,
        current: { minute: 1, hour: 1, day: 1 },
        limits: args.limits,
      }
    }

    // Calculate current counts (reset if window changed)
    let minuteCount = state.minute_window === minuteStart ? state.minute_count : 0
    let hourCount = state.hour_window === hourStart ? state.hour_count : 0
    let dayCount = state.day_window === dayStart ? state.day_count : 0

    // Check limits
    const allowed =
      minuteCount < args.limits.requests_per_minute &&
      hourCount < args.limits.requests_per_hour &&
      dayCount < args.limits.requests_per_day

    if (allowed) {
      // Increment counts
      minuteCount++
      hourCount++
      dayCount++

      await ctx.db.patch(state._id, {
        minute_window: minuteStart,
        minute_count: minuteCount,
        hour_window: hourStart,
        hour_count: hourCount,
        day_window: dayStart,
        day_count: dayCount,
        updated_at: now,
      })
    }

    return {
      allowed,
      current: { minute: minuteCount, hour: hourCount, day: dayCount },
      limits: args.limits,
      exceeded: {
        minute: minuteCount >= args.limits.requests_per_minute,
        hour: hourCount >= args.limits.requests_per_hour,
        day: dayCount >= args.limits.requests_per_day,
      },
    }
  },
})

/**
 * Get rate limit status without incrementing.
 */
export const getRateLimitStatus = query({
  args: {
    user_id: v.string(),
    tool_id: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    const minuteStart = Math.floor(now / 60000) * 60000
    const hourStart = Math.floor(now / 3600000) * 3600000
    const dayStart = Math.floor(now / 86400000) * 86400000

    const state = await ctx.db
      .query("rate_limit_state")
      .withIndex("by_user_tool", (q) =>
        q.eq("user_id", args.user_id).eq("tool_id", args.tool_id)
      )
      .first()

    if (!state) {
      return {
        minute: 0,
        hour: 0,
        day: 0,
        windows: {
          minute_resets_at: minuteStart + 60000,
          hour_resets_at: hourStart + 3600000,
          day_resets_at: dayStart + 86400000,
        },
      }
    }

    return {
      minute: state.minute_window === minuteStart ? state.minute_count : 0,
      hour: state.hour_window === hourStart ? state.hour_count : 0,
      day: state.day_window === dayStart ? state.day_count : 0,
      windows: {
        minute_resets_at: minuteStart + 60000,
        hour_resets_at: hourStart + 3600000,
        day_resets_at: dayStart + 86400000,
      },
    }
  },
})

// ============================================
// USAGE ANALYTICS
// ============================================

/**
 * Record a tool usage for analytics.
 */
export const recordUsageAnalytics = internalMutation({
  args: {
    user_id: v.string(),
    tool_id: v.string(),
    success: v.boolean(),
    duration_ms: v.number(),
    error_code: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    const date = new Date(now).toISOString().split("T")[0]
    const hour = new Date(now).getUTCHours()

    // Get or create analytics record
    const existing = await ctx.db
      .query("usage_analytics")
      .withIndex("by_user_tool_date", (q) =>
        q.eq("user_id", args.user_id).eq("tool_id", args.tool_id).eq("date", date)
      )
      .first()

    if (existing) {
      // Update existing record
      const hourlyBreakdown = existing.hourly_breakdown
        ? JSON.parse(existing.hourly_breakdown)
        : Array(24).fill(0)
      hourlyBreakdown[hour] = (hourlyBreakdown[hour] || 0) + 1

      const errorCodes = existing.error_codes
        ? JSON.parse(existing.error_codes)
        : {}
      if (args.error_code) {
        errorCodes[args.error_code] = (errorCodes[args.error_code] || 0) + 1
      }

      const newInvocationCount = existing.invocation_count + 1
      const newSuccessCount = existing.success_count + (args.success ? 1 : 0)
      const newErrorCount = existing.error_count + (args.success ? 0 : 1)
      const newTotalDuration = existing.total_duration_ms + args.duration_ms
      const newAvgDuration = newTotalDuration / newInvocationCount

      await ctx.db.patch(existing._id, {
        invocation_count: newInvocationCount,
        success_count: newSuccessCount,
        error_count: newErrorCount,
        total_duration_ms: newTotalDuration,
        avg_duration_ms: newAvgDuration,
        min_duration_ms: Math.min(existing.min_duration_ms, args.duration_ms),
        max_duration_ms: Math.max(existing.max_duration_ms, args.duration_ms),
        hourly_breakdown: JSON.stringify(hourlyBreakdown),
        error_codes: JSON.stringify(errorCodes),
        updated_at: now,
      })
    } else {
      // Create new record
      const hourlyBreakdown = Array(24).fill(0)
      hourlyBreakdown[hour] = 1

      const errorCodes: Record<string, number> = {}
      if (args.error_code) {
        errorCodes[args.error_code] = 1
      }

      await ctx.db.insert("usage_analytics", {
        user_id: args.user_id,
        tool_id: args.tool_id,
        date,
        invocation_count: 1,
        success_count: args.success ? 1 : 0,
        error_count: args.success ? 0 : 1,
        total_duration_ms: args.duration_ms,
        avg_duration_ms: args.duration_ms,
        min_duration_ms: args.duration_ms,
        max_duration_ms: args.duration_ms,
        hourly_breakdown: JSON.stringify(hourlyBreakdown),
        error_codes: JSON.stringify(errorCodes),
        updated_at: now,
      })
    }
  },
})

/**
 * Get usage analytics for a user.
 */
export const getUsageAnalytics = query({
  args: {
    user_id: v.string(),
    tool_id: v.optional(v.string()),
    start_date: v.optional(v.string()),
    end_date: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let entries = await ctx.db
      .query("usage_analytics")
      .withIndex("by_user_date", (q) => q.eq("user_id", args.user_id))
      .collect()

    // Apply filters
    if (args.tool_id) {
      entries = entries.filter((e) => e.tool_id === args.tool_id)
    }
    if (args.start_date) {
      entries = entries.filter((e) => e.date >= args.start_date!)
    }
    if (args.end_date) {
      entries = entries.filter((e) => e.date <= args.end_date!)
    }

    // Aggregate stats
    const totalInvocations = entries.reduce((sum, e) => sum + e.invocation_count, 0)
    const totalSuccess = entries.reduce((sum, e) => sum + e.success_count, 0)
    const totalDuration = entries.reduce((sum, e) => sum + e.total_duration_ms, 0)

    // By tool
    const byToolMap: Record<string, { count: number; name: string }> = {}
    for (const entry of entries) {
      if (!byToolMap[entry.tool_id]) {
        byToolMap[entry.tool_id] = { count: 0, name: entry.tool_id }
      }
      byToolMap[entry.tool_id].count += entry.invocation_count
    }
    const byTool = Object.entries(byToolMap).map(([tool_id, data]) => ({
      tool_id,
      tool_name: data.name,
      count: data.count,
    })).sort((a, b) => b.count - a.count)

    // By day
    const byDayMap: Record<string, number> = {}
    for (const entry of entries) {
      byDayMap[entry.date] = (byDayMap[entry.date] || 0) + entry.invocation_count
    }
    const byDay = Object.entries(byDayMap).map(([date, count]) => ({
      date,
      count,
    })).sort((a, b) => a.date.localeCompare(b.date))

    return {
      total_invocations: totalInvocations,
      by_tool: byTool,
      by_day: byDay,
      success_rate: totalInvocations > 0 ? (totalSuccess / totalInvocations) * 100 : 0,
      avg_duration_ms: totalInvocations > 0 ? totalDuration / totalInvocations : 0,
    }
  },
})
