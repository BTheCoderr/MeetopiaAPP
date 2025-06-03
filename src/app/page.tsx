'use client'
import React, { useState, useEffect } from 'react'
import Tutorial from '@/components/Tutorial'

export default function HomePage() {
  const [isDarkTheme, setIsDarkTheme] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [isTutorialOpen, setIsTutorialOpen] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleTutorialClose = () => {
    setIsTutorialOpen(false)
    if (typeof window !== 'undefined') {
      localStorage.setItem('meetopia-tutorial-seen', 'true')
    }
  }

  const handleStartChat = () => {
    window.location.href = '/chat/video'
  }

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-6xl">🎥</div>
      </div>
    )
  }
  
  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkTheme ? 'bg-black' : 'bg-white'
    } flex flex-col`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-6">
        <h1 className="text-lg sm:text-xl font-bold">
          <span className={isDarkTheme ? 'text-blue-400' : 'text-blue-600'}>Meet</span>
          <span className={isDarkTheme ? 'text-white' : 'text-black'}>opia</span>
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsTutorialOpen(true)}
            className={`px-3 py-1 rounded-full text-sm ${
              isDarkTheme 
                ? 'bg-purple-600/20 text-purple-300 hover:bg-purple-600/30' 
                : 'bg-purple-600/20 text-purple-700 hover:bg-purple-600/30'
            } transition-all duration-300`}
          >
            ? Tutorial
          </button>
          <button
            onClick={() => setIsDarkTheme(!isDarkTheme)}
            className={`px-3 py-1 rounded-full text-sm ${
              isDarkTheme 
                ? 'bg-gray-800/50 text-white/80 hover:bg-gray-800/70' 
                : 'bg-gray-200/50 text-black/80 hover:bg-gray-200/70'
            } transition-all duration-300`}
          >
            {isDarkTheme ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
      </div>

      {/* Main Content - Centered */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-4xl w-full text-center space-y-8 sm:space-y-12">
          {/* Hero Section */}
          <div className="space-y-4 sm:space-y-6">
            <div className="text-6xl sm:text-8xl">🎥</div>
            <h1 className={`text-3xl sm:text-4xl lg:text-6xl font-bold ${
              isDarkTheme ? 'text-white' : 'text-black'
            }`}>
              Welcome to{' '}
              <span className={isDarkTheme ? 'text-blue-400' : 'text-blue-600'}>Meet</span>
              <span className={isDarkTheme ? 'text-white' : 'text-black'}>opia</span>
            </h1>
            <p className={`text-lg sm:text-xl lg:text-2xl font-medium ${
              isDarkTheme ? 'text-white/80' : 'text-black/80'
            } max-w-2xl mx-auto`}>
              Connect instantly with people worldwide through seamless video chat
            </p>
          </div>
          
          {/* Quick Features - Compact */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto">
            <div className="text-center space-y-2">
              <div className="text-2xl sm:text-3xl">⚡</div>
              <h3 className={`font-bold ${isDarkTheme ? 'text-white' : 'text-black'}`}>
                Instant
              </h3>
              <p className={`text-sm ${isDarkTheme ? 'text-white/70' : 'text-black/70'}`}>
                No sign-ups, just click and chat
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl sm:text-3xl">🔒</div>
              <h3 className={`font-bold ${isDarkTheme ? 'text-white' : 'text-black'}`}>
                Safe
              </h3>
              <p className={`text-sm ${isDarkTheme ? 'text-white/70' : 'text-black/70'}`}>
                Anonymous with safety features
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl sm:text-3xl">🌍</div>
              <h3 className={`font-bold ${isDarkTheme ? 'text-white' : 'text-black'}`}>
                Global
              </h3>
              <p className={`text-sm ${isDarkTheme ? 'text-white/70' : 'text-black/70'}`}>
                Meet people worldwide
              </p>
            </div>
          </div>

          {/* Simple How it Works */}
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center justify-center gap-4 sm:gap-8 text-sm sm:text-base">
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                  isDarkTheme ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-500/20 text-blue-600'
                }`}>
                  <span className="text-xs sm:text-sm font-bold">1</span>
                </div>
                <span className={isDarkTheme ? 'text-white/80' : 'text-black/80'}>Click</span>
              </div>
              <div className={`hidden sm:block w-8 h-px ${
                isDarkTheme ? 'bg-white/20' : 'bg-black/20'
              }`} />
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                  isDarkTheme ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-500/20 text-purple-600'
                }`}>
                  <span className="text-xs sm:text-sm font-bold">2</span>
                </div>
                <span className={isDarkTheme ? 'text-white/80' : 'text-black/80'}>Connect</span>
              </div>
              <div className={`hidden sm:block w-8 h-px ${
                isDarkTheme ? 'bg-white/20' : 'bg-black/20'
              }`} />
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                  isDarkTheme ? 'bg-green-500/20 text-green-400' : 'bg-green-500/20 text-green-600'
                }`}>
                  <span className="text-xs sm:text-sm font-bold">3</span>
                </div>
                <span className={isDarkTheme ? 'text-white/80' : 'text-black/80'}>Chat</span>
        </div>
        </div>
          </div>
          
          {/* CTA Button */}
          <div className="space-y-3">
            <button
              onClick={handleStartChat}
              className={`w-full max-w-md mx-auto py-3 sm:py-4 px-6 sm:px-8 rounded-2xl text-lg sm:text-xl font-bold transition-all duration-300 transform hover:scale-105 ${
                isDarkTheme 
                  ? 'bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 border border-blue-400/30' 
                  : 'bg-blue-600/20 text-blue-700 hover:bg-blue-600/30 border border-blue-400/30'
              } backdrop-blur-sm shadow-xl block`}
            >
              🚀 Start Your Adventure
            </button>
            <p className={`text-xs sm:text-sm ${isDarkTheme ? 'text-white/60' : 'text-black/60'}`}>
              Ready to meet someone new?
            </p>
          </div>
        </div>
      </div>

      {/* Tutorial */}
      <Tutorial 
        isOpen={isTutorialOpen}
        onClose={handleTutorialClose}
        isDarkTheme={isDarkTheme}
      />
    </div>
  )
}
