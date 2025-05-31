import { logger, createLogger, webrtcLogger } from '../logger'

// Mock console methods
const mockConsole = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}

// Store original NODE_ENV
const originalEnv = process.env.NODE_ENV

beforeEach(() => {
  // Reset mocks
  Object.keys(mockConsole).forEach(key => {
    mockConsole[key as keyof typeof mockConsole].mockReset()
  })
  
  // Mock console methods
  global.console = {
    ...global.console,
    debug: mockConsole.debug,
    info: mockConsole.info,
    warn: mockConsole.warn,
    error: mockConsole.error,
  }
})

afterEach(() => {
  // Restore original NODE_ENV
  process.env = { ...process.env, NODE_ENV: originalEnv }
})

describe('Logger', () => {
  describe('in development environment', () => {
    beforeEach(() => {
      process.env = { ...process.env, NODE_ENV: 'development' }
    })

    it('should log debug messages in development', () => {
      logger.debug('Test debug message', { test: true })
      expect(mockConsole.debug).toHaveBeenCalledWith(
        ' Test debug message',
        { test: true }
      )
    })

    it('should log info messages in development', () => {
      logger.info('Test info message')
      expect(mockConsole.info).toHaveBeenCalledWith(' Test info message', '')
    })

    it('should log warnings in development', () => {
      logger.warn('Test warning message')
      expect(mockConsole.warn).toHaveBeenCalledWith(' Test warning message', '')
    })

    it('should log errors in development', () => {
      logger.error('Test error message')
      expect(mockConsole.error).toHaveBeenCalledWith(' Test error message', '')
    })
  })

  describe('in production environment', () => {
    beforeEach(() => {
      process.env = { ...process.env, NODE_ENV: 'production' }
    })

    it('should not log debug messages in production', () => {
      logger.debug('Test debug message')
      expect(mockConsole.debug).not.toHaveBeenCalled()
    })

    it('should not log info messages in production', () => {
      logger.info('Test info message')
      expect(mockConsole.info).not.toHaveBeenCalled()
    })

    it('should still log warnings in production', () => {
      logger.warn('Test warning message')
      expect(mockConsole.warn).toHaveBeenCalledWith(' Test warning message', '')
    })

    it('should still log errors in production', () => {
      logger.error('Test error message')
      expect(mockConsole.error).toHaveBeenCalledTimes(2) // Once for console, once for production service
    })
  })

  describe('context-specific loggers', () => {
    it('should create logger with context', () => {
      const contextLogger = createLogger('TestContext')
      contextLogger.info('Test message')
      expect(mockConsole.info).toHaveBeenCalledWith('[TestContext] Test message', '')
    })

    it('should create child logger with nested context', () => {
      const parentLogger = createLogger('Parent')
      const childLogger = parentLogger.child('Child')
      childLogger.info('Test message')
      expect(mockConsole.info).toHaveBeenCalledWith('[Parent:Child] Test message', '')
    })

    it('should have WebRTC logger with correct context', () => {
      webrtcLogger.info('WebRTC message')
      expect(mockConsole.info).toHaveBeenCalledWith('[WebRTC] WebRTC message', '')
    })
  })
}) 