'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/Layout/MainLayout'

export default function ExplorePage() {
  const router = useRouter()

  const startRandomChat = () => {
    // Go directly to video chat
    router.push('/chat/video')
  }

  const startDating = () => {
    // Go to dating profile first
    router.push('/dating/profile')
  }

  return (
    <MainLayout>
      <div className="min-h-[80vh] bg-gray-50">
        <div className="max-w-4xl mx-auto p-8">
          <h1 className="text-3xl font-bold text-center mb-3">How do you want to connect?</h1>
          <p className="text-lg text-center text-gray-600 mb-10">
            Choose your experience and start chatting in seconds
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Random Video Chat Option */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transition-all hover:shadow-lg">
              <div className="h-48 bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                <span className="text-6xl">🎥</span>
              </div>
              <div className="p-6">
                <h2 className="text-xl font-bold mb-2">Random Video Chat</h2>
                <p className="text-gray-600 mb-6 h-20">
                  Connect with random people from around the world. Fast, anonymous, and no sign-up required.
                </p>
                <button 
                  onClick={startRandomChat}
                  className="w-full py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Start Random Chat
                </button>
              </div>
            </div>

            {/* Video Dating Option */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transition-all hover:shadow-lg">
              <div className="h-48 bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center">
                <span className="text-6xl">❤️</span>
              </div>
              <div className="p-6">
                <h2 className="text-xl font-bold mb-2">Video Dating</h2>
                <p className="text-gray-600 mb-6 h-20">
                  Meet people with shared interests through video dating. Create a quick profile to get matched better.
                </p>
                <button 
                  onClick={startDating}
                  className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
                >
                  Try Video Dating
                </button>
              </div>
            </div>
          </div>
          
          {/* Stats for social proof */}
          <div className="mt-12 grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <p className="text-2xl font-bold text-blue-600">10,000+</p>
              <p className="text-gray-600 text-sm">Daily Users</p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <p className="text-2xl font-bold text-blue-600">5 sec</p>
              <p className="text-gray-600 text-sm">Average Match Time</p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <p className="text-2xl font-bold text-blue-600">100%</p>
              <p className="text-gray-600 text-sm">Free to Use</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
} 