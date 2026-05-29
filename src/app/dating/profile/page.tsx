'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DatingProfilePage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    lookingFor: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load existing profile data if available
  useEffect(() => {
    const savedProfile = localStorage.getItem('datingProfileFormatted')
    if (savedProfile) {
      try {
        setFormData(JSON.parse(savedProfile))
      } catch (e) {
        console.error('Error parsing saved profile', e)
      }
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.age || !formData.gender || !formData.lookingFor) {
      return // Basic validation
    }
    
    setIsSubmitting(true)
    
    // Save profile data to localStorage
    localStorage.setItem('datingProfileFormatted', JSON.stringify({
      ...formData,
      interests: [],
      age: parseInt(formData.age),
      bio: `Hi, I'm ${formData.name}. Let's chat!` // Default bio
    }))
    
    // Go directly to video dating
    setTimeout(() => {
      router.push('/chat/video?mode=dating')
    }, 800)
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="w-full max-w-md p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Quick Profile</h1>
          <p className="text-gray-400">Takes 10 seconds, gets you better matches</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <input
              type="text"
              name="name"
              placeholder="First name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-4 rounded-lg bg-gray-900 border border-gray-800 text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <input
                type="number"
                name="age"
                min="18"
                max="99"
                placeholder="Age (18+)"
                value={formData.age}
                onChange={handleChange}
                required
                className="w-full p-4 rounded-lg bg-gray-900 border border-gray-800 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                className="w-full p-4 rounded-lg bg-gray-900 border border-gray-800 text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="">I am...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <select
              name="lookingFor"
              value={formData.lookingFor}
              onChange={handleChange}
              required
              className="w-full p-4 rounded-lg bg-gray-900 border border-gray-800 text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="">I want to meet...</option>
              <option value="male">Men</option>
              <option value="female">Women</option>
              <option value="both">Everyone</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg transition-opacity disabled:opacity-70 flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <span className="mr-2">Connecting...</span>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </>
            ) : (
              'Start Video Dating'
            )}
          </button>
        </form>
        
        <p className="text-gray-500 text-xs text-center mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
} 