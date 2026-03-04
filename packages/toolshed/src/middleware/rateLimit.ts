/**
 * 8gent Enterprise Toolshed - Rate Limiting Middleware
 *
 * In-memory rate limiting with sliding window algorithm.
 * For production, consider Redis-backed rate limiting.
 */

import { createMiddleware } from "hono/factory"
import type { AuthVariables } from "./auth"
import { logger } from "../lib/logger"

// ============================================
// TYPES
// ============================================

export interface RateLimitConfig {
  /** Requests allowed per minute */
  perMinute?: number
  /** Requests allowed per hour */
  perHour?: number
  /** Requests allowed per day */
  perDay?: number
  /** Skip rate limiting for specific roles */
  skipRoles?: string[]
}

export interface RateLimitEntry {
  count: number
  resetAt: number
}

export interface RateLimitStore {
  minute: Map<string, RateLimitEntry>
  hour: Map<string, RateLimitEntry>
  day: Map<string, RateLimitEntry>
}

export interface RateLimitVariables extends AuthVariables {
  rateLimitRemaining: {
    minute: number
    hour: number
    day: number
  }
}

// ============================================
// IN-MEMORY STORE
// ============================================

const store: RateLimitStore = {
  minute: new Map(),
  hour: new Map(),
  day: new Map(),
}

// Cleanup expired entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store.minute) {
    if (entry.resetAt < now) store.minute.delete(key)
  }
  for (const [key, entry] of store.hour) {
    if (entry.resetAt < now) store.hour.delete(key)
  }
  for (const [key, entry] of store.day) {
    if (entry.resetAt < now) store.day.delete(key)
  }
}, 60000) // Cleanup every minute

// ============================================
// HELPERS
// ============================================

function getOrCreateEntry(
  map: Map<string, RateLimitEntry>,
  key: string,
  windowMs: number
): RateLimitEntry {
  const now = Date.now()
  const existing = map.get(key)

  if (existing && existing.resetAt > now) {
    return existing
  }

  const entry: RateLimitEntry = {
    count: 0,
    resetAt: now + windowMs,
  }
  map.set(key, entry)
  return entry
}

function incrementAndCheck(
  map: Map<string, RateLimitEntry>,
  key: string,
  windowMs: number,
  limit: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const entry = getOrCreateEntry(map, key, windowMs)
  entry.count++

  return {
    allowed: entry.count <= limit,
    remaining: Math.max(0, limit - entry.count),
    resetAt: entry.resetAt,
  }
}

// ============================================
// MIDDLEWARE
// ============================================

/**
 * Create a rate limiting middleware with configurable limits.
 *
 * Default limits (consumer-friendly):
 * - 120 requests per minute
 * - 3000 requests per hour
 * - 50000 requests per day
 */
