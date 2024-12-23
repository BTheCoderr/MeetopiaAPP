'use client'
import { useState, useEffect } from 'react'
import { io, Socket } from 'socket.io-client'
import ChatLayout from '@/components/ChatLayout'

interface Message {
  id: string;
  text: string;
  isSelf: boolean;
  status: 'sending' | 'sent' | 'delivered' | 'failed';
  timestamp: number;
}

let socket: Socket | null = null

export default function TextChatPage() {
  const [isConnected, setIsConnected] = useState(false)
  const [isWaiting, setIsWaiting] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageInput, setMessageInput] = useState('')

  useEffect(() => {
    if (!hasStarted) return // Don't connect until user starts chat

    const socketUrl = 'https://meetopia-signaling.onrender.com'

    socket = io(socketUrl, {
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000
    })

    socket.on('connect', () => {
      console.log('Socket connected:', socket?.id)
      socket?.emit('find-next-user')
      setIsWaiting(true)
    })

    socket.on('user-found', ({ partnerId }) => {
      console.log('User found:', partnerId)
      setIsConnected(true)
      setIsWaiting(false)
    })

    socket.on('chat-message', ({ message, from, messageId }) => {
      if (!hasStarted) return // Ignore messages if chat hasn't started
      
      setMessages(prev => [...prev, {
        id: messageId || Date.now().toString(),
        text: message,
        isSelf: false,
        status: 'delivered',
        timestamp: Date.now()
      }])
    })

    socket.on('message-delivered', ({ messageId }) => {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, status: 'delivered' }
          : msg
      ))
    })

    socket.on('partner-left', () => {
      setIsConnected(false)
      setIsWaiting(false)
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: 'Your chat partner has left.',
        isSelf: false,
        status: 'delivered',
        timestamp: Date.now()
      }])
    })

    socket.on('partner-next', () => {
      setIsConnected(false)
      setIsWaiting(true)
      setMessages([])
      socket?.emit('find-next-user')
    })

    return () => {
      if (socket) {
        socket.disconnect()
        socket = null
      }
    }
  }, [hasStarted]) // Only run when hasStarted changes

  const handleStart = () => {
    setHasStarted(true)
    setIsWaiting(true)
  }

  const handleNext = () => {
    setMessages([])
    setIsConnected(false)
    setIsWaiting(true)
    socket?.emit('find-next-user')
  }

  const handleLeave = () => {
    if (socket) {
      socket.emit('leave-chat')
      socket.disconnect()
      socket = null
    }
    window.location.href = '/'
  }

  const handleSendMessage = () => {
    if (!messageInput.trim() || !isConnected || !hasStarted) return

    const newMessage: Message = {
      id: Date.now().toString(),
      text: messageInput,
      isSelf: true,
      status: 'sending',
      timestamp: Date.now()
    }

    socket?.emit('chat-message', {
      message: messageInput,
      to: socket.id,
      messageId: newMessage.id
    })

    setMessages(prev => [...prev, newMessage])
    setMessageInput('')
  }

  return (
    <ChatLayout
      title="Text Chat"
      icon="💬"
      onStart={handleStart}
      onNext={handleNext}
      onLeave={handleLeave}
    >
      <div className="h-[600px] p-4 flex flex-col">
        {!hasStarted ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-4">Ready to Chat?</h2>
              <p className="text-gray-600 mb-6">Click Start to begin chatting with someone new!</p>
              <button
                onClick={handleStart}
                className="px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
              >
                Start Chatting
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isSelf ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="flex flex-col">
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        msg.isSelf
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {msg.text}
                    </div>
                    {msg.isSelf && (
                      <div className="text-xs text-gray-500 mt-1 text-right">
                        {msg.status === 'sending' && '⌛ Sending...'}
                        {msg.status === 'sent' && '✓ Sent'}
                        {msg.status === 'delivered' && '✓✓ Delivered'}
                        {msg.status === 'failed' && '❌ Failed'}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {messages.length === 0 && (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  {isWaiting ? 'Waiting for partner...' : 'Start chatting!'}
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="mt-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={isConnected ? "Type a message..." : "Waiting for connection..."}
                  disabled={!isConnected}
                  className="flex-1 p-3 rounded-full border border-gray-300 focus:outline-none focus:border-blue-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!isConnected}
                  className="px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </ChatLayout>
  )
} 