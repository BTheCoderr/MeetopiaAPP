'use client'
import React, { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { WebRTCService } from '../../lib/webrtc'
import ChatBox from '../Chat/ChatBox'

export interface RoomProps {
  roomId: string
}

const Room = ({ roomId }: RoomProps) => {
  const [messages, setMessages] = useState<string[]>([])
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const webrtcRef = useRef<WebRTCService | null>(null)
  const socketRef = useRef<Socket | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [tempUserId, setTempUserId] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const initializeRoom = async () => {
      try {
        setIsLoading(true)
        const socket = io('http://localhost:3000', {
          transports: ['websocket'],
          upgrade: false
        })
        socketRef.current = socket
        webrtcRef.current = new WebRTCService(socket)

        const stream = await webrtcRef.current.startLocalStream()
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
        }

        if (!tempUserId) {
          setTempUserId(`user_${Date.now()}`)
        }

        socket.emit('join-room', {
          roomId,
          userId: tempUserId
        })

        socket.on('user-connected', (userId: string) => {
          console.log('User connected:', userId)
          webrtcRef.current?.createOffer()
        })

        socket.on('user-disconnected', (userId: string) => {
          console.log('User disconnected:', userId)
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null
          }
        })

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to access camera')
      } finally {
        setIsLoading(false)
      }
    }

    initializeRoom()
  }, [roomId, tempUserId])

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

  return (
    <div className="flex gap-4 p-4">
      <div className="w-2/3">
        {isLoading && <div>Setting up your camera...</div>}
        {error && <div className="text-red-500">{error}</div>}
        {!isLoading && !error && (
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
                  className={`p-2 rounded ${isMuted ? 'bg-red-500' : 'bg-gray-500'}`}
                >
                  {isMuted ? 'Unmute' : 'Mute'}
                </button>
                <button
                  onClick={toggleVideo}
                  className={`p-2 rounded ${isVideoOff ? 'bg-red-500' : 'bg-gray-500'}`}
                >
                  {isVideoOff ? 'Turn On Video' : 'Turn Off Video'}
                </button>
              </div>
            </div>
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full rounded-lg"
            />
          </div>
        )}
      </div>
      <div className="w-1/3">
        {socketRef.current && (
          <ChatBox 
            socket={socketRef.current} 
            roomId={roomId} 
            userId={tempUserId} 
          />
        )}
      </div>
    </div>
  )
}

export default Room 