'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import JitsiVideoChat from '@/components/JitsiVideoChat'

export default function VideoChatPage() {
  const router = useRouter()
  const [roomName, setRoomName] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Generate a unique room name if not provided
    const urlParams = new URLSearchParams(window.location.search)
    const urlRoomName = urlParams.get('room')
    const urlDisplayName = urlParams.get('name')
    
    setRoomName(urlRoomName || `meetopia-room-${Date.now()}`)
    setDisplayName(urlDisplayName || 'Anonymous User')
    setIsLoading(false)
  }, [])

  const handleLeave = () => {
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Setting up your meeting room...</p>
          <p className="text-sm text-gray-400 mt-2">Now supporting 50+ participants with Jitsi Meet!</p>
        </div>
      </div>
    )
  }

  return (
    <JitsiVideoChat
      roomName={roomName}
      displayName={displayName}
      onLeave={handleLeave}
    />
  )
}