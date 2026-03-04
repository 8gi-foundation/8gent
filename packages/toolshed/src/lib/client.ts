/**
 * 8gent Enterprise Toolshed - API Client
 *
 * Type-safe client for interacting with the Toolshed API.
 */

import type {
  InvocationContext,
  EnterpriseTool,
  ToolQuery,
  ToolInvocationRequest,
  ToolInvocationResult,
  AuditLogQuery,
  AuditLogEntry,
  AuditStats,
} from "../schemas"

// ============================================
// TYPES
// ============================================

export interface ToolshedClientConfig {
  baseUrl: string
  userId: string
  agentId: string
  sessionId?: string
  source?: InvocationContext["source"]
  onError?: (error: ToolshedError) => void
}

export interface RequestOptions {
  timeout?: number
  signal?: AbortSignal
}

// ============================================
// ERROR CLASS
// ============================================

export class ToolshedError extends Error {
  public readonly status: number
  public readonly code: string
  public readonly requestId?: string
  public readonly details?: Record<string, unknown>

  constructor(params: {
    message: string
    status: number
    code: string
    requestId?: string
    details?: Record<string, unknown>
  }) {
    super(params.message)
    this.name = "ToolshedError"
    this.status = params.status
    this.code = params.code
    this.requestId = params.requestId
    this.details = params.details
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      code: this.code,
      requestId: this.requestId,
      details: this.details,
    }
  }
}

// ============================================
// CLIENT CLASS
// ============================================

export class ToolshedClient {
  private config: ToolshedClientConfig
  private sessionId: string

  constructor(config: ToolshedClientConfig) {
    this.config = config
    this.sessionId = config.sessionId ?? crypto.randomUUID()
  }

  // ==========================================
  // PRIVATE METHODS
  // ==========================================

