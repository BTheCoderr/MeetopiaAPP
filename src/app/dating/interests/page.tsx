'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Simplified interest categories - direct and minimal
const INTEREST_CATEGORIES = [
  { id: 'travel', name: 'Travel', icon: '✈️', color: 'from-blue-600 to-blue-400' },
  { id: 'fitness', name: 'Fitness', icon: '💪', color: 'from-green-600 to-green-400' },
  { id: 'music', name: 'Music', icon: '🎵', color: 'from-purple-600 to-purple-400' },
  { id: 'food', name: 'Food', icon: '🍳', color: 'from-orange-600 to-orange-400' },
  { id: 'tech', name: 'Tech', icon: '🎮', color: 'from-indigo-600 to-indigo-400' },
  { id: 'art', name: 'Arts', icon: '🎨', color: 'from-pink-600 to-pink-400' }
]

// Demo participants - simulated active users for testing
const DEMO_USERS = [
  { id: 'demo1', name: 'Alex', age: 25, gender: 'male', interests: ['travel', 'music'] },
  { id: 'demo2', name: 'Jamie', age: 28, gender: 'female', interests: ['fitness', 'food'] },
  { id: 'demo3', name: 'Jordan', age: 24, gender: 'other', interests: ['tech', 'art'] },
  { id: 'demo4', name: 'Taylor', age: 26, gender: 'female', interests: ['music', 'food'] },
  { id: 'demo5', name: 'Casey', age: 30, gender: 'male', interests: ['travel', 'tech'] }
]

export default function InterestDatingPage() {
  const router = useRouter()
  const [userProfile, setUserProfile] = useState<any>(null)
  const [selectedInterest, setSelectedInterest] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [showDemoMode, setShowDemoMode] = useState(false)
  const [selectedDemoUser, setSelectedDemoUser] = useState<string | null>(null)

  // Load user profile on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('datingProfileFormatted')
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile)
        setUserProfile(profile)
      } catch (e) {
        console.error('Error parsing saved profile', e)
      }
    } else {
      // Redirect to create profile if none exists
      router.push('/dating/profile')
    }
  }, [router])

  const selectInterest = (interestId: string) => {
    setSelectedInterest(interestId)
    
    // Immediately start connecting once an interest is selected
    startVideoChat(interestId)
  }

  const startVideoChat = (interestId: string) => {
    setIsLoading(true)
    
    // Save selected interest to profile
    if (userProfile) {
      const updatedProfile = {
        ...userProfile,
        selectedInterest: interestId
      }
      localStorage.setItem('datingProfileFormatted', JSON.stringify(updatedProfile))
    }
    
    // Go straight to video chat with the interest as a parameter
    setTimeout(() => {
      router.push(`/chat/video?mode=dating&interest=${interestId}`)
    }, 800)
  }

  const toggleDemoMode = () => {
    setShowDemoMode(!showDemoMode)
  }

  const startDemoChat = (demoUserId: string) => {
    setSelectedDemoUser(demoUserId)
    setIsLoading(true)

    // Save selected demo user to storage
    if (userProfile) {
      const demoUser = DEMO_USERS.find(user => user.id === demoUserId)
      if (demoUser) {
        localStorage.setItem('demoPartner', JSON.stringify(demoUser))
      }
    }

    // Go to demo chat with the demo user
    setTimeout(() => {
      router.push(`/chat/video?mode=dating&demo=true&partner=${demoUserId}`)
    }, 800)
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto p-6 pt-12">
        <h1 className="text-3xl font-bold text-center mb-8">What are you into?</h1>
        
        {!showDemoMode ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-2xl mx-auto">
              {INTEREST_CATEGORIES.map(category => (
                <button
                  key={category.id}
                  onClick={() => selectInterest(category.id)}
                  disabled={isLoading}
                  className={`aspect-square flex flex-col items-center justify-center rounded-xl transition-all p-4
                    ${isLoading && selectedInterest === category.id
                      ? `bg-gradient-to-r ${category.color} text-white opacity-80`
                      : `bg-gradient-to-r ${category.color} text-white hover:scale-105`
                    }
                  `}
                >
                  <span className="text-4xl mb-2">{category.icon}</span>
                  <span className="font-medium text-lg">{category.name}</span>
                  
                  {isLoading && selectedInterest === category.id && (
                    <div className="mt-2 animate-spin w-6 h-6 border-3 border-white border-t-transparent rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
            
            <div className="mt-8 text-center max-w-md mx-auto">
              <p className="text-gray-400 mb-6">
                Click any interest to instantly start video dating
              </p>
              
              <button 
                onClick={toggleDemoMode}
                className="px-4 py-2 bg-gray-800 text-gray-300 hover:bg-gray-700 rounded-lg text-sm transition-colors"
              >
                Try Demo Rooms
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="max-w-2xl mx-auto">
              <h2 className="text-xl text-center text-gray-300 mb-6">Beta Test Demo Partners</h2>
              <div className="grid gap-4">
                {DEMO_USERS.map(user => (
                  <button
                    key={user.id}
                    onClick={() => startDemoChat(user.id)}
                    disabled={isLoading && selectedDemoUser === user.id}
                    className={`flex items-center justify-between bg-gray-900 p-4 rounded-xl ${
                      isLoading && selectedDemoUser === user.id
                        ? 'opacity-80'
                        : 'hover:bg-gray-800 transition-colors'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <div className="ml-4 text-left">
                        <div className="font-medium">{user.name}, {user.age}</div>
                        <div className="text-sm text-gray-400">
                          Interests: {user.interests.map(i => 
                            INTEREST_CATEGORIES.find(cat => cat.id === i)?.name
                          ).join(', ')}
                        </div>
                      </div>
                    </div>
                    
                    {isLoading && selectedDemoUser === user.id ? (
                      <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    ) : (
                      <div className="px-4 py-2 bg-purple-700 rounded-lg text-sm">Chat Now</div>
                    )}
                  </button>
                ))}
              </div>
              
              <div className="mt-8 text-center">
                <p className="text-gray-400 text-sm mb-4">
                  These are simulated partners for testing the video dating experience.
                  No actual connection will be made.
                </p>
                <button 
                  onClick={toggleDemoMode}
                  className="px-4 py-2 bg-gray-800 text-gray-300 hover:bg-gray-700 rounded-lg text-sm transition-colors"
                >
                  Back to Real Dating
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
} 