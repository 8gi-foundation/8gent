/**
 * 8gent Enterprise Toolshed - Version Management
 *
 * Tool versioning for change tracking and rollback capability.
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
// VERSION MUTATIONS
// ============================================

/**
 * Create a version snapshot for a tool.
 */
export const createVersionSnapshot = internalMutation({
  args: {
    tool_id: v.string(),
    version: v.string(),
    tool_snapshot: v.string(),
    change_type: v.union(
      v.literal("created"),
      v.literal("updated"),
      v.literal("deprecated"),
      v.literal("restored")
    ),
    change_summary: v.optional(v.string()),
    changed_fields: v.optional(v.array(v.string())),
    changed_by_id: v.string(),
    changed_by_type: v.union(
      v.literal("user"),
      v.literal("agent"),
      v.literal("system")
    ),
  },
  handler: async (ctx, args) => {
    const versionId = generateUUID()
    const now = Date.now()

    await ctx.db.insert("tool_versions", {
      version_id: versionId,
      tool_id: args.tool_id,
      version: args.version,
      tool_snapshot: args.tool_snapshot,
      change_type: args.change_type,
      change_summary: args.change_summary,
      changed_fields: args.changed_fields,
      changed_by_id: args.changed_by_id,
      changed_by_type: args.changed_by_type,
      created_at: now,
    })

    return { version_id: versionId }
  },
})

// ============================================
// VERSION QUERIES
// ============================================

/**
 * Get version history for a tool.
 */
export const getToolVersionHistory = query({
  args: {
    user_id: v.string(),
    tool_id: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50

    const versions = await ctx.db
      .query("tool_versions")
      .withIndex("by_tool_created", (q) => q.eq("tool_id", args.tool_id))
      .order("desc")
      .take(limit)

    return versions.map((v) => ({
      version_id: v.version_id,
      tool_id: v.tool_id,
      version: v.version,
      change_type: v.change_type,
      change_summary: v.change_summary,
      changed_fields: v.changed_fields,
      changed_by_id: v.changed_by_id,
      changed_by_type: v.changed_by_type,
      created_at: v.created_at,
    }))
  },
})

/**
 * Get a specific version of a tool.
 */
export const getToolVersion = query({
  args: {
    user_id: v.string(),
    tool_id: v.string(),
    version: v.string(),
  },
  handler: async (ctx, args) => {
    const versionRecord = await ctx.db
      .query("tool_versions")
      .withIndex("by_tool_version", (q) =>
        q.eq("tool_id", args.tool_id).eq("version", args.version)
      )
      .first()

    if (!versionRecord) {
      return null
    }

    return {
      ...versionRecord,
      tool_snapshot: JSON.parse(versionRecord.tool_snapshot),
    }
  },
})

/**
 * Compare two versions of a tool.
 */
export const compareToolVersions = query({
  args: {
    user_id: v.string(),
    tool_id: v.string(),
    version_a: v.string(),
    version_b: v.string(),
  },
  handler: async (ctx, args) => {
    const versionA = await ctx.db
      .query("tool_versions")
      .withIndex("by_tool_version", (q) =>
        q.eq("tool_id", args.tool_id).eq("version", args.version_a)
      )
      .first()

    const versionB = await ctx.db
      .query("tool_versions")
      .withIndex("by_tool_version", (q) =>
        q.eq("tool_id", args.tool_id).eq("version", args.version_b)
      )
      .first()

    if (!versionA || !versionB) {
      return null
    }

    const snapshotA = JSON.parse(versionA.tool_snapshot)
    const snapshotB = JSON.parse(versionB.tool_snapshot)

    // Find differences
    const differences: Array<{
      field: string
      old_value: unknown
      new_value: unknown
    }> = []

    const allKeys = new Set([...Object.keys(snapshotA), ...Object.keys(snapshotB)])

    for (const key of allKeys) {
      const oldVal = snapshotA[key]
      const newVal = snapshotB[key]

      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        differences.push({
          field: key,
          old_value: oldVal,
          new_value: newVal,
        })
      }
    }

    return {
      tool_id: args.tool_id,
      version_a: {
        version: args.version_a,
        created_at: versionA.created_at,
        changed_by_id: versionA.changed_by_id,
      },
      version_b: {
        version: args.version_b,
        created_at: versionB.created_at,
        changed_by_id: versionB.changed_by_id,
      },
      differences,
    }
  },
})

/**
 * Get latest version info for multiple tools.
 */
export const getLatestVersions = query({
  args: {
    user_id: v.string(),
    tool_ids: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const results: Record<string, {
      version: string
      created_at: number
      change_type: string
    }> = {}

    for (const toolId of args.tool_ids) {
      const latest = await ctx.db
        .query("tool_versions")
        .withIndex("by_tool_created", (q) => q.eq("tool_id", toolId))
        .order("desc")
        .first()

      if (latest) {
        results[toolId] = {
          version: latest.version,
          created_at: latest.created_at,
          change_type: latest.change_type,
        }
      }
    }

    return results
  },
})

/**
 * Rollback a tool to a specific version.
 */
export const rollbackToVersion = mutation({
  args: {
    user_id: v.string(),
    tool_id: v.string(),
    target_version: v.string(),
  },
  handler: async (ctx, args) => {
    // Get the target version
    const targetVersion = await ctx.db
      .query("tool_versions")
      .withIndex("by_tool_version", (q) =>
        q.eq("tool_id", args.tool_id).eq("version", args.target_version)
      )
      .first()

    if (!targetVersion) {
      throw new Error(`Version ${args.target_version} not found for tool ${args.tool_id}`)
    }

    // Get the current tool
    const currentTool = await ctx.db
      .query("tools")
      .withIndex("by_tool_id", (q) => q.eq("tool_id", args.tool_id))
      .first()

    if (!currentTool) {
      throw new Error(`Tool ${args.tool_id} not found`)
    }

    // Verify ownership
    if (currentTool.user_id !== args.user_id) {
      throw new Error("Access denied: You do not own this tool")
    }

    const snapshot = JSON.parse(targetVersion.tool_snapshot)

    // Increment version for the rollback
    const currentVersionParts = currentTool.version.split(".").map(Number)
    const newVersion = `${currentVersionParts[0]}.${currentVersionParts[1]}.${currentVersionParts[2] + 1}`

    // Update the tool with the snapshot data
    await ctx.db.patch(currentTool._id, {
      name: snapshot.name,
      description: snapshot.description,
      input_schema: snapshot.input_schema,
      output_schema: snapshot.output_schema,
      examples: snapshot.examples,
      required_roles: snapshot.required_roles,
      timeout_ms: snapshot.timeout_ms,
      version: newVersion,
      updated_at: Date.now(),
    })

    // Create a version snapshot for the rollback
    const versionId = generateUUID()
    await ctx.db.insert("tool_versions", {
      version_id: versionId,
      tool_id: args.tool_id,
      version: newVersion,
      tool_snapshot: JSON.stringify({ ...currentTool, version: newVersion }),
      change_type: "restored",
      change_summary: `Rolled back to version ${args.target_version}`,
      changed_fields: undefined,
      changed_by_id: args.user_id,
      changed_by_type: "user",
      created_at: Date.now(),
    })

    return {
      success: true,
      new_version: newVersion,
      restored_from: args.target_version,
    }
  },
})