export function rateLimitMiddleware(config: RateLimitConfig = {}) {
  const limits = {
    perMinute: config.perMinute ?? 120,
    perHour: config.perHour ?? 3000,
    perDay: config.perDay ?? 50000,
  }
  const skipRoles = new Set(config.skipRoles ?? ["owner", "admin"])

  return createMiddleware<{
    Variables: RateLimitVariables
  }>(async (c, next) => {
    const userId = c.get("userId")
    const roles = c.get("roles") ?? []

    // Skip rate limiting for privileged roles
    if (roles.some(role => skipRoles.has(role))) {
      c.set("rateLimitRemaining", {
        minute: limits.perMinute,
        hour: limits.perHour,
        day: limits.perDay,
      })
      await next()
      return
    }

    // Generate rate limit key
    const key = userId || c.req.header("x-forwarded-for") || "anonymous"

    // Check all windows
    const minute = incrementAndCheck(store.minute, key, 60000, limits.perMinute)
    const hour = incrementAndCheck(store.hour, key, 3600000, limits.perHour)
    const day = incrementAndCheck(store.day, key, 86400000, limits.perDay)

    // Set remaining counts
    c.set("rateLimitRemaining", {
      minute: minute.remaining,
      hour: hour.remaining,
      day: day.remaining,
    })

    // Add rate limit headers
    c.header("X-RateLimit-Limit-Minute", String(limits.perMinute))
    c.header("X-RateLimit-Remaining-Minute", String(minute.remaining))
    c.header("X-RateLimit-Limit-Hour", String(limits.perHour))
    c.header("X-RateLimit-Remaining-Hour", String(hour.remaining))
    c.header("X-RateLimit-Limit-Day", String(limits.perDay))
    c.header("X-RateLimit-Remaining-Day", String(day.remaining))

    // Check if any limit exceeded
    if (!minute.allowed) {
      c.header("X-RateLimit-Reset", String(minute.resetAt))
      c.header("Retry-After", String(Math.ceil((minute.resetAt - Date.now()) / 1000)))

      logger.warn({
        event: "rate_limit_exceeded",
        key,
        window: "minute",
        limit: limits.perMinute,
      })

      return c.json({
        error: "Rate limit exceeded",
        message: "Too many requests per minute",
        retry_after_seconds: Math.ceil((minute.resetAt - Date.now()) / 1000),
        limits: {
          minute: { limit: limits.perMinute, remaining: 0, reset_at: minute.resetAt },
          hour: { limit: limits.perHour, remaining: hour.remaining, reset_at: hour.resetAt },
          day: { limit: limits.perDay, remaining: day.remaining, reset_at: day.resetAt },
        },
      }, 429)
    }

    if (!hour.allowed) {
      c.header("X-RateLimit-Reset", String(hour.resetAt))
      c.header("Retry-After", String(Math.ceil((hour.resetAt - Date.now()) / 1000)))

      logger.warn({
        event: "rate_limit_exceeded",
        key,
        window: "hour",
        limit: limits.perHour,
      })

      return c.json({
        error: "Rate limit exceeded",
        message: "Too many requests per hour",
        retry_after_seconds: Math.ceil((hour.resetAt - Date.now()) / 1000),
        limits: {
          minute: { limit: limits.perMinute, remaining: minute.remaining, reset_at: minute.resetAt },
          hour: { limit: limits.perHour, remaining: 0, reset_at: hour.resetAt },
          day: { limit: limits.perDay, remaining: day.remaining, reset_at: day.resetAt },
        },
      }, 429)
    }

    if (!day.allowed) {
      c.header("X-RateLimit-Reset", String(day.resetAt))
      c.header("Retry-After", String(Math.ceil((day.resetAt - Date.now()) / 1000)))

      logger.warn({
        event: "rate_limit_exceeded",
        key,
        window: "day",
        limit: limits.perDay,
      })

      return c.json({
        error: "Rate limit exceeded",
        message: "Too many requests per day",
        retry_after_seconds: Math.ceil((day.resetAt - Date.now()) / 1000),
        limits: {
          minute: { limit: limits.perMinute, remaining: minute.remaining, reset_at: minute.resetAt },
          hour: { limit: limits.perHour, remaining: hour.remaining, reset_at: hour.resetAt },
          day: { limit: limits.perDay, remaining: 0, reset_at: day.resetAt },
        },
      }, 429)
    }

    await next()
  })
}

/**
 * Tool-specific rate limiting middleware.
 * Enforces limits defined on individual tools.
 */
export function toolRateLimitMiddleware() {
  return createMiddleware<{
    Variables: RateLimitVariables
  }>(async (c, next) => {
    // Tool-specific rate limiting is handled in the invoke route
    // This middleware provides the infrastructure
    await next()
  })
}

/**
 * Get current rate limit status for a user.
 */
export function getRateLimitStatus(userId: string): {
  minute: { count: number; limit: number; resetAt: number }
  hour: { count: number; limit: number; resetAt: number }
  day: { count: number; limit: number; resetAt: number }
} {
  const now = Date.now()

  const minuteEntry = store.minute.get(userId)
  const hourEntry = store.hour.get(userId)
  const dayEntry = store.day.get(userId)

  return {
    minute: {
      count: minuteEntry && minuteEntry.resetAt > now ? minuteEntry.count : 0,
      limit: 120, // Default, should be configurable
      resetAt: minuteEntry?.resetAt ?? now + 60000,
    },
    hour: {
      count: hourEntry && hourEntry.resetAt > now ? hourEntry.count : 0,
      limit: 3000,
      resetAt: hourEntry?.resetAt ?? now + 3600000,
    },
    day: {
      count: dayEntry && dayEntry.resetAt > now ? dayEntry.count : 0,
      limit: 50000,
      resetAt: dayEntry?.resetAt ?? now + 86400000,
    },
  }
}

/**
 * Reset rate limits for a user (admin only).
 */
export function resetRateLimits(userId: string): void {
  store.minute.delete(userId)
  store.hour.delete(userId)
  store.day.delete(userId)

  logger.info({
    event: "rate_limits_reset",
    user_id: userId,
  })
}