  private getHeaders(): Record<string, string> {
    return {
      "Content-Type": "application/json",
      "x-user-id": this.config.userId,
      "x-agent-id": this.config.agentId,
      "x-session-id": this.sessionId,
      "x-source": this.config.source ?? "api",
    }
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    const url = `${this.config.baseUrl}${path}`
    const controller = new AbortController()
    const timeoutId = options?.timeout
      ? setTimeout(() => controller.abort(), options.timeout)
      : undefined

    try {
      const response = await fetch(url, {
        method,
        headers: this.getHeaders(),
        body: body ? JSON.stringify(body) : undefined,
        signal: options?.signal ?? controller.signal,
      })

      const requestId = response.headers.get("x-request-id") ?? undefined
      const data = await response.json()

      if (!response.ok) {
        const error = new ToolshedError({
          message: data.message ?? data.error ?? "Request failed",
          status: response.status,
          code: data.code ?? "UNKNOWN_ERROR",
          requestId,
          details: data.details,
        })

        if (this.config.onError) {
          this.config.onError(error)
        }

        throw error
      }

      return data as T
    } finally {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }

  // ==========================================
  // TOOLS API
  // ==========================================

  /**
   * List tools for the current user.
   */
  async listTools(query?: Partial<ToolQuery>): Promise<{
    tools: EnterpriseTool[]
    total: number
    has_more: boolean
  }> {
    const params = new URLSearchParams()
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined) {
          params.set(key, String(value))
        }
      })
    }
    const path = `/api/${this.config.userId}/tools${params.toString() ? `?${params}` : ""}`
    return this.request("GET", path)
  }

  /**
   * Get a single tool by ID.
   */
  async getTool(toolId: string): Promise<EnterpriseTool | null> {
    return this.request("GET", `/api/${this.config.userId}/tools/${toolId}`)
  }

  /**
   * Create a new tool.
   */
  async createTool(tool: Omit<EnterpriseTool, "id" | "created_at" | "updated_at" | "invocation_count" | "success_count" | "error_count" | "avg_duration_ms">): Promise<{ id: string }> {
    return this.request("POST", `/api/${this.config.userId}/tools`, tool)
  }

  /**
   * Update a tool.
   */
  async updateTool(toolId: string, updates: Partial<EnterpriseTool>): Promise<EnterpriseTool> {
    return this.request("PATCH", `/api/${this.config.userId}/tools/${toolId}`, updates)
  }

  /**
   * Delete a tool.
   */
  async deleteTool(toolId: string): Promise<{ success: boolean }> {
    return this.request("DELETE", `/api/${this.config.userId}/tools/${toolId}`)
  }

  /**
   * Find tools matching a task description.
   */
  async queryTools(task: string): Promise<{
    matches: EnterpriseTool[]
    best_match: EnterpriseTool | null
  }> {
    return this.request("GET", `/api/${this.config.userId}/query?task=${encodeURIComponent(task)}`)
  }

  // ==========================================
  // INVOKE API
  // ==========================================

  /**
   * Invoke a tool.
   */
  async invoke(
    toolId: string,
    input: Record<string, unknown>,
    options?: { timeout_ms?: number; async?: boolean }
  ): Promise<ToolInvocationResult> {
    const request: ToolInvocationRequest = {
      tool_id: toolId,
      input,
      timeout_ms: options?.timeout_ms,
      async: options?.async ?? false,
    }
    return this.request("POST", `/api/${this.config.userId}/invoke/${toolId}`, request)
  }

  // ==========================================
  // AUDIT API
  // ==========================================

  /**
   * Get audit log entries.
   */
  async getAuditLog(query?: Partial<AuditLogQuery>): Promise<{
    entries: AuditLogEntry[]
    total: number
    has_more: boolean
  }> {
    const params = new URLSearchParams()
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined) {
          params.set(key, String(value))
        }
      })
    }
    const path = `/api/${this.config.userId}/audit${params.toString() ? `?${params}` : ""}`
    return this.request("GET", path)
  }

  /**
   * Get audit statistics.
   */
  async getAuditStats(startTime: number, endTime: number): Promise<AuditStats> {
    return this.request(
      "GET",
      `/api/${this.config.userId}/audit/stats?start_time=${startTime}&end_time=${endTime}`
    )
  }

  /**
   * Verify audit chain integrity.
   */
  async verifyAuditIntegrity(options?: {
    start_sequence?: number
    end_sequence?: number
  }): Promise<{
    entries_checked: number
    integrity_valid: boolean
    issues: Array<{ sequence: number; issue: string }>
  }> {
    const params = new URLSearchParams()
    if (options?.start_sequence) params.set("start_sequence", String(options.start_sequence))
    if (options?.end_sequence) params.set("end_sequence", String(options.end_sequence))
    const path = `/api/${this.config.userId}/audit/verify${params.toString() ? `?${params}` : ""}`
    return this.request("GET", path)
  }

  // ==========================================
  // ANALYTICS API
  // ==========================================

  /**
   * Get usage analytics for tools.
   */
  async getUsageAnalytics(options?: {
    tool_id?: string
    start_time?: number
    end_time?: number
  }): Promise<{
    total_invocations: number
    by_tool: Array<{ tool_id: string; tool_name: string; count: number }>
    by_day: Array<{ date: string; count: number }>
    success_rate: number
    avg_duration_ms: number
  }> {
    const params = new URLSearchParams()
    if (options?.tool_id) params.set("tool_id", options.tool_id)
    if (options?.start_time) params.set("start_time", String(options.start_time))
    if (options?.end_time) params.set("end_time", String(options.end_time))
    const path = `/api/${this.config.userId}/analytics${params.toString() ? `?${params}` : ""}`
    return this.request("GET", path)
  }
}

// ============================================
// FACTORY FUNCTION
// ============================================

/**
 * Create a Toolshed client instance.
 */
export function createToolshedClient(config: ToolshedClientConfig): ToolshedClient {
  return new ToolshedClient(config)
}
