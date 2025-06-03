// Simple monitoring utilities for development and production
export function initSentry() {
  // Sentry initialization would go here in a real implementation
  console.log('Monitoring initialized')
}

// Monitoring utilities
export const monitoring = {
  // Track errors
  captureError: (error: Error, context?: Record<string, any>) => {
    if (process.env.NODE_ENV === 'production') {
      console.error('Error captured:', error, context)
      // In production, you would send this to your monitoring service
    } else {
      console.error('Error captured:', error, context)
    }
  },

  // Track custom events
  captureEvent: (message: string, level: 'info' | 'warning' | 'error' = 'info', extra?: Record<string, any>) => {
    console.log(`[${level.toUpperCase()}] ${message}`, extra || '')
  },

  // Track user context
  setUser: (user: { id?: string; email?: string; username?: string }) => {
    console.log('User context set:', user)
  },

  // Track WebRTC specific events
  trackWebRTCEvent: (event: string, data?: Record<string, any>) => {
    monitoring.captureEvent(`WebRTC: ${event}`, 'info', {
      category: 'webrtc',
      ...data
    })
  },

  // Track performance
  startTransaction: (name: string, op: string = 'navigation') => {
    console.log(`Transaction started: ${name} (${op})`)
    return {
      finish: () => console.log(`Transaction finished: ${name}`),
      setTag: (key: string, value: string) => console.log(`Tag set: ${key}=${value}`),
      setData: (key: string, value: any) => console.log(`Data set: ${key}`, value),
    }
  },

  // Track connection metrics
  trackConnectionMetrics: (metrics: {
    connectionTime?: number
    reconnectAttempts?: number
    connectionQuality?: 'excellent' | 'good' | 'poor'
    iceConnectionState?: string
  }) => {
    monitoring.captureEvent('Connection Metrics', 'info', {
      category: 'performance',
      ...metrics
    })
  },

  // Track user actions
  trackUserAction: (action: string, properties?: Record<string, any>) => {
    monitoring.captureEvent(`User Action: ${action}`, 'info', {
      category: 'user_interaction',
      ...properties
    })
  }
} 