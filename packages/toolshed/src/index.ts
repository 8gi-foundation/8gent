/**
 * 8gent Enterprise Toolshed
 *
 * Multi-tenant, enterprise-grade tool registry and invocation system.
 *
 * Features:
 * - Enterprise tool registry with versioning
 * - Multi-tenant isolation (user_id scoped)
 * - Full audit trail with SHA-256 chain integrity
 * - Role-based access control (owner/admin/collaborator/viewer)
 * - Rate limiting per user/tool
 * - Public/private/unlisted visibility
 * - Usage analytics
 */

import { Hono } from "hono"
import { cors } from "hono/cors"
import { compress } from "hono/compress"
import { secureHeaders } from "hono/secure-headers"
import { timing } from "hono/timing"

import { authMiddleware, userMatchMiddleware, type AuthVariables } from "./middleware/auth"
import { requestTrackingMiddleware, type AuditVariables } from "./middleware/audit"
import { rateLimitMiddleware, type RateLimitVariables } from "./middleware/rateLimit"
import { logger } from "./lib/logger"

import tools from "./routes/tools"
import invoke from "./routes/invoke"
import audit from "./routes/audit"

// ============================================
// TYPES
// ============================================

type Variables = AuthVariables & AuditVariables & RateLimitVariables

// ============================================
// APP SETUP
// ============================================

const app = new Hono<{ Variables: Variables }>()

// ============================================
// GLOBAL MIDDLEWARE
// ============================================

// Security headers
app.use("*", secureHeaders({
  contentSecurityPolicy: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https:"],
  },
  xFrameOptions: "DENY",
  xContentTypeOptions: "nosniff",
  referrerPolicy: "strict-origin-when-cross-origin",
  permissionsPolicy: {
    camera: [],
    microphone: [],
    geolocation: [],
  },
}))

// CORS
app.use(
  "*",
  cors({
    origin: (origin) => {
      // Allow 8gent domains
      if (!origin) return "*"
      if (origin.includes("8gent.app")) return origin
      if (origin.includes("localhost")) return origin
      if (origin.includes("127.0.0.1")) return origin
      return null
    },
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: [
      "Content-Type",
      "Authorization",
      "x-user-id",
      "x-agent-id",
      "x-session-id",
      "x-thread-id",
      "x-source",
      "x-correlation-id",
    ],
    exposeHeaders: ["x-request-id", "x-ratelimit-remaining", "x-ratelimit-reset"],
    credentials: true,
    maxAge: 3600,
  })
)

// Compression
app.use("*", compress())

// Timing headers
app.use("*", timing())

// Request tracking (for all routes)
app.use("*", requestTrackingMiddleware)

// ============================================
// HEALTH & METRICS (NO AUTH)
// ============================================

/**
 * GET /health
 * Health check endpoint.
 */
app.get("/health", (c) => {
  return c.json({
    status: "healthy",
    service: "8gent-toolshed",
    version: "1.0.0",
    timestamp: Date.now(),
  })
})

/**
 * GET /ready
 * Readiness check endpoint.
 */
app.get("/ready", async (c) => {
  // TODO: Check Convex connection
  const convexReady = true

  return c.json({
    ready: convexReady,
    checks: {
      convex: convexReady,
    },
    timestamp: Date.now(),
  })
})

/**
 * GET /metrics
 * Prometheus-compatible metrics endpoint.
 */
app.get("/metrics", (c) => {
  const metrics = `
# HELP toolshed_requests_total Total number of requests
# TYPE toolshed_requests_total counter
toolshed_requests_total{method="GET",path="/health"} 0

# HELP toolshed_request_duration_seconds Request duration in seconds
# TYPE toolshed_request_duration_seconds histogram
toolshed_request_duration_seconds_bucket{le="0.1"} 0
toolshed_request_duration_seconds_bucket{le="0.5"} 0
toolshed_request_duration_seconds_bucket{le="1"} 0
toolshed_request_duration_seconds_bucket{le="+Inf"} 0

# HELP toolshed_tools_total Total number of registered tools
# TYPE toolshed_tools_total gauge
toolshed_tools_total 0

# HELP toolshed_invocations_total Total number of tool invocations
# TYPE toolshed_invocations_total counter
toolshed_invocations_total{status="success"} 0
toolshed_invocations_total{status="error"} 0
`.trim()

  c.header("Content-Type", "text/plain; charset=utf-8")
  return c.text(metrics)
})

