'use client'
import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Brain,
  Video,
  Wand2,
  Monitor,
  Shield,
  Users,
  Calendar,
  MessageSquare,
  Globe,
  Zap,
  Heart,
  Star
} from 'lucide-react'
import { ModernCard } from '../../components/ui/modern-card'
import { ModernButton } from '../../components/ui/modern-button'

const features = [
  {
    icon: Brain,
    title: 'Smart Matching Algorithm',
    description: 'AI-powered matching based on interests, location, languages, and preferences',
    details: ['Compatibility scoring', 'Interest analysis', 'Location-based matching', 'Language preferences'],
    color: 'from-purple-500 to-indigo-600'
  },
  {
    icon: Video,
    title: 'HD Video Chat',
    description: 'Crystal clear video calls with adaptive quality and professional features',
    details: ['1080p HD quality', 'Adaptive bitrate', 'Network optimization', 'Low latency'],
    color: 'from-blue-500 to-cyan-600'
  },
  {
    icon: Wand2,
    title: 'Virtual Backgrounds',
    description: 'Professional backgrounds, blur effects, and custom uploads',
    details: ['50+ backgrounds', 'Blur effects', 'Custom uploads', 'Real-time processing'],
    color: 'from-pink-500 to-rose-600'
  },
  {
    icon: Monitor,
    title: 'Screen Sharing',
    description: 'Share your screen with recording and annotation capabilities',
    details: ['Full screen sharing', 'Application sharing', 'Recording support', 'Annotation tools'],
    color: 'from-green-500 to-emerald-600'
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'End-to-end encryption and comprehensive safety features',
    details: ['End-to-end encryption', 'Report & block system', 'Moderation tools', 'Privacy controls'],
    color: 'from-orange-500 to-amber-600'
  },
  {
    icon: Users,
    title: 'Group Video Chat',
    description: 'Connect with multiple people in group video sessions',
    details: ['Up to 8 participants', 'Breakout rooms', 'Moderation controls', 'Group activities'],
    color: 'from-teal-500 to-green-600'
  },
  {
    icon: Calendar,
    title: 'Calendar Integration',
    description: 'Schedule meetings and sync with your favorite calendar apps',
    details: ['Google Calendar sync', 'Meeting scheduling', 'Reminders', 'Time zone support'],
    color: 'from-violet-500 to-purple-600'
  },
  {
    icon: MessageSquare,
    title: 'Persistent Chat',
    description: 'Keep conversations going with persistent messaging',
    details: ['Message history', 'File sharing', 'Emoji reactions', 'Read receipts'],
    color: 'from-indigo-500 to-blue-600'
  },
  {
    icon: Globe,
    title: 'Global Community',
    description: 'Connect with people from around the world in your language',
    details: ['195+ countries', '50+ languages', 'Cultural matching', 'Time zone aware'],
    color: 'from-emerald-500 to-teal-600'
  }
]

const stats = [
  { icon: Users, label: 'Active Users', value: '2M+', color: 'text-blue-600' },
  { icon: Heart, label: 'Connections Made', value: '50M+', color: 'text-pink-600' },
  { icon: Star, label: 'Average Rating', value: '4.9★', color: 'text-amber-600' },
  { icon: Zap, label: 'Uptime', value: '99.9%', color: 'text-green-600' }
]

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-700 to-indigo-800">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cdefs%3E%3Cpattern%20id%3D%22grid%22%20width%3D%2220%22%20height%3D%2220%22%20patternUnits%3D%22userSpaceOnUse%22%3E%3Cpath%20d%3D%22M%2020%200%20L%200%200%200%2020%22%20fill%3D%22none%22%20stroke%3D%22rgba(255%2C255%2C255%2C0.1)%22%20stroke-width%3D%221%22/%3E%3C/pattern%3E%3C/defs%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22url(%23grid)%22/%3E%3C/svg%3E')] opacity-20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/30"
            >
              <Star className="w-10 h-10 text-white" />
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Powerful Features
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Discover everything that makes Meetopia the world's most advanced 
              video chat and networking platform
            </p>
          </motion.div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {stats.map((stat, index) => (
            <ModernCard key={stat.label} className="text-center p-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`w-12 h-12 ${stat.color} bg-gradient-to-br from-current to-current/70 rounded-2xl flex items-center justify-center mx-auto mb-4 opacity-20`}
              >
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </motion.div>
              <div className={`text-3xl font-bold ${stat.color} mb-2`}>
                {stat.value}
              </div>
              <div className="text-gray-600 font-medium">
                {stat.label}
              </div>
            </ModernCard>
          ))}
        </motion.div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Everything You Need to Connect
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From AI-powered matching to enterprise-grade security, 
            every feature is designed to create meaningful connections
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <ModernCard className="h-full p-8 group hover:scale-105 transition-all duration-300">
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {feature.description}
                </p>
                
                <ul className="space-y-2">
                  {feature.details.map((detail, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-500">
                      <div className={`w-2 h-2 bg-gradient-to-r ${feature.color} rounded-full mr-3`}></div>
                      {detail}
                    </li>
                  ))}
                </ul>
              </ModernCard>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-700 to-indigo-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Experience These Features?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join millions of users who are already connecting through our platform
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/room/video">
                <ModernButton size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                  <Zap className="w-5 h-5 mr-2" />
                  Start Connecting Now
                </ModernButton>
              </Link>
              
              <Link href="/demo">
                <ModernButton 
                  variant="outline" 
                  size="lg" 
                  className="border-white text-white hover:bg-white hover:text-blue-600"
                >
                  <Video className="w-5 h-5 mr-2" />
                  Watch Demo
                </ModernButton>
              </Link>
            </div>
          </motion.div>
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