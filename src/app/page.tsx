'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import MainLayout from '../components/Layout/MainLayout'

export default function HomePage() {
  const [speedDatingEnabled, setSpeedDatingEnabled] = useState(false)
  const [blindDateEnabled, setBlindDateEnabled] = useState(true) // Default to enabled for uniqueness
  
  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 text-center">
        <h1 className="text-3xl font-bold mb-6">Ready for your Meetopia adventure?</h1>
        <p className="mb-8">Click "Make a Connection" to begin!</p>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Link 
            href={`/match?speed=${speedDatingEnabled}&blind=${blindDateEnabled}`}
            className="px-8 py-4 bg-blue-600 text-white text-lg font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            Make a Connection!
          </Link>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-6 mt-2 bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="speedDating"
              checked={speedDatingEnabled}
              onChange={() => setSpeedDatingEnabled(!speedDatingEnabled)}
              className="w-4 h-4"
            />
            <label htmlFor="speedDating" className="text-sm text-gray-300">
              Speed Dating Mode {speedDatingEnabled && '(3-min timer)'}
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
