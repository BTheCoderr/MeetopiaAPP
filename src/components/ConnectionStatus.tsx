'use client'
import { useState, useEffect } from 'react'

export default function ConnectionStatus() {
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Simulate connection status - replace with real WebSocket/WebRTC logic later
    const randomDelay = Math.floor(Math.random() * 2000) + 1000
    const timer = setTimeout(() => {
      setIsConnected(true)
    }, randomDelay)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
      <span className="text-sm text-gray-600">
        {isConnected ? 'Connected' : 'Disconnected'}
      </span>
    </div>
  )
} 