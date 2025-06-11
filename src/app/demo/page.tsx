'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Play, Video, Heart, Monitor, Wand2, Star, Zap, ArrowRight } from 'lucide-react'
import { ModernCard } from '../../components/ui/modern-card'
import { ModernButton } from '../../components/ui/modern-button'

export default function DemoPage() {
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-700 to-indigo-800">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/30">
              <Play className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              See It In Action
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Experience Meetopia's powerful features through our interactive demo
            </p>
          </motion.div>
        </div>
      </div>

      {/* Demo Video Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Interactive Demo</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Watch how easy it is to connect with people worldwide
          </p>
        </div>

        <ModernCard className="p-8 max-w-4xl mx-auto">
          {/* Video Preview */}
          <div className="relative bg-gradient-to-br from-blue-900 to-purple-900 rounded-2xl overflow-hidden mb-8 aspect-video">
            <div className="absolute inset-0 flex items-center justify-center">
              {!isPlaying ? (
                <div className="text-center">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 mx-auto border border-white/30">
                    <Play className="w-10 h-10 text-white ml-1" />
                  </div>
                  <p className="text-white/80">Click to start demo</p>
                </div>
              ) : (
                <div className="w-full h-full flex">
                  <div className="flex-1 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Video className="w-16 h-16 mx-auto mb-4" />
                      <p>You</p>
                    </div>
                  </div>
                  <div className="flex-1 bg-gradient-to-br from-pink-500 to-orange-600 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Heart className="w-16 h-16 mx-auto mb-4" />
                      <p>Sarah from Canada</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="absolute inset-0 flex items-center justify-center hover:bg-black/10 transition-colors"
            >
              <span className="sr-only">Toggle demo</span>
            </button>
          </div>
          
          <div className="text-center">
            <ModernButton onClick={() => setIsPlaying(!isPlaying)}>
              {isPlaying ? 'Pause Demo' : 'Start Demo'}
            </ModernButton>
          </div>
        </ModernCard>
      </div>

      {/* Features Preview */}
      <div className="bg-white/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Key Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need for meaningful connections
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <ModernCard className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Matching</h3>
              <p className="text-gray-600">AI finds your perfect conversation partner</p>
            </ModernCard>

            <ModernCard className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Video className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">HD Video</h3>
              <p className="text-gray-600">Crystal clear video quality</p>
            </ModernCard>

            <ModernCard className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Wand2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Virtual Backgrounds</h3>
              <p className="text-gray-600">Professional backgrounds and effects</p>
            </ModernCard>

            <ModernCard className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Monitor className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Screen Sharing</h3>
              <p className="text-gray-600">Share and record your screen</p>
            </ModernCard>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">What Users Say</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <ModernCard className="p-6 text-center">
            <div className="flex justify-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
              ))}
            </div>
            <p className="text-gray-600 mb-4 italic">
              "Amazing platform! I've met incredible people from around the world."
            </p>
            <div className="text-sm">
              <div className="font-semibold text-gray-900">Sarah Chen</div>
              <div className="text-gray-500">Designer</div>
            </div>
          </ModernCard>

          <ModernCard className="p-6 text-center">
            <div className="flex justify-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
              ))}
            </div>
            <p className="text-gray-600 mb-4 italic">
              "The video quality is outstanding and matching works perfectly."
            </p>
            <div className="text-sm">
              <div className="font-semibold text-gray-900">Mike Johnson</div>
              <div className="text-gray-500">Developer</div>
            </div>
          </ModernCard>

          <ModernCard className="p-6 text-center">
            <div className="flex justify-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
              ))}
            </div>
            <p className="text-gray-600 mb-4 italic">
              "Safe, secure, and so easy to use. Highly recommended!"
            </p>
            <div className="text-sm">
              <div className="font-semibold text-gray-900">Emma Wilson</div>
              <div className="text-gray-500">Student</div>
            </div>
          </ModernCard>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-700 to-indigo-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Try It Yourself?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Start connecting with people from around the world in seconds.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/room/video">
                <ModernButton size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                  <Zap className="w-5 h-5 mr-2" />
                  Start Video Chat Now
                </ModernButton>
              </Link>
              
              <Link href="/profile/setup">
                <ModernButton 
                  variant="outline" 
                  size="lg" 
                  className="border-white text-white hover:bg-white hover:text-blue-600"
                >
                  Create Your Profile
                  <ArrowRight className="w-5 h-5 ml-2" />
                </ModernButton>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-center">
            <Link href="/">
              <ModernButton variant="ghost">
                ← Back to Home
              </ModernButton>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 