// Analytics utility for tracking user behavior and connection metrics

type AnalyticsEvent = {
  event: string
  properties?: Record<string, any>
  timestamp?: Date
  userId?: string
  sessionId?: string
}

class Analytics {
  private isEnabled: boolean = false
  private userId?: string
  private sessionId: string = ''

  constructor() {
    this.isEnabled = process.env.NODE_ENV === 'production'
    this.sessionId = this.generateSessionId()
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // Initialize analytics with user context
  identify(userId: string, properties?: Record<string, any>) {
    this.userId = userId
    if (this.isEnabled) {
      // Send identify event to analytics service
      this.track('user_identified', {
        userId,
        ...properties,
      })
    }
  }

  // Track custom events
  track(event: string, properties?: Record<string, any>) {
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        referrer: typeof window !== 'undefined' ? document.referrer : undefined,
      },
      timestamp: new Date(),
      userId: this.userId,
      sessionId: this.sessionId,
    }

    if (this.isEnabled) {
      // Send to analytics service (implement based on your provider)
      this.sendToAnalyticsService(analyticsEvent)
    } else {
      // Log in development
      console.log('📊 Analytics Event:', analyticsEvent)
    }
  }

  private async sendToAnalyticsService(event: AnalyticsEvent) {
    try {
      // Example: Send to your analytics API
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      })
    } catch (error) {
      console.warn('Failed to send analytics event:', error)
    }
  }

  // Pre-defined tracking methods for common events
  
  // User actions
  trackUserJoin() {
    this.track('user_joined_platform', {
      timestamp: new Date().toISOString(),
    })
  }

  trackMatchAttempt() {
    this.track('match_attempt_started')
  }

  trackMatchSuccess(timeToMatch: number) {
    this.track('match_successful', {
      timeToMatch,
      matchType: 'random',
    })
  }

  trackMatchFailure(reason: string) {
    this.track('match_failed', {
      reason,
      timestamp: new Date().toISOString(),
    })
  }

  trackCallStarted() {
    this.track('video_call_started')
  }

  trackCallEnded(duration: number, reason: 'user_action' | 'connection_lost' | 'error') {
    this.track('video_call_ended', {
      duration,
      reason,
    })
  }

  trackNextPerson() {
    this.track('next_person_clicked')
  }

  // WebRTC and connection events
  trackConnectionAttempt() {
    this.track('webrtc_connection_attempt')
  }

  trackConnectionSuccess(connectionTime: number) {
    this.track('webrtc_connection_success', {
      connectionTime,
    })
  }

  trackConnectionFailure(error: string, attempts: number) {
    this.track('webrtc_connection_failure', {
      error,
      attempts,
    })
  }

  trackReconnectionAttempt(attemptNumber: number) {
    this.track('webrtc_reconnection_attempt', {
      attemptNumber,
    })
  }

  // Media events
  trackCameraToggle(enabled: boolean) {
    this.track('camera_toggle', {
      enabled,
    })
  }

  trackMicrophoneToggle(enabled: boolean) {
    this.track('microphone_toggle', {
      enabled,
    })
  }

  trackScreenShare(started: boolean) {
    this.track('screen_share', {
      started,
    })
  }

  // UI interactions
  trackFeatureUsed(feature: string) {
    this.track('feature_used', {
      feature,
    })
  }

  trackTutorialStep(step: number, action: 'started' | 'completed' | 'skipped') {
    this.track('tutorial_step', {
      step,
      action,
    })
  }

  trackError(error: string, component: string) {
    this.track('error_occurred', {
      error,
      component,
      severity: 'error',
    })
  }

  // Performance metrics
  trackPageLoad(loadTime: number) {
    this.track('page_load', {
      loadTime,
      page: typeof window !== 'undefined' ? window.location.pathname : undefined,
    })
  }

  trackNetworkQuality(quality: 'excellent' | 'good' | 'fair' | 'poor') {
    this.track('network_quality', {
      quality,
    })
  }
}

// Create and export analytics instance
export const analytics = new Analytics()

// Convenience methods for common tracking
export const trackEvent = (event: string, properties?: Record<string, any>) => {
  analytics.track(event, properties)
}

export const trackUser = (userId: string, properties?: Record<string, any>) => {
  analytics.identify(userId, properties)
}

// React hook for analytics
export function useAnalytics() {
  return {
    track: analytics.track.bind(analytics),
    identify: analytics.identify.bind(analytics),
    trackUserJoin: analytics.trackUserJoin.bind(analytics),
    trackMatchAttempt: analytics.trackMatchAttempt.bind(analytics),
    trackMatchSuccess: analytics.trackMatchSuccess.bind(analytics),
    trackMatchFailure: analytics.trackMatchFailure.bind(analytics),
    trackCallStarted: analytics.trackCallStarted.bind(analytics),
    trackCallEnded: analytics.trackCallEnded.bind(analytics),
    trackNextPerson: analytics.trackNextPerson.bind(analytics),
    trackConnectionAttempt: analytics.trackConnectionAttempt.bind(analytics),
    trackConnectionSuccess: analytics.trackConnectionSuccess.bind(analytics),
    trackConnectionFailure: analytics.trackConnectionFailure.bind(analytics),
    trackCameraToggle: analytics.trackCameraToggle.bind(analytics),
    trackMicrophoneToggle: analytics.trackMicrophoneToggle.bind(analytics),
    trackScreenShare: analytics.trackScreenShare.bind(analytics),
    trackFeatureUsed: analytics.trackFeatureUsed.bind(analytics),
    trackTutorialStep: analytics.trackTutorialStep.bind(analytics),
    trackError: analytics.trackError.bind(analytics),
    trackPageLoad: analytics.trackPageLoad.bind(analytics),
    trackNetworkQuality: analytics.trackNetworkQuality.bind(analytics),
  }
} 