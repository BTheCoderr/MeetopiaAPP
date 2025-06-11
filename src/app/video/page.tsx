'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function VideoPage() {
  const router = useRouter()

  useEffect(() => {
    // Generate a room ID and redirect directly to video chat
    const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    router.push(`/room/${roomId}?mode=regular&chatMode=video`)
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🚀</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Connecting you now...</h1>
        <p className="text-gray-600">Please wait while we set up your video chat</p>
      </div>
    </div>
  )
} 