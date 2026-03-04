/**
 * 8gent Control Plane
 *
 * Secure credential management for 8gent consumer AI agents.
 * Based on the FSAI Control Plane architecture.
 *
 * Key differences from FSAI:
 * - Multi-tenant: supports multiple users
 * - Usage-based billing hooks
 * - Consumer-focused rate limits
 */

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { serve } from '@hono/node-server'
import { nanoid } from 'nanoid'

const app = new Hono()

// Types
interface Session {
  id: string
  token: string
  userId: string
  agentId: string
  provider: 'openrouter' | 'groq' | 'anthropic' | 'openai' | 'ollama'
  tier: 'free' | 'pro' | 'enterprise'
  createdAt: Date
  expiresAt: Date
  usageLimit: number
  usageCount: number
}

interface AuditEntry {
  timestamp: Date
  event: string
  [key: string]: unknown
}

// In-memory storage (replace with Redis/DB in production)
const sessions = new Map<string, Session>()
const tokenToId = new Map<string, string>()
const auditLog: AuditEntry[] = []

// Tier limits
const TIER_LIMITS = {
  free: { usageLimit: 100, expiresInMs: 3600000 },      // 100 requests, 1 hour
  pro: { usageLimit: 5000, expiresInMs: 86400000 },    // 5000 requests, 24 hours
  enterprise: { usageLimit: 50000, expiresInMs: 604800000 } // 50k requests, 7 days
}

// Provider configs
const PROVIDERS = {
  openrouter: {
    baseUrl: 'https://openrouter.ai/api/v1',
    extraHeaders: { 'HTTP-Referer': 'https://8gent.app', 'X-Title': '8gent' }
  },
  groq: { baseUrl: 'https://api.groq.com/openai/v1' },
  anthropic: { baseUrl: 'https://api.anthropic.com/v1' },
  openai: { baseUrl: 'https://api.openai.com/v1' },
  ollama: { baseUrl: process.env.OLLAMA_URL || 'http://localhost:11434/v1' }
}

// Middleware
app.use('*', logger())
app.use('*', cors({
  origin: ['https://8gent.app', 'http://localhost:*'],
  allowMethods: ['GET', 'POST', 'OPTIONS'],
}))

// Health check
app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    service: '8gent-control-plane',
    version: '0.1.0',
    timestamp: new Date().toISOString()
  })
})

// Session validation middleware
app.use('/v1/*', async (c, next) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Missing authorization token' }, 401)
  }

  const token = authHeader.slice(7)
  const sessionId = tokenToId.get(token)
  if (!sessionId) {
    return c.json({ error: 'Invalid session token' }, 401)
  }

  const session = sessions.get(sessionId)
  if (!session || new Date() > session.expiresAt) {
    if (session) {
      tokenToId.delete(session.token)
      sessions.delete(sessionId)
    }
    return c.json({ error: 'Session expired' }, 401)
  }

  if (session.usageCount >= session.usageLimit) {
    return c.json({
      error: 'Usage limit exceeded',
      tier: session.tier,
      limit: session.usageLimit,
      upgrade_url: 'https://8gent.app/upgrade'
    }, 429)
  }

  c.set('session', session)
  await next()
})

// LLM Proxy
app.post('/v1/chat/completions', async (c) => {
  const session = c.get('session') as Session
  const body = await c.req.json()

  // Log request
  auditLog.push({
    timestamp: new Date(),
    event: 'llm_request',
    userId: session.userId,
    agentId: session.agentId,
    tier: session.tier,
    model: body.model
  })

  try {
    // Get API key from environment
    const apiKey = getApiKey(session.provider)
    if (!apiKey) {
      return c.json({ error: `Provider ${session.provider} not configured` }, 500)
    }

    const config = PROVIDERS[session.provider]
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      ...config.extraHeaders
    }

    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    })

    // Increment usage
    session.usageCount++
    sessions.set(session.id, session)

    if (body.stream) {
      return new Response(response.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      })
    }

    return c.json(await response.json())

  } catch (error) {
    auditLog.push({
      timestamp: new Date(),
      event: 'llm_error',
      userId: session.userId,
      error: error instanceof Error ? error.message : 'Unknown'
    })
    return c.json({ error: 'LLM request failed' }, 500)
  }
})

// Create session (called by 8gent backend)
app.post('/internal/sessions', async (c) => {
  const internalKey = c.req.header('X-Internal-Key')
  if (internalKey !== process.env.INTERNAL_API_KEY) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const body = await c.req.json()
  const tier = body.tier as keyof typeof TIER_LIMITS || 'free'
  const limits = TIER_LIMITS[tier]

  const id = `8gent_sess_${nanoid(16)}`
  const token = `8gent_tok_${nanoid(32)}`

  const session: Session = {
    id,
    token,
    userId: body.userId,
    agentId: body.agentId,
    provider: body.provider || 'openrouter',
    tier,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + limits.expiresInMs),
    usageLimit: limits.usageLimit,
    usageCount: 0
  }

  sessions.set(id, session)
  tokenToId.set(token, id)

  // Schedule cleanup
  setTimeout(() => {
    tokenToId.delete(token)
    sessions.delete(id)
  }, limits.expiresInMs)

  auditLog.push({
    timestamp: new Date(),
    event: 'session_created',
    userId: body.userId,
    tier,
    sessionId: id
  })

  return c.json({
    token,
    sessionId: id,
    expiresAt: session.expiresAt.toISOString(),
    usageLimit: session.usageLimit
  })
})

// Usage stats (for billing)
app.get('/internal/usage/:userId', async (c) => {
  const internalKey = c.req.header('X-Internal-Key')
  if (internalKey !== process.env.INTERNAL_API_KEY) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const userId = c.req.param('userId')
  const userSessions = Array.from(sessions.values()).filter(s => s.userId === userId)

  return c.json({
    userId,
    totalRequests: userSessions.reduce((sum, s) => sum + s.usageCount, 0),
    activeSessions: userSessions.length,
    byTier: userSessions.reduce((acc, s) => {
      acc[s.tier] = (acc[s.tier] || 0) + s.usageCount
      return acc
    }, {} as Record<string, number>)
  })
})

function getApiKey(provider: string): string | undefined {
  const keyMap: Record<string, string | undefined> = {
    openrouter: process.env.OPENROUTER_API_KEY,
    groq: process.env.GROQ_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
    openai: process.env.OPENAI_API_KEY,
    ollama: 'not-required'
  }
  return keyMap[provider]
}

// Start server
const port = parseInt(process.env.CONTROL_PLANE_PORT || '18787')

console.log(`
╔══════════════════════════════════════════════════════════════╗
║              8gent Control Plane v0.1.0                      ║
╠══════════════════════════════════════════════════════════════╣
║  Port: ${port}                                                  ║
║  Tiers: free (100/hr), pro (5k/day), enterprise (50k/week)   ║
║  Security: Session tokens + LLM proxy + Audit logging        ║
╚══════════════════════════════════════════════════════════════╝
`)

serve({ fetch: app.fetch, port })

export { app }
