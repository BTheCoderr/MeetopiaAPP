'use client'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-8">
        <span className="text-blue-500">Meet</span>
        <span className="text-gray-700">opia</span>
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl">
        <Link 
          href="/chat/text" 
          className="p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-400 transition-colors shadow-sm"
        >
          <div className="text-xl mb-2">💬 Text Chat</div>
          <p className="text-gray-600">
            Connect through words. Perfect for quick conversations and those who prefer typing.
          </p>
        </Link>

        <Link 
          href="/chat/video" 
          className="p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-400 transition-colors shadow-sm"
        >
          <div className="text-xl mb-2">🎥 Video Chat</div>
          <p className="text-gray-600">
            Face-to-face interactions. Great for more personal connections and meaningful conversations.
          </p>
        </Link>

        <Link 
          href="/chat/combined" 
          className="p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-400 transition-colors shadow-sm"
        >
          <div className="text-xl mb-2">🤝 Combined Chat</div>
          <p className="text-gray-600">
            Best of both worlds. Video chat with text messaging for a complete communication experience.
          </p>
        </Link>
      </div>
    </div>
  )
}
