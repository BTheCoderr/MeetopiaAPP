'use client'
import { useState, useEffect, useRef } from 'react'

// Moderation types
export type ModerationActionType = 'blur' | 'disconnect' | 'warn' | 'report'
export type ContentType = 'explicit' | 'offensive' | 'violence' | 'spam' | 'safe'

export interface ModerationResult {
  type: ContentType
  confidence: number
  timestamp: number
}

export interface ModerationReport {
  userId?: string
  reason: string
  details?: string
  timestamp: number
  evidence?: string // Base64 image
}

interface UseModerationOptions {
  minConfidence?: number
  autoBlur?: boolean
  autoReport?: boolean
}

/**
 * Hook to provide moderation capabilities for chat application
 */
export function useModeration(options: UseModerationOptions = {}) {
  const {
    minConfidence = 0.7,
    autoBlur = true,
    autoReport = false
  } = options
  
  // State
  const [isModeratingStream, setIsModeratingStream] = useState(false)
  const [detections, setDetections] = useState<ModerationResult[]>([])
  const [reports, setReports] = useState<ModerationReport[]>([])
  const [isVideoBlurred, setIsVideoBlurred] = useState(false)
  const [recentViolation, setRecentViolation] = useState<ModerationResult | null>(null)
  
  // Tracking
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Actions  
  const toggleBlur = () => {
    setIsVideoBlurred(prev => !prev)
  }
  
  const clearViolation = () => {
    setRecentViolation(null)
  }
  
  const captureEvidence = (): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!videoRef.current || !canvasRef.current) {
        resolve(null)
        return
      }
      
      try {
        const canvas = canvasRef.current
        const context = canvas.getContext('2d')
        
        if (!context) {
          resolve(null)
          return
        }
        
        // Set canvas dimensions to match video
        canvas.width = videoRef.current.videoWidth
        canvas.height = videoRef.current.videoHeight
        
        // Draw current video frame to canvas
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
        
        // Get data URL (base64 image)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
        resolve(dataUrl)
      } catch (err) {
        console.error('Error capturing evidence:', err)
        resolve(null)
      }
    })
  }
  
  const submitReport = async (
    reason: string, 
    details: string = '', 
    userId: string = ''
  ): Promise<boolean> => {
    try {
      // Capture screenshot as evidence if video reference exists
      const evidence = await captureEvidence()
      
      const report: ModerationReport = {
        userId,
        reason,
        details,
        timestamp: Date.now(),
        evidence: evidence || undefined
      }
      
      // Store report locally
      setReports(prev => [...prev, report])
      
      // In a real app, you would send this to your backend
      // For demo purposes, we just simulate success
      return true
    } catch (err) {
      console.error('Error submitting report:', err)
      return false
    }
  }
  
  // Process a stream for moderation
  const startModeratingStream = (stream: MediaStream) => {
    // Create elements if they don't exist
    if (!videoRef.current) {
      const video = document.createElement('video')
      video.autoplay = true
      video.muted = true
      video.playsInline = true
      video.srcObject = stream
      video.style.display = 'none'
      document.body.appendChild(video)
      videoRef.current = video
    } else {
      videoRef.current.srcObject = stream
    }
    
    if (!canvasRef.current) {
      const canvas = document.createElement('canvas')
      canvas.style.display = 'none'
      document.body.appendChild(canvas)
      canvasRef.current = canvas
    }
    
    // Start video playback
    videoRef.current.play().catch(err => console.error('Error playing video for moderation:', err))
    
    // Set moderation to active
    setIsModeratingStream(true)
    
    // Start moderation interval
    simulateModerationInterval()
  }
  
  const stopModeratingStream = () => {
    setIsModeratingStream(false)
    
    // Clear interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    
    // Clean up elements
    if (videoRef.current) {
      videoRef.current.srcObject = null
      videoRef.current.remove()
      videoRef.current = null
    }
    
    if (canvasRef.current) {
      canvasRef.current.remove()
      canvasRef.current = null
    }
  }
  
  // This is a simulation - in a real app, you would:
  // 1. Capture frames periodically
  // 2. Send them to a moderation API
  const simulateModerationInterval = () => {
    intervalRef.current = setInterval(() => {
      // Simulated detection with low probability of violation
      const random = Math.random()
      
      // 95% chance of safe content
      if (random > 0.95) {
        const contentTypes: ContentType[] = ['explicit', 'offensive', 'violence', 'spam']
        const randomType = contentTypes[Math.floor(Math.random() * contentTypes.length)]
        const confidence = 0.5 + (Math.random() * 0.5) // 0.5-1.0
        
        const result: ModerationResult = {
          type: randomType,
          confidence,
          timestamp: Date.now()
        }
        
        // Add to detections
        setDetections(prev => [...prev, result])
        
        // If confidence is high enough, trigger actions
        if (confidence > minConfidence) {
          setRecentViolation(result)
          
          // Auto-blur if enabled
          if (autoBlur) {
            setIsVideoBlurred(true)
          }
          
          // Auto-report if enabled
          if (autoReport) {
            submitReport(
              `Detected ${randomType} content`,
              `Confidence: ${Math.round(confidence * 100)}%`
            )
          }
        }
      }
    }, 10000) // Check every 10 seconds
  }
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopModeratingStream()
    }
  }, [])
  
  return {
    // State
    isModeratingStream,
    detections,
    reports,
    isVideoBlurred,
    recentViolation,
    
    // Refs for use in components
    videoRef,
    canvasRef,
    
    // Actions
    startModeratingStream,
    stopModeratingStream,
    toggleBlur,
    clearViolation,
    captureEvidence,
    submitReport
  }
} 