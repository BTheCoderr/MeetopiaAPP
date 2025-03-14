'use client'
import React, { useState, useEffect } from 'react'
import { io, Socket } from 'socket.io-client'
import { useSearchParams } from 'next/navigation'
import MainLayout from '../../components/Layout/MainLayout'

export default function MatchPage() {
  const searchParams = useSearchParams()
  const speedParam = searchParams.get('speed')
  const blindParam = searchParams.get('blind')
  
  const [matchType, setMatchType] = useState<'video' | 'text'>('video')
  const [mode, setMode] = useState<'regular' | 'speed'>(speedParam === 'true' ? 'speed' : 'regular')
  const [blindDate, setBlindDate] = useState<boolean>(blindParam === 'true')
  const [status, setStatus] = useState<'idle' | 'searching' | 'matched'>('idle')
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  useEffect(() => {
    // Explicitly connect to the server at localhost:3003
    const newSocket = io('http://localhost:3003', {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000
    })
    
    newSocket.on('connect', () => {
      console.log('Socket connected to server')
      setConnectionError(null)
    })
    
    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      setConnectionError('Failed to connect to server. Please try again.')
    })

    newSocket.on('match-found', ({ roomId, peer }) => {
      console.log('Match found, navigating to room:', roomId)
      setStatus('matched')
      // Navigate to chat/video room with mode and blind date parameters
      window.location.href = `/room/${roomId}?mode=${mode}&blind=${blindDate}`
    })

    setSocket(newSocket)

    return () => {
      console.log('Closing socket connection')
      newSocket.close()
    }
  }, [mode, blindDate])

  const startMatching = async () => {
    if (!socket?.connected) {
      setConnectionError('Not connected to server. Please refresh the page.')
      return
    }
    
    try {
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: matchType, mode, blindDate })
      })
      
      const data = await res.json()
      if (data.success) {
        setStatus('searching')
        console.log('Emitting find-match event with:', { type: matchType, mode, blindDate })
        socket?.emit('find-match', {
          type: matchType,
          mode: mode,
          blindDate: blindDate,
          userId: data.match.userId
        })
      }
    } catch (error) {
      console.error('Matching failed:', error)
      setConnectionError('Failed to start matching. Please try again.')
    }
  }

  return (
    <MainLayout>
      <div className="flex flex-col items-center gap-6 p-6 max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center">Find Your Match</h1>
        
        {connectionError && (
          <div className="text-red-500 text-center p-3 bg-red-100 rounded-lg w-full">
            {connectionError}
          </div>
        )}
        
        {status === 'searching' && (
          <div className="text-blue-500 text-xl animate-pulse">Searching for a match...</div>
        )}
        
        <div className="w-full bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="font-medium">
                {mode === 'speed' ? 'Speed Dating Mode' : 'Regular Chat'}
              </span>
              {mode === 'speed' && (
                <span className="text-sm text-gray-600">3-minute rounds</span>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <span className="font-medium">
                {blindDate ? 'Blind Date Mode' : 'Normal Video'}
              </span>
              {blindDate && (
                <span className="text-sm text-gray-600">30-second blur</span>
              )}
            </div>
          </div>
          
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setMatchType('video')}
              disabled={status === 'searching'}
              className={`flex-1 px-4 py-3 rounded-lg font-medium ${
                matchType === 'video' ? 'bg-green-500 text-white' : 'bg-gray-200'
              }`}
            >
              Video Chat
            </button>
            <button
              onClick={() => setMatchType('text')}
              disabled={status === 'searching'}
              className={`flex-1 px-4 py-3 rounded-lg font-medium ${
                matchType === 'text' ? 'bg-green-500 text-white' : 'bg-gray-200'
              }`}
            >
              Text Chat
            </button>
          </div>
        </div>
        
        <button
          onClick={startMatching}
          disabled={status === 'searching' || !socket?.connected}
          className="w-full px-6 py-4 bg-blue-600 text-white text-lg font-bold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
        >
          {status === 'idle' ? 'Start Matching Now' : 'Searching...'}
        </button>
        
        <div className="text-sm text-gray-500 mt-2">
          {socket?.connected ? 
            '✅ Connected to server' : 
            '❌ Not connected to server. Please refresh the page.'}
        </div>
      </div>
    </MainLayout>
  )
} 