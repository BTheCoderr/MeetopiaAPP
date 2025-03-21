'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import VideoCall from '@/components/VideoCall'
import TextChat from '@/components/TextChat'
import { socket } from '@/lib/socket-client'

export default function RoomPage({ params }: { params: { roomId: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode') || 'video'
  const blindDate = searchParams.get('blind') === 'true'
  const chatMode = searchParams.get('chatMode') || 'both'
  const peerBio = searchParams.get('peerBio') || ''
  const peerInterests = JSON.parse(searchParams.get('peerInterests') || '[]')
  
  const [hasLiked, setHasLiked] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [peerId, setPeerId] = useState<string | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)

  useEffect(() => {
    if (!socket.connected) {
      socket.connect()
    }

    socket.on('user-connected', (userId: string) => {
      console.log('User connected:', userId)
      setPeerId(userId)
    })

    socket.on('user-disconnected', (userId: string) => {
      console.log('User disconnected:', userId)
      if (userId === peerId) {
        setPeerId(null)
      }
    })

    return () => {
      socket.off('user-connected')
      socket.off('user-disconnected')
    }
  }, [peerId])

  useEffect(() => {
    console.log('Joining room:', params.roomId)
    socket.emit('join-room', { 
      roomId: params.roomId,
      userId: socket.id 
    })

    return () => {
      socket.emit('leave-room', { 
        roomId: params.roomId,
        userId: socket.id 
      })
    }
  }, [params.roomId])

  const handleKeepExploring = () => {
    const newRoomId = `room_${Date.now()}`
    router.push(`/room/${newRoomId}?mode=${mode}&blind=${blindDate}&chatMode=${chatMode}`)
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Video Call Section */}
          {(mode === 'video' || chatMode === 'both') && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <VideoCall
                roomId={params.roomId}
                peerId={peerId}
                blindDate={blindDate}
                isMuted={isMuted}
                setIsMuted={setIsMuted}
                isVideoOff={isVideoOff}
                setIsVideoOff={setIsVideoOff}
              />
            </div>
          )}

          {/* Text Chat Section */}
          {(mode === 'text' || chatMode === 'both') && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <TextChat
                roomId={params.roomId}
                peerId={peerId}
              />
            </div>
          )}
        </div>

        {/* Keep Exploring Button */}
        <div className="mt-8 text-center">
          <button
            onClick={handleKeepExploring}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow transition duration-200"
          >
            Keep Exploring
          </button>
        </div>
      </main>
    </div>
  )
} 