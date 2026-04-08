import path from 'path'

export function validatePath(baseDir: string, filename: string): string {
  const resolvedBase = path.resolve(baseDir)
  const resolvedTarget = path.resolve(baseDir, filename)
  if (!resolvedTarget.startsWith(resolvedBase + path.sep) && resolvedTarget !== resolvedBase) {
    throw new Error(`Path traversal blocked: "${filename}" resolves outside base directory`)
  }
  return resolvedTarget
}
