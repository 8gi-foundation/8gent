/**
 * 8gent Enterprise Toolshed - Tools Operations
 *
 * Enterprise tool registry with versioning and visibility.
 */

import { v } from "convex/values"
import { query, mutation, internalMutation } from "./_generated/server"

// ============================================
// UTILITY FUNCTIONS
// ============================================

function generateUUID(): string {
  return crypto.randomUUID()
}

// ============================================
// LIST TOOLS
// ============================================

/**
 * List tools for a user with filtering.
 */
export const list = query({
  args: {
    user_id: v.string(),
    category: v.optional(v.union(
      v.literal("productivity"),
      v.literal("communication"),
      v.literal("media"),
      v.literal("dev"),
      v.literal("automation"),
      v.literal("data"),
      v.literal("other")
    )),
    type: v.optional(v.union(
      v.literal("builtin"),
      v.literal("community"),
      v.literal("custom"),
      v.literal("api"),
      v.literal("workflow")
    )),
    visibility: v.optional(v.union(
      v.literal("private"),
      v.literal("public"),
      v.literal("unlisted")
    )),
    include_deprecated: v.optional(v.boolean()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20
    const offset = args.offset ?? 0

    // Get user's own tools + public tools from others
    let tools = await ctx.db
      .query("tools")
      .withIndex("by_user", (q) => q.eq("user_id", args.user_id))
      .collect()

    // Also get public tools from other users
    const publicTools = await ctx.db
      .query("tools")
      .withIndex("by_visibility", (q) => q.eq("visibility", "public"))
      .collect()

    // Combine and dedupe
    const allTools = [...tools]
    for (const pt of publicTools) {
      if (!allTools.find((t) => t.tool_id === pt.tool_id)) {
        allTools.push(pt)
      }
    }

    // Apply filters
    let filtered = allTools
    if (args.category) {
      filtered = filtered.filter((t) => t.category === args.category)
    }
    if (args.type) {
      filtered = filtered.filter((t) => t.type === args.type)
    }
    if (args.visibility) {
      filtered = filtered.filter((t) => t.visibility === args.visibility)
    }
    if (!args.include_deprecated) {
      filtered = filtered.filter((t) => !t.deprecated)
    }

    // Paginate
    const total = filtered.length
    const paginated = filtered.slice(offset, offset + limit)

    return {
      tools: paginated.map((t) => ({
        id: t._id,
        tool_id: t.tool_id,
        name: t.name,
        description: t.description,
        short_description: t.short_description,
        type: t.type,
        category: t.category,
        visibility: t.visibility,
        input_schema: JSON.parse(t.input_schema),
        output_schema: t.output_schema ? JSON.parse(t.output_schema) : undefined,
        version: t.version,
        deprecated: t.deprecated,
        user_id: t.user_id,
        invocation_count: t.invocation_count,
        success_count: t.success_count,
        avg_duration_ms: t.avg_duration_ms,
        created_at: t.created_at,
        updated_at: t.updated_at,
      })),
      total,
      has_more: offset + limit < total,
    }
  },
})

/**
 * Get a single tool by ID.
 */
export const get = query({
  args: {
    user_id: v.string(),
    tool_id: v.string(),
  },
  handler: async (ctx, args) => {
    const tool = await ctx.db
      .query("tools")
      .withIndex("by_tool_id", (q) => q.eq("tool_id", args.tool_id))
      .first()

    if (!tool) return null

    // Check access
    if (tool.visibility === "private" && tool.user_id !== args.user_id) {
      return null
    }

    return {
      id: tool._id,
      tool_id: tool.tool_id,
      name: tool.name,
      description: tool.description,
      short_description: tool.short_description,
      type: tool.type,
      category: tool.category,
      visibility: tool.visibility,
      input_schema: JSON.parse(tool.input_schema),
      output_schema: tool.output_schema ? JSON.parse(tool.output_schema) : undefined,
      examples: tool.examples ? JSON.parse(tool.examples) : undefined,
      required_roles: tool.required_roles,
      allowed_agents: tool.allowed_agents,
      denied_agents: tool.denied_agents,
      rate_limit: tool.rate_limit ? JSON.parse(tool.rate_limit) : undefined,
      timeout_ms: tool.timeout_ms,
      version: tool.version,
      deprecated: tool.deprecated,
      deprecation_message: tool.deprecation_message,
      user_id: tool.user_id,
      owner: tool.owner,
      documentation_url: tool.documentation_url,
      source_url: tool.source_url,
      endpoint: tool.endpoint,
      handler: tool.handler,
      invocation_count: tool.invocation_count,
      success_count: tool.success_count,
      error_count: tool.error_count,
      avg_duration_ms: tool.avg_duration_ms,
      created_at: tool.created_at,
      updated_at: tool.updated_at,
      last_invoked_at: tool.last_invoked_at,
    }
  },
})

/**
 * Find tools matching a task description.
 */
export const findForTask = query({
  args: {
    user_id: v.string(),
    task: v.string(),
  },
  handler: async (ctx, args) => {
    // Get accessible tools
    const userTools = await ctx.db
      .query("tools")
      .withIndex("by_user", (q) => q.eq("user_id", args.user_id))
      .filter((q) => q.eq(q.field("deprecated"), false))
      .collect()

    const publicTools = await ctx.db
      .query("tools")
      .withIndex("by_visibility", (q) => q.eq("visibility", "public"))
      .filter((q) => q.eq(q.field("deprecated"), false))
      .collect()

    // Combine and dedupe
    const allTools = [...userTools]
    for (const pt of publicTools) {
      if (!allTools.find((t) => t.tool_id === pt.tool_id)) {
        allTools.push(pt)
      }
    }

    const taskLower = args.task.toLowerCase()
    const keywords = taskLower.split(/\s+/)

    // Score each tool based on keyword matches
    const scored = allTools.map((tool) => {
      const searchText = `${tool.name} ${tool.description}`.toLowerCase()
      let score = 0

      for (const keyword of keywords) {
        if (searchText.includes(keyword)) {
          score += 1
        }
        // Bonus for exact name match
        if (tool.name.toLowerCase() === keyword) {
          score += 5
        }
      }

      return { tool, score }
    })

    // Return top matches (score > 0)
    return scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((s) => ({
        tool_id: s.tool.tool_id,
        name: s.tool.name,
        description: s.tool.description,
        type: s.tool.type,
        category: s.tool.category,
        visibility: s.tool.visibility,
        input_schema: JSON.parse(s.tool.input_schema),
        relevance: s.score,
      }))
  },
})

// ============================================
// CREATE TOOL
// ============================================

/**
 * Create a new tool.
 */
export const create = mutation({
  args: {
    user_id: v.string(),
    name: v.string(),
    description: v.string(),
    short_description: v.optional(v.string()),
    type: v.union(
      v.literal("builtin"),
      v.literal("community"),
      v.literal("custom"),
      v.literal("api"),
      v.literal("workflow")
    ),
    category: v.union(
      v.literal("productivity"),
      v.literal("communication"),
      v.literal("media"),
      v.literal("dev"),
      v.literal("automation"),
      v.literal("data"),
      v.literal("other")
    ),
    visibility: v.union(
      v.literal("private"),
      v.literal("public"),
      v.literal("unlisted")
    ),
    input_schema: v.string(),
    output_schema: v.optional(v.string()),
    examples: v.optional(v.string()),
    required_roles: v.array(v.union(
      v.literal("owner"),
      v.literal("admin"),
      v.literal("collaborator"),
      v.literal("viewer"),
      v.literal("agent")
    )),
    allowed_agents: v.optional(v.array(v.string())),
    denied_agents: v.optional(v.array(v.string())),
    rate_limit: v.optional(v.string()),
    timeout_ms: v.number(),
    version: v.string(),
    owner: v.string(),
    documentation_url: v.optional(v.string()),
    source_url: v.optional(v.string()),
    endpoint: v.optional(v.string()),
    handler: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const toolId = generateUUID()
    const now = Date.now()

    // Check for duplicate name
    const existing = await ctx.db
      .query("tools")
      .withIndex("by_user_name", (q) =>
        q.eq("user_id", args.user_id).eq("name", args.name)
      )
      .first()

    if (existing) {
      throw new Error(`Tool with name '${args.name}' already exists`)
    }

    await ctx.db.insert("tools", {
      tool_id: toolId,
      name: args.name,
      slug: args.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: args.description,
      short_description: args.short_description,
      type: args.type,
      category: args.category,
      visibility: args.visibility,
      input_schema: args.input_schema,
      output_schema: args.output_schema,
      examples: args.examples,
      required_roles: args.required_roles,
      allowed_agents: args.allowed_agents,
      denied_agents: args.denied_agents,
      user_id: args.user_id,
      rate_limit: args.rate_limit,
      timeout_ms: args.timeout_ms,
      version: args.version,
      deprecated: false,
      owner: args.owner,
      documentation_url: args.documentation_url,
      source_url: args.source_url,
      endpoint: args.endpoint,
      handler: args.handler,
      created_at: now,
      updated_at: now,
      invocation_count: 0,
      success_count: 0,
      error_count: 0,
      avg_duration_ms: 0,
    })

    // Create initial version snapshot
    const versionId = generateUUID()
    await ctx.db.insert("tool_versions", {
      version_id: versionId,
      tool_id: toolId,
      version: args.version,
      tool_snapshot: JSON.stringify({
        name: args.name,
        description: args.description,
        input_schema: args.input_schema,
        output_schema: args.output_schema,
        examples: args.examples,
        required_roles: args.required_roles,
        timeout_ms: args.timeout_ms,
        version: args.version,
      }),
      change_type: "created",
      change_summary: "Initial version",
      changed_by_id: args.user_id,
      changed_by_type: "user",
      created_at: now,
    })

    return { tool_id: toolId, version: args.version }
  },
})

// ============================================
// UPDATE TOOL
// ============================================

/**
 * Update an existing tool.
 */
export const update = mutation({
  args: {
    user_id: v.string(),
    tool_id: v.string(),
    updates: v.object({
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      short_description: v.optional(v.string()),
      category: v.optional(v.union(
        v.literal("productivity"),
        v.literal("communication"),
        v.literal("media"),
        v.literal("dev"),
        v.literal("automation"),
        v.literal("data"),
        v.literal("other")
      )),
      visibility: v.optional(v.union(
        v.literal("private"),
        v.literal("public"),
        v.literal("unlisted")
      )),
      input_schema: v.optional(v.string()),
      output_schema: v.optional(v.string()),
      examples: v.optional(v.string()),
      required_roles: v.optional(v.array(v.union(
        v.literal("owner"),
        v.literal("admin"),
        v.literal("collaborator"),
        v.literal("viewer"),
        v.literal("agent")
      ))),
      allowed_agents: v.optional(v.array(v.string())),
      denied_agents: v.optional(v.array(v.string())),
      rate_limit: v.optional(v.string()),
      timeout_ms: v.optional(v.number()),
      deprecated: v.optional(v.boolean()),
      deprecation_message: v.optional(v.string()),
      documentation_url: v.optional(v.string()),
      source_url: v.optional(v.string()),
      endpoint: v.optional(v.string()),
      handler: v.optional(v.string()),
    }),
    change_summary: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const tool = await ctx.db
      .query("tools")
      .withIndex("by_tool_id", (q) => q.eq("tool_id", args.tool_id))
      .first()

    if (!tool) {
      throw new Error("Tool not found")
    }

    if (tool.user_id !== args.user_id) {
      throw new Error("Access denied: You do not own this tool")
    }

    const now = Date.now()

    // Track changed fields
    const changedFields: string[] = []
    const patchData: Record<string, unknown> = { updated_at: now }

    for (const [key, value] of Object.entries(args.updates)) {
      if (value !== undefined && (tool as any)[key] !== value) {
        patchData[key] = value
        changedFields.push(key)
      }
    }

    if (changedFields.length === 0) {
      return { tool_id: args.tool_id, version: tool.version, changed: false }
    }

    // Bump version
    const versionParts = tool.version.split(".").map(Number)
    const newVersion = `${versionParts[0]}.${versionParts[1]}.${versionParts[2] + 1}`
    patchData.version = newVersion

    await ctx.db.patch(tool._id, patchData)

    // Create version snapshot
    const versionId = generateUUID()
    await ctx.db.insert("tool_versions", {
      version_id: versionId,
      tool_id: args.tool_id,
      version: newVersion,
      tool_snapshot: JSON.stringify({
        ...tool,
        ...args.updates,
        version: newVersion,
        updated_at: now,
      }),
      change_type: args.updates.deprecated ? "deprecated" : "updated",
      change_summary: args.change_summary || `Updated: ${changedFields.join(", ")}`,
      changed_fields: changedFields,
      changed_by_id: args.user_id,
      changed_by_type: "user",
      created_at: now,
    })

    return { tool_id: args.tool_id, version: newVersion, changed: true, changed_fields: changedFields }
  },
})

// ============================================
// DELETE TOOL
// ============================================

/**
 * Delete a tool.
 */
export const remove = mutation({
  args: {
    user_id: v.string(),
    tool_id: v.string(),
  },
  handler: async (ctx, args) => {
    const tool = await ctx.db
      .query("tools")
      .withIndex("by_tool_id", (q) => q.eq("tool_id", args.tool_id))
      .first()

    if (!tool) {
      throw new Error("Tool not found")
    }

    if (tool.user_id !== args.user_id) {
      throw new Error("Access denied: You do not own this tool")
    }

    await ctx.db.delete(tool._id)
  },
})

// ============================================
// TOGGLE TOOL
// ============================================

/**
 * Toggle tool enabled state via config.
 */
export const toggle = mutation({
  args: {
    user_id: v.string(),
    tool_id: v.string(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const config = await ctx.db
      .query("user_tool_config")
      .withIndex("by_user_tool", (q) =>
        q.eq("user_id", args.user_id).eq("tool_id", args.tool_id)
      )
      .first()

    const now = Date.now()
    const newEnabled = config ? !config.enabled : false

    if (config) {
      await ctx.db.patch(config._id, {
        enabled: newEnabled,
        [newEnabled ? "enabled_at" : "disabled_at"]: now,
        disabled_reason: newEnabled ? undefined : args.reason,
        updated_at: now,
      })
    } else {
      await ctx.db.insert("user_tool_config", {
        config_id: generateUUID(),
        user_id: args.user_id,
        tool_id: args.tool_id,
        enabled: false,
        disabled_at: now,
        disabled_reason: args.reason,
        configured_by: args.user_id,
        created_at: now,
        updated_at: now,
      })
    }

    return { enabled: newEnabled }
  },
})

// ============================================
// UPDATE STATS
// ============================================

/**
 * Update tool invocation stats.
 */
export const updateStats = internalMutation({
  args: {
    user_id: v.string(),
    tool_id: v.string(),
    success: v.boolean(),
    duration_ms: v.number(),
  },
  handler: async (ctx, args) => {
    const tool = await ctx.db
      .query("tools")
      .withIndex("by_tool_id", (q) => q.eq("tool_id", args.tool_id))
      .first()

    if (!tool) return

    const newCount = tool.invocation_count + 1
    const newSuccess = tool.success_count + (args.success ? 1 : 0)
    const newError = tool.error_count + (args.success ? 0 : 1)
    const newAvg = ((tool.avg_duration_ms * tool.invocation_count) + args.duration_ms) / newCount

    await ctx.db.patch(tool._id, {
      invocation_count: newCount,
      success_count: newSuccess,
      error_count: newError,
      avg_duration_ms: newAvg,
      last_invoked_at: Date.now(),
    })
  },
})

// ============================================
// SEED BUILTIN TOOLS
// ============================================

/**
 * Seed builtin tools for a user.
 */
export const seedBuiltins = mutation({
  args: {
    user_id: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("tools")
      .withIndex("by_user_type", (q) =>
        q.eq("user_id", args.user_id).eq("type", "builtin")
      )
      .first()

    if (existing) {
      return { seeded: false, message: "Builtin tools already exist" }
    }

    const now = Date.now()

    const builtinTools = [
      {
        name: "web-search",
        description: "Search the web for information, articles, and answers",
        short_description: "Web search",
        category: "productivity" as const,
        input_schema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Search query" },
            limit: { type: "number", description: "Max results", default: 5 },
          },
          required: ["query"],
        },
      },
      {
        name: "calculator",
        description: "Perform mathematical calculations and conversions",
        short_description: "Calculator",
        category: "productivity" as const,
        input_schema: {
          type: "object",
          properties: {
            expression: { type: "string", description: "Math expression to evaluate" },
          },
          required: ["expression"],
        },
      },
      {
        name: "file-reader",
        description: "Read and extract content from files (PDF, text, docs)",
        short_description: "File reader",
        category: "productivity" as const,
        input_schema: {
          type: "object",
          properties: {
            url: { type: "string", description: "File URL or path" },
            format: { type: "string", description: "Output format", default: "text" },
          },
          required: ["url"],
        },
      },
      {
        name: "image-generator",
        description: "Generate images from text descriptions using AI",
        short_description: "Image generator",
        category: "media" as const,
        input_schema: {
          type: "object",
          properties: {
            prompt: { type: "string", description: "Image description" },
            style: { type: "string", description: "Art style", default: "realistic" },
            size: { type: "string", description: "Image dimensions", default: "1024x1024" },
          },
          required: ["prompt"],
        },
      },
      {
        name: "summarizer",
        description: "Summarize long text, articles, or documents into key points",
        short_description: "Text summarizer",
        category: "productivity" as const,
        input_schema: {
          type: "object",
          properties: {
            text: { type: "string", description: "Text to summarize" },
            length: { type: "string", description: "Summary length: short, medium, long", default: "medium" },
          },
          required: ["text"],
        },
      },
    ]

    let count = 0
    for (const tool of builtinTools) {
      const toolId = generateUUID()
      await ctx.db.insert("tools", {
        tool_id: toolId,
        name: tool.name,
        slug: tool.name,
        description: tool.description,
        short_description: tool.short_description,
        type: "builtin",
        category: tool.category,
        visibility: "public",
        input_schema: JSON.stringify(tool.input_schema),
        required_roles: ["owner", "collaborator", "agent"],
        user_id: args.user_id,
        rate_limit: JSON.stringify({
          requests_per_minute: 60,
          requests_per_hour: 1000,
          requests_per_day: 10000,
        }),
        timeout_ms: 30000,
        version: "1.0.0",
        deprecated: false,
        owner: "8gent",
        created_at: now,
        updated_at: now,
        invocation_count: 0,
        success_count: 0,
        error_count: 0,
        avg_duration_ms: 0,
      })
      count++
    }

    return { seeded: true, count }
  },
})
