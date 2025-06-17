'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { usePeerConnection } from '@/hooks/usePeerConnection'
import ChatMenu from '@/components/ChatMenu'
import ReportModal from '@/components/ReportModal'
import Tutorial from '@/components/Tutorial'
import { useReporting } from '@/hooks/useReporting'
import Logo from '@/components/Logo'
import { connectionManager } from '@/lib/connectionManager'
import dynamic from 'next/dynamic'

// Define props interface for PictureInPicture
interface PictureInPictureProps {
  pipRef: React.RefObject<HTMLDivElement | null>;
  localVideoRef: React.RefObject<HTMLVideoElement | null>;
  pipPosition: { x: number; y: number };
  isDragging: boolean;
  areControlsVisible: boolean;
  isMuted: boolean;
  isCameraOff: boolean;
  isDarkTheme: boolean;
  handleMouseDown: (e: React.MouseEvent) => void;
  toggleLocalMute: () => void;
  toggleLocalCamera: () => void;
}

// Dynamically import PictureInPicture with no SSR
const PictureInPicture = dynamic(() => Promise.resolve((props: PictureInPictureProps) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div
      ref={props.pipRef}
      style={{
        position: 'absolute',
        top: props.pipPosition.y,
        left: props.pipPosition.x,
        cursor: props.isDragging ? 'grabbing' : 'grab',
        touchAction: 'none',
      }}
      onMouseDown={props.handleMouseDown}
      className={`w-64 sm:w-80 aspect-video ${
        props.isDarkTheme ? 'bg-black/40' : 'bg-gray-900/40'
      } backdrop-blur-md rounded-xl sm:rounded-2xl overflow-hidden shadow-xl transition-all duration-300 ${
        props.isDragging ? 'scale-105' : ''
      } ${props.areControlsVisible ? 'opacity-100' : 'opacity-80'} border ${
        props.isDarkTheme ? 'border-white/20' : 'border-gray-300/30'
      }`}
    >
      <div className="absolute inset-0 group">
        <div 
          className={`absolute inset-x-0 top-0 h-6 bg-gradient-to-b ${
            props.isDarkTheme ? 'from-black/40' : 'from-gray-900/30'
          } to-transparent opacity-0 group-hover:opacity-100 transition-opacity cursor-grab`}
          onMouseDown={props.handleMouseDown}
        />
        <video
          ref={props.localVideoRef}
          autoPlay
          playsInline
          muted={true} // Explicitly ensure muted for autoplay
          className="w-full h-full object-cover rounded-xl sm:rounded-2xl"
          onLoadedMetadata={() => {
            console.log('📱 Local video metadata loaded in PiP:', {
              videoWidth: props.localVideoRef.current?.videoWidth,
              videoHeight: props.localVideoRef.current?.videoHeight,
              hasStream: !!props.localVideoRef.current?.srcObject
            })
            // Force play after metadata loads
            if (props.localVideoRef.current) {
              props.localVideoRef.current.play().catch(e => 
                console.log('Local video autoplay blocked:', e.name)
              )
            }
          }}
          onCanPlay={() => {
            console.log('📱 Local video can play in PiP')
            // Ensure it actually starts playing
            if (props.localVideoRef.current) {
              props.localVideoRef.current.play().catch(e => 
                console.log('Local video play error:', e.name)
              )
            }
          }}
          onPlay={() => {
            console.log('📱 Local video playing in PiP')
          }}
          onError={(e) => {
            console.error('📱 Local video error:', e)
          }}
        />
        {/* Local Video Controls - Mobile Responsive */}
        <div className={`absolute bottom-2 sm:bottom-3 left-1/2 transform -translate-x-1/2 flex gap-2 sm:gap-3 transition-opacity duration-300 ${
          props.areControlsVisible ? 'opacity-100' : 'opacity-0'
        }`}>
          <button
            onClick={props.toggleLocalMute}
            className={`w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${
              props.isMuted 
                ? 'bg-red-500/80' 
                : props.isDarkTheme ? 'bg-black/40 text-white/90' : 'bg-white/40 text-black/90'
            } ${
              props.isDarkTheme ? 'hover:bg-black/60' : 'hover:bg-white/60'
            } transition-all duration-300 backdrop-blur-md border ${
              props.isDarkTheme ? 'border-white/10' : 'border-black/10'
            } shadow-lg hover:scale-110`}
          >
            <svg className="w-4 h-4 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="currentColor">
              {props.isMuted ? (
                <path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z"/>
              ) : (
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
              )}
            </svg>
          </button>
          <button
            onClick={props.toggleLocalCamera}
            className={`w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${
              props.isCameraOff 
                ? 'bg-red-500/80' 
                : props.isDarkTheme ? 'bg-black/40 text-white/90' : 'bg-white/40 text-black/90'
            } ${
              props.isDarkTheme ? 'hover:bg-black/60' : 'hover:bg-white/60'
            } transition-all duration-300 backdrop-blur-md border ${
              props.isDarkTheme ? 'border-white/10' : 'border-black/10'
            } shadow-lg hover:scale-110`}
          >
            <svg className="w-4 h-4 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="currentColor">
              {props.isCameraOff ? (
                <path d="M21 6.5l-4 4V7c0-.55-.45-1-1-1H9.82L21 17.18V6.5zM3.27 2L2 3.27 4.73 6H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.21 0 .39-.08.54-.18L19.73 21 21 19.73 3.27 2zM15 11.73L8.27 5H15v6.73z"/>
              ) : (
                <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
              )}
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}), { ssr: false })

