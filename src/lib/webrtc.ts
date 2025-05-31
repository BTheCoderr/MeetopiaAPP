import { webrtcLogger } from './logger'

export class WebRTCService {
  private peerConnection: RTCPeerConnection
  private localStream: MediaStream | null = null
  private remoteStream: MediaStream | null = null
  private socket: any
  private reconnectAttempts = 0
  private maxReconnectAttempts = 3
  private connectionTimeout: NodeJS.Timeout | null = null

  constructor(socket: any) {
    this.socket = socket
    this.peerConnection = this.createPeerConnection()
  }

  private createPeerConnection() {
    // Use multiple STUN/TURN servers for better connectivity
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' }
      ],
      iceCandidatePoolSize: 10 // Increase candidate pool for faster connections
    })

    pc.ontrack = this.handleTrack.bind(this)
    pc.onicecandidate = this.handleIceCandidate.bind(this)
    
    // Monitor connection state changes
    pc.oniceconnectionstatechange = () => {
      webrtcLogger.info('ICE connection state changed', { state: pc.iceConnectionState })
      
      if (pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'disconnected') {
        this.handleConnectionFailure()
      }
      
      if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
        this.clearConnectionTimeout()
        this.reconnectAttempts = 0
        webrtcLogger.info('WebRTC connection established successfully')
      }
    }
    
    return pc
  }

  async startLocalStream() {
    try {
      // Check if peer connection is still valid
      if (this.peerConnection.signalingState === 'closed') {
        webrtcLogger.info('Peer connection is closed, recreating connection')
        this.peerConnection = this.createPeerConnection()
      }

      // Try high quality first
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 }
          }, 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        })
        this.localStream = stream
        
        // Only add tracks if peer connection is not closed
        if (this.peerConnection.signalingState !== 'closed') {
          stream.getTracks().forEach(track => {
            this.peerConnection.addTrack(track, stream)
          })
        }
        webrtcLogger.info('High quality media stream started successfully')
        return stream
      } catch (err) {
        webrtcLogger.warn('High quality stream failed, falling back to standard quality', { error: err })
        // Fallback to standard quality
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        })
        this.localStream = stream
        
        // Only add tracks if peer connection is not closed
        if (this.peerConnection.signalingState !== 'closed') {
          stream.getTracks().forEach(track => {
            this.peerConnection.addTrack(track, stream)
          })
        }
        webrtcLogger.info('Standard quality media stream started successfully')
        return stream
      }
    } catch (error) {
      webrtcLogger.error('Failed to access media devices', { error })
      throw error
    }
  }

  private handleTrack(event: RTCTrackEvent) {
    webrtcLogger.info('Received remote track', { kind: event.track.kind })
    this.remoteStream = event.streams[0]
    window.dispatchEvent(new CustomEvent('remote-stream', { detail: this.remoteStream }))
  }

  private handleIceCandidate(event: RTCPeerConnectionIceEvent) {
    if (event.candidate) {
      webrtcLogger.debug('Sending ICE candidate', { candidate: event.candidate.candidate })
      this.socket.emit('ice-candidate', event.candidate)
    } else {
      webrtcLogger.debug('ICE candidate gathering completed')
    }
  }

  private handleConnectionFailure() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      webrtcLogger.warn('Connection failed, attempting reconnection', { 
        attempt: this.reconnectAttempts, 
        maxAttempts: this.maxReconnectAttempts 
      })
      
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
      
      // Notify about reconnection attempt
      window.dispatchEvent(new CustomEvent('webrtc-reconnecting', { 
        detail: { attempt: this.reconnectAttempts } 
      }))
      
      // Try to create a new offer
      this.createOffer()
    } else {
      webrtcLogger.error('Max reconnection attempts reached, connection failed permanently')
      window.dispatchEvent(new CustomEvent('webrtc-failed'))
    }
  }

  private setConnectionTimeout() {
    // Clear any existing timeout
    this.clearConnectionTimeout()
    
    // Set a new timeout (15 seconds)
    this.connectionTimeout = setTimeout(() => {
      if (this.peerConnection.iceConnectionState !== 'connected' && 
          this.peerConnection.iceConnectionState !== 'completed') {
        webrtcLogger.warn('Connection timeout reached', { 
          currentState: this.peerConnection.iceConnectionState 
        })
        this.handleConnectionFailure()
      }
    }, 15000)
  }

  private clearConnectionTimeout() {
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout)
      this.connectionTimeout = null
    }
  }

  async createOffer() {
    try {
      this.setConnectionTimeout()
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
      webrtcLogger.error('Failed to create WebRTC offer', { error })
      throw error
    }
  }

  async handleOffer(offer: RTCSessionDescriptionInit) {
    try {
      this.setConnectionTimeout()
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
      const answer = await this.peerConnection.createAnswer()
      await this.peerConnection.setLocalDescription(answer)
      this.socket.emit('answer', answer)
      webrtcLogger.info('WebRTC offer handled and answer sent successfully')
      return answer
    } catch (error) {
      webrtcLogger.error('Failed to handle WebRTC offer', { error })
      throw error
    }
  }

  async handleAnswer(answer: RTCSessionDescriptionInit) {
    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
      webrtcLogger.info('WebRTC answer handled successfully')
    } catch (error) {
      webrtcLogger.error('Failed to handle WebRTC answer', { error })
      throw error
    }
  }

  async addIceCandidate(candidate: RTCIceCandidateInit) {
    try {
      await this.peerConnection.addIceCandidate(candidate)
      webrtcLogger.debug('ICE candidate added successfully')
    } catch (error) {
      webrtcLogger.warn('Failed to add ICE candidate (non-critical)', { error })
      // Don't throw here, just log - this can happen normally sometimes
    }
  }

  cleanup(stopTracks = true) {
    webrtcLogger.info('Cleaning up WebRTC connection', { stopTracks })
    
    this.clearConnectionTimeout()

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
}