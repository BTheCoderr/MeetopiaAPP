'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import MainLayout from '@/components/Layout/MainLayout'
import CommunityGuidelines from '@/components/CommunityGuidelines'

export default function Home() {
  const [showGuidelines, setShowGuidelines] = useState(false)

  return (
    <MainLayout>
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:py-16">
        <section className="mx-auto max-w-3xl text-center">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.24em] text-blue-600 sm:text-sm">
            Talk first
          </p>
          <h1 className="text-3xl font-black leading-[1.05] text-gray-950 sm:text-5xl lg:text-6xl">
            Real chemistry starts with a real conversation.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-gray-600 sm:text-xl sm:leading-8">
            No swiping through bios. No compatibility score. Meetopia connects two real adults on live video.
            Talk, decide for yourself, then Vibe or move on.
          </p>

          <div className="mt-7 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center">
            <Link
              href="/start"
              className="rounded-2xl bg-blue-600 px-6 py-3.5 text-center text-base font-bold text-white shadow-sm transition hover:bg-blue-700 sm:px-8 sm:text-lg"
            >
              Start a Chemistry Check
            </Link>
            <button
              onClick={() => setShowGuidelines(true)}
              className="rounded-2xl px-6 py-3.5 text-base font-semibold text-blue-700 transition hover:bg-blue-50"
            >
              Community guidelines
            </button>
          </div>
        </section>

        <section className="mt-12 grid grid-cols-1 gap-4 sm:mt-16 md:grid-cols-3 md:gap-6">
          {[
            {
              title: 'Talk first',
              body: 'Meetopia does not decide who is compatible for you. You learn about the other person by actually talking to them.',
            },
            {
              title: 'Vibe after',
              body: 'If the conversation feels right, send a private Vibe. A Connection is created only when both people Vibe.',
            },
            {
              title: 'Stay in control',
              body: 'Next, leave, report, or block at any time. Blocked people are kept out of your future matching queue.',
            },
          ].map(item => (
            <article key={item.title} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 sm:p-6">
              <h2 className="text-lg font-black text-gray-950 sm:text-xl">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-gray-600 sm:text-base">{item.body}</p>
            </article>
          ))}
        </section>

        <section className="mt-6 rounded-3xl bg-blue-50 p-5 sm:mt-8 sm:p-8">
          <h2 className="text-center text-2xl font-black text-gray-950">Simple on purpose</h2>
          <div className="mt-6 grid grid-cols-1 gap-7 md:grid-cols-2 md:gap-10">
            <div>
              <h3 className="text-lg font-bold text-gray-950">Before the call</h3>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-gray-700 sm:text-base">
                <li>✓ Create an account so safety actions and Connections can persist.</li>
                <li>✓ Confirm that you are 18 or older.</li>
                <li>✓ Allow camera and microphone access.</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-950">During the call</h3>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-gray-700 sm:text-base">
                <li>✓ Talk and learn about each other naturally.</li>
                <li>✓ Tap Vibe only if you actually feel one.</li>
                <li>✓ Next, report, block, or leave whenever you want.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-3xl bg-gray-950 px-5 py-8 text-center text-white sm:mt-8 sm:p-10">
          <h2 className="text-2xl font-black sm:text-3xl">The conversation is the profile.</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-300 sm:text-base">
            Meet someone live first. Everything else comes after.
          </p>
          <Link
            href="/start"
            className="mt-6 inline-flex w-full justify-center rounded-2xl bg-white px-7 py-3.5 font-black text-gray-950 transition hover:bg-gray-100 sm:w-auto"
          >
            Start Talking
          </Link>
        </section>
      </div>

      <CommunityGuidelines
        isOpen={showGuidelines}
        onAccept={() => setShowGuidelines(false)}
        onClose={() => setShowGuidelines(false)}
      />
    </MainLayout>
  )
}
