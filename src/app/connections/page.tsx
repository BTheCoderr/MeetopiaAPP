'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/Layout/MainLayout'
import { useConnectionPresence } from '@/hooks/useConnectionPresence'

type ConnectionPerson = {
  id: string
  username: string
  displayName: string | null
  lastSeenAt: string | null
}

type LastMessage = {
  id: string
  content: string
  createdAt: string
  mine: boolean
}

type Connection = {
  id: string
  createdAt: string
  person: ConnectionPerson
  lastMessage: LastMessage | null
  unreadCount: number
  realtimeProof: string
}

function formatActivity(date: string) {
  const value = new Date(date)
  const now = new Date()
  const sameDay = value.toDateString() === now.toDateString()

  if (sameDay) {
    return value.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  }

  return value.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function lastSeenLabel(person: ConnectionPerson, online: boolean) {
  if (online) return 'Online'
  if (!person.lastSeenAt) return 'Offline'

  const minutes = Math.floor((Date.now() - new Date(person.lastSeenAt).getTime()) / 60_000)
  if (minutes < 2) return 'Active recently'
  if (minutes < 60) return `Active ${minutes}m ago`
  if (minutes < 24 * 60) return `Active ${Math.floor(minutes / 60)}h ago`
  return 'Offline'
}

export default function ConnectionsPage() {
  const router = useRouter()
  const [connections, setConnections] = useState<Connection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>('unsupported')

  const onlineByConnection = useConnectionPresence(
    connections.map(connection => ({
      id: connection.id,
      realtimeProof: connection.realtimeProof,
    })),
  )

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission)
    }
  }, [])

  const loadConnections = useCallback(async (quiet = false) => {
    try {
      const response = await fetch('/api/connections', {
        cache: 'no-store',
        credentials: 'same-origin',
      })

      if (response.status === 401) {
        router.replace('/auth/signin?next=/connections')
        return
      }

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Could not load Connections.')

      setConnections(data.connections || [])
      if (!quiet) setError(null)
    } catch (loadError) {
      if (!quiet) {
        setError(loadError instanceof Error ? loadError.message : 'Could not load Connections.')
      }
    } finally {
      if (!quiet) setIsLoading(false)
    }
  }, [router])

  useEffect(() => {
    void loadConnections()

    const fallback = window.setInterval(() => {
      void loadConnections(true)
    }, 30_000)

    const onLiveMessage = () => void loadConnections(true)
    const onNotificationsChanged = () => void loadConnections(true)
    window.addEventListener('meetopia-connection-message', onLiveMessage)
    window.addEventListener('meetopia-notifications-changed', onNotificationsChanged)

    return () => {
      window.clearInterval(fallback)
      window.removeEventListener('meetopia-connection-message', onLiveMessage)
      window.removeEventListener('meetopia-notifications-changed', onNotificationsChanged)
    }
  }, [loadConnections])

  const blockPerson = async (person: ConnectionPerson) => {
    const name = person.displayName || person.username
    if (!window.confirm(`Block ${name}? You will not be matched with them again.`)) return

    const response = await fetch('/api/blocks', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blockedUserId: person.id }),
    })

    if (response.ok) {
      setConnections(current => current.filter(connection => connection.person.id !== person.id))
      return
    }

    const data = await response.json()
    setError(data.error || 'Could not block this person.')
  }

  const totalUnread = connections.reduce((sum, connection) => sum + connection.unreadCount, 0)

  return (
    <MainLayout>
      <section className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-purple-600 sm:text-sm">
              Both of you chose it
            </p>
            <h1 className="mt-1 text-3xl font-black text-gray-950 sm:text-4xl">
              Connections
              {totalUnread > 0 && (
                <span className="ml-3 inline-flex min-w-7 items-center justify-center rounded-full bg-blue-600 px-2 py-1 align-middle text-xs font-black text-white">
                  {totalUnread > 99 ? '99+' : totalUnread}
                </span>
              )}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
              Your post-Chemistry Check inbox. Messages arrive live, unread messages stay counted, and you can see when a Connection is available.
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row">
            {notificationPermission === 'default' && (
              <button
                type="button"
                onClick={async () => {
                  const permission = await Notification.requestPermission()
                  setNotificationPermission(permission)
                }}
                className="rounded-2xl border border-gray-300 bg-white px-5 py-3.5 text-center text-sm font-bold text-gray-800 hover:bg-gray-50"
              >
                Enable alerts
              </button>
            )}
            <Link
              href="/start"
              className="rounded-2xl bg-gray-950 px-5 py-3.5 text-center font-bold text-white hover:bg-gray-800"
            >
              New Chemistry Check
            </Link>
          </div>
        </div>

        {error && <div className="mb-6 rounded-xl bg-red-50 p-4 text-red-700">{error}</div>}

        {isLoading ? (
          <div className="rounded-3xl bg-white p-8 text-gray-500 shadow-sm ring-1 ring-gray-200">
            Loading Connections…
          </div>
        ) : connections.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-center shadow-sm">
            <div className="text-4xl">♥</div>
            <h2 className="mt-3 text-xl font-bold text-gray-900">No Connections yet</h2>
            <p className="mx-auto mt-2 max-w-md text-gray-600">
              Talk to someone first. If you both Vibe, you will find each other here afterward.
            </p>
            <Link
              href="/start"
              className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Start talking
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-200">
            {connections.map((connection, index) => {
              const person = connection.person
              const name = person.displayName || person.username
              const activityDate = connection.lastMessage?.createdAt || connection.createdAt
              const online = onlineByConnection[connection.id] === true

              return (
                <article
                  key={connection.id}
                  className={`group p-4 transition hover:bg-gray-50/70 sm:p-5 ${index > 0 ? 'border-t border-gray-100' : ''}`}
                >
                  <div className="flex gap-3 sm:gap-4">
                    <Link
                      href={`/connections/${connection.id}`}
                      className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-950 text-lg font-black text-white sm:h-14 sm:w-14 sm:text-xl"
                      aria-label={`Open ${name}`}
                    >
                      {name.slice(0, 1).toUpperCase()}
                      <span
                        className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white ${
                          online ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      />
                    </Link>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <Link href={`/connections/${connection.id}`} className="min-w-0 flex-1">
                          <div className="flex min-w-0 items-center gap-2">
                            <h2 className="truncate text-base font-black text-gray-950 sm:text-lg">{name}</h2>
                            {connection.unreadCount > 0 && (
                              <span className="inline-flex min-w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] font-black text-white">
                                {connection.unreadCount > 99 ? '99+' : connection.unreadCount}
                              </span>
                            )}
                          </div>
                          <p className={`truncate text-xs font-medium ${online ? 'text-green-600' : 'text-gray-400'}`}>
                            {lastSeenLabel(person, online)}
                          </p>
                        </Link>
                        <span className="shrink-0 text-xs font-medium text-gray-400">
                          {formatActivity(activityDate)}
                        </span>
                      </div>

                      <Link
                        href={`/connections/${connection.id}`}
                        className={`mt-2 block min-h-[2.5rem] text-sm leading-5 ${
                          connection.unreadCount > 0 ? 'font-semibold text-gray-950' : 'text-gray-600'
                        }`}
                      >
                        {connection.lastMessage ? (
                          <span className="line-clamp-2">
                            {connection.lastMessage.mine ? 'You: ' : ''}
                            {connection.lastMessage.content}
                          </span>
                        ) : (
                          <span className="text-gray-400">
                            You both Vibed. Send the first message or talk again.
                          </span>
                        )}
                      </Link>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <Link
                          href={`/connections/${connection.id}`}
                          className="rounded-xl bg-gray-950 px-4 py-2 text-xs font-black text-white hover:bg-gray-800"
                        >
                          Message
                        </Link>
                        <Link
                          href={`/chat/video?connection=${connection.id}`}
                          className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-black text-gray-800 hover:bg-gray-50"
                        >
                          {online ? 'Call now' : 'Call again'}
                        </Link>
                        <button
                          onClick={() => void blockPerson(person)}
                          className="rounded-xl px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                        >
                          Block
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </MainLayout>
  )
}
