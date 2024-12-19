'use client'
import { useState } from 'react'
import Link from 'next/link'
import ConnectionStatus from '@/components/ConnectionStatus'

export default function TextChatPage() {
  const [showNav, setShowNav] = useState(false)

  return (
    <div className="min-h-screen bg-white p-8">
      {/* Header with Back Button, Logo, and Connection Status */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
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
                  <span className="text-blue-500 font-bold">Meet</span>
                  <span className="text-gray-700 font-bold">opia</span>
                </Link>
                <Link href="/chat/video" className="block px-4 py-2 hover:bg-gray-100">
                  🎥 Video Chat
                </Link>
                <Link href="/chat/combined" className="block px-4 py-2 hover:bg-gray-100">
                  🤝 Combined Chat
                </Link>
              </div>
            )}
          </div>
          <h1 className="text-2xl font-bold">
            <span className="text-blue-500">Meet</span>
            <span className="text-gray-700">opia</span>
          </h1>
        </div>
        <ConnectionStatus />
      </div>

      {/* Main Chat Container */}
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md border-2 border-dashed border-gray-200 hover:border-blue-400 transition-colors">
        {/* Chat Title */}
        <div className="text-center p-4 border-b border-gray-100">
          <h1 className="text-2xl font-semibold">💬 Text Chat</h1>
        </div>

        {/* Chat Area */}
        <div className="h-[400px] p-4 flex flex-col">
          {/* Messages will go here */}
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Waiting for partner...
          </div>
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-100">
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

        {/* Bottom Controls */}
        <div className="p-4 flex justify-center gap-4 border-t border-gray-100">
          <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            NEXT PERSON
          </button>
          <button className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
            LEAVE CHAT
          </button>
        </div>
      </div>
    </div>
  )
} 