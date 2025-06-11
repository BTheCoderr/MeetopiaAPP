import React from 'react'
import { motion } from 'framer-motion'

interface ModernCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  glow?: boolean
  gradient?: boolean
  onClick?: () => void
}

export function ModernCard({ 
  children, 
  className = '', 
  hover = true, 
  glow = false, 
  gradient = false,
  onClick 
}: ModernCardProps) {
  const baseClasses = `
    relative overflow-hidden rounded-2xl backdrop-blur-lg border border-white/10
    ${gradient ? 'bg-gradient-to-br from-white/5 to-white/10' : 'bg-white/5'}
    ${glow ? 'shadow-2xl shadow-blue-500/20' : 'shadow-xl'}
    ${hover ? 'transition-all duration-300 hover:scale-105 hover:shadow-2xl' : ''}
    ${onClick ? 'cursor-pointer' : ''}
    ${className}
  `

  return (
    <motion.div
      className={baseClasses}
      onClick={onClick}
      whileHover={hover ? { scale: 1.02 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
    >
      {glow && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-50" />
      )}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  )
}

export function ModernCardHeader({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`p-6 pb-4 ${className}`}>
      {children}
    </div>
  )
}

export function ModernCardContent({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`px-6 pb-6 ${className}`}>
      {children}
    </div>
  )
}

export function ModernCardFooter({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`px-6 pb-6 pt-4 border-t border-white/10 ${className}`}>
      {children}
    </div>
  )
} 