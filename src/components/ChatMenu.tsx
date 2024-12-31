'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

interface ChatMenuProps {
  // For hamburger menu
  onLeaveChat?: () => void;
  // For report menu
  isOpen?: boolean;
  onClose?: () => void;
  onReport?: () => void;
  onBlock?: () => void;
  onNext?: () => void;
  showNext?: boolean;
  variant?: 'hamburger' | 'report';
}

export default function ChatMenu({ 
  // Hamburger menu props
  onLeaveChat,
  // Report menu props
  isOpen,
  onClose,
  onReport,
  onBlock,
  onNext,
  showNext = true,
  variant = 'hamburger'
}: ChatMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (variant === 'hamburger') {
        if (isMenuOpen && !(event.target as Element).closest('.menu-container')) {
          setIsMenuOpen(false)
        }
      } else if (variant === 'report') {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
          onClose?.()
        }
      }
    }

    if (variant === 'hamburger') {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    } else if (variant === 'report' && isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMenuOpen, variant, isOpen, onClose])

  if (variant === 'report' && !isOpen) return null

  if (variant === 'hamburger') {
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
            <Link href="/" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              Home
            </Link>
            <Link href="/chat/text" className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              Text Chat
              {window.location.pathname === '/chat/text' && (
                <span className="text-blue-500 text-2xl">•</span>
              )}
            </Link>
            <Link href="/chat/video" className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              Video Chat
              {window.location.pathname === '/chat/video' && (
                <span className="text-blue-500 text-2xl">•</span>
              )}
            </Link>
            <Link href="/chat/combined" className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              Combined Chat
              {window.location.pathname === '/chat/combined' && (
                <span className="text-blue-500 text-2xl">•</span>
              )}
            </Link>
            {onLeaveChat && (
              <button
                onClick={onLeaveChat}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 border-t"
              >
                Leave Chat
              </button>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div 
      ref={menuRef}
      className="absolute right-0 top-12 w-48 bg-white rounded-lg shadow-lg border py-1 z-50"
    >
      {showNext && onNext && (
        <button
          onClick={onNext}
          className="w-full px-4 py-2 text-left hover:bg-gray-100 text-gray-700"
        >
          Next Person
        </button>
      )}
      
      {onBlock && (
        <button
          onClick={onBlock}
          className="w-full px-4 py-2 text-left hover:bg-gray-100 text-gray-700"
        >
          Block User
        </button>
      )}
      
      {onReport && (
        <button
          onClick={onReport}
          className="w-full px-4 py-2 text-left hover:bg-gray-100 text-red-600"
        >
          Report User
        </button>
      )}
    </div>
  )
} 