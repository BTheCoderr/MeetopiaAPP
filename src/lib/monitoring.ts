import * as Sentry from '@sentry/nextjs'

// Initialize Sentry (call this in your app startup)
export function initSentry() {
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 0.1, // 10% sampling for performance monitoring
      debug: false,
      integrations: [
        new Sentry.BrowserTracing({
          // Set sampling rate for navigation transactions
          routingInstrumentation: Sentry.nextRouterInstrumentation({
            // Next.js router is not available in server-side rendering
            router: typeof window !== 'undefined' ? require('next/router').default : undefined,
          }),
        }),
      ],
      beforeSend(event) {
        // Filter out some common non-critical errors
        if (event.exception) {
          const error = event.exception.values?.[0]
          if (error?.type === 'ChunkLoadError') {
            return null // Ignore chunk loading errors
          }
          if (error?.value?.includes('Non-Error promise rejection')) {
            return null // Ignore non-error promise rejections
          }
        }
        return event
      },
    })
  }
}

// Monitoring utilities
export const monitoring = {
  // Track errors
  captureError: (error: Error, context?: Record<string, any>) => {
    if (process.env.NODE_ENV === 'production') {
      Sentry.withScope((scope) => {
        if (context) {
          Object.keys(context).forEach(key => {
            scope.setTag(key, context[key])
          })
        }
        Sentry.captureException(error)
      })
    } else {
      console.error('Error captured:', error, context)
    }
  },

  // Track custom events
  captureEvent: (message: string, level: 'info' | 'warning' | 'error' = 'info', extra?: Record<string, any>) => {
    if (process.env.NODE_ENV === 'production') {
      Sentry.withScope((scope) => {
        scope.setLevel(level)
        if (extra) {
          scope.setContext('extra', extra)
        }
        Sentry.captureMessage(message)
      })
    } else {
      console.log(`[${level.toUpperCase()}] ${message}`, extra || '')
    }
  },

  // Track user context
  setUser: (user: { id?: string; email?: string; username?: string }) => {
    if (process.env.NODE_ENV === 'production') {
      Sentry.setUser(user)
    }
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
    if (process.env.NODE_ENV === 'production') {
      return Sentry.startTransaction({ name, op })
    }
    return {
      finish: () => {},
      setTag: () => {},
      setData: () => {},
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

// Error boundary helper
export function withErrorBoundary<T>(
  Component: React.ComponentType<T>,
  fallback?: React.ComponentType<any>
) {
  return Sentry.withErrorBoundary(Component, {
    fallback: fallback || (() => (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 mb-4">
            We've been notified about this issue and are working to fix it.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reload Page
          </button>
        </div>
      </div>
    )),
    beforeCapture: (scope) => {
      scope.setTag('errorBoundary', true)
    },
  })
} 