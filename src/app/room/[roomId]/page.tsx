'use client'
import React, { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import MainLayout from '../../../components/Layout/MainLayout'
import { WebRTCService } from '../../../lib/webrtc'
import ChatBox from '../../../components/Chat/ChatBox'
import { ReportingService } from '../../../lib/services/reporting'
import { UserProfile, ReportReason } from '../../../lib/types/user'

export default function RoomPage({ params }: { params: { roomId: string } }) {
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const webrtcRef = useRef<WebRTCService | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')
  const tempUserId = `user_${Date.now()}`
  const [remoteUser, setRemoteUser] = useState<UserProfile | null>(null)
  const reportingService = useRef(new ReportingService())

  useEffect(() => {
    const socket = io()
    webrtcRef.current = new WebRTCService(socket)

    socket.on('connect', () => setConnectionStatus('connecting'))
    socket.on('user-connected', () => setConnectionStatus('connected'))
    socket.on('user-disconnected', () => setConnectionStatus('disconnected'))

    // Start local stream
    webrtcRef.current.startLocalStream().then(stream => {
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }
    })

    // Handle remote stream
    window.addEventListener('remote-stream', ((event: CustomEvent) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.detail.stream
        setConnectionStatus('connected')
      }
    }) as EventListener)

    socket.emit('join-room', params.roomId)

    return () => {
      webrtcRef.current?.cleanup()
      socket.close()
    }
  }, [params.roomId])

  const findNextMatch = () => {
    setConnectionStatus('connecting')
    webrtcRef.current?.cleanup()
    // Generate new room ID and redirect
    const newRoomId = `room_${Date.now()}`
    window.location.href = `/room/${newRoomId}`
  }

  const toggleMute = () => {
    const stream = localVideoRef.current?.srcObject as MediaStream
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled
      })
      setIsMuted(!isMuted)
    }
  }

  const toggleVideo = () => {
    const stream = localVideoRef.current?.srcObject as MediaStream
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled
      })
      setIsVideoOff(!isVideoOff)
    }
  }

  const handleReport = async (reason: ReportReason, details?: string) => {
    if (!remoteUser) return
    
    try {
      await reportingService.current.createReport(
        tempUserId,
        remoteUser.id,
        reason,
        details
      )
      // Automatically find next match after reporting
      findNextMatch()
    } catch (error) {
      console.error('Failed to submit report:', error)
    }
  }

  const handleBlock = async () => {
    if (!remoteUser) return
    
    try {
      await reportingService.current.blockUser(tempUserId, remoteUser.id)
      // Automatically find next match after blocking
      findNextMatch()
    } catch (error) {
      console.error('Failed to block user:', error)
    }
  }

  return (
    <MainLayout>
      <div className="flex gap-4 p-4">
        <div className="w-2/3">
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full rounded-lg"
              />
              <div className="absolute bottom-4 left-4 flex gap-2">
                <button
                  onClick={toggleMute}
                  className={`p-2 rounded ${isMuted ? 'bg-red-500' : 'bg-gray-500'} text-white`}
                >
                  {isMuted ? 'Unmute' : 'Mute'}
                </button>
                <button
                  onClick={toggleVideo}
                  className={`p-2 rounded ${isVideoOff ? 'bg-red-500' : 'bg-gray-500'} text-white`}
                >
                  {isVideoOff ? 'Turn On Video' : 'Turn Off Video'}
                </button>
              </div>
            </div>
            <div className="relative">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full rounded-lg"
              />
              <div className="absolute top-4 left-4">
                <span className={`px-2 py-1 rounded text-sm text-white ${
                  connectionStatus === 'connected' ? 'bg-green-500' :
                  connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
                }`}>
                  {connectionStatus === 'connected' ? 'Connected' :
                   connectionStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-center">
            <button
              onClick={findNextMatch}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Next Match
            </button>
          </div>
        </div>
        <div className="w-1/3 flex flex-col gap-4">
          <ChatBox 
            socket={io()} 
            roomId={params.roomId} 
            userId={tempUserId}
          />
          {remoteUser && (
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold mb-2">Partner Profile</h3>
              <p>Age: {remoteUser.age}</p>
              <p>Interests: {remoteUser.interests.join(', ')}</p>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleBlock()}
                  className="px-4 py-2 bg-red-500 text-white rounded"
                >
                  Block User
                </button>
                <button
                  onClick={() => handleReport('inappropriate_behavior')}
                  className="px-4 py-2 bg-yellow-500 text-white rounded"
                >
                  Report User
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
} 