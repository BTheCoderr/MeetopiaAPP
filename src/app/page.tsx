'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useUser } from '@/context/UserContext'

interface FeedItem {
  id: string
  username: string
  status: string
  isOnline: boolean
  lastActive: string
}

export default function Home() {
  const { user } = useUser()
  const [feedItems, setFeedItems] = useState<FeedItem[]>([
    {
      id: '1',
      username: 'Alice',
      status: 'Looking to chat!',
      isOnline: true,
      lastActive: 'now'
    },
    {
      id: '2',
      username: 'Bob',
      status: 'Available for video chat',
      isOnline: true,
      lastActive: '2m ago'
    },
  ])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Welcome to ChatApp</h1>
          <div className="space-x-4">
            <Link
              href="/auth/signin"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="inline-block px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Chat Options</h1>
        <div className="flex items-center space-x-4">
          <span>🪙 {user.coins} coins</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Link href="/chat/text" className="block h-full">
          <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow h-full flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold mb-2">💬 Text Chat</h2>
              <p className="text-gray-600">Start a text-based conversation</p>
            </div>
            <p className="mt-4 text-sm text-blue-600">1 coin per message</p>
          </div>
        </Link>

        <Link href="/chat/video" className="block h-full">
          <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow h-full flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold mb-2">📹 Video Chat</h2>
              <p className="text-gray-600">Start a video conversation</p>
            </div>
            <p className="mt-4 text-sm text-blue-600">10 coins per minute</p>
          </div>
        </Link>

        <Link href="/chat/combined" className="block h-full">
          <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow h-full flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold mb-2">🤝 Combined Chat</h2>
              <p className="text-gray-600">Text and video in one chat</p>
            </div>
            <p className="mt-4 text-sm text-blue-600">Varies by usage</p>
          </div>
        </Link>
      </div>

      <h2 className="text-2xl font-bold mb-4">Live Feed</h2>
      <div className="space-y-4">
        {feedItems.map((item) => (
          <div
            key={item.id}
            className="p-4 bg-white rounded-lg shadow-md flex items-center justify-between"
          >
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold">{item.username}</span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    item.isOnline ? 'bg-green-500' : 'bg-gray-400'
                  }`}
                />
              </div>
              <p className="text-gray-600">{item.status}</p>
            </div>
            <div className="text-sm text-gray-500">
              Active: {item.lastActive}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
