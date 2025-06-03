interface FallbackOptions {
  enableAudioOnly: boolean
  enableTextOnly: boolean
  enableLowQuality: boolean
  retryAttempts: number
  adaptiveQuality: boolean
}

interface ConnectionState {
  mode: 'full' | 'audio-only' | 'text-only' | 'failed'
  quality: 'high' | 'medium' | 'low' | 'minimal'
  reason: string
  canUpgrade: boolean
}

export class ConnectionFallbackManager {
  private currentState: ConnectionState
  private options: FallbackOptions
  private stateChangeCallbacks: Array<(state: ConnectionState) => void> = []
  private upgradeAttempts = 0
  private readonly MAX_UPGRADE_ATTEMPTS = 3

  constructor(options: Partial<FallbackOptions> = {}) {
    this.options = {
      enableAudioOnly: true,
      enableTextOnly: true,
      enableLowQuality: true,
      retryAttempts: 3,
      adaptiveQuality: true,
      ...options
    }

    this.currentState = {
      mode: 'full',
      quality: 'high',
      reason: 'initial',
      canUpgrade: false
    }
  }

  // Handle different types of connection failures
  async handleConnectionFailure(
    error: string, 
    networkQuality: 'good' | 'fair' | 'poor',
    webrtcService: any
  ): Promise<ConnectionState> {
    console.log('Handling connection failure:', error, 'Network quality:', networkQuality)

    // Determine best fallback strategy based on error type and network quality
    if (error.includes('camera') || error.includes('video')) {
      return await this.fallbackToAudioOnly(webrtcService, 'Camera/video issues detected')
    }

    if (error.includes('microphone') || error.includes('audio')) {
      return await this.fallbackToTextOnly('Microphone/audio issues detected')
    }

    if (networkQuality === 'poor') {
      if (this.options.enableAudioOnly && this.currentState.mode === 'full') {
        return await this.fallbackToAudioOnly(webrtcService, 'Poor network quality')
      } else if (this.options.enableTextOnly) {
        return await this.fallbackToTextOnly('Network too poor for audio/video')
      }
    }

    if (networkQuality === 'fair') {
      return await this.fallbackToLowQuality(webrtcService, 'Reduced quality due to network conditions')
    }

    // Default fallback chain
    return await this.executeDefaultFallbackChain(webrtcService, error)
  }

  private async executeDefaultFallbackChain(webrtcService: any, reason: string): Promise<ConnectionState> {
    console.log('Executing default fallback chain:', reason)

    // Try low quality first
    if (this.currentState.mode === 'full' && this.currentState.quality !== 'low') {
      const lowQualityResult = await this.fallbackToLowQuality(webrtcService, reason)
      if (lowQualityResult.mode === 'full') {
        return lowQualityResult
      }
    }

    // Then try audio only
    if (this.options.enableAudioOnly && this.currentState.mode !== 'audio-only') {
      const audioOnlyResult = await this.fallbackToAudioOnly(webrtcService, reason)
      if (audioOnlyResult.mode === 'audio-only') {
        return audioOnlyResult
      }
    }

    // Finally, text only
    if (this.options.enableTextOnly) {
      return await this.fallbackToTextOnly(reason)
    }

    // Complete failure
    return this.setState({
      mode: 'failed',
      quality: 'minimal',
      reason: 'All fallback attempts failed',
      canUpgrade: true
    })
  }

