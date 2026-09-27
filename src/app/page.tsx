'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import MainLayout from '@/components/Layout/MainLayout'
import CommunityGuidelines from '@/components/CommunityGuidelines'

export default function Home() {
  const [showGuidelines, setShowGuidelines] = useState(false)

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center text-center mb-16">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-blue-600 mb-3">Talk first</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Real chemistry starts with a real conversation.
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mb-8">
            No swiping through bios. No compatibility score. Meetopia connects two real adults on live video. Talk, decide for yourself, then Vibe or move on.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Link
              href="/start"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg text-lg shadow-md transition-colors"
            >
              Start a Chemistry Check
            </Link>
            <button
              onClick={() => setShowGuidelines(true)}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Community guidelines
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Talk first</h3>
            <p className="text-gray-600">
              Meetopia does not decide who is compatible for you. You learn about the other person by actually talking to them.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Vibe after</h3>
            <p className="text-gray-600">
              If the conversation feels right, send a private Vibe. A Connection is created only when both people Vibe.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Stay in control</h3>
            <p className="text-gray-600">
              Next, leave, report, or block at any time. Blocked people are kept out of your future matching queue.
            </p>
          </div>
        </div>

        <div className="bg-blue-50 p-8 rounded-lg mb-16">
          <h2 className="text-2xl font-bold mb-4 text-center">Simple on purpose</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-3">Before the call</h3>
              <ul className="space-y-2 text-gray-700">
                <li>✓ Create an account so safety actions and Connections can persist.</li>
                <li>✓ Confirm that you are 18 or older.</li>
                <li>✓ Allow camera and microphone access.</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">During the call</h3>
              <ul className="space-y-2 text-gray-700">
                <li>✓ Talk and learn about each other naturally.</li>
                <li>✓ Tap Vibe only if you actually feel one.</li>
                <li>✓ Next, report, block, or leave whenever you want.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 text-white p-8 rounded-lg text-center">
          <h2 className="text-2xl font-bold mb-4">The conversation is the profile.</h2>
          <p className="text-gray-300 mb-6">
            Meet someone live first. Everything else comes after.
          </p>
          <Link
            href="/start"
            className="bg-white text-gray-950 hover:bg-gray-100 font-bold py-3 px-8 rounded-lg shadow-md transition-colors"
          >
            Start Talking
          </Link>
        </div>
      </div>

      <CommunityGuidelines
        isOpen={showGuidelines}
        onAccept={() => setShowGuidelines(false)}
        onClose={() => setShowGuidelines(false)}
      />
    </MainLayout>
  )
}
