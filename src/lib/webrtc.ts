import { webrtcLogger } from './logger'
import { AdaptiveQualityManager } from './adaptive-quality'
import { ConnectionFallbackManager } from './connection-fallbacks'
import { CameraCompatibilityManager } from './camera-compatibility'

export class WebRTCService {
  private peerConnection: RTCPeerConnection
  private localStream: MediaStream | null = null
  private remoteStream: MediaStream | null = null
  private socket: any
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private connectionTimeout: NodeJS.Timeout | null = null
  private qualityMonitor: NodeJS.Timeout | null = null
  private networkQuality: 'good' | 'fair' | 'poor' = 'good'
  private lastConnectionCheck = Date.now()
  private connectionStats = {
    packetsLost: 0,
    packetsReceived: 0,
    bytesReceived: 0,
    latency: 0
  }

  // Enhanced features
  private qualityManager: AdaptiveQualityManager | null = null
  private fallbackManager: ConnectionFallbackManager
  private turnCredentials: any = null
  private currentQualityLevel: string | null = null
  private cameraCompatibilityManager: CameraCompatibilityManager

  constructor(socket: any) {
    this.socket = socket
    this.fallbackManager = new ConnectionFallbackManager()
    this.cameraCompatibilityManager = new CameraCompatibilityManager()
    this.peerConnection = this.createPeerConnection()
    this.setupSocketListeners()
    this.startQualityMonitoring()
    this.requestTurnCredentials()
  }

  private async requestTurnCredentials() {
    try {
      // Request TURN credentials from server
      this.socket.emit('request-turn-credentials')
      
      this.socket.on('turn-credentials', (credentials: any) => {
        webrtcLogger.info('Received TURN credentials', { 
          username: credentials.username,
          ttl: credentials.ttl 
        })
        this.turnCredentials = credentials
        
        // Recreate peer connection with TURN servers
        if (this.peerConnection.signalingState !== 'closed') {
          this.peerConnection.close()
        }
        this.peerConnection = this.createPeerConnection()
      })
    } catch (error) {
      webrtcLogger.warn('Failed to request TURN credentials, using STUN only', { error })
    }
  }

  private setupSocketListeners() {
    // Enhanced reconnection handling
    this.socket.on('peer-reconnected', (data: { socketId: string, networkQuality: string }) => {
      webrtcLogger.info('Peer reconnected successfully', data)
      this.clearConnectionTimeout()
      this.reconnectAttempts = 0
      
      // Restart ICE if needed
      if (this.peerConnection.iceConnectionState === 'failed' || 
          this.peerConnection.iceConnectionState === 'disconnected') {
        this.restartConnection()
      }
    })

    this.socket.on('peer-disconnected', (data: { reason: string, canReconnect: boolean, maxWaitTime?: number }) => {
      webrtcLogger.info('Peer disconnected', data)
      
      if (data.canReconnect && data.maxWaitTime) {
        // Wait for potential reconnection
        this.setConnectionTimeout(data.maxWaitTime)
        window.dispatchEvent(new CustomEvent('webrtc-peer-reconnecting', { 
          detail: { maxWaitTime: data.maxWaitTime } 
        }))
      } else {
        // Permanent disconnect
        window.dispatchEvent(new CustomEvent('webrtc-peer-left', { 
          detail: { reason: data.reason } 
        }))
      }
    })

    this.socket.on('peer-quality-changed', (data: { quality: string, metrics: any }) => {
      webrtcLogger.info('Peer quality changed', data)
      window.dispatchEvent(new CustomEvent('peer-quality-changed', { detail: data }))
    })

    this.socket.on('connection-error', (data: { message: string }) => {
      webrtcLogger.error('Server reported connection error', data)
      this.handleConnectionFailure()
    })

    // Mobile optimizations
    document.addEventListener('visibilitychange', () => {
      this.fallbackManager.handleMobileVisibilityChange(
        !document.hidden, 
        this
      )
    })

    // Network change detection
    if ('connection' in navigator) {
      (navigator as any).connection.addEventListener('change', () => {
        this.fallbackManager.handleMobileNetworkChange()
      })
    }
  }