  async fallbackToAudioOnly(webrtcService: any, reason: string): Promise<ConnectionState> {
    if (!this.options.enableAudioOnly) {
      throw new Error('Audio-only mode disabled')
    }

    try {
      console.log('Attempting fallback to audio-only mode:', reason)

      // Stop video tracks but keep audio
      const localStream = webrtcService.getLocalStream()
      if (localStream) {
        const videoTracks = localStream.getVideoTracks()
        videoTracks.forEach((track: MediaStreamTrack) => {
          track.stop()
          localStream.removeTrack(track)
        })
      }

      // Try to get audio-only stream
      const audioStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }, 
        video: false 
      })

      // Replace tracks in peer connection
      const audioTrack = audioStream.getAudioTracks()[0]
      if (audioTrack) {
        const sender = webrtcService.getPeerConnection().getSenders().find((s: RTCRtpSender) => 
          s.track && s.track.kind === 'audio'
        )
        if (sender) {
          await sender.replaceTrack(audioTrack)
        } else {
          webrtcService.getPeerConnection().addTrack(audioTrack, audioStream)
        }
      }

      return this.setState({
        mode: 'audio-only',
        quality: 'medium',
        reason,
        canUpgrade: true
      })
    } catch (error) {
      console.error('Audio-only fallback failed:', error)
      return await this.fallbackToTextOnly(`Audio-only failed: ${error}`)
    }
  }

  async fallbackToTextOnly(reason: string): Promise<ConnectionState> {
    if (!this.options.enableTextOnly) {
      throw new Error('Text-only mode disabled')
    }

    console.log('Falling back to text-only mode:', reason)

    // Emit event to UI to show text-only interface
    window.dispatchEvent(new CustomEvent('connection-fallback-text-only', {
      detail: { reason }
    }))

    return this.setState({
      mode: 'text-only',
      quality: 'minimal',
      reason,
      canUpgrade: true
    })
  }

  async fallbackToLowQuality(webrtcService: any, reason: string): Promise<ConnectionState> {
    if (!this.options.enableLowQuality) {
      throw new Error('Low quality mode disabled')
    }

    try {
      console.log('Attempting fallback to low quality:', reason)

      // Get low quality stream
      const lowQualityStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { max: 320 },
          height: { max: 240 },
          frameRate: { max: 15 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true
        }
      })

      // Replace video track
      const videoTrack = lowQualityStream.getVideoTracks()[0]
      if (videoTrack) {
        const sender = webrtcService.getPeerConnection().getSenders().find((s: RTCRtpSender) => 
          s.track && s.track.kind === 'video'
        )
        if (sender) {
          await sender.replaceTrack(videoTrack)
        }
      }

      return this.setState({
        mode: 'full',
        quality: 'low',
        reason,
        canUpgrade: true
      })
    } catch (error) {
      console.error('Low quality fallback failed:', error)
      return await this.fallbackToAudioOnly(webrtcService, `Low quality failed: ${error}`)
    }
  }

  // Attempt to upgrade connection when conditions improve
  async attemptUpgrade(webrtcService: any, networkQuality: 'good' | 'fair' | 'poor'): Promise<boolean> {
    if (!this.currentState.canUpgrade || this.upgradeAttempts >= this.MAX_UPGRADE_ATTEMPTS) {
      return false
    }

    this.upgradeAttempts++
    console.log(`Attempting connection upgrade (${this.upgradeAttempts}/${this.MAX_UPGRADE_ATTEMPTS})`)

    try {
      if (this.currentState.mode === 'text-only' && networkQuality !== 'poor') {
        // Try to upgrade to audio
        const result = await this.upgradeToAudio(webrtcService)
        if (result) {
          this.upgradeAttempts = 0 // Reset on success
          return true
        }
      }

      if (this.currentState.mode === 'audio-only' && networkQuality === 'good') {
        // Try to upgrade to full video
        const result = await this.upgradeToVideo(webrtcService)
        if (result) {
          this.upgradeAttempts = 0 // Reset on success
          return true
        }
      }

      if (this.currentState.quality === 'low' && networkQuality === 'good') {
        // Try to upgrade quality
        const result = await this.upgradeQuality(webrtcService)
        if (result) {
          this.upgradeAttempts = 0 // Reset on success
          return true
        }
      }

      return false
    } catch (error) {
      console.error('Upgrade attempt failed:', error)
      return false
    }
  }

  private async upgradeToAudio(webrtcService: any): Promise<boolean> {
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: false 
      })

      const audioTrack = audioStream.getAudioTracks()[0]
      if (audioTrack) {
        webrtcService.getPeerConnection().addTrack(audioTrack, audioStream)
        
        this.setState({
          mode: 'audio-only',
          quality: 'medium',
          reason: 'Upgraded from text-only',
          canUpgrade: true
        })
        return true
      }
      return false
    } catch (error) {
      console.error('Audio upgrade failed:', error)
      return false
    }
  }

  private async upgradeToVideo(webrtcService: any): Promise<boolean> {
    try {
      const videoStream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 30 }
        },
        audio: true 
      })

      const videoTrack = videoStream.getVideoTracks()[0]
      if (videoTrack) {
        webrtcService.getPeerConnection().addTrack(videoTrack, videoStream)
        
        this.setState({
          mode: 'full',
          quality: 'medium',
          reason: 'Upgraded from audio-only',
          canUpgrade: true
        })
        return true
      }
      return false
    } catch (error) {
      console.error('Video upgrade failed:', error)
      return false
    }
  }

  private async upgradeQuality(webrtcService: any): Promise<boolean> {
    try {
      const highQualityStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: true
      })

      const videoTrack = highQualityStream.getVideoTracks()[0]
      if (videoTrack) {
        const sender = webrtcService.getPeerConnection().getSenders().find((s: RTCRtpSender) => 
          s.track && s.track.kind === 'video'
        )
        if (sender) {
          await sender.replaceTrack(videoTrack)
        }
        
        this.setState({
          mode: 'full',
          quality: 'high',
          reason: 'Quality upgraded',
          canUpgrade: false
        })
        return true
      }
      return false
    } catch (error) {
      console.error('Quality upgrade failed:', error)
      return false
    }
  }

  // Mobile-specific optimizations
  handleMobileNetworkChange(): void {
    console.log('Mobile network change detected')
    
    // Reset upgrade attempts on network change
    this.upgradeAttempts = 0
    
    // Emit event for mobile optimization
    window.dispatchEvent(new CustomEvent('mobile-network-change', {
      detail: { currentState: this.currentState }
    }))
  }

  // Handle mobile app going to background/foreground
  handleMobileVisibilityChange(isVisible: boolean, webrtcService: any): void {
    if (!isVisible) {
      // App went to background - reduce quality to save bandwidth
      if (this.currentState.mode === 'full') {
        this.fallbackToAudioOnly(webrtcService, 'App in background')
      }
    } else {
      // App came to foreground - attempt to restore quality
      setTimeout(() => {
        this.attemptUpgrade(webrtcService, 'good') // Assume good quality on foreground
      }, 1000)
    }
  }

  private setState(newState: ConnectionState): ConnectionState {
    this.currentState = newState
    console.log('Connection state changed:', newState)
    
    // Notify all callbacks
    this.stateChangeCallbacks.forEach(callback => callback(newState))
    
    // Emit global event
    window.dispatchEvent(new CustomEvent('connection-state-changed', {
      detail: newState
    }))
    
    return newState
  }

  getCurrentState(): ConnectionState {
    return { ...this.currentState }
  }

  onStateChange(callback: (state: ConnectionState) => void): void {
    this.stateChangeCallbacks.push(callback)
  }

  // Get user-friendly status message
  getStatusMessage(): string {
    switch (this.currentState.mode) {
      case 'full':
        if (this.currentState.quality === 'low') {
          return 'Connected with reduced video quality'
        }
        return 'Connected with full video and audio'
      
      case 'audio-only':
        return 'Connected with audio only'
      
      case 'text-only':
        return 'Connected with text chat only'
      
      case 'failed':
        return 'Connection failed - please try again'
      
      default:
        return 'Connecting...'
    }
  }

  // Get fallback recommendations for user
  getRecommendations(): string[] {
    const recommendations: string[] = []
    
    if (this.currentState.mode === 'text-only') {
      recommendations.push('Check your camera and microphone permissions')
      recommendations.push('Ensure you have a stable internet connection')
      recommendations.push('Try refreshing the page')
    }
    
    if (this.currentState.mode === 'audio-only') {
      recommendations.push('Check your camera permissions')
      recommendations.push('Close other applications using your camera')
      recommendations.push('Try improving your internet connection')
    }
    
    if (this.currentState.quality === 'low') {
      recommendations.push('Close other applications using internet')
      recommendations.push('Move closer to your WiFi router')
      recommendations.push('Use a wired connection if possible')
    }
    
    return recommendations
  }

  // Reset for new connection attempt
  reset(): void {
    this.upgradeAttempts = 0
    this.setState({
      mode: 'full',
      quality: 'high',
      reason: 'Reset for new connection',
      canUpgrade: false
    })
  }
} 