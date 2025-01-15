'use client'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <h1 className="text-4xl font-bold text-center">
          <span className="text-blue-500">Meet</span>
          <span className="text-gray-800">opia</span>
        </h1>

        {/* Tagline */}
        <p className="text-center text-gray-600">
          Connect with people around the world
        </p>

        {/* Main Actions */}
        <div className="space-y-4">
          <Link 
            href="/chat/video"
            className="w-full flex justify-center py-3 px-4 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
          >
            Start Video Chat as Guest
          </Link>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          <Link 
            href="/auth/signin"
            className="w-full flex justify-center py-3 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Sign In
          </Link>

          <Link 
            href="/auth/signup"
            className="w-full flex justify-center py-3 px-4 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
          >
            Sign Up
          </Link>
        </div>

        {/* Benefits */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Why create an account?
          </h2>
          <ul className="space-y-3">
            <li className="flex items-center text-gray-600">
              <span className="mr-2">•</span>
              Access to text chat features
            </li>
            <li className="flex items-center text-gray-600">
              <span className="mr-2">•</span>
              Save favorite chat partners
            </li>
            <li className="flex items-center text-gray-600">
              <span className="mr-2">•</span>
              Create private chat rooms
            </li>
            <li className="flex items-center text-gray-600">
              <span className="mr-2">•</span>
              Enhanced security features
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
