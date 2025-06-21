'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'

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
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12'
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
        {/* Custom Modern SVG Logo */}
        <div className={`${sizeClasses[size]} relative flex items-center justify-center`}>
          <svg
            width={iconSize[size]}
            height={iconSize[size]}
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-lg group-hover:drop-shadow-xl transition-all duration-300"
          >
            {/* Outer gradient circle */}
            <defs>
              <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="50%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#EC4899" />
              </linearGradient>
            </defs>
            
            {/* Main circle with gradient */}
            <circle
              cx="24"
              cy="24"
              r="22"
              fill="url(#logoGradient)"
              className="drop-shadow-md"
            />
            
            {/* Inner circle for contrast */}
            <circle
              cx="24"
              cy="24"
              r="20"
              fill="rgba(255,255,255,0.1)"
            />
            
            {/* T Letter - Top horizontal line */}
            <path
              d="M12 16 L36 16"
              stroke="white"
              strokeWidth="4"
              strokeLinecap="round"
            />
            
            {/* T Letter - Vertical line */}
            <path
              d="M24 16 L24 36"
              stroke="white"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
          
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