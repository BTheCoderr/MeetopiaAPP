'use client'
import { useState, useRef, useEffect } from 'react'
import ChatLayout from '@/components/ChatLayout'
import { io, Socket } from 'socket.io-client'

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
  const socketRef = useRef<Socket>()

  useEffect(() => {
    // Initialize socket connection
    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3003'
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true
    })

    const socket = socketRef.current

    socket.on('connect', () => {
      console.log('Connected to server')
      setIsConnected(true)
    })

    socket.on('disconnect', () => {
      console.log('Disconnected from server')
      setIsConnected(false)
      setIsWaiting(false)
    })

    // Clean up socket connection
    return () => {
      socket.disconnect()
    }
  }, [])

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
    if (!socketRef.current) return
    setIsWaiting(true)
    socketRef.current.emit('find-video-user')
  }

  const handleNext = () => {
    if (!socketRef.current) return
    setIsWaiting(true)
    socketRef.current.emit('find-video-user')
  }

  const handleLeave = () => {
    if (socketRef.current) {
      socketRef.current.emit('leave-video')
      socketRef.current.disconnect()
    }
    window.location.href = '/'
  }

  const handleSendMessage = () => {
    if (!messageInput.trim() || !socketRef.current) return
    
    const newMessage: Message = {
      id: Date.now().toString(),
      text: messageInput,
      isSelf: true,
      status: isConnected ? 'sending' : 'queued',
      timestamp: Date.now()
    }

    if (isConnected) {
      socketRef.current.emit('chat-message', { 
        message: messageInput, 
        to: socketRef.current.id,
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
    if (!socketRef.current) return

    const socket = socketRef.current
    let peerConnection: RTCPeerConnection | null = null

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
      // Create new RTCPeerConnection
      const configuration = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' }
        ]
      }
      peerConnection = new RTCPeerConnection(configuration)

      // Add local stream
      if (localVideoRef.current?.srcObject) {
        const stream = localVideoRef.current.srcObject as MediaStream
        stream.getTracks().forEach(track => {
          if (localVideoRef.current?.srcObject) {
            peerConnection?.addTrack(track, localVideoRef.current.srcObject as MediaStream)
          }
        })
      }

      // Handle incoming stream
      peerConnection.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0]
        }
      }

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('video-ice-candidate', {
            candidate: event.candidate,
            to: partnerId
          })
        }
      }

      // Create and send offer
      try {
        const offer = await peerConnection.createOffer()
        await peerConnection.setLocalDescription(offer)
        socket.emit('video-offer', {
          offer,
          to: partnerId
        })
      } catch (err) {
        console.error('Error creating offer:', err)
      }

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

    // Handle incoming video offer
    socket.on('video-offer-received', async ({ offer, from }) => {
      const configuration = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' }
        ]
      }
      peerConnection = new RTCPeerConnection(configuration)

      // Add local stream
      if (localVideoRef.current?.srcObject) {
        const stream = localVideoRef.current.srcObject as MediaStream
        stream.getTracks().forEach(track => {
          if (localVideoRef.current?.srcObject) {
            peerConnection?.addTrack(track, localVideoRef.current.srcObject as MediaStream)
          }
        })
      }

      // Handle incoming stream
      peerConnection.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0]
        }
      }

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('video-ice-candidate', {
            candidate: event.candidate,
            to: from
          })
        }
      }

      // Set remote description and create answer
      try {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
        const answer = await peerConnection.createAnswer()
        await peerConnection.setLocalDescription(answer)
        socket.emit('video-answer', {
          answer,
          to: from
        })
      } catch (err) {
        console.error('Error creating answer:', err)
      }
    })

    // Handle incoming answer
    socket.on('video-answer-received', async ({ answer, from }) => {
      try {
        if (peerConnection) {
          await peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
        }
      } catch (err) {
        console.error('Error setting remote description:', err)
      }
    })

    // Handle incoming ICE candidate
    socket.on('video-ice-candidate', async ({ candidate, from }) => {
      try {
        if (peerConnection) {
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
        }
      } catch (err) {
        console.error('Error adding ICE candidate:', err)
      }
    })

    return () => {
      socket.off('chat-message')
      socket.off('message-delivered')
      socket.off('video-user-found')
      socket.off('video-offer-received')
      socket.off('video-answer-received')
      socket.off('video-ice-candidate')
      if (peerConnection) {
        peerConnection.close()
      }
    }
  }, [messageQueue])

  return (
    <ChatLayout
      title="Combined Chat"
      icon="🤝"
      onStart={handleStart}
      onNext={handleNext}
      onLeave={handleLeave}
      isConnected={isConnected}
      isWaiting={isWaiting}
      showControls={true}
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
                {isWaiting ? 'Waiting for meeter...' : 'Start chat!'}
              </div>
            )}
          </div>
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