'use client'
import Link from 'next/link'

export const Logo = () => (
  <div className="flex items-center space-x-6">
    <Link href="/" className="font-bold tracking-wider">
      <span className="text-blue-600">MEET</span>
      <span className="text-blue-500">OPIA</span>
    </Link>
    
    <nav className="flex space-x-4 text-sm">
      <Link href="/history" className="text-gray-600 hover:text-blue-500">
        Match History
      </Link>
      <Link href="/friends" className="text-gray-600 hover:text-blue-500">
        Friends
      </Link>
      <Link href="/messages" className="text-gray-600 hover:text-blue-500">
        Messages
      </Link>
    </nav>
  </div>
) 