// ============================================
// API ROUTES (WITH AUTH)
// ============================================

// Apply auth middleware to all API routes
app.use("/api/*", authMiddleware)

// Apply rate limiting to all API routes (consumer-friendly defaults)
// Owners/admins are exempt from global rate limits
app.use("/api/*", rateLimitMiddleware({
  perMinute: 120,
  perHour: 3000,
  perDay: 50000,
  skipRoles: ["owner", "admin"],
}))

// Apply user match middleware to routes with user_id param
app.use("/api/:user_id/*", userMatchMiddleware)

// Mount route handlers
app.route("/api", tools)
app.route("/api", invoke)
app.route("/api", audit)

// ============================================
// ROOT INFO
// ============================================

app.get("/", (c) => {
  return c.json({
    name: "8gent Enterprise Toolshed",
    version: "1.0.0",
    tagline: "Claude Code for everyone",
    documentation: "https://docs.8gent.app/toolshed",
    features: [
      "Multi-tenant isolation (user_id scoped)",
      "SHA-256 audit chain integrity",
      "Role-based access control (owner/admin/collaborator/viewer)",
      "Rate limiting per user/tool (minute/hour/day)",
      "Tool versioning with full history",
      "Public/private/unlisted visibility",
      "Usage analytics",
    ],
    endpoints: {
      health: "/health",
      ready: "/ready",
      metrics: "/metrics",
      tools: "/api/:user_id/tools",
      query: "/api/:user_id/query",
      invoke: "/api/:user_id/invoke/:tool_id",
      audit: "/api/:user_id/audit",
      analytics: "/api/:user_id/analytics",
      versions: "/api/:user_id/tools/:tool_id/versions",
    },
    required_headers: [
      "x-user-id (UUID)",
      "x-agent-id (UUID)",
      "x-session-id (UUID)",
    ],
  })
})

// ============================================
// ERROR HANDLING
// ============================================

app.onError((err, c) => {
  const requestId = c.get("requestId") ?? "unknown"

  logger.error({
    event: "unhandled_error",
    request_id: requestId,
    error_name: err.name,
    error_message: err.message,
    error_stack: err.stack,
    path: c.req.path,
    method: c.req.method,
  })

  // Don't leak error details in production
  const isDev = process.env.NODE_ENV !== "production"

  return c.json(
    {
      error: "Internal server error",
      message: isDev ? err.message : "An unexpected error occurred",
      request_id: requestId,
    },
    500
  )
})

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      error: "Not found",
      path: c.req.path,
      method: c.req.method,
    },
    404
  )
})

// ============================================
// SERVER STARTUP
// ============================================

const port = parseInt(process.env.PORT ?? "3000", 10)

// Validate critical environment
if (!process.env.CONVEX_URL) {
  console.warn("WARNING: CONVEX_URL not set - API calls will fail")
}

console.log(`
  ╔═══════════════════════════════════════════════════════════╗
  ║           8gent Enterprise Toolshed v1.0.0                ║
  ║              "Claude Code for everyone"                   ║
  ╠═══════════════════════════════════════════════════════════╣
  ║  Features:                                                ║
  ║  - Multi-tenant isolation (user_id scoped)                ║
  ║  - SHA-256 audit chain integrity                          ║
  ║  - RBAC: owner/admin/collaborator/viewer                  ║
  ║  - Rate limiting: minute/hour/day windows                 ║
  ║  - Tool versioning with rollback                          ║
  ║  - Public/private/unlisted visibility                     ║
  ║  - Usage analytics                                        ║
  ╚═══════════════════════════════════════════════════════════╝

  Server running at http://localhost:${port}

  API Endpoints:
  - GET  /health              Health check
  - GET  /api/:user_id/tools  List tools
  - POST /api/:user_id/tools  Create tool
  - POST /api/:user_id/invoke/:tool_id  Invoke tool
  - GET  /api/:user_id/audit  Audit log
  - GET  /api/:user_id/analytics  Usage analytics

  Required Headers:
  - x-user-id: UUID
  - x-agent-id: UUID
  - x-session-id: UUID
`)

logger.info({
  event: "server_starting",
  port,
  env: process.env.NODE_ENV ?? "development",
})

export default {
  port,
  fetch: app.fetch,
}

// Also export app for testing
export { app }

// Export schemas for external use
export * from "./schemas"
export { createToolshedClient, ToolshedClient, ToolshedError } from "./lib/client"
