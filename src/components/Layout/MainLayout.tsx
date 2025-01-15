'use client'
import React from 'react'

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100">
      <main>{children}</main>
      <nav className="fixed bottom-0 w-full bg-white border-t">
        <div className="flex justify-around p-4">
          <a href="/home">Home</a>
          <a href="/chat">Chat</a>
          <a href="/feed">Feed</a>
          <a href="/profile">Profile</a>
        </div>
      </nav>
    </div>
  )
}