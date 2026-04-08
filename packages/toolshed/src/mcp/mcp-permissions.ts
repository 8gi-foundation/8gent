// TOFU (Trust On First Use) permission model for MCP servers
// Config lives at ~/.8gent/config/mcp-permissions.json

import fs from 'fs'
import path from 'path'
import os from 'os'

const CONFIG_PATH = path.join(os.homedir(), '.8gent', 'config', 'mcp-permissions.json')

export type McpPermissionConfig = {
  [serverName: string]: {
    allowed: string[]
    blocked: string[]
    requireApproval: boolean
  }
}

export function loadMcpPermissions(): McpPermissionConfig {
  try {
    const raw = fs.readFileSync(CONFIG_PATH, 'utf-8')
    return JSON.parse(raw) as McpPermissionConfig
  } catch {
    return {}
  }
}

export function saveMcpPermissions(config: McpPermissionConfig): void {
  const dir = path.dirname(CONFIG_PATH)
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8')
}

export function checkMcpPermission(
  serverName: string,
  toolName: string,
  config: McpPermissionConfig
): 'allowed' | 'blocked' | 'needs_approval' {
  const server = config[serverName]

  // Server not in config: TOFU — needs approval on first use
  if (!server) {
    return 'needs_approval'
  }

  if (server.blocked.includes(toolName)) {
    return 'blocked'
  }

  if (server.allowed.includes(toolName)) {
    return 'allowed'
  }

  return 'needs_approval'
}

export function approveMcpTool(serverName: string, toolName: string): void {
  const config = loadMcpPermissions()

  if (!config[serverName]) {
    config[serverName] = { allowed: [], blocked: [], requireApproval: false }
  }

  const server = config[serverName]

  if (!server.allowed.includes(toolName)) {
    server.allowed.push(toolName)
  }

  // Remove from blocked if it was there
  server.blocked = server.blocked.filter((t) => t !== toolName)

  saveMcpPermissions(config)
}

export function blockMcpTool(serverName: string, toolName: string): void {
  const config = loadMcpPermissions()

  if (!config[serverName]) {
    config[serverName] = { allowed: [], blocked: [], requireApproval: false }
  }

  const server = config[serverName]

  if (!server.blocked.includes(toolName)) {
    server.blocked.push(toolName)
  }

  // Remove from allowed if it was there
  server.allowed = server.allowed.filter((t) => t !== toolName)

  saveMcpPermissions(config)
}

// Error code used by callers to detect approval-required state
export const MCP_APPROVAL_REQUIRED = 'MCP_APPROVAL_REQUIRED'

/**
 * Gate an MCP tool call. Throws if blocked or needs approval.
 * Call this before executing any MCP tool.
 */
export function assertMcpPermitted(
  serverName: string,
  toolName: string,
  config: McpPermissionConfig
): void {
  const result = checkMcpPermission(serverName, toolName, config)

  if (result === 'blocked') {
    throw new Error(`MCP tool blocked: "${serverName}/${toolName}"`)
  }

  if (result === 'needs_approval') {
    const err = new Error(
      `MCP tool requires approval before use: "${serverName}/${toolName}"`
    )
    ;(err as NodeJS.ErrnoException).code = MCP_APPROVAL_REQUIRED
    throw err
  }
}
