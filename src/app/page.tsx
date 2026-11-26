'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import MainLayout from '@/components/Layout/MainLayout'
import CommunityGuidelines from '@/components/CommunityGuidelines'

const STEPS = [
  {
    eyebrow: '01 · Chemistry Passport',
    title: 'Start with common ground',
    body: 'Add a few interests and what you are looking for. Meetopia introduces you to people you actually share something with, not random strangers.',
  },
  {
    eyebrow: '02 · Mutual consent',
    title: 'Both say yes before video',
    body: 'You both see why you were introduced. Video begins only after both of you accept, and either of you can decline privately.',
  },
  {
    eyebrow: '03 · Vibe Room',
    title: 'Do something together',
    body: 'Meet in an interactive Vibe Room with Spark Cards and shared activities, or join a themed Vibe Session that fits your mood.',
  },
  {
    eyebrow: '04 · Meaningful Connections',
    title: 'Connect only if it is mutual',
    body: 'After the final round, send a private Vibe. A Connection, and anything you created together, is saved only when you both choose it.',
  },
]

export default function Home() {
  const [showGuidelines, setShowGuidelines] = useState(false)

  return (
    <MainLayout>
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:py-16">
        <section className="rounded-[32px] bg-[#0c081c] px-5 py-12 text-center text-white sm:px-10 sm:py-16">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.26em] text-violet-300 sm:text-sm">
            Meetopia
          </p>
          <h1 className="mx-auto max-w-3xl text-3xl font-black leading-[1.05] sm:text-5xl lg:text-6xl">
            Meet through common ground, not chance.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-violet-100/70 sm:text-xl sm:leading-8">
            Build a Chemistry Passport, agree to an introduction together, then get to know each other
            in an interactive Vibe Room. Adults only.
          </p>

          <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center">
            <Link
              href="/start"
              className="rounded-2xl bg-violet-500 px-6 py-3.5 text-center text-base font-bold text-white shadow-sm transition hover:bg-violet-400 sm:px-8 sm:text-lg"
            >
              Create your Chemistry Passport
            </Link>
            <Link
              href="/sessions"
              className="rounded-2xl border border-violet-400/40 px-6 py-3.5 text-center text-base font-semibold text-violet-100 transition hover:border-violet-200"
            >
              Explore Vibe Sessions
            </Link>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-1 gap-4 sm:mt-8 md:grid-cols-2 md:gap-6">
          {STEPS.map(step => (
            <article key={step.title} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 sm:p-6">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-600">{step.eyebrow}</p>
              <h2 className="mt-2 text-lg font-black text-gray-950 sm:text-xl">{step.title}</h2>
              <p className="mt-2 text-sm leading-6 text-gray-600 sm:text-base">{step.body}</p>
            </article>
          ))}
        </section>

        <section className="mt-6 rounded-3xl bg-violet-50 p-5 sm:mt-8 sm:p-8">
          <h2 className="text-center text-2xl font-black text-gray-950">You stay in control</h2>
          <div className="mt-6 grid grid-cols-1 gap-7 md:grid-cols-2 md:gap-10">
            <div>
              <h3 className="text-lg font-bold text-gray-950">Before video</h3>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-gray-700 sm:text-base">
                <li>✓ Create an account and confirm that you are 18 or older.</li>
                <li>✓ Set up your Chemistry Passport.</li>
                <li>✓ Accept or decline each introduction. Nothing starts without both of you.</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-950">In the Vibe Room</h3>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-gray-700 sm:text-base">
                <li>✓ Play through Spark Cards and shared activities at your own pace.</li>
                <li>✓ Send a Vibe only if you actually feel one.</li>
                <li>✓ Report, block, Keep Exploring, or go Back to Base at any time.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-3xl bg-gray-950 px-5 py-8 text-center text-white sm:mt-8 sm:p-10">
          <h2 className="text-2xl font-black sm:text-3xl">Connections worth keeping.</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-300 sm:text-base">
            Every Connection on Meetopia started with shared interests, a mutual yes, and something you did together.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/start"
              className="inline-flex w-full justify-center rounded-2xl bg-white px-7 py-3.5 font-black text-gray-950 transition hover:bg-gray-100 sm:w-auto"
            >
              Get started
            </Link>
            <button
              type="button"
              onClick={() => setShowGuidelines(true)}
              className="rounded-2xl px-6 py-3.5 text-base font-semibold text-violet-200 transition hover:text-white"
            >
              Community guidelines
            </button>
          </div>
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
