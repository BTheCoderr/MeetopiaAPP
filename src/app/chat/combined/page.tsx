'use client'
import { useState, useRef, useEffect } from 'react'
import ChatLayout from '@/components/ChatLayout'

interface Message {
  id: string;
  text: string;
  isSelf: boolean;
  status: 'sending' | 'sent' | 'delivered' | 'failed' | 'queued';
  timestamp: number;
}

export default function CombinedChatPage() {
  const [isConnected, setIsConnected] = useState(false)
  const [isWaiting, setIsWaiting] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageInput, setMessageInput] = useState('')
  const [messageQueue, setMessageQueue] = useState<Message[]>([])
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    // Initialize local video stream
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
        }
      })
      .catch((err) => {
        console.error('Error accessing media devices:', err)
      })

    return () => {
      // Cleanup video streams
      if (localVideoRef.current?.srcObject) {
        const tracks = (localVideoRef.current.srcObject as MediaStream).getTracks()
        tracks.forEach(track => track.stop())
      }
      if (remoteVideoRef.current?.srcObject) {
        const tracks = (remoteVideoRef.current.srcObject as MediaStream).getTracks()
        tracks.forEach(track => track.stop())
      }
    }
  }, [])

  const handleStart = () => {
    setIsWaiting(true)
    // Add WebRTC and socket connection logic here
  }

  const handleNext = () => {
    // Add next person logic here
  }

  const handleLeave = () => {
    // Add leave chat logic here
    window.location.href = '/'
  }

  const handleSendMessage = () => {
    if (!messageInput.trim()) return
    
    const newMessage: Message = {
      id: Date.now().toString(),
      text: messageInput,
      isSelf: true,
      status: isConnected ? 'sending' : 'queued',
      timestamp: Date.now()
    }

    if (isConnected) {
      socket?.emit('chat-message', { 
        message: messageInput, 
        to: socket.id,
        messageId: newMessage.id 
      })
      setMessages(prev => [...prev, newMessage])
    } else {
      // Queue message if not connected
      setMessageQueue(prev => [...prev, newMessage])
      setMessages(prev => [...prev, { ...newMessage, status: 'queued' }])
    }
    
    setMessageInput('')
  }

  useEffect(() => {
    // ... existing socket setup ...

    socket.on('chat-message', ({ message, from }) => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
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

    socket.on('video-user-found', async ({ partnerId }) => {
      // ... existing connection logic ...
      
      // Send queued messages
      messageQueue.forEach(msg => {
        socket?.emit('chat-message', {
          message: msg.text,
          to: partnerId,
          messageId: msg.id
        })
      })
      setMessageQueue([])
      
      // Update queued messages status
      setMessages(prev => prev.map(msg => 
        msg.status === 'queued'
          ? { ...msg, status: 'sending' }
          : msg
      ))
    })
  }, [messageQueue]) // Add messageQueue to dependencies

  return (
    <ChatLayout
      title="Combined Chat"
      icon="🤝"
      onStart={handleStart}
      onNext={handleNext}
      onLeave={handleLeave}
      isConnected={isConnected}
      isWaiting={isWaiting}
    >
      <div className="h-[600px] p-4 flex flex-col">
        {/* Video Area */}
        <div className="grid grid-cols-2 gap-4 h-[300px]">
          {/* Local Video */}
          <div className="relative">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover rounded-lg bg-gray-900"
            />
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
              You
            </div>
          </div>

          {/* Remote Video */}
          <div className="relative">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover rounded-lg bg-gray-900"
            />
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
              Partner
            </div>
            {!isConnected && (
              <div className="absolute inset-0 flex items-center justify-center text-white bg-gray-900 bg-opacity-75 rounded-lg">
                {isWaiting ? 'Waiting for partner...' : 'Start chat!'}
              </div>
            )}
          </div>
        </div>

        {/* Video Controls */}
        <div className="mt-4 flex justify-center gap-4">
          <button className="p-3 bg-gray-200 rounded-full hover:bg-gray-300">
            🎤
          </button>
          <button className="p-3 bg-gray-200 rounded-full hover:bg-gray-300">
            📷
          </button>
        </div>

        {/* Chat Area */}
        <div className="mt-4 flex-1 flex flex-col">
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
                      {msg.status === 'queued' && '⏳ Queued'}
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
                placeholder={isConnected ? "Type a message..." : "Type a message (will be sent when connected)"}
                className="flex-1 p-3 rounded-full border border-gray-300 focus:outline-none focus:border-blue-400"
              />
              <button
                onClick={handleSendMessage}
                className="px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
              >
                Send {messageQueue.length > 0 && `(${messageQueue.length})`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ChatLayout>
  )
} 