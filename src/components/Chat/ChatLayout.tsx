'use client'
import React from 'react'
import { ThemeToggle } from '../ThemeToggle'

interface ChatLayoutProps {
  children: React.ReactNode
}

export const ChatLayout = ({ children }: ChatLayoutProps) => {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <ThemeToggle />
      <div className="w-full py-24">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  )
} 