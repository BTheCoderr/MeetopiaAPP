'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export const ChatNavigation = () => {
  const pathname = usePathname()
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div 
      className="fixed top-4 left-4 z-50"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className={`bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 ${
        isExpanded ? 'w-48' : 'w-12'
      }`}>
        <Link 
          href="/"
          className="flex items-center px-4 py-2 text-blue-600 hover:bg-blue-50"
        >
          {isExpanded ? (
            '← Back Home'
          ) : (
            '←'
          )}
        </Link>
        
        {isExpanded && (
          <div className="border-t pt-2">
            <Link 
              href="/chat/text"
              className={`block px-4 py-2 rounded-md ${
                pathname === '/chat/text' ? 'bg-blue-500 text-white' : 'hover:bg-blue-50'
              }`}
            >
              💬 Text Chat
            </Link>
            <Link 
              href="/chat/video"
              className={`block px-4 py-2 rounded-md ${
                pathname === '/chat/video' ? 'bg-blue-500 text-white' : 'hover:bg-blue-50'
              }`}
            >
              🎥 Video Chat
            </Link>
            <Link 
              href="/chat/combined"
              className={`block px-4 py-2 rounded-md ${
                pathname === '/chat/combined' ? 'bg-blue-500 text-white' : 'hover:bg-blue-50'
              }`}
            >
              🤝 Combined
            </Link>
          </div>
        )}
      </div>
    </div>
  )
} 