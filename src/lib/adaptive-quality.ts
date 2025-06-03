interface QualityLevel {
  width: number
  height: number
  frameRate: number
  bitrate: number
  label: string
}

interface NetworkCondition {
  bandwidth: number // Mbps
  latency: number    // ms
  packetLoss: number // 0-1
  stability: 'stable' | 'unstable' | 'poor'
}

export class AdaptiveQualityManager {
  private currentQuality: QualityLevel
  private availableQualities: QualityLevel[]
  private peerConnection: RTCPeerConnection
  private localStream: MediaStream | null = null
  private qualityChangeCallbacks: Array<(quality: QualityLevel) => void> = []
  private monitoringInterval: NodeJS.Timeout | null = null
  private lastQualityChange = 0
  private readonly QUALITY_CHANGE_COOLDOWN = 10000 // 10 seconds

  constructor(peerConnection: RTCPeerConnection) {
    this.peerConnection = peerConnection
    this.availableQualities = [
      { width: 1920, height: 1080, frameRate: 30, bitrate: 2500, label: '1080p30' },
      { width: 1280, height: 720, frameRate: 30, bitrate: 1500, label: '720p30' },
      { width: 1280, height: 720, frameRate: 15, bitrate: 1000, label: '720p15' },
      { width: 640, height: 480, frameRate: 30, bitrate: 800, label: '480p30' },
      { width: 640, height: 480, frameRate: 15, bitrate: 500, label: '480p15' },
      { width: 320, height: 240, frameRate: 15, bitrate: 300, label: '240p15' }
    ]
    this.currentQuality = this.availableQualities[2] // Start with 720p15
  }

  startMonitoring() {
    this.monitoringInterval = setInterval(async () => {
      try {
        const networkCondition = await this.assessNetworkCondition()
        const optimalQuality = this.selectOptimalQuality(networkCondition)
        
        if (this.shouldChangeQuality(optimalQuality, networkCondition)) {
          await this.changeQuality(optimalQuality)
        }
      } catch (error) {
        console.warn('Quality monitoring failed:', error)
      }
    }, 5000)
  }

  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
    }
  }

  private async assessNetworkCondition(): Promise<NetworkCondition> {
    const stats = await this.peerConnection.getStats()
    let bandwidth = 0
    let latency = 0
    let packetLoss = 0
    let bytesReceived = 0
    let packetsLost = 0
    let packetsReceived = 0

    // Fix TypeScript iterator issue
    const statsArray = Array.from(stats.values())
    for (const report of statsArray) {
      if (report.type === 'inbound-rtp' && report.mediaType === 'video') {
        packetsLost += report.packetsLost || 0
        packetsReceived += report.packetsReceived || 0
        bytesReceived += report.bytesReceived || 0
      } else if (report.type === 'candidate-pair' && report.state === 'succeeded') {
        latency = (report.currentRoundTripTime || 0) * 1000
      }
    }

    // Estimate bandwidth from bytes received (rough approximation)
    bandwidth = (bytesReceived * 8) / (1024 * 1024 * 5) // Convert to Mbps over 5 second window
    packetLoss = packetsReceived > 0 ? packetsLost / packetsReceived : 0

    // Determine stability
    let stability: NetworkCondition['stability'] = 'stable'
    if (packetLoss > 0.05 || latency > 300) {
      stability = 'poor'
    } else if (packetLoss > 0.02 || latency > 150) {
      stability = 'unstable'
    }

    return { bandwidth, latency, packetLoss, stability }
  }

  private selectOptimalQuality(condition: NetworkCondition): QualityLevel {
    // Filter qualities based on available bandwidth
    const suitableQualities = this.availableQualities.filter(quality => {
      const requiredBandwidth = quality.bitrate / 1000 // Convert kbps to Mbps
      return condition.bandwidth >= requiredBandwidth * 1.2 // 20% buffer
    })

    if (suitableQualities.length === 0) {
      return this.availableQualities[this.availableQualities.length - 1] // Lowest quality
    }

    // Adjust for network stability
    let targetIndex = 0
    if (condition.stability === 'stable' && condition.latency < 100) {
      targetIndex = 0 // Highest suitable quality
    } else if (condition.stability === 'unstable') {
      targetIndex = Math.min(Math.floor(suitableQualities.length / 2), suitableQualities.length - 1)
    } else {
      targetIndex = suitableQualities.length - 1 // Lowest suitable quality
    }

    return suitableQualities[targetIndex]
  }

  private shouldChangeQuality(newQuality: QualityLevel, condition: NetworkCondition): boolean {
    // Prevent frequent quality changes
    if (Date.now() - this.lastQualityChange < this.QUALITY_CHANGE_COOLDOWN) {
      return false
    }

    // Only change if there's a significant difference
    const currentBitrate = this.currentQuality.bitrate
    const newBitrate = newQuality.bitrate
    const bitrateChange = Math.abs(newBitrate - currentBitrate) / currentBitrate

    // Require at least 25% bitrate difference for change
    if (bitrateChange < 0.25) {
      return false
    }

    // Force downgrade on poor conditions
    if (condition.stability === 'poor' && newBitrate < currentBitrate) {
      return true
    }

    // Allow upgrade on stable conditions
    if (condition.stability === 'stable' && newBitrate > currentBitrate) {
      return true
    }

    return false
  }

  private async changeQuality(newQuality: QualityLevel): Promise<void> {
    try {
      console.log(`Changing quality from ${this.currentQuality.label} to ${newQuality.label}`)
      
      if (!this.localStream) {
        console.warn('No local stream available for quality change')
        return
      }

      // Get new stream with updated constraints
      const constraints: MediaStreamConstraints = {
        video: {
          width: { exact: newQuality.width },
          height: { exact: newQuality.height },
          frameRate: { exact: newQuality.frameRate }
        },
        audio: true
      }

      const newStream = await navigator.mediaDevices.getUserMedia(constraints)
      const videoTrack = newStream.getVideoTracks()[0]

      // Replace the video track in the peer connection
      const sender = this.peerConnection.getSenders().find(s => 
        s.track && s.track.kind === 'video'
      )

      if (sender && videoTrack) {
        await sender.replaceTrack(videoTrack)
        
        // Stop old video track
        const oldVideoTrack = this.localStream.getVideoTracks()[0]
        if (oldVideoTrack) {
          oldVideoTrack.stop()
        }

        // Update local stream reference
        this.localStream.removeTrack(oldVideoTrack)
        this.localStream.addTrack(videoTrack)

        this.currentQuality = newQuality
        this.lastQualityChange = Date.now()

        // Notify callbacks
        this.qualityChangeCallbacks.forEach(callback => callback(newQuality))
        
        console.log(`Quality changed successfully to ${newQuality.label}`)
      }
    } catch (error) {
      console.error('Failed to change quality:', error)
    }
  }

  setLocalStream(stream: MediaStream) {
    this.localStream = stream
  }

  getCurrentQuality(): QualityLevel {
    return this.currentQuality
  }

  onQualityChange(callback: (quality: QualityLevel) => void) {
    this.qualityChangeCallbacks.push(callback)
  }

  // Manual quality override
  async setQuality(qualityLabel: string): Promise<boolean> {
    const quality = this.availableQualities.find(q => q.label === qualityLabel)
    if (!quality) {
      console.error(`Quality ${qualityLabel} not found`)
      return false
    }

    await this.changeQuality(quality)
    return true
  }

  getAvailableQualities(): QualityLevel[] {
    return [...this.availableQualities]
  }
} 