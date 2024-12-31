'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { io, Socket } from 'socket.io-client'
import ChatMenu from '@/components/ChatMenu'
import ReportModal from '@/components/ReportModal'
import { useReporting } from '@/hooks/useReporting'

let socket: Socket | null = null

export default function TextChatPage() {
  const [isSocketConnected, setIsSocketConnected] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [currentPeer, setCurrentPeer] = useState<string | null>(null)
  const [messages, setMessages] = useState<Array<{text: string, isSelf: boolean}>>([])
  const [messageInput, setMessageInput] = useState('')
  const {
    isReportModalOpen,
    handleReport,
    openReportModal,
    closeReportModal
  } = useReporting()

  // Socket setup
  useEffect(() => {
    if (socket) {
      console.log('Socket already exists, skipping setup')
      return
    }

    console.log('Setting up socket connection...')
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000
    })

    socket = newSocket
    
    socket.on('connect', () => {
      console.log('Socket connected')
      setIsSocketConnected(true)
    })

    socket.on('disconnect', () => {
      console.log('Socket disconnected')
      setIsSocketConnected(false)
    })

    socket.on('user-found', ({ partnerId }) => {
      console.log('Found peer:', partnerId)
      setCurrentPeer(partnerId)
      setIsSearching(false)
    })

    socket.on('chat-message', ({ message, from }) => {
      console.log('Received message:', message, 'from:', from)
      setMessages(prev => [...prev, { text: message, isSelf: false }])
    })

    socket.on('peer-left', () => {
      console.log('Peer left')
      setCurrentPeer(null)
      setIsSearching(false)
    })

    return () => {
      if (socket) {
        console.log('Cleaning up socket connection')
        socket.disconnect()
        socket = null
      }
    }
  }, [])

  const handleStartChat = () => {
    if (!socket?.connected) {
      console.error('Socket not connected')
      return
    }
    
    setIsSearching(true)
    socket.emit('find-next-user')
    console.log('Looking for users...')
  }

  const handleNextPerson = () => {
    setCurrentPeer(null)
    setMessages([])
    
    if (currentPeer) {
      socket?.emit('leave-chat')
    }

    setTimeout(() => {
      setIsSearching(true)
      socket?.emit('find-next-user')
    }, 1000)
  }

  const handleLeaveChat = () => {
    setCurrentPeer(null)
    setMessages([])
    setIsSearching(false)
    
    if (currentPeer) {
      socket?.emit('leave-chat')
    }
    window.location.href = '/'
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageInput.trim() || !currentPeer) return

    setMessages(prev => [...prev, { text: messageInput, isSelf: true }])
    socket?.emit('chat-message', { message: messageInput, to: currentPeer })
    setMessageInput('')
  }

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      {/* Header with Menu, Logo, and Connection Status */}
      <div className="flex flex-col gap-4 mb-4 md:mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4">
            <ChatMenu onLeaveChat={handleLeaveChat} />
            <h1 className="text-xl md:text-2xl font-bold">
              <span className="text-blue-500">Meet</span>
              <span className="text-gray-700">opia</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {isSocketConnected ? 'Connected' : 'Disconnected'}
            </span>
            <div className={`w-2 h-2 rounded-full ${isSocketConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          </div>
        </div>

        {/* Centered control buttons */}
        <div className="flex justify-center gap-2 mb-4">
          <button 
            onClick={handleStartChat}
            disabled={!isSocketConnected || isSearching}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              !isSocketConnected || isSearching
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {isSearching ? '🔄 Searching' : '▶️ START'}
          </button>
          <button 
            onClick={handleNextPerson}
            disabled={!currentPeer || isSearching}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              !currentPeer || isSearching
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            ⏭️ NEXT
          </button>
          <button 
            onClick={handleLeaveChat}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium"
          >
            ⏹️ LEAVE
          </button>
          <button
            onClick={() => openReportModal(currentPeer || '')}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-yellow-500 hover:bg-yellow-600 text-white"
          >
            ⚠️ Report
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto">
        {/* Chat Section */}
        <div className="border rounded-lg shadow-sm bg-white">
          <div className="text-center p-2 border-b border-gray-100">
            <h2 className="text-lg font-medium">💬 Text Chat</h2>
          </div>
          
          <div className="h-[400px] md:h-[500px] p-4 flex flex-col">
            {currentPeer ? (
              <div className="flex-1 overflow-y-auto space-y-2">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.isSelf ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`p-3 rounded-lg max-w-[80%] ${
                        msg.isSelf
                          ? 'bg-blue-500 text-white rounded-tr-none'
                          : 'bg-gray-100 text-gray-800 rounded-tl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500 text-lg">
                {isSearching ? 'Looking for someone to chat with...' : 'Click START to begin chatting'}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-100">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder={currentPeer ? "Type a message..." : "Wait for connection to chat..."}
                disabled={!currentPeer}
                className={`flex-1 p-3 rounded-full border ${
                  currentPeer 
                    ? 'border-gray-300 focus:outline-none focus:border-blue-400' 
                    : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                }`}
              />
              <button
                type="submit"
                disabled={!currentPeer}
                className={`px-6 py-3 rounded-full ${
                  currentPeer
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                }`}
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Add report modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={closeReportModal}
        onSubmit={handleReport}
        reportedUserId={currentPeer || undefined}
      />
    </div>
  )
} 