'use client'
import Link from 'next/link'

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold">
            <span className="text-blue-500">Meet</span>
            <span className="text-gray-700">opia</span>
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Choose your preferred way to connect
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/chat/video"
            className="block bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="text-center">
              <div className="text-4xl mb-4">🎥</div>
              <h2 className="text-xl font-semibold text-gray-900">Video Chat</h2>
              <p className="mt-2 text-gray-600">
                Connect face-to-face with people around the world
              </p>
            </div>
          </Link>

          <Link
            href="/chat/text"
            className="block bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="text-center">
              <div className="text-4xl mb-4">💬</div>
              <h2 className="text-xl font-semibold text-gray-900">Text Chat</h2>
              <p className="mt-2 text-gray-600">
                Have meaningful conversations through text messaging
              </p>
            </div>
          </Link>

          <Link
            href="/chat/combined"
            className="block bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="text-center">
              <div className="text-4xl mb-4">🤝</div>
              <h2 className="text-xl font-semibold text-gray-900">Combined Chat</h2>
              <p className="mt-2 text-gray-600">
                Experience both video and text chat simultaneously
              </p>
            </div>
          </Link>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            All chats are end-to-end encrypted and completely anonymous
          </p>
        </div>
      </div>
    </div>
  )
} 