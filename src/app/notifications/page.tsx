'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/Layout/MainLayout'

type NotificationItem = {
  id: string
  type: string
  title: string
  body: string
  data: {
    path?: string
    connectionId?: string
  } | null
  readAt: string | null
  createdAt: string
}

function formatTime(date: string) {
  const value = new Date(date)
  const now = new Date()
  if (value.toDateString() === now.toDateString()) {
    return value.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  }
  return value.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

export default function NotificationsPage() {
  const router = useRouter()
  const [items, setItems] = useState<NotificationItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    try {
      const response = await fetch('/api/notifications', {
        cache: 'no-store',
        credentials: 'same-origin',
      })

      if (response.status === 401) {
        router.replace('/auth/signin?next=/notifications')
        return
      }

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Could not load notifications.')
      setItems(data.notifications || [])
      setError(null)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load notifications.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const markAllRead = async () => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ all: true }),
    })

    setItems(current =>
      current.map(item => ({
        ...item,
        readAt: item.readAt || new Date().toISOString(),
      })),
    )
    window.dispatchEvent(new CustomEvent('meetopia-notifications-changed'))
  }

  const openNotification = async (item: NotificationItem) => {
    if (!item.readAt) {
      await fetch('/api/notifications', {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [item.id] }),
      })
      window.dispatchEvent(new CustomEvent('meetopia-notifications-changed'))
    }

    const path =
      item.data && typeof item.data.path === 'string'
        ? item.data.path
        : item.data?.connectionId
          ? `/connections/${item.data.connectionId}`
          : '/connections'

    router.push(path)
  }

  return (
    <MainLayout>
      <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-600">Activity</p>
            <h1 className="mt-1 text-3xl font-black text-gray-950">Notifications</h1>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Messages and call attempts from people you already connected with.
            </p>
          </div>
          {items.some(item => !item.readAt) && (
            <button
              type="button"
              onClick={() => void markAllRead()}
              className="shrink-0 rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50"
            >
              Mark all read
            </button>
          )}
        </div>

        {error && <div className="mt-6 rounded-xl bg-red-50 p-4 text-red-700">{error}</div>}

        <section className="mt-8 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-200">
          {isLoading ? (
            <div className="p-8 text-gray-500">Loading notifications…</div>
          ) : items.length === 0 ? (
            <div className="p-10 text-center">
              <div className="text-3xl">✓</div>
              <h2 className="mt-3 text-lg font-black text-gray-950">You are caught up</h2>
              <p className="mt-2 text-sm text-gray-500">
                New Connection messages and call attempts will show here.
              </p>
              <Link href="/connections" className="mt-5 inline-flex font-bold text-blue-600">
                Open Connections
              </Link>
            </div>
          ) : (
            items.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => void openNotification(item)}
                className={`flex w-full gap-3 p-4 text-left transition hover:bg-gray-50 sm:p-5 ${
                  index > 0 ? 'border-t border-gray-100' : ''
                } ${!item.readAt ? 'bg-blue-50/50' : ''}`}
              >
                <span
                  className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${
                    item.readAt ? 'bg-gray-200' : 'bg-blue-600'
                  }`}
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-start justify-between gap-3">
                    <span className="truncate font-black text-gray-950">{item.title}</span>
                    <span className="shrink-0 text-xs text-gray-400">{formatTime(item.createdAt)}</span>
                  </span>
                  <span className="mt-1 block text-sm leading-5 text-gray-600">{item.body}</span>
                </span>
              </button>
            ))
          )}
        </section>
      </main>
    </MainLayout>
  )
}