  private createPeerConnection() {
    // Start with reliable public STUN servers (for initial NAT detection)
    const iceServers: RTCIceServer[] = [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun.cloudflare.com:3478' },
      { urls: 'stun:global.stun.twilio.com:3478' },
      { urls: 'stun:stun.stunprotocol.org:3478' },
      { urls: 'stun:stun4.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' }
    ]

    // Add multiple FREE TURN server providers for maximum redundancy
    // This creates a "super WebRTC" setup with multiple fallbacks
    
    // 1. OpenRelay Project (always free, no credentials needed)
    iceServers.push(
      {
        urls: 'turn:openrelay.metered.ca:80',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      },
      {
        urls: 'turn:openrelay.metered.ca:443',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      },
      {
        urls: 'turn:openrelay.metered.ca:443?transport=tcp',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      }
    )

    // 2. ExpressTURN (free tier with higher bandwidth)
    const expressTurnUsername = process.env.NEXT_PUBLIC_EXPRESSTURN_USERNAME
    const expressTurnCredential = process.env.NEXT_PUBLIC_EXPRESSTURN_CREDENTIAL
    
    if (expressTurnUsername && expressTurnCredential) {
      iceServers.push(
        {
          urls: 'turn:relay1.expressturn.com:3480',
          username: expressTurnUsername,
          credential: expressTurnCredential
        },
        {
          urls: 'turn:relay1.expressturn.com:3480?transport=tcp',
          username: expressTurnUsername,
          credential: expressTurnCredential
        }
      )
    }

    // 3. Check for custom/self-hosted TURN servers
    if (this.turnCredentials) {
      // Use dynamically generated credentials from server
      this.turnCredentials.uris?.forEach((uri: string) => {
        iceServers.push({
          urls: uri,
          username: this.turnCredentials.username,
          credential: this.turnCredentials.credential
        })
      })
    } else {
      // 4. Metered.ca Premium (if configured)
      const meteredUsername = process.env.NEXT_PUBLIC_METERED_USERNAME
      const meteredCredential = process.env.NEXT_PUBLIC_METERED_CREDENTIAL
      
      if (meteredUsername && meteredCredential) {
        iceServers.push(
          { urls: 'stun:stun.relay.metered.ca:80' },
          {
            urls: 'turn:relay.metered.ca:80',
            username: meteredUsername,
            credential: meteredCredential
          },
          {
            urls: 'turn:relay.metered.ca:443',
            username: meteredUsername,
            credential: meteredCredential
          }
        )
      }
    }

    const pc = new RTCPeerConnection({
      iceServers,
      iceCandidatePoolSize: 15, // Increased for faster connections
      bundlePolicy: 'max-bundle', // Optimize for fewer network connections
      rtcpMuxPolicy: 'require',   // Reduce port usage
      iceTransportPolicy: 'all'   // Use both STUN and TURN
    })

    pc.ontrack = this.handleTrack.bind(this)
    pc.onicecandidate = this.handleIceCandidate.bind(this)
    
    // Enhanced connection state monitoring
    pc.oniceconnectionstatechange = () => {
      webrtcLogger.info('ICE connection state changed', { state: pc.iceConnectionState })
      
      switch (pc.iceConnectionState) {
        case 'connected':
        case 'completed':
          this.clearConnectionTimeout()
          this.reconnectAttempts = 0
          this.networkQuality = 'good'
          webrtcLogger.info('WebRTC connection established successfully')
          window.dispatchEvent(new CustomEvent('webrtc-connected'))
          break
          
        case 'disconnected':
          webrtcLogger.warn('WebRTC connection disconnected, monitoring for recovery')
          // Don't immediately fail - monitor for recovery
          this.setConnectionTimeout(15000) // 15 second grace period
          break
          
        case 'failed':
          webrtcLogger.error('WebRTC connection failed')
          this.handleConnectionFailure()
          break
          
        case 'checking':
          webrtcLogger.info('Checking connectivity...')
          this.setConnectionTimeout(30000) // 30 seconds for initial connection
          break
      }
    }

    pc.onconnectionstatechange = () => {
      webrtcLogger.info('Connection state changed', { state: pc.connectionState })
      
      if (pc.connectionState === 'connected') {
        this.startQualityMonitoring()
        // Initialize adaptive quality management
        if (!this.qualityManager) {
          this.qualityManager = new AdaptiveQualityManager(pc)
          this.qualityManager.onQualityChange((quality) => {
            webrtcLogger.info('Quality automatically adjusted', { quality })
            window.dispatchEvent(new CustomEvent('quality-changed', { detail: quality }))
          })
        }
      } else if (pc.connectionState === 'failed') {
        this.handleConnectionFailure()
      }
    }

    // Monitor data channel state if using data channels
    pc.ondatachannel = (event) => {
      const channel = event.channel
      channel.onopen = () => webrtcLogger.info('Data channel opened')
      channel.onclose = () => webrtcLogger.info('Data channel closed')
      channel.onerror = (error) => webrtcLogger.error('Data channel error', { error })
    }
    
    return pc
  }

