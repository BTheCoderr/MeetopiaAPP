'use client'
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Header() {
  const pathname = usePathname()
  
  // Don't show header on video chat page
  if (pathname === '/chat/video') {
    return null
  }
  
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <h1 className="text-2xl font-bold">
              <span className="text-blue-600">Meet</span>
              <span className="text-gray-900">opia</span>
            </h1>
          </Link>
          
          <nav className="flex gap-6">
            <Link 
              href="/" 
              className={`transition-colors ${
                pathname === '/' 
                  ? 'text-blue-600 font-medium' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Home
            </Link>
            <Link 
              href="/chat/video" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Start Chat
            </Link>
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault()
                window.open('/test-camera.html', '_blank')
              }}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Test Camera
            </a>
          </nav>
        </div>
      </div>
    </header>
  )
} 