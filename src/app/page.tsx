'use client'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            <span className="text-blue-500">Meet</span>
            <span className="text-gray-700">opia</span>
          </h1>
          <p className="text-xl text-gray-600">
            Connect with people worldwide through video and text chat
          </p>
        </div>

        {/* Main Actions */}
        <div className="max-w-md mx-auto space-y-6">
          <Link
            href="/chat/video"
            className="block w-full py-3 px-4 text-center bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Start Video Chat as Guest
          </Link>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-100 text-gray-500">or</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/auth/signin"
              className="py-3 px-4 text-center bg-white text-blue-500 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="py-3 px-4 text-center bg-blue-50 text-blue-500 rounded-lg hover:bg-blue-100 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-16">
          <h2 className="text-2xl font-semibold text-center text-gray-900 mb-8">
            Benefits of Creating an Account
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-3xl mb-4">💬</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Text Chat Features
              </h3>
              <p className="text-gray-600">
                Access text chat alongside video for enhanced communication
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-3xl mb-4">⭐</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Save Favorites
              </h3>
              <p className="text-gray-600">
                Keep track of your favorite chat partners
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-3xl mb-4">🔒</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Private Rooms
              </h3>
              <p className="text-gray-600">
                Create private chat rooms for specific conversations
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-3xl mb-4">🛡️</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Enhanced Security
              </h3>
              <p className="text-gray-600">
                Additional security features and verified user status
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
