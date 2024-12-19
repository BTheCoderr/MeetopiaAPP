'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'

export default function CombinedChatPage() {
  const [showNav, setShowNav] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [permissionError, setPermissionError] = useState<string>('')

  useEffect(() => {
    async function getMediaPermissions() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        })
        setStream(mediaStream)
      } catch (error) {
        console.error('Error accessing media devices:', error)
        setPermissionError('Please allow camera and microphone access to use video chat')
      }
    }
    getMediaPermissions()
  }, [])

  useEffect(() => {
    const videoElement = document.getElementById('localVideo') as HTMLVideoElement
    if (videoElement && stream) {
      videoElement.srcObject = stream
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [stream])

  return (
    <div className="min-h-screen bg-white p-8">
      {/* Header with Back Button and Dropdown */}
      <div className="flex items-center gap-4 mb-8">
        <div className="relative z-50">
          <button 
            className="p-2 hover:bg-gray-100 rounded-lg"
            onClick={() => setShowNav(!showNav)}
          >
            ←
          </button>
          
          {showNav && (
            <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[160px]">
              <Link href="/" className="block px-4 py-2 hover:bg-gray-100">
                🏠 Home
              </Link>
              <Link href="/chat/text" className="block px-4 py-2 hover:bg-gray-100">
                💬 Text Chat
              </Link>
              <Link href="/chat/video" className="block px-4 py-2 hover:bg-gray-100">
                🎥 Video Chat
              </Link>
            </div>
          )}
        </div>
        <Header />
      </div>

      {permissionError && (
        <div className="text-center text-red-500 mb-4">
          {permissionError}
        </div>
      )}

      <div className="grid grid-cols-3 gap-8 max-w-7xl mx-auto">
        {/* Video Sections First (2/3 width) */}
        <div className="col-span-2 grid grid-cols-2 gap-8">
          {/* Local Video */}
          <div className="border-2 border-dashed border-gray-200 hover:border-blue-400 transition-colors rounded-lg p-4 shadow-md">
            <div className="relative h-[360px] bg-gray-100 rounded-lg overflow-hidden shadow-inner">
              <video
                id="localVideo"
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100/90 backdrop-blur-sm rounded-full hover:bg-gray-200">
                  🎤
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100/90 backdrop-blur-sm rounded-full hover:bg-gray-200">
                  📹
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100/90 backdrop-blur-sm rounded-full hover:bg-gray-200">
                  ⟳
                </button>
              </div>
            </div>
          </div>

          {/* Partner Video */}
          <div className="border-2 border-dashed border-gray-200 hover:border-blue-400 transition-colors rounded-lg p-4 shadow-md">
            <div className="relative h-[360px] bg-gray-100 rounded-lg flex items-center justify-center shadow-inner">
              <p className="text-gray-500">Waiting for partner...</p>
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100/90 backdrop-blur-sm rounded-full hover:bg-gray-200">
                  🔇
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100/90 backdrop-blur-sm rounded-full hover:bg-gray-200">
                  🚫
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Section Last (1/3 width) */}
        <div className="border-2 border-dashed border-gray-200 hover:border-blue-400 transition-colors rounded-lg p-4 shadow-md">
          <h2 className="text-lg font-semibold mb-4">Chat</h2>
          <div className="h-[360px] bg-gray-50 rounded-lg flex items-center justify-center mb-4">
            <p className="text-gray-500">Waiting for messages...</p>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 p-3 rounded-full border border-gray-300 focus:outline-none focus:border-blue-400"
            />
            <button className="px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600">
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="flex justify-center gap-4 mt-8">
        <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
          NEXT PERSON
        </button>
        <button className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
          LEAVE CHAT
        </button>
      </div>
    </div>
  )
} 