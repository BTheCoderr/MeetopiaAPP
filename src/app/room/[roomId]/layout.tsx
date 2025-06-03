'use client'
import React from 'react'
import Link from 'next/link'

export default function RoomLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black">
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-2 flex justify-between items-center">
          <Link href="/" className="text-blue-400 text-2xl font-bold hover:text-blue-300 transition-colors">
            Meetopia
          </Link>
          <Link href="/" className="text-gray-300 hover:text-blue-400 transition-colors">
            Leave Room
          </Link>
        </div>
      </header>
      <main className="pt-12">
        {children}
      </main>
    </div>
  )
} 