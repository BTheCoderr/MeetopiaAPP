'use client'
import { useState, useEffect } from 'react'

interface TutorialProps {
  isOpen: boolean
  onClose: () => void
  isDarkTheme: boolean
}

interface TutorialStep {
  id: string
  title: string
  description: string
  position: { x: number; y: number }
  highlight?: string
  icon: string
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Meetopia! 🎉',
    description: 'Let\'s take a quick tour of all the amazing features available to you.',
    position: { x: 50, y: 50 },
    icon: '👋'
  },
  {
    id: 'connection-button',
    title: 'Make a Connection',
    description: 'Click this button to find someone new to chat with. You\'ll be matched instantly!',
    position: { x: 50, y: 20 },
    highlight: 'Make a Connection!',
    icon: '🔗'
  },
  {
    id: 'keep-exploring',
    title: 'Keep Exploring',
    description: 'Not vibing with someone? No worries! Click this to find a new person to chat with.',
    position: { x: 50, y: 20 },
    highlight: 'Keep Exploring!',
    icon: '🔄'
  },
  {
    id: 'video-controls',
    title: 'Video Controls',
    description: 'Control your camera and microphone from your picture-in-picture window in the corner.',
    position: { x: 80, y: 60 },
    icon: '🎥'
  },
  {
    id: 'chat-feature',
    title: 'Chat While You Talk',
    description: 'Send messages in real-time! The chat appears on the left side during calls.',
    position: { x: 20, y: 70 },
    icon: '💬'
  },
  {
    id: 'screen-share',
    title: 'Screen Sharing',
    description: 'Share your screen with the screen share button at the bottom during calls.',
    position: { x: 50, y: 80 },
    icon: '🖥️'
  },
  {
    id: 'themes',
    title: 'Dark/Light Mode',
    description: 'Toggle between dark and light themes using the button in the top right.',
    position: { x: 80, y: 10 },
    icon: '🌙'
  },
  {
    id: 'shortcuts',
    title: 'Pro Tips',
    description: 'Press SPACEBAR for quick "next person" • Move mouse to show controls • Everything auto-hides for immersion!',
    position: { x: 50, y: 50 },
    icon: '⚡'
  },
  {
    id: 'ready',
    title: 'You\'re All Set! 🚀',
    description: 'Ready to meet amazing people from around the world? Let\'s get started!',
    position: { x: 50, y: 50 },
    icon: '✨'
  }
]

export default function Tutorial({ isOpen, onClose, isDarkTheme }: TutorialProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      setCurrentStep(0)
    }
  }, [isOpen])

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleClose()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => {
      onClose()
    }, 300)
  }

  const handleSkip = () => {
    handleClose()
  }

  if (!isOpen) return null

  const step = tutorialSteps[currentStep]
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100

  return (
    <div className={`fixed inset-0 z-50 transition-all duration-300 ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`}>
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      
      {/* Tutorial Card */}
      <div 
        className={`absolute transition-all duration-500 transform ${
          isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-4 opacity-0 scale-95'
        }`}
        style={{
          left: `${step.position.x}%`,
          top: `${step.position.y}%`,
          transform: `translate(-50%, -50%)`,
        }}
      >
        <div className={`w-80 max-w-[90vw] mx-4 p-4 sm:p-6 rounded-2xl shadow-2xl border ${
          isDarkTheme 
            ? 'bg-gray-900 border-gray-700 text-white' 
            : 'bg-white border-gray-200 text-black'
        }`}>
          {/* Progress Bar */}
          <div className={`w-full h-1 rounded-full mb-3 sm:mb-4 ${
            isDarkTheme ? 'bg-gray-800' : 'bg-gray-200'
          }`}>
            <div 
              className="h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Step Counter */}
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <span className={`text-xs sm:text-sm font-medium ${
              isDarkTheme ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Step {currentStep + 1} of {tutorialSteps.length}
            </span>
            <button 
              onClick={handleSkip}
              className={`text-xs sm:text-sm font-medium ${
                isDarkTheme ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'
              } transition-colors`}
            >
              Skip Tutorial
            </button>
          </div>

          {/* Content */}
          <div className="text-center mb-4 sm:mb-6">
            <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">{step.icon}</div>
            <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">{step.title}</h3>
            <p className={`text-xs sm:text-sm leading-relaxed ${
              isDarkTheme ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {step.description}
            </p>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                currentStep === 0
                  ? 'opacity-50 cursor-not-allowed'
                  : isDarkTheme
                    ? 'bg-gray-800 text-white hover:bg-gray-700'
                    : 'bg-gray-200 text-black hover:bg-gray-300'
              }`}
            >
              Prev
            </button>

            <div className="flex gap-1 sm:gap-2">
              {tutorialSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all ${
                    index === currentStep
                      ? 'bg-blue-500'
                      : isDarkTheme ? 'bg-gray-700' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-xs sm:text-sm font-medium hover:from-blue-600 hover:to-purple-600 transition-all transform hover:scale-105"
            >
              {currentStep === tutorialSteps.length - 1 ? "Let's Go!" : 'Next'}
            </button>
          </div>
        </div>

        {/* Pointer Arrow (for non-welcome steps) */}
        {step.highlight && (
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
            <div className={`w-4 h-4 rotate-45 ${
              isDarkTheme ? 'bg-gray-900' : 'bg-white'
            }`} />
          </div>
        )}

        {/* Highlight specific buttons */}
        {step.highlight && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="relative w-full h-full">
              {/* This would highlight specific elements - simplified for now */}
              <div className="absolute top-20 left-1/2 transform -translate-x-1/2">
                <div className="animate-pulse border-2 border-blue-500 rounded-full p-2">
                  <div className="w-24 sm:w-32 h-6 sm:h-8 bg-blue-500/20 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 