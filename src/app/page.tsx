'use client'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-8">
        <span className="text-blue-500">Meet</span>
        <span className="text-gray-700">opia</span>
      </h1>
      
      <div className="max-w-md w-full space-y-6">
        <p className="text-center text-gray-600 mb-8">
          Connect with people around the world
        </p>

        <Link 
          href="/chat/video" 
          className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
        >
          Start Video Chat as Guest
        </Link>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">or</span>
          </div>
        </div>

        <div className="space-y-4">
          <Link 
            href="/auth/signin" 
            className="w-full py-3 border-2 border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center"
          >
            Sign In
          </Link>
          <Link 
            href="/auth/signup" 
            className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
          >
            Sign Up
          </Link>
        </div>

        <div className="mt-8 space-y-2">
          <h3 className="text-lg font-semibold text-gray-700">Why create an account?</h3>
          <ul className="space-y-2 text-gray-600">
            <li>• Access to text chat features</li>
            <li>• Save favorite chat partners</li>
            <li>• Create private chat rooms</li>
            <li>• Enhanced security features</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
