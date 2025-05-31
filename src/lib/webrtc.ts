export class WebRTCService {
  private peerConnection: RTCPeerConnection
  private socket: any
  private localStream: MediaStream | null = null
  private connectionTimeout: NodeJS.Timeout | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 3

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
      console.log('ICE connection state:', pc.iceConnectionState)
      
      if (pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'disconnected') {
        this.handleConnectionFailure()
      }
      
      if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
        this.clearConnectionTimeout()
        this.reconnectAttempts = 0
      }
    }
    
    return pc
  }

  async startLocalStream() {
    try {
      // Check if peer connection is still valid
      if (this.peerConnection.signalingState === 'closed') {
        console.log('Peer connection is closed, recreating...')
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
        return stream
      } catch (err) {
        console.log('Falling back to standard quality:', err)
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
        return stream
      }
    } catch (error) {
      console.error('Error accessing media devices:', error)
      throw error
    }
  }

  private handleTrack(event: RTCTrackEvent) {
    window.dispatchEvent(new CustomEvent('remote-stream', { 
      detail: { stream: event.streams[0] } 
    }))
  }

  private handleIceCandidate(event: RTCPeerConnectionIceEvent) {
    if (event.candidate) {
      this.socket.emit('ice-candidate', event.candidate)
    }
  }

  private handleConnectionFailure() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`Connection failed. Attempt ${this.reconnectAttempts} of ${this.maxReconnectAttempts} to reconnect...`)
      
      // Recreate peer connection
      this.cleanup(false) // Don't stop tracks
      this.peerConnection = this.createPeerConnection()
      
      // Re-add tracks only if we have them and peer connection is valid
      if (this.localStream && this.peerConnection.signalingState !== 'closed') {
        this.localStream.getTracks().forEach(track => {
          try {
            this.peerConnection.addTrack(track, this.localStream!)
          } catch (error) {
            console.error('Error re-adding track:', error)
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
      console.log('Max reconnection attempts reached')
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
        console.log('Connection timeout')
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
      return offer
    } catch (error) {
      console.error('Error creating offer:', error)
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
      return answer
    } catch (error) {
      console.error('Error handling offer:', error)
      throw error
    }
  }

  async handleAnswer(answer: RTCSessionDescriptionInit) {
    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
    } catch (error) {
      console.error('Error handling answer:', error)
      throw error
    }
  }

  async addIceCandidate(candidate: RTCIceCandidateInit) {
    try {
      await this.peerConnection.addIceCandidate(candidate)
    } catch (error) {
      console.error('Error adding ICE candidate:', error)
      // Don't throw here, just log - this can happen normally sometimes
    }
  }

  cleanup(stopTracks = true) {
    this.clearConnectionTimeout()
    
    if (stopTracks && this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop())
      this.localStream = null
    }
    
    this.peerConnection.close()
  }
}