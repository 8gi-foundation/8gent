/**
 * 8gent Enterprise Toolshed - Logger
 *
 * Structured logging for observability and audit trails.
 */

type LogLevel = "debug" | "info" | "warn" | "error"

interface LogEntry {
  level: LogLevel
  timestamp: string
  service: string
  [key: string]: unknown
}

class Logger {
  private service: string
  private enabled: boolean

  constructor(service: string = "toolshed") {
    this.service = service
    this.enabled = process.env.NODE_ENV !== "test"
  }

  private log(level: LogLevel, data: Record<string, unknown>): void {
    if (!this.enabled) return

    const entry: LogEntry = {
      level,
      timestamp: new Date().toISOString(),
      service: this.service,
      ...data,
    }

    const output = JSON.stringify(entry)

    switch (level) {
      case "error":
        console.error(output)
        break
      case "warn":
        console.warn(output)
        break
      case "debug":
        if (process.env.NODE_ENV === "development") {
          console.debug(output)
        }
        break
      default:
        console.log(output)
    }
  }

  debug(data: Record<string, unknown>): void {
    this.log("debug", data)
  }

  info(data: Record<string, unknown>): void {
    this.log("info", data)
  }

  warn(data: Record<string, unknown>): void {
    this.log("warn", data)
  }

  error(data: Record<string, unknown>): void {
    this.log("error", data)
  }

  /**
   * Create a child logger with additional context.
   */
  child(context: Record<string, unknown>): ChildLogger {
    return new ChildLogger(this, context)
  }
}

class ChildLogger {
  private parent: Logger
  private context: Record<string, unknown>

  constructor(parent: Logger, context: Record<string, unknown>) {
    this.parent = parent
    this.context = context
  }

  private merge(data: Record<string, unknown>): Record<string, unknown> {
    return { ...this.context, ...data }
  }

  debug(data: Record<string, unknown>): void {
    this.parent.debug(this.merge(data))
  }

  info(data: Record<string, unknown>): void {
    this.parent.info(this.merge(data))
  }

  warn(data: Record<string, unknown>): void {
    this.parent.warn(this.merge(data))
  }

  error(data: Record<string, unknown>): void {
    this.parent.error(this.merge(data))
  }
}

// Export singleton instance
export const logger = new Logger("8gent-toolshed")

// Export for creating custom loggers
export { Logger }
