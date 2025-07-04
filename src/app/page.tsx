'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Logo from '../components/Logo'
import { useTheme } from '../components/ThemeProvider'

export default function Home() {
  const { theme, toggleTheme } = useTheme()
  const [showTutorial, setShowTutorial] = useState(false)
  const [stats, setStats] = useState({
    activeUsers: 1200,
    connections: 8500,
    uptime: 99.2,
    rating: 5.0
  })

  // Real-time stats animation
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 3) - 1,
        connections: prev.connections + Math.floor(Math.random() * 5),
        uptime: Math.min(99.9, prev.uptime + (Math.random() * 0.01)),
        rating: Math.min(5.0, prev.rating + (Math.random() * 0.01 - 0.005))
      }))
    }, 3000) // Update every 3 seconds

    return () => clearInterval(interval)
  }, [])

  const isDark = theme === 'dark'

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
          <Logo size="lg" showText={true} isDarkTheme={true} />
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => window.open('https://www.producthunt.com/posts/meetopia', '_blank')}
              className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-full transition-all flex items-center space-x-2 border border-white/20 hover:border-white/30"
            >
              <span className="text-orange-400">🔥</span>
              <span className="hidden md:block font-medium">Product Hunt</span>
            </button>
            <button 
              onClick={() => setShowTutorial(true)}
              className="bg-purple-600/90 hover:bg-purple-700 text-white px-6 py-2 rounded-full transition-all border border-purple-500/30 hover:border-purple-400/50 backdrop-blur-sm"
            >
              <span className="mr-1">?</span> Tutorial
            </button>
            <button 
              onClick={toggleTheme}
              className="bg-yellow-500/90 hover:bg-yellow-600 text-black px-6 py-2 rounded-full transition-all border border-yellow-400/30 hover:border-yellow-300/50 backdrop-blur-sm font-medium"
            >
              {isDark ? '☀️ Light' : '🌙 Dark'}
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
              <div className="text-4xl font-bold text-white">{stats.activeUsers.toLocaleString()}+</div>
              <div className="text-gray-300">Active Users</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl mb-2">💙</div>
              <div className="text-4xl font-bold text-white">{stats.connections.toLocaleString()}+</div>
              <div className="text-gray-300">Connections Made</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl mb-2">📈</div>
              <div className="text-4xl font-bold text-white">{stats.uptime.toFixed(1)}%</div>
              <div className="text-gray-300">Uptime</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl mb-2">⭐</div>
              <div className="text-4xl font-bold text-white">{stats.rating.toFixed(1)}★</div>
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
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 hover:border-white/30 transition-all group">
              <div className="text-center">
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">🎭</div>
                <h3 className="text-2xl font-bold text-white mb-4">Virtual Backgrounds</h3>
                <p className="text-gray-300 mb-6">Professional backgrounds, blur effects, and custom uploads for perfect video calls</p>
                
                {/* Background Previews */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="aspect-video bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-xs text-white font-medium">
                    Office
                  </div>
                  <div className="aspect-video bg-gradient-to-r from-green-500 to-teal-600 rounded-lg flex items-center justify-center text-xs text-white font-medium">
                    Nature
                  </div>
                  <div className="aspect-video bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-xs text-white font-medium">
                    Abstract
                  </div>
                </div>
                
                <div className="text-sm text-gray-400">
                  • Blur effects • Custom uploads • AI-powered
                </div>
              </div>
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
          <div className="flex items-center justify-center mb-4">
            <Logo size="md" showText={true} isDarkTheme={true} />
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

      {/* Tutorial Modal */}
      {showTutorial && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">🎯 How to Use Meetopia</h2>
                <button 
                  onClick={() => setShowTutorial(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">1</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Start Connecting</h3>
                    <p className="text-gray-600">Click "Start Connecting Now" to begin your video chat journey</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">2</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Camera & Microphone</h3>
                    <p className="text-gray-600">Allow camera and microphone access for the best experience</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">3</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Virtual Backgrounds</h3>
                    <p className="text-gray-600">Choose from professional backgrounds, blur effects, or upload your own</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold">4</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Smart Matching</h3>
                    <p className="text-gray-600">Our AI finds compatible people based on interests and preferences</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">5</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Screen Sharing</h3>
                    <p className="text-gray-600">Share your screen for presentations or collaborative work</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 text-center">
                <button 
                  onClick={() => setShowTutorial(false)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full hover:from-blue-700 hover:to-purple-700 transition-all"
                >
                  Got it! 🚀
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
