'use client'
import { useState, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useReporting } from '@/hooks/useReporting'
import ReportModal from '@/components/ReportModal'

interface Participant {
  id: string;
  stream: MediaStream | null;
  isMuted: boolean;
  isCameraOff: boolean;
  isScreenSharing: boolean;
}

interface Message {
  id: string;
  text: string;
  sender: string;
  senderName?: string;
  timestamp: number;
}

interface RoomPreferences {
  minParticipants: number;
  maxParticipants: number;
  allowFlexible: boolean;
  mode: 'balanced' | 'mixed' | 'custom';
}

export default function CombinedChatPage() {
  // Basic state
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isSocketConnected, setIsSocketConnected] = useState(false)
  const [isDarkTheme, setIsDarkTheme] = useState(true)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(true)
  
  // Room state
  const [roomId, setRoomId] = useState<string | null>(null)
  const [participants, setParticipants] = useState<Map<string, Participant>>(new Map())
  const [isHost, setIsHost] = useState(false)
  const [layout, setLayout] = useState<'grid' | 'spotlight'>('grid')
  const [spotlightParticipant, setSpotlightParticipant] = useState<string | null>(null)
  
  // Local media state
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isCameraOff, setIsCameraOff] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null)
  
  // Chat state
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Refs for video elements
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const participantVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map())

  // Add new state for room preferences
  const [roomPreferences, setRoomPreferences] = useState<RoomPreferences>({
    minParticipants: 2,
    maxParticipants: 4,
    allowFlexible: true,
    mode: 'balanced'
  })

  const {
    isReportModalOpen,
    handleReport,
    openReportModal,
    closeReportModal
  } = useReporting()

  // Setup socket connection
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
    })

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected')
      setIsSocketConnected(false)
      handleLeaveRoom()
    })

    // Room events
    newSocket.on('room-created', ({ roomId }) => {
      setRoomId(roomId)
      setIsHost(true)
    })

    newSocket.on('room-joined', ({ roomId, participants: existingParticipants }) => {
      setRoomId(roomId)
      // Initialize participants map with existing participants
      const participantsMap = new Map<string, Participant>()
      existingParticipants.forEach((p: any) => {
        participantsMap.set(p.id, {
          id: p.id,
          stream: null,
          isMuted: p.isMuted,
          isCameraOff: p.isCameraOff,
          isScreenSharing: p.isScreenSharing
        })
      })
      setParticipants(participantsMap)
    })

    newSocket.on('participant-joined', ({ participantId }) => {
      setParticipants(prev => {
        const updated = new Map(prev)
        updated.set(participantId, {
          id: participantId,
          stream: null,
          isMuted: false,
          isCameraOff: false,
          isScreenSharing: false
        })
        return updated
      })
    })

    newSocket.on('participant-left', ({ participantId }) => {
      setParticipants(prev => {
        const updated = new Map(prev)
        updated.delete(participantId)
        return updated
      })
    })

    // Chat events
    newSocket.on('chat-message', (data: { id: string; text: string; sender: string; senderName?: string; timestamp: number }) => {
      setMessages(prev => [...prev, {
        id: data.id,
        text: data.text,
        sender: data.sender,
        senderName: data.senderName,
        timestamp: data.timestamp
      }])
    })

    return () => {
      newSocket.disconnect()
    }
  }, [])

  // Setup local media
  useEffect(() => {
    async function setupMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 }
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true
          }
        })
        
        setLocalStream(stream)
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
        }
      } catch (err) {
        console.error('Error accessing media devices:', err)
      }
    }

    setupMedia()
    return () => {
      localStream?.getTracks().forEach(track => track.stop())
    }
  }, [])

  // Scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  // Room management functions
  const createRoom = () => {
    socket?.emit('create-room')
  }

  const joinRoom = (roomId: string) => {
    socket?.emit('join-room', { roomId })
  }

  const handleLeaveRoom = () => {
    if (roomId) {
      socket?.emit('leave-room', { roomId })
      setRoomId(null)
      setParticipants(new Map())
      setIsHost(false)
      setMessages([])
    }
  }

  // Media control functions
  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsMuted(!audioTrack.enabled)
        socket?.emit('media-state-update', {
          roomId,
          type: 'audio',
          enabled: audioTrack.enabled
        })
      }
    }
  }

  const toggleCamera = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsCameraOff(!videoTrack.enabled)
        socket?.emit('media-state-update', {
          roomId,
          type: 'video',
          enabled: videoTrack.enabled
        })
      }
    }
  }

  const toggleScreenShare = async () => {
    try {
      if (isScreenSharing) {
        if (screenStream) {
          screenStream.getTracks().forEach(track => track.stop())
          setScreenStream(null)
        }
        setIsScreenSharing(false)
      } else {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false
        })
        setScreenStream(stream)
        setIsScreenSharing(true)
        
        // Handle stream end
        stream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false)
          setScreenStream(null)
        }
      }
      
      socket?.emit('media-state-update', {
        roomId,
        type: 'screen',
        enabled: !isScreenSharing
      })
    } catch (err) {
      console.error('Error toggling screen share:', err)
    }
  }

  // Chat functions
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !socket || !roomId) return

    const messageId = `${socket.id}-${Date.now()}`
    socket.emit('chat-message', {
      roomId,
      message: {
        id: messageId,
        text: newMessage.trim(),
        sender: socket.id,
        timestamp: Date.now()
      }
    })
    
    setNewMessage('')
  }

  // Layout functions
  const toggleLayout = () => {
    setLayout(prev => prev === 'grid' ? 'spotlight' : 'grid')
  }

  const setParticipantSpotlight = (participantId: string) => {
    setSpotlightParticipant(participantId)
    setLayout('spotlight')
  }

  return (
    <div className={`relative min-h-screen transition-colors duration-300 ${
      isDarkTheme ? 'bg-black' : 'bg-white'
    }`}>
      {/* Header with Logo and Controls */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsMenuOpen(true)} 
              className={`${isDarkTheme ? 'text-white/80 hover:text-white' : 'text-black/80 hover:text-black'}`}
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
          <div className="flex items-center gap-4">
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
            {roomId && (
              <div className={`flex items-center gap-2 ${
                isDarkTheme ? 'bg-green-500/20' : 'bg-green-500/10'
              } px-3 py-1 rounded-full`}>
                <span className={`text-sm ${isDarkTheme ? 'text-white/90' : 'text-black/90'}`}>
                  Room: {roomId}
                </span>
              </div>
            )}
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
                onClick={() => window.location.href = '/chat/text'}
                className="w-full text-left px-4 py-2 rounded-lg bg-gray-800/50 text-white/90 hover:bg-gray-800"
              >
                💬 Text Chat
              </button>
              <button
                onClick={() => window.location.href = '/chat/video'}
                className="w-full text-left px-4 py-2 rounded-lg bg-gray-800/50 text-white/90 hover:bg-gray-800"
              >
                🎥 Video Chat
              </button>
              <button
                onClick={() => window.location.href = '/chat/combined'}
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

      {/* Main Content Area */}
      <div className="absolute inset-0 pt-20">
        {!roomId ? (
          // Updated Room Join/Create UI
          <div className="flex flex-col items-center justify-center h-full gap-6 p-4">
            <div className="max-w-md w-full space-y-6">
              <h2 className={`text-2xl font-bold text-center ${
                isDarkTheme ? 'text-white' : 'text-black'
              }`}>
                Choose Your Meetopia Experience
              </h2>

              {/* Quick Match Options */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    setRoomPreferences({
                      minParticipants: 2,
                      maxParticipants: 2,
                      allowFlexible: false,
                      mode: 'balanced'
                    })
                    socket?.emit('find-room', { preferences: {
                      minParticipants: 2,
                      maxParticipants: 2,
                      allowFlexible: false,
                      mode: 'balanced'
                    }})
                  }}
                  className={`p-4 rounded-lg text-center ${
                    isDarkTheme 
                      ? 'bg-blue-500/20 text-white hover:bg-blue-500/30' 
                      : 'bg-blue-500/10 text-black hover:bg-blue-500/20'
                  }`}
                >
                  <div className="text-2xl mb-2">👥</div>
                  <div className="font-medium">1-on-1</div>
                  <div className="text-sm opacity-70">Classic duo chat</div>
                </button>

                <button
                  onClick={() => {
                    setRoomPreferences({
                      minParticipants: 4,
                      maxParticipants: 4,
                      allowFlexible: false,
                      mode: 'balanced'
                    })
                    socket?.emit('find-room', { preferences: {
                      minParticipants: 4,
                      maxParticipants: 4,
                      allowFlexible: false,
                      mode: 'balanced'
                    }})
                  }}
                  className={`p-4 rounded-lg text-center ${
                    isDarkTheme 
                      ? 'bg-purple-500/20 text-white hover:bg-purple-500/30' 
                      : 'bg-purple-500/10 text-black hover:bg-purple-500/20'
                  }`}
                >
                  <div className="text-2xl mb-2">👥👥</div>
                  <div className="font-medium">2-on-2</div>
                  <div className="text-sm opacity-70">Double duo fun</div>
                </button>

                <button
                  onClick={() => {
                    setRoomPreferences({
                      minParticipants: 6,
                      maxParticipants: 6,
                      allowFlexible: false,
                      mode: 'balanced'
                    })
                    socket?.emit('find-room', { preferences: {
                      minParticipants: 6,
                      maxParticipants: 6,
                      allowFlexible: false,
                      mode: 'balanced'
                    }})
                  }}
                  className={`p-4 rounded-lg text-center ${
                    isDarkTheme 
                      ? 'bg-green-500/20 text-white hover:bg-green-500/30' 
                      : 'bg-green-500/10 text-black hover:bg-green-500/20'
                  }`}
                >
                  <div className="text-2xl mb-2">👥👥👥</div>
                  <div className="font-medium">3-on-3</div>
                  <div className="text-sm opacity-70">Triple team chat</div>
                </button>

                <button
                  onClick={() => {
                    setRoomPreferences({
                      minParticipants: 2,
                      maxParticipants: 8,
                      allowFlexible: true,
                      mode: 'mixed'
                    })
                    socket?.emit('find-room', { preferences: {
                      minParticipants: 2,
                      maxParticipants: 8,
                      allowFlexible: true,
                      mode: 'mixed'
                    }})
                  }}
                  className={`p-4 rounded-lg text-center ${
                    isDarkTheme 
                      ? 'bg-amber-500/20 text-white hover:bg-amber-500/30' 
                      : 'bg-amber-500/10 text-black hover:bg-amber-500/20'
                  }`}
                >
                  <div className="text-2xl mb-2">🎲</div>
                  <div className="font-medium">Random Mix</div>
                  <div className="text-sm opacity-70">Surprise group size</div>
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className={`flex-1 border-t ${
                    isDarkTheme ? 'border-white/10' : 'border-black/10'
                  }`}></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className={`px-2 ${
                    isDarkTheme ? 'bg-black text-white/60' : 'bg-white text-black/60'
                  }`}>or</span>
                </div>
              </div>

              {/* Custom Room Options */}
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${
                  isDarkTheme ? 'bg-gray-800/50' : 'bg-gray-100'
                }`}>
                  <h3 className={`font-medium mb-4 ${
                    isDarkTheme ? 'text-white' : 'text-black'
                  }`}>
                    Create Custom Room
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm mb-2 ${
                        isDarkTheme ? 'text-white/70' : 'text-black/70'
                      }`}>
                        Room Size
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={roomPreferences.minParticipants}
                          onChange={(e) => setRoomPreferences(prev => ({
                            ...prev,
                            minParticipants: parseInt(e.target.value)
                          }))}
                          className={`flex-1 px-3 py-2 rounded-lg ${
                            isDarkTheme 
                              ? 'bg-gray-900/50 text-white' 
                              : 'bg-white text-black'
                          }`}
                        >
                          <option value="2">2 people</option>
                          <option value="4">4 people</option>
                          <option value="6">6 people</option>
                          <option value="8">8 people</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="flexible"
                        checked={roomPreferences.allowFlexible}
                        onChange={(e) => setRoomPreferences(prev => ({
                          ...prev,
                          allowFlexible: e.target.checked
                        }))}
                        className="rounded border-gray-300"
                      />
                      <label 
                        htmlFor="flexible"
                        className={`text-sm ${
                          isDarkTheme ? 'text-white/70' : 'text-black/70'
                        }`}
                      >
                        Allow flexible matching if exact size unavailable
                      </label>
                    </div>

                    <button
                      onClick={() => {
                        socket?.emit('create-room', { preferences: roomPreferences })
                      }}
                      className={`w-full px-4 py-2 rounded-lg font-medium ${
                        isDarkTheme 
                          ? 'bg-blue-500/20 text-white hover:bg-blue-500/30' 
                          : 'bg-blue-500/10 text-black hover:bg-blue-500/20'
                      }`}
                    >
                      Create Room
                    </button>
                  </div>
                </div>

                <div className={`p-4 rounded-lg ${
                  isDarkTheme ? 'bg-gray-800/50' : 'bg-gray-100'
                }`}>
                  <h3 className={`font-medium mb-4 ${
                    isDarkTheme ? 'text-white' : 'text-black'
                  }`}>
                    Join Existing Room
                  </h3>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter Room ID"
                      className={`flex-1 px-4 py-2 rounded-lg ${
                        isDarkTheme 
                          ? 'bg-gray-900/50 text-white placeholder-white/50' 
                          : 'bg-white text-black placeholder-black/50'
                      }`}
                      onChange={(e) => setRoomId(e.target.value)}
                    />
                    <button
                      onClick={() => roomId && joinRoom(roomId)}
                      className={`px-4 py-2 rounded-lg ${
                        isDarkTheme 
                          ? 'bg-green-500/20 text-white hover:bg-green-500/30' 
                          : 'bg-green-500/10 text-black hover:bg-green-500/20'
                      }`}
                    >
                      Join
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Room UI
          <div className="flex h-full">
            {/* Video Grid */}
            <div className="flex-1 p-4">
              <div className={`grid gap-4 h-full ${
                layout === 'grid'
                  ? participants.size <= 1
                    ? 'grid-cols-1'
                    : participants.size <= 4
                    ? 'grid-cols-2'
                    : 'grid-cols-3'
                  : 'grid-cols-1'
              }`}>
                {/* Local Video */}
                <div className={`relative rounded-lg overflow-hidden ${
                  layout === 'spotlight' && spotlightParticipant !== socket?.id
                    ? 'col-span-1'
                    : 'col-span-2 row-span-2'
                }`}>
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                    <button
                      onClick={toggleMute}
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isDarkTheme ? 'bg-gray-900/90' : 'bg-gray-100/90'
                      }`}
                    >
                      {isMuted ? '🔇' : '🔊'}
                    </button>
                    <button
                      onClick={toggleCamera}
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isDarkTheme ? 'bg-gray-900/90' : 'bg-gray-100/90'
                      }`}
                    >
                      {isCameraOff ? '🎥' : '📷'}
                    </button>
                    <button
                      onClick={toggleScreenShare}
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isDarkTheme ? 'bg-gray-900/90' : 'bg-gray-100/90'
                      }`}
                    >
                      {isScreenSharing ? '🖥️' : '💻'}
                    </button>
                  </div>
                </div>

                {/* Participant Videos */}
                {Array.from(participants.entries()).map(([id, participant]) => (
                  <div
                    key={id}
                    className={`relative rounded-lg overflow-hidden ${
                      layout === 'spotlight' && spotlightParticipant === id
                        ? 'col-span-2 row-span-2'
                        : 'col-span-1'
                    }`}
                    onClick={() => setParticipantSpotlight(id)}
                  >
                    <video
                      ref={el => {
                        if (el) participantVideoRefs.current.set(id, el)
                        else participantVideoRefs.current.delete(id)
                      }}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    {participant.isMuted && (
                      <div className="absolute top-2 left-2 bg-red-500/20 rounded-full p-1">
                        🔇
                      </div>
                    )}
                    {participant.isCameraOff && (
                      <div className="absolute top-2 right-2 bg-red-500/20 rounded-full p-1">
                        🎥
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Sidebar */}
            {isChatOpen && (
              <div className={`w-80 border-l ${
                isDarkTheme ? 'border-gray-800' : 'border-gray-200'
              }`}>
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b border-gray-800">
                    <h2 className={`text-lg font-medium ${
                      isDarkTheme ? 'text-white' : 'text-black'
                    }`}>
                      Chat
                    </h2>
                  </div>
                  
                  {/* Messages */}
                  <div 
                    ref={chatContainerRef}
                    className="flex-1 overflow-y-auto p-4 space-y-4"
                  >
                    {messages.map(message => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === socket?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] rounded-lg px-3 py-2 ${
                          message.sender === socket?.id
                            ? isDarkTheme 
                              ? 'bg-blue-500/20 text-white' 
                              : 'bg-blue-500/20 text-black'
                            : isDarkTheme 
                              ? 'bg-gray-800/50 text-white' 
                              : 'bg-gray-200 text-black'
                        }`}>
                          {message.senderName && (
                            <p className="text-xs opacity-70 mb-1">{message.senderName}</p>
                          )}
                          <p className="text-sm break-words">{message.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Chat Input */}
                  <div className="p-4 border-t border-gray-800">
                    <form onSubmit={handleSendMessage}>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type a message..."
                          className={`flex-1 px-3 py-2 rounded-lg ${
                            isDarkTheme 
                              ? 'bg-gray-800/50 text-white placeholder-white/50' 
                              : 'bg-gray-200/50 text-black placeholder-black/50'
                          }`}
                        />
                        <button
                          type="submit"
                          disabled={!newMessage.trim()}
                          className={`px-4 rounded-lg ${
                            isDarkTheme 
                              ? 'bg-blue-500/20 text-white hover:bg-blue-500/30 disabled:opacity-50' 
                              : 'bg-blue-500/10 text-black hover:bg-blue-500/20 disabled:opacity-50'
                          }`}
                        >
                          Send
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Room Controls */}
      {roomId && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
          <button
            onClick={toggleLayout}
            className={`px-4 py-2 rounded-lg ${
              isDarkTheme 
                ? 'bg-gray-800/50 text-white hover:bg-gray-800/70' 
                : 'bg-gray-200/50 text-black hover:bg-gray-200/70'
            }`}
          >
            {layout === 'grid' ? 'Switch to Spotlight' : 'Switch to Grid'}
          </button>
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`px-4 py-2 rounded-lg ${
              isDarkTheme 
                ? 'bg-gray-800/50 text-white hover:bg-gray-800/70' 
                : 'bg-gray-200/50 text-black hover:bg-gray-200/70'
            }`}
          >
            {isChatOpen ? 'Hide Chat' : 'Show Chat'}
          </button>
          <button
            onClick={handleLeaveRoom}
            className={`px-4 py-2 rounded-lg ${
              isDarkTheme 
                ? 'bg-red-500/20 text-white hover:bg-red-500/30' 
                : 'bg-red-500/10 text-black hover:bg-red-500/20'
            }`}
          >
            Leave Room
          </button>
        </div>
      )}

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={closeReportModal}
        onSubmit={handleReport}
        reportedUserId={undefined}
      />
    </div>
  )
} 