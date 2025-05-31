'use client'
import React from 'react'
import Link from 'next/link'

export default function HomePage() {
  const handleStartChat = () => {
    window.location.href = '/chat/video'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Logo */}
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-white">
            <span className="text-blue-200">Meet</span>
            <span className="text-white">opia</span>
          </h1>
          <p className="text-xl text-white/90 font-medium">
            Connect instantly with people worldwide
          </p>
        </div>

        {/* How it Works Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 space-y-4">
          <h2 className="text-2xl font-bold text-white mb-4">How it Works</h2>
          <div className="grid gap-4 text-left">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center text-white font-bold text-sm">1</div>
              <div>
                <h3 className="text-white font-semibold">Click "Start Video Chat"</h3>
                <p className="text-white/80 text-sm">Allow camera and microphone access when prompted</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-400 flex items-center justify-center text-white font-bold text-sm">2</div>
              <div>
                <h3 className="text-white font-semibold">Make a Connection</h3>
                <p className="text-white/80 text-sm">Click "Make a Connection!" to find someone to chat with</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-pink-400 flex items-center justify-center text-white font-bold text-sm">3</div>
              <div>
                <h3 className="text-white font-semibold">Chat & Explore</h3>
                <p className="text-white/80 text-sm">Use "Keep Exploring!" to meet new people anytime</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/20 pt-4 mt-4">
            <p className="text-white/70 text-sm">
              💡 <strong>Pro Tips:</strong> Move your mouse to show controls • Use spacebar for quick next person • Chat overlay appears on the left
            </p>
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStartChat}
          className="bg-white text-blue-600 px-8 py-4 rounded-2xl text-xl font-bold hover:bg-white/90 transition-all duration-300 transform hover:scale-105 shadow-xl"
        >
          Start Video Chat
        </button>

        {/* Footer */}
        <p className="text-white/60 text-sm">
          Safe, anonymous, and instant connections
        </p>
      </div>
    </div>
  )
}
