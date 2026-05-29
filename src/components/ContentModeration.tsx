'use client'
import { useState, useEffect, useRef } from 'react'

// Types for the moderation detection
interface ModerationResult {
  type: 'explicit' | 'offensive' | 'violence' | 'spam' | 'safe'
  confidence: number
  timestamp: number
}

interface ContentModerationProps {
  stream: MediaStream | null
  onDetection?: (result: ModerationResult) => void
  autoBlur?: boolean
  sampleInterval?: number // In milliseconds
}

const ContentModeration: React.FC<ContentModerationProps> = ({
  stream,
  onDetection,
  autoBlur = true,
  sampleInterval = 5000 // Default to checking every 5 seconds
}) => {
  const [isRunning, setIsRunning] = useState(false)
  const [lastResult, setLastResult] = useState<ModerationResult | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Setup video element with stream
  useEffect(() => {
    if (!stream || !videoRef.current) return
    
    videoRef.current.srcObject = stream
    videoRef.current.play().catch(err => console.error('Error playing video for moderation:', err))
    
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject = null
      }
    }
  }, [stream])

  // Initialize moderation system
  useEffect(() => {
    if (!stream) return
    
    setIsRunning(true)
    
    // Clean up on unmount
    return () => {
      setIsRunning(false)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [stream])

  // Setup sampling interval
  useEffect(() => {
    if (!isRunning || !stream) return
    
    const runModeration = () => {
      if (!canvasRef.current || !videoRef.current) return
      
      try {
        // Capture frame from video
        const ctx = canvasRef.current.getContext('2d')
        if (!ctx) return
        
        ctx.drawImage(
          videoRef.current, 
          0, 0, 
          canvasRef.current.width, 
          canvasRef.current.height
        )
        
        // In a real implementation, we would:
        // 1. Convert the canvas to a data URL
        // const imageData = canvasRef.current.toDataURL('image/jpeg', 0.8)
        
        // 2. Send this to an API for moderation
        // For demo purposes, we'll just simulate random results
        simulateModeration()
      } catch (error) {
        console.error('Error in content moderation:', error)
      }
    }
    
    // Run immediately once, then set interval
    runModeration()
    intervalRef.current = setInterval(runModeration, sampleInterval)
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isRunning, stream, sampleInterval])

  // Simulate content moderation results
  // In a real implementation, this would call an actual API
  const simulateModeration = () => {
    // Demo just returns safe most of the time
    // In a real implementation, you'd call a service like AWS Rekognition,
    // Google Cloud Vision, or similar
    
    const resultTypes: ModerationResult['type'][] = [
      'safe', 'safe', 'safe', 'safe', 'safe', 
      'explicit', 'offensive', 'violence', 'spam'
    ]
    
    // Mostly return safe
    const randomIndex = Math.floor(Math.random() * resultTypes.length)
    const type = resultTypes[randomIndex]
    
    const result: ModerationResult = {
      type,
      confidence: Math.random() * 0.5 + 0.5, // 0.5 to 1.0
      timestamp: Date.now()
    }
    
    // Only trigger for non-safe results with high confidence
    if (type !== 'safe' && result.confidence > 0.7) {
      setLastResult(result)
      if (onDetection) {
        onDetection(result)
      }
    }
  }

  return (
    <div className="hidden">
      <canvas 
        ref={canvasRef}
        width="320"
        height="240"
        className="hidden"
      />
      <video
        ref={videoRef}
        muted
        playsInline
        className="hidden"
      />
      {/* Status element for debugging - can be removed in production */}
      {lastResult && (
        <div className="p-2 bg-red-600 text-white text-xs rounded">
          Detected {lastResult.type} content 
          (Confidence: {Math.round(lastResult.confidence * 100)}%)
        </div>
      )}
    </div>
  )
}

export default ContentModeration 