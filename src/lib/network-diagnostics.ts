interface DiagnosticResult {
  category: 'excellent' | 'good' | 'fair' | 'poor' | 'critical'
  score: number // 0-100
  issues: DiagnosticIssue[]
  recommendations: string[]
  metrics: NetworkMetrics
}

interface DiagnosticIssue {
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  solution: string
}

interface NetworkMetrics {
  bandwidth: {
    download: number // Mbps
    upload: number   // Mbps
    stability: number // 0-1
  }
  latency: {
    avg: number    // ms
    min: number    // ms
    max: number    // ms
    jitter: number // ms
  }
  connectivity: {
    nat: 'none' | 'symmetric' | 'cone' | 'restricted'
    firewall: boolean
    ipv6: boolean
  }
  device: {
    camera: boolean
    microphone: boolean
    speakers: boolean
  }
}

export class NetworkDiagnostics {
  private results: DiagnosticResult | null = null

  async runFullDiagnostic(): Promise<DiagnosticResult> {
    console.log('Starting comprehensive network diagnostic...')
    
    const metrics = await this.gatherMetrics()
    const issues = this.analyzeIssues(metrics)
    const recommendations = this.generateRecommendations(issues, metrics)
    const score = this.calculateScore(metrics, issues)
    const category = this.determineCategory(score)

    this.results = {
      category,
      score,
      issues,
      recommendations,
      metrics
    }

    return this.results
  }

  private async gatherMetrics(): Promise<NetworkMetrics> {
    console.log('Gathering network metrics...')
    
    // Run tests in parallel for faster results
    const [bandwidth, latency, connectivity, device] = await Promise.all([
      this.testBandwidth(),
      this.testLatency(),
      this.testConnectivity(),
      this.testDevices()
    ])

    return { bandwidth, latency, connectivity, device }
  }

  private async testBandwidth(): Promise<NetworkMetrics['bandwidth']> {
    try {
      // Use multiple test endpoints for accuracy
      const testUrls = [
        'https://httpbin.org/bytes/1048576', // 1MB
        'https://jsonplaceholder.typicode.com/photos', // Variable size
      ]

      const downloadTests = await Promise.all(
        testUrls.map(url => this.measureDownloadSpeed(url))
      )

      const validTests = downloadTests.filter(speed => speed > 0)
      const avgDownload = validTests.length > 0 
        ? validTests.reduce((sum, speed) => sum + speed, 0) / validTests.length
        : 0

      // Estimate upload (simplified - would need dedicated endpoint)
      const uploadSpeed = avgDownload * 0.3 // Rough estimation

      // Calculate stability (variance in speeds)
      const variance = validTests.length > 1
        ? validTests.reduce((sum, speed) => sum + Math.pow(speed - avgDownload, 2), 0) / validTests.length
        : 0
      const stability = Math.max(0, 1 - (variance / (avgDownload * avgDownload)))

      return {
        download: Math.round(avgDownload * 100) / 100,
        upload: Math.round(uploadSpeed * 100) / 100,
        stability: Math.round(stability * 100) / 100
      }
    } catch (error) {
      console.error('Bandwidth test failed:', error)
      return { download: 0, upload: 0, stability: 0 }
    }
  }

  private async measureDownloadSpeed(url: string): Promise<number> {
    try {
      const startTime = performance.now()
      const response = await fetch(url)
      const data = await response.arrayBuffer()
      const endTime = performance.now()
      
      const durationMs = endTime - startTime
      const durationSeconds = durationMs / 1000
      const bytes = data.byteLength
      const bitsPerSecond = (bytes * 8) / durationSeconds
      const mbps = bitsPerSecond / (1024 * 1024)
      
      return mbps
    } catch (error) {
      console.warn(`Speed test failed for ${url}:`, error)
      return 0
    }
  }

  private async testLatency(): Promise<NetworkMetrics['latency']> {
    try {
      const pingTests = []
      const testCount = 5

      // Test latency to multiple endpoints
      for (let i = 0; i < testCount; i++) {
        pingTests.push(this.measureLatency())
        await new Promise(resolve => setTimeout(resolve, 200)) // 200ms between tests
      }

      const latencies = await Promise.all(pingTests)
      const validLatencies = latencies.filter(l => l > 0)

      if (validLatencies.length === 0) {
        return { avg: 0, min: 0, max: 0, jitter: 0 }
      }

      const avg = validLatencies.reduce((sum, l) => sum + l, 0) / validLatencies.length
      const min = Math.min(...validLatencies)
      const max = Math.max(...validLatencies)
      
      // Calculate jitter (average deviation from mean)
      const jitter = validLatencies.reduce((sum, l) => sum + Math.abs(l - avg), 0) / validLatencies.length

      return {
        avg: Math.round(avg),
        min: Math.round(min),
        max: Math.round(max),
        jitter: Math.round(jitter)
      }
    } catch (error) {
      console.error('Latency test failed:', error)
      return { avg: 0, min: 0, max: 0, jitter: 0 }
    }
  }

