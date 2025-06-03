'use client'
import { useState, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useReporting } from '@/hooks/useReporting'
import ReportModal from '@/components/ReportModal'

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'peer';
  timestamp: number;
}

export default function TextChatPage() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isSocketConnected, setIsSocketConnected] = useState(false)
  const [currentPeer, setCurrentPeer] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [buttonCooldown, setButtonCooldown] = useState(false)
  const [isDarkTheme, setIsDarkTheme] = useState(true)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isPeerConnected, setIsPeerConnected] = useState(false)

  const chatContainerRef = useRef<HTMLDivElement>(null)

  const {
    isReportModalOpen,
    handleReport,
    openReportModal,
    closeReportModal
  } = useReporting()

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
    })

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected')
      setIsSocketConnected(false)
      setCurrentPeer(null)
      setIsSearching(false)
    })

    newSocket.on('user-found', ({ partnerId }) => {
      console.log('Found peer:', partnerId)
      setCurrentPeer(partnerId)
      setIsSearching(false)
      setIsPeerConnected(true)
      setMessages([])
    })

    newSocket.on('chat-message', (data: { id: string; text: string; from: string; timestamp: number }) => {
      if (data.from === newSocket.id) return
      
      setMessages(prev => {
        if (prev.some(msg => msg.id === data.id)) return prev
        
        return [...prev, {
          id: data.id || `${data.from}-${data.timestamp}`,
          text: data.text,
          sender: 'peer',
          timestamp: data.timestamp || Date.now()
        }]
      })
    })

    newSocket.on('peer-left', () => {
      console.log('Peer left')
      setCurrentPeer(null)
      setIsPeerConnected(false)
      setIsSearching(false)
    })

    return () => {
      newSocket.disconnect()
    }
  }, [])

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

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  const startCooldown = () => {
    setButtonCooldown(true)
    setTimeout(() => setButtonCooldown(false), 5000)
  }

  const handleStartChat = () => {
    if (!socket?.connected || buttonCooldown) return
    setIsSearching(true)
    socket.emit('find-user')
    startCooldown()
  }

  const handleNextPerson = () => {
    if (!socket?.connected || buttonCooldown) return
    setIsSearching(true)
    socket.emit('find-next-user')
    startCooldown()
  }

  const handleLeaveChat = () => {
    if (!socket?.connected) return
    socket.emit('leave-chat')
    setCurrentPeer(null)
    setIsSearching(false)
    window.location.href = '/'
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

      {/* Action Buttons Bar */}
      <div className="absolute top-20 left-0 right-0 z-10">
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

      {/* Main Content Area */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {!currentPeer && !isSearching && (
          <p className={`text-lg mb-4 ${isDarkTheme ? 'text-white/80' : 'text-black/80'}`}>
            Ready for your Meetopia adventure? Click "Make a Connection" to begin!
          </p>
        )}
        {isSearching && (
          <p className={`text-lg mb-4 ${isDarkTheme ? 'text-white/80' : 'text-black/80'}`}>
            Looking for someone to chat with...
          </p>
        )}
      </div>

      {/* Chat Interface */}
      <div className="fixed inset-x-0 bottom-0 max-h-[70vh]">
        <div className="mx-auto max-w-3xl p-4">
          {/* Chat Messages */}
          <div 
            ref={chatContainerRef}
            className="space-y-2 overflow-y-auto max-h-[60vh] scrollbar-thin scrollbar-thumb-gray-800/20 scrollbar-track-transparent mb-4"
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

          {/* Chat Input */}
          <form onSubmit={handleSendMessage}>
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
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={closeReportModal}
        onSubmit={handleReport}
        reportedUserId={currentPeer || undefined}
      />
    </div>
  )
} 