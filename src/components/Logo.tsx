'use client'
import Link from 'next/link'

interface LogoProps {
  className?: string
}

export default function Logo({ className = '' }: LogoProps) {
  return (
    <Link 
      href="/" 
      className={`block text-2xl font-bold text-center hover:opacity-80 transition-opacity ${className}`}
    >
      <span className="text-blue-500">Meet</span>
      <span className="text-gray-700">opia</span>
    </Link>
  )
} 