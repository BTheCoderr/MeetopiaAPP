import { VirtualBackground } from '@/types/user'

export class VirtualBackgroundService {
  private static instance: VirtualBackgroundService
  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null
  private currentBackground: VirtualBackground | null = null
  private isProcessing = false

  public static getInstance(): VirtualBackgroundService {
    if (!VirtualBackgroundService.instance) {
      VirtualBackgroundService.instance = new VirtualBackgroundService()
    }
    return VirtualBackgroundService.instance
  }

  public async initialize(): Promise<void> {
    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d')
    
    if (!this.ctx) {
      throw new Error('Failed to initialize canvas context')
    }
  }

  public getDefaultBackgrounds(): VirtualBackground[] {
    return [
      {
        id: 'blur',
        name: 'Blur Background',
        url: '',
        category: 'abstract'
      },
      {
        id: 'office-modern',
        name: 'Modern Office',
        url: '/backgrounds/office-modern.jpg',
        category: 'office'
      },
      {
        id: 'living-room',
        name: 'Cozy Living Room',
        url: '/backgrounds/living-room.jpg',
        category: 'office'
      },
      {
        id: 'forest',
        name: 'Forest',
        url: '/backgrounds/forest.jpg',
        category: 'nature'
      },
      {
        id: 'beach',
        name: 'Beach Sunset',
        url: '/backgrounds/beach.jpg',
        category: 'nature'
      },
      {
        id: 'mountain',
        name: 'Mountain View',
        url: '/backgrounds/mountain.jpg',
        category: 'nature'
      },
      {
        id: 'city-night',
        name: 'City Skyline',
        url: '/backgrounds/city-night.jpg',
        category: 'abstract'
      },
      {
        id: 'gradient-blue',
        name: 'Blue Gradient',
        url: '/backgrounds/gradient-blue.jpg',
        category: 'abstract'
      },
      {
        id: 'gradient-purple',
        name: 'Purple Gradient',
        url: '/backgrounds/gradient-purple.jpg',
        category: 'abstract'
      },
      {
        id: 'library',
        name: 'Library',
        url: '/backgrounds/library.jpg',
        category: 'office',
        premium: true
      },
      {
        id: 'space',
        name: 'Space Station',
        url: '/backgrounds/space.jpg',
        category: 'abstract',
        premium: true
      }
    ]
  }

  public async applyBackground(
    videoStream: MediaStream,
    background: VirtualBackground
  ): Promise<MediaStream | null> {
    if (!this.canvas || !this.ctx) {
      await this.initialize()
    }

    if (this.isProcessing) {
      return null
    }

    this.isProcessing = true
    this.currentBackground = background

    try {
      const videoTrack = videoStream.getVideoTracks()[0]
      
      // Create a new video element to process frames
      const video = document.createElement('video')
      video.srcObject = videoStream
      video.play()

      // Set canvas dimensions to match video
      const settings = videoTrack.getSettings()
      this.canvas!.width = settings.width || 640
      this.canvas!.height = settings.height || 480

      if (background.id === 'blur') {
        return await this.applyBlurBackground(videoStream)
      } else {
        return await this.applyImageBackground(videoStream, background.url)
      }
    } catch (error) {
      console.error('Error applying virtual background:', error)
      this.isProcessing = false
      return null
    }
  }

  private async applyBlurBackground(videoStream: MediaStream): Promise<MediaStream> {
    const videoTrack = videoStream.getVideoTracks()[0]
    const canvas = this.canvas!
    const ctx = this.ctx!

    // Create a video element for frame capture
    const video = document.createElement('video')
    video.srcObject = videoStream
    video.play()

    // Create output canvas stream
    const outputCanvas = document.createElement('canvas')
    outputCanvas.width = canvas.width
    outputCanvas.height = canvas.height
    const outputCtx = outputCanvas.getContext('2d')!

    // Process frames
    const processFrame = () => {
      if (video.readyState >= 2) {
        outputCtx.filter = 'blur(10px)'
        outputCtx.drawImage(video, 0, 0, outputCanvas.width, outputCanvas.height)
      }
      if (this.isProcessing) {
        requestAnimationFrame(processFrame)
      }
    }

    video.addEventListener('loadeddata', () => {
      processFrame()
    })

    const outputStream = outputCanvas.captureStream(30)
    const audioTracks = videoStream.getAudioTracks()
    
    return new MediaStream([...outputStream.getVideoTracks(), ...audioTracks])
  }

