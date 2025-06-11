'use client'
import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Heart,
  Globe,
  Users,
  Shield,
  Zap,
  Star,
  Trophy,
  Target,
  CheckCircle,
  ArrowRight
} from 'lucide-react'
import { ModernCard } from '../../components/ui/modern-card'
import { ModernButton } from '../../components/ui/modern-button'

const milestones = [
  { year: '2023', title: 'Meetopia Founded', description: 'Started with a vision to connect people worldwide' },
  { year: '2023', title: '100K Users', description: 'Reached our first major milestone' },
  { year: '2024', title: '1M Connections', description: 'Facilitated over 1 million meaningful connections' },
  { year: '2024', title: 'Global Expansion', description: 'Launched in 50+ countries with multi-language support' },
  { year: '2024', title: '2M+ Users', description: 'Growing community of active users worldwide' }
]

const values = [
  {
    icon: Heart,
    title: 'Human Connection',
    description: 'We believe in the power of genuine human connections to transform lives and build communities.',
    color: 'from-pink-500 to-rose-600'
  },
  {
    icon: Globe,
    title: 'Global Community',
    description: 'Breaking down barriers between cultures, languages, and continents to unite the world.',
    color: 'from-blue-500 to-cyan-600'
  },
  {
    icon: Shield,
    title: 'Safety First',
    description: 'Creating a secure environment where everyone can connect with confidence and peace of mind.',
    color: 'from-green-500 to-emerald-600'
  },
  {
    icon: Zap,
    title: 'Innovation',
    description: 'Continuously pushing boundaries with cutting-edge technology and user-centered design.',
    color: 'from-purple-500 to-indigo-600'
  }
]

const team = [
  {
    name: 'Alex Chen',
    role: 'CEO & Co-Founder',
    bio: 'Former Google engineer with a passion for connecting people through technology.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face'
  },
  {
    name: 'Sarah Johnson',
    role: 'CTO & Co-Founder',
    bio: 'AI/ML expert focused on building intelligent matching algorithms.',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b5b7d5b2?w=400&h=400&fit=crop&crop=face'
  },
  {
    name: 'Marcus Williams',
    role: 'Head of Product',
    bio: 'UX designer turned product leader, obsessed with user experience.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face'
  },
  {
    name: 'Emma Rodriguez',
    role: 'Head of Community',
    bio: 'Community building expert ensuring safe and inclusive connections.',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face'
  }
]

const achievements = [
  { icon: Users, label: 'Active Users', value: '2M+' },
  { icon: Heart, label: 'Connections Made', value: '50M+' },
  { icon: Globe, label: 'Countries', value: '195+' },
  { icon: Star, label: 'App Rating', value: '4.9★' }
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-700 to-indigo-800">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>
        
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
              <Heart className="w-10 h-10 text-white" />
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Our Story
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Building bridges between people, cultures, and communities through 
              meaningful connections and innovative technology
            </p>
          </motion.div>
        </div>
      </div>

      {/* Mission Statement */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-center mb-16"
        >
          <ModernCard className="p-12 max-w-4xl mx-auto">
            <Target className="w-16 h-16 text-blue-600 mx-auto mb-8" />
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              To create a world where distance, language, and cultural barriers never prevent 
              meaningful human connections. We envision a global community where everyone can 
              find their tribe, share experiences, and build lasting relationships through 
              safe, innovative, and intuitive technology.
            </p>
          </ModernCard>
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-24"
        >
          {achievements.map((achievement, index) => (
            <ModernCard key={achievement.label} className="text-center p-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6"
              >
                <achievement.icon className="w-8 h-8 text-white" />
              </motion.div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {achievement.value}
              </div>
              <div className="text-gray-600 font-medium">
                {achievement.label}
              </div>
            </ModernCard>
          ))}
        </motion.div>
      </div>

      {/* Values Section */}
      <div className="bg-white/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide everything we do and every decision we make
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <ModernCard className="p-8 h-full">
                  <div className={`w-16 h-16 bg-gradient-to-br ${value.color} rounded-2xl flex items-center justify-center mb-6`}>
                    <value.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {value.description}
                  </p>
                </ModernCard>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Journey</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From a simple idea to a global platform connecting millions
          </p>
        </motion.div>

        <div className="relative">
          <div className="absolute left-1/2 transform -translate-x-0.5 h-full w-0.5 bg-gradient-to-b from-blue-500 to-purple-600"></div>
          
          {milestones.map((milestone, index) => (
            <motion.div
              key={milestone.year + milestone.title}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className={`relative flex items-center mb-12 ${
                index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
              }`}
            >
              <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8'}`}>
                <ModernCard className="p-6">
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    {milestone.year}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {milestone.title}
                  </h3>
                  <p className="text-gray-600">
                    {milestone.description}
                  </p>
                </ModernCard>
              </div>
              
              <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full border-4 border-white shadow-lg"></div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-white/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Meet Our Team</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The passionate people behind Meetopia's mission to connect the world
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <ModernCard className="p-6 text-center">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                  />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {member.name}
                  </h3>
                  <p className="text-blue-600 font-medium mb-3">
                    {member.role}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {member.bio}
                  </p>
                </ModernCard>
              </motion.div>
            ))}
          </div>
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
              Join Our Global Community
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Be part of the story. Connect with people who share your interests, 
              values, and dreams from around the world.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/room/video">
                <ModernButton size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                  <Heart className="w-5 h-5 mr-2" />
                  Start Connecting
                </ModernButton>
              </Link>
              
              <Link href="/features">
                <ModernButton 
                  variant="outline" 
                  size="lg" 
                  className="border-white text-white hover:bg-white hover:text-blue-600"
                >
                  Explore Features
                  <ArrowRight className="w-5 h-5 ml-2" />
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