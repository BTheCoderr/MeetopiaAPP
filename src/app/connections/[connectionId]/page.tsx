'use client'

import { FormEvent, useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import MainLayout from '@/components/Layout/MainLayout'
import { useConnectionThreadRealtime } from '@/hooks/useConnectionThreadRealtime'

type Person = {
  id: string
  username: string
  displayName: string | null
  bio: string | null
  interests: string[]
  lastSeenAt: string | null
}

type Connection = {
  id: string
  createdAt: string
  person: Person
  realtimeProof: string
}

type Message = {
  id: string
  content: string
  createdAt: string
  readAt: string | null
  senderId: string
  receiverId: string
  mine: boolean
}

const reportReasons = [
  'Inappropriate behavior',
  'Harassment',
  'Spam',
  'Safety concern',
  'Other',
]

function activityLabel(person: Person, online: boolean) {
  if (online) return 'Online now'
  if (!person.lastSeenAt) return 'Offline'

  const lastSeen = new Date(person.lastSeenAt)
  const minutes = Math.floor((Date.now() - lastSeen.getTime()) / 60_000)
  if (minutes < 2) return 'Active recently'
  if (minutes < 60) return `Active ${minutes}m ago`
  if (minutes < 24 * 60) return `Active ${Math.floor(minutes / 60)}h ago`
  return `Active ${lastSeen.toLocaleDateString([], { month: 'short', day: 'numeric' })}`
}

export default function ConnectionDetailPage() {
  const params = useParams<{ connectionId: string }>()
  const router = useRouter()
  const connectionId = params.connectionId

  const [connection, setConnection] = useState<Connection | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [draft, setDraft] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSafety, setShowSafety] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [reportReason, setReportReason] = useState(reportReasons[0])
  const [reportDetails, setReportDetails] = useState('')
  const [reportSent, setReportSent] = useState(false)
  const [peerOnline, setPeerOnline] = useState(false)
  const [peerTyping, setPeerTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const emitReadRef = useRef<(messageIds: string[]) => void>(() => undefined)

  const loadConnection = useCallback(async () => {
    const response = await fetch(`/api/connections/${connectionId}`, {
      cache: 'no-store',
      credentials: 'same-origin',
    })

    if (response.status === 401) {
      router.replace(`/auth/signin?next=/connections/${connectionId}`)
      return null
    }

    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Could not load this Connection.')
    setConnection(data.connection)
    return data.connection as Connection
  }, [connectionId, router])

  const markMessagesRead = useCallback(
    async (messageIds: string[]) => {
      if (messageIds.length === 0) return

      const response = await fetch(`/api/connections/${connectionId}/messages`, {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageIds }),
      })
      const data = await response.json().catch(() => null)
      if (!response.ok || !Array.isArray(data?.messageIds) || data.messageIds.length === 0) return

      setMessages(current =>
        current.map(message =>
          data.messageIds.includes(message.id)
            ? { ...message, readAt: data.readAt || new Date().toISOString() }
            : message,
        ),
      )
      emitReadRef.current(data.messageIds)
      window.dispatchEvent(new CustomEvent('meetopia-notifications-changed'))
    },
    [connectionId],
  )

  const loadMessages = useCallback(
    async (quiet = false) => {
      try {
        const response = await fetch(`/api/connections/${connectionId}/messages`, {
          cache: 'no-store',
          credentials: 'same-origin',
        })
        if (response.status === 401) {
          router.replace(`/auth/signin?next=/connections/${connectionId}`)
          return
        }

        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Could not load messages.')
        setMessages(data.messages || [])
        if (Array.isArray(data.newlyReadIds) && data.newlyReadIds.length > 0) {
          emitReadRef.current(data.newlyReadIds)
          window.dispatchEvent(new CustomEvent('meetopia-notifications-changed'))
        }
        if (!quiet) setError(null)
      } catch (loadError) {
        if (!quiet) {
          setError(loadError instanceof Error ? loadError.message : 'Could not load messages.')
        }
      }
    },
    [connectionId, router],
  )

  const realtime = useConnectionThreadRealtime({
    connectionId,
    realtimeProof: connection?.realtimeProof || null,
    otherUserId: connection?.person.id || null,
    onMessage: message => {
      setMessages(current => {
        if (current.some(existing => existing.id === message.id)) return current
        return [...current, { ...message, readAt: message.readAt || null }]
      })
      setPeerOnline(true)
      void markMessagesRead([message.id])
    },
    onTyping: setPeerTyping,
    onRead: (messageIds, readAt) => {
      setMessages(current =>
        current.map(message =>
          messageIds.includes(message.id)
            ? { ...message, readAt }
            : message,
        ),
      )
    },
    onPresence: setPeerOnline,
  })

  useEffect(() => {
    emitReadRef.current = realtime.emitRead
  }, [realtime.emitRead])

  useEffect(() => {
    let cancelled = false

    const start = async () => {
      try {
        await loadConnection()
        if (!cancelled) await loadMessages()
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Could not load this Connection.')
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void start()

    const interval = window.setInterval(() => {
      void loadMessages(true)
    }, 30_000)

    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [loadConnection, loadMessages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [messages.length, peerTyping])

  useEffect(() => {
    if (!draft.trim() || !realtime.isConnected) {
      realtime.emitTyping(false)
      return
    }

    realtime.emitTyping(true)
    const timeout = window.setTimeout(() => realtime.emitTyping(false), 1_200)
    return () => window.clearTimeout(timeout)
  }, [draft, realtime.isConnected, realtime.emitTyping])

  const sendMessage = async (event: FormEvent) => {
    event.preventDefault()
    const content = draft.trim()
    if (!content || isSending) return

    setIsSending(true)
    setError(null)
    realtime.emitTyping(false)

    try {
      const response = await fetch(`/api/connections/${connectionId}/messages`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Could not send message.')

      setMessages(current => {
        if (current.some(message => message.id === data.message.id)) return current
        return [...current, data.message]
      })
      setDraft('')
      realtime.emitMessage(data.message)
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : 'Could not send message.')
    } finally {
      setIsSending(false)
    }
  }

  const removeConnection = async () => {
    if (!connection) return
    const name = connection.person.displayName || connection.person.username
    if (!window.confirm(`Remove ${name} from your Connections? This does not block them.`)) return

    const response = await fetch(`/api/connections/${connectionId}`, {
      method: 'DELETE',
      credentials: 'same-origin',
    })
    const data = await response.json().catch(() => null)

    if (!response.ok) {
      setError(data?.error || 'Could not remove this Connection.')
      return
    }

    router.push('/connections')
  }

  const blockPerson = async () => {
    if (!connection) return
    const name = connection.person.displayName || connection.person.username
    if (!window.confirm(`Block ${name}? You will not be matched or connected again.`)) return

    const response = await fetch('/api/blocks', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blockedUserId: connection.person.id }),
    })
    const data = await response.json().catch(() => null)

    if (!response.ok) {
      setError(data?.error || 'Could not block this person.')
      return
    }

    router.push('/connections')
  }

  const submitReport = async () => {
    if (!connection) return

    const response = await fetch('/api/reports', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reportedUserId: connection.person.id,
        reason: reportReason,
        details: reportDetails.trim() || undefined,
      }),
    })
    const data = await response.json().catch(() => null)

    if (!response.ok) {
      setError(data?.error || 'Could not submit report.')
      return
    }

    setReportSent(true)
    setReportDetails('')
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
          <div className="rounded-3xl bg-white p-8 text-gray-500 shadow-sm">Loading Connection…</div>
        </div>
      </MainLayout>
    )
  }

  if (!connection) {
    return (
      <MainLayout>
        <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
          <div className="rounded-3xl bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-black text-gray-950">Connection unavailable</h1>
            <p className="mt-2 text-gray-600">{error || 'This Connection no longer exists.'}</p>
            <Link href="/connections" className="mt-6 inline-flex font-bold text-blue-600">
              Back to Connections
            </Link>
          </div>
        </div>
      </MainLayout>
    )
  }

  const person = connection.person
  const name = person.displayName || person.username

  return (
    <MainLayout>
      <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
        <Link href="/connections" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-950">
          <span aria-hidden="true">←</span> Connections
        </Link>

        <section className="mt-5 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-200">
          <header className="border-b border-gray-100 p-5 sm:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gray-950 text-xl font-black text-white sm:h-16 sm:w-16">
                  {name.slice(0, 1).toUpperCase()}
                  <span
                    className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white ${
                      peerOnline ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                </div>
                <div className="min-w-0">
                  <h1 className="truncate text-2xl font-black text-gray-950 sm:text-3xl">{name}</h1>
                  <p className="mt-1 text-sm text-gray-500">@{person.username}</p>
                  <p className={`mt-1 text-xs font-semibold ${peerOnline ? 'text-green-600' : 'text-gray-400'}`}>
                    {activityLabel(person, peerOnline)}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Link
                  href={`/chat/video?connection=${connection.id}`}
                  className="rounded-2xl bg-green-500 px-5 py-3 text-center text-sm font-black text-white shadow-sm hover:bg-green-600"
                >
                  Video call again
                </Link>
                <button
                  type="button"
                  onClick={() => setShowSafety(value => !value)}
                  className="rounded-2xl border border-gray-200 px-5 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50"
                >
                  Safety & options
                </button>
              </div>
            </div>

            {(person.bio || person.interests.length > 0) && (
              <div className="mt-5 rounded-2xl bg-gray-50 p-4">
                {person.bio && <p className="text-sm leading-6 text-gray-700">{person.bio}</p>}
                {person.interests.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {person.interests.map(interest => (
                      <span key={interest} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-600 ring-1 ring-gray-200">
                        {interest}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {showSafety && (
              <div className="mt-5 grid gap-2 rounded-2xl border border-gray-200 p-4 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => setShowReport(value => !value)}
                  className="rounded-xl bg-gray-100 px-4 py-3 text-sm font-bold text-gray-800 hover:bg-gray-200"
                >
                  Report
                </button>
                <button
                  type="button"
                  onClick={() => void removeConnection()}
                  className="rounded-xl bg-gray-100 px-4 py-3 text-sm font-bold text-gray-800 hover:bg-gray-200"
                >
                  Remove Connection
                </button>
                <button
                  type="button"
                  onClick={() => void blockPerson()}
                  className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700 hover:bg-red-100"
                >
                  Block
                </button>
              </div>
            )}

            {showReport && (
              <div className="mt-4 rounded-2xl border border-red-100 bg-red-50/50 p-4">
                {reportSent ? (
                  <div className="text-sm font-semibold text-green-700">Report submitted. Thank you.</div>
                ) : (
                  <div className="space-y-3">
                    <select
                      value={reportReason}
                      onChange={event => setReportReason(event.target.value)}
                      className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm"
                    >
                      {reportReasons.map(reason => <option key={reason}>{reason}</option>)}
                    </select>
                    <textarea
                      value={reportDetails}
                      onChange={event => setReportDetails(event.target.value)}
                      placeholder="Anything else we should know? (optional)"
                      rows={3}
                      className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => void submitReport()}
                      className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white"
                    >
                      Submit report
                    </button>
                  </div>
                )}
              </div>
            )}
          </header>

          <section className="flex min-h-[460px] flex-col">
            <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50/70 p-4 sm:p-6">
              {messages.length === 0 ? (
                <div className="mx-auto max-w-md py-16 text-center">
                  <div className="text-3xl">♥</div>
                  <h2 className="mt-3 text-lg font-black text-gray-900">You already broke the ice.</h2>
                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    You met live first and both chose to stay connected. Send the first message whenever you want.
                  </p>
                </div>
              ) : (
                messages.map(message => (
                  <div key={message.id} className={`flex ${message.mine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-5 sm:max-w-[70%] ${
                      message.mine
                        ? 'rounded-br-md bg-blue-600 text-white'
                        : 'rounded-bl-md bg-white text-gray-900 shadow-sm ring-1 ring-gray-200'
                    }`}>
                      <p className="whitespace-pre-wrap break-words">{message.content}</p>
                      <p className={`mt-1 text-[10px] ${message.mine ? 'text-blue-100' : 'text-gray-400'}`}>
                        {new Date(message.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                        {message.mine && message.readAt ? ' · Read' : ''}
                      </p>
                    </div>
                  </div>
                ))
              )}

              {peerTyping && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-md bg-white px-4 py-2 text-sm font-semibold text-gray-400 shadow-sm ring-1 ring-gray-200">
                    {name} is typing…
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            <form onSubmit={sendMessage} className="border-t border-gray-100 bg-white p-3 sm:p-4">
              {error && <div className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
              <div className="flex items-end gap-2">
                <textarea
                  value={draft}
                  onChange={event => setDraft(event.target.value)}
                  onKeyDown={event => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault()
                      event.currentTarget.form?.requestSubmit()
                    }
                  }}
                  maxLength={2000}
                  rows={1}
                  placeholder={`Message ${name}…`}
                  className="max-h-32 min-h-[48px] flex-1 resize-none rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={!draft.trim() || isSending}
                  className="h-12 rounded-2xl bg-blue-600 px-5 text-sm font-black text-white disabled:opacity-40"
                >
                  {isSending ? 'Sending…' : 'Send'}
                </button>
              </div>
              <p className="mt-2 text-center text-[11px] text-gray-400">
                {realtime.isConnected ? 'Live messaging connected' : 'Messages will still save if realtime reconnects'}
              </p>
            </form>
          </section>
        </section>
      </main>
    </MainLayout>
  )
}
