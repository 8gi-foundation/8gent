/**
 * 8gent Enterprise Toolshed - Tool Schemas
 *
 * Enterprise-grade tool definitions with:
 * - Strict validation
 * - Visibility controls (private/public/unlisted)
 * - Versioning
 * - Rate limiting
 */

import { z } from "zod"

// ============================================
// CONSTANTS
// ============================================

export const TOOL_TYPES = [
  "builtin",    // Ships with 8gent
  "community",  // User-contributed, approved
  "custom",     // User-created, private
  "api",        // External API wrapper
  "workflow",   // Multi-step workflow
] as const

export const USER_ROLES = [
  "owner",        // Full account access
  "admin",        // Can manage tools
  "collaborator", // Can use and edit tools
  "viewer",       // Read-only access
  "agent",        // AI agent role
] as const

export const TOOL_VISIBILITY = [
  "private",    // Only owner can see/use
  "public",     // Anyone can see/use
  "unlisted",   // Can use with direct link
] as const

export const TOOL_CATEGORIES = [
  "productivity",
  "communication",
  "media",
  "dev",
  "automation",
  "data",
  "other",
] as const

// ============================================
// JSON SCHEMA VALIDATOR
// ============================================

/**
 * Validates that a value is a valid JSON Schema object.
 */
const JsonSchemaSchema = z.record(z.any()).refine(
  (val) => {
    if (typeof val !== "object" || val === null) return false
    return (
      "type" in val ||
      "$ref" in val ||
      "anyOf" in val ||
      "oneOf" in val ||
      "allOf" in val ||
      "properties" in val
    )
  },
  { message: "Must be a valid JSON Schema object" }
)

// ============================================
// TOOL SCHEMA (ENTERPRISE)
// ============================================

/**
 * Enterprise tool definition schema.
 */
export const EnterpriseToolSchema = z.object({
  // Identity
  id: z.string().uuid({
    message: "Tool ID must be a valid UUID",
  }),
  name: z.string()
    .min(1, "Tool name is required")
    .max(100, "Tool name must be under 100 characters")
    .regex(/^[a-z][a-z0-9_-]*$/, {
      message: "Tool name must be lowercase, start with a letter, and contain only letters, numbers, hyphens, and underscores",
    }),
  slug: z.string()
    .min(1)
    .max(100)
    .regex(/^[a-z][a-z0-9_-]*$/)
    .optional(),

  // Classification
  type: z.enum(TOOL_TYPES, {
    errorMap: () => ({
      message: `Tool type must be one of: ${TOOL_TYPES.join(", ")}`,
    }),
  }),
  category: z.enum(TOOL_CATEGORIES).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),

  // Visibility - key feature for 8gent consumer model
  visibility: z.enum(TOOL_VISIBILITY).default("private"),

  // Description
  description: z.string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must be under 2000 characters"),
  short_description: z.string().max(200).optional(),

  // Schema definitions
  input_schema: JsonSchemaSchema,
  output_schema: JsonSchemaSchema.optional(),

  // Example usage
  examples: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
    input: z.record(z.any()),
    expected_output: z.record(z.any()).optional(),
  })).max(10).optional(),

  // Access control
  required_roles: z.array(z.enum(USER_ROLES)).min(1, {
    message: "At least one role must be specified",
  }),
  allowed_agents: z.array(z.string().uuid()).optional(),
  denied_agents: z.array(z.string().uuid()).optional(),

  // User scoping
  user_id: z.string().uuid(),

  // Rate limiting
  rate_limit: z.object({
    requests_per_minute: z.number().int().min(1).max(10000),
    requests_per_hour: z.number().int().min(1).max(100000),
    requests_per_day: z.number().int().min(1).max(1000000),
  }).optional(),

  // Timeout
  timeout_ms: z.number().int().min(100).max(300000).default(30000),

  // Versioning
  version: z.string().regex(/^\d+\.\d+\.\d+$/, {
    message: "Version must be in semver format (e.g., 1.0.0)",
  }),
  deprecated: z.boolean().default(false),
  deprecation_date: z.number().int().optional(),
  deprecation_message: z.string().max(500).optional(),

  // Metadata
  owner: z.string().min(1).max(255),
  documentation_url: z.string().url().optional(),
  source_url: z.string().url().optional(),

  // Execution
  endpoint: z.string().url().optional(),
  handler: z.string().optional(),

  // Timestamps
  created_at: z.number().int(),
  updated_at: z.number().int(),
  last_invoked_at: z.number().int().optional(),

  // Stats
  invocation_count: z.number().int().default(0),
  success_count: z.number().int().default(0),
  error_count: z.number().int().default(0),
  avg_duration_ms: z.number().default(0),
})

