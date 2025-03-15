'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { usePeerConnection } from '@/hooks/usePeerConnection'
import ChatMenu from '@/components/ChatMenu'
import ReportModal from '@/components/ReportModal'
import { useReporting } from '@/hooks/useReporting'
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
      className={`w-80 aspect-video bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-all duration-300 ${
        props.isDragging ? 'scale-105' : ''
      } ${props.areControlsVisible ? 'opacity-100' : 'opacity-70'}`}
    >
      <div className="absolute inset-0 group">
        <div 
          className="absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity cursor-grab"
          onMouseDown={props.handleMouseDown}
        />
        <video
          ref={props.localVideoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        {/* Local Video Controls */}
        <div className={`absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2 transition-opacity duration-300 ${
          props.areControlsVisible ? 'opacity-100' : 'opacity-0'
        }`}>
          <button
            onClick={props.toggleLocalMute}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white/90 ${
              props.isMuted ? 'bg-red-500/20' : ''
            } hover:bg-black/30 transition-all duration-300`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              {props.isMuted ? (
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z M19 11h-2v2h2v-2m-4 0h-2v2h2v-2m-4 0H9v2h2v-2" />
              ) : (
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
              )}
            </svg>
          </button>
          <button
            onClick={props.toggleLocalCamera}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white/90 ${
              props.isCameraOff ? 'bg-red-500/20' : ''
            } hover:bg-black/30 transition-all duration-300`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              {props.isCameraOff ? (
                <path d="M18 10.48V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4.48l4 3.98v-11l-4 3.98zm-2-.79V18H4V6h12v3.69L18 8V6.48l2 1.99L18 9.69zM10 8v6l5-3z M19 11h-2v2h2v-2m-4 0h-2v2h2v-2m-4 0H9v2h2v-2" />
              ) : (
                <path d="M18 10.48V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4.48l4 3.98v-11l-4 3.98zm-2-.79V18H4V6h12v3.69L18 8V6.48l2 1.99L18 9.69zM10 8v6l5-3z M19 11h-2v2h2v-2m-4 0h-2v2h2v-2m-4 0H9v2h2v-2" />
              )}
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}), { ssr: false })

