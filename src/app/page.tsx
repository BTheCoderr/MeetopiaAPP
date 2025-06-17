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
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">T</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-2xl">Meetopia</h1>
              <p className="text-gray-300 text-sm">Connect Worldwide</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full transition-all flex items-center space-x-2">
              <span>🦋</span>
              <span className="hidden md:block">Product Hunt</span>
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

      {/* Hero Section */}
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
          <div className="flex flex-col md:flex-row gap-6 justify-center items-center mb-16">
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

          {/* Create Profile Button */}
          <Link 
            href="/profile/setup" 
            className="inline-block bg-gray-800 hover:bg-gray-700 text-white font-medium py-4 px-8 rounded-full text-lg transition-all"
          >
            👤 Create Profile
          </Link>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white/5 backdrop-blur-sm py-16 relative z-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl mb-2">👥</div>
              <div className="text-4xl font-bold text-white">1.2K+</div>
              <div className="text-gray-300">Active Users</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl mb-2">💙</div>
              <div className="text-4xl font-bold text-white">8.5K+</div>
              <div className="text-gray-300">Connections Made</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl mb-2">📈</div>
              <div className="text-4xl font-bold text-white">99.2%</div>
              <div className="text-gray-300">Uptime</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl mb-2">⭐</div>
              <div className="text-4xl font-bold text-white">5.0★</div>
              <div className="text-gray-300">User Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 relative z-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-6">Powerful Features</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Everything you need for meaningful connections with cutting-edge technology
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Smart Matching */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 text-center">
              <div className="text-6xl mb-6">🧠</div>
              <h3 className="text-2xl font-bold text-white mb-4">Smart Matching</h3>
              <p className="text-gray-300 leading-relaxed">
                AI-powered algorithm matches you with compatible people based on interests, location, and preferences
              </p>
            </div>

            {/* HD Video Chat */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 text-center">
              <div className="text-6xl mb-6">📹</div>
              <h3 className="text-2xl font-bold text-white mb-4">HD Video Chat</h3>
              <p className="text-gray-300 leading-relaxed">
                Crystal clear video calls with adaptive quality and virtual backgrounds
              </p>
            </div>

            {/* Virtual Backgrounds */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 text-center">
              <div className="text-6xl mb-6">🎭</div>
              <h3 className="text-2xl font-bold text-white mb-4">Virtual Backgrounds</h3>
              <p className="text-gray-300 leading-relaxed">
                Professional backgrounds, blur effects, and custom uploads for perfect video calls
              </p>
            </div>

            {/* Screen Sharing */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 text-center">
              <div className="text-6xl mb-6">🖥️</div>
              <h3 className="text-2xl font-bold text-white mb-4">Screen Sharing</h3>
              <p className="text-gray-300 leading-relaxed">
                Share your screen, presentations, or applications with recording capabilities
              </p>
            </div>

            {/* Safe & Secure */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 text-center">
              <div className="text-6xl mb-6">🛡️</div>
              <h3 className="text-2xl font-bold text-white mb-4">Safe & Secure</h3>
              <p className="text-gray-300 leading-relaxed">
                End-to-end encryption, reporting tools, and advanced safety features
              </p>
            </div>

            {/* Global Community */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 text-center">
              <div className="text-6xl mb-6">🌍</div>
              <h3 className="text-2xl font-bold text-white mb-4">Global Community</h3>
              <p className="text-gray-300 leading-relaxed">
                Connect with people worldwide with language preferences and location matching
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-white/5 backdrop-blur-sm py-20 relative z-10">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-5xl font-bold text-white text-center mb-16">What People Say</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
              <div className="text-5xl mb-4">👨‍💻</div>
              <p className="text-lg text-gray-300 mb-6 italic">
                "Virtual backgrounds make me feel confident in video calls. Love the quality!"
              </p>
              <div className="font-semibold text-white">Alex K.</div>
              <div className="text-gray-400">London, UK</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
              <div className="text-5xl mb-4">👩‍💼</div>
              <p className="text-lg text-gray-300 mb-6 italic">
                "The smart matching really works! I've met amazing people who share my interests."
              </p>
              <div className="font-semibold text-white">Sarah M.</div>
              <div className="text-gray-400">New York, USA</div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="py-20 relative z-10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="text-6xl mb-8">✨</div>
          <h2 className="text-5xl font-bold text-white mb-6">Ready to Start Connecting?</h2>
          <p className="text-xl text-gray-300 mb-12">
            Join millions of users already making meaningful connections worldwide. It's free, fast, and secure.
          </p>
          
          <Link 
            href="/chat/video" 
            className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-6 px-12 rounded-full text-xl transition-all transform hover:scale-105 shadow-2xl"
          >
            ⚡ Start Connecting Now
          </Link>

          <div className="flex justify-center items-center space-x-8 mt-12 text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>100% Secure</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
              <span>Instant Connect</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>24/7 Available</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-black/20 backdrop-blur-sm py-8 relative z-10">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className="text-white font-semibold text-lg">Meetopia</span>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Connecting the world, one conversation at a time.
          </p>
          <div className="flex justify-center items-center space-x-6 text-xs text-gray-500">
            <span>🔒 Featured on Product Hunt</span>
            <span>📈 Growing Community</span>
          </div>
        </div>
      </div>
    </div>
  )
}
