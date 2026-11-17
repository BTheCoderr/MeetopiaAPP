'use client'
import { useCallback, useEffect, useState } from 'react'

type Creation = { creation: { themeId: string; activity: string; setting: string } | null; labels: { theme: string; activity: string; setting: string } | null }
export default function CoCreationCard({ connectionId }: { connectionId: string }) {
  const [data, setData] = useState<Creation | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const url = `/api/connections/${encodeURIComponent(connectionId)}/creation`
  const load = useCallback(async () => {
    try {
      const response = await fetch(url, { credentials: 'same-origin', cache: 'no-store' })
      const body = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(body.error || 'Could not load creation')
      setData(body); setError(null)
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not load creation.') }
  }, [url])
  useEffect(() => { void load() }, [load])
  async function remove() {
    if (busy || !window.confirm('Remove your shared adventure? Your Connection and messages will stay.')) return
    setBusy(true)
    try {
      const response = await fetch(url, { credentials: 'same-origin', method: 'DELETE' })
      const body = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(body.error || 'Unable to remove.')
      setData(body); setError(null)
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not remove creation.') }
    finally { setBusy(false) }
  }
  if (!data?.labels && !error) return null
  return <section className="border-b border-violet-200/20 bg-gradient-to-br from-[#2b1d46] to-[#19112c] px-6 py-7 text-white">
    {data?.labels && <>
      <p className="text-xs font-black tracking-[0.2em] text-violet-300">✦ OUR FIRST SHARED ADVENTURE</p>
      <p className="mt-3 text-sm font-bold text-violet-200">{data.labels.theme}</p>
      <h2 className="mt-2 text-2xl font-black">{data.labels.activity}</h2>
      <p className="mt-2 text-base">{data.labels.setting}</p>
      <p className="mt-5 text-xs text-violet-200/75">Built together in The Bridge · jointly approved and saved after mutual Vibe</p>
      <button type="button" disabled={busy} onClick={() => void remove()} className="mt-5 rounded-xl border border-violet-300/50 px-4 py-2 text-sm font-bold disabled:opacity-50">{busy ? 'Removing…' : 'Remove shared adventure'}</button>
    </>}
    {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
  </section>
}
