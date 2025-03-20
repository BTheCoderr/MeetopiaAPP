'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import MainLayout from '../components/Layout/MainLayout'

export default function HomePage() {
  // Keep minimal state for essential features
  const [speedDatingEnabled, setSpeedDatingEnabled] = useState(false)
  const [blindDateEnabled, setBlindDateEnabled] = useState(true)
  
  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 text-center">
        <h1 className="text-3xl font-bold mb-8">Ready for your Meetopia adventure?</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 w-full max-w-2xl">
          {/* Random Chat Option */}
          <div className="flex flex-col items-center p-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl shadow-lg hover:shadow-xl transition-all">
            <h2 className="text-2xl font-bold text-white mb-3">Random Chat</h2>
            <p className="text-white/80 mb-6">Meet new people for casual conversations</p>
            <Link 
              href={`/match?mode=chat&video=true`}
              className="w-full px-6 py-4 bg-white text-blue-700 text-lg font-bold rounded-lg hover:bg-blue-50 transition-all shadow-md"
            >
              Start Chatting
            </Link>
          </div>
          
          {/* Video Dating Option */}
          <div className="flex flex-col items-center p-8 bg-gradient-to-br from-pink-600 to-purple-700 rounded-xl shadow-lg hover:shadow-xl transition-all">
            <h2 className="text-2xl font-bold text-white mb-3">Video Dating</h2>
            <p className="text-white/80 mb-6">Find matches through face-to-face connections</p>
            <Link 
              href={`/match?speed=${speedDatingEnabled}&blind=${blindDateEnabled}&mode=dating&video=true`}
              className="w-full px-6 py-4 bg-white text-purple-700 text-lg font-bold rounded-lg hover:bg-purple-50 transition-all shadow-md"
            >
              Start Dating
            </Link>
          </div>
        </div>
        
        {/* Optional settings hidden behind a simple toggle */}
        <div className="bg-gray-200 p-3 rounded-full cursor-pointer hover:bg-gray-300 transition-all" 
             onClick={() => document.getElementById('settings')?.classList.toggle('hidden')}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        
        <div id="settings" className="hidden w-full max-w-md mt-4 bg-gray-800 p-4 rounded-lg text-left">
          <div className="flex items-center gap-2 mb-2">
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
              className="w-4 h-4"
            />
            <label htmlFor="blindDate" className="text-sm text-gray-300">
              Blind Date {blindDateEnabled && '(30-sec blur)'}
            </label>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
