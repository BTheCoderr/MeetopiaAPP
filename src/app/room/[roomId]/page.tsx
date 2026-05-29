'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import VideoCall from '@/components/VideoCall'
import { socket } from '@/lib/socket-client'
import { v4 as uuidv4 } from 'uuid'

export default function RoomPage({ params }: { params: { roomId: string } }) {
  const router = useRouter()
  const [isConnected, setIsConnected] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)

  useEffect(() => {
    if (!socket.connected) {
      socket.connect()
    }

    socket.on('connect', () => {
      setIsConnected(true)
      socket.emit('join-room', { roomId: params.roomId })
    })

    return () => {
      socket.off('connect')
      socket.emit('leave-room', { roomId: params.roomId })
    }
  }, [params.roomId])

  // This function will be called by the VideoCall component to update the connection status
  const handleConnectionStatus = (status: boolean) => {
    setIsConnected(status);
  }

  const handleNavigation = (action: string) => {
    switch(action) {
      case 'connection':
        // Generate a new room ID and navigate to it
        const newRoomId = uuidv4();
        router.push(`/room/${newRoomId}?video=true`)
        break
      case 'explore':
        router.push('/')
        break
      case 'base':
        router.push('/explore')
        break
      case 'feedback':
        break
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">
            <span className="text-blue-500">Meet</span>opia
          </h1>
              </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm">🌞 Light</span>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}>
            {isConnected ? 'Connected' : 'Not Connected'}
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="grid grid-cols-4 gap-4 p-4">
        <button 
          onClick={() => handleNavigation('connection')}
          className="text-center text-sm hover:text-blue-500"
        >
          Make a Connection!
        </button>
        <button 
          onClick={() => handleNavigation('explore')}
          className="text-center text-sm hover:text-blue-500"
        >
          Keep Exploring!
        </button>
        <button 
          onClick={() => handleNavigation('base')}
          className="text-center text-sm hover:text-blue-500"
        >
          Back to Base
        </button>
        <button 
          onClick={() => handleNavigation('feedback')}
          className="text-center text-sm hover:text-blue-500"
        >
          Let Us Know!
        </button>
      </nav>

      {/* Main Content */}
      <main className="p-4">
        <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
          <VideoCall
            roomId={params.roomId} 
            isMuted={isMuted}
            setIsMuted={setIsMuted}
            isVideoOff={isVideoOff}
            setIsVideoOff={setIsVideoOff}
            blindDate={false}
            peerId={null}
            onConnectionChange={handleConnectionStatus}
          />
        </div>

        {/* Chat Controls */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/80">
          <div className="flex justify-center gap-8">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className="p-3 rounded-full hover:bg-gray-800"
            >
              {isMuted ? '🔇' : '🎤'}
            </button>
                <button
              onClick={() => setIsVideoOff(!isVideoOff)}
              className="p-3 rounded-full hover:bg-gray-800"
                >
              {isVideoOff ? '🚫' : '📹'}
                </button>
              </div>
        </div>
      </main>
      </div>
  )
} 