export default function VideoChatPage() {
  // ✅ ALL useState hooks MUST be declared at the top, before any conditional logic
  const [isClient, setIsClient] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isSocketConnected, setIsSocketConnected] = useState(false)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [currentPeer, setCurrentPeer] = useState<string | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isCameraOff, setIsCameraOff] = useState(false)
  const [isRemoteMuted, setIsRemoteMuted] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [buttonCooldown, setButtonCooldown] = useState(false)
  const [permissionStatus, setPermissionStatus] = useState<{
    camera: 'granted' | 'denied' | 'pending';
    microphone: 'granted' | 'denied' | 'pending';
  }>({
    camera: 'pending',
    microphone: 'pending'
  })
  const [isPeerConnected, setIsPeerConnected] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null)
  const [pipPosition, setPipPosition] = useState({ x: 0, y: 140 })
  const [isDragging, setIsDragging] = useState(false)
  const [startDragPosition, setStartDragPosition] = useState({ x: 0, y: 0 })
  const [areControlsVisible, setAreControlsVisible] = useState(true)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('meetopia-theme')
      return savedTheme === 'dark'
    }
    return false
  })
  const [messages, setMessages] = useState<Array<{
    id: string;
    text: string;
    sender: 'me' | 'peer';
    timestamp: number;
  }>>([])
  const [newMessage, setNewMessage] = useState('')
  const [isChatOpen, setIsChatOpen] = useState(true)
  const [isChatUserToggled, setIsChatUserToggled] = useState(false)
  const [isTutorialOpen, setIsTutorialOpen] = useState(false)
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false)
  const [hasUserInteracted, setHasUserInteracted] = useState(false)
  const [hasGrantedAudioPermission, setHasGrantedAudioPermission] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [previousPeers, setPreviousPeers] = useState<Set<string>>(new Set())
  
  // CRITICAL FIX: Add ref to track current active peer connection
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)

  // Remote stream state indicators
  const [isRemoteCameraOff, setIsRemoteCameraOff] = useState(false)
  const [isRemoteAudioOff, setIsRemoteAudioOff] = useState(false)

  // Connection state and quality monitoring
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor' | 'connecting'>('connecting')
  const [peerConnectionStatus, setPeerConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected')
  const [shouldShowConnected, setShouldShowConnected] = useState(false)
  const [connectionStats, setConnectionStats] = useState({
    bytesReceived: 0,
    bytesSent: 0,
    packetsLost: 0,
    rtt: 0
  })

  // Refs
  const pipRef = useRef<HTMLDivElement>(null)
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const currentPeerRef = useRef<string | null>(null)
  const queuedCandidatesRef = useRef<RTCIceCandidate[]>([])

  // Peer connection hook
  const { peerConnection, createFreshConnection, connectionMetrics, isConnecting, isStable, cleanupConnection } = usePeerConnection(stream)
  const {
    isReportModalOpen,
    handleReport,
    openReportModal,
    closeReportModal
  } = useReporting()
  
  // Sync peerConnection state with ref
  useEffect(() => {
    peerConnectionRef.current = peerConnection
  }, [peerConnection])

  // ✅ Now we can safely do conditional rendering after all hooks are declared
  useEffect(() => {
    setIsClient(true)
    setIsMounted(true)
    
    // Mobile detection
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // ✅ ALL useEffect hooks MUST be declared before early return
  // Check if user has seen tutorial before
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const seen = localStorage.getItem('meetopia-tutorial-seen')
      setHasSeenTutorial(!!seen)
      
      // Check if user has previously granted audio permission
      const audioPermissionGranted = localStorage.getItem('meetopia-audio-permission-granted')
      setHasGrantedAudioPermission(!!audioPermissionGranted)
      
      // Auto-show tutorial for first-time users after a short delay
      if (!seen) {
        setTimeout(() => {
          setIsTutorialOpen(true)
        }, 1000)
      }
    }
  }, [])
  
  // Add useEffect to set initial position after mount - Mobile responsive
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 640 // sm breakpoint
      const pipWidth = isMobile ? 256 : 320 // w-64 vs w-80
      setPipPosition({ 
        x: window.innerWidth - pipWidth - (isMobile ? 8 : 16), // smaller margin on mobile
        y: isMobile ? 100 : 140 
      })
    }
  }, [])

  // Update PiP position on window resize
  useEffect(() => {
    const handleResize = () => {
      if (!isDragging && pipRef.current) {
        const maxX = window.innerWidth - pipRef.current.offsetWidth
        setPipPosition(prev => ({
          x: Math.min(prev.x, maxX),
          y: prev.y
        }))
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isDragging])

  // Handle tutorial completion
  const handleTutorialClose = () => {
    setIsTutorialOpen(false)
    if (typeof window !== 'undefined') {
      localStorage.setItem('meetopia-tutorial-seen', 'true')
      setHasSeenTutorial(true)
    }
  }

  // Menu navigation
  const handleNavigate = (path: string) => {
    window.location.href = path
  }

  // Handle mouse movement and controls visibility
  const handleControlsVisibility = useCallback(() => {
    setAreControlsVisible(true)
    
    // Only auto-show chat if user hasn't manually toggled it off
    if (!isChatUserToggled) {
      setIsChatOpen(true)
    }
    
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    
    // FIXED: Simplified logic - only keep controls visible when actively needed
    const shouldKeepVisible = isMobile || 
                             isSearching || 
                             buttonCooldown
    
    if (!shouldKeepVisible) {
      controlsTimeoutRef.current = setTimeout(() => {
        // Hide controls after 10 seconds of inactivity (as intended)
        // Only exception: don't hide if user is actively using chat
        if (!isChatUserToggled && !isSearching && !buttonCooldown) {
          setAreControlsVisible(false)
          // Also auto-hide chat if user hasn't manually toggled it
          if (!isChatUserToggled) {
            setIsChatOpen(false)
          }
        }
      }, 10000) // Back to 10 seconds as originally intended
    }
  }, [isChatUserToggled, isMobile, isSearching, buttonCooldown])

  // Start cooldown
  const startCooldown = useCallback(() => {
    setButtonCooldown(true)
    setTimeout(() => setButtonCooldown(false), 2000)
  }, [])

  // Start chat with improved search logic and timeout handling
  const handleStartChat = useCallback(() => {
    // Enhanced guards with detailed logging
    if (!socket?.connected || !stream || buttonCooldown || isSearching) {
      console.log('⚠️ Start chat blocked:', { 
        socketConnected: socket?.connected, 
        hasStream: !!stream, 
        isSearching, 
        buttonCooldown,
        alreadyHasPeer: !!currentPeer
      })
      
      // Give user feedback if socket is disconnected
      if (!socket?.connected) {
        setError('Not connected to server. Please wait for reconnection or refresh the page.')
      }
      return
    }
    
    // CRITICAL FIX: Don't clear peer state if we already have an active connection
    if (currentPeer && isPeerConnected && remoteStream) {
      console.log('⚠️ Already connected to peer - ignoring duplicate start chat request')
      return
    }
    
    // ENHANCED: Clear stale connections before new search
    if (currentPeer || peerConnection) {
      console.log('🧹 Cleaning up stale connections before new search')
      
      // Close any existing peer connection
      if (peerConnection && peerConnection.signalingState !== 'closed') {
        console.log('🔒 Closing existing peer connection')
        peerConnection.close()
      }
      
      // Clear queued ICE candidates from previous connections
      queuedCandidatesRef.current = []
      
      // Clear all connection state
      setCurrentPeer(null)
      setRemoteStream(null)
      setIsPeerConnected(false)
      setPeerConnectionStatus('disconnected')
      setShouldShowConnected(false)
      setMessages([])
    }
    
    console.log('🔍 Starting chat search...')
    setIsSearching(true)
    setError(null) // Clear any previous errors
    
    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
      searchTimeoutRef.current = null
    }
    
    // Emit find-match with enhanced acknowledgment handling and avoid previous peers
    socket.emit('find-match', { type: 'video', avoidPeers: Array.from(previousPeers) }, (response: any) => {
      console.log('🔍 Server response received:', response)
      
      if (response && response.status === 'waiting') {
        console.log('✅ Server acknowledged search request - added to waiting list')
        console.log('📊 Waiting position:', response.position)
        console.log('⏱️ Estimated wait time:', response.estimatedWaitTime, 'seconds')
        // Keep searching state active - server confirmed we're in the waiting pool
        
      } else if (response && response.status === 'matched') {
        console.log('✅ Immediate match found')
        console.log('👥 Match data:', response.matchData)
        setIsSearching(false)
        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current)
          searchTimeoutRef.current = null
        }
        
      } else if (response && response.status === 'error') {
        console.error('❌ Server error during search:', response.message)
        setIsSearching(false)
        setError(`Search failed: ${response.message}. Please try again.`)
        
      } else if (!response) {
        console.warn('⚠️ No server response received - socket may be unresponsive')
        // Don't immediately fail, give more time
        
      } else {
        console.log('⚠️ Unexpected server response:', response)
        setIsSearching(false)
        setError('Unexpected server response. Please try again.')
      }
    })
    
    // Enhanced safety timeout with progressive approach
    searchTimeoutRef.current = setTimeout(() => {
      if (isSearching) {
        console.log('🔄 Search timeout reached (20s) - resetting search state')
        setIsSearching(false)
        
        // Provide actionable feedback to user
        if (socket?.connected) {
          console.log('Socket connected but no response - may need retry')
          setError('Search timed out. The server may be busy. Please try again.')
          
          // Test socket responsiveness
          socket.emit('ping', { timestamp: Date.now() }, (pongResponse: any) => {
            if (pongResponse) {
              console.log('✅ Socket responsive - safe to retry search')
            } else {
              console.log('❌ Socket unresponsive - connection may be stale')
              setError('Connection issue detected. Please refresh the page if problem persists.')
            }
          })
        } else {
          console.log('Socket disconnected during search')
          setError('Lost connection to server. Please wait for reconnection.')
        }
      }
      searchTimeoutRef.current = null
    }, 20000) // Increased timeout to 20 seconds for more patience
    
  }, [socket, stream, isSearching, buttonCooldown, currentPeer, isPeerConnected, remoteStream])

  // Handle next person - CRITICAL FIXES for "Keep Exploring" functionality
  const handleNextPerson = useCallback(() => {
    // Enhanced guards with better logging
    if (!socket?.connected || !stream || buttonCooldown || isSearching) {
      console.log('⚠️ Next person blocked:', { 
        socketConnected: socket?.connected, 
        hasStream: !!stream, 
        buttonCooldown,
        isSearching,
        currentPeer: !!currentPeer
      })
      return
    }
    
    console.log('🔄 Looking for next person...')
    
    // CRITICAL: Ensure controls stay visible during transition and after
    setAreControlsVisible(true)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
      controlsTimeoutRef.current = null
    }
    
    // Keep controls visible throughout the entire search process
    const keepControlsVisible = () => {
      setAreControlsVisible(true)
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
        controlsTimeoutRef.current = null
      }
    }
    
    // Immediate visibility
    keepControlsVisible()
    
    // Ensure they stay visible during search
    setTimeout(keepControlsVisible, 100)
    setTimeout(keepControlsVisible, 500)
    setTimeout(keepControlsVisible, 1000)
    
    // ENHANCED: More thorough cleanup before next search
    if (currentPeer || peerConnection) {
      console.log('🧹 Cleaning up current connection before next')
      
      // Notify server we're disconnecting from current peer
      if (socket?.connected && currentPeer) {
        socket.emit('peer-disconnect', { 
          reason: 'partner-searching-new',
          peerId: currentPeer 
        })
      }
      
      // Close all connections thoroughly
      if (peerConnection && peerConnection.signalingState !== 'closed') {
        console.log('🔒 Closing peer connection for next person')
        peerConnection.close()
      }
      
      // Clear queued ICE candidates from previous connection
      queuedCandidatesRef.current = []
      
      // Clear all peer-related state
      setRemoteStream(null)
      setCurrentPeer(null)
      setIsPeerConnected(false)
      setPeerConnectionStatus('disconnected')
      setShouldShowConnected(false)
      setMessages([])
      setError(null)
      
      // Clear connection quality indicators
      setConnectionQuality('connecting')
      setIsRemoteCameraOff(false)
      setIsRemoteAudioOff(false)
    }
    
    // IMPROVED: Better timing and state management
    setTimeout(() => {
      // Double-check state before proceeding
      if (isSearching) {
        console.log('⚠️ Already searching, skipping duplicate next person request')
        return
      }
      
      console.log('🔍 Starting fresh search for next person...')
      setIsSearching(true)
      setError(null)
      
      // CRITICAL: Keep controls visible during search
      setAreControlsVisible(true)
      
      // Clear any existing search timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
        searchTimeoutRef.current = null
      }
      
      // Emit find-match with better error handling and avoid previous peers
      socket.emit('find-match', { type: 'video', avoidPeers: Array.from(previousPeers) }, (response: any) => {
        console.log('🔍 Next person server response:', response)
        
        if (response && response.status === 'waiting') {
          console.log('✅ Added to waiting list for next person')
          console.log('📊 Position:', response.position || 'unknown')
          
        } else if (response && response.status === 'matched') {
          console.log('✅ Immediate next match found')
          setIsSearching(false)
          
        } else if (response && response.status === 'error') {
          console.error('❌ Error finding next person:', response.message)
          setIsSearching(false)
          setError(`Failed to find next person: ${response.message}`)
          
        } else {
          console.warn('⚠️ Unexpected response for next person:', response)
          // Don't immediately fail - server might still be processing
        }
      })
      
      // Set timeout for next person search
      searchTimeoutRef.current = setTimeout(() => {
        if (isSearching) {
          console.log('🔄 Next person search timeout - resetting state')
          setIsSearching(false)
          setError('Search for next person timed out. Please try again.')
        }
        searchTimeoutRef.current = null
      }, 15000)
      
    }, 750) // Longer delay for more thorough cleanup
    
    startCooldown()
  }, [socket, stream, buttonCooldown, currentPeer, peerConnection, startCooldown, isSearching])

  // Handle leave chat
  const handleLeaveChat = useCallback(() => {
    if (!socket?.connected) return
    setIsPeerConnected(false)
    socket.emit('leave-chat')
    setCurrentPeer(null)
    setRemoteStream(null)
    setIsSearching(false)
    window.location.href = '/'
  }, [socket])

  // Setup mouse movement listener and handle chat visibility
  useEffect(() => {
    document.addEventListener('mousemove', handleControlsVisibility)

    return () => {
      document.removeEventListener('mousemove', handleControlsVisibility)
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [handleControlsVisibility])

  // Handle chat input focus
  const handleChatFocus = () => {
    setAreControlsVisible(true)
    setIsChatOpen(true)
    setIsChatUserToggled(false) // Reset user toggle when they focus chat input
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
  }

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Skip shortcut if user is typing in chat
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault()
        console.log('Spacebar pressed - finding next person')
        
        // Show brief visual feedback
        setAreControlsVisible(true)
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current)
        }
        
        if (currentPeer) {
          handleNextPerson()
        } else {
          handleStartChat()
        }
        
        // Keep controls visible
        setAreControlsVisible(true)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentPeer, handleNextPerson, handleStartChat])

  // Handle drag start
  const handleMouseDown = (e: React.MouseEvent) => {
    if (pipRef.current) {
      setIsDragging(true)
      setStartDragPosition({
        x: e.clientX - pipPosition.x,
        y: e.clientY - pipPosition.y
      })
    }
  }

  // Handle drag
  const handlePipDrag = (e: React.MouseEvent) => {
    if (!isDragging) return

    const newX = e.clientX - startDragPosition.x
    const newY = e.clientY - startDragPosition.y

    // Get window dimensions
    const maxX = window.innerWidth - (pipRef.current?.offsetWidth || 0)
    const maxY = window.innerHeight - (pipRef.current?.offsetHeight || 0)

    // Constrain to window bounds
    const x = Math.min(Math.max(0, newX), maxX)
    const y = Math.min(Math.max(0, newY), maxY)

    setPipPosition({ x, y })
  }

  // Handle drag end
  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Add event listeners for drag
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        e.preventDefault()
        handlePipDrag(e as unknown as React.MouseEvent)
      }
    }

    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false)
      }
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove)
      document.addEventListener('mouseup', handleGlobalMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [isDragging])

  // Setup media with better permission handling and user experience
  useEffect(() => {
    let currentStream: MediaStream | null = null

    async function setupMedia() {
      try {
        // Check current permission status first
        try {
          const permissionCamera = await navigator.permissions.query({ name: 'camera' as PermissionName });
          const permissionMicrophone = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          
          console.log('Current permissions:', {
            camera: permissionCamera.state,
            microphone: permissionMicrophone.state
          });
          
          // Update permission status
          setPermissionStatus({
            camera: permissionCamera.state as any,
            microphone: permissionMicrophone.state as any
          });
          
          // If permissions are denied, show helpful error
          if (permissionCamera.state === 'denied' || permissionMicrophone.state === 'denied') {
            setError('Camera or microphone access is blocked. Please click the camera icon in your browser address bar to allow access.');
            return;
          }
        } catch (permissionError) {
          console.log('Permission API not supported, proceeding with getUserMedia');
        }

        // Start with optimized quality for better connection
        console.log('Starting with basic quality for faster connection...')
        
        const basicStream = await navigator.mediaDevices.getUserMedia({
          video: { 
            width: { ideal: 640, max: 1280 }, 
            height: { ideal: 480, max: 720 }, 
            frameRate: { ideal: 15, max: 30 },
            facingMode: 'user'
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        })
        
        currentStream = basicStream
        setStream(basicStream)
        
        // Debug: Check local stream tracks
        console.log('📹 Local stream created:', {
          id: basicStream.id,
          active: basicStream.active,
          videoTracks: basicStream.getVideoTracks().map(t => ({
            id: t.id,
            kind: t.kind,
            enabled: t.enabled,
            muted: t.muted,
            readyState: t.readyState,
            label: t.label,
            settings: t.getSettings?.() || 'N/A'
          })),
          audioTracks: basicStream.getAudioTracks().map(t => ({
            id: t.id,
            kind: t.kind,
            enabled: t.enabled,
            muted: t.muted,
            readyState: t.readyState,
            label: t.label
          }))
        })
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = basicStream
          console.log('📱 Local video element updated with stream')
          
          // CRITICAL: Ensure local video plays (should work since it's muted)
          localVideoRef.current.play().then(() => {
            console.log('✅ Local video playing successfully')
          }).catch(err => {
            console.warn('⚠️ Local video autoplay failed:', err.name)
            // This shouldn't happen since local video is muted, but let's handle it
            if (localVideoRef.current) {
              localVideoRef.current.muted = true // Ensure it's muted
              localVideoRef.current.play().catch(retryErr => {
                console.error('❌ Local video play failed even when muted:', retryErr)
              })
            }
          })
        }
        
        setPermissionStatus({
          camera: 'granted',
          microphone: 'granted'
        })
        
        console.log('✅ Camera stream successful - no upgrades to prevent OverconstrainedError')
        
        // Monitor track states for better debugging
        basicStream.getTracks().forEach(track => {
          track.addEventListener('ended', () => {
            console.log(`❌ Local ${track.kind} track ended:`, track.id)
            if (track.kind === 'video') {
              setError('Camera disconnected. Please refresh to reconnect.');
            }
          })
          track.addEventListener('mute', () => {
            console.log(`🔇 Local ${track.kind} track muted:`, track.id)
          })
          track.addEventListener('unmute', () => {
            console.log(`🔊 Local ${track.kind} track unmuted:`, track.id)
          })
        })
        
      } catch (err: any) {
        console.error('Error accessing media devices:', err)
        
        if (err.name === 'NotAllowedError') {
          setPermissionStatus({
            camera: 'denied',
            microphone: 'denied'
          })
          setError('Camera and microphone access denied. Please click the camera icon in your browser address bar and allow access, then refresh the page.')
        } else if (err.name === 'NotFoundError') {
          setError('No camera or microphone found. Please connect a camera and microphone.')
        } else if (err.name === 'OverconstrainedError') {
          setError('Camera constraints not supported. Trying with basic settings...')
          // Retry with minimal constraints
          try {
            const fallbackStream = await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: true
            })
            currentStream = fallbackStream
            setStream(fallbackStream)
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = fallbackStream
            }
            setPermissionStatus({
              camera: 'granted',
              microphone: 'granted'
            })
            setError(null)
          } catch (fallbackErr: any) {
            setError(`Fallback failed: ${fallbackErr.message}`)
          }
        } else {
          setError(`Media access error: ${err.message}. Please refresh and try again.`)
        }
      }
    }

    setupMedia()

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop())
        currentStream = null
      }
    }
  }, [])

  // Socket setup with better error handling
  useEffect(() => {
    // Only attempt socket connection in client environment
    if (!isClient) return;

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3003'
    console.log('Connecting to socket server:', socketUrl)
    
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'], // Fallback to polling if websocket fails
      reconnectionAttempts: 15, // Increased from 10
      reconnectionDelay: 1000,
      reconnectionDelayMax: 3000, // Faster reconnection
      timeout: 20000, // Increased timeout
      forceNew: false,
      upgrade: true,
      rememberUpgrade: false,
      // Enhanced connection stability
      autoConnect: true,
      randomizationFactor: 0.5,
      multiplex: false // Prevent multiplexing issues
    })

    setSocket(newSocket)

    newSocket.on('connect', () => {
      console.log('Socket connected successfully')
      console.log('✅ Socket ID:', newSocket.id)
      console.log('✅ Socket transport:', newSocket.io.engine.transport.name)
      console.log('✅ Socket URL:', socketUrl)
      setIsSocketConnected(true)
      setError(null)
      
      // Enhanced heartbeat with shorter intervals
      const heartbeat = setInterval(() => {
        if (newSocket.connected) {
          newSocket.emit('ping', { timestamp: Date.now() })
        } else {
          clearInterval(heartbeat)
        }
      }, 15000) // Ping every 15 seconds instead of 30
      
      // Clear heartbeat on disconnect
      newSocket.on('disconnect', () => {
        clearInterval(heartbeat)
      })
    })

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err)
      console.error('Socket URL attempted:', socketUrl)
      console.error('Error details:', {
        message: err.message,
        name: err.name,
        stack: err.stack
      })
      setIsSocketConnected(false)
      setError('Unable to connect to chat server. Please check your internet connection.')
    })

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason)
      setIsSocketConnected(false)
      
      // **CRITICAL**: Don't break WebRTC on temporary socket disconnects
      if (reason === 'transport close' || reason === 'ping timeout' || reason === 'transport error') {
        console.log('🔄 Temporary socket disconnect - maintaining WebRTC connection')
        setError('Connection interrupted. Attempting to reconnect...')
        
        // Keep currentPeer and remoteStream for reconnection
        // Don't clear the peer connection or streams
        
      } else if (reason === 'io server disconnect') {
        console.log('❌ Server disconnected - clearing connections')
        setCurrentPeer(null)
        setRemoteStream(null)
        setIsSearching(false)
        setError('Disconnected from server. Please refresh the page.')
        
      } else {
        console.log('🔄 Other disconnect reason - attempting reconnection')
        setError('Connection lost. Attempting to reconnect...')
        // Keep connections for other types of disconnects too
      }
    })

    newSocket.on('reconnect', (attemptNumber) => {
      console.log('✅ Socket reconnected after', attemptNumber, 'attempts')
      setIsSocketConnected(true)
      setError(null)
      
      // **CRITICAL**: Restore active peer connection after reconnection
      if (currentPeer && !newSocket.recovered) {
        console.log('🔄 Restoring peer connection after socket reconnect')
        // Re-establish the active connection mapping on the server
        newSocket.emit('restore-connection', { peerId: currentPeer })
      }
    })

    newSocket.on('reconnect_error', (err) => {
      console.error('Socket reconnection failed:', err)
      setError('Failed to reconnect. Please refresh the page.')
    })

    newSocket.on('reconnect_failed', () => {
      console.error('Socket reconnection failed completely')
      setError('Unable to reconnect. Please refresh the page.')
    })

    // Handle page visibility changes to maintain connections
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('Page hidden - maintaining connection')
        // Safari-specific: Keep connection alive when tab becomes inactive
        if (navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome')) {
          if (peerConnection && currentPeer) {
            console.log('Safari: Sending keep-alive during tab switch')
            const keepAlive = setInterval(() => {
              if (!document.hidden) {
                clearInterval(keepAlive)
                return
              }
              if (newSocket && newSocket.connected) {
                newSocket.emit('ping')
              }
            }, 5000) // Ping every 5 seconds while hidden
          }
        }
      } else {
        console.log('Page visible - checking connection')
        if (!newSocket.connected) {
          // Add throttling to prevent reconnection spam
          const lastReconnectAttempt = sessionStorage.getItem('lastReconnectAttempt')
          const now = Date.now()
          
          // Only attempt reconnection once every 5 seconds
          if (!lastReconnectAttempt || (now - parseInt(lastReconnectAttempt)) > 5000) {
            console.log('Reconnecting after page became visible')
            sessionStorage.setItem('lastReconnectAttempt', now.toString())
            newSocket.connect()
          } else {
            console.log('Reconnection throttled - too soon since last attempt')
          }
        }
        // Safari-specific: Re-establish peer connection if needed
        if (navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome')) {
          if (currentPeer && !isPeerConnected && peerConnection) {
            console.log('Safari: Attempting to restore peer connection after tab became visible')
            setTimeout(() => {
              if (peerConnection && peerConnection.iceConnectionState === 'disconnected') {
                if (peerConnection.restartIce) {
                  peerConnection.restartIce()
                }
              }
            }, 1000)
          }
        }
      }
    }

    // Handle page beforeunload to prevent accidental disconnections
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (currentPeer && isPeerConnected) {
        e.preventDefault()
        e.returnValue = 'You are currently in a video chat. Are you sure you want to leave?'
        return e.returnValue
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleBeforeUnload)

    // Handle WebRTC signaling
    newSocket.on('offer', async (offer) => {
      if (!peerConnection) {
        console.warn('Received offer but no peer connection available')
        return
      }

      try {
        console.log('📞 Received WebRTC offer from peer')
        await peerConnection.setRemoteDescription(offer)
        
        const answer = await peerConnection.createAnswer()
        await peerConnection.setLocalDescription(answer)
        
        newSocket.emit('answer', answer)
        console.log('✅ Sent WebRTC answer to peer')
      } catch (error) {
        console.error('❌ Error handling WebRTC offer:', error)
        setError('Failed to establish video connection')
      }
    })

    newSocket.on('answer', async (answer) => {
      if (!peerConnection) {
        console.warn('Received answer but no peer connection available - attempting to create one')
        const freshConnection = createFreshConnection()
        if (!freshConnection) {
          console.error('Failed to create peer connection for answer')
          return
        }
        // Use the fresh connection for this answer
        try {
          console.log('✅ Received WebRTC answer from peer (using fresh connection)')
          await freshConnection.setRemoteDescription(answer)
        } catch (error) {
          console.error('❌ Error handling WebRTC answer with fresh connection:', error)
          setError('Failed to establish video connection')
        }
        return
      }

      try {
        console.log('✅ Received WebRTC answer from peer')
        await peerConnection.setRemoteDescription(answer)
      } catch (error) {
        console.error('❌ Error handling WebRTC answer:', error)
        setError('Failed to establish video connection')
      }
    })

    newSocket.on('ice-candidate', async (candidate) => {
      if (!peerConnection) {
        console.warn('Received ICE candidate but no peer connection available - queuing for later')
        // Store candidate for when connection is ready
        queuedCandidatesRef.current.push(candidate)
        return
      }

      try {
        await peerConnection.addIceCandidate(candidate)
        console.log('✅ ICE candidate added successfully')
      } catch (error) {
        console.error('❌ Error adding ICE candidate:', error)
        // Don't set error for ICE candidate failures as they're common
      }
    })

    // **NEW**: Handle connection restoration events
    newSocket.on('connection-restored', (data) => {
      console.log('✅ Peer connection restored after socket reconnect', data)
      setError(null)
      
      // Ensure we still have the peer ID
      if (data.peerId && !currentPeer) {
        setCurrentPeer(data.peerId)
      }
    })

    newSocket.on('peer-disconnected', (data) => {
      console.log('❌ Peer disconnected:', data.reason)
      
      if (data.reason === 'peer-not-found' || data.reason === 'connection-lost') {
        console.log('🔄 Peer connection lost during socket reconnect - clearing state')
        setCurrentPeer(null)
        setRemoteStream(null)
        setIsSearching(false)
        setError('Your partner has disconnected. Click "Keep Exploring!" to start again.')
      } else if (data.canReconnect) {
        console.log('🔄 Peer temporarily disconnected - waiting for reconnection')
        setError('Your partner is reconnecting...')
      } else {
        console.log('👋 Peer disconnected normally')
        setCurrentPeer(null)
        setRemoteStream(null)
        setIsSearching(false)
        setError('Your partner has disconnected. Click "Keep Exploring!" to start again.')
      }
    })

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      if (newSocket) {
        newSocket.disconnect()
      }
    }
  }, [isClient]) // ONLY depend on isClient!

  // Socket connection and socket.io event handlers
  useEffect(() => {
    if (!socket || !stream) return

    // Remove any existing listeners first to prevent duplicates
    socket.off('answer')
    socket.off('ice-candidate') 
    socket.off('offer')
    socket.off('userFound')
    socket.off('waiting')
    socket.off('matched')
    socket.off('match-found')
    socket.off('peer-left')

    // Set up clean event handlers
    socket.on('answer', async (answer) => {
      if (!peerConnection) {
        console.error('Received answer but no peer connection available')
        return
      }

      if (peerConnection.signalingState !== 'have-local-offer') {
        console.warn('Received answer but peer connection not in correct state:', peerConnection.signalingState)
        return
      }

      try {
        console.log('✅ Received WebRTC answer from peer')
        await peerConnection.setRemoteDescription(answer)
        console.log('✅ Remote description set successfully')
      } catch (error) {
        console.error('❌ Error handling WebRTC answer:', error)
        setError('Failed to establish video connection')
      }
    })

    socket.on('ice-candidate', async (candidate) => {
      // CRITICAL FIX: Use ref to get current active peer connection instead of stale state
      const currentPeerConnection = peerConnectionRef.current
      
      if (!currentPeerConnection || currentPeerConnection.signalingState === 'closed') {
        console.warn('Received ICE candidate but no active peer connection available - queuing for later')
        queuedCandidatesRef.current.push(candidate)
        return
      }

      if (!currentPeerConnection.remoteDescription) {
        console.warn('Received ICE candidate but remote description not set - queuing for later')
        queuedCandidatesRef.current.push(candidate)
        return
      }

      try {
        await currentPeerConnection.addIceCandidate(candidate)
        console.log('✅ ICE candidate added successfully')
      } catch (error) {
        console.error('❌ Error adding ICE candidate:', error)
      }
    })

    socket.on('offer', async (offer) => {
      // CRITICAL FIX: Use ref to get current active peer connection instead of stale state
      let currentPeerConnection = peerConnectionRef.current
      
      if (!currentPeerConnection || currentPeerConnection.signalingState === 'closed') {
        console.log('⚠️ Received offer but no active peer connection available - creating fresh connection')
        // Create a fresh connection to handle the incoming offer
        const freshConnection = createFreshConnection()
        if (!freshConnection) {
          console.error('❌ Failed to create fresh peer connection for offer')
          return
        }
        // Update the ref to point to the new connection
        peerConnectionRef.current = freshConnection
        currentPeerConnection = freshConnection
      }

      try {
        console.log('✅ Processing WebRTC offer from peer')
        await currentPeerConnection.setRemoteDescription(offer)
        const answer = await currentPeerConnection.createAnswer()
        await currentPeerConnection.setLocalDescription(answer)
        socket.emit('answer', answer, currentPeerRef.current)
        console.log('✅ Sent WebRTC answer to peer')
      } catch (error) {
        console.error('❌ Error handling WebRTC offer:', error)
        setError('Failed to establish video connection')
      }
    })

    // Enhanced match-found event handler with simplified connection logic
    socket.on('match-found', async (data: any) => {
      console.log('🎉 Match found via match-found event! Data:', data)
      
      // Check if we've already matched with this peer before
      if (previousPeers.has(data.peerId)) {
        console.log('🔄 Already matched with this peer before, requesting new match...')
        // Request a new match instead of connecting to same person
        socket.emit('find-match', { type: 'video', avoidPeers: Array.from(previousPeers) })
        return
      }
      
      // Add this peer to our previous peers list
      setPreviousPeers(prev => new Set(Array.from(prev).concat(data.peerId)))
      
      // 🚀 SIMPLIFIED: Direct connection approach for better stability
      console.log('🔄 Starting direct connection to new peer...')
      
      // Graceful cleanup of old connection if exists
      if (currentPeerRef.current && currentPeerRef.current !== data.peerId) {
        console.log('🧹 Cleaning up old peer connection:', currentPeerRef.current)
        
        // Clean up old peer connection with delay to prevent race conditions
        if (peerConnectionRef.current) {
          try {
            peerConnectionRef.current.close()
            peerConnectionRef.current = null
            // Small delay to ensure cleanup completes
            await new Promise(resolve => setTimeout(resolve, 500))
          } catch (error) {
            console.warn('Error cleaning up old connection:', error)
          }
        }
      }
      
      // Update state immediately
      currentPeerRef.current = data.peerId
      setCurrentPeer(data.peerId)
      setIsSearching(false)
      
      // Clear search timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
        searchTimeoutRef.current = null
      }
      
      // Create fresh peer connection for new match
        console.log('🔄 Creating fresh peer connection for new match')
        const freshConnection = createFreshConnection()
        if (freshConnection) {
          peerConnectionRef.current = freshConnection
        
        // Enhanced connection monitoring with longer timeouts
        freshConnection.oniceconnectionstatechange = () => {
          const state = freshConnection.iceConnectionState
          console.log(`🧊 ICE state for ${data.peerId}:`, state)
          
          if (state === 'disconnected') {
            console.log('🔄 ICE disconnected - giving more time for recovery')
                         // Don't immediately fail - give 10 seconds for natural recovery
             const disconnectTimeout = setTimeout(() => {
               if (freshConnection.iceConnectionState === 'disconnected') {
                 console.log('⚠️ Still disconnected after 10s - attempting ICE restart')
                 if (freshConnection.restartIce) {
                   freshConnection.restartIce()
                 }
               }
             }, 10000) as unknown as ReturnType<typeof setTimeout> // Increased timeout for better stability
          } else if (state === 'failed') {
            console.log('❌ ICE failed - will search for new peer after delay')
                         // Don't immediately search - give time for recovery
             const failedTimeout = setTimeout(() => {
               if (freshConnection.iceConnectionState === 'failed') {
                 console.log('🔍 ICE still failed - searching for new connection')
                 currentPeerRef.current = null
                 setCurrentPeer(null)
                 setRemoteStream(null)
                 setIsPeerConnected(false)
                 if (!isSearching && socket?.connected) {
                   handleStartChat()
                 }
               }
             }, 8000) as unknown as ReturnType<typeof setTimeout>
          }
        }
        
        // Enhanced connection state monitoring
        freshConnection.onconnectionstatechange = () => {
          const state = freshConnection.connectionState
          console.log(`🔗 Connection state for ${data.peerId}:`, state)
          
          if (state === 'connected') {
            console.log('✅ Peer connection established successfully!')
            setIsPeerConnected(true)
            setPeerConnectionStatus('connected')
            setShouldShowConnected(true)
            setConnectionQuality('excellent')
          } else if (state === 'failed') {
            console.log('❌ Peer connection failed - will retry after delay')
            setIsPeerConnected(false)
                         // Don't immediately retry - give time for recovery
             const retryTimeout = setTimeout(() => {
               if (freshConnection.connectionState === 'failed') {
                 console.log('🔄 Connection still failed - searching for new peer')
                 currentPeerRef.current = null
                 setCurrentPeer(null)
                 setRemoteStream(null)
                 if (!isSearching && socket?.connected) {
                   handleStartChat()
                 }
               }
             }, 5000) as unknown as ReturnType<typeof setTimeout>
          }
        }
      } else {
        console.error('❌ Failed to create fresh connection')
        setError('Failed to create connection. Please try again.')
        return
      }
      
      // Clear any error messages 
      setError(null)
      setShouldShowConnected(false)
      
      // Make sure controls are visible when matched
      setAreControlsVisible(true)
      
      // CRITICAL: If we have a higher socket ID, we initiate the call
      if (socket && socket.id && data.peerId && socket.id > data.peerId) {
        console.log('🎯 We initiate call (higher socket ID)')
        try {
          const currentConnection = peerConnectionRef.current
          if (currentConnection) {
            // Add small delay before creating offer to ensure connection is ready
            await new Promise(resolve => setTimeout(resolve, 200))
            
            const offer = await currentConnection.createOffer({
              offerToReceiveAudio: true,
              offerToReceiveVideo: true
            })
            await currentConnection.setLocalDescription(offer)
            socket.emit('offer', offer, data.peerId)
            console.log('✅ Sent WebRTC offer to matched peer')
          }
        } catch (error) {
          console.error('❌ Error creating offer for match:', error)
          setError('Failed to create connection offer')
        }
      } else {
        console.log('⏳ Waiting for peer to initiate call (lower socket ID)')
      }
      
      console.log('✅ Ready for WebRTC negotiation with peer:', data.peerId)
    })

    // Handle peer leaving
    socket.on('peer-left', (data: any) => {
      console.log('👋 Peer left:', data)
      
      // CRITICAL: Use ref to get current peer ID to avoid stale state
      const currentPeerId = currentPeerRef.current
      
      if (currentPeerId && currentPeerId === data.peerId) {
        console.log('🧹 Cleaning up connection for departed peer')
        
        // Close peer connection
        if (peerConnectionRef.current && peerConnectionRef.current.signalingState !== 'closed') {
          peerConnectionRef.current.close()
        }
        
        // Clear queued ICE candidates
        queuedCandidatesRef.current = []
        
        // Reset all connection state using refs and setters
        currentPeerRef.current = null
        setCurrentPeer(null)
        setRemoteStream(null)
        setIsPeerConnected(false)
        setPeerConnectionStatus('disconnected')
        setShouldShowConnected(false)
        setMessages([])
        setIsSearching(false)
        
        // Clear connection quality indicators
        setConnectionQuality('connecting')
        setIsRemoteCameraOff(false)
        setIsRemoteAudioOff(false)
        
        // Show user-friendly message
        setError('Your partner has disconnected. Click "Keep Exploring!" to find someone new!')
      }
    })

    // **CRITICAL**: Handle waiting state properly
    socket.on('waiting', (data: any) => {
      console.log('⏳ Waiting for match...', data)
      setIsSearching(true)
      setError(null)
      
      // Keep controls visible while waiting
      setAreControlsVisible(true)
    })

    // Handle connection status updates
    socket.on('connection-status', (data: { status: string, hasVideo: boolean, hasAudio: boolean }) => {
      console.log('📡 Connection status update:', data)
      
      if (data.status === 'connected') {
        setIsPeerConnected(true)
        setPeerConnectionStatus('connected')
        setShouldShowConnected(true)
        setConnectionQuality('good')
        
        // Update remote media state
        setIsRemoteCameraOff(!data.hasVideo)
        setIsRemoteAudioOff(!data.hasAudio)
        
        // Clear any error messages
        setError(null)
        
        console.log('✅ Peer connection established successfully')
      } else if (data.status === 'connecting') {
        setPeerConnectionStatus('connecting')
        setConnectionQuality('connecting')
      } else if (data.status === 'disconnected') {
        setIsPeerConnected(false)
        setPeerConnectionStatus('disconnected')
        setConnectionQuality('connecting')
      }
    })

    // Handle server errors
    socket.on('error', (data: { message: string }) => {
      console.error('🚨 Server error:', data.message)
      setError(`Server error: ${data.message}`)
      setIsSearching(false)
    })

    // Cleanup function
    return () => {
      socket.off('answer')
      socket.off('ice-candidate')
      socket.off('offer') 
      socket.off('match-found')
      socket.off('peer-left')
      socket.off('waiting')
      socket.off('connection-status')
      socket.off('error')
    }
  }, [socket, stream, peerConnection, createFreshConnection]) // ONLY essential dependencies

  // Consolidated track handling - Fixed to properly handle remote video display with Safari compatibility
  useEffect(() => {
    if (!peerConnection) return

    // Process any queued ICE candidates when peer connection is ready
    if (queuedCandidatesRef.current.length > 0 && peerConnection.remoteDescription && peerConnection.signalingState !== 'closed') {
      console.log(`📦 Processing ${queuedCandidatesRef.current.length} queued ICE candidates`)
      queuedCandidatesRef.current.forEach(async (candidate) => {
        try {
          // Double-check connection state before adding candidate
          if (peerConnection.signalingState === 'closed') {
            console.log('⚠️ Skipping ICE candidate - connection closed')
            return
          }
          await peerConnection.addIceCandidate(candidate)
          console.log('✅ Queued ICE candidate added successfully')
        } catch (error) {
          console.error('❌ Error adding queued ICE candidate:', error)
        }
      })
      queuedCandidatesRef.current = [] // Clear the queue
    }

    peerConnection.onconnectionstatechange = () => {
      const state = peerConnection.connectionState
      console.log('🔗 Peer connection state changed:', state)
      const isConnected = state === 'connected'
      setIsPeerConnected(isConnected)
      setPeerConnectionStatus(state === 'connected' ? 'connected' : state === 'connecting' ? 'connecting' : 'disconnected')
      
      if (state === 'connected') {
        console.log('✅ Peer connection established')
        setConnectionQuality('excellent')
        setShouldShowConnected(true)
        
        // Notify the peer that we're connected
        if (socket && currentPeerRef.current) {
          socket.emit('connection-status', { 
            peerId: currentPeerRef.current, 
            status: 'connected',
            hasVideo: !isCameraOff,
            hasAudio: !isMuted 
          })
        }
      } else if (state === 'disconnected') {
        console.log('⚠️ Peer connection disconnected - attempting recovery')
        setIsPeerConnected(false)
        setShouldShowConnected(false)
        setConnectionQuality('connecting')
        
        // Notify the peer that we're disconnected
        if (socket && currentPeerRef.current) {
          socket.emit('connection-status', { 
            peerId: currentPeerRef.current, 
            status: 'disconnected' 
          })
        }
        
        // Try ICE restart first
        setTimeout(() => {
          if (peerConnection.connectionState === 'disconnected' && peerConnection.restartIce) {
            console.log('🔄 Attempting ICE restart')
            peerConnection.restartIce()
          }
        }, 2000)
        
      } else if (state === 'failed') {
        console.log('❌ Peer connection failed completely')
        setIsPeerConnected(false)
        setShouldShowConnected(false)
        setPeerConnectionStatus('disconnected')
        setRemoteStream(null)
        
        // Notify the peer that we're disconnected
        if (socket && currentPeerRef.current) {
          socket.emit('connection-status', { 
            peerId: currentPeerRef.current, 
            status: 'disconnected' 
          })
        }
        
        // Clear peer state on failure
        currentPeerRef.current = null
        setCurrentPeer(null)
        setError('Connection failed. Click "Keep Exploring!" to try again.')
      }
    }

    peerConnection.oniceconnectionstatechange = () => {
      console.log('🧊 ICE connection state:', peerConnection.iceConnectionState)
      
      if (peerConnection.iceConnectionState === 'checking') {
        console.log('🔍 ICE checking - trying to establish connection...')
        
      } else if (peerConnection.iceConnectionState === 'connected') {
        console.log('✅ ICE connection established successfully!')
        setIsPeerConnected(true)
        
      } else if (peerConnection.iceConnectionState === 'completed') {
        console.log('🎯 ICE connection completed - optimal path found!')
        setIsPeerConnected(true)
        
      } else if (peerConnection.iceConnectionState === 'disconnected') {
        console.log('🔄 ICE disconnected - waiting for recovery')
        setIsPeerConnected(false)
        // FIXED: Give more time for natural recovery before declaring failure
        setTimeout(() => {
          if (peerConnection && (peerConnection.iceConnectionState === 'disconnected' || 
              peerConnection.iceConnectionState === 'failed')) {
            console.log('⚠️ ICE still disconnected after 8 seconds - attempting restart')
            if (peerConnection.restartIce) {
              peerConnection.restartIce()
            }
          }
        }, 8000) // Increased from 5 to 8 seconds for better stability
        
      } else if (peerConnection.iceConnectionState === 'failed') {
        console.log('❌ ICE connection failed - attempting restart')
        setIsPeerConnected(false)
        
        // FIXED: More aggressive recovery approach
        if (peerConnection.restartIce) {
          console.log('🔄 Attempting ICE restart immediately')
          peerConnection.restartIce()
        }
        
        // If restart fails, wait longer before giving up
        setTimeout(() => {
          if (peerConnection && peerConnection.iceConnectionState === 'failed') {
            console.log('🔄 ICE restart failed - searching for new connection')
            currentPeerRef.current = null
            setCurrentPeer(null)
            setRemoteStream(null)
            setIsPeerConnected(false)
            if (!isSearching && socket?.connected) {
              handleStartChat()
            }
          }
        }, 12000) // Increased timeout for more patience
        
      } else if (peerConnection.iceConnectionState === 'closed') {
        console.log('🚪 ICE connection closed')
        setIsPeerConnected(false)
      }
    }

    peerConnection.ontrack = (event) => {
      console.log('🎵 Received remote track:', event.track.kind)
      console.log('🎵 Track details:', {
        id: event.track.id,
        kind: event.track.kind,
        enabled: event.track.enabled,
        muted: event.track.muted,
        readyState: event.track.readyState,
        label: event.track.label
      })
      
      const [incomingStream] = event.streams
      console.log('🌊 Setting remote stream:', incomingStream)
      console.log('📋 Stream info:', {
        id: incomingStream.id,
        active: incomingStream.active,
        isLocal: incomingStream.id === stream?.id, // Check if this is accidentally our local stream
        videoTracks: incomingStream.getVideoTracks().map(t => ({
          id: t.id,
          kind: t.kind,
          enabled: t.enabled,
          muted: t.muted,
          readyState: t.readyState
        })),
        audioTracks: incomingStream.getAudioTracks().map(t => ({
          id: t.id,
          kind: t.kind,
          enabled: t.enabled,
          muted: t.muted,
          readyState: t.readyState
        }))
      })
      
      // CRITICAL: Only set remote stream if it's NOT our local stream
      if (incomingStream.id !== stream?.id) {
        console.log('✅ Setting REMOTE stream (different from local)')
        setRemoteStream(incomingStream)
        
        // Ensure video element gets the stream immediately with proper play handling
        if (remoteVideoRef.current) {
          console.log('🎬 Immediately updating REMOTE video element with peer stream')
          remoteVideoRef.current.srcObject = incomingStream
          remoteVideoRef.current.style.display = 'block'
          
          // CRITICAL: Try to play the video, but handle autoplay policy gracefully
          const playVideo = async () => {
            try {
              if (remoteVideoRef.current) {
                // Check if user has previously granted audio permission
                const hasAudioPermission = localStorage.getItem('meetopia-audio-permission-granted')
                
                if (hasAudioPermission) {
                  // User has previously granted permission, try with audio
                  remoteVideoRef.current.muted = false
                  await remoteVideoRef.current.play()
                  console.log('✅ Remote video playing with audio (permission remembered)')
                  setHasGrantedAudioPermission(true)
                  setHasUserInteracted(true)
                } else {
                  // First time or no permission yet, start muted for autoplay compliance
                  remoteVideoRef.current.muted = true
                  await remoteVideoRef.current.play()
                  console.log('✅ Remote video playing (muted for autoplay compliance)')
                  console.log('💡 User can click video to enable audio')
                }
              }
            } catch (err: any) {
              console.warn('🔒 Remote video autoplay failed:', err.name)
              console.log('💡 User needs to interact with the page to play video with audio')
            }
          }
          
          // Small delay to ensure stream is fully attached
          setTimeout(playVideo, 100)
        }
      } else {
        console.log('❌ WARNING: Received our own local stream as "remote" - ignoring!')
      }
    }

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('🧊 Sending ICE candidate:', event.candidate.type, event.candidate.candidate)
        if (currentPeerRef.current) {
          socket?.emit('ice-candidate', event.candidate)
        }
      } else {
        console.log('🧊 ICE candidate gathering complete')
      }
    }

    return () => {
      peerConnection.onconnectionstatechange = null
      peerConnection.oniceconnectionstatechange = null
      peerConnection.ontrack = null
      peerConnection.onicecandidate = null
      setIsPeerConnected(false)
    }
  }, [peerConnection, stream, socket, isSearching, handleStartChat, isCameraOff, isMuted])

  // Enhanced video refs setup with better error handling and forced playback
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      console.log('🎥 Applying remote stream to MAIN video element')
      console.log('Stream details:', {
        id: remoteStream.id,
        active: remoteStream.active,
        isLocal: remoteStream.id === stream?.id, // This should be FALSE
        videoTracks: remoteStream.getVideoTracks().length,
        audioTracks: remoteStream.getAudioTracks().length
      })
      
      // Double-check we're not assigning local stream to remote video
      if (remoteStream.id === stream?.id) {
        console.log('🚨 ERROR: Local stream being assigned to remote video - BLOCKING!')
        return
      }
      
      // Store current play promise to prevent AbortError
      let currentPlayPromise: Promise<void> | null = null
      
      remoteVideoRef.current.srcObject = remoteStream
      
      // Enhanced play function with promise management
      const playVideo = async () => {
        try {
          if (!remoteVideoRef.current) return
          
          // If a play promise is already pending, wait for it to resolve/reject first
          if (currentPlayPromise) {
            try {
              await currentPlayPromise
            } catch (error) {
              // Ignore previous play errors, we'll try again
              console.log('Previous play promise resolved/rejected, trying new play attempt')
            }
          }
          
          console.log('🎬 Attempting to play remote video...')
          currentPlayPromise = remoteVideoRef.current.play()
          await currentPlayPromise
          currentPlayPromise = null
          console.log('✅ Remote video playing successfully!')
        } catch (err: any) {
          currentPlayPromise = null
          console.error('❌ Error playing remote video:', err)
          
          // Only retry if it's not an AbortError
          if (err.name !== 'AbortError') {
            // Try again with user interaction workaround after a delay
            setTimeout(async () => {
              try {
                if (remoteVideoRef.current && !currentPlayPromise) {
                  remoteVideoRef.current.muted = false
                  currentPlayPromise = remoteVideoRef.current.play()
                  await currentPlayPromise
                  currentPlayPromise = null
                  console.log('✅ Remote video playing after retry!')
                }
              } catch (retryErr) {
                currentPlayPromise = null
                console.error('❌ Retry failed:', retryErr)
              }
            }, 1000)
          }
        }
      }
      
      // Handle video load events with debouncing
      let loadStartTimeout: NodeJS.Timeout | null = null
      
      remoteVideoRef.current.onloadedmetadata = () => {
        console.log('📊 Remote video metadata loaded, dimensions:', 
          remoteVideoRef.current?.videoWidth, 'x', remoteVideoRef.current?.videoHeight)
        
        // Clear any pending play attempts
        if (loadStartTimeout) {
          clearTimeout(loadStartTimeout)
        }
        
        // Delay play attempt to prevent rapid successive calls
        loadStartTimeout = setTimeout(() => {
          playVideo()
          loadStartTimeout = null
        }, 100)
      }
      
      remoteVideoRef.current.oncanplay = () => {
        console.log('▶️ Remote video can play')
        
        // Only trigger play if no other load event is handling it
        if (!loadStartTimeout) {
          loadStartTimeout = setTimeout(() => {
            playVideo()
            loadStartTimeout = null
          }, 50)
        }
      }
      
      remoteVideoRef.current.onplay = () => {
        console.log('🎮 Remote video started playing')
      }
      
      remoteVideoRef.current.onerror = (err) => {
        console.error('💥 Remote video error:', err)
        currentPlayPromise = null
      }
      
      remoteVideoRef.current.onloadstart = () => {
        console.log('🔄 Remote video load started')
      }
      
      remoteVideoRef.current.onwaiting = () => {
        console.log('⏳ Remote video waiting for data')
      }
      
      // Cleanup function
      return () => {
        if (loadStartTimeout) {
          clearTimeout(loadStartTimeout)
        }
        currentPlayPromise = null
      }
    }
  }, [remoteStream])

  // Video refs setup
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream
    }
  }, [remoteStream])

  // Socket event handlers for remote stream state
  useEffect(() => {
    if (!socket) return

    const handleRemoteStreamState = ({ type, state }: { type: 'audio' | 'video', state: boolean }) => {
      if (type === 'audio') {
        setIsRemoteAudioOff(!state)
      } else if (type === 'video') {
        setIsRemoteCameraOff(!state)
      }
    }

    socket.on('stream-state-change', handleRemoteStreamState)

    return () => {
      socket.off('stream-state-change', handleRemoteStreamState)
    }
  }, [socket])

  // Emit local stream state changes
  const emitStreamState = (type: 'audio' | 'video', state: boolean) => {
    if (socket && currentPeer) {
      socket.emit('stream-state-change', {
        type,
        state,
        to: currentPeer
      })
    }
  }

  // Update local video controls to emit state
  const toggleLocalCamera = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOff(!videoTrack.enabled);
        emitStreamState('video', videoTrack.enabled)
      }
    }
  }

  const toggleLocalMute = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
        emitStreamState('audio', audioTrack.enabled)
      }
    }
  }

  // Screen sharing
  const toggleScreenShare = async () => {
    try {
      if (isScreenSharing) {
        // Stop screen sharing
        if (screenStream) {
          screenStream.getTracks().forEach(track => track.stop())
          
          // Revert to camera
          if (peerConnection && stream) {
            const cameraTrack = stream.getVideoTracks()[0]
            const senders = peerConnection.getSenders()
            const sender = senders.find(s => s.track?.kind === 'video')
            if (sender && cameraTrack) {
              sender.replaceTrack(cameraTrack)
            }
          }
        }
        setIsScreenSharing(false)
        setScreenStream(null)
      } else {
        // Start screen sharing
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false
        })

        setScreenStream(displayStream)
        setIsScreenSharing(true)

        // Replace video track in peer connection
        if (peerConnection && currentPeer) {
          const videoTrack = displayStream.getVideoTracks()[0]
          const senders = peerConnection.getSenders()
          const sender = senders.find(s => s.track?.kind === 'video')
          if (sender) {
            sender.replaceTrack(videoTrack)
          }

          // Handle screen share stop
          videoTrack.onended = () => {
            if (stream) {
              const cameraTrack = stream.getVideoTracks()[0]
              if (sender && cameraTrack) {
                sender.replaceTrack(cameraTrack)
              }
              setIsScreenSharing(false)
              setScreenStream(null)
            }
          }
        }
      }
    } catch (err) {
      console.error('Error toggling screen share:', err)
      setIsScreenSharing(false)
      setScreenStream(null)
    }
  }

  // Reset screen sharing when peer changes
  useEffect(() => {
    if (!currentPeer && screenStream) {
      screenStream.getTracks().forEach(track => track.stop())
      setIsScreenSharing(false)
      setScreenStream(null)
    }
  }, [currentPeer])

  // Scroll to bottom of chat when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  // Handle chat message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !socket || !currentPeer) return

    const messageId = `${socket.id}-${Date.now()}`
    const messageText = newMessage.trim()

    socket.emit('chat-message', {
      id: messageId,
      text: messageText,
      to: currentPeer,
      from: socket.id,
      timestamp: Date.now()
    })
    
    setMessages(prev => [...prev, {
      id: messageId,
      text: messageText,
      sender: 'me',
      timestamp: Date.now()
    }])
    
    setNewMessage('')
  }

  // Add chat socket handlers
  useEffect(() => {
    if (!socket) return

    const handleChatMessage = (data: { id: string; text: string; from: string; timestamp: number }) => {
      if (data.from === socket.id) return // Don't add our own messages twice
      
      setMessages(prev => {
        // Check if we already have this message
        if (prev.some(msg => msg.id === data.id)) return prev
        
        return [...prev, {
          id: data.id || `${data.from}-${data.timestamp}`,
          text: data.text,
          sender: 'peer',
          timestamp: data.timestamp || Date.now()
        }]
      })
    }

    socket.on('chat-message', handleChatMessage)

    return () => {
      socket.off('chat-message', handleChatMessage)
    }
  }, [socket])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  // Clear messages when peer changes
  useEffect(() => {
    setMessages([])
  }, [currentPeer])

  // Keep ref in sync with state
  useEffect(() => {
    currentPeerRef.current = currentPeer
  }, [currentPeer])

  // Update connection status based on peer connection state
  useEffect(() => {
    if (!peerConnection) return

    peerConnection.onconnectionstatechange = () => {
      console.log('Peer connection state:', peerConnection.connectionState)
      const isConnected = peerConnection.connectionState === 'connected'
      setIsPeerConnected(isConnected)
      
      // Handle disconnection with Safari-specific recovery
      if (peerConnection.connectionState === 'disconnected' || 
          peerConnection.connectionState === 'failed') {
        setIsPeerConnected(false)
        
        // Safari-specific: Don't immediately clear streams, try to recover
        if (navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome')) {
          console.log('Safari detected - attempting connection recovery')
          setTimeout(() => {
            if (peerConnection.connectionState === 'failed' || peerConnection.connectionState === 'disconnected') {
              console.log('Recovery timeout - clearing streams')
              setRemoteStream(null)
              setCurrentPeer(null)
            }
          }, 5000) // Give Safari 5 seconds to recover
        } else {
          setRemoteStream(null)
          setCurrentPeer(null)
        }
      }
    }

    peerConnection.ontrack = (event) => {
      console.log('🎵 Received remote track:', event.track.kind)
      console.log('🎵 Track details:', {
        id: event.track.id,
        kind: event.track.kind,
        enabled: event.track.enabled,
        muted: event.track.muted,
        readyState: event.track.readyState,
        label: event.track.label
      })
      
      const [incomingStream] = event.streams
      console.log('🌊 Setting remote stream:', incomingStream)
      console.log('📋 Stream info:', {
        id: incomingStream.id,
        active: incomingStream.active,
        isLocal: incomingStream.id === stream?.id, // Check if this is accidentally our local stream
        videoTracks: incomingStream.getVideoTracks().map(t => ({
          id: t.id,
          kind: t.kind,
          enabled: t.enabled,
          muted: t.muted,
          readyState: t.readyState
        })),
        audioTracks: incomingStream.getAudioTracks().map(t => ({
          id: t.id,
          kind: t.kind,
          enabled: t.enabled,
          muted: t.muted,
          readyState: t.readyState
        }))
      })
      
      // CRITICAL: Only set remote stream if it's NOT our local stream
      if (incomingStream.id !== stream?.id) {
        console.log('✅ Setting REMOTE stream (different from local)')
        setRemoteStream(incomingStream)
        
        // Ensure video element gets the stream immediately with proper play handling
        if (remoteVideoRef.current) {
          console.log('🎬 Immediately updating REMOTE video element with peer stream')
          remoteVideoRef.current.srcObject = incomingStream
          remoteVideoRef.current.style.display = 'block'
          
          // CRITICAL: Try to play the video, but handle autoplay policy gracefully
          const playVideo = async () => {
            try {
              if (remoteVideoRef.current) {
                // Check if user has previously granted audio permission
                const hasAudioPermission = localStorage.getItem('meetopia-audio-permission-granted')
                
                if (hasAudioPermission) {
                  // User has previously granted permission, try with audio
                  remoteVideoRef.current.muted = false
                  await remoteVideoRef.current.play()
                  console.log('✅ Remote video playing with audio (permission remembered)')
                  setHasGrantedAudioPermission(true)
                  setHasUserInteracted(true)
                } else {
                  // First time or no permission yet, start muted for autoplay compliance
                  remoteVideoRef.current.muted = true
                  await remoteVideoRef.current.play()
                  console.log('✅ Remote video playing (muted for autoplay compliance)')
                  console.log('💡 User can click video to enable audio')
                }
              }
            } catch (err: any) {
              console.warn('🔒 Remote video autoplay failed:', err.name)
              console.log('💡 User needs to interact with the page to play video with audio')
            }
          }
          
          // Small delay to ensure stream is fully attached
          setTimeout(playVideo, 100)
        }
      } else {
        console.log('❌ WARNING: Received our own local stream as "remote" - ignoring!')
      }
    }

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('🧊 Sending ICE candidate:', event.candidate.type, event.candidate.candidate)
        if (currentPeerRef.current) {
          socket?.emit('ice-candidate', event.candidate)
        }
      } else {
        console.log('🧊 ICE candidate gathering complete')
      }
    }

    return () => {
      peerConnection.onconnectionstatechange = null
      peerConnection.oniceconnectionstatechange = null
      peerConnection.ontrack = null
      peerConnection.onicecandidate = null
      setIsPeerConnected(false)
    }
  }, [peerConnection, stream, socket, isSearching, handleStartChat])

  // Remote video controls
  const toggleRemoteAudio = () => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.muted = !remoteVideoRef.current.muted;
      setIsRemoteMuted(remoteVideoRef.current.muted);
    }
  }

  const toggleRemoteVideo = () => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.style.display = remoteVideoRef.current.style.display === 'none' ? 'block' : 'none';
    }
  }

  // Monitor connection quality
  useEffect(() => {
    if (!peerConnection || !isPeerConnected) return

    const interval = setInterval(async () => {
      try {
        const stats = await peerConnection.getStats()
        let bytesReceived = 0
        let bytesSent = 0
        let packetsLost = 0
        let rtt = 0

        stats.forEach(report => {
          if (report.type === 'inbound-rtp' && report.mediaType === 'video') {
            bytesReceived += report.bytesReceived || 0
            packetsLost += report.packetsLost || 0
          }
          if (report.type === 'outbound-rtp' && report.mediaType === 'video') {
            bytesSent += report.bytesSent || 0
          }
          if (report.type === 'candidate-pair' && report.state === 'succeeded') {
            rtt = report.currentRoundTripTime || 0
          }
        })

        setConnectionStats({ bytesReceived, bytesSent, packetsLost, rtt })

        // Determine connection quality
        if (rtt < 0.1 && packetsLost < 10) {
          setConnectionQuality('excellent')
        } else if (rtt < 0.3 && packetsLost < 50) {
          setConnectionQuality('good')
        } else {
          setConnectionQuality('poor')
        }
      } catch (err) {
        console.warn('Failed to get connection stats:', err)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [peerConnection, isPeerConnected])

  // Add error handling for socket events
  useEffect(() => {
    if (!socket) return

    const handleError = (errorData: { message: string }) => {
      console.error('Socket error:', errorData)
      setError(errorData.message)
      
      // Auto-clear error after 5 seconds
      setTimeout(() => {
        setError(null)
      }, 5000)
    }

    socket.on('error', handleError)

    return () => {
      socket.off('error', handleError)
    }
  }, [socket])

  // ✅ Development mode stability - prevent HMR from constantly rebuilding connections
  const [isDevMode] = useState(() => process.env.NODE_ENV === 'development')
  const [devConnectionStable, setDevConnectionStable] = useState(false)
  
  // Prevent HMR from constantly rebuilding in development
  useEffect(() => {
    if (isDevMode && isPeerConnected && !devConnectionStable) {
      console.log('🔧 DEV MODE: Connection stable, preventing HMR rebuilds')
      setDevConnectionStable(true)
    }
  }, [isPeerConnected, isDevMode, devConnectionStable])

  return (
    <div className={`relative min-h-screen transition-colors duration-500 ${
      isDarkTheme 
        ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900' 
        : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
    }`}>
      {/* Show loading screen when not mounted */}
      {!isMounted ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`${
            isDarkTheme 
              ? 'bg-gray-800/80 border-gray-600/30 shadow-2xl' 
              : 'bg-white/95 border-gray-200/50 shadow-xl'
          } backdrop-blur-md rounded-3xl p-8 border relative overflow-hidden`}>
            {/* Gradient Border Effect */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-50"></div>
            
            <div className="relative z-10">
              <div className="text-6xl mb-4 text-center animate-bounce">🎥</div>
              <h2 className={`text-2xl font-bold mb-2 text-center ${
                isDarkTheme ? 'text-white' : 'text-gray-800'
              } bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent`}>
                Loading Meetopia...
              </h2>
              <p className={`text-center ${
                isDarkTheme ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Preparing your video chat experience ✨
              </p>
              
              {/* Loading animation */}
              <div className="flex items-center justify-center gap-2 mt-4">
                <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative min-h-screen">
      {/* Header with Logo and Connection Status */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4">
        <div className="flex items-center justify-between">
          <Logo 
            size="sm" 
            isDarkTheme={isDarkTheme}
            showText={false}
          />
          <div className={`flex items-center gap-3 transition-opacity duration-300 ${
            areControlsVisible ? 'opacity-100' : 'opacity-0'
          }`}>
                {/* Tutorial Button */}
                <button
                  onClick={() => setIsTutorialOpen(true)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    isDarkTheme 
                      ? 'bg-purple-600/20 text-purple-300 hover:bg-purple-600/30' 
                      : 'bg-purple-600/20 text-purple-700 hover:bg-purple-600/30'
                  } transition-all duration-300 border ${
                    isDarkTheme ? 'border-purple-400/20' : 'border-purple-600/20'
                  }`}
                  title="Show Tutorial"
                >
                  ? Tutorial
                </button>
            <button
              onClick={() => setIsDarkTheme(!isDarkTheme)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                isDarkTheme 
                  ? 'bg-gray-800/60 text-white/90 hover:bg-gray-700/70 border-gray-600/30' 
                  : 'bg-gray-200/60 text-black/90 hover:bg-gray-300/70 border-gray-300/30'
              } transition-all duration-300 border backdrop-blur-sm`}
            >
              {isDarkTheme ? '☀️ Light' : '🌙 Dark'}
            </button>
            <div className={`flex items-center gap-2 ${
              connectionManager.isTransitioning()
                ? 'bg-blue-500/20 border-blue-400/30' :
              shouldShowConnected && remoteStream && peerConnectionStatus === 'connected'
                ? 'bg-green-500/20 border-green-400/30' :
              currentPeer && (peerConnectionStatus === 'connecting' || isSearching)
                ? 'bg-yellow-500/20 border-yellow-400/30' :
                'bg-red-500/20 border-red-400/30'
            } px-3 py-1.5 rounded-lg border backdrop-blur-sm`}>
              <span className={`text-sm font-medium ${isDarkTheme ? 'text-white/90' : 'text-black/90'}`}>
                {connectionManager.isTransitioning() && 
                  (() => {
                    const transition = connectionManager.getTransitionStatus()
                    switch (transition?.phase) {
                      case 'preparing': return '🔄 Preparing...'
                      case 'connecting': return '🔗 Connecting...'
                      case 'stabilizing': return '⚖️ Stabilizing...'
                      default: return '🔄 Transitioning...'
                    }
                  })()
                }
                {!connectionManager.isTransitioning() && shouldShowConnected && remoteStream && peerConnectionStatus === 'connected' && '🟢 Connected'}
                {!connectionManager.isTransitioning() && currentPeer && (peerConnectionStatus === 'connecting' || isSearching) && !shouldShowConnected && '🟡 Connecting'}
                {!connectionManager.isTransitioning() && !currentPeer && !isSearching && '🔴 Not Connected'}
              </span>
              <div className={`w-2 h-2 rounded-full ${
                connectionManager.isTransitioning()
                  ? 'bg-blue-500 animate-pulse' :
                shouldShowConnected && remoteStream && peerConnectionStatus === 'connected'
                  ? 'bg-green-500' :
                currentPeer && (peerConnectionStatus === 'connecting' || isSearching)
                  ? 'bg-yellow-500 animate-pulse' :
                  'bg-red-500'
              }`} />
            </div>
          </div>
        </div>
      </div>

      {/* FIXED: Action Buttons Bar - FORCE ALWAYS VISIBLE */}
      <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-black/20 backdrop-blur-md rounded-lg px-4 py-2">
        <div className="flex gap-3">
          <button 
            onClick={() => {
              setError(null)
              if (currentPeer) {
                handleNextPerson()
              } else {
                handleStartChat()
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors min-w-[120px]"
          >
            {isSearching ? 'Searching...' : 'Keep Exploring!'}
          </button>
          
          <button 
            onClick={handleLeaveChat}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg font-bold hover:bg-gray-700 transition-colors"
          >
            Back to Base
          </button>
          
          <button
            onClick={() => openReportModal(currentPeer || 'unknown')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-colors"
          >
            Let Us Know!
          </button>
        </div>
      </div>
          
      {/* Full Screen Video Content */}
      <div className="absolute inset-0">
        {/* Main Video - Remote Video - Enhanced for mobile */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          muted={false} // Remote video should NOT be muted so user can hear audio
          controls={false}
          className={`w-full h-full object-cover cursor-pointer ${
            remoteStream ? 'block' : 'hidden'
          }`}
          onClick={async () => {
            // Manual play trigger on user interaction - CRITICAL for autoplay policy
            if (remoteVideoRef.current && remoteStream) {
              try {
                console.log('👆 User clicked - enabling audio and ensuring playback')
                
                const video = remoteVideoRef.current
                
                // Unmute to enable audio (user clicked, so we have permission)
                video.muted = false
                console.log('🔊 Remote video unmuted - audio enabled')
                
                // Remember user's audio permission choice
                setHasUserInteracted(true)
                setHasGrantedAudioPermission(true)
                if (typeof window !== 'undefined') {
                  localStorage.setItem('meetopia-audio-permission-granted', 'true')
                }
                
                // Ensure it's playing
                if (video.paused) {
                  const playPromise = video.play()
                  if (playPromise) {
                    await playPromise
                    console.log('✅ Remote video playing with audio after user interaction')
                  }
                } else {
                  console.log('📱 Remote video already playing - audio now enabled')
                }
                
                // Force UI update to hide the overlay
                setRemoteStream(remoteStream) // Trigger re-render to update overlay
                
              } catch (err: any) {
                console.error('❌ Failed to enable audio/video:', err)
                // If it fails, try starting muted and let user try again
                if (remoteVideoRef.current) {
                  remoteVideoRef.current.muted = true
                  try {
                    await remoteVideoRef.current.play()
                    console.log('⚠️ Playing muted - click again to try audio')
                  } catch (mutedErr) {
                    console.error('❌ Even muted playback failed:', mutedErr)
                  }
                }
              }
            }
          }}
          onLoadedMetadata={() => {
            console.log('📊 Remote video metadata loaded, dimensions:', 
              remoteVideoRef.current?.videoWidth, 'x', remoteVideoRef.current?.videoHeight)
            console.log('🎯 Remote video element visible state:', {
              hasStream: !!remoteVideoRef.current?.srcObject,
              className: remoteVideoRef.current?.className,
              style: remoteVideoRef.current?.style.cssText,
              display: window.getComputedStyle(remoteVideoRef.current!).display,
              visibility: window.getComputedStyle(remoteVideoRef.current!).visibility,
              opacity: window.getComputedStyle(remoteVideoRef.current!).opacity
            })
            
            // Try to play after metadata loads, but expect it might fail due to autoplay policy
            if (remoteVideoRef.current && remoteStream) {
              remoteVideoRef.current.play().catch(err => {
                console.warn('🔒 Remote video autoplay blocked (expected):', err.name)
                console.log('💡 User needs to click on video to start playback')
              })
            }
          }}
          onCanPlay={() => {
            console.log('▶️ Remote video can play')
            // Force visibility check
            if (remoteVideoRef.current && remoteStream) {
              console.log('🔧 Ensuring remote video is visible')
              remoteVideoRef.current.style.display = 'block'
              remoteVideoRef.current.style.visibility = 'visible'
              remoteVideoRef.current.style.opacity = '1'
              
              // Try to play, but don't force it if blocked by autoplay policy
              remoteVideoRef.current.play().catch(err => {
                console.log('🔒 Remote video play blocked by autoplay policy:', err.name)
                console.log('💡 Click anywhere on the video to start playback')
              })
            }
          }}
          onPlay={() => {
            console.log('🎮 Remote video started playing')
          }}
          onPause={() => {
            console.log('⏸️ Remote video paused')
          }}
          onError={(e) => {
            console.error('💥 Remote video error:', e)
          }}
        />
        {/* Default State - Enhanced Meetopia-branded waiting experience */}
        {!remoteStream && (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {/* Floating Meetopia Icons */}
              <div className="absolute top-1/4 left-1/4 text-6xl opacity-10 animate-float">
                🌍
              </div>
              <div className="absolute top-1/3 right-1/4 text-4xl opacity-10 animate-float-delayed">
                💫
              </div>
              <div className="absolute bottom-1/3 left-1/3 text-5xl opacity-10 animate-float-slow">
                🤝
              </div>
              <div className="absolute bottom-1/4 right-1/3 text-3xl opacity-10 animate-float">
                ✨
              </div>
            </div>

            <div className={`${isDarkTheme ? 'bg-gray-800/80' : 'bg-white/95'} backdrop-blur-md rounded-3xl p-8 text-center max-w-md mx-auto border ${isDarkTheme ? 'border-gray-600/30 shadow-2xl' : 'border-gray-200/50 shadow-xl'} relative overflow-hidden`}>
              {/* Gradient Border Effect */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-50"></div>
              
              <div className="relative z-10">
                {isSearching ? (
                  <>
                    {/* Enhanced Searching Animation */}
                    <div className="relative mb-6">
                      <div className="text-7xl animate-spin-slow">🌍</div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-3xl animate-ping opacity-75">🔍</div>
                      </div>
                    </div>
                    
                    <h2 className={`text-2xl font-bold mb-3 ${isDarkTheme ? 'text-white' : 'text-gray-800'} bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}>
                      Finding Your Next Adventure...
                    </h2>
                    
                    <p className={`text-base mb-6 ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
                      🌟 Connecting hearts across the globe!<br />
                      Your perfect conversation is just moments away...
                    </p>

                    {/* Meetopia Progress Animation */}
                    <div className="mb-6">
                      <div className="flex items-center justify-center gap-3 mb-3">
                        <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-bounce"></div>
                        <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                      </div>
                      
                      {/* Animated Progress Bar */}
                      <div className={`w-full h-2 ${isDarkTheme ? 'bg-gray-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                        <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full animate-progress"></div>
                      </div>
                    </div>

                    {/* Fun Search Tips */}
                    <div className={`text-xs ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'} italic`}>
                      💡 Tip: Smile! Your camera is ready for an amazing connection
                    </div>
                  </>
                ) : (
                  <>
                    {/* Enhanced Welcome State with Animations */}
                    <div className="relative mb-6 animate-fade-in-up">
                      <div className="text-8xl mb-2 transform transition-all duration-1000 hover:rotate-12 animate-bounce-slow">🎥</div>
                      <div className="absolute -top-2 -right-2 animate-spin-slow">
                        <div className="text-2xl animate-pulse">✨</div>
                      </div>
                      {/* Floating particles */}
                      <div className="absolute -top-4 -left-4 w-2 h-2 bg-blue-500/40 rounded-full animate-float-1"></div>
                      <div className="absolute -bottom-2 -right-4 w-1 h-1 bg-purple-500/50 rounded-full animate-float-2"></div>
                    </div>
                    
                    <h2 className={`text-2xl font-bold mb-3 ${isDarkTheme ? 'text-white' : 'text-gray-800'} animate-fade-in-up-delay`}>
                      <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent animate-gradient-x bg-size-200">
                        Ready for your Meetopia adventure?
                      </span>
                    </h2>
                    
                    <div className="mb-6 animate-fade-in-up-delay-2">
                      <p className={`text-base ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'} leading-relaxed flex items-center justify-center gap-2`}>
                        <span className="text-xl animate-spin-slow">🌍</span>
                        <span className="animate-type-writer">Connect with amazing people worldwide!</span>
                      </p>
                      <p className={`text-sm mt-2 ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'} animate-fade-in-out`}>
                      Every conversation is a new adventure waiting to unfold.
                    </p>
                    </div>

                    {/* Call to Action with Enhanced Animation */}
                    <div className={`px-4 py-3 ${isDarkTheme ? 'bg-blue-600/20 border-blue-500/30' : 'bg-blue-50 border-blue-200/50'} border rounded-2xl animate-bounce-gentle relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
                      <p className={`text-sm font-semibold ${isDarkTheme ? 'text-blue-300' : 'text-blue-700'} flex items-center justify-center gap-2 relative z-10`}>
                        <span className="animate-pulse text-lg">👆</span>
                        <span className="animate-fade-in-out">Click "Keep Exploring!" to begin!</span>
                        <span className="animate-pulse text-lg animate-delay-500">👆</span>
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
                {permissionStatus.camera === 'pending' && (
                  <div className={`${isDarkTheme ? 'bg-yellow-500/20 border-yellow-400/30' : 'bg-yellow-500/10 border-yellow-400/20'} border rounded-lg p-3 mb-4 max-w-sm`}>
                    <p className={`text-xs sm:text-sm ${isDarkTheme ? 'text-yellow-200' : 'text-yellow-800'}`}>
                      📹 Camera access needed for video chat
                    </p>
                  </div>
                )}
                {error && (
                  <div className={`${isDarkTheme ? 'bg-red-500/20 border-red-400/30' : 'bg-red-500/10 border-red-400/20'} border rounded-lg p-3 mb-4 max-w-sm`}>
                    <p className={`text-xs sm:text-sm ${isDarkTheme ? 'text-red-200' : 'text-red-800'}`}>{error}</p>
                  </div>
                )}
          </div>
        )}

        
        {/* Remote Video Status Indicators - Fixed positioning to avoid overlap */}
        {remoteStream && (
          <div className={`absolute top-32 left-6 transition-all duration-500 ${
            areControlsVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
          }`}>
            {isRemoteMuted && (
              <div className={`flex items-center gap-2 ${
                isDarkTheme ? 'bg-black/40' : 'bg-white/40'
              } backdrop-blur-md rounded-2xl px-4 py-3 border ${
                isDarkTheme ? 'border-white/10' : 'border-black/10'
              } shadow-lg`}>
                <svg className={`w-5 h-5 ${isDarkTheme ? 'text-red-400' : 'text-red-600'}`} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z"/>
                </svg>
                <span className={`text-sm font-bold ${isDarkTheme ? 'text-white/90' : 'text-black/90'}`}>Muted</span>
              </div>
            )}
          </div>
        )}

        {/* Remote Video Controls - Mobile Responsive */}
        <div className={`absolute bottom-20 sm:bottom-12 left-1/2 transform -translate-x-1/2 flex gap-3 sm:gap-6 transition-all duration-500 ${
          areControlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}>
          <button
            onClick={toggleRemoteAudio}
            className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center ${
              isDarkTheme ? 'bg-black/30 text-white/90 hover:bg-black/50' : 'bg-white/30 text-black/90 hover:bg-white/50'
            } transition-all duration-300 backdrop-blur-md border ${
              isDarkTheme ? 'border-white/10' : 'border-black/10'
            } shadow-lg hover:scale-110`}
          >
            <svg className="w-5 h-5 sm:w-7 sm:h-7" viewBox="0 0 24 24" fill="currentColor">
              {isRemoteMuted ? (
                <path d="M3.63 3.63a.996.996 0 000 1.41L7.29 8.7 7 9H3v6h4l5 5v-6.59l4.18 4.18c-.65.49-1.38.88-2.18 1.11v2.06a8.986 8.986 0 003.76-1.78l1.49 1.49a.996.996 0 101.41-1.41L4.13 4.13a.996.996 0 00-1.41 0L3.63 3.63z" />
              ) : (
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
              )}
            </svg>
          </button>
          <button
            onClick={toggleRemoteVideo}
            className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center ${
              isDarkTheme ? 'bg-black/30 text-white/90 hover:bg-black/50' : 'bg-white/30 text-black/90 hover:bg-white/50'
            } transition-all duration-300 backdrop-blur-md border ${
              isDarkTheme ? 'border-white/10' : 'border-black/10'
            } shadow-lg hover:scale-110`}
          >
            <svg className="w-5 h-5 sm:w-7 sm:h-7" viewBox="0 0 24 24" fill="currentColor">
              {remoteVideoRef.current?.style.display === 'none' ? (
                <path d="M21 6.5l-4 4V7c0-.55-.45-1-1-1H9.82L21 17.18V6.5zM3.27 2L2 3.27 4.73 6H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.21 0 .39-.08.54-.18L19.73 21 21 19.73 3.27 2z" />
              ) : (
                <path d="M21 3H3c-1.11 0-2 .89-2 2v12c0 1.1.89 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.11-.9-2-2-2zm0 14H3V5h18v12z" />
              )}
            </svg>
          </button>
          <button
            onClick={toggleScreenShare}
            className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center ${
              isScreenSharing 
                ? isDarkTheme ? 'bg-green-500/30 border-green-400/30' : 'bg-green-500/30 border-green-400/30'
                : isDarkTheme ? 'bg-black/30 border-white/10' : 'bg-white/30 border-black/10'
            } ${
              isDarkTheme ? 'text-white/90 hover:bg-black/50' : 'text-black/90 hover:bg-white/50'
            } transition-all duration-300 backdrop-blur-md border shadow-lg hover:scale-110`}
          >
            <svg className="w-5 h-5 sm:w-7 sm:h-7" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.11-.9-2-2-2H4c-1.11 0-2 .89-2 2v10c0 1.1.89 2 2 2H0v2h24v-2h-4zM4 16V6h16v10.01L4 16z" />
            </svg>
          </button>
        </div>

        {/* Only render PictureInPicture on client side */}
        {isClient && (
          <PictureInPicture
            pipRef={pipRef}
            localVideoRef={localVideoRef}
            pipPosition={pipPosition}
            isDragging={isDragging}
            areControlsVisible={areControlsVisible}
            isMuted={isMuted}
            isCameraOff={isCameraOff}
                isDarkTheme={isDarkTheme}
            handleMouseDown={handleMouseDown}
            toggleLocalMute={toggleLocalMute}
            toggleLocalCamera={toggleLocalCamera}
          />
        )}
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={closeReportModal}
        onSubmit={handleReport}
        reportedUserId={currentPeer || undefined}
      />

          {/* Tutorial */}
          <Tutorial 
            isOpen={isTutorialOpen}
            onClose={handleTutorialClose}
            isDarkTheme={isDarkTheme}
      />

      {/* Chat Interface - Mobile Responsive TikTok Style - Transparent for dark theme blend */}
      <div className={`fixed left-2 sm:left-4 bottom-28 sm:bottom-24 w-72 sm:w-80 max-h-[40vh] sm:max-h-[60vh] transition-all duration-300 ${
        areControlsVisible && isChatOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'
      }`}>
        {/* Chat Messages - Transparent */}
        <div 
          ref={chatContainerRef}
          className="space-y-2 overflow-y-auto max-h-[40vh] sm:max-h-[60vh] scrollbar-thin scrollbar-thumb-gray-800/20 scrollbar-track-transparent pb-16"
        >
          {messages.map(message => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] rounded-lg px-3 py-2 ${
                message.sender === 'me'
                  ? isDarkTheme 
                    ? 'bg-transparent text-white border border-white/20' 
                    : 'bg-transparent text-black border border-black/20'
                  : isDarkTheme 
                    ? 'bg-transparent text-white border border-white/10' 
                    : 'bg-transparent text-black border border-black/10'
              } backdrop-blur-sm`}>
                <p className="text-xs sm:text-sm break-words font-medium">{message.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Chat Input - Transparent floating at bottom */}
        <form onSubmit={handleSendMessage} className="absolute bottom-0 left-0 right-0">
          <div className={`flex items-center gap-2 ${
                isDarkTheme ? 'bg-transparent border border-white/10' : 'bg-transparent border border-black/10'
          } backdrop-blur-sm rounded-full px-3 py-2`}>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className={`flex-1 bg-transparent ${
                isDarkTheme 
                  ? 'text-white placeholder-white/50' 
                  : 'text-black placeholder-black/50'
              } text-xs sm:text-sm font-medium focus:outline-none border-none`}
              onFocus={handleChatFocus}
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className={`${
                isDarkTheme 
                  ? 'text-white hover:text-white/90 disabled:text-white/30' 
                  : 'text-black hover:text-black/90 disabled:text-black/30'
              }`}
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </form>
      </div>

      {/* Chat Toggle Button - Mobile Responsive */}
      <div className={`fixed left-2 sm:left-4 bottom-4 ${
        isDarkTheme ? 'text-white/90' : 'text-black/90'
      }`}>
        <button 
          onClick={() => {
            const newChatState = !isChatOpen
            setIsChatOpen(newChatState)
            setIsChatUserToggled(!newChatState) // Track that user manually toggled
            
            // If opening chat, show controls too
            if (newChatState) {
              setAreControlsVisible(true)
              setIsChatUserToggled(false) // Reset toggle state when opening
            }
          }}
          className="text-xs sm:text-sm font-medium hover:opacity-80 bg-black/20 backdrop-blur-sm px-2 py-1 rounded"
        >
          Chat {isChatOpen ? '×' : '💬'}
        </button>
      </div>

      {/* Click to Start Overlay - For First User Interaction */}
      {remoteStream && !hasUserInteracted && !hasGrantedAudioPermission && (
        <div className="absolute top-20 right-4 z-30 animate-bounce">
          <div className="bg-blue-500/95 text-white rounded-lg p-3 shadow-lg max-w-xs relative">
            {/* Dismiss button */}
            <button
              onClick={() => {
                setHasUserInteracted(true) // Hide the notification
              }}
              className="absolute top-1 right-1 text-white/70 hover:text-white text-xs"
            >
              ✕
            </button>
            
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">🔊</span>
              <span className="text-sm font-semibold">Click for Audio</span>
            </div>
            <p className="text-xs opacity-90 mb-2">
              Tap anywhere on video to enable sound
            </p>
            <button
              onClick={() => {
                setHasUserInteracted(true)
                setHasGrantedAudioPermission(true)
                // Remember user's choice
                if (typeof window !== 'undefined') {
                  localStorage.setItem('meetopia-audio-permission-granted', 'true')
                }
                // Force play remote video with audio
                if (remoteVideoRef.current && remoteStream) {
                  remoteVideoRef.current.muted = false
                  remoteVideoRef.current.play().catch(console.warn)
                }
              }}
              className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded text-xs font-medium transition-colors w-full"
            >
              Enable Audio
            </button>
          </div>
        </div>
      )}

      {/* Auto-play Policy Helper Overlay */}
      {remoteStream && remoteVideoRef.current?.muted && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm pointer-events-none z-20"
          style={{ display: remoteVideoRef.current?.paused ? 'flex' : 'none' }}
        >
          <div className="bg-white/90 dark:bg-gray-900/90 rounded-xl p-4 text-center shadow-lg animate-pulse">
            <div className="text-2xl mb-2">🔊</div>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
              Click anywhere to hear audio
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Browser requires user interaction for sound
            </p>
          </div>
        </div>
      )}
        </div>
      )}
    </div>
  )
}