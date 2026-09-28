'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function StartPage() {
  const router = useRouter()
  const [confirmed, setConfirmed] = useState(false)
  const [alreadyConfirmed, setAlreadyConfirmed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch('/api/auth/adult-confirmation', {
          cache: 'no-store',
          credentials: 'same-origin',
          headers: { Accept: 'application/json' },
        })
        if (response.status === 401) {
          router.replace('/auth/signin?next=/start')
          return
        }
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Could not verify your account.')
        setAlreadyConfirmed(Boolean(data.confirmed))
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Could not verify your account.')
      } finally {
        setIsLoading(false)
      }
    }

    void load()
  }, [router])

  const begin = async () => {
    if (alreadyConfirmed) {
      router.push('/chat/video')
      return
    }

    if (!confirmed) {
      setError('Confirm that you are 18 or older to continue.')
      return
    }

    setIsSaving(true)
    setError(null)
    try {
      const response = await fetch('/api/auth/adult-confirmation', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { Accept: 'application/json' },
      })
      const data = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(data?.error || `Could not save confirmation (HTTP ${response.status}).`)
      }
      window.location.assign('/chat/video')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save confirmation.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Getting Meetopia ready…</div>
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-7">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-blue-400">Meetopia</p>
        <h1 className="mt-2 text-3xl font-black">Talk first.</h1>
        <p className="mt-3 text-white/65">
          No swiping through bios. No compatibility score. No fake partner. Meetopia puts two real people on video and lets the conversation decide.
        </p>

        {error && (
          <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {!alreadyConfirmed && (
          <label className="mt-6 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={event => setConfirmed(event.target.checked)}
              className="mt-1 h-4 w-4"
            />
            <span className="text-sm text-white/80">
              I confirm that I am 18 or older and agree to follow the community and safety rules.
            </span>
          </label>
        )}

        <button
          onClick={() => void begin()}
          disabled={isSaving}
          className="mt-6 w-full rounded-2xl bg-white py-4 font-black text-black disabled:opacity-50"
        >
          {alreadyConfirmed ? 'Start Chemistry Check' : isSaving ? 'Starting…' : 'I’m 18+ — Start Chemistry Check'}
        </button>

        <div className="mt-5 flex justify-center gap-4 text-xs text-white/50">
          <Link href="/safety" className="hover:text-white">Safety</Link>
          <Link href="/community-guidelines" className="hover:text-white">Guidelines</Link>
          <Link href="/terms" className="hover:text-white">Terms</Link>
        </div>
      </div>
    </main>
  )
}
