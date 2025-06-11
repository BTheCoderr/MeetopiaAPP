'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ModernCard } from '../../../components/ui/modern-card'
import { ModernButton } from '../../../components/ui/modern-button'
import { AdvancedMatchingService } from '../../../lib/matching-algorithm'
import { Search, Users, Heart, Zap, CheckCircle } from 'lucide-react'

const matchingSteps = [
  { text: 'Analyzing your preferences...', icon: Search },
  { text: 'Finding compatible users...', icon: Users },
  { text: 'Calculating compatibility scores...', icon: Heart },
  { text: 'Preparing your connection...', icon: Zap },
  { text: 'Match found!', icon: CheckCircle }
]

export default function VideoMatchingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isMatching, setIsMatching] = useState(false)
  const [matchFound, setMatchFound] = useState(false)
  const matchingService = new AdvancedMatchingService()

  const startMatching = async () => {
    setIsMatching(true)
    setCurrentStep(0)

    // Simulate smart matching process
    for (let i = 0; i < matchingSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1500))
      setCurrentStep(i)
      
      if (i === matchingSteps.length - 1) {
        setMatchFound(true)
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Generate a room ID and redirect
        const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        router.push(`/room/${roomId}?mode=regular&chatMode=video`)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <ModernCard className="p-12">
            {!isMatching ? (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8"
                >
                  <Heart className="w-12 h-12 text-white" />
                </motion.div>
                
                <h1 className="text-4xl font-bold text-gray-900 mb-6">
                  Ready to Connect?
                </h1>
                <p className="text-xl text-gray-600 mb-8 max-w-lg mx-auto">
                  Our smart matching algorithm will find you the perfect conversation partner 
                  based on your interests and preferences.
                </p>
                
                <ModernButton
                  size="lg"
                  onClick={startMatching}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Heart className="w-5 h-5 mr-2" />
                  Find My Match
                </ModernButton>
                
                <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    ✨ Using AI-powered matching • 🛡️ Safe & secure • 🌍 Global community
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Search className="w-12 h-12 text-white" />
                  </motion.div>
                </div>
                
                <h2 className="text-3xl font-bold text-gray-900 mb-8">
                  Finding Your Perfect Match
                </h2>
                
                <div className="space-y-4 mb-8">
                  {matchingSteps.map((step, index) => {
                    const Icon = step.icon
                    const isActive = currentStep >= index
                    const isCurrent = currentStep === index
                    
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ 
                          opacity: isActive ? 1 : 0.3,
                          x: 0,
                          scale: isCurrent ? 1.05 : 1
                        }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex items-center space-x-4 p-4 rounded-lg transition-all duration-300 ${
                          isActive ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isActive ? 'bg-blue-500' : 'bg-gray-300'
                        }`}>
                          <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                        </div>
                        <span className={`font-medium ${
                          isActive ? 'text-blue-700' : 'text-gray-500'
                        }`}>
                          {step.text}
                        </span>
                        {isCurrent && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="ml-auto"
                          >
                            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                          </motion.div>
                        )}
                      </motion.div>
                    )
                  })}
                </div>
                
                {matchFound && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-green-50 border border-green-200 rounded-lg p-6"
                  >
                    <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-4" />
                    <p className="text-green-700 font-medium">
                      Perfect match found! Connecting you now...
                    </p>
                  </motion.div>
                )}
              </>
            )}
          </ModernCard>
        </motion.div>
      </div>
    </div>
  )
} 