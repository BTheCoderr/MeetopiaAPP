'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface ChatMenuProps {
  onLeaveChat: () => void;
}

export default function ChatMenu({ onLeaveChat }: ChatMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMenuOpen && !(event.target as Element).closest('.menu-container')) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isMenuOpen])

  return (
    <div className="relative menu-container">
      <button 
        onClick={(e) => {
          e.stopPropagation();
          setIsMenuOpen(!isMenuOpen);
        }} 
        className="text-gray-600 hover:text-gray-800 text-2xl"
      >
        ≡
      </button>
      {isMenuOpen && (
        <div className="absolute left-0 top-full mt-1 bg-white border rounded-lg shadow-lg min-w-[150px] z-50">
          <Link href="/" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
            Home
          </Link>
          <Link href="/chat/text" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
            Text Chat
          </Link>
          <Link href="/chat/video" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
            Video Chat
          </Link>
          <Link href="/chat/combined" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
            Combined Chat
          </Link>
          <button 
            onClick={onLeaveChat}
            className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 border-t"
          >
            Leave Chat
          </button>
        </div>
      )}
    </div>
  )
} 