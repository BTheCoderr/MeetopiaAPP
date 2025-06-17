'use client'

import React from 'react'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Floating elements for visual appeal */}
      <div className="absolute top-20 left-10 text-6xl animate-bounce">
        🌎
      </div>
      <div className="absolute top-32 right-20 text-4xl animate-pulse">
        ✨
      </div>
      <div className="absolute bottom-20 left-20 text-5xl animate-bounce" style={{ animationDelay: '1s' }}>
        💫
      </div>
      <div className="absolute bottom-32 right-10 text-3xl animate-pulse" style={{ animationDelay: '2s' }}>
        🎭
      </div>

      {/* Navigation */}
      <nav className="p-6 relative z-10">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-xl">Meetopia</h1>
              <p className="text-gray-300 text-sm">Connect Worldwide</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full transition-all">
              🦋 Product Hunt
            </button>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full transition-all">
              ? Tutorial
            </button>
            <button className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-full transition-all">
              🌙 Dark
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Rocket Icon */}
          <div className="mb-8 text-8xl animate-bounce">
            🚀
          </div>
          
          {/* Main Title */}
          <h1 className="text-6xl md:text-8xl font-bold mb-6">
            <span className="text-white">Meet People</span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Worldwide
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Advanced video chat platform with smart matching, fun virtual backgrounds, screen sharing, and enterprise-grade security. Connect with confidence and style! 🎨✨
          </p>

          {/* Main Action Buttons */}
          <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
            <Link 
              href="/chat/video" 
              className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-6 px-12 rounded-full text-xl transition-all transform hover:scale-105 shadow-2xl min-w-[300px]"
            >
              ⭐ Start Connecting Now
            </Link>
            
            <Link 
              href="/demo" 
              className="inline-block border-2 border-blue-400 hover:border-blue-300 text-blue-400 hover:text-blue-300 font-medium py-6 px-12 rounded-full text-xl transition-all min-w-[300px]"
            >
              📹 Watch Demo
            </Link>
          </div>
        </div>
      </div>
      
      {/* Bottom decorative elements */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/30 to-transparent"></div>
    </div>
  )
}
