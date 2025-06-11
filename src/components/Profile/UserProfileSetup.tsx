'use client'
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ModernCard, ModernCardHeader, ModernCardContent } from '@/components/ui/modern-card'
import { ModernButton } from '@/components/ui/modern-button'
import { UserProfile, MatchingPreferences, UserSettings } from '@/types/user'
import {
  User, Globe, Heart, Settings, Languages, Clock, Shield,
  Camera, Mic, Volume2, Bell, Accessibility, Save
} from 'lucide-react'

interface UserProfileSetupProps {
  onComplete: (profile: Partial<UserProfile>) => void
  existingProfile?: Partial<UserProfile>
}

export function UserProfileSetup({ onComplete, existingProfile }: UserProfileSetupProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    username: '',
    displayName: '',
    age: undefined,
    interests: [],
    languages: ['English'],
    bio: '',
    preferences: {
      matching: {
        ageRange: { min: 18, max: 35 },
        languages: ['English'],
        interests: [],
        location: {},
        chatType: 'both',
        sessionLength: '10min',
        maturityLevel: 'all'
      },
      privacy: {
        showAge: true,
        showLocation: false,
        allowScreenshots: false,
        allowRecording: false,
        blockList: [],
        reportHistory: []
      },
      notifications: {
        newMatch: true,
        messageReceived: true,
        connectionLost: true,
        systemUpdates: false,
        emailNotifications: false
      },
      accessibility: {
        highContrast: false,
        largeText: false,
        reducedMotion: false,
        screenReader: false,
        closedCaptions: false,
        keyboardNavigation: false
      }
    },
    settings: {
      theme: 'auto',
      language: 'English',
      videoQuality: 'auto',
      audioQuality: 'auto',
      autoConnect: false,
      showTutorial: true,
      betaFeatures: false
    },
    ...existingProfile
  })

  const steps = [
    { id: 'basic', title: 'Basic Info', icon: User },
    { id: 'interests', title: 'Interests', icon: Heart },
    { id: 'matching', title: 'Matching', icon: Globe },
    { id: 'privacy', title: 'Privacy', icon: Shield },
    { id: 'settings', title: 'Settings', icon: Settings }
  ]

  const popularInterests = [
    'Movies', 'Music', 'Travel', 'Gaming', 'Sports', 'Technology',
    'Art', 'Photography', 'Cooking', 'Reading', 'Fitness', 'Nature',
    'Fashion', 'Dancing', 'Languages', 'Science', 'History', 'Philosophy'
  ]

  const languages = [
    'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese',
    'Russian', 'Chinese', 'Japanese', 'Korean', 'Arabic', 'Hindi'
  ]

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }))
  }

  const updatePreferences = (section: keyof UserProfile['preferences'], updates: any) => {
    setProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences!,
        [section]: { ...prev.preferences![section], ...updates }
      }
    }))
  }

  const updateSettings = (updates: Partial<UserSettings>) => {
    setProfile(prev => ({
      ...prev,
      settings: { ...prev.settings!, ...updates }
    }))
  }

  const toggleInterest = (interest: string) => {
    const currentInterests = profile.interests || []
    const newInterests = currentInterests.includes(interest)
      ? currentInterests.filter(i => i !== interest)
      : [...currentInterests, interest]
    updateProfile({ interests: newInterests })
  }

  const toggleLanguage = (language: string) => {
    const currentLanguages = profile.languages || []
    const newLanguages = currentLanguages.includes(language)
      ? currentLanguages.filter(l => l !== language)
      : [...currentLanguages, language]
    updateProfile({ languages: newLanguages })
  }

  const renderBasicInfo = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Username
          </label>
          <input
            type="text"
            value={profile.username || ''}
            onChange={(e) => updateProfile({ username: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Your unique username"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Display Name (Optional)
          </label>
          <input
            type="text"
            value={profile.displayName || ''}
            onChange={(e) => updateProfile({ displayName: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="How others will see you"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Age
          </label>
          <input
            type="number"
            min="13"
            max="100"
            value={profile.age || ''}
            onChange={(e) => updateProfile({ age: parseInt(e.target.value) || undefined })}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Your age"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Bio (Optional)
          </label>
          <textarea
            value={profile.bio || ''}
            onChange={(e) => updateProfile({ bio: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Tell others about yourself..."
            maxLength={200}
          />
          <p className="text-sm text-gray-500 mt-1">
            {(profile.bio || '').length}/200 characters
          </p>
        </div>
      </div>
    </motion.div>
  )

  const renderInterests = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Select Your Interests
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Choose what you're passionate about to find better matches
        </p>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {popularInterests.map((interest) => (
            <motion.button
              key={interest}
              onClick={() => toggleInterest(interest)}
              className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                (profile.interests || []).includes(interest)
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {interest}
            </motion.button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Languages You Speak
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {languages.map((language) => (
            <motion.button
              key={language}
              onClick={() => toggleLanguage(language)}
              className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                (profile.languages || []).includes(language)
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {language}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  )

  const renderMatchingPreferences = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Age Range
          </label>
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">Min:</span>
              <input
                type="range"
                min="13"
                max="80"
                value={profile.preferences?.matching.ageRange.min || 18}
                onChange={(e) => updatePreferences('matching', {
                  ageRange: {
                    ...profile.preferences?.matching.ageRange,
                    min: parseInt(e.target.value)
                  }
                })}
                className="flex-1"
              />
              <span className="text-sm font-medium w-8">
                {profile.preferences?.matching.ageRange.min || 18}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">Max:</span>
              <input
                type="range"
                min="13"
                max="80"
                value={profile.preferences?.matching.ageRange.max || 35}
                onChange={(e) => updatePreferences('matching', {
                  ageRange: {
                    ...profile.preferences?.matching.ageRange,
                    max: parseInt(e.target.value)
                  }
                })}
                className="flex-1"
              />
              <span className="text-sm font-medium w-8">
                {profile.preferences?.matching.ageRange.max || 35}
              </span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Preferred Chat Type
          </label>
          <div className="space-y-2">
            {[
              { value: 'video', label: 'Video Only', icon: Camera },
              { value: 'text', label: 'Text Only', icon: Mic },
              { value: 'both', label: 'Both Video & Text', icon: Volume2 }
            ].map(({ value, label, icon: Icon }) => (
              <label key={value} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <input
                  type="radio"
                  name="chatType"
                  value={value}
                  checked={profile.preferences?.matching.chatType === value}
                  onChange={(e) => updatePreferences('matching', { chatType: e.target.value })}
                  className="text-blue-600"
                />
                <Icon size={18} className="text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Session Length Preference
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { value: '3min', label: '3 Minutes' },
            { value: '5min', label: '5 Minutes' },
            { value: '10min', label: '10 Minutes' },
            { value: 'unlimited', label: 'No Limit' }
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => updatePreferences('matching', { sessionLength: value })}
              className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                profile.preferences?.matching.sessionLength === value
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <Clock size={16} className="mx-auto mb-1" />
              {label}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  )

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: return renderBasicInfo()
      case 1: return renderInterests()
      case 2: return renderMatchingPreferences()
      case 3: return (
        <div className="text-center py-8">
          <Shield size={48} className="mx-auto mb-4 text-green-600" />
          <h3 className="text-lg font-semibold mb-2">Privacy & Safety</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your privacy settings are configured for maximum safety by default.
            You can adjust these later in your profile settings.
          </p>
        </div>
      )
      case 4: return (
        <div className="text-center py-8">
          <Settings size={48} className="mx-auto mb-4 text-blue-600" />
          <h3 className="text-lg font-semibold mb-2">Settings Configured</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your default settings have been applied. You can customize them
            further in your profile settings at any time.
          </p>
        </div>
      )
      default: return null
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 0: return profile.username && profile.username.length >= 3
      case 1: return (profile.interests?.length || 0) >= 1 && (profile.languages?.length || 0) >= 1
      case 2: return true
      case 3: return true
      case 4: return true
      default: return false
    }
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete(profile)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-4">
          Complete Your Profile
        </h1>
        <div className="flex justify-center items-center gap-4 mb-6">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={step.id} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  index <= currentStep 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                }`}>
                  <Icon size={18} />
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-1 mx-2 transition-all duration-300 ${
                    index < currentStep ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                )}
              </div>
            )
          })}
        </div>
        <p className="text-center text-gray-600 dark:text-gray-400">
          Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
        </p>
      </div>

      <ModernCard className="mb-6">
        <ModernCardContent>
          <AnimatePresence mode="wait">
            {renderStepContent()}
          </AnimatePresence>
        </ModernCardContent>
      </ModernCard>

      <div className="flex justify-between">
        <ModernButton
          variant="outline"
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
        >
          Previous
        </ModernButton>
        
        <ModernButton
          variant={currentStep === steps.length - 1 ? 'gradient' : 'primary'}
          onClick={handleNext}
          disabled={!canProceed()}
          icon={currentStep === steps.length - 1 ? <Save size={18} /> : undefined}
        >
          {currentStep === steps.length - 1 ? 'Complete Profile' : 'Next'}
        </ModernButton>
      </div>
    </div>
  )
} 