'use client'
import React, { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { WebRTCService } from '../lib/webrtc'

interface VideoCallProps {
  roomId: string
  isMuted: boolean
  setIsMuted: (muted: boolean) => void
  isVideoOff: boolean
  setIsVideoOff: (off: boolean) => void
  blindDate: boolean
  peerId: string | null
}

const VideoCall: React.FC<VideoCallProps> = ({
  roomId,
  isMuted,
  setIsMuted,
  isVideoOff,
  setIsVideoOff,
  blindDate,
  peerId
}) => {
  // Refs for video elements
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  
  // State for WebRTC service and streams
  const [webRTC, setWebRTC] = useState<WebRTCService | null>(null)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [isConnecting, setIsConnecting] = useState<boolean>(true)
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)
  
  // State for UI controls
  const [showControls, setShowControls] = useState<boolean>(true)
  const [isBlurred, setIsBlurred] = useState<boolean>(blindDate)
  const controlsTimerRef = useRef<NodeJS.Timeout | null>(null)
  
  // Initialize WebRTC connection
  useEffect(() => {
    // Create socket connection for signaling
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3003'
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    })
    
    // Create WebRTC service
    const webRTCService = new WebRTCService(socket)
    setWebRTC(webRTCService)
    
    // Start local stream
    webRTCService.startLocalStream().then(stream => {
      setLocalStream(stream)
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }
    })
    
    // Handle remote stream event
    const handleRemoteStream = (event: CustomEvent) => {
      setRemoteStream(event.detail.stream)
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.detail.stream
      }
      setIsConnecting(false)
      setIsConnected(true)
    }
    
    window.addEventListener('remote-stream', handleRemoteStream as EventListener)
    
    // Create or answer offer when peer is available
    if (peerId) {
      setIsConnecting(true)
      if (socket.id && peerId > socket.id) {
        // We create the offer
        webRTCService.createOffer()
      }
    }
    
    // Handle blur for blind dates
    if (blindDate) {
      setTimeout(() => {
        setIsBlurred(false)
      }, 30000) // 30 seconds
    }
    
    // Cleanup on unmount
    return () => {
      webRTCService.cleanup()
      socket.close()
      window.removeEventListener('remote-stream', handleRemoteStream as EventListener)
    }
  }, [roomId, peerId, blindDate])
  
  // Update mute/video state in the stream
  useEffect(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !isMuted
      })
    }
  }, [isMuted, localStream])
  
  useEffect(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !isVideoOff
      })
    }
  }, [isVideoOff, localStream])
  
  // Show/hide controls based on mouse movement
  const showControlsTemporarily = () => {
    setShowControls(true)
    
    if (controlsTimerRef.current) {
      clearTimeout(controlsTimerRef.current)
    }
    
    controlsTimerRef.current = setTimeout(() => {
      setShowControls(false)
    }, 3000) // Hide after 3 seconds of inactivity
  }
  
  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      const container = remoteVideoRef.current?.parentElement
      if (container && container.requestFullscreen) {
        container.requestFullscreen()
        setIsFullscreen(true)
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
        setIsFullscreen(false)
      }
    }
  }
  
  return (
    <div 
      className="relative w-full h-[70vh] md:h-[60vh] bg-black rounded-lg overflow-hidden"
      onMouseMove={showControlsTemporarily}
    >
      {/* Main (Remote) Video */}
      <div className="w-full h-full">
        {peerId && isConnecting && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-pulse text-white text-xl">Connecting...</div>
          </div>
        )}
        
        {isBlurred && (
          <div className="absolute inset-0 z-20 backdrop-blur-xl flex items-center justify-center">
            <div className="text-center bg-black/50 p-6 rounded-xl">
              <h3 className="text-white text-xl font-bold mb-2">Blind Date Mode</h3>
              <p className="text-white/80">Video will appear in 30 seconds</p>
            </div>
          </div>
        )}
        
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Local Video (Picture-in-Picture) */}
      <div className="absolute top-4 right-4 w-1/4 rounded-lg overflow-hidden shadow-xl z-10">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="w-full object-cover"
        />
        
        {/* Local video controls (show on hover) */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 p-2 opacity-0 hover:opacity-100 transition-opacity">
          <div className="flex justify-center space-x-2">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className={`p-2 rounded-full ${isMuted ? 'bg-red-500' : 'bg-green-500'} text-white text-xs`}
            >
              {isMuted ? '🔇' : '🎤'}
            </button>
            <button 
              onClick={() => setIsVideoOff(!isVideoOff)}
              className={`p-2 rounded-full ${isVideoOff ? 'bg-red-500' : 'bg-green-500'} text-white text-xs`}
            >
              {isVideoOff ? '🚫' : '📹'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Controls (appear on mouse movement) */}
      <div 
        className={`absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex justify-center items-center gap-8">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="flex flex-col items-center"
          >
            <div className={`w-12 h-12 flex items-center justify-center rounded-full ${
              isMuted ? 'bg-red-500' : 'bg-white/20 hover:bg-white/30'
            } transition-colors`}>
              {isMuted ? (
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1V8a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1h-1.586l-2.707 2.707a1 1 0 01-1.414 0L8.293 15H5.586z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18.5c4.142 0 7.5-3.134 7.5-7s-3.358-7-7.5-7c-4.142 0-7.5 3.134-7.5 7 0 3.866 3.358 7 7.5 7zM12 11.5v4M12 7.5v.01" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0-11V3m0 0a7 7 0 017 7c0 1.462-.452 2.82-1.222 3.95" />
                </svg>
              )}
            </div>
            <span className="text-white text-xs mt-2">{isMuted ? 'Unmute' : 'Mute'}</span>
          </button>
          
          <button 
            onClick={() => setIsVideoOff(!isVideoOff)}
            className="flex flex-col items-center"
          >
            <div className={`w-12 h-12 flex items-center justify-center rounded-full ${
              isVideoOff ? 'bg-red-500' : 'bg-white/20 hover:bg-white/30'
            } transition-colors`}>
              {isVideoOff ? (
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              )}
            </div>
            <span className="text-white text-xs mt-2">{isVideoOff ? 'Show Video' : 'Hide Video'}</span>
          </button>
          
          <button 
            onClick={toggleFullscreen}
            className="flex flex-col items-center"
          >
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
              </svg>
            </div>
            <span className="text-white text-xs mt-2">Fullscreen</span>
          </button>
        </div>
      </div>
      
      {/* Connection status indicator */}
      <div className="absolute top-4 left-4 z-10">
        <div className={`px-3 py-1 rounded-full text-xs ${
          isConnected 
            ? 'bg-green-500 text-white' 
            : isConnecting 
              ? 'bg-yellow-500 text-white' 
              : 'bg-red-500 text-white'
        }`}>
          {isConnected ? 'Connected' : isConnecting ? 'Connecting...' : 'Not Connected'}
        </div>
      </div>
    </div>
  )
}

export default VideoCall 