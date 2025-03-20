'use client'
import React, { useState, useRef, useEffect } from 'react'
import { io, Socket } from 'socket.io-client'

interface Message {
  id: string
  text: string
  sender: 'me' | 'peer'
  timestamp: Date
}

interface TextChatProps {
  roomId: string
  peerId: string | null
}

const TextChat: React.FC<TextChatProps> = ({ roomId, peerId }) => {
  // State for messages and input
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [peerIsTyping, setPeerIsTyping] = useState(false)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Connect to socket server
  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3003'
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    })
    
    newSocket.on('connect', () => {
      setIsConnected(true)
      // Join the chat room
      newSocket.emit('join-chat-room', { roomId })
    })
    
    newSocket.on('connect_error', () => {
      setIsConnected(false)
    })
    
    newSocket.on('chat-message', (data: { id: string, text: string, sender: string, timestamp: string }) => {
      const newMessage: Message = {
        id: data.id,
        text: data.text,
        sender: data.sender === socket?.id ? 'me' : 'peer',
        timestamp: new Date(data.timestamp)
      }
      
      setMessages(prev => [...prev, newMessage])
      setPeerIsTyping(false)
    })
    
    newSocket.on('typing-start', () => {
      setPeerIsTyping(true)
    })
    
    newSocket.on('typing-end', () => {
      setPeerIsTyping(false)
    })
    
    setSocket(newSocket)
    
    return () => {
      newSocket.disconnect()
    }
  }, [roomId])
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  
  // Handle typing indicator
  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true)
      socket?.emit('typing-start', { roomId })
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    
    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      socket?.emit('typing-end', { roomId })
    }, 2000)
  }
  
  // Send a message
  const sendMessage = () => {
    if (!inputText.trim() || !socket || !isConnected || !peerId) return
    
    const messageId = Date.now().toString()
    const timestamp = new Date()
    
    // Add to local messages
    const newMessage: Message = {
      id: messageId,
      text: inputText,
      sender: 'me',
      timestamp
    }
    
    setMessages(prev => [...prev, newMessage])
    
    // Send to server
    socket.emit('send-message', {
      id: messageId,
      text: inputText,
      roomId,
      peerId,
      timestamp: timestamp.toISOString()
    })
    
    // Clear input
    setInputText('')
    
    // Clear typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    setIsTyping(false)
    socket.emit('typing-end', { roomId })
  }
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage()
  }
  
  // Format timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  return (
    <div className="flex flex-col h-full bg-gray-100 rounded-lg overflow-hidden">
      {/* Chat header */}
      <div className="bg-white p-4 shadow-sm">
        <div className="flex items-center">
          <div className="flex-1">
            <h3 className="font-medium">Text Chat</h3>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${isConnected && peerId ? 'bg-green-500' : 'bg-red-500'}`}></span>
              {isConnected && peerId ? 'Connected' : 'Disconnected'}
            </div>
          </div>
        </div>
      </div>
      
      {/* Messages container */}
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-gray-500 text-center">
            <div>
              <p>No messages yet</p>
              <p className="text-xs mt-1">Send a message to start the conversation</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-lg px-4 py-2 ${
                    message.sender === 'me'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-800'
                  }`}
                >
                  <div>{message.text}</div>
                  <div className={`text-xs mt-1 ${
                    message.sender === 'me' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            {peerIsTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-500 rounded-lg px-4 py-2 text-sm">
                  Typing...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Input area */}
      <form onSubmit={handleSubmit} className="bg-white p-3 shadow-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleTyping}
            placeholder="Type a message..."
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={!isConnected || !peerId}
          />
          <button
            type="submit"
            disabled={!isConnected || !peerId || !inputText.trim()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 rounded-lg transition-colors disabled:bg-gray-300"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  )
}

export default TextChat 