export type EnterpriseTool = z.infer<typeof EnterpriseToolSchema>

// ============================================
// TOOL REGISTRATION
// ============================================

/**
 * Schema for registering a new tool.
 */
export const ToolRegistrationSchema = EnterpriseToolSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  last_invoked_at: true,
  invocation_count: true,
  success_count: true,
  error_count: true,
  avg_duration_ms: true,
}).extend({
  id: z.string().uuid().optional(),
})

export type ToolRegistration = z.infer<typeof ToolRegistrationSchema>

// ============================================
// TOOL UPDATE
// ============================================

/**
 * Schema for updating an existing tool.
 */
export const ToolUpdateSchema = EnterpriseToolSchema.partial().omit({
  id: true,
  created_at: true,
  user_id: true, // Cannot change ownership
}).extend({
  version: z.string().regex(/^\d+\.\d+\.\d+$/).optional(),
})

export type ToolUpdate = z.infer<typeof ToolUpdateSchema>

// ============================================
// TOOL QUERY
// ============================================

/**
 * Schema for querying tools.
 */
export const ToolQuerySchema = z.object({
  // Search
  search: z.string().max(200).optional(),
  task: z.string().max(500).optional(),

  // Filters
  type: z.enum(TOOL_TYPES).optional(),
  types: z.array(z.enum(TOOL_TYPES)).optional(),
  category: z.enum(TOOL_CATEGORIES).optional(),
  tags: z.array(z.string()).optional(),
  visibility: z.enum(TOOL_VISIBILITY).optional(),

  // Access filters
  agent_id: z.string().uuid().optional(),
  roles: z.array(z.enum(USER_ROLES)).optional(),

  // Version filters
  include_deprecated: z.boolean().default(false),
  min_version: z.string().regex(/^\d+\.\d+\.\d+$/).optional(),

  // Pagination
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),

  // Sorting
  sort_by: z.enum([
    "name",
    "created_at",
    "updated_at",
    "invocation_count",
    "relevance",
  ]).default("relevance"),
  sort_order: z.enum(["asc", "desc"]).default("desc"),
})

export type ToolQuery = z.infer<typeof ToolQuerySchema>

// ============================================
// TOOL INVOCATION REQUEST
// ============================================

/**
 * Schema for invoking a tool.
 */
export const ToolInvocationRequestSchema = z.object({
  tool_id: z.string().uuid(),
  input: z.record(z.any()),
  timeout_ms: z.number().int().min(100).max(300000).optional(),
  async: z.boolean().default(false),
  webhook_url: z.string().url().optional(),
})

export type ToolInvocationRequest = z.infer<typeof ToolInvocationRequestSchema>

// ============================================
// TOOL INVOCATION RESULT
// ============================================

/**
 * Schema for tool invocation result.
 */
export const ToolInvocationResultSchema = z.object({
  invocation_id: z.string().uuid(),
  tool_id: z.string().uuid(),
  tool_name: z.string(),
  tool_version: z.string(),
  success: z.boolean(),
  output: z.record(z.any()).optional(),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.any()).optional(),
  }).optional(),
  duration_ms: z.number().int(),
  started_at: z.number().int(),
  completed_at: z.number().int(),
  audit_event_id: z.string().uuid(),
})

export type ToolInvocationResult = z.infer<typeof ToolInvocationResultSchema>

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if a role has access to a tool.
 */
export function hasRoleAccess(
  tool: EnterpriseTool,
  userRoles: (typeof USER_ROLES)[number][]
): boolean {
  return tool.required_roles.some((role) => userRoles.includes(role))
}

/**
 * Check if an agent is allowed to use a tool.
 */
export function isAgentAllowed(tool: EnterpriseTool, agentId: string): boolean {
  if (tool.denied_agents?.includes(agentId)) {
    return false
  }
  if (tool.allowed_agents && tool.allowed_agents.length > 0) {
    return tool.allowed_agents.includes(agentId)
  }
  return true
}

/**
 * Check if a tool is accessible based on visibility.
 */
export function isToolAccessible(
  tool: EnterpriseTool,
  requestingUserId: string,
  hasDirectLink: boolean = false
): boolean {
  if (tool.visibility === "public") return true
  if (tool.visibility === "unlisted" && hasDirectLink) return true
  return tool.user_id === requestingUserId
}

/**
 * Create a tool slug from name.
 */
export function createToolSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}