  private async applyImageBackground(
    videoStream: MediaStream, 
    backgroundUrl: string
  ): Promise<MediaStream> {
    const canvas = this.canvas!

    // Load background image
    const backgroundImage = new Image()
    backgroundImage.crossOrigin = 'anonymous'
    
    return new Promise((resolve, reject) => {
      backgroundImage.onload = async () => {
        try {
          // Create a video element for frame capture
          const video = document.createElement('video')
          video.srcObject = videoStream
          video.play()

          // Create output canvas stream
          const outputCanvas = document.createElement('canvas')
          outputCanvas.width = canvas.width
          outputCanvas.height = canvas.height
          const outputCtx = outputCanvas.getContext('2d')!

          // Process frames
          const processFrame = () => {
            if (video.readyState >= 2) {
              // Draw background
              outputCtx.drawImage(backgroundImage, 0, 0, outputCanvas.width, outputCanvas.height)
              
              // Draw video with some basic compositing (simplified background replacement)
              outputCtx.globalCompositeOperation = 'source-atop'
              outputCtx.drawImage(video, 0, 0, outputCanvas.width, outputCanvas.height)
              outputCtx.globalCompositeOperation = 'source-over'
            }
            if (this.isProcessing) {
              requestAnimationFrame(processFrame)
            }
          }

          video.addEventListener('loadeddata', () => {
            processFrame()
          })

          const outputStream = outputCanvas.captureStream(30)
          const audioTracks = videoStream.getAudioTracks()
          
          resolve(new MediaStream([...outputStream.getVideoTracks(), ...audioTracks]))
        } catch (error) {
          reject(error)
        }
      }

      backgroundImage.onerror = () => {
        reject(new Error('Failed to load background image'))
      }

      backgroundImage.src = backgroundUrl
    })
  }

  public async uploadCustomBackground(file: File): Promise<VirtualBackground> {
    // Validate file
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image')
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      throw new Error('File size must be less than 5MB')
    }

    // Create object URL for the uploaded file
    const url = URL.createObjectURL(file)
    
    return {
      id: `custom-${Date.now()}`,
      name: file.name.split('.')[0],
      url,
      category: 'custom'
    }
  }

  public removeBackground(): void {
    this.currentBackground = null
    this.isProcessing = false
  }

  public getCurrentBackground(): VirtualBackground | null {
    return this.currentBackground
  }

  public async generateThumbnail(background: VirtualBackground): Promise<string> {
    if (background.id === 'blur') {
      // Generate a blurred sample image
      const canvas = document.createElement('canvas')
      canvas.width = 160
      canvas.height = 90
      const ctx = canvas.getContext('2d')!
      
      ctx.filter = 'blur(5px)'
      ctx.fillStyle = '#4F46E5'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      return canvas.toDataURL()
    }

    // For image backgrounds, create a thumbnail
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = 160
        canvas.height = 90
        const ctx = canvas.getContext('2d')!
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL())
      }
      
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = background.url
    })
  }

  public dispose(): void {
    this.removeBackground()
    if (this.canvas) {
      this.canvas.remove()
      this.canvas = null
      this.ctx = null
    }
  }
}

// Enhanced background effects
export class BackgroundEffects {
  public static createGradientBackground(
    colors: string[],
    direction = 'to right'
  ): VirtualBackground {
    const canvas = document.createElement('canvas')
    canvas.width = 1920
    canvas.height = 1080
    const ctx = canvas.getContext('2d')!

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    colors.forEach((color, index) => {
      gradient.addColorStop(index / (colors.length - 1), color)
    })

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    return {
      id: `gradient-${Date.now()}`,
      name: 'Custom Gradient',
      url: canvas.toDataURL(),
      category: 'custom'
    }
  }

  public static createPatternBackground(
    pattern: 'dots' | 'lines' | 'grid',
    color = '#4F46E5',
    backgroundColor = '#1F2937'
  ): VirtualBackground {
    const canvas = document.createElement('canvas')
    canvas.width = 1920
    canvas.height = 1080
    const ctx = canvas.getContext('2d')!

    // Fill background
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = color
    ctx.strokeStyle = color

    switch (pattern) {
      case 'dots':
        for (let x = 0; x < canvas.width; x += 50) {
          for (let y = 0; y < canvas.height; y += 50) {
            ctx.beginPath()
            ctx.arc(x, y, 2, 0, Math.PI * 2)
            ctx.fill()
          }
        }
        break
      case 'lines':
        ctx.lineWidth = 1
        for (let x = 0; x < canvas.width; x += 30) {
          ctx.beginPath()
          ctx.moveTo(x, 0)
          ctx.lineTo(x, canvas.height)
          ctx.stroke()
        }
        break
      case 'grid':
        ctx.lineWidth = 1
        for (let x = 0; x < canvas.width; x += 50) {
          ctx.beginPath()
          ctx.moveTo(x, 0)
          ctx.lineTo(x, canvas.height)
          ctx.stroke()
        }
        for (let y = 0; y < canvas.height; y += 50) {
          ctx.beginPath()
          ctx.moveTo(0, y)
          ctx.lineTo(canvas.width, y)
          ctx.stroke()
        }
        break
    }

    return {
      id: `pattern-${pattern}-${Date.now()}`,
      name: `${pattern.charAt(0).toUpperCase() + pattern.slice(1)} Pattern`,
      url: canvas.toDataURL(),
      category: 'custom'
    }
  }
} 