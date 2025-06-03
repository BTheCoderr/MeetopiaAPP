'use client'
import React from 'react'
import Link from 'next/link'

export default function Navigation() {
  return (
    <nav className="fixed bottom-0 w-full bg-white border-t">
      <div className="flex justify-around p-4">
        <Link href="/home">Home</Link>
        <Link href="/chat">Chat</Link>
        <Link href="/feed">Feed</Link>
        <Link href="/profile">Profile</Link>
      </div>
    </nav>
  )
} 