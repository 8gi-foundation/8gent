/**
 * 8gent Enterprise Toolshed - Invoke Routes
 *
 * Tool invocation with rate limiting and audit logging.
 */

import { Hono } from "hono"
import { ConvexHttpClient } from "convex/browser"
import { api } from "../../convex/_generated/api"
import type { AuthVariables } from "../middleware/auth"
import type { AuditVariables } from "../middleware/audit"
import { logToolInvocation, logToolCompletion, logRateLimitEvent } from "../middleware/audit"
import { logger } from "../lib/logger"

type Variables = AuthVariables & AuditVariables

const invoke = new Hono<{ Variables: Variables }>()

// Get Convex client
const getConvex = () => {
  const url = process.env.CONVEX_URL
  if (!url) throw new Error("CONVEX_URL not set")
  return new ConvexHttpClient(url)
}

// ============================================
// INVOKE TOOL
// ============================================

/**
 * POST /api/:user_id/invoke/:tool_id
 * Invoke a tool with input validation and rate limiting.
 */
invoke.post("/:user_id/invoke/:tool_id", async (c) => {
  const convex = getConvex()
  const userId = c.req.param("user_id")
  const toolId = c.req.param("tool_id")
  const requestId = c.get("requestId")
  const startTime = Date.now()
  const context = c.get("context")

  try {
    // Parse request body
    const body = await c.req.json()
    const input = body.input || {}
    const timeout = body.timeout_ms

    // Get the tool
    const tool = await convex.query(api.tools.get, {
      user_id: userId,
      tool_id: toolId,
    })

    if (!tool) {
      return c.json({ success: false, error: "Tool not found" }, 404)
    }

    // Check if tool is enabled
    const config = await convex.query(api.config.getUserToolConfig, {
      user_id: userId,
      tool_id: toolId,
    })

    if (config && !config.enabled) {
      return c.json({
        success: false,
        error: "Tool is disabled",
        disabled_reason: config.disabled_reason,
      }, 403)
    }

    // Check rate limits
    const rateLimit = tool.rate_limit ? JSON.parse(tool.rate_limit) : {
      requests_per_minute: 60,
      requests_per_hour: 1000,
      requests_per_day: 10000,
    }

    const rateLimitResult = await convex.mutation(api.config.checkRateLimit, {
      user_id: userId,
      tool_id: toolId,
      limits: rateLimit,
    })

    if (!rateLimitResult.allowed) {
      logRateLimitEvent(requestId, {
        user_id: userId,
        tool_id: toolId,
        limit_type: rateLimitResult.exceeded?.minute ? "minute" :
                    rateLimitResult.exceeded?.hour ? "hour" : "day",
        current_count: rateLimitResult.current.minute,
        limit: rateLimit.requests_per_minute,
        exceeded: true,
      })

      // Set rate limit headers
      c.header("x-ratelimit-remaining", "0")
      c.header("x-ratelimit-reset", String(
        rateLimitResult.exceeded?.minute ? Date.now() + 60000 :
        rateLimitResult.exceeded?.hour ? Date.now() + 3600000 :
        Date.now() + 86400000
      ))

      return c.json({
        success: false,
        error: "Rate limit exceeded",
        current: rateLimitResult.current,
        limits: rateLimitResult.limits,
        retry_after: rateLimitResult.exceeded?.minute ? 60 :
                     rateLimitResult.exceeded?.hour ? 3600 : 86400,
      }, 429)
    }

    // Log invocation start
    logToolInvocation(requestId, {
      user_id: userId,
      agent_id: context.agent_id,
      tool_id: toolId,
      tool_name: tool.name,
      tool_version: tool.version,
      input,
      source: context.source,
    })

    // Execute the tool
    const result = await executeToolProxy(tool, input, timeout || tool.timeout_ms)
    const duration = Date.now() - startTime

    // Log completion
    logToolCompletion(requestId, {
      user_id: userId,
      tool_id: toolId,
      tool_name: tool.name,
      success: result.success,
      duration_ms: duration,
      error_code: result.error_code,
      error_message: result.error_message,
    })

    // Record audit entry
    await convex.mutation(api.audit.logToolInvocation, {
      user_id: userId,
      session_id: context.session_id,
      thread_id: context.thread_id,
      correlation_id: context.correlation_id,
      actor_type: context.source === "agent" ? "agent" : "user",
      actor_id: context.agent_id,
      actor_name: "Agent",
      action: result.success ? "tool.completed" : "tool.failed",
      action_category: "tool_invocation",
      tool_id: toolId,
      tool_name: tool.name,
      tool_version: tool.version,
      input_data: input,
      output_data: result.data,
      success: result.success,
      error_code: result.error_code,
      error_message: result.error_message,
      duration_ms: duration,
      source: context.source,
      ip_address: context.ip_address,
      user_agent: context.user_agent,
    })

    // Record analytics
    await convex.mutation(api.config.recordUsageAnalytics, {
      user_id: userId,
      tool_id: toolId,
      success: result.success,
      duration_ms: duration,
      error_code: result.error_code,
    })

    // Update tool stats
    await convex.mutation(api.tools.updateStats, {
      user_id: userId,
      tool_id: toolId,
      success: result.success,
      duration_ms: duration,
    })

    return c.json({
      success: result.success,
      invocation_id: requestId,
      tool_id: toolId,
      tool_name: tool.name,
      tool_version: tool.version,
      result: result.data,
      error: result.success ? undefined : {
        code: result.error_code,
        message: result.error_message,
      },
      duration_ms: duration,
      rate_limit: {
        remaining: {
          minute: rateLimit.requests_per_minute - rateLimitResult.current.minute,
          hour: rateLimit.requests_per_hour - rateLimitResult.current.hour,
          day: rateLimit.requests_per_day - rateLimitResult.current.day,
        },
      },
    })
  } catch (error) {
    const duration = Date.now() - startTime

    logger.error({
      event: "invoke_tool_error",
      request_id: requestId,
      user_id: userId,
      tool_id: toolId,
      error: String(error),
      duration_ms: duration,
    })

    return c.json({
      success: false,
      error: String(error),
      invocation_id: requestId,
      duration_ms: duration,
    }, 500)
  }
})

