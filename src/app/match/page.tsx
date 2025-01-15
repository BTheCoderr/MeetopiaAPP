'use client'
import React, { useState, useEffect } from 'react'
import { io, Socket } from 'socket.io-client'
import MainLayout from '../../components/Layout/MainLayout'

export default function MatchPage() {
  const [matchType, setMatchType] = useState<'video' | 'text'>('video')
  const [status, setStatus] = useState<'idle' | 'searching' | 'matched'>('idle')
  const [socket, setSocket] = useState<Socket | null>(null)

  useEffect(() => {
    const newSocket = io()
    setSocket(newSocket)

    newSocket.on('match-found', ({ roomId, peer }) => {
      setStatus('matched')
      // Navigate to chat/video room
      window.location.href = `/room/${roomId}`
    })

    return () => {
      newSocket.close()
    }
  }, [])

  const startMatching = async () => {
    try {
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: matchType })
      })
      
      const data = await res.json()
      if (data.success) {
        setStatus('searching')
        socket?.emit('find-match', {
          type: matchType,
          userId: data.match.userId
        })
      }
    } catch (error) {
      console.error('Matching failed:', error)
    }
  }

  return (
    <MainLayout>
      <div className="flex flex-col items-center gap-4 p-4">
        <h1 className="text-2xl font-bold">Find a Match</h1>
        
        {status === 'searching' && (
          <div className="text-blue-500">Searching for a match...</div>
        )}
        
        <div className="flex gap-4">
          <button
            onClick={() => setMatchType('video')}
            disabled={status === 'searching'}
            className={`px-4 py-2 rounded ${
              matchType === 'video' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            Video Chat
          </button>
          <button
            onClick={() => setMatchType('text')}
            disabled={status === 'searching'}
            className={`px-4 py-2 rounded ${
              matchType === 'text' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            Text Chat
          </button>
        </div>
        
        <button
          onClick={startMatching}
          disabled={status === 'searching'}
          className="px-6 py-3 bg-green-500 text-white rounded-lg disabled:bg-gray-300"
        >
          {status === 'idle' ? 'Start Matching' : 'Searching...'}
        </button>
      </div>
    </MainLayout>
  )
} 