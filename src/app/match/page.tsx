'use client'
import React, { useState, useEffect } from 'react'
import { io, Socket } from 'socket.io-client'
import { useSearchParams } from 'next/navigation'
import MainLayout from '../../components/Layout/MainLayout'

export default function MatchPage() {
  const searchParams = useSearchParams()
  const speedParam = searchParams.get('speed')
  const blindParam = searchParams.get('blind')
  const modeParam = searchParams.get('mode') || 'chat'
  const videoParam = searchParams.get('video')
  const bioParam = searchParams.get('bio') || ''
  const interestsParam = searchParams.get('interests') || '[]'
  
  // Parse interests from URL
  const parsedInterests = (() => {
    try {
      return JSON.parse(decodeURIComponent(interestsParam))
    } catch (e) {
      return []
    }
  })()
  
  // Force video for dating mode
  const [matchType, setMatchType] = useState<'video' | 'text'>(
    modeParam === 'dating' ? 'video' : (videoParam === 'true' ? 'video' : 'text')
  )
  const [mode, setMode] = useState<'regular' | 'speed'>(speedParam === 'true' ? 'speed' : 'regular')
  const [blindDate, setBlindDate] = useState<boolean>(blindParam === 'true')
  const [chatMode, setChatMode] = useState<'chat' | 'dating'>(modeParam === 'dating' ? 'dating' : 'chat')
  const [userBio, setUserBio] = useState<string>(decodeURIComponent(bioParam))
  const [userInterests, setUserInterests] = useState<string[]>(parsedInterests)
  const [status, setStatus] = useState<'idle' | 'searching' | 'matched'>('idle')
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  useEffect(() => {
    // Explicitly connect to the server using environment variable or fallback to localhost
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3003';
    const newSocket = io(socketUrl, {
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
      window.location.href = `/room/${roomId}?mode=${mode}&blind=${blindDate}&chatMode=${chatMode}&bio=${encodeURIComponent(userBio)}&interests=${encodeURIComponent(JSON.stringify(userInterests))}`
    })

    setSocket(newSocket)

    return () => {
      console.log('Closing socket connection')
      newSocket.close()
    }
  }, [mode, blindDate, chatMode, userBio, userInterests])

  const startMatching = async () => {
    if (!socket?.connected) {
      setConnectionError('Not connected to server. Please refresh the page.')
      return
    }
    
    try {
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: matchType, 
          mode, 
          blindDate, 
          chatMode,
          bio: userBio,
          interests: userInterests
        })
      })
      
      const data = await res.json()
      if (data.success) {
        setStatus('searching')
        console.log('Emitting find-match event with:', { 
          type: matchType, 
          mode, 
          blindDate, 
          chatMode,
          bio: userBio,
          interests: userInterests
        })
        socket?.emit('find-match', {
          type: matchType,
          mode: mode,
          blindDate: blindDate,
          chatMode: chatMode,
          bio: userBio,
          interests: userInterests,
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
        <h1 className="text-3xl font-bold text-center">
          {chatMode === 'dating' ? 'Find Your Date' : 'Find Someone to Chat With'}
        </h1>
        
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
                {chatMode === 'dating' ? 'Dating Mode' : 'Casual Chat'}
              </span>
              <span className={`px-2 py-1 rounded text-xs ${
                chatMode === 'dating' ? 'bg-pink-100 text-pink-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {chatMode === 'dating' ? 'Dating' : 'Chat'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="font-medium">
                {mode === 'speed' ? 'Speed Mode' : 'Regular Mode'}
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
            
            {chatMode === 'dating' && (
              <div className="mt-2 border-t pt-3">
                <h3 className="font-medium mb-2">Your Profile</h3>
                {userBio ? (
                  <p className="text-sm text-gray-700 mb-2">{userBio}</p>
                ) : (
                  <p className="text-sm text-gray-500 italic mb-2">No bio provided</p>
                )}
                
                {userInterests.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {userInterests.map((interest, index) => (
                      <span key={index} className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                        {interest}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No interests provided</p>
                )}
              </div>
            )}
          </div>
          
          {chatMode !== 'dating' && videoParam !== 'true' && (
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
          )}
          
          {chatMode === 'dating' && (
            <div className="bg-pink-50 p-3 rounded-lg mb-4 text-center">
              <p className="text-pink-800 text-sm">
                Dating mode uses video chat only for more meaningful connections
              </p>
            </div>
          )}
        </div>
        
        <button
          onClick={startMatching}
          disabled={status === 'searching' || !socket?.connected}
          className={`w-full px-6 py-4 text-white text-lg font-bold rounded-lg shadow-md hover:opacity-90 disabled:bg-gray-300 transition-colors ${
            chatMode === 'dating' ? 'bg-pink-600 hover:bg-pink-700' : 'bg-blue-600 hover:bg-blue-700'
          }`}
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