  private async measureLatency(): Promise<number> {
    try {
      const startTime = performance.now()
      await fetch('https://httpbin.org/get', { method: 'HEAD' })
      const endTime = performance.now()
      return endTime - startTime
    } catch (error) {
      return 0
    }
  }

  private async testConnectivity(): Promise<NetworkMetrics['connectivity']> {
    try {
      // Simple NAT type detection (limited without STUN server)
      const natType = await this.detectNATType()
      
      // Check for common firewall ports
      const firewallRestricted = await this.testFirewallRestrictions()
      
      // IPv6 connectivity test
      const ipv6Available = await this.testIPv6()

      return {
        nat: natType,
        firewall: firewallRestricted,
        ipv6: ipv6Available
      }
    } catch (error) {
      console.error('Connectivity test failed:', error)
      return { nat: 'none', firewall: false, ipv6: false }
    }
  }

  private async detectNATType(): Promise<NetworkMetrics['connectivity']['nat']> {
    try {
      // This is a simplified detection - real NAT detection requires STUN servers
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      })

      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          pc.close()
          resolve('symmetric') // Default to most restrictive
        }, 5000)

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            const candidate = event.candidate.candidate
            if (candidate.includes('srflx')) {
              clearTimeout(timeout)
              pc.close()
              resolve('cone') // Server reflexive candidate found
            }
          } else {
            clearTimeout(timeout)
            pc.close()
            resolve('restricted')
          }
        }

        pc.createDataChannel('test')
        pc.createOffer().then(offer => pc.setLocalDescription(offer))
      })
    } catch (error) {
      return 'symmetric'
    }
  }

  private async testFirewallRestrictions(): Promise<boolean> {
    try {
      // Test if WebSocket connections work (proxy for firewall detection)
      const ws = new WebSocket('wss://echo.websocket.org')
      
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          ws.close()
          resolve(true) // Assume firewall if connection fails
        }, 3000)

        ws.onopen = () => {
          clearTimeout(timeout)
          ws.close()
          resolve(false) // No firewall detected
        }

        ws.onerror = () => {
          clearTimeout(timeout)
          resolve(true) // Firewall detected
        }
      })
    } catch (error) {
      return true
    }
  }

  private async testIPv6(): Promise<boolean> {
    try {
      // Simple IPv6 connectivity test
      await fetch('https://ipv6.google.com', { method: 'HEAD' })
      return true
    } catch (error) {
      return false
    }
  }

  private async testDevices(): Promise<NetworkMetrics['device']> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      
      const hasCamera = devices.some(device => device.kind === 'videoinput')
      const hasMicrophone = devices.some(device => device.kind === 'audioinput')
      const hasSpeakers = devices.some(device => device.kind === 'audiooutput')

      // Test actual access
      let cameraWorking = false
      let microphoneWorking = false

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        })
        cameraWorking = stream.getVideoTracks().length > 0
        microphoneWorking = stream.getAudioTracks().length > 0
        stream.getTracks().forEach(track => track.stop())
      } catch (error) {
        console.warn('Media access test failed:', error)
      }

      return {
        camera: hasCamera && cameraWorking,
        microphone: hasMicrophone && microphoneWorking,
        speakers: hasSpeakers
      }
    } catch (error) {
      console.error('Device test failed:', error)
      return { camera: false, microphone: false, speakers: false }
    }
  }

  private analyzeIssues(metrics: NetworkMetrics): DiagnosticIssue[] {
    const issues: DiagnosticIssue[] = []

    // Bandwidth issues
    if (metrics.bandwidth.download < 1) {
      issues.push({
        severity: 'critical',
        message: 'Download speed is too slow for video calls',
        solution: 'Check your internet connection or contact your ISP'
      })
    } else if (metrics.bandwidth.download < 2) {
      issues.push({
        severity: 'high',
        message: 'Download speed may cause video quality issues',
        solution: 'Close other applications using internet or upgrade connection'
      })
    }

    if (metrics.bandwidth.stability < 0.7) {
      issues.push({
        severity: 'medium',
        message: 'Internet connection is unstable',
        solution: 'Try switching to a wired connection or move closer to WiFi router'
      })
    }

    // Latency issues
    if (metrics.latency.avg > 300) {
      issues.push({
        severity: 'high',
        message: 'High latency detected - calls may have delays',
        solution: 'Check for background downloads or switch to a closer server'
      })
    } else if (metrics.latency.avg > 150) {
      issues.push({
        severity: 'medium',
        message: 'Moderate latency may affect call quality',
        solution: 'Close unnecessary applications and check network usage'
      })
    }

    if (metrics.latency.jitter > 50) {
      issues.push({
        severity: 'medium',
        message: 'Network jitter detected - audio may cut out',
        solution: 'Use a wired connection or check for network interference'
      })
    }

    // Connectivity issues
    if (metrics.connectivity.nat === 'symmetric') {
      issues.push({
        severity: 'high',
        message: 'Restrictive NAT detected - connections may fail',
        solution: 'Configure router port forwarding or use VPN'
      })
    }

    if (metrics.connectivity.firewall) {
      issues.push({
        severity: 'medium',
        message: 'Firewall restrictions detected',
        solution: 'Check firewall settings and allow video calling applications'
      })
    }

    // Device issues
    if (!metrics.device.camera) {
      issues.push({
        severity: 'critical',
        message: 'Camera not available or not working',
        solution: 'Check camera permissions and ensure camera is connected'
      })
    }

    if (!metrics.device.microphone) {
      issues.push({
        severity: 'critical',
        message: 'Microphone not available or not working',
        solution: 'Check microphone permissions and ensure microphone is connected'
      })
    }

    return issues
  }

  private generateRecommendations(issues: DiagnosticIssue[], metrics: NetworkMetrics): string[] {
    const recommendations: string[] = []

    // General recommendations based on overall performance
    if (metrics.bandwidth.download < 5) {
      recommendations.push('Consider upgrading to a faster internet plan (5+ Mbps recommended)')
    }

    if (metrics.latency.avg > 100 || metrics.bandwidth.stability < 0.8) {
      recommendations.push('Use a wired connection instead of WiFi for better stability')
    }

    if (issues.some(issue => issue.severity === 'critical')) {
      recommendations.push('Fix critical issues before attempting video calls')
    }

    if (metrics.connectivity.nat !== 'none') {
      recommendations.push('Consider using a VPN service to improve connection reliability')
    }

    if (!metrics.connectivity.ipv6) {
      recommendations.push('Ask your ISP about IPv6 support for better connectivity')
    }

    // Add fallback recommendations
    recommendations.push('Close unnecessary applications to free up bandwidth')
    recommendations.push('Restart your router if experiencing connection issues')
    recommendations.push('Try different times of day when network traffic is lower')

    return recommendations
  }

  private calculateScore(metrics: NetworkMetrics, issues: DiagnosticIssue[]): number {
    let score = 100

    // Deduct points for bandwidth issues
    if (metrics.bandwidth.download < 1) score -= 40
    else if (metrics.bandwidth.download < 2) score -= 20
    else if (metrics.bandwidth.download < 5) score -= 10

    // Deduct points for latency issues
    if (metrics.latency.avg > 300) score -= 30
    else if (metrics.latency.avg > 150) score -= 15
    else if (metrics.latency.avg > 100) score -= 5

    // Deduct points for stability
    score -= (1 - metrics.bandwidth.stability) * 20

    // Deduct points for jitter
    if (metrics.latency.jitter > 50) score -= 15
    else if (metrics.latency.jitter > 25) score -= 8

    // Deduct points for connectivity issues
    if (metrics.connectivity.nat === 'symmetric') score -= 20
    else if (metrics.connectivity.nat === 'restricted') score -= 10

    if (metrics.connectivity.firewall) score -= 10

    // Deduct points for device issues
    if (!metrics.device.camera) score -= 25
    if (!metrics.device.microphone) score -= 25

    return Math.max(0, Math.round(score))
  }

  private determineCategory(score: number): DiagnosticResult['category'] {
    if (score >= 90) return 'excellent'
    if (score >= 75) return 'good'
    if (score >= 60) return 'fair'
    if (score >= 40) return 'poor'
    return 'critical'
  }

  getLastResults(): DiagnosticResult | null {
    return this.results
  }

  async quickCheck(): Promise<{ ready: boolean, issues: string[] }> {
    try {
      const [bandwidth, devices] = await Promise.all([
        this.testBandwidth(),
        this.testDevices()
      ])

      const issues: string[] = []
      
      if (bandwidth.download < 1) {
        issues.push('Internet speed too slow')
      }
      
      if (!devices.camera) {
        issues.push('Camera not available')
      }
      
      if (!devices.microphone) {
        issues.push('Microphone not available')
      }

      return {
        ready: issues.length === 0,
        issues
      }
    } catch (error) {
      return {
        ready: false,
        issues: ['Diagnostic check failed']
      }
    }
  }
} 