import React, { useEffect, useState } from 'react'
import { VideoControls } from './VideoControls'
import { ConnectionStatus } from './ConnectionStatus'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { ChatMessage } from '../Chat/ChatMessage'
import { ProfileCard } from '../Profile/ProfileCard'

interface VideoChatRoomProps {
  onLeave?: () => void
  onNext?: () => void
  isDarkMode?: boolean
}

export const VideoChatRoom: React.FC<VideoChatRoomProps> = ({
  onLeave,
  onNext,
  isDarkMode = false
}) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')
  const [messages, setMessages] = useState<Array<{
    message: string;
    sender: 'me' | 'them';
    timestamp: Date;
  }>>([])
  const [showProfile, setShowProfile] = useState(false)

  useEffect(() => {
    initializeMedia()
  }, [])

  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      setLocalStream(stream)
      setStatus('connected')
    } catch (err) {
      setError('Could not access camera or microphone')
      setStatus('disconnected')
    } finally {
      setIsLoading(false)
    }
  }

  const theme = isDarkMode ? 'dark' : ''

  if (isLoading) return <LoadingSpinner />

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} p-2 sm:p-4 ${theme}`}>
      <div className="max-w-7xl mx-auto space-y-2 sm:space-y-4">
        {/* Status Bar */}
        <div className={`flex justify-between items-center px-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-blue-600">MEETOPIA</h1>
            <span className="text-sm px-2 py-1 bg-blue-100 text-blue-600 rounded-full">
              Beta
            </span>
          </div>
          <ConnectionStatus status={status} />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-12 gap-4">
          {/* Video Grid */}
          <div className="col-span-9">
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              {/* Local Video */}
              <div>
                <div className={`aspect-video rounded-lg relative overflow-hidden shadow-lg 
                  ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  {localStream && (
                    <video
                      autoPlay
                      muted
                      playsInline
                      ref={video => {
                        if (video) video.srcObject = localStream
                      }}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="mt-2 text-center font-medium">
                  You
                </div>
              </div>

              {/* Remote Video */}
              <div>
                <div className={`aspect-video rounded-lg relative overflow-hidden shadow-lg
                  ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <div className="flex items-center justify-center h-full">
                    Waiting for partner...
                  </div>
                </div>
                <div className="mt-2 text-center font-medium">
                  Partner
                </div>
              </div>
            </div>
          </div>

          {/* Chat Sidebar */}
          <div className={`col-span-3 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4 flex flex-col h-[70vh]`}>
            {showProfile ? (
              // Profile View
              <div className="h-full">
                <button 
                  onClick={() => setShowProfile(false)}
                  className="mb-4 text-blue-500 hover:text-blue-600"
                >
                  ← BACK TO CHAT
                </button>
                <ProfileCard 
                  name="John Doe"
                  age={25}
                  interests={['Music', 'Travel', 'Photography']}
                  onReport={() => alert('Reported')}
                  onBlock={() => alert('Blocked')}
                />
              </div>
            ) : (
              // Chat View
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>CHAT</h2>
                  <button 
                    onClick={() => setShowProfile(true)}
                    className="text-blue-500 hover:text-blue-600"
                  >
                    VIEW PROFILE
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {messages.map((msg, idx) => (
                    <ChatMessage
                      key={idx}
                      message={msg.message}
                      sender={msg.sender}
                      timestamp={msg.timestamp}
                    />
                  ))}
                </div>

                {/* Message Input */}
                <div className="mt-auto">
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault()
                      const input = e.currentTarget.elements.namedItem('message') as HTMLInputElement
                      if (input.value.trim()) {
                        setMessages(prev => [...prev, {
                          message: input.value,
                          sender: 'me',
                          timestamp: new Date()
                        }])
                        input.value = ''
                      }
                    }}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      name="message"
                      placeholder="TYPE A MESSAGE..."
                      className={`flex-1 rounded-full px-4 py-2 ${
                        isDarkMode 
                          ? 'bg-gray-700 text-white placeholder:text-gray-400' 
                          : 'bg-gray-100 text-gray-800 placeholder:text-gray-500'
                      }`}
                    />
                    <button 
                      type="submit"
                      className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                    >
                      SEND
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="flex justify-center space-x-3">
          <button
            onClick={onNext}
            className="px-4 py-1.5 text-sm bg-blue-500 text-white rounded-full hover:bg-blue-600 transition shadow-md"
          >
            NEXT PERSON
          </button>
          <button
            onClick={onLeave}
            className="px-4 py-1.5 text-sm bg-red-500 text-white rounded-full hover:bg-red-600 transition shadow-md"
          >
            LEAVE CHAT
          </button>
        </div>

        {error && (
          <div className={`mt-2 p-3 rounded-lg text-center text-sm shadow-sm
            ${isDarkMode ? 'bg-red-900/50 text-red-400' : 'bg-red-100 text-red-500'}`}>
            {error}
          </div>
        )}
      </div>
    </div>
  )
} 