import { ScreenShareOptions } from '@/types/user'

export class ScreenSharingService {
  private static instance: ScreenSharingService
  private screenStream: MediaStream | null = null
  private isSharing = false
  private recordingChunks: Blob[] = []
  private mediaRecorder: MediaRecorder | null = null
  private shareStartTime: Date | null = null
  private maxDuration: number = 30 * 60 * 1000 // 30 minutes default

  public static getInstance(): ScreenSharingService {
    if (!ScreenSharingService.instance) {
      ScreenSharingService.instance = new ScreenSharingService()
    }
    return ScreenSharingService.instance
  }

  public async startScreenShare(options: ScreenShareOptions = {
    allowAudio: true,
    quality: 'auto',
    fps: 30,
    maxDuration: 30
  }): Promise<MediaStream | null> {
    try {
      if (this.isSharing) {
        throw new Error('Screen sharing is already active')
      }

      // Check browser support
      if (!navigator.mediaDevices?.getDisplayMedia) {
        throw new Error('Screen sharing is not supported in this browser')
      }

      // Configure constraints based on options
      const constraints = this.buildConstraints(options)

      // Request screen share
      this.screenStream = await navigator.mediaDevices.getDisplayMedia(constraints)
      this.isSharing = true
      this.shareStartTime = new Date()
      this.maxDuration = options.maxDuration * 60 * 1000

      // Set up event listeners
      this.setupEventListeners()

      // Start duration timer
      this.startDurationTimer()

      return this.screenStream
    } catch (error) {
      console.error('Failed to start screen sharing:', error)
      this.cleanup()
      return null
    }
  }

  public async stopScreenShare(): Promise<void> {
    if (!this.isSharing || !this.screenStream) {
      return
    }

    this.cleanup()
  }

  public async startRecording(): Promise<void> {
    if (!this.screenStream) {
      throw new Error('No screen share active to record')
    }

    if (this.mediaRecorder) {
      throw new Error('Recording is already in progress')
    }

    try {
      this.recordingChunks = []
      this.mediaRecorder = new MediaRecorder(this.screenStream, {
        mimeType: this.getSupportedMimeType()
      })

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordingChunks.push(event.data)
        }
      }

      this.mediaRecorder.onstop = () => {
        this.handleRecordingComplete()
      }

