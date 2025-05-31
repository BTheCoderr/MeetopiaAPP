'use client'
import React, { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useSearchParams, useRouter } from 'next/navigation'
import MainLayout from '../../../components/Layout/MainLayout'
import { WebRTCService } from '../../../lib/webrtc'
import ChatBox from '../../../components/Chat/ChatBox'
import { ReportingService } from '../../../lib/services/reporting'
import { UserProfile, ReportReason } from '../../../lib/types/user'

interface PageProps {
  params: Promise<{ roomId: string }>
}

export default function RoomPage({ params }: PageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode') || 'regular'
  const blindDate = searchParams.get('blind') === 'true'
  const chatMode = searchParams.get('chatMode') || 'chat'
  const peerBio = searchParams.get('peerBio') || ''
  const peerInterestsParam = searchParams.get('peerInterests') || '[]'
  
  // Parse peer interests
  const peerInterests = (() => {
    try {
      return JSON.parse(decodeURIComponent(peerInterestsParam))
    } catch (e) {
      return []
    }
  })()
  
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const webrtcRef = useRef<WebRTCService | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'failed'>('connecting')
  const tempUserId = `user_${Date.now()}`
  const [remoteUser, setRemoteUser] = useState<UserProfile | null>(null)
  const reportingService = useRef(new ReportingService())
  const [roomId, setRoomId] = useState<string>('')
  
  // Socket for chat
  const [chatSocket, setChatSocket] = useState<Socket | null>(null)
  
  // Speed dating timer state
  const [timeRemaining, setTimeRemaining] = useState<number>(mode === 'speed' ? 180 : 0) // 3 minutes in seconds
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  
  // Blind date feature - blur video for first 30 seconds
  const [isBlurred, setIsBlurred] = useState(blindDate)
  const blurTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Like/Dislike system
  const [hasLiked, setHasLiked] = useState(false)
  const [hasDisliked, setHasDisliked] = useState(false)
  const [matchLiked, setMatchLiked] = useState(false)
  const [isMatched, setIsMatched] = useState(false)
  
  // Next match loading state
  const [isLoadingNextMatch, setIsLoadingNextMatch] = useState(false)

  // Connection retry count
  const [retryCount, setRetryCount] = useState(0)
  const maxRetries = 3

  // Effect to unwrap async params
  useEffect(() => {
    const unwrapParams = async () => {
      const resolvedParams = await params
      setRoomId(resolvedParams.roomId)
    }
    unwrapParams()
  }, [params])

  useEffect(() => {
    // Create a separate socket for chat
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3003';
    const newChatSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000
    })
    setChatSocket(newChatSocket)
    
    return () => {
      newChatSocket.close()
    }
  }, [])

  useEffect(() => {
    if (!roomId) return // Wait for roomId to be resolved
    
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3003';
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000
    })
    
    socket.on('connect', () => {
      console.log('Socket connected to server')
      setConnectionStatus('connecting')
    })
    
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      setConnectionStatus('disconnected')
    })
    
    webrtcRef.current = new WebRTCService(socket)

    // Handle WebRTC events
    window.addEventListener('webrtc-reconnecting', ((event: CustomEvent) => {
      setConnectionStatus('reconnecting')
      setRetryCount(event.detail.attempt)
    }) as EventListener)
    
    window.addEventListener('webrtc-failed', (() => {
      setConnectionStatus('failed')
      // Auto find next match after connection failure
      if (retryCount >= maxRetries) {
        setTimeout(() => findNextMatch(), 2000)
      }
    }) as EventListener)

    socket.on('user-connected', () => setConnectionStatus('connected'))
    socket.on('user-disconnected', () => {
      setConnectionStatus('disconnected')
      // Auto find next match if user disconnects
      setTimeout(() => findNextMatch(), 2000)
    })

    // Handle like/dislike events
    socket.on('peer-liked', () => {
      setMatchLiked(true)
      if (hasLiked) {
        setIsMatched(true)
        // Show match notification
        const matchNotification = document.createElement('div')
        matchNotification.className = 'fixed top-0 left-0 right-0 bg-green-500 text-white text-center p-2 z-50'
        matchNotification.textContent = 'It\'s a match! You both liked each other!'
        document.body.appendChild(matchNotification)
        setTimeout(() => matchNotification.remove(), 5000)
      }
    })

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
        
        // Start the blur timer when connection is established
        if (blindDate) {
          startBlurTimer()
        }
        
        // Start the speed dating timer if in speed mode
        if (mode === 'speed') {
          startSpeedDatingTimer()
        }
      }
    }) as EventListener)

    console.log('Joining room:', roomId)
    socket.emit('join-room', roomId)

    return () => {
      webrtcRef.current?.cleanup()
      socket.close()
      
      // Clear timers on cleanup
      if (timerRef.current) clearInterval(timerRef.current)
      if (blurTimerRef.current) clearTimeout(blurTimerRef.current)
      
      // Remove event listeners
      window.removeEventListener('webrtc-reconnecting', (() => {}) as EventListener)
      window.removeEventListener('webrtc-failed', (() => {}) as EventListener)
      window.removeEventListener('remote-stream', (() => {}) as EventListener)
    }
  }, [roomId, mode, blindDate, hasLiked, retryCount])
  
  const startBlurTimer = () => {
    // Unblur after 30 seconds
    blurTimerRef.current = setTimeout(() => {
      setIsBlurred(false)
    }, 30000)
  }
  
  const startSpeedDatingTimer = () => {
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Time's up, clear interval and find next match
          if (timerRef.current) clearInterval(timerRef.current)
          findNextMatch()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  const findNextMatch = () => {
    // Prevent multiple clicks
    if (isLoadingNextMatch) return
    
    setIsLoadingNextMatch(true)
    setConnectionStatus('connecting')
    
    if (blindDate) {
      setIsBlurred(true) // Reset blur for next match
    }
    setTimeRemaining(mode === 'speed' ? 180 : 0) // Reset timer
    
    // Reset like/dislike state
    setHasLiked(false)
    setHasDisliked(false)
    setMatchLiked(false)
    setIsMatched(false)
    
    // Clear existing timers
    if (timerRef.current) clearInterval(timerRef.current)
    if (blurTimerRef.current) clearTimeout(blurTimerRef.current)
    
    webrtcRef.current?.cleanup()
    
    // Generate new room ID and redirect
    const newRoomId = `room_${Date.now()}`
    router.push(`/room/${newRoomId}?mode=${mode}&blind=${blindDate}&chatMode=${chatMode}&peerBio=${encodeURIComponent(peerBio)}&peerInterests=${encodeURIComponent(JSON.stringify(peerInterests))}`)
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
  
  const handleLike = () => {
    if (hasLiked) return
    
    setHasLiked(true)
    setHasDisliked(false)
    
    // Emit like event to server
    chatSocket?.emit('like-user', {
      roomId: roomId,
      userId: tempUserId
    })
    
    // If match also liked, it's a match!
    if (matchLiked) {
      setIsMatched(true)
    }
  }
  
  const handleDislike = () => {
    if (hasDisliked) return
    
    setHasDisliked(true)
    setHasLiked(false)
    
    // If disliked, automatically find next match after a short delay
    setTimeout(() => findNextMatch(), 500)
  }

  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row gap-4 p-4">
        <div className="w-full md:w-2/3">
          {mode === 'speed' && timeRemaining > 0 && (
            <div className="bg-blue-100 text-blue-800 p-3 rounded-lg mb-4 flex justify-between items-center">
              <span className="font-medium">Speed {chatMode === 'dating' ? 'Dating' : 'Chat'} Mode</span>
              <span className="text-xl font-bold">{formatTime(timeRemaining)}</span>
            </div>
          )}
          
          {chatMode === 'dating' && (
            <div className={`bg-pink-100 text-pink-800 p-3 rounded-lg mb-4 ${mode === 'speed' ? 'mt-2' : ''}`}>
              <span className="font-medium">Dating Mode - Find your perfect match!</span>
            </div>
          )}
          
          {isMatched && (
            <div className="bg-green-100 text-green-800 p-3 rounded-lg mb-4 flex items-center justify-center">
              <span className="font-medium">🎉 It's a match! You both liked each other!</span>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              {isBlurred && (
                <div className="absolute inset-0 z-10 backdrop-blur-xl rounded-lg flex items-center justify-center transition-all duration-500">
                  <div className="text-center p-4 bg-black bg-opacity-50 rounded-lg">
                    <p className="text-lg font-bold mb-2 text-white">Blind Date Mode</p>
                    <p className="text-white">Video will appear in 30 seconds</p>
                  </div>
                </div>
              )}
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full rounded-lg"
              />
              <div className="absolute top-4 left-4">
                <span className={`px-2 py-1 rounded text-sm text-white ${
                  connectionStatus === 'connected' ? 'bg-green-500' :
                  connectionStatus === 'connecting' ? 'bg-yellow-500' :
                  connectionStatus === 'reconnecting' ? 'bg-orange-500' :
                  'bg-red-500'
                }`}>
                  {connectionStatus === 'connected' ? 'Connected' :
                   connectionStatus === 'connecting' ? 'Connecting...' :
                   connectionStatus === 'reconnecting' ? `Reconnecting (${retryCount}/3)...` :
                   connectionStatus === 'failed' ? 'Connection Failed' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Like/Dislike and Next Match Buttons */}
          <div className="mt-6 flex justify-center gap-4">
            {chatMode === 'dating' && connectionStatus === 'connected' && (
              <>
                <button
                  onClick={handleDislike}
                  disabled={hasDisliked || isLoadingNextMatch}
                  className={`px-8 py-3 rounded-full text-white text-lg font-bold transition-colors shadow-md ${
                    hasDisliked ? 'bg-red-300' : 'bg-red-500 hover:bg-red-600'
                  }`}
                >
                  👎 Pass
                </button>
                <button
                  onClick={handleLike}
                  disabled={hasLiked || isLoadingNextMatch}
                  className={`px-8 py-3 rounded-full text-white text-lg font-bold transition-colors shadow-md ${
                    hasLiked ? 'bg-green-300' : 'bg-green-500 hover:bg-green-600'
                  }`}
                >
                  👍 Like
                </button>
              </>
            )}
            
            <button
              onClick={findNextMatch}
              disabled={isLoadingNextMatch}
              className={`px-8 py-3 bg-blue-600 text-white text-lg font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-md ${
                isLoadingNextMatch ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoadingNextMatch ? 'Finding Next...' : 'Next Match'}
            </button>
          </div>
        </div>
        <div className="w-full md:w-1/3 flex flex-col gap-4">
          {chatSocket && (
            <ChatBox 
              socket={chatSocket} 
              roomId={roomId} 
              userId={tempUserId}
            />
          )}
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