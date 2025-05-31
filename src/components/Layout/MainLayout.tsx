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
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Home
              </Link>
            </nav>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1">
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