      this.mediaRecorder.start(1000) // Collect data every second
    } catch (error) {
      console.error('Failed to start recording:', error)
      throw error
    }
  }

  public async stopRecording(): Promise<Blob | null> {
    if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
      return null
    }

    return new Promise((resolve) => {
             const originalOnStop = this.mediaRecorder!.onstop
       this.mediaRecorder!.onstop = (event) => {
         if (originalOnStop && this.mediaRecorder) originalOnStop.call(this.mediaRecorder, event)
         const blob = new Blob(this.recordingChunks, { 
           type: this.getSupportedMimeType() 
         })
         resolve(blob)
       }
      this.mediaRecorder!.stop()
    })
  }

  public async captureScreenshot(): Promise<string | null> {
    if (!this.screenStream) {
      throw new Error('No screen share active to capture')
    }

    try {
      const video = document.createElement('video')
      video.srcObject = this.screenStream
      video.play()

      return new Promise((resolve, reject) => {
        video.addEventListener('loadeddata', () => {
          const canvas = document.createElement('canvas')
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          
          const ctx = canvas.getContext('2d')!
          ctx.drawImage(video, 0, 0)
          
          const dataUrl = canvas.toDataURL('image/png')
          resolve(dataUrl)
        })

        video.addEventListener('error', () => {
          reject(new Error('Failed to capture screenshot'))
        })
      })
    } catch (error) {
      console.error('Failed to capture screenshot:', error)
      return null
    }
  }

  public getScreenStream(): MediaStream | null {
    return this.screenStream
  }

  public isScreenSharing(): boolean {
    return this.isSharing
  }

  public isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording'
  }

  public getShareDuration(): number {
    if (!this.shareStartTime) return 0
    return Date.now() - this.shareStartTime.getTime()
  }

  public getRemainingTime(): number {
    if (!this.shareStartTime) return this.maxDuration
    const elapsed = this.getShareDuration()
    return Math.max(0, this.maxDuration - elapsed)
  }

  private buildConstraints(options: ScreenShareOptions): MediaStreamConstraints {
    const video: any = {
      cursor: 'always'
    }

    // Set quality constraints
    switch (options.quality) {
      case 'high':
        Object.assign(video, {
          width: { ideal: 1920, max: 3840 },
          height: { ideal: 1080, max: 2160 },
          frameRate: { ideal: options.fps, max: 60 }
        })
        break
      case 'medium':
        Object.assign(video, {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          frameRate: { ideal: options.fps, max: 30 }
        })
        break
      case 'low':
        Object.assign(video, {
          width: { ideal: 854, max: 1280 },
          height: { ideal: 480, max: 720 },
          frameRate: { ideal: Math.min(options.fps, 15), max: 15 }
        })
        break
      default: // auto
        Object.assign(video, {
          frameRate: { ideal: options.fps, max: 60 }
        })
    }

    return {
      video,
      audio: options.allowAudio
    }
  }

  private setupEventListeners(): void {
    if (!this.screenStream) return

    // Listen for track end (user stops sharing)
    this.screenStream.getVideoTracks().forEach(track => {
      track.addEventListener('ended', () => {
        this.cleanup()
      })
    })
  }

  private startDurationTimer(): void {
    if (this.maxDuration <= 0) return

    setTimeout(() => {
      if (this.isSharing) {
        console.log('Screen share duration limit reached')
        this.stopScreenShare()
      }
    }, this.maxDuration)
  }

  private getSupportedMimeType(): string {
    const mimeTypes = [
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
      'video/mp4'
    ]

    for (const mimeType of mimeTypes) {
      if (MediaRecorder.isTypeSupported(mimeType)) {
        return mimeType
      }
    }

    return 'video/webm' // fallback
  }

  private handleRecordingComplete(): void {
    if (this.recordingChunks.length === 0) return

    const blob = new Blob(this.recordingChunks, { 
      type: this.getSupportedMimeType() 
    })

    // Create download link
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `screen-recording-${new Date().toISOString().slice(0, 19)}.webm`
    a.click()

    // Cleanup
    URL.revokeObjectURL(url)
    this.recordingChunks = []
  }

  private cleanup(): void {
    if (this.screenStream) {
      this.screenStream.getTracks().forEach(track => {
        track.stop()
      })
      this.screenStream = null
    }

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop()
    }
    this.mediaRecorder = null

    this.isSharing = false
    this.shareStartTime = null
    this.recordingChunks = []
  }
}

// Enhanced screen sharing utilities
export class ScreenSharingUtils {
  public static async checkSupport(): Promise<{
    supported: boolean
    features: {
      displayMedia: boolean
      mediaRecorder: boolean
      constraints: boolean
    }
  }> {
    const features = {
      displayMedia: !!navigator.mediaDevices?.getDisplayMedia,
      mediaRecorder: !!window.MediaRecorder,
      constraints: true // Most modern browsers support constraints
    }

    return {
      supported: features.displayMedia && features.mediaRecorder,
      features
    }
  }

  public static formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
      return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`
    } else {
      return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`
    }
  }

  public static async downloadBlob(blob: Blob, filename: string): Promise<void> {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  public static getQualityLabel(quality: string): string {
    switch (quality) {
      case 'high': return 'High (1080p+)'
      case 'medium': return 'Medium (720p)'
      case 'low': return 'Low (480p)'
      default: return 'Auto'
    }
  }

  public static estimateFileSize(
    duration: number, 
    quality: string, 
    fps: number
  ): number {
    // Rough estimates in MB per minute
    const baseSizes = {
      high: 15,   // ~15MB/min at 1080p30
      medium: 8,  // ~8MB/min at 720p30
      low: 4,     // ~4MB/min at 480p30
      auto: 10    // ~10MB/min average
    }

    const baseSize = baseSizes[quality as keyof typeof baseSizes] || baseSizes.auto
    const fpsMultiplier = fps / 30 // Adjust for frame rate
    const durationMinutes = duration / (1000 * 60)

    return Math.round(baseSize * fpsMultiplier * durationMinutes)
  }
} 