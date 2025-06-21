'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Image from 'next/image'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  isDarkTheme?: boolean
}

export default function Logo({ 
  className = '', 
  size = 'md', 
  showText = true,
  isDarkTheme = false 
}: LogoProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  }

  const textSizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl'
  }

  const iconSize = {
    sm: 32,
    md: 40,
    lg: 48
  }

  return (
    <Link 
      href="/" 
      className={`flex items-center gap-3 hover:opacity-80 transition-all duration-300 group ${className}`}
    >
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-3"
      >
        {/* Your Actual Meetopia Logo */}
        <div className={`${sizeClasses[size]} relative flex items-center justify-center`}>
          <Image
            src="/meetopia-logo.png"
            alt="Meetopia Logo"
            width={iconSize[size]}
            height={iconSize[size]}
            className="rounded-full drop-shadow-lg group-hover:drop-shadow-xl transition-all duration-300 object-cover"
            priority
          />
          
          {/* Animated glow effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-20 animate-pulse" />
        </div>

        {showText && (
          <div className="flex flex-col">
            <span className={`${textSizeClasses[size]} font-bold leading-none ${
              isDarkTheme ? 'text-white' : 'text-gray-900'
            } tracking-tight`}>
              <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Meet
              </span>
              <span className={isDarkTheme ? 'text-white' : 'text-gray-700'}>
                opia
              </span>
            </span>
            <span className={`text-xs ${
              isDarkTheme ? 'text-gray-400' : 'text-gray-500'
            } font-medium tracking-wide`}>
              Connect Worldwide
            </span>
          </div>
        )}
      </motion.div>
    </Link>
  )
} 