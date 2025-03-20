'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import MainLayout from '../components/Layout/MainLayout'

export default function HomePage() {
  const [speedDatingEnabled, setSpeedDatingEnabled] = useState(false)
  const [blindDateEnabled, setBlindDateEnabled] = useState(true) // Default to enabled for uniqueness
  const [videoOnly, setVideoOnly] = useState(true) // Default to video-only mode
  const [userBio, setUserBio] = useState('')
  const [userInterests, setUserInterests] = useState<string[]>([])
  const [interestInput, setInterestInput] = useState('')
  
  const addInterest = () => {
    if (interestInput.trim() && userInterests.length < 5) {
      setUserInterests([...userInterests, interestInput.trim()])
      setInterestInput('')
    }
  }
  
  const removeInterest = (index: number) => {
    setUserInterests(userInterests.filter((_, i) => i !== index))
  }
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addInterest()
    }
  }
  
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
            <h2 className="text-2xl font-bold text-white mb-3">Video Dating</h2>
            <p className="text-white/80 mb-4 text-sm">Find potential matches through face-to-face conversations</p>
            <Link 
              href={`/match?speed=${speedDatingEnabled}&blind=${blindDateEnabled}&mode=dating&video=true&bio=${encodeURIComponent(userBio)}&interests=${encodeURIComponent(JSON.stringify(userInterests))}`}
              className="w-full px-6 py-3 bg-white text-purple-700 text-lg font-bold rounded-lg hover:bg-purple-50 transition-colors shadow-md"
            >
              Start Dating
            </Link>
          </div>
        </div>
        
        {/* Dating Profile Section */}
        <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-bold mb-4">Your Dating Profile</h3>
          <p className="text-sm text-gray-600 mb-4">Add a brief bio and interests to help find better matches in dating mode</p>
          
          <div className="mb-4">
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1 text-left">
              Brief Bio (max 150 chars)
            </label>
            <textarea
              id="bio"
              value={userBio}
              onChange={(e) => setUserBio(e.target.value.slice(0, 150))}
              placeholder="Tell potential matches a bit about yourself..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={3}
              maxLength={150}
            />
            <p className="text-xs text-right text-gray-500">{userBio.length}/150</p>
          </div>
          
          <div className="mb-4">
            <label htmlFor="interests" className="block text-sm font-medium text-gray-700 mb-1 text-left">
              Interests (max 5)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                id="interests"
                value={interestInput}
                onChange={(e) => setInterestInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add an interest..."
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={userInterests.length >= 5}
              />
              <button
                onClick={addInterest}
                disabled={userInterests.length >= 5 || !interestInput.trim()}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg disabled:bg-gray-300"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {userInterests.map((interest, index) => (
                <div key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full flex items-center">
                  <span>{interest}</span>
                  <button 
                    onClick={() => removeInterest(index)}
                    className="ml-2 text-purple-800 hover:text-purple-900"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
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
              className="w-4 h-4"
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
              Video Only (Chat Mode)
            </label>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
