'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/Layout/MainLayout'

type BlockedUser = {
  id: string
  username: string
  displayName: string | null
}

type BlockRecord = {
  id: string
  createdAt: string
  blocked: BlockedUser
}

export default function BlockedUsersPage() {
  const router = useRouter()
  const [blocks, setBlocks] = useState<BlockRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch('/api/blocks', {
          cache: 'no-store',
          credentials: 'same-origin',
        })

        if (response.status === 401) {
          router.replace('/auth/signin?next=/settings/blocked')
          return
        }

        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Could not load blocked users.')
        setBlocks(data.blocks || [])
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Could not load blocked users.')
      } finally {
        setIsLoading(false)
      }
    }

    void load()
  }, [router])

  const unblock = async (record: BlockRecord) => {
    const name = record.blocked.displayName || record.blocked.username
    if (!window.confirm(`Unblock ${name}? They may be eligible to match with you again.`)) return

    const response = await fetch('/api/blocks', {
      method: 'DELETE',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blockedUserId: record.blocked.id }),
    })
    const data = await response.json().catch(() => null)

    if (!response.ok) {
      setError(data?.error || 'Could not unblock this person.')
      return
    }

    setBlocks(current => current.filter(block => block.id !== record.id))
  }

  return (
    <MainLayout>
      <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <Link href="/profile" className="text-sm font-bold text-gray-500 hover:text-gray-950">
          ← Profile
        </Link>

        <div className="mt-5">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-red-600">Safety</p>
          <h1 className="mt-1 text-3xl font-black text-gray-950">Blocked users</h1>
          <p className="mt-3 text-sm leading-6 text-gray-600">
            Blocked people cannot appear in your future Chemistry Check matching and their saved Connection is removed.
          </p>
        </div>

        {error && <div className="mt-6 rounded-xl bg-red-50 p-4 text-red-700">{error}</div>}

        <section className="mt-8 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-200">
          {isLoading ? (
            <div className="p-8 text-gray-500">Loading blocked users…</div>
          ) : blocks.length === 0 ? (
            <div className="p-10 text-center">
              <div className="text-3xl">✓</div>
              <h2 className="mt-3 text-lg font-black text-gray-950">Nobody blocked</h2>
              <p className="mt-2 text-sm text-gray-500">People you block will appear here so you can manage them later.</p>
            </div>
          ) : (
            blocks.map((record, index) => {
              const name = record.blocked.displayName || record.blocked.username
              return (
                <div
                  key={record.id}
                  className={`flex items-center gap-4 p-4 sm:p-5 ${index > 0 ? 'border-t border-gray-100' : ''}`}
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-950 font-black text-white">
                    {name.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate font-black text-gray-950">{name}</h2>
                    <p className="truncate text-xs text-gray-400">@{record.blocked.username}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void unblock(record)}
                    className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-800 hover:bg-gray-50"
                  >
                    Unblock
                  </button>
                </div>
              )
            })
          )}
        </section>
      </main>
    </MainLayout>
  )
}