  private startQualityMonitoring() {
    // Clear existing monitor
    if (this.qualityMonitor) {
      clearInterval(this.qualityMonitor)
    }

    this.qualityMonitor = setInterval(async () => {
      try {
        const stats = await this.peerConnection.getStats()
        await this.analyzeConnectionQuality(stats)
      } catch (error) {
        webrtcLogger.warn('Failed to get connection stats', { error })
      }
    }, 5000) // Check every 5 seconds
  }

  private async analyzeConnectionQuality(stats: RTCStatsReport) {
    let totalPacketsLost = 0
    let totalPacketsReceived = 0
    let totalBytesReceived = 0
    let roundTripTime = 0

    // Fix TypeScript iterator issue
    const statsArray = Array.from(stats.values())
    for (const report of statsArray) {
      if (report.type === 'inbound-rtp' && report.mediaType === 'video') {
        totalPacketsLost += report.packetsLost || 0
        totalPacketsReceived += report.packetsReceived || 0
        totalBytesReceived += report.bytesReceived || 0
      } else if (report.type === 'candidate-pair' && report.state === 'succeeded') {
        roundTripTime = report.currentRoundTripTime || 0
      }
    }

    const packetLossRate = totalPacketsReceived > 0 ? totalPacketsLost / totalPacketsReceived : 0
    const latency = roundTripTime * 1000 // Convert to ms

    // Update internal stats
    this.connectionStats = {
      packetsLost: totalPacketsLost,
      packetsReceived: totalPacketsReceived,
      bytesReceived: totalBytesReceived,
      latency
    }

    // Determine network quality
    const oldQuality = this.networkQuality
    if (latency < 100 && packetLossRate < 0.01) {
      this.networkQuality = 'good'
    } else if (latency < 300 && packetLossRate < 0.05) {
      this.networkQuality = 'fair'
    } else {
      this.networkQuality = 'poor'
    }

    // Report quality to server
    this.socket.emit('report-quality', {
      latency,
      packetLoss: packetLossRate,
      bandwidth: totalBytesReceived
    })

    // Handle poor quality with fallbacks
    if (this.networkQuality === 'poor' && oldQuality !== 'poor') {
      webrtcLogger.warn('Poor network quality detected, initiating fallback')
      await this.fallbackManager.handleConnectionFailure(
        'Poor network quality',
        this.networkQuality,
        this
      )
    }

    // Notify about quality changes
    if (oldQuality !== this.networkQuality) {
      webrtcLogger.info('Network quality changed', {
        oldQuality,
        newQuality: this.networkQuality,
        latency,
        packetLossRate
      })
      
      window.dispatchEvent(new CustomEvent('network-quality-changed', {
        detail: {
          quality: this.networkQuality,
          metrics: { latency, packetLossRate, bandwidth: totalBytesReceived }
        }
      }))

      // Attempt upgrade if quality improved
      if (this.networkQuality === 'good' && oldQuality !== 'good') {
        this.fallbackManager.attemptUpgrade(this, this.networkQuality)
      }
    }
  }

