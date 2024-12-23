import React from 'react'
import Link from 'next/link'
import ConnectionStatus from './ConnectionStatus'

interface ChatLayoutProps {
  children: React.ReactNode
  title: string
  icon: string
  onStart?: () => void
  onNext?: () => void
  onLeave?: () => void
  showControls?: boolean
  isConnected?: boolean
  isWaiting?: boolean
}

export default function ChatLayout({
  children,
  title,
  icon,
  onStart,
  onNext,
  onLeave,
  showControls = true,
  isConnected = false,
  isWaiting = false
}: ChatLayoutProps) {
  const [showNav, setShowNav] = React.useState(false)

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="relative z-50">
            <button 
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setShowNav(!showNav)}
            >
              ←
            </button>
            
            {showNav && (
              <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[160px]">
                <Link href="/" className="block px-4 py-2 hover:bg-gray-100 transition-colors">
                  <span className="text-blue-500 font-bold">Meet</span>
                  <span className="text-gray-700 font-bold">opia</span>
                </Link>
                <Link href="/chat/text" className="block px-4 py-2 hover:bg-gray-100 transition-colors">
                  💬 Text Chat
                </Link>
                <Link href="/chat/video" className="block px-4 py-2 hover:bg-gray-100 transition-colors">
                  🎥 Video Chat
                </Link>
                <Link href="/chat/combined" className="block px-4 py-2 hover:bg-gray-100 transition-colors">
                  🤝 Combined Chat
                </Link>
              </div>
            )}
          </div>
          <h1 className="text-2xl font-bold">
            <span className="text-blue-500">Meet</span>
            <span className="text-gray-700">opia</span>
          </h1>
        </div>
        <ConnectionStatus />
      </div>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md border-2 border-dashed border-gray-200 hover:border-blue-400 transition-colors">
        {/* Chat Title */}
        <div className="text-center p-4 border-b border-gray-100">
          <h2 className="text-2xl font-semibold flex items-center justify-center gap-2">
            {icon} {title}
          </h2>
        </div>

        {/* Content Area */}
        <div className="min-h-[400px]">
          {children}
        </div>

        {/* Controls */}
        {showControls && (
          <div className="p-4 flex justify-center gap-4 border-t border-gray-100">
            <button 
              onClick={onStart}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              START
            </button>
            <button 
              onClick={onNext}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              NEXT
            </button>
            <button 
              onClick={onLeave}
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              LEAVE
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 