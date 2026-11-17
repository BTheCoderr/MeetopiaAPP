'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  CHEMISTRY_INTENTS, CHEMISTRY_STYLES, CHEMISTRY_INTERESTS,
  INTENT_LABELS, STYLE_LABELS, INTEREST_LABELS,
  type ChemistryIntent, type ChemistryStyle, type ChemistryInterest,
  type ChemistryPassport,
} from '@/lib/chemistryPassport'

export default function ChemistryPassportPage() {
  const router = useRouter()
  const [intent, setIntent] = useState<ChemistryIntent | null>(null)
  const [style, setStyle] = useState<ChemistryStyle | null>(null)
  const [interests, setInterests] = useState<ChemistryInterest[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    void fetch('/api/chemistry/passport', { credentials: 'same-origin', cache: 'no-store' }).then(async res => {
      if (res.status === 401) { router.replace('/auth/signin?next=/chemistry/passport'); return }
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || 'Could not load Passport')
      if (!body.adultConfirmed) { router.replace('/start'); return }
      if (!active || !body.passport) return
      const p = body.passport as ChemistryPassport
      setIntent(p.intent); setStyle(p.style); setInterests(p.interests)
    }).catch(err => { if (active) setError(err instanceof Error ? err.message : 'Could not load Passport.') }).finally(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [router])

  function toggleInterest(value: ChemistryInterest) {
    setInterests(current => current.includes(value) ? current.filter(x => x !== value) : current.length < 5 ? [...current, value] : current)
  }

  async function save() {
    if (!intent || !style || interests.length < 2 || saving) return
    setSaving(true); setError(null)
    try {
      const res = await fetch('/api/chemistry/passport', {
        method: 'PUT', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent, style, interests }),
      })
      const data = await res.json()
      if (!res.ok || !data.complete) throw new Error(data.error || 'Could not save Passport')
      router.push('/chat/video')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save your Passport.')
    } finally { setSaving(false) }
  }

  return <main className="min-h-screen bg-[#090717] px-5 py-12 text-white">
    <div className="mx-auto max-w-xl">
      <Link href="/start" className="text-sm text-violet-300">← Meetopia</Link>
      <div className="mt-10 rounded-[32px] border border-violet-500/30 bg-[#17122e] p-7 sm:p-10">
        <p className="text-xs font-bold tracking-[0.26em] text-violet-300">YOUR CHEMISTRY</p>
        <h1 className="mt-3 text-4xl font-black">Your Chemistry Passport</h1>
        <p className="mt-4 text-sm leading-relaxed text-white/65">Meet someone through common ground, not random video roulette. Before a video introduction, both people see shared interests and choose whether to connect.</p>
        {loading ? <p className="mt-8">Loading…</p> : <>
          <h2 className="mt-9 text-xs font-bold tracking-wider text-violet-300">01 / YOUR INTENTION</h2>
          <div className="mt-3 grid gap-2">{CHEMISTRY_INTENTS.map(value => <button key={value} type="button" aria-pressed={intent === value} onClick={() => setIntent(value)} className={`rounded-2xl border p-4 text-left font-semibold transition ${intent === value ? 'border-violet-400 bg-violet-500/25' : 'border-white/10 bg-white/[0.04] hover:bg-white/10'}`}>{INTENT_LABELS[value]}</button>)}</div>
          <h2 className="mt-9 text-xs font-bold tracking-wider text-violet-300">02 / CONVERSATION STYLE</h2>
          <div className="mt-3 grid gap-2">{CHEMISTRY_STYLES.map(value => <button key={value} type="button" aria-pressed={style === value} onClick={() => setStyle(value)} className={`rounded-2xl border p-4 text-left font-semibold ${style === value ? 'border-violet-400 bg-violet-500/25' : 'border-white/10 bg-white/[0.04]'}`}>{STYLE_LABELS[value]}</button>)}</div>
          <h2 className="mt-9 text-xs font-bold tracking-wider text-violet-300">03 / PICK 2–5 INTERESTS</h2>
          <div className="mt-3 flex flex-wrap gap-2">{CHEMISTRY_INTERESTS.map(value => <button key={value} type="button" aria-pressed={interests.includes(value)} onClick={() => toggleInterest(value)} className={`rounded-full border px-4 py-2 text-sm font-semibold ${interests.includes(value) ? 'border-violet-400 bg-violet-600/30' : 'border-white/15 bg-white/[0.05]'}`}>{interests.includes(value) ? '✓ ' : '+ '}{INTEREST_LABELS[value]}</button>)}</div>
          <p className="mt-4 text-xs text-white/50">{interests.length}/5 selected. No fabricated compatibility scores.</p>
          {error && <p role="alert" className="mt-5 text-red-300">{error}</p>}
          <button type="button" disabled={!intent || !style || interests.length < 2 || saving} onClick={() => void save()} className="mt-9 w-full rounded-2xl bg-violet-500 p-4 font-extrabold text-white disabled:opacity-40">{saving ? 'Saving…' : 'Save Passport and continue'}</button>
        </>}
      </div>
    </div>
  </main>
}