  async startLocalStream() {
    try {
      // Check if peer connection is still valid
      if (this.peerConnection.signalingState === 'closed') {
        webrtcLogger.info('Peer connection is closed, recreating connection')
        this.peerConnection = this.createPeerConnection()
      }

      webrtcLogger.info('🔍 Starting camera compatibility check for HP EliteBook...')
      
      // HP EliteBook specific: Run compatibility check first
      const compatibilityResult = await this.cameraCompatibilityManager.detectCameraIssues()
      
      if (!compatibilityResult.isSupported) {
        webrtcLogger.error('❌ Camera not supported on this hardware', compatibilityResult)
        
        // Try audio-only fallback
        webrtcLogger.info('🎤 Attempting audio-only fallback...')
        const audioConstraints = this.cameraCompatibilityManager.getAudioOnlyConstraints()
        
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia(audioConstraints)
          this.localStream = audioStream
          
          if (this.peerConnection.signalingState !== 'closed') {
            audioStream.getTracks().forEach(track => {
              this.peerConnection.addTrack(track, audioStream)
              webrtcLogger.info('Added audio-only track', { kind: track.kind })
            })
          }
          
          // Notify user about video limitation
          window.dispatchEvent(new CustomEvent('camera-unavailable', {
            detail: { 
              message: 'Camera unavailable - using audio only mode',
              issues: compatibilityResult.issues,
              fixes: compatibilityResult.fixes 
            }
          }))
          
          return audioStream
        } catch (audioError) {
          webrtcLogger.error('Audio-only fallback also failed', audioError)
          throw new Error(`Neither video nor audio available: ${audioError}`)
        }
      }

      // Log compatibility issues for HP EliteBook
      if (compatibilityResult.issues.length > 0) {
        webrtcLogger.warn('⚠️ Camera compatibility issues detected:', compatibilityResult.issues)
        webrtcLogger.info('🔧 Applying fixes:', compatibilityResult.fixes)
      }

      // HP EliteBook specific: Use detected constraints or fallback
      const constraints = compatibilityResult.recommendedConstraints

      // CRITICAL FIX: Disable aggressive quality upgrades that cause OverconstrainedError
      // Use ONLY the recommended constraints from compatibility check
      webrtcLogger.info('🎯 Using compatibility-detected constraints only (no upgrades)')
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        
        this.localStream = stream
        webrtcLogger.info('✅ Camera stream successful with compatibility constraints', {
          videoTrack: stream.getVideoTracks()[0]?.getSettings(),
          audioTrack: stream.getAudioTracks()[0]?.getSettings()
        })
        
        // Only add tracks if peer connection is not closed
        if (this.peerConnection.signalingState !== 'closed') {
          stream.getTracks().forEach(track => {
            this.peerConnection.addTrack(track, stream)
            
            // Set up track event listeners
            track.addEventListener('ended', () => {
              webrtcLogger.warn('Media track ended', { kind: track.kind })
              this.handleTrackEnded(track)
            })
          })
        }

        // Initialize adaptive quality manager
        if (this.qualityManager) {
          this.qualityManager.setLocalStream(stream)
          this.qualityManager.startMonitoring()
        }
        
        // Store the working quality level for future reference
        this.currentQualityLevel = 'compatibility-detected'
        
        return stream
        
      } catch (compatibilityError) {
        webrtcLogger.warn('❌ Compatibility constraints failed, trying emergency fallback:', compatibilityError)
        
        // Emergency: Try audio-only
        try {
          const audioConstraints = this.cameraCompatibilityManager.getAudioOnlyConstraints()
          const audioStream = await navigator.mediaDevices.getUserMedia(audioConstraints)
          
          this.localStream = audioStream
          this.currentQualityLevel = 'audio-only-emergency'
          
          if (this.peerConnection.signalingState !== 'closed') {
            audioStream.getTracks().forEach(track => {
              this.peerConnection.addTrack(track, audioStream)
            })
          }
          
          webrtcLogger.info('✅ Emergency audio-only stream successful')
          
          // Show user notification
          window.dispatchEvent(new CustomEvent('camera-emergency-fallback', {
            detail: { 
              message: 'Camera had issues - using audio only mode',
              error: compatibilityError instanceof Error ? compatibilityError.message : String(compatibilityError)
            }
          }))
          
          return audioStream
          
        } catch (audioError) {
          webrtcLogger.error('💀 Even audio-only failed:', audioError)
          throw new Error(`Complete media failure: Video failed (${compatibilityError}), Audio failed (${audioError})`)
        }
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      webrtcLogger.error('Failed to access media devices at any quality level', { error: errorMessage })
      
      // Report error to server
      this.socket.emit('report-error', {
        type: 'media',
        message: 'Failed to access camera/microphone at any quality level',
        error: errorMessage
      })
      
      throw error
    }
  }

  private handleTrackEnded(track: MediaStreamTrack) {
    webrtcLogger.warn('Media track ended, attempting to replace', { kind: track.kind })
    
    // Try to get a new track of the same kind
    const constraints = track.kind === 'video' 
      ? { video: true, audio: false }
      : { video: false, audio: true }
    
    navigator.mediaDevices.getUserMedia(constraints)
      .then(newStream => {
        const newTrack = newStream.getTracks()[0]
        
        // Replace the track in the peer connection
        const sender = this.peerConnection.getSenders().find(s => 
          s.track && s.track.kind === track.kind
        )
        
        if (sender) {
          sender.replaceTrack(newTrack)
          webrtcLogger.info('Successfully replaced media track', { kind: track.kind })
        }
      })
      .catch((error: Error) => {
        webrtcLogger.error('Failed to replace media track', { error: error.message, kind: track.kind })
      })
  }

  private handleTrack(event: RTCTrackEvent) {
    webrtcLogger.info('Received remote track', { 
      kind: event.track.kind,
      readyState: event.track.readyState 
    })
    
    if (event.streams && event.streams[0]) {
      this.remoteStream = event.streams[0]
      window.dispatchEvent(new CustomEvent('remote-stream', { 
        detail: { stream: this.remoteStream } 
      }))
    }
  }

  private handleIceCandidate(event: RTCPeerConnectionIceEvent) {
    if (event.candidate) {
      // Log relay candidates (TURN usage)
      if (event.candidate.candidate.includes('relay')) {
        webrtcLogger.info('Using TURN relay candidate', { 
          candidate: event.candidate.candidate.substring(0, 50) + '...' 
        })
      }
      
      this.socket.emit('ice-candidate', event.candidate)
    } else {
      webrtcLogger.debug('ICE candidate gathering completed')
    }
  }

  private async handleConnectionFailure() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      webrtcLogger.warn('Connection failed, attempting reconnection', { 
        attempt: this.reconnectAttempts, 
        maxAttempts: this.maxReconnectAttempts 
      })
      
      // Notify about reconnection attempt
      window.dispatchEvent(new CustomEvent('webrtc-reconnecting', { 
        detail: { attempt: this.reconnectAttempts } 
      }))
      
      // Use fallback manager for intelligent recovery
      await this.fallbackManager.handleConnectionFailure(
        `Connection attempt ${this.reconnectAttempts} failed`,
        this.networkQuality,
        this
      )
      
      // Try reconnection with exponential backoff
      const backoffDelay = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 10000)
      setTimeout(() => {
        this.restartConnection()
      }, backoffDelay)
      
    } else {
      webrtcLogger.error('Max reconnection attempts reached, connection failed permanently')
      
      // Final fallback attempt
      await this.fallbackManager.handleConnectionFailure(
        'Max reconnection attempts reached',
        'poor',
        this
      )
      
      // Report error to server
      this.socket.emit('report-error', {
        type: 'network',
        message: 'Max reconnection attempts reached',
        attempts: this.reconnectAttempts
      })
      
      window.dispatchEvent(new CustomEvent('webrtc-failed'))
    }
  }

  private async restartConnection() {
    try {
      webrtcLogger.info('Restarting WebRTC connection')
      
      // Recreate peer connection
      this.cleanup(false) // Don't stop tracks
      this.peerConnection = this.createPeerConnection()
      
      // Re-add tracks only if we have them and peer connection is valid
      if (this.localStream && this.peerConnection.signalingState !== 'closed') {
        this.localStream.getTracks().forEach(track => {
          try {
            this.peerConnection.addTrack(track, this.localStream!)
          } catch (error) {
            webrtcLogger.error('Failed to re-add track during reconnection', { error })
          }
        })
      }
      
      // Restart ICE
      if (this.peerConnection.restartIce) {
        this.peerConnection.restartIce()
      }
      
      // Try to create a new offer
      await this.createOffer()
      
    } catch (error) {
      webrtcLogger.error('Failed to restart connection', { error })
      this.handleConnectionFailure()
    }
  }

  private setConnectionTimeout(timeout: number = 15000) {
    // Clear any existing timeout
    this.clearConnectionTimeout()
    
    // Set a new timeout
    this.connectionTimeout = setTimeout(() => {
      if (this.peerConnection.iceConnectionState !== 'connected' && 
          this.peerConnection.iceConnectionState !== 'completed') {
        webrtcLogger.warn('Connection timeout reached', { 
          currentState: this.peerConnection.iceConnectionState,
          timeout
        })
        this.handleConnectionFailure()
      }
    }, timeout)
  }

  private clearConnectionTimeout() {
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout)
      this.connectionTimeout = null
    }
  }

  async createOffer() {
    try {
      this.setConnectionTimeout(30000) // 30 seconds for offer creation
      
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
        iceRestart: this.reconnectAttempts > 0 // Use ice restart for reconnection attempts
      })
      
      await this.peerConnection.setLocalDescription(offer)
      this.socket.emit('offer', offer)
      webrtcLogger.info('WebRTC offer created and sent successfully')
      return offer
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      webrtcLogger.error('Failed to create WebRTC offer', { error: errorMessage })
      
      // Report error to server
      this.socket.emit('report-error', {
        type: 'webrtc',
        message: 'Failed to create offer',
        error: errorMessage
      })
      
      throw error
    }
  }

  async handleOffer(offer: RTCSessionDescriptionInit) {
    try {
      this.setConnectionTimeout(30000)
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
      const answer = await this.peerConnection.createAnswer()
      await this.peerConnection.setLocalDescription(answer)
      this.socket.emit('answer', answer)
      webrtcLogger.info('WebRTC offer handled and answer sent successfully')
      return answer
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      webrtcLogger.error('Failed to handle WebRTC offer', { error: errorMessage })
      
      // Report error to server
      this.socket.emit('report-error', {
        type: 'webrtc',
        message: 'Failed to handle offer',
        error: errorMessage
      })
      
      throw error
    }
  }

  async handleAnswer(answer: RTCSessionDescriptionInit) {
    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
      webrtcLogger.info('WebRTC answer handled successfully')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      webrtcLogger.error('Failed to handle WebRTC answer', { error: errorMessage })
      
      // Report error to server
      this.socket.emit('report-error', {
        type: 'webrtc',
        message: 'Failed to handle answer',
        error: errorMessage
      })
      
      throw error
    }
  }

  async addIceCandidate(candidate: RTCIceCandidateInit) {
    try {
      await this.peerConnection.addIceCandidate(candidate)
      webrtcLogger.debug('ICE candidate added successfully')
    } catch (error) {
      // Don't throw here, just log - this can happen normally sometimes
      webrtcLogger.warn('Failed to add ICE candidate (non-critical)', { error })
    }
  }

  // Get current connection statistics
  getConnectionStats() {
    return {
      ...this.connectionStats,
      networkQuality: this.networkQuality,
      reconnectAttempts: this.reconnectAttempts,
      connectionState: this.peerConnection.connectionState,
      iceConnectionState: this.peerConnection.iceConnectionState,
      fallbackState: this.fallbackManager.getCurrentState()
    }
  }

  // Quality management methods
  async setVideoQuality(qualityLabel: string): Promise<boolean> {
    if (this.qualityManager) {
      return await this.qualityManager.setQuality(qualityLabel)
    }
    return false
  }

  getAvailableQualities() {
    if (this.qualityManager) {
      return this.qualityManager.getAvailableQualities()
    }
    return []
  }

  getCurrentQuality() {
    if (this.qualityManager) {
      return this.qualityManager.getCurrentQuality()
    }
    return null
  }

  // Fallback management methods
  getFallbackState() {
    return this.fallbackManager.getCurrentState()
  }

  getFallbackRecommendations() {
    return this.fallbackManager.getRecommendations()
  }

  cleanup(stopTracks = true) {
    webrtcLogger.info('Cleaning up WebRTC connection', { stopTracks })
    
    this.clearConnectionTimeout()
    
    if (this.qualityMonitor) {
      clearInterval(this.qualityMonitor)
      this.qualityMonitor = null
    }

    if (this.qualityManager) {
      this.qualityManager.stopMonitoring()
      this.qualityManager = null
    }
    
    if (stopTracks && this.localStream) {
      this.localStream.getTracks().forEach(track => {
        track.stop()
        webrtcLogger.debug('Stopped local media track', { kind: track.kind })
      })
      this.localStream = null
    }
    
    if (this.peerConnection && this.peerConnection.signalingState !== 'closed') {
      this.peerConnection.close()
      webrtcLogger.debug('Peer connection closed')
    }

    this.remoteStream = null
    this.reconnectAttempts = 0
    this.networkQuality = 'good'
    this.fallbackManager.reset()
  }

  getLocalStream() {
    return this.localStream
  }

  getRemoteStream() {
    return this.remoteStream
  }

  getPeerConnection() {
    return this.peerConnection
  }

  // HP EliteBook specific camera failure handler
  private handleEliteBookCameraFailure() {
    webrtcLogger.error('🚨 HP EliteBook camera cycling detected - implementing fixes')
    
    // Stop current stream to break the cycle
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop())
      this.localStream = null
    }
    
    // Wait before retry to let camera stabilize
    setTimeout(async () => {
      try {
        webrtcLogger.info('♻️ Retrying HP EliteBook camera with audio-only fallback')
        const audioConstraints = this.cameraCompatibilityManager.getAudioOnlyConstraints()
        const audioStream = await navigator.mediaDevices.getUserMedia(audioConstraints)
        
        this.localStream = audioStream
        
        if (this.peerConnection.signalingState !== 'closed') {
          audioStream.getTracks().forEach(track => {
            this.peerConnection.addTrack(track, audioStream)
          })
        }
        
        // Notify user about camera issue
        window.dispatchEvent(new CustomEvent('camera-cycling-detected', {
          detail: { 
            message: 'Camera hardware issue detected - switched to audio only',
            troubleshooting: this.cameraCompatibilityManager.getTroubleshootingSteps()
          }
        }))
        
      } catch (retryError) {
        webrtcLogger.error('HP EliteBook camera retry failed completely', retryError)
      }
    }, 3000) // 3 second delay to let camera settle
  }
}