// ============================================
// TOOL EXECUTION PROXY
// ============================================

interface ExecutionResult {
  success: boolean
  data: unknown
  error_code?: string
  error_message?: string
}

async function executeToolProxy(
  tool: { name: string; endpoint?: string; handler?: string },
  input: Record<string, unknown>,
  timeoutMs: number
): Promise<ExecutionResult> {
  const startTime = Date.now()

  // If tool has an endpoint, proxy to it
  if (tool.endpoint) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

      const response = await fetch(tool.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          data: null,
          error_code: `HTTP_${response.status}`,
          error_message: data.error || data.message || "Request failed",
        }
      }

      return { success: true, data }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return {
          success: false,
          data: null,
          error_code: "TIMEOUT",
          error_message: `Tool execution timed out after ${timeoutMs}ms`,
        }
      }
      return {
        success: false,
        data: null,
        error_code: "FETCH_ERROR",
        error_message: String(error),
      }
    }
  }

  // Built-in tool execution
  switch (tool.name) {
    case "calculator":
      return executeCalculator(input)

    case "summarizer":
      return executeSummarizer(input)

    case "web-search":
      return executeWebSearch(input)

    case "image-generator":
      return executeImageGenerator(input)

    case "file-reader":
      return executeFileReader(input)

    default:
      return {
        success: true,
        data: {
          input,
          note: `Tool '${tool.name}' executed with provided input`,
          executed_at: Date.now(),
        },
      }
  }
}

function executeCalculator(input: Record<string, unknown>): ExecutionResult {
  try {
    const expression = String(input.expression || "")
    const sanitized = expression.replace(/[^0-9+\-*/().%\s]/g, "")
    const result = Function(`"use strict"; return (${sanitized})`)()
    return {
      success: true,
      data: { expression, result },
    }
  } catch (error) {
    return {
      success: false,
      data: null,
      error_code: "INVALID_EXPRESSION",
      error_message: "Invalid mathematical expression",
    }
  }
}

function executeSummarizer(input: Record<string, unknown>): ExecutionResult {
  const text = String(input.text || "")
  const length = String(input.length || "medium")

  const wordCounts = { short: 25, medium: 50, long: 100 }
  const maxWords = wordCounts[length as keyof typeof wordCounts] || 50

  const words = text.split(/\s+/)
  const summary = words.slice(0, maxWords).join(" ")

  return {
    success: true,
    data: {
      summary: summary + (words.length > maxWords ? "..." : ""),
      original_length: text.length,
      original_words: words.length,
      summary_words: Math.min(words.length, maxWords),
    },
  }
}

function executeWebSearch(input: Record<string, unknown>): ExecutionResult {
  const query = String(input.query || "")
  const limit = Number(input.limit) || 5

  // Placeholder - integrate with actual search API
  return {
    success: true,
    data: {
      query,
      results: Array.from({ length: Math.min(limit, 5) }, (_, i) => ({
        title: `Search result ${i + 1} for "${query}"`,
        url: `https://example.com/result-${i + 1}`,
        snippet: `This is a placeholder result for the query: ${query}`,
      })),
      note: "Placeholder - integrate with search API (Brave, Tavily, etc.)",
    },
  }
}

function executeImageGenerator(input: Record<string, unknown>): ExecutionResult {
  const prompt = String(input.prompt || "")
  const style = String(input.style || "realistic")
  const size = String(input.size || "1024x1024")

  // Placeholder - integrate with actual image API
  return {
    success: true,
    data: {
      prompt,
      style,
      size,
      image_url: `https://placeholder.co/${size}`,
      note: "Placeholder - integrate with image generation API (DALL-E, Stable Diffusion, etc.)",
    },
  }
}

function executeFileReader(input: Record<string, unknown>): ExecutionResult {
  const url = String(input.url || "")
  const format = String(input.format || "text")

  // Placeholder - integrate with actual file reading
  return {
    success: true,
    data: {
      url,
      format,
      content: "File content placeholder",
      note: "Placeholder - integrate with file reading service",
    },
  }
}

export default invoke
