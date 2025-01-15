export class WebRTCService {
  private peerConnection: RTCPeerConnection
  private socket: any

  constructor(socket: any) {
    this.socket = socket
    this.peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    })

    this.peerConnection.ontrack = this.handleTrack.bind(this)
    this.peerConnection.onicecandidate = this.handleIceCandidate.bind(this)
  }

  async startLocalStream() {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: true, 
      audio: true 
    })
    stream.getTracks().forEach(track => {
      this.peerConnection.addTrack(track, stream)
    })
    return stream
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

  async createOffer() {
    try {
      const offer = await this.peerConnection.createOffer()
      await this.peerConnection.setLocalDescription(offer)
      this.socket.emit('offer', offer)
      return offer
    } catch (error) {
      console.error('Error creating offer:', error)
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
    await this.peerConnection.addIceCandidate(candidate)
  }

  cleanup() {
    this.peerConnection.getSenders().forEach(sender => {
      if (sender.track) {
        sender.track.stop()
      }
    })
    this.peerConnection.close()
  }
}