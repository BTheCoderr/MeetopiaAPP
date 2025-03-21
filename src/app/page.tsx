'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import MainLayout from '../components/Layout/MainLayout'

export default function HomePage() {
  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 text-center">
        <h1 className="text-3xl font-bold mb-8">Ready for your Meetopia adventure?</h1>
        
        <div className="grid grid-cols-1 gap-8 mb-8 w-full max-w-md">
          {/* Random Chat Option */}
          <div className="flex flex-col items-center p-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl shadow-lg hover:shadow-xl transition-all">
            <h2 className="text-2xl font-bold text-white mb-3">Random Chat</h2>
            <p className="text-white/80 mb-6">Meet new people for casual conversations</p>
            <Link 
              href="/match?mode=chat&video=true"
              className="w-full px-6 py-4 bg-white text-blue-700 text-lg font-bold rounded-lg hover:bg-blue-50 transition-all shadow-md"
            >
              Start Chatting
            </Link>
          </div>
          
          {/* Video Dating Option */}
          <div className="flex flex-col items-center p-8 bg-gradient-to-br from-pink-600 to-purple-700 rounded-xl shadow-lg hover:shadow-xl transition-all">
            <h2 className="text-2xl font-bold text-white mb-3">Video Dating</h2>
            <p className="text-white/80 mb-6">Find matches through face-to-face connections</p>
            <Link 
              href="/match?mode=dating&video=true"
              className="w-full px-6 py-4 bg-white text-purple-700 text-lg font-bold rounded-lg hover:bg-purple-50 transition-all shadow-md"
            >
              Start Dating
            </Link>
          </div>
        </div>

        <div className="text-sm text-gray-500 mt-auto">
          © {new Date().getFullYear()} Meetopia - Connect with people worldwide
        </div>
      </div>
    </MainLayout>
  )
}
