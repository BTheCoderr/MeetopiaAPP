'use client'
import React, { useRef, useState, useEffect } from 'react'
import { WebRTCService } from '@/lib/services/webRTCService'
import { ChatLayout } from './ChatLayout'
import { useUser } from '@/context/UserContext';

export const CombinedChat = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [messages, setMessages] = useState<Array<{text: string, sender: 'me' | 'them'}>>([])
  const [newMessage, setNewMessage] = useState('')
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const { user, removeCoins } = useUser();

  useEffect(() => {
    const initCamera = async () => {
      try {
        const webRTC = new WebRTCService()
        const mediaStream = await webRTC.startLocalStream()
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = mediaStream
          setStream(mediaStream)
          setIsConnected(true)
        }
      } catch (error) {
        console.error('Failed to start video stream:', error)
      }
    }

    initCamera()
    return () => {
      stream?.getTracks().forEach(track => track.stop())
    }
  }, [])

  const handleSendMessage = () => {
    // Check if user has enough coins
    if (user?.coins && user.coins >= 1) {
      removeCoins(1); // Cost per message
      // Send message logic
    } else {
      alert('Not enough coins! Please purchase more.');
    }
  };

  return (
    <ChatLayout>
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <div className="grid grid-cols-2 gap-6 h-[70vh]">
            {/* Your Video */}
            <div className="bg-card-bg rounded-xl overflow-hidden w-full h-full relative">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 text-card-text text-sm bg-card-bg/75 px-3 py-1 rounded-full">
                You
              </div>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                <button 
                  onClick={() => {
                    stream?.getAudioTracks().forEach(track => {
                      track.enabled = !track.enabled
                    })
                    setIsMuted(!isMuted)
                  }}
                  className="bg-white/10 backdrop-blur p-3 rounded-full hover:bg-white/20 transition-colors"
                >
                  {isMuted ? '🔇' : '🎤'}
                </button>
                <button 
                  onClick={() => {
                    stream?.getVideoTracks().forEach(track => {
                      track.enabled = !track.enabled
                    })
                    setIsVideoOff(!isVideoOff)
                  }}
                  className="bg-white/10 backdrop-blur p-3 rounded-full hover:bg-white/20 transition-colors"
                >
                  {isVideoOff ? '🚫' : '📹'}
                </button>
                <button 
                  onClick={() => console.log('Skip to next person')}
                  className="bg-white/10 backdrop-blur p-3 rounded-full hover:bg-white/20 transition-colors"
                  disabled={!isConnected}
                >
                  ⏭️
                </button>
              </div>
            </div>

            {/* Partner Video */}
            <div className="bg-card-bg rounded-xl overflow-hidden w-full h-full relative flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700">
              <div className="absolute top-4 left-4 text-card-text text-sm bg-card-bg/75 px-3 py-1 rounded-full">
                Partner
              </div>
              <div className="text-center">
                <p className="text-card-text/70 text-lg font-medium">
                  Waiting for partner...
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Section */}
        <div className="bg-card-bg text-card-text rounded-xl shadow-lg overflow-hidden h-[70vh]">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold">Chat</h2>
          </div>
          
          <div className="h-[calc(70vh-80px)] flex flex-col">
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] rounded-lg p-3 ${
                    msg.sender === 'me' ? 'bg-blue-500 text-white' : 'bg-gray-100'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t mt-auto">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newMessage.trim()) {
                      setMessages(prev => [...prev, { text: newMessage, sender: 'me' }])
                      setNewMessage('')
                    }
                  }}
                  className="flex-1 px-4 py-2 border rounded-full"
                  placeholder="Type a message..."
                />
                <button 
                  onClick={() => {
                    if (newMessage.trim()) {
                      setMessages(prev => [...prev, { text: newMessage, sender: 'me' }])
                      setNewMessage('')
                    }
                  }}
                  className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Controls - Centered */}
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex justify-center gap-4">
          <button 
            className="px-8 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors shadow-lg"
            disabled={!isConnected}
          >
            NEXT PERSON
          </button>
          <button className="px-8 py-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg">
            LEAVE CHAT
          </button>
        </div>
      </div>
    </ChatLayout>
  )
} 