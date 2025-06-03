'use client'
import React, { useRef, useState, useEffect } from 'react'
import { WebRTCService } from '@/lib/services/webRTCService'
import { ChatLayout } from './ChatLayout'

export const VideoChat = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)

  useEffect(() => {
    const initCamera = async () => {
      try {
        const webRTC = new WebRTCService()
        const mediaStream = await webRTC.startLocalStream()
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = mediaStream
          setStream(mediaStream)
          setIsConnected(true)
        }
      } catch (error) {
        console.error('Failed to start video stream:', error)
      }
    }

    initCamera()
    return () => {
      stream?.getTracks().forEach(track => track.stop())
    }
  }, [])

  return (
    <ChatLayout>
      <div className="grid grid-cols-2 gap-6 h-[70vh]">
        {/* Your Video */}
        <div className="bg-card-bg rounded-xl overflow-hidden w-full h-full relative">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4 text-card-text text-sm bg-card-bg/75 px-3 py-1 rounded-full">
            You
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            <button 
              onClick={() => {
                stream?.getAudioTracks().forEach(track => {
                  track.enabled = !track.enabled
                })
                setIsMuted(!isMuted)
              }}
              className="bg-white/10 backdrop-blur p-3 rounded-full hover:bg-white/20 transition-colors"
            >
              {isMuted ? '🔇' : '🎤'}
            </button>
            <button 
              onClick={() => {
                stream?.getVideoTracks().forEach(track => {
                  track.enabled = !track.enabled
                })
                setIsVideoOff(!isVideoOff)
              }}
              className="bg-white/10 backdrop-blur p-3 rounded-full hover:bg-white/20 transition-colors"
            >
              {isVideoOff ? '🚫' : '📹'}
            </button>
            <button 
              onClick={() => console.log('Skip to next person')}
              className="bg-white/10 backdrop-blur p-3 rounded-full hover:bg-white/20 transition-colors"
              disabled={!isConnected}
            >
              ⏭️
            </button>
          </div>
        </div>

        {/* Partner Video */}
        <div className="bg-card-bg rounded-xl overflow-hidden w-full h-full relative flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700">
          <div className="absolute top-4 left-4 text-card-text text-sm bg-card-bg/75 px-3 py-1 rounded-full">
            Partner
          </div>
          <div className="text-center">
            <p className="text-card-text/70 text-lg font-medium">
              Waiting for partner...
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Controls - Centered */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex justify-center gap-4">
        <button 
          className="px-8 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors shadow-lg"
          disabled={!isConnected}
        >
          NEXT PERSON
        </button>
        <button className="px-8 py-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg">
          LEAVE CHAT
        </button>
      </div>
    </ChatLayout>
  )
} 