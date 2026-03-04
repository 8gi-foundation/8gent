/**
 * 8gent Enterprise Toolshed - Tools Routes
 *
 * CRUD operations for enterprise tools with versioning.
 */

import { Hono } from "hono"
import { ConvexHttpClient } from "convex/browser"
import { api } from "../../convex/_generated/api"
import type { AuthVariables } from "../middleware/auth"
import type { AuditVariables } from "../middleware/audit"
import { logger } from "../lib/logger"

type Variables = AuthVariables & AuditVariables

const tools = new Hono<{ Variables: Variables }>()

// Get Convex client
const getConvex = () => {
  const url = process.env.CONVEX_URL
  if (!url) throw new Error("CONVEX_URL not set")
  return new ConvexHttpClient(url)
}

// ============================================
// LIST TOOLS
// ============================================

/**
 * GET /api/:user_id/tools
 * List all tools for a user with filtering.
 */
tools.get("/:user_id/tools", async (c) => {
  const convex = getConvex()
  const userId = c.req.param("user_id")

  const category = c.req.query("category")
  const type = c.req.query("type")
  const visibility = c.req.query("visibility")
  const includeDeprecated = c.req.query("include_deprecated") === "true"
  const limit = parseInt(c.req.query("limit") ?? "20", 10)
  const offset = parseInt(c.req.query("offset") ?? "0", 10)

  try {
    const result = await convex.query(api.tools.list, {
      user_id: userId,
      category: category as any,
      type: type as any,
      visibility: visibility as any,
      include_deprecated: includeDeprecated,
      limit,
      offset,
    })

    return c.json({
      success: true,
      tools: result.tools,
      total: result.total,
      has_more: result.has_more,
    })
  } catch (error) {
    logger.error({
      event: "list_tools_error",
      user_id: userId,
      error: String(error),
    })
    return c.json({ success: false, error: String(error) }, 500)
  }
})

// ============================================
// GET SINGLE TOOL
// ============================================

/**
 * GET /api/:user_id/tools/:tool_id
 * Get a single tool by ID.
 */
tools.get("/:user_id/tools/:tool_id", async (c) => {
  const convex = getConvex()
  const userId = c.req.param("user_id")
  const toolId = c.req.param("tool_id")

  try {
    const tool = await convex.query(api.tools.get, {
      user_id: userId,
      tool_id: toolId,
    })

    if (!tool) {
      return c.json({ success: false, error: "Tool not found" }, 404)
    }

    return c.json({ success: true, tool })
  } catch (error) {
    logger.error({
      event: "get_tool_error",
      user_id: userId,
      tool_id: toolId,
      error: String(error),
    })
    return c.json({ success: false, error: String(error) }, 500)
  }
})

// ============================================
// QUERY TOOLS FOR TASK
// ============================================

/**
 * GET /api/:user_id/query
 * Find tools matching a task description.
 */
tools.get("/:user_id/query", async (c) => {
  const convex = getConvex()
  const userId = c.req.param("user_id")
  const task = c.req.query("task")

  if (!task) {
    return c.json({ success: false, error: "task parameter required" }, 400)
  }

  try {
    const matches = await convex.query(api.tools.findForTask, {
      user_id: userId,
      task,
    })

    return c.json({
      success: true,
      task,
      matches,
      best_match: matches[0] || null,
    })
  } catch (error) {
    logger.error({
      event: "query_tools_error",
      user_id: userId,
      task,
      error: String(error),
    })
    return c.json({ success: false, error: String(error) }, 500)
  }
})

// ============================================
// CREATE TOOL
// ============================================

/**
 * POST /api/:user_id/tools
 * Create a new tool.
 */
tools.post("/:user_id/tools", async (c) => {
  const convex = getConvex()
  const userId = c.req.param("user_id")
  const context = c.get("context")

  try {
    const body = await c.req.json()

    // Validate required fields
    if (!body.name || !body.description || !body.input_schema) {
      return c.json({
        success: false,
        error: "Missing required fields: name, description, input_schema",
      }, 400)
    }

    const result = await convex.mutation(api.tools.create, {
      user_id: userId,
      name: body.name,
      description: body.description,
      short_description: body.short_description,
      type: body.type || "custom",
      category: body.category || "other",
      visibility: body.visibility || "private",
      input_schema: JSON.stringify(body.input_schema),
      output_schema: body.output_schema ? JSON.stringify(body.output_schema) : undefined,
      examples: body.examples ? JSON.stringify(body.examples) : undefined,
      required_roles: body.required_roles || ["owner"],
      allowed_agents: body.allowed_agents,
      denied_agents: body.denied_agents,
      rate_limit: body.rate_limit ? JSON.stringify(body.rate_limit) : undefined,
      timeout_ms: body.timeout_ms || 30000,
      version: body.version || "1.0.0",
      owner: body.owner || userId,
      documentation_url: body.documentation_url,
      source_url: body.source_url,
      endpoint: body.endpoint,
      handler: body.handler,
    })

    logger.info({
      event: "tool_created",
      user_id: userId,
      tool_id: result.tool_id,
      tool_name: body.name,
    })

    return c.json({ success: true, ...result }, 201)
  } catch (error) {
    logger.error({
      event: "create_tool_error",
      user_id: userId,
      error: String(error),
    })
    return c.json({ success: false, error: String(error) }, 500)
  }
})

// ============================================
// UPDATE TOOL
// ============================================

/**
 * PATCH /api/:user_id/tools/:tool_id
 * Update an existing tool.
 */
tools.patch("/:user_id/tools/:tool_id", async (c) => {
  const convex = getConvex()
  const userId = c.req.param("user_id")
  const toolId = c.req.param("tool_id")

  try {
    const body = await c.req.json()

    const result = await convex.mutation(api.tools.update, {
      user_id: userId,
      tool_id: toolId,
      updates: {
        name: body.name,
        description: body.description,
        short_description: body.short_description,
        category: body.category,
        visibility: body.visibility,
        input_schema: body.input_schema ? JSON.stringify(body.input_schema) : undefined,
        output_schema: body.output_schema ? JSON.stringify(body.output_schema) : undefined,
        examples: body.examples ? JSON.stringify(body.examples) : undefined,
        required_roles: body.required_roles,
        allowed_agents: body.allowed_agents,
        denied_agents: body.denied_agents,
        rate_limit: body.rate_limit ? JSON.stringify(body.rate_limit) : undefined,
        timeout_ms: body.timeout_ms,
        deprecated: body.deprecated,
        deprecation_message: body.deprecation_message,
        documentation_url: body.documentation_url,
        source_url: body.source_url,
        endpoint: body.endpoint,
        handler: body.handler,
      },
      change_summary: body.change_summary,
    })

    logger.info({
      event: "tool_updated",
      user_id: userId,
      tool_id: toolId,
      new_version: result.version,
    })

    return c.json({ success: true, ...result })
  } catch (error) {
    logger.error({
      event: "update_tool_error",
      user_id: userId,
      tool_id: toolId,
      error: String(error),
    })
    return c.json({ success: false, error: String(error) }, 500)
  }
})

// ============================================
// DELETE TOOL
// ============================================

/**
 * DELETE /api/:user_id/tools/:tool_id
 * Delete a tool.
 */
tools.delete("/:user_id/tools/:tool_id", async (c) => {
  const convex = getConvex()
  const userId = c.req.param("user_id")
  const toolId = c.req.param("tool_id")

  try {
    await convex.mutation(api.tools.remove, {
      user_id: userId,
      tool_id: toolId,
    })

    logger.info({
      event: "tool_deleted",
      user_id: userId,
      tool_id: toolId,
    })

    return c.json({ success: true })
  } catch (error) {
    logger.error({
      event: "delete_tool_error",
      user_id: userId,
      tool_id: toolId,
      error: String(error),
    })
    return c.json({ success: false, error: String(error) }, 500)
  }
})

// ============================================
// TOGGLE TOOL
// ============================================

/**
 * PATCH /api/:user_id/tools/:tool_id/toggle
 * Toggle tool enabled state.
 */
tools.patch("/:user_id/tools/:tool_id/toggle", async (c) => {
  const convex = getConvex()
  const userId = c.req.param("user_id")
  const toolId = c.req.param("tool_id")

  try {
    const body = await c.req.json().catch(() => ({}))
    const reason = body.reason

    const result = await convex.mutation(api.tools.toggle, {
      user_id: userId,
      tool_id: toolId,
      reason,
    })

    return c.json({ success: true, enabled: result.enabled })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

// ============================================
// VERSION HISTORY
// ============================================

/**
 * GET /api/:user_id/tools/:tool_id/versions
 * Get version history for a tool.
 */
tools.get("/:user_id/tools/:tool_id/versions", async (c) => {
  const convex = getConvex()
  const userId = c.req.param("user_id")
  const toolId = c.req.param("tool_id")
  const limit = parseInt(c.req.query("limit") ?? "50", 10)

  try {
    const versions = await convex.query(api.versions.getToolVersionHistory, {
      user_id: userId,
      tool_id: toolId,
      limit,
    })

    return c.json({ success: true, versions })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

/**
 * GET /api/:user_id/tools/:tool_id/versions/:version
 * Get a specific version of a tool.
 */
tools.get("/:user_id/tools/:tool_id/versions/:version", async (c) => {
  const convex = getConvex()
  const userId = c.req.param("user_id")
  const toolId = c.req.param("tool_id")
  const version = c.req.param("version")

  try {
    const result = await convex.query(api.versions.getToolVersion, {
      user_id: userId,
      tool_id: toolId,
      version,
    })

    if (!result) {
      return c.json({ success: false, error: "Version not found" }, 404)
    }

    return c.json({ success: true, ...result })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

/**
 * POST /api/:user_id/tools/:tool_id/rollback
 * Rollback a tool to a specific version.
 */
tools.post("/:user_id/tools/:tool_id/rollback", async (c) => {
  const convex = getConvex()
  const userId = c.req.param("user_id")
  const toolId = c.req.param("tool_id")

  try {
    const body = await c.req.json()
    if (!body.target_version) {
      return c.json({ success: false, error: "target_version required" }, 400)
    }

    const result = await convex.mutation(api.versions.rollbackToVersion, {
      user_id: userId,
      tool_id: toolId,
      target_version: body.target_version,
    })

    logger.info({
      event: "tool_rollback",
      user_id: userId,
      tool_id: toolId,
      restored_from: result.restored_from,
      new_version: result.new_version,
    })

    return c.json({ success: true, ...result })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

// ============================================
// SEED BUILTIN TOOLS
// ============================================

/**
 * POST /api/:user_id/tools/seed
 * Seed builtin tools for a user.
 */
tools.post("/:user_id/seed", async (c) => {
  const convex = getConvex()
  const userId = c.req.param("user_id")

  try {
    const result = await convex.mutation(api.tools.seedBuiltins, {
      user_id: userId,
    })

    return c.json({ success: true, ...result })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

export default tools
