'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ModernCard } from '../../../components/ui/modern-card'
import { ModernButton } from '../../../components/ui/modern-button'
import { User, ArrowRight, X } from 'lucide-react'

export default function ProfileSetupPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [interests, setInterests] = useState('')

  const handleSkip = () => {
    router.push('/chat/video')
  }

  const handleSave = () => {
    // Save basic profile data to localStorage
    const profileData = {
      username: username || 'Anonymous',
      interests: interests.split(',').map(i => i.trim()).filter(i => i),
      createdAt: Date.now()
    }
    localStorage.setItem('meetopia_profile', JSON.stringify(profileData))
    router.push('/chat/video')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <ModernCard className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Quick Profile (Optional)
            </h1>
            <p className="text-gray-600 text-sm">
              Just a name and interests - takes 30 seconds
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What should people call you?
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your name or nickname"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What are you interested in?
              </label>
              <input
                type="text"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                placeholder="Gaming, music, travel..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Separate with commas</p>
            </div>
          </div>

          <div className="space-y-3">
            <ModernButton
              variant="gradient"
              size="lg"
              className="w-full"
              onClick={handleSave}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Save & Start Chatting
            </ModernButton>
            
            <ModernButton
              variant="ghost"
              size="lg"
              className="w-full"
              onClick={handleSkip}
              icon={<X className="w-4 h-4" />}
            >
              Skip for Now
            </ModernButton>
          </div>

          <p className="text-xs text-gray-500 text-center mt-4">
            You can always add more details later
          </p>
        </ModernCard>
      </motion.div>
    </div>
  )
} 