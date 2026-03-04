/**
 * 8gent Enterprise Toolshed - Convex Schema
 *
 * Multi-tenant, enterprise-grade schema for tool registry and audit logging.
 * Each user is their own "tenant" in the 8gent model.
 */

import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  // ============================================
  // TOOLS TABLE
  // Enterprise tool registry with full metadata
  // ============================================
  tools: defineTable({
    // Identity
    tool_id: v.string(), // UUID
    name: v.string(),
    slug: v.optional(v.string()),

    // Classification
    type: v.union(
      v.literal("builtin"),
      v.literal("community"),
      v.literal("custom"),
      v.literal("api"),
      v.literal("workflow")
    ),
    category: v.optional(v.union(
      v.literal("productivity"),
      v.literal("communication"),
      v.literal("media"),
      v.literal("dev"),
      v.literal("automation"),
      v.literal("data"),
      v.literal("other")
    )),
    tags: v.optional(v.array(v.string())),

    // Visibility - public/private/unlisted
    visibility: v.union(
      v.literal("private"),
      v.literal("public"),
      v.literal("unlisted")
    ),

    // Description
    description: v.string(),
    short_description: v.optional(v.string()),

    // Schema definitions (stored as JSON strings)
    input_schema: v.string(), // JSON Schema
    output_schema: v.optional(v.string()), // JSON Schema

    // Examples
    examples: v.optional(v.string()), // JSON array

    // Access control - consumer-friendly roles
    required_roles: v.array(
      v.union(
        v.literal("owner"),
        v.literal("admin"),
        v.literal("collaborator"),
        v.literal("viewer"),
        v.literal("agent")
      )
    ),
    allowed_agents: v.optional(v.array(v.string())), // UUIDs
    denied_agents: v.optional(v.array(v.string())), // UUIDs

    // User scoping (each user is their own tenant)
    user_id: v.string(), // UUID

    // Rate limiting (JSON)
    rate_limit: v.optional(v.string()),

    // Timeout
    timeout_ms: v.number(),

    // Versioning
    version: v.string(),
    deprecated: v.boolean(),
    deprecation_date: v.optional(v.number()),
    deprecation_message: v.optional(v.string()),

    // Metadata
    owner: v.string(),
    documentation_url: v.optional(v.string()),
    source_url: v.optional(v.string()),

    // Execution
    endpoint: v.optional(v.string()),
    handler: v.optional(v.string()),

    // Timestamps
    created_at: v.number(),
    updated_at: v.number(),
    last_invoked_at: v.optional(v.number()),

    // Stats
    invocation_count: v.number(),
    success_count: v.number(),
    error_count: v.number(),
    avg_duration_ms: v.number(),
  })
    .index("by_tool_id", ["tool_id"])
    .index("by_user", ["user_id"])
    .index("by_user_name", ["user_id", "name"])
    .index("by_user_type", ["user_id", "type"])
    .index("by_user_visibility", ["user_id", "visibility"])
    .index("by_name", ["name"])
    .index("by_type", ["type"])
    .index("by_visibility", ["visibility"])
    .index("by_deprecated", ["deprecated"])
    .searchIndex("search_tools", {
      searchField: "description",
      filterFields: ["user_id", "type", "deprecated", "visibility"],
    }),

  // ============================================
  // TOOL VERSIONS TABLE
  // Immutable version history for tools
  // ============================================
  tool_versions: defineTable({
    // Identity
    version_id: v.string(), // UUID
    tool_id: v.string(), // References tools.tool_id
    version: v.string(), // Semver

    // Snapshot of tool at this version (JSON)
    tool_snapshot: v.string(),

    // Change info
    change_type: v.union(
      v.literal("created"),
      v.literal("updated"),
      v.literal("deprecated"),
      v.literal("restored")
    ),
    change_summary: v.optional(v.string()),
    changed_fields: v.optional(v.array(v.string())),

    // Actor
    changed_by_id: v.string(),
    changed_by_type: v.union(
      v.literal("user"),
      v.literal("agent"),
      v.literal("system")
    ),

    // Timestamps
    created_at: v.number(),
  })
    .index("by_version_id", ["version_id"])
    .index("by_tool_id", ["tool_id"])
    .index("by_tool_version", ["tool_id", "version"])
    .index("by_tool_created", ["tool_id", "created_at"]),

  // ============================================
  // AUDIT LOG TABLE (IMMUTABLE)
  // Append-only audit trail with SHA-256 chain integrity
  // ============================================
  audit_log: defineTable({
    // Identity
    audit_id: v.string(), // UUID
    user_id: v.string(), // UUID (owner of this audit entry)
    sequence_number: v.number(), // For ordering

    // Temporal
    timestamp: v.number(),

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
    action: v.string(), // From AUDIT_ACTIONS
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

    // Context
    session_id: v.string(),
    thread_id: v.optional(v.string()),
    correlation_id: v.optional(v.string()),

    // Data hashes (not raw data for security)
    input_hash: v.optional(v.string()),
    output_hash: v.optional(v.string()),
    input_size_bytes: v.optional(v.number()),
    output_size_bytes: v.optional(v.number()),

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

    // Integrity - SHA-256 chain
    checksum: v.string(),
    previous_checksum: v.optional(v.string()),
  })
    .index("by_audit_id", ["audit_id"])
    .index("by_user_timestamp", ["user_id", "timestamp"])
    .index("by_user_sequence", ["user_id", "sequence_number"])
    .index("by_user_action", ["user_id", "action"])
    .index("by_user_tool", ["user_id", "tool_id"])
    .index("by_session", ["session_id"])
    .index("by_correlation", ["correlation_id"])
    .index("by_actor", ["actor_id"]),

  // ============================================
  // USER TOOL CONFIG TABLE
  // Per-user tool configuration overrides
  // ============================================
  user_tool_config: defineTable({
    // Identity
    config_id: v.string(), // UUID
    user_id: v.string(), // UUID
    tool_id: v.string(), // UUID

    // Enable/disable
    enabled: v.boolean(),
    enabled_at: v.optional(v.number()),
    disabled_at: v.optional(v.number()),
    disabled_reason: v.optional(v.string()),

    // Role overrides for this user
    role_overrides: v.optional(v.string()), // JSON

    // Agent restrictions for this user
    allowed_agents_override: v.optional(v.array(v.string())),
    denied_agents_override: v.optional(v.array(v.string())),

    // Rate limit overrides for this user
    rate_limit_override: v.optional(v.string()), // JSON

    // Timeout override
    timeout_ms_override: v.optional(v.number()),

    // Custom config (JSON)
    custom_config: v.optional(v.string()),

    // Metadata
    configured_by: v.string(),
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_config_id", ["config_id"])
    .index("by_user", ["user_id"])
    .index("by_user_tool", ["user_id", "tool_id"])
    .index("by_tool", ["tool_id"]),

  // ============================================
  // USER SEQUENCE COUNTER
  // For generating sequential audit numbers per user
  // ============================================
  user_sequence: defineTable({
    user_id: v.string(),
    last_sequence: v.number(),
    updated_at: v.number(),
  })
    .index("by_user", ["user_id"]),

  // ============================================
  // RATE LIMIT STATE
  // Tracks rate limit consumption per user/tool
  // ============================================
  rate_limit_state: defineTable({
    // Identity
    user_id: v.string(),
    tool_id: v.string(),

    // Time windows
    minute_window: v.number(), // Start of current minute window
    minute_count: v.number(),
    hour_window: v.number(), // Start of current hour window
    hour_count: v.number(),
    day_window: v.number(), // Start of current day window
    day_count: v.number(),

    // Last update
    updated_at: v.number(),
  })
    .index("by_user_tool", ["user_id", "tool_id"]),

  // ============================================
  // USAGE ANALYTICS TABLE
  // Aggregated usage data per tool per user per day
  // ============================================
  usage_analytics: defineTable({
    // Identity
    user_id: v.string(),
    tool_id: v.string(),
    date: v.string(), // YYYY-MM-DD

    // Metrics
    invocation_count: v.number(),
    success_count: v.number(),
    error_count: v.number(),
    total_duration_ms: v.number(),
    avg_duration_ms: v.number(),
    min_duration_ms: v.number(),
    max_duration_ms: v.number(),

    // Breakdown by hour (JSON array of 24 hourly counts)
    hourly_breakdown: v.optional(v.string()),

    // Error breakdown
    error_codes: v.optional(v.string()), // JSON: { "ERROR_CODE": count }

    // Last updated
    updated_at: v.number(),
  })
    .index("by_user_tool_date", ["user_id", "tool_id", "date"])
    .index("by_user_date", ["user_id", "date"])
    .index("by_tool_date", ["tool_id", "date"]),

  // ============================================
  // LEGACY: USAGE TABLE (kept for migration)
  // Basic usage tracking
  // ============================================
  usage: defineTable({
    toolId: v.id("tools"),
    userId: v.optional(v.string()),
    timestamp: v.number(),
    success: v.boolean(),
  })
    .index("by_tool", ["toolId"])
    .index("by_user", ["userId"])
    .index("by_timestamp", ["timestamp"]),
})
