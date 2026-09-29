'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

type MessagePayload = {
  id: string
  content: string
  createdAt: string
  readAt?: string | null
  senderId: string
  receiverId: string
  mine: boolean
}

type Options = {
  connectionId: string
  realtimeProof: string | null
  otherUserId: string | null
  onMessage: (message: MessagePayload) => void
  onTyping: (typing: boolean) => void
  onRead: (messageIds: string[], readAt: string) => void
  onPresence: (online: boolean) => void
}

export function useConnectionThreadRealtime({
  connectionId,
  realtimeProof,
  otherUserId,
  onMessage,
  onTyping,
  onRead,
  onPresence,
}: Options) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const callbacksRef = useRef({ onMessage, onTyping, onRead, onPresence })

  useEffect(() => {
    callbacksRef.current = { onMessage, onTyping, onRead, onPresence }
  }, [onMessage, onTyping, onRead, onPresence])

  useEffect(() => {
    if (!realtimeProof || !otherUserId) return

    let disposed = false
    let liveSocket: Socket | null = null
    let presenceInterval: number | null = null

    const connect = async () => {
      const tokenResponse = await fetch('/api/auth/socket-token', {
        cache: 'no-store',
        credentials: 'same-origin',
        headers: { Accept: 'application/json' },
      })
      if (!tokenResponse.ok) return

      const data = await tokenResponse.json().catch(() => null)
      if (!data?.token || disposed) return

      liveSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3003', {
        transports: ['polling', 'websocket'],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
        auth: { token: data.token },
      })
      setSocket(liveSocket)

      const queryPresence = () => {
        liveSocket?.emit('connection-presence-query', {
          proofs: [realtimeProof],
        })
      }

      liveSocket.on('connect', () => {
        setIsConnected(true)
        queryPresence()
        presenceInterval = window.setInterval(queryPresence, 15_000)
      })

      liveSocket.on('disconnect', () => {
        setIsConnected(false)
        if (presenceInterval) {
          window.clearInterval(presenceInterval)
          presenceInterval = null
        }
      })

      liveSocket.on(
        'connection-presence-result',
        ({ presence }: { presence?: Array<{ connectionId: string; userId: string; online: boolean }> }) => {
          const match = presence?.find(
            item => item.connectionId === connectionId && item.userId === otherUserId,
          )
          if (match) callbacksRef.current.onPresence(match.online)
        },
      )

      liveSocket.on(
        'connection-message-created',
        ({ connectionId: incomingConnectionId, message }: { connectionId: string; message: MessagePayload }) => {
          if (incomingConnectionId !== connectionId) return
          callbacksRef.current.onPresence(true)
          callbacksRef.current.onMessage(message)
        },
      )

      liveSocket.on(
        'connection-typing',
        ({ connectionId: incomingConnectionId, userId, typing }: { connectionId: string; userId: string; typing: boolean }) => {
          if (incomingConnectionId !== connectionId || userId !== otherUserId) return
          callbacksRef.current.onPresence(true)
          callbacksRef.current.onTyping(typing)
        },
      )

      liveSocket.on(
        'connection-read',
        ({
          connectionId: incomingConnectionId,
          userId,
          messageIds,
          readAt,
        }: {
          connectionId: string
          userId: string
          messageIds: string[]
          readAt: string
        }) => {
          if (incomingConnectionId !== connectionId || userId !== otherUserId) return
          callbacksRef.current.onPresence(true)
          callbacksRef.current.onRead(messageIds || [], readAt)
        },
      )
    }

    void connect()

    return () => {
      disposed = true
      if (presenceInterval) window.clearInterval(presenceInterval)
      liveSocket?.removeAllListeners()
      liveSocket?.disconnect()
      setSocket(null)
      setIsConnected(false)
    }
  }, [connectionId, realtimeProof, otherUserId])

  const emitMessage = useCallback(
    (message: MessagePayload) => {
      if (!socket?.connected || !realtimeProof) return
      socket.emit('connection-message-created', {
        proof: realtimeProof,
        message,
      })
    },
    [socket, realtimeProof],
  )

  const emitTyping = useCallback(
    (typing: boolean) => {
      if (!socket?.connected || !realtimeProof) return
      socket.emit('connection-typing', {
        proof: realtimeProof,
        typing,
      })
    },
    [socket, realtimeProof],
  )

  const emitRead = useCallback(
    (messageIds: string[]) => {
      if (!socket?.connected || !realtimeProof || messageIds.length === 0) return
      socket.emit('connection-read', {
        proof: realtimeProof,
        messageIds,
      })
    },
    [socket, realtimeProof],
  )

  return {
    isConnected,
    emitMessage,
    emitTyping,
    emitRead,
  }
}