export default function VideoChatPage() {
  // Add state for client-side rendering
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

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

  // Add state for PiP position and size with default values
  const [pipPosition, setPipPosition] = useState({ x: 0, y: 140 })
  
  // Add useEffect to set initial position after mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPipPosition({ x: window.innerWidth - 400, y: 140 })
    }
  }, [])

  const [isDragging, setIsDragging] = useState(false)
  const [startDragPosition, setStartDragPosition] = useState({ x: 0, y: 0 })
  const pipRef = useRef<HTMLDivElement | null>(null)

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

  const localVideoRef = useRef<HTMLVideoElement | null>(null)
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null)
  const { peerConnection } = usePeerConnection(stream)
  const {
    isReportModalOpen,
    handleReport,
    openReportModal,
    closeReportModal
  } = useReporting()

  // Add state for controls visibility
  const [areControlsVisible, setAreControlsVisible] = useState(true)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Add state for UI preferences
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDarkTheme, setIsDarkTheme] = useState(true)

  // Add state for chat
  const [messages, setMessages] = useState<Array<{
    id: string;
    text: string;
    sender: 'me' | 'peer';
    timestamp: number;
  }>>([])
  const [newMessage, setNewMessage] = useState('')
  const [isChatOpen, setIsChatOpen] = useState(true)
  const chatContainerRef = useRef<HTMLDivElement | null>(null)

  // Menu navigation
  const handleNavigate = (path: string) => {
    window.location.href = path
  }

  // Handle mouse movement and controls visibility
  const handleControlsVisibility = useCallback(() => {
    setAreControlsVisible(true)
    setIsChatOpen(true)
    
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    
    controlsTimeoutRef.current = setTimeout(() => {
      setAreControlsVisible(false)
      setIsChatOpen(false)
    }, 7000)
  }, [])

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
        if (currentPeer) {
          handleNextPerson()
        } else {
          handleStartChat()
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentPeer])

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

  // Media stream setup
  useEffect(() => {
    let currentStream: MediaStream | null = null;
    
    async function setupMedia() {
      try {
        // Try high quality first
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
              width: { min: 1280, ideal: 1920, max: 2560 },
              height: { min: 720, ideal: 1080, max: 1440 },
              frameRate: { min: 24, ideal: 30, max: 60 },
              aspectRatio: { ideal: 1.7777777778 },
              facingMode: "user"
          },
          audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            sampleRate: 48000,
            sampleSize: 16,
            channelCount: 1
          }
        })
          console.log('Using high quality video settings')
          currentStream = mediaStream
          setStream(mediaStream)
        } catch (err) {
          console.log('Falling back to standard quality:', err)
          // Fallback to standard quality
          const mediaStream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { min: 640, ideal: 1280, max: 1920 },
              height: { min: 480, ideal: 720, max: 1080 },
              frameRate: { min: 20, ideal: 24 },
              aspectRatio: { ideal: 1.7777777778 },
              facingMode: "user"
            },
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            }
          })
          console.log('Using standard quality video settings')
          currentStream = mediaStream
          setStream(mediaStream)
        }

        setPermissionStatus({
          camera: 'granted',
          microphone: 'granted'
        })

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = currentStream
        }
      } catch (err: any) {
        console.error('Error accessing media devices:', err)
        // Try one last time with basic settings
        try {
          console.log('Falling back to basic quality')
          const mediaStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
          })
          console.log('Using basic quality video settings')
        currentStream = mediaStream
        setStream(mediaStream)
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = mediaStream
        }
        } catch (finalErr) {
        if (err.name === 'NotAllowedError') {
          setPermissionStatus({
            camera: 'denied',
            microphone: 'denied'
          })
          setError(
            'Camera or microphone access denied. ' +
            'Please allow access in your browser settings and refresh the page.'
          )
        } else {
          setError(
            'Failed to access camera/microphone. ' +
            'Please check your device connections and try again.'
          )
          }
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

  // Socket setup
  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3003', {
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000
    })

    setSocket(newSocket)

    newSocket.on('connect', () => {
      console.log('Socket connected')
      setIsSocketConnected(true)
      setError(null)
    })

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected')
      setIsSocketConnected(false)
      setCurrentPeer(null)
      setRemoteStream(null)
      setIsSearching(false)
      setError('Connection lost. Attempting to reconnect...')
    })

    return () => {
      if (newSocket) {
        newSocket.disconnect()
      }
    }
  }, [])

  // Socket event handlers
  useEffect(() => {
    if (!socket || !peerConnection || !stream) return

    const handleUserFound = async ({ partnerId }: { partnerId: string }) => {
      console.log('Found peer:', partnerId)
      setCurrentPeer(partnerId)
      setIsSearching(false)

      if (socket && socket.id && partnerId > socket.id) {
        try {
          const offer = await peerConnection.createOffer()
          await peerConnection.setLocalDescription(offer)
          socket.emit('call-user', { offer, to: partnerId })
        } catch (err) {
          console.error('Error creating offer:', err)
          setError('Failed to establish video connection. Please try again.')
        }
      }
    }

    const handleCallMade = async ({ offer, from }: { offer: RTCSessionDescriptionInit, from: string }) => {
      try {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
        const answer = await peerConnection.createAnswer()
        await peerConnection.setLocalDescription(answer)
        if (socket) {
          socket.emit('make-answer', { answer, to: from })
        }
      } catch (err) {
        console.error('Error handling call:', err)
      }
    }

    const handleAnswerMade = async ({ answer, from }: { answer: RTCSessionDescriptionInit, from: string }) => {
      try {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
      } catch (err) {
        console.error('Error handling answer:', err)
      }
    }

    const handleIceCandidate = ({ candidate, from }: { candidate: RTCIceCandidate, from: string }) => {
      try {
        if (peerConnection.remoteDescription) {
          peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
        }
      } catch (err) {
        console.error('Error adding ICE candidate:', err)
      }
    }

    const handlePeerLeft = () => {
      console.log('Peer left')
      setCurrentPeer(null)
      setRemoteStream(null)
      setIsSearching(false)
    }

    socket.on('user-found', handleUserFound)
    socket.on('call-made', handleCallMade)
    socket.on('answer-made', handleAnswerMade)
    socket.on('ice-candidate', handleIceCandidate)
    socket.on('peer-left', handlePeerLeft)

    return () => {
      socket?.off('user-found', handleUserFound)
      socket?.off('call-made', handleCallMade)
      socket?.off('answer-made', handleAnswerMade)
      socket?.off('ice-candidate', handleIceCandidate)
      socket?.off('peer-left', handlePeerLeft)
    }
  }, [peerConnection, stream])

  // Track handling
  useEffect(() => {
    if (!peerConnection) return

    peerConnection.onconnectionstatechange = () => {
      console.log('Peer connection state:', peerConnection.connectionState)
      setIsPeerConnected(peerConnection.connectionState === 'connected')
      
      // Handle disconnection
      if (peerConnection.connectionState === 'disconnected' || 
          peerConnection.connectionState === 'failed') {
        setIsPeerConnected(false)
        setRemoteStream(null)
        setCurrentPeer(null)
      }
    }

    peerConnection.ontrack = (event) => {
      console.log('Received remote track:', event.track.kind)
      setRemoteStream(event.streams[0])
    }

    peerConnection.onicecandidate = (event) => {
      if (event.candidate && currentPeer) {
        socket?.emit('ice-candidate', {
          candidate: event.candidate,
          to: currentPeer
        })
      }
    }

    return () => {
      peerConnection.onconnectionstatechange = null
      peerConnection.ontrack = null
      peerConnection.onicecandidate = null
      setIsPeerConnected(false)
    }
  }, [peerConnection, currentPeer])

  // Video refs setup
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream
    }
  }, [remoteStream])

  const startCooldown = () => {
    setButtonCooldown(true)
    setTimeout(() => setButtonCooldown(false), 5000)
  }

  const handleStartChat = () => {
    if (!socket?.connected || !stream || buttonCooldown) return
    setIsSearching(true)
    socket.emit('find-user')
    startCooldown()
  }

  const handleNextPerson = () => {
    if (!socket?.connected || !stream || buttonCooldown) return
    setIsPeerConnected(false)
    setIsSearching(true)
    socket.emit('find-next-user')
    startCooldown()
  }

  const handleLeaveChat = () => {
    if (!socket?.connected) return
    setIsPeerConnected(false)
    socket.emit('leave-chat')
    setCurrentPeer(null)
    setRemoteStream(null)
    setIsSearching(false)
    window.location.href = '/'
  }

  // Remote stream state indicators
  const [isRemoteCameraOff, setIsRemoteCameraOff] = useState(false)
  const [isRemoteAudioOff, setIsRemoteAudioOff] = useState(false)

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

  // Update connection status based on peer connection state
  useEffect(() => {
    if (!peerConnection) return

    peerConnection.onconnectionstatechange = () => {
      console.log('Peer connection state:', peerConnection.connectionState)
      const isConnected = peerConnection.connectionState === 'connected'
      setIsPeerConnected(isConnected)
      
      // Handle disconnection
      if (peerConnection.connectionState === 'disconnected' || 
          peerConnection.connectionState === 'failed') {
        setIsPeerConnected(false)
        setRemoteStream(null)
        setCurrentPeer(null)
      }
    }
  }, [peerConnection])

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

  return (
    <div className={`relative min-h-screen transition-colors duration-300 ${
      isDarkTheme ? 'bg-black' : 'bg-white'
    }`}>
      {/* Header with Logo and Connection Status */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsMenuOpen(true)} 
              className={`transition-opacity duration-300 ${
                areControlsVisible ? 'opacity-100' : 'opacity-0'
              } ${isDarkTheme ? 'text-white/80 hover:text-white' : 'text-black/80 hover:text-black'}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className={`text-xl font-bold transition-colors duration-300`}>
              <span className="text-blue-400">Meet</span>
              <span className={isDarkTheme ? 'text-white' : 'text-black'}>opia</span>
            </h1>
          </div>
          <div className={`flex items-center gap-4 transition-opacity duration-300 ${
            areControlsVisible ? 'opacity-100' : 'opacity-0'
          }`}>
            <button
              onClick={() => setIsDarkTheme(!isDarkTheme)}
              className={`px-3 py-1 rounded-full text-sm ${
                isDarkTheme 
                  ? 'bg-gray-800/50 text-white/80 hover:bg-gray-800/70' 
                  : 'bg-gray-200/50 text-black/80 hover:bg-gray-200/70'
              }`}
            >
              {isDarkTheme ? '☀️ Light' : '🌙 Dark'}
            </button>
            <div className={`flex items-center gap-2 ${
              isPeerConnected 
                ? isDarkTheme ? 'bg-green-500/20' : 'bg-green-500/10'
                : isDarkTheme ? 'bg-red-500/20' : 'bg-red-500/10'
            } px-3 py-1 rounded-full`}>
              <span className={`text-sm ${isDarkTheme ? 'text-white/90' : 'text-black/90'}`}>
                {isPeerConnected ? 'Connected' : 'Not Connected'}
              </span>
              <div className={`w-2 h-2 rounded-full ${isPeerConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Side Menu */}
      {isMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-30"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="fixed left-0 top-0 bottom-0 w-64 bg-gray-900 z-40 p-4">
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-bold text-white mb-4">Menu</h2>
              <button
                onClick={() => handleNavigate('/chat/text')}
                className="w-full text-left px-4 py-2 rounded-lg bg-gray-800/50 text-white/90 hover:bg-gray-800"
              >
                💬 Text Chat
              </button>
              <button
                onClick={() => handleNavigate('/chat/video')}
                className="w-full text-left px-4 py-2 rounded-lg bg-gray-800/50 text-white/90 hover:bg-gray-800"
              >
                🎥 Video Chat
              </button>
              <button
                onClick={() => handleNavigate('/chat/combined')}
                className="w-full text-left px-4 py-2 rounded-lg bg-gray-800/50 text-white/90 hover:bg-gray-800"
              >
                🔄 Combined Mode
              </button>
              <div className="border-t border-gray-800 my-4" />
              <div className="flex flex-col gap-2">
                <p className="text-white/60 text-sm">Theme</p>
                <button
                  onClick={() => setIsDarkTheme(true)}
                  className={`w-full text-left px-4 py-2 rounded-lg ${
                    isDarkTheme ? 'bg-gray-800 text-white' : 'bg-gray-800/50 text-white/90 hover:bg-gray-800'
                  }`}
                >
                  🌙 Dark Mode
                </button>
                <button
                  onClick={() => setIsDarkTheme(false)}
                  className={`w-full text-left px-4 py-2 rounded-lg ${
                    !isDarkTheme ? 'bg-gray-800 text-white' : 'bg-gray-800/50 text-white/90 hover:bg-gray-800'
                  }`}
                >
                  ☀️ Light Mode
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Action Buttons Bar */}
      <div className={`absolute top-20 left-0 right-0 z-10 transition-opacity duration-300 ${
        areControlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        <div className="flex justify-center gap-4">
          <button 
            onClick={handleStartChat}
            disabled={!isSocketConnected || isSearching || buttonCooldown}
            className={`px-4 py-1.5 rounded-full text-sm font-medium ${
              isDarkTheme ? 'text-white/90 hover:bg-green-600/20' : 'text-black/90 hover:bg-green-600/10'
            } transition-all duration-300`}
          >
            Make a Connection!
          </button>
          <button 
            onClick={handleNextPerson}
            className={`px-4 py-1.5 rounded-full text-sm font-medium ${
              isDarkTheme ? 'text-white/90 hover:bg-gray-600/20' : 'text-black/90 hover:bg-gray-600/10'
            } transition-all duration-300`}
          >
            Keep Exploring!
          </button>
          <button 
            onClick={handleLeaveChat}
            className={`px-4 py-1.5 rounded-full text-sm font-medium ${
              isDarkTheme ? 'text-white/90 hover:bg-red-900/20' : 'text-black/90 hover:bg-red-900/10'
            } transition-all duration-300`}
          >
            Back to Base
          </button>
          <button
            onClick={() => openReportModal(currentPeer || '')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium ${
              isDarkTheme ? 'text-white/90 hover:bg-amber-900/20' : 'text-black/90 hover:bg-amber-900/10'
            } transition-all duration-300`}
          >
            Let Us Know!
          </button>
        </div>
      </div>

      {/* Full Screen Video Content */}
      <div className="absolute inset-0">
        {/* Main Video - Remote Video */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
          style={{ display: remoteStream ? 'block' : 'none' }}
        />
        {!remoteStream && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className={`text-lg mb-4 ${isDarkTheme ? 'text-white/80' : 'text-black/80'}`}>
              Ready for your Meetopia adventure? Click "Make a Connection" to begin!
            </p>
          </div>
        )}

        {/* Remote Video Status Indicators */}
        {remoteStream && (
          <div className={`absolute top-4 left-4 flex gap-2 transition-opacity duration-300 ${
            areControlsVisible ? 'opacity-100' : 'opacity-0'
          }`}>
            {isRemoteCameraOff && (
              <div className="flex items-center gap-1 bg-gray-900/50 backdrop-blur-sm rounded-full px-3 py-1">
                <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 6.5l-4 4V7c0-.55-.45-1-1-1H9.82L21 17.18V6.5zM3.27 2L2 3.27 4.73 6H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.21 0 .39-.08.54-.18L19.73 21 21 19.73 3.27 2z" />
                </svg>
                <span className={`text-xs ${isDarkTheme ? 'text-white/90' : 'text-black/90'}`}>Camera Off</span>
              </div>
            )}
            {isRemoteAudioOff && (
              <div className="flex items-center gap-1 bg-gray-900/50 backdrop-blur-sm rounded-full px-3 py-1">
                <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.63 3.63a.996.996 0 000 1.41L7.29 8.7 7 9H3v6h4l5 5v-6.59l4.18 4.18c-.65.49-1.38.88-2.18 1.11v2.06a8.986 8.986 0 003.76-1.78l1.49 1.49a.996.996 0 101.41-1.41L4.13 4.13a.996.996 0 00-1.41 0L3.63 3.63z" />
                </svg>
                <span className={`text-xs ${isDarkTheme ? 'text-white/90' : 'text-black/90'}`}>Muted</span>
              </div>
            )}
          </div>
        )}

        {/* Remote Video Controls */}
        <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4 transition-opacity duration-300 ${
          areControlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}>
          <button
            onClick={toggleRemoteAudio}
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isDarkTheme ? 'text-white/90 hover:bg-black/30' : 'text-black/90 hover:bg-white/30'
            } transition-all duration-300`}
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              {isRemoteMuted ? (
                <path d="M3.63 3.63a.996.996 0 000 1.41L7.29 8.7 7 9H3v6h4l5 5v-6.59l4.18 4.18c-.65.49-1.38.88-2.18 1.11v2.06a8.986 8.986 0 003.76-1.78l1.49 1.49a.996.996 0 101.41-1.41L4.13 4.13a.996.996 0 00-1.41 0L3.63 3.63z" />
              ) : (
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
              )}
            </svg>
          </button>
          <button
            onClick={toggleRemoteVideo}
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isDarkTheme ? 'text-white/90 hover:bg-black/30' : 'text-black/90 hover:bg-white/30'
            } transition-all duration-300`}
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              {remoteVideoRef.current?.style.display === 'none' ? (
                <path d="M21 6.5l-4 4V7c0-.55-.45-1-1-1H9.82L21 17.18V6.5zM3.27 2L2 3.27 4.73 6H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.21 0 .39-.08.54-.18L19.73 21 21 19.73 3.27 2z" />
              ) : (
                <path d="M21 3H3c-1.11 0-2 .89-2 2v12c0 1.1.89 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.11-.9-2-2-2zm0 14H3V5h18v12z" />
              )}
            </svg>
          </button>
          <button
            onClick={toggleScreenShare}
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isDarkTheme ? 'text-white/90' : 'text-black/90'
            } ${isScreenSharing ? 'bg-green-600/20' : ''} ${
              isDarkTheme ? 'hover:bg-black/30' : 'hover:bg-white/30'
            } transition-all duration-300`}
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
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

      {/* Chat Interface - TikTok Style */}
      <div className={`fixed left-4 bottom-24 w-80 max-h-[60vh] transition-all duration-300 ${
        areControlsVisible && isChatOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'
      }`}>
        {/* Chat Messages */}
        <div 
          ref={chatContainerRef}
          className="space-y-2 overflow-y-auto max-h-[60vh] scrollbar-thin scrollbar-thumb-gray-800/20 scrollbar-track-transparent pb-16"
        >
          {messages.map(message => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] rounded-lg px-3 py-2 ${
                message.sender === 'me'
                  ? isDarkTheme 
                    ? 'bg-blue-500/20 text-white' 
                    : 'bg-blue-500/20 text-black'
                  : isDarkTheme 
                    ? 'bg-gray-800/50 text-white' 
                    : 'bg-gray-200 text-black'
              }`}>
                <p className="text-sm break-words font-medium">{message.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Chat Input - Floating at bottom */}
        <form onSubmit={handleSendMessage} className="absolute bottom-0 left-0 right-0">
          <div className={`flex items-center gap-2 ${
            isDarkTheme ? 'bg-gray-900/90' : 'bg-gray-200'
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
              } text-sm font-medium focus:outline-none border-none`}
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
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </form>
      </div>

      {/* Chat Toggle Button */}
      <div className={`fixed left-4 bottom-4 ${
        isDarkTheme ? 'text-white/90' : 'text-black/90'
      }`}>
        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="text-sm font-medium hover:opacity-80"
        >
          Chat ×
        </button>
      </div>
    </div>
  )
}