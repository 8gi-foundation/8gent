import { describe, it, expect } from 'bun:test'
import { validatePath } from './validate-path'

describe('validatePath', () => {
  it('normal file resolves correctly', () => {
    const result = validatePath('/base', 'file.txt')
    expect(result).toBe('/base/file.txt')
  })

  it('traversal with ../../etc/passwd throws', () => {
    expect(() => validatePath('/base', '../../etc/passwd')).toThrow(
      'Path traversal blocked'
    )
  })

  it('absolute path outside base throws', () => {
    expect(() => validatePath('/base', '/etc/passwd')).toThrow(
      'Path traversal blocked'
    )
  })

  it('subdirectory resolves correctly', () => {
    const result = validatePath('/base', 'sub/file.txt')
    expect(result).toBe('/base/sub/file.txt')
  })

  it('same dir traversal throws', () => {
    expect(() => validatePath('/base', './../../file')).toThrow(
      'Path traversal blocked'
    )
  })

  it('absolute path inside base is allowed', () => {
    const result = validatePath('/base', '/base/file.txt')
    expect(result).toBe('/base/file.txt')
  })
})
