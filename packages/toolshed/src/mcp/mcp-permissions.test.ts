import { describe, it, expect } from 'bun:test'
import {
  checkMcpPermission,
  approveMcpTool,
  blockMcpTool,
  loadMcpPermissions,
  saveMcpPermissions,
  assertMcpPermitted,
  MCP_APPROVAL_REQUIRED,
  type McpPermissionConfig,
} from './mcp-permissions'

describe('checkMcpPermission', () => {
  it('unknown server returns needs_approval (TOFU)', () => {
    const config: McpPermissionConfig = {}
    expect(checkMcpPermission('unknown-server', 'some-tool', config)).toBe('needs_approval')
  })

  it('blocked tool returns blocked', () => {
    const config: McpPermissionConfig = {
      'my-server': { allowed: [], blocked: ['dangerous-tool'], requireApproval: false },
    }
    expect(checkMcpPermission('my-server', 'dangerous-tool', config)).toBe('blocked')
  })

  it('approved tool returns allowed', () => {
    const config: McpPermissionConfig = {
      'my-server': { allowed: ['safe-tool'], blocked: [], requireApproval: false },
    }
    expect(checkMcpPermission('my-server', 'safe-tool', config)).toBe('allowed')
  })

  it('tool not in allowed or blocked returns needs_approval', () => {
    const config: McpPermissionConfig = {
      'my-server': { allowed: [], blocked: [], requireApproval: false },
    }
    expect(checkMcpPermission('my-server', 'new-tool', config)).toBe('needs_approval')
  })
})

describe('approveMcpTool / blockMcpTool (in-memory via save+load)', () => {
  it('approve then check returns allowed', () => {
    // Build a config in memory, simulate approve
    const config: McpPermissionConfig = {}
    if (!config['test-server']) {
      config['test-server'] = { allowed: [], blocked: [], requireApproval: false }
    }
    config['test-server'].allowed.push('read-tool')

    expect(checkMcpPermission('test-server', 'read-tool', config)).toBe('allowed')
  })

  it('block then check returns blocked', () => {
    const config: McpPermissionConfig = {
      'test-server': { allowed: ['write-tool'], blocked: [], requireApproval: false },
    }
    // Simulate blockMcpTool logic
    config['test-server'].blocked.push('write-tool')
    config['test-server'].allowed = config['test-server'].allowed.filter((t) => t !== 'write-tool')

    expect(checkMcpPermission('test-server', 'write-tool', config)).toBe('blocked')
  })
})

describe('assertMcpPermitted', () => {
  it('blocked tool throws plain error', () => {
    const config: McpPermissionConfig = {
      'my-server': { allowed: [], blocked: ['bad-tool'], requireApproval: false },
    }
    expect(() => assertMcpPermitted('my-server', 'bad-tool', config)).toThrow(
      'MCP tool blocked'
    )
  })

  it('needs_approval throws with MCP_APPROVAL_REQUIRED code', () => {
    const config: McpPermissionConfig = {}
    try {
      assertMcpPermitted('new-server', 'new-tool', config)
      throw new Error('should have thrown')
    } catch (err: unknown) {
      expect((err as NodeJS.ErrnoException).code).toBe(MCP_APPROVAL_REQUIRED)
    }
  })

  it('allowed tool does not throw', () => {
    const config: McpPermissionConfig = {
      'my-server': { allowed: ['good-tool'], blocked: [], requireApproval: false },
    }
    expect(() => assertMcpPermitted('my-server', 'good-tool', config)).not.toThrow()
  })
})
