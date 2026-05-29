'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import MainLayout from '@/components/Layout/MainLayout'
import CommunityGuidelines from '@/components/CommunityGuidelines'

export default function Home() {
  const [showGuidelines, setShowGuidelines] = useState(false)
  
  const handleAcceptGuidelines = () => {
    setShowGuidelines(false)
    // If you want to redirect to chat after accepting
    // window.location.href = '/chat/video'
  }
  
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Meet New People Through Random Video Chat
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mb-8">
            Connect with strangers around the world in seconds. No sign-up required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Link 
              href="/chat/video" 
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg text-lg shadow-md transition-colors"
            >
              Start Video Chat Now
            </Link>
            <button
              onClick={() => setShowGuidelines(true)}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Read our community guidelines
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">No Registration</h3>
            <p className="text-gray-600">
              Jump straight into conversations without creating an account or sharing personal information.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Random Matching</h3>
            <p className="text-gray-600">
              Our system connects you with random people from around the world for spontaneous conversations.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Safe Environment</h3>
            <p className="text-gray-600">
              Our content moderation system helps protect users from inappropriate content and behavior.
            </p>
          </div>
        </div>
        
        {/* Safety Section */}
        <div className="bg-blue-50 p-8 rounded-lg mb-16">
          <h2 className="text-2xl font-bold mb-4 text-center">Your Safety Is Our Priority</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-3">Content Moderation</h3>
              <p className="text-gray-700">
                Meetopia uses technology to automatically detect and blur potentially inappropriate 
                content, giving you more control over your chat experience.
              </p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Auto-blurring of inappropriate content</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Easy reporting of violations</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>One-click skip to next person</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">Community Guidelines</h3>
              <p className="text-gray-700">
                All users are expected to follow our community standards to create a 
                respectful and enjoyable environment for everyone.
              </p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>No explicit or inappropriate content</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>No harassment or bullying</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Respect others' boundaries</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gray-800 text-white p-8 rounded-lg text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to meet someone new?</h2>
          <p className="text-gray-300 mb-6">
            Start a random video chat right now and discover new connections.
          </p>
          <Link
            href="/chat/video"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg shadow-md transition-colors"
          >
            Start Chatting
          </Link>
        </div>
      </div>
      
      {/* Community Guidelines Modal */}
      <CommunityGuidelines 
        isOpen={showGuidelines} 
        onAccept={handleAcceptGuidelines} 
        onClose={() => setShowGuidelines(false)} 
      />
    </MainLayout>
  )
}
