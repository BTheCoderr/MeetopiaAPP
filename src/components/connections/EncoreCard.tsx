'use client'

import { useCallback, useEffect, useState } from 'react'
import { ENCORE_OPTIONS, type EncoreChoice, type EncoreView } from '@/lib/encore'

const urlFor = (connectionId: string) => `/api/connections/${encodeURIComponent(connectionId)}/encore`

export default function EncoreCard({ connectionId }: { connectionId: string }) {
  const [data, setData] = useState<EncoreView | null>(null)
  const [selected, setSelected] = useState<EncoreChoice | null>(null)
  const [working, setWorking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      const response = await fetch(urlFor(connectionId), { credentials: 'same-origin', cache: 'no-store' })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.error || 'Could not load Encore')
      const view = payload as EncoreView
      setData(view); setSelected(view.mine); setError(null)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load Encore.')
    }
  }, [connectionId])

  useEffect(() => { void refresh() }, [refresh])
  useEffect(() => {
    if (data?.status !== 'waiting') return
    const interval = window.setInterval(() => { void refresh() }, 15000)
    return () => window.clearInterval(interval)
  }, [data?.status, refresh])

  async function share() {
    if (!selected || working) return
    setWorking(true); setError(null)
    try {
      const response = await fetch(urlFor(connectionId), {
        method: 'PUT', credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ choice: selected, share: true }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Could not share Encore')
      setData(payload)
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not share Encore') }
    finally { setWorking(false) }
  }

  async function withdraw() {
    if (working) return
    setWorking(true); setError(null)
    try {
      const response = await fetch(urlFor(connectionId), { method: 'DELETE', credentials: 'same-origin' })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Could not withdraw Encore')
      setData(payload); setSelected(null)
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not withdraw Encore') }
    finally { setWorking(false) }
  }

  const labelFor = (id: string) => ENCORE_OPTIONS.find(x => x.id === id)?.label || id

  return <section aria-label="Plan your Encore" className="border-b border-violet-100 bg-[#18112d] px-5 py-7 text-white sm:px-8">
    <p className="text-xs font-black tracking-[0.24em] text-violet-300">MEETOPIA · THE ENCORE</p>
    <h2 className="mt-2 text-2xl font-black">Where should your vibe go next?</h2>
    <p className="mt-2 max-w-2xl text-sm leading-6 text-violet-100/75">Choose a follow-up idea you'd actually enjoy. Your choices only appear on a shared Spark Card if you both explicitly agree to share.</p>
    <div className="mt-5 flex flex-wrap gap-2">
      {ENCORE_OPTIONS.map(option => <button type="button" key={option.id} aria-pressed={selected === option.id} onClick={() => setSelected(option.id)} className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${selected === option.id ? 'border-violet-200 bg-violet-600' : 'border-violet-500/40 bg-violet-500/15 hover:bg-violet-500/30'}`}>{selected === option.id ? '✓ ' : '+ '}{option.label}</button>)}
    </div>
    <div className="mt-5 flex flex-wrap gap-3">
      <button type="button" disabled={!selected || working} onClick={() => void share()} className="rounded-2xl bg-violet-500 px-5 py-3 text-sm font-black disabled:opacity-40">{working ? 'Saving…' : 'Share my Encore idea'}</button>
      {data?.mine && <button type="button" disabled={working} onClick={() => void withdraw()} className="rounded-2xl border border-violet-300/50 px-4 py-3 text-sm font-semibold">Withdraw my idea</button>}
      <button type="button" onClick={() => void refresh()} className="rounded-2xl border border-white/20 px-4 py-3 text-sm font-semibold">Refresh</button>
    </div>
    {data?.status === 'waiting' && <p className="mt-4 text-sm text-violet-200">Your idea is saved. Only your Connection can unlock the shared Spark Card by choosing to share their own idea.</p>}
    {data?.card && <div className="mt-6 max-w-xl rounded-[26px] border border-violet-300/60 bg-gradient-to-br from-violet-800 to-fuchsia-900 p-6 shadow-lg">
      <p className="text-xs font-black tracking-[0.23em] text-violet-100">✦ OUR SPARK CARD</p>
      <h3 className="mt-3 text-2xl font-black">{data.card.sameIdea ? 'Same idea. Same wavelength.' : 'Two ideas. One connection.'}</h3>
      <p className="mt-4 text-sm">You: <strong>{labelFor(data.card.mine)}</strong></p>
      <p className="mt-2 text-sm">Them: <strong>{labelFor(data.card.theirs)}</strong></p>
      <p className="mt-5 text-xs text-violet-100/70">Shared by choice. No private Vibe Room answers or recordings saved.</p>
    </div>}
    {error && <p role="alert" className="mt-4 text-sm text-red-300">{error}</p>}
  </section>
}
