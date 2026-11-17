'use client'
import Link from 'next/link'
import { VIBE_THEMES } from '@/lib/vibeThemes'
export default function VibeSessionsPage() {
  return <main className="min-h-screen bg-[#0c081c] px-5 py-12 text-white">
    <div className="mx-auto max-w-3xl">
      <Link href="/" className="text-sm font-semibold text-violet-300">← Meetopia</Link>
      <p className="mt-12 text-xs font-black tracking-[0.26em] text-violet-300">MEETOPIA / THE EXPERIENCES</p>
      <h1 className="mt-4 text-4xl font-black sm:text-5xl">Choose your Vibe Session.</h1>
      <p className="mt-5 max-w-2xl text-base leading-7 text-violet-100/70">Not stranger roulette. Join a theme that means something to you. Meet another available adult who chose the same theme, approve the introduction together, and co-create something meaningful through conversation.</p>
      <div className="mt-10 grid gap-5 sm:grid-cols-3">{VIBE_THEMES.map(theme =>
        <Link key={theme.id} href={`/chat/video?themeId=${encodeURIComponent(theme.id)}`} className="group rounded-[28px] border border-violet-400/40 bg-[#1f1740] p-6 transition hover:-translate-y-1 hover:border-violet-200">
          <span className="text-4xl text-violet-300">{theme.icon}</span>
          <h2 className="mt-7 text-xl font-black">{theme.title}</h2>
          <p className="mt-3 text-sm leading-6 text-violet-200/70">{theme.tagline}</p>
          <p className="mt-8 text-sm font-bold text-violet-200">Join this experience →</p>
        </Link>
      )}</div>
      <p className="mt-9 text-sm text-violet-100/60">Real people only. Two-sided acceptance before video. Your shared creation is saved only after both approve it and mutual Vibe creates a Connection.</p>
    </div>
  </main>
}
