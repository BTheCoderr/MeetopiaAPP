'use client'
import React from 'react'
import Link from 'next/link'

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Meetopia
          </Link>
          
          <div className="flex gap-6">
            <Link 
              href="/" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Home
            </Link>
            <Link 
              href="/test-video" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Test Video
            </Link>
            <Link 
              href="/test-chat" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Test Chat
            </Link>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="container mx-auto px-4 py-4 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} Meetopia - Connect with people worldwide
        </div>
      </footer>
    </div>
  )
}