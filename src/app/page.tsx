'use client'
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ModernCard, ModernCardHeader, ModernCardContent } from '@/components/ui/modern-card'
import { ModernButton } from '@/components/ui/modern-button'
import {
  Video, MessageCircle, Users, Sparkles, Shield, Globe,
  Camera, Mic, MonitorSpeaker, Settings, Heart, Star,
  Zap, Award, TrendingUp, Clock, Brain, Wand2
} from 'lucide-react'
import Link from 'next/link'
import Logo from '@/components/Logo'

export default function HomePage() {
  const [isDarkTheme, setIsDarkTheme] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [activeFeature, setActiveFeature] = useState(0)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [showMiniDemo, setShowMiniDemo] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    
    // Load theme preference from localStorage
    const savedTheme = localStorage.getItem('meetopia-theme')
    if (savedTheme === 'dark') {
      setIsDarkTheme(true)
    } else if (savedTheme === 'light') {
      setIsDarkTheme(false)
    }
    
    // Auto-rotate testimonials
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const toggleTheme = () => {
    const newTheme = !isDarkTheme
    setIsDarkTheme(newTheme)
    localStorage.setItem('meetopia-theme', newTheme ? 'dark' : 'light')
  }

  const features = [
    {
      icon: Brain,
      title: 'Smart Matching',
      description: 'AI-powered algorithm matches you with compatible people based on interests, location, and preferences',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      icon: Video,
      title: 'HD Video Chat',
      description: 'Crystal clear video calls with adaptive quality and virtual backgrounds',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      icon: Wand2,
      title: 'Virtual Backgrounds',
      description: 'Professional backgrounds, blur effects, and custom uploads for perfect video calls',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    {
      icon: MonitorSpeaker,
      title: 'Screen Sharing',
      description: 'Share your screen, presentations, or applications with recording capabilities',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10'
    },
    {
      icon: Shield,
      title: 'Safe & Secure',
      description: 'End-to-end encryption, reporting tools, and advanced safety features',
      color: 'text-red-500',
      bgColor: 'bg-red-500/10'
    },
    {
      icon: Globe,
      title: 'Global Community',
      description: 'Connect with people worldwide with language preferences and location matching',
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10'
    }
  ]

  const stats = [
    { number: '1.2K+', label: 'Active Users', icon: Users },
    { number: '8.5K+', label: 'Connections Made', icon: Heart },
    { number: '99.2%', label: 'Uptime', icon: TrendingUp },
    { number: '5.0★', label: 'User Rating', icon: Star }
  ]

  const testimonials = [
    {
      text: "The smart matching really works! I've met amazing people who share my interests.",
      author: "Sarah M.",
      location: "New York, USA",
      avatar: "👩‍💼"
    },
    {
      text: "Virtual backgrounds make me feel confident in video calls. Love the quality!",
      author: "Alex K.",
      location: "London, UK",
      avatar: "👨‍💻"
    },
    {
      text: "Screen sharing helped me collaborate with new friends on projects. Brilliant feature!",
      author: "Maria S.",
      location: "Barcelona, Spain",
      avatar: "👩‍🎨"
    }
  ]

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-6xl"
        >
          🎥
        </motion.div>
      </div>
    )
  }
  
  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      isDarkTheme 
        ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900' 
        : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
    }`}>
      {/* Header */}
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-50"
      >
        {/* Floating Virtual Background Elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{ 
              y: [-20, 20, -20],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ 
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-20 left-10 text-4xl opacity-20"
          >
            🏖️
          </motion.div>
          <motion.div
            animate={{ 
              y: [20, -20, 20],
              rotate: [0, -15, 15, 0]
            }}
            transition={{ 
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
            className="absolute top-32 right-16 text-3xl opacity-25"
          >
            🌸
          </motion.div>
          <motion.div
            animate={{ 
              y: [-15, 25, -15],
              rotate: [0, 20, -20, 0]
            }}
            transition={{ 
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
            className="absolute top-60 left-1/4 text-5xl opacity-15"
          >
            🎭
          </motion.div>
          <motion.div
            animate={{ 
              y: [25, -15, 25],
              rotate: [0, -10, 10, 0]
            }}
            transition={{ 
              duration: 9,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 3
            }}
            className="absolute bottom-40 right-1/4 text-4xl opacity-20"
          >
            🎨
          </motion.div>
          <motion.div
            animate={{ 
              y: [-10, 30, -10],
              rotate: [0, 25, -25, 0]
            }}
            transition={{ 
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 4
            }}
            className="absolute bottom-20 left-20 text-3xl opacity-25"
          >
            🌟
          </motion.div>
        </div>

        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Logo 
              size="lg" 
              isDarkTheme={isDarkTheme}
              showText={true}
            />

            <div className="flex items-center gap-4">
              <ModernButton
                variant="outline"
                size="sm"
                onClick={toggleTheme}
                icon={isDarkTheme ? '☀️' : '🌙'}
              >
                {isDarkTheme ? 'Light' : 'Dark'}
              </ModernButton>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-8xl mb-8"
          >
            🚀
          </motion.div>
          
          <motion.h1
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={`text-5xl lg:text-7xl font-bold mb-6 ${
              isDarkTheme ? 'text-white' : 'text-gray-900'
            }`}
          >
            Meet People
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Worldwide
            </span>
          </motion.h1>

          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className={`text-xl lg:text-2xl mb-12 ${
              isDarkTheme ? 'text-gray-300' : 'text-gray-600'
            } max-w-3xl mx-auto`}
          >
            Advanced video chat platform with smart matching, fun virtual backgrounds, 
            screen sharing, and enterprise-grade security. Connect with confidence and style! 🎨✨
          </motion.p>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col gap-4 justify-center items-center max-w-2xl mx-auto"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              <Link href="/chat/video">
                <ModernButton
                  variant="gradient"
                  size="xl"
                  className="w-full"
                  icon={<Sparkles size={24} />}
                >
                  Start Connecting Now
                </ModernButton>
              </Link>
              
              <ModernButton
                variant="outline"
                size="xl"
                className="w-full"
                icon={<Video size={24} />}
                onClick={() => setShowMiniDemo(true)}
              >
                Watch Demo
              </ModernButton>
            </div>
            
            <Link href="/profile/setup" className="w-full">
              <ModernButton
                variant="secondary"
                size="xl"
                className="w-full"
                icon={<Users size={24} />}
              >
                Create Profile
              </ModernButton>
            </Link>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-20"
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="text-center"
                >
                  <Icon className={`mx-auto mb-2 ${isDarkTheme ? 'text-blue-400' : 'text-blue-600'}`} size={32} />
                  <div className={`text-3xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                    {stat.number}
                  </div>
                  <div className={`text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                    {stat.label}
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className={`text-4xl lg:text-5xl font-bold mb-6 ${
            isDarkTheme ? 'text-white' : 'text-gray-900'
          }`}>
            Powerful Features
          </h2>
          <p className={`text-xl ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
            Everything you need for meaningful connections with cutting-edge technology
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <ModernCard className="h-full" glow={index === activeFeature}>
                  <ModernCardContent className="text-center">
                    <div className={`w-16 h-16 ${feature.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                      <Icon className={feature.color} size={32} />
                    </div>
                    <h3 className={`text-xl font-bold mb-4 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                      {feature.title}
                    </h3>
                    <p className={`${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                      {feature.description}
                    </p>
                  </ModernCardContent>
                </ModernCard>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className={`text-4xl lg:text-5xl font-bold mb-6 ${
            isDarkTheme ? 'text-white' : 'text-gray-900'
          }`}>
            What People Say
          </h2>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTestimonial}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
            >
              <ModernCard className="text-center" gradient>
                <ModernCardContent>
                  <div className="text-6xl mb-6">
                    {testimonials[currentTestimonial].avatar}
                  </div>
                  <blockquote className={`text-xl lg:text-2xl mb-6 italic ${
                    isDarkTheme ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    "{testimonials[currentTestimonial].text}"
                  </blockquote>
                  <div>
                    <div className={`font-bold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                      {testimonials[currentTestimonial].author}
                    </div>
                    <div className={`text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                      {testimonials[currentTestimonial].location}
                    </div>
                  </div>
                </ModernCardContent>
              </ModernCard>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentTestimonial 
                    ? 'bg-blue-600 scale-125' 
                    : isDarkTheme ? 'bg-gray-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <ModernCard gradient glow className="max-w-4xl mx-auto">
            <ModernCardContent>
              <div className="text-6xl mb-6">✨</div>
              <h2 className={`text-3xl lg:text-4xl font-bold mb-6 ${
                isDarkTheme ? 'text-white' : 'text-gray-900'
              }`}>
                Ready to Start Connecting?
              </h2>
              <p className={`text-lg mb-8 ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
                Join millions of users already making meaningful connections worldwide. 
                It's free, fast, and secure.
              </p>
              
              <div className="flex justify-center mb-8">
                <Link href="/chat/video">
                  <ModernButton
                    variant="gradient"
                    size="xl"
                    icon={<Zap size={24} />}
                  >
                    Start Connecting Now
                  </ModernButton>
                </Link>
              </div>

              <div className="mt-8 flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Shield size={16} className="text-green-500" />
                  <span className={isDarkTheme ? 'text-gray-300' : 'text-gray-600'}>
                    100% Secure
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap size={16} className="text-yellow-500" />
                  <span className={isDarkTheme ? 'text-gray-300' : 'text-gray-600'}>
                    Instant Connect
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-blue-500" />
                  <span className={isDarkTheme ? 'text-gray-300' : 'text-gray-600'}>
                    24/7 Available
                  </span>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-12 border-t border-gray-200 dark:border-gray-800">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img 
              src="/meetopia.png" 
              alt="Meetopia" 
              className="h-8 w-auto"
            />
          </div>
          <p className={`text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
            Connecting the world, one conversation at a time.
          </p>
        </div>
      </footer>

      {/* Mini Demo Modal */}
      <AnimatePresence>
        {showMiniDemo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowMiniDemo(false)}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="text-6xl mb-6">🎥</div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  How Meetopia Works
                </h2>
                <p className="text-gray-600 mb-8">
                  See how easy it is to connect with people worldwide
                </p>

                <div className="space-y-6 text-left">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Smart Matching</h3>
                      <p className="text-gray-600">Our AI finds you compatible conversation partners based on interests and preferences.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">HD Video Chat</h3>
                      <p className="text-gray-600">Connect face-to-face with crystal clear video and professional virtual backgrounds.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Safe & Secure</h3>
                      <p className="text-gray-600">All conversations are encrypted with built-in safety features and reporting tools.</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="/chat/video" className="flex-1">
                      <ModernButton
                        variant="gradient"
                        size="lg"
                        className="w-full"
                        onClick={() => setShowMiniDemo(false)}
                      >
                        Try It Now
                      </ModernButton>
                    </Link>
                    <ModernButton
                      variant="outline"
                      size="lg"
                      className="flex-1"
                      onClick={() => setShowMiniDemo(false)}
                    >
                      Close Demo
                    </ModernButton>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
