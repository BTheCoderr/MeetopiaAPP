'use client'
import React from 'react'
import Link from 'next/link'
import MainLayout from '../components/Layout/MainLayout'

export default function HomePage() {
  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 text-center max-w-md mx-auto">
        <div className="w-full">
          <h1 className="text-4xl font-bold mb-4">
            <span className="text-blue-600">Meet</span>
            <span className="text-gray-900">opia</span>
          </h1>
          <p className="text-gray-600 mb-8">Connect with people around the world</p>
          
          {/* Start Video Chat Button */}
          <Link 
            href="/match?mode=chat&video=true"
            className="block w-full px-6 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-all mb-4"
          >
            Start Video Chat as Guest
          </Link>
          
          {/* OR Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-100 text-gray-500">or</span>
            </div>
          </div>
          
          {/* Sign In/Up Options */}
          <Link 
            href="/auth/signin"
            className="block w-full px-6 py-4 bg-white text-gray-800 text-lg font-semibold rounded-lg border-2 border-gray-200 hover:bg-gray-50 transition-all mb-4"
          >
            Sign In
          </Link>
          
          <Link 
            href="/auth/signup"
            className="block w-full px-6 py-4 bg-white text-gray-800 text-lg font-semibold rounded-lg border-2 border-gray-200 hover:bg-gray-50 transition-all"
          >
            Sign Up
          </Link>
          
          {/* Benefits Section */}
          <div className="mt-12">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Why create an account?</h2>
            <ul className="text-left space-y-3">
              <li className="flex items-center text-gray-600">
                <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Access to text chat features
              </li>
              <li className="flex items-center text-gray-600">
                <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Save favorite chat partners
              </li>
              <li className="flex items-center text-gray-600">
                <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Create private chat rooms
              </li>
              <li className="flex items-center text-gray-600">
                <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Enhanced security features
              </li>
            </ul>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
