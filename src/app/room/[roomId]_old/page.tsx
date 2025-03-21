'use client'
import { useEffect, useState, useRef } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { io, Socket } from 'socket.io-client'
import MainLayout from '../../../components/Layout/MainLayout'
import VideoCall from '../../../components/VideoCall'
import TextChat from '../../../components/TextChat'
import ProfileCard from '../../../components/ProfileCard'
import dynamic from 'next/dynamic'

// Dynamically import components
const Timer = dynamic(() => import('../../../components/Timer'), { ssr: false })

export default function RoomPage() {
  const params = useParams()
  const roomId = params.id as string
  const searchParams = useSearchParams()
  
  // Get parameters from URL
  const mode = searchParams.get('mode') || 'regular'
  const blindDate = searchParams.get('blind') === 'true'
  const chatMode = searchParams.get('chatMode') || 'chat'
  const bio = searchParams.get('bio') ? decodeURIComponent(searchParams.get('bio') || '') : '' 
  const interestsParam = searchParams.get('interests') || '[]'
  
  // Parse interests from URL
  const interests = (() => {
    try {
      return JSON.parse(decodeURIComponent(interestsParam))
    } catch (e) {
      return []
    }
  })()
  
  // State for peer's profile info (will be populated during chat)
  const [peerBio, setPeerBio] = useState<string>('')
  const [peerInterests, setPeerInterests] = useState<string[]>([])
  const [showProfiles, setShowProfiles] = useState<boolean>(false)
  
  // Connection states
  const [socket, setSocket] = useState<Socket | null>(null)
  const [peerId, setPeerId] = useState<string | null>(null)
  const [type, setType] = useState<'video' | 'text'>('video')
  const [error, setError] = useState<string | null>(null)
  const [liked, setLiked] = useState<boolean | null>(null)
  const [peerLikedMe, setPeerLikedMe] = useState<boolean | null>(null)
  
  // UI states
  const [isMuted, setIsMuted] = useState<boolean>(false)
  const [isVideoOff, setIsVideoOff] = useState<boolean>(false)
  const [isTimerVisible, setIsTimerVisible] = useState<boolean>(false)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [showLikeButtons, setShowLikeButtons] = useState<boolean>(false)
  const [matchStatus, setMatchStatus] = useState<'none' | 'liked' | 'matched'>('none')
  
  // References
  const foundMatch = useRef(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  
  useEffect(() => {
    // Determine chat type from URL or force video for dating mode
    const typeParam = searchParams.get('type')
    setType(chatMode === 'dating' ? 'video' : (typeParam === 'text' ? 'text' : 'video'))
    
    // Show like buttons after 10 seconds in dating mode
    if (chatMode === 'dating') {
      setTimeout(() => {
        setShowLikeButtons(true)
      }, 10000)
    }
    
    // Show timer for speed mode
    if (mode === 'speed') {
      setIsTimerVisible(true)
      // Set 3-minute timer (180 seconds)
      setCurrentTime(180)
    }
    
    // Connect to socket server
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3003'
    console.log('Connecting to socket server at:', socketUrl)
    
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    })
    
    newSocket.on('connect', () => {
      console.log('Socket connected to server')
      setError(null)
      
      // Join room
      newSocket.emit('join-room', { roomId, bio, interests })
    })
    
    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err)
      setError('Failed to connect to server')
    })
    
    newSocket.on('room-joined', ({ peerId, peerProfile }) => {
      console.log('Room joined with peer:', peerId)
      setPeerId(peerId)
      
      // If peer has a profile, display it
      if (peerProfile) {
        setPeerBio(peerProfile.bio || '')
        setPeerInterests(peerProfile.interests || [])
      }
      
      // Start timer for speed dating
      if (mode === 'speed' && timerRef.current === null) {
        timerRef.current = setInterval(() => {
          setCurrentTime((prev) => {
            if (prev <= 1) {
              // Time's up, find next match
              clearInterval(timerRef.current as NodeJS.Timeout)
              handleFindNext()
              return 0
            }
            return prev - 1
          })
        }, 1000)
      }
    })
    
    newSocket.on('peer-like', () => {
      console.log('Peer liked you!')
      setPeerLikedMe(true)
      
      // Check if it's a match
      if (liked === true) {
        setMatchStatus('matched')
      }
    })
    
    newSocket.on('peer-left', () => {
      console.log('Peer left the room')
      setPeerId(null)
      
      // Reset states
      setMatchStatus('none')
      setLiked(null)
      setPeerLikedMe(null)
      setPeerBio('')
      setPeerInterests([])
      
      if (!foundMatch.current) {
        // If auto-reconnecting, go back to match page to find a new match
        window.location.href = `/match?mode=${mode}&blind=${blindDate}&chatMode=${chatMode}`
      }
    })
    
    setSocket(newSocket)
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      newSocket.close()
    }
  }, [roomId, mode, blindDate, chatMode, bio, interests, liked])
  
  // Handle like/dislike
  const handleLike = () => {
    if (socket && peerId) {
      socket.emit('like-peer', { roomId, peerId })
      setLiked(true)
      setMatchStatus(peerLikedMe ? 'matched' : 'liked')
    }
  }
  
  const handleDislike = () => {
    if (socket && peerId) {
      setLiked(false)
      handleFindNext()
    }
  }
  
  // Find next match
  const handleFindNext = () => {
    foundMatch.current = true
    
    // Reset timer if it exists
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    
    // Navigate back to match page with same parameters
    window.location.href = `/match?mode=${mode}&blind=${blindDate}&chatMode=${chatMode}`
  }
  
  // Toggle profiles display
  const toggleProfiles = () => {
    setShowProfiles(!showProfiles)
  }
  
  return (
    <MainLayout>
      <div className="flex flex-col h-full relative">
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded text-center mb-4">
            {error}
          </div>
        )}
        
        {isTimerVisible && currentTime > 0 && (
          <div className="absolute top-2 right-2 z-20">
            <Timer seconds={currentTime} />
          </div>
        )}
        
        {/* Match indicator */}
        {matchStatus === 'matched' && (
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-20 bg-pink-500 text-white px-4 py-2 rounded-full animate-pulse shadow-lg">
            It's a match! 💕
          </div>
        )}
        
        {/* Video or Text Chat container */}
        <div className="flex-grow flex flex-col md:flex-row gap-4">
          {/* Main chat area */}
          <div className={`flex-grow ${showProfiles && chatMode === 'dating' ? 'md:w-2/3' : 'w-full'}`}>
            {type === 'video' ? (
              <VideoCall
                roomId={roomId}
                isMuted={isMuted}
                setIsMuted={setIsMuted}
                isVideoOff={isVideoOff}
                setIsVideoOff={setIsVideoOff}
                blindDate={blindDate}
                peerId={peerId}
              />
            ) : (
              <TextChat roomId={roomId} peerId={peerId} />
            )}
          </div>
          
          {/* Profile sidebar - only for dating mode */}
          {chatMode === 'dating' && showProfiles && (
            <div className="md:w-1/3 p-4 bg-white rounded-lg shadow-md">
              {peerId ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold border-b pb-2 mb-2">Your Profile</h3>
                    <ProfileCard bio={bio} interests={interests} />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold border-b pb-2 mb-2">Their Profile</h3>
                    <ProfileCard bio={peerBio} interests={peerInterests} />
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-10">
                  Waiting for someone to join...
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Bottom controls */}
        <div className="mt-4 flex flex-wrap gap-3 justify-between items-center">
          {/* Dating controls - Like/Dislike/Profile toggle */}
          {chatMode === 'dating' && (
            <div className="flex gap-3">
              {showLikeButtons && peerId && (
                <>
                  <button
                    onClick={handleDislike}
                    disabled={liked === false}
                    className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    Pass
                  </button>
                  <button
                    onClick={handleLike}
                    disabled={liked === true}
                    className={`${
                      matchStatus === 'matched'
                        ? 'bg-pink-500 text-white'
                        : 'bg-green-100 hover:bg-green-200 text-green-700'
                    } px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50`}
                  >
                    {matchStatus === 'matched' ? 'Matched! 💕' : 'Like'}
                  </button>
                </>
              )}
              <button
                onClick={toggleProfiles}
                className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {showProfiles ? 'Hide Profiles' : 'Show Profiles'}
              </button>
            </div>
          )}
          
          {/* Find next match button */}
          <button
            onClick={handleFindNext}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors ml-auto"
          >
            Find Next Match
          </button>
        </div>
      </div>
    </MainLayout>
  )
} 