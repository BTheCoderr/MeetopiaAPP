'use client'

import { useEffect, useMemo, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { usePathname, useRouter } from 'next/navigation'

type IncomingCall = {
  inviteId: string
  connectionId: string
  callerUserId: string
  callerDisplayName: string
  expiresAt?: number
}

export default function IncomingConnectionCall() {
  const pathname = usePathname()
  const router = useRouter()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null)
  const [status, setStatus] = useState<string | null>(null)

  const enabled = useMemo(
    () => pathname !== '/chat/video' && !pathname.startsWith('/auth/'),
    [pathname]
  )

  useEffect(() => {
    if (!enabled) return

    let disposed = false
    let liveSocket: Socket | null = null

    const connect = async () => {
      try {
        const response = await fetch('/api/auth/socket-token', {
          cache: 'no-store',
          credentials: 'same-origin',
          headers: { Accept: 'application/json' },
        })

        if (!response.ok) return
        const data = await response.json().catch(() => null)
        if (!data?.token || disposed) return

        liveSocket = io(
          process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3003',
          {
            transports: ['polling', 'websocket'],
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            timeout: 10000,
            auth: { token: data.token },
          }
        )

        setSocket(liveSocket)

        liveSocket.on('incoming-connection-call', (call: IncomingCall) => {
          setStatus(null)
          setIncomingCall(call)

          if (
            typeof window !== 'undefined' &&
            document.hidden &&
            'Notification' in window &&
            Notification.permission === 'granted'
          ) {
            new Notification('Meetopia call', {
              body: `${call.callerDisplayName || 'A Connection'} wants to talk.`,
            })
          }
        })

        liveSocket.on(
          'connection-call-cancelled',
          ({ inviteId }: { inviteId?: string }) => {
            setIncomingCall(current =>
              current && (!inviteId || current.inviteId === inviteId) ? null : current
            )
            setStatus('That call was cancelled.')
          }
        )

        liveSocket.on(
          'connection-call-expired',
          ({ inviteId }: { inviteId?: string }) => {
            setIncomingCall(current =>
              current && (!inviteId || current.inviteId === inviteId) ? null : current
            )
            setStatus('You missed a Meetopia call.')
          }
        )
      } catch {
        // Incoming calls are optional enhancement; page navigation should keep working.
      }
    }

    void connect()

    return () => {
      disposed = true
      liveSocket?.removeAllListeners()
      liveSocket?.disconnect()
      setSocket(null)
      setIncomingCall(null)
    }
  }, [enabled])

  const accept = () => {
    if (!incomingCall) return
    const { inviteId, connectionId } = incomingCall
    setIncomingCall(null)
    router.push(
      `/chat/video?connection=${encodeURIComponent(connectionId)}&incomingCall=${encodeURIComponent(inviteId)}`
    )
  }

  const decline = () => {
    if (!incomingCall) return
    socket?.emit('decline-connection-call', { inviteId: incomingCall.inviteId })
    setIncomingCall(null)
    setStatus('Call declined.')
  }

  if (!enabled) return null

  return (
    <>
      {status && (
        <div className="fixed bottom-4 left-1/2 z-[80] -translate-x-1/2 rounded-full bg-gray-950 px-4 py-2 text-sm font-semibold text-white shadow-xl">
          {status}
          <button
            type="button"
            onClick={() => setStatus(null)}
            className="ml-3 text-white/60"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      {incomingCall && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 px-4 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-3xl bg-[#161618] p-7 text-center text-white shadow-2xl ring-1 ring-white/10">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-3xl font-black">
              {(incomingCall.callerDisplayName || 'M').slice(0, 1).toUpperCase()}
            </div>
            <p className="mt-5 text-xs font-black uppercase tracking-[0.24em] text-green-300">
              Incoming Meetopia call
            </p>
            <h2 className="mt-2 text-3xl font-black">
              {incomingCall.callerDisplayName || 'Your Connection'}
            </h2>
            <p className="mt-2 text-sm leading-6 text-white/60">
              Wants to talk again.
            </p>

            <div className="mt-7 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={decline}
                className="rounded-2xl bg-red-500 px-4 py-4 font-black text-white hover:bg-red-600"
              >
                Decline
              </button>
              <button
                type="button"
                onClick={accept}
                className="rounded-2xl bg-green-500 px-4 py-4 font-black text-white hover:bg-green-600"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
