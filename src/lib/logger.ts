type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  data?: any
  timestamp: string
  context?: string
}

class Logger {
  private isDevelopment = process.env.NODE_ENV !== 'production'
  private context: string = ''

  constructor(context?: string) {
    this.context = context || ''
  }

  private formatMessage(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
      context: this.context
    }
  }

  private shouldLog(level: LogLevel): boolean {
    // In development, log everything
    if (this.isDevelopment) {
      return true
    }

    // In production, only log warnings and errors
    return level === 'warn' || level === 'error'
  }

  private logToConsole(entry: LogEntry) {
    const prefix = this.context ? `[${this.context}]` : ''
    const message = `${prefix} ${entry.message}`

    switch (entry.level) {
      case 'debug':
        console.debug(message, entry.data || '')
        break
      case 'info':
        console.info(message, entry.data || '')
        break
      case 'warn':
        console.warn(message, entry.data || '')
        break
      case 'error':
        console.error(message, entry.data || '')
        break
    }
  }

  private logToService(entry: LogEntry) {
    // TODO: Add integration with logging services like:
    // - Vercel Analytics
    // - Sentry
    // - LogRocket
    // - DataDog
    
    // For now, we'll use console in production for critical errors
    if (entry.level === 'error') {
      console.error(`[PRODUCTION ERROR] ${entry.message}`, entry.data)
    }
  }

  debug(message: string, data?: any) {
    const entry = this.formatMessage('debug', message, data)
    if (this.shouldLog('debug')) {
      this.logToConsole(entry)
    }
  }

  info(message: string, data?: any) {
    const entry = this.formatMessage('info', message, data)
    if (this.shouldLog('info')) {
      this.logToConsole(entry)
    }
  }

  warn(message: string, data?: any) {
    const entry = this.formatMessage('warn', message, data)
    if (this.shouldLog('warn')) {
      this.logToConsole(entry)
      this.logToService(entry)
    }
  }

  error(message: string, data?: any) {
    const entry = this.formatMessage('error', message, data)
    if (this.shouldLog('error')) {
      this.logToConsole(entry)
      this.logToService(entry)
    }
  }

  // Method to create a child logger with additional context
  child(childContext: string): Logger {
    const newContext = this.context ? `${this.context}:${childContext}` : childContext
    return new Logger(newContext)
  }
}

// Create default logger instance
export const logger = new Logger()

// Create context-specific loggers
export const createLogger = (context: string) => new Logger(context)

// WebRTC specific logger
export const webrtcLogger = createLogger('WebRTC')

// Server specific logger  
export const serverLogger = createLogger('Server')

// API specific logger
export const apiLogger = createLogger('API')

// Auth specific logger
export const authLogger = createLogger('Auth') 