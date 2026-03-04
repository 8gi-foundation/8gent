/**
 * 8gent Enterprise Toolshed - Schema Exports
 *
 * Enterprise-grade schemas for:
 * - Multi-tenant tool registry
 * - Consumer-friendly RBAC (owner/admin/collaborator/viewer)
 * - Tool visibility (public/private/unlisted)
 * - SHA-256 audit chain integrity
 * - Rate limiting (minute/hour/day windows)
 */

// Context schemas
export {
  InvocationContextSchema,
  ActorContextSchema,
  RequiredHeaders,
  extractContextFromHeaders,
  validateUserAccess,
  createMinimalContext,
  type InvocationContext,
  type ActorContext,
} from "./context"

// Audit schemas
export {
  AUDIT_ACTIONS,
  AuditLogEntrySchema,
  AuditLogQuerySchema,
  AuditStatsSchema,
  hashData,
  calculateChecksum,
  getActionCategory,
  createAuditEntry,
  type AuditAction,
  type AuditLogEntry,
  type AuditLogQuery,
  type AuditStats,
} from "./audit"

// Tool schemas
export {
  TOOL_TYPES,
  USER_ROLES,
  TOOL_VISIBILITY,
  TOOL_CATEGORIES,
  EnterpriseToolSchema,
  ToolRegistrationSchema,
  ToolUpdateSchema,
  ToolQuerySchema,
  ToolInvocationRequestSchema,
  ToolInvocationResultSchema,
  hasRoleAccess,
  isAgentAllowed,
  isToolAccessible,
  createToolSlug,
  type EnterpriseTool,
  type ToolRegistration,
  type ToolUpdate,
  type ToolQuery,
  type ToolInvocationRequest,
  type ToolInvocationResult,
} from "./tool"
