'use client'

import React, { useRef, useState, useEffect } from 'react'
import { WebRTCService } from '../lib/services/webRTCService'

const VideoChat: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [isClient, setIsClient] = useState<boolean>(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    const webRTC = new WebRTCService()
    let stream: MediaStream | null = null

    const initStream = async () => {
      try {
        stream = await webRTC.startLocalStream()
        if (videoRef.current && stream) {
          videoRef.current.srcObject = stream
          setIsConnected(true)
        }
      } catch (error) {
        console.error('Failed to start video stream:', error)
      }
    }

    initStream()

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [isClient])

  if (!isClient) return null

  return (
    <div className="flex flex-col items-center p-4">
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline
        muted 
        className="w-full max-w-2xl rounded-lg shadow-lg" 
      />
      <div className="chat-controls mt-4 space-x-4">
        <button 
          onClick={() => {}} 
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          disabled={!isConnected}
        >
          Next
        </button>
        <button 
          onClick={() => {}} 
          className="px-4 py-2 bg-red-500 text-white rounded disabled:opacity-50"
          disabled={!isConnected}
        >
          Disconnect
        </button>
      </div>
    </div>
  )
}

export default VideoChat 