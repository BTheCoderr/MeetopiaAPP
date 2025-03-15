'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import MainLayout from '../components/Layout/MainLayout'

export default function HomePage() {
  const [speedDatingEnabled, setSpeedDatingEnabled] = useState(false)
  const [blindDateEnabled, setBlindDateEnabled] = useState(true) // Default to enabled for uniqueness
  const [videoOnly, setVideoOnly] = useState(true) // Default to video-only mode
  
  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 text-center">
        <h1 className="text-3xl font-bold mb-6">Ready for your Meetopia adventure?</h1>
        <p className="mb-8">Choose your experience below!</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 w-full max-w-2xl">
          {/* Random Chat Option */}
          <div className="flex flex-col items-center p-6 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-white mb-3">Random Chat</h2>
            <p className="text-white/80 mb-4 text-sm">Meet new people for casual conversations</p>
            <Link 
              href={`/match?speed=${speedDatingEnabled}&blind=false&mode=chat&video=${videoOnly}`}
              className="w-full px-6 py-3 bg-white text-blue-700 text-lg font-bold rounded-lg hover:bg-blue-50 transition-colors shadow-md"
            >
              Start Chatting
            </Link>
          </div>
          
          {/* Random Dating Option */}
          <div className="flex flex-col items-center p-6 bg-gradient-to-br from-pink-600 to-purple-700 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-white mb-3">Random Dating</h2>
            <p className="text-white/80 mb-4 text-sm">Find potential matches in a dating-focused environment</p>
            <Link 
              href={`/match?speed=${speedDatingEnabled}&blind=${blindDateEnabled}&mode=dating&video=${videoOnly}`}
              className="w-full px-6 py-3 bg-white text-purple-700 text-lg font-bold rounded-lg hover:bg-purple-50 transition-colors shadow-md"
            >
              Start Dating
            </Link>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-6 mt-2 bg-gray-800 p-4 rounded-lg w-full max-w-2xl">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="speedDating"
              checked={speedDatingEnabled}
              onChange={() => setSpeedDatingEnabled(!speedDatingEnabled)}
              className="w-4 h-4"
            />
            <label htmlFor="speedDating" className="text-sm text-gray-300">
              Speed Mode {speedDatingEnabled && '(3-min timer)'}
            </label>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="blindDate"
              checked={blindDateEnabled}
              onChange={() => setBlindDateEnabled(!blindDateEnabled)}
              className="text-sm text-gray-300"
            />
            <label htmlFor="blindDate" className="text-sm text-gray-300">
              Blind Date {blindDateEnabled && '(30-sec blur)'}
            </label>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="videoOnly"
              checked={videoOnly}
              onChange={() => setVideoOnly(!videoOnly)}
              className="w-4 h-4"
            />
            <label htmlFor="videoOnly" className="text-sm text-gray-300">
              Video Only
            </label>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
