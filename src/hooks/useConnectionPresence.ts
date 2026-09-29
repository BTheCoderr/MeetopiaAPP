'use client'

import { useEffect, useMemo, useState } from 'react'
import { io } from 'socket.io-client'

type ConnectionProof = {
  id: string
  realtimeProof: string
}

export function useConnectionPresence(connections: ConnectionProof[]) {
  const [onlineByConnection, setOnlineByConnection] = useState<Record<string, boolean>>({})

  const proofKey = useMemo(
    () => connections.map(connection => `${connection.id}:${connection.realtimeProof}`).join('|'),
    [connections],
  )

  useEffect(() => {
    if (connections.length === 0) return

    let disposed = false
    let liveSocket: ReturnType<typeof io> | null = null
    let interval: number | null = null

    const connect = async () => {
      const response = await fetch('/api/auth/socket-token', {
        cache: 'no-store',
        credentials: 'same-origin',
        headers: { Accept: 'application/json' },
      })
      if (!response.ok) return
      const data = await response.json().catch(() => null)
      if (!data?.token || disposed) return

      liveSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3003', {
        transports: ['polling', 'websocket'],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
        auth: { token: data.token },
      })

      const query = () => {
        liveSocket?.emit('connection-presence-query', {
          proofs: connections.map(connection => connection.realtimeProof),
        })
      }

      liveSocket.on('connect', () => {
        query()
        interval = window.setInterval(query, 15_000)
      })

      liveSocket.on(
        'connection-presence-result',
        ({ presence }: { presence?: Array<{ connectionId: string; online: boolean }> }) => {
          if (!presence) return
          setOnlineByConnection(current => {
            const next = { ...current }
            presence.forEach(item => {
              next[item.connectionId] = item.online
            })
            return next
          })
        },
      )

      liveSocket.on(
        'connection-message-created',
        ({ connectionId }: { connectionId: string }) => {
          setOnlineByConnection(current => ({
            ...current,
            [connectionId]: true,
          }))
        },
      )
    }

    void connect()

    return () => {
      disposed = true
      if (interval) window.clearInterval(interval)
      liveSocket?.removeAllListeners()
      liveSocket?.disconnect()
    }
  }, [proofKey])

  return onlineByConnection
}
