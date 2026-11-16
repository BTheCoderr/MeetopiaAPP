import { useCallback, useEffect, useRef, useState } from 'react'
import type { Socket } from 'socket.io-client'
import { currentProduct } from '@/lib/currentProduct'
import type { ConnectionMessage } from '@/types/currentProduct'
import type { ChatMessage } from '@/types/videoChat'

function toChatMessage(message: ConnectionMessage): ChatMessage {
  return {
    id: message.id,
    text: message.content,
    sender: message.mine ? 'me' : 'peer',
    timestamp: new Date(message.createdAt).getTime(),
    read: Boolean(message.readAt),
    readAt: message.readAt ? new Date(message.readAt).getTime() : undefined,
  }
}

type Options = {
  socket: Socket | null
  connectionId: string | null
}

export function usePersistentInCallMessages({ socket, connectionId }: Options) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isPeerTyping, setIsPeerTyping] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const proofRef = useRef<string | null>(null)
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const load = useCallback(async () => {
    if (!connectionId) return
    const [detail, thread] = await Promise.all([
      currentProduct.connections.get(connectionId),
      currentProduct.connections.messages(connectionId),
    ])
    proofRef.current = detail.connection.realtimeProof
    setMessages(thread.messages.map(toChatMessage))
    if (thread.newlyReadIds?.length && socket?.connected) {
      socket.emit('connection-read', {
        proof: detail.connection.realtimeProof,
        messageIds: thread.newlyReadIds,
      })
    }
  }, [connectionId, socket])

  useEffect(() => {
    let live = true
    void Promise.resolve().then(() => {
      if (!live) return
      setMessages([])
      setNewMessage('')
      setIsPeerTyping(false)
      setError(null)
      proofRef.current = null
      if (!connectionId) return
      return load()
    }).catch(cause => {
      if (live) setError(cause instanceof Error ? cause.message : 'Unable to load Connection messages.')
    })
    return () => { live = false }
  }, [connectionId, load])

  useEffect(() => {
    if (!socket || !connectionId) return
    const onCreated = (event: { connectionId?: string; message?: ConnectionMessage }) => {
      if (event.connectionId !== connectionId || !event.message?.id) return
      setMessages(previous => previous.some(message => message.id === event.message!.id)
        ? previous
        : [...previous, toChatMessage(event.message!)])
      void load().catch(() => {})
    }
    const onRead = (event: { connectionId?: string; messageIds?: string[]; readAt?: string }) => {
      if (event.connectionId !== connectionId || !Array.isArray(event.messageIds)) return
      setMessages(previous => previous.map(message => event.messageIds!.includes(message.id)
        ? { ...message, read: true, readAt: new Date(event.readAt || Date.now()).getTime() }
        : message))
    }
    const onTyping = (event: { connectionId?: string; typing?: boolean }) => {
      if (event.connectionId === connectionId) setIsPeerTyping(event.typing === true)
    }
    socket.on('connection-message-created', onCreated)
    socket.on('connection-read', onRead)
    socket.on('connection-typing', onTyping)
    return () => {
      socket.off('connection-message-created', onCreated)
      socket.off('connection-read', onRead)
      socket.off('connection-typing', onTyping)
      if (typingTimer.current) clearTimeout(typingTimer.current)
      const proof = proofRef.current
      if (proof && socket.connected) socket.emit('connection-typing', { proof, typing: false })
    }
  }, [socket, connectionId, load])

  const handleMessageChange = useCallback((value: string) => {
    setNewMessage(value)
    const proof = proofRef.current
    if (!socket?.connected || !proof || !connectionId) return
    socket.emit('connection-typing', { proof, typing: true })
    if (typingTimer.current) clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => {
      socket.emit('connection-typing', { proof, typing: false })
    }, 2000)
  }, [socket, connectionId])

  const handleSendMessage = useCallback(async () => {
    const content = newMessage.trim()
    if (!connectionId || !content || sending || content.length > 2000) return
    setSending(true)
    setError(null)
    try {
      const result = await currentProduct.connections.sendMessage(connectionId, content)
      setMessages(previous => previous.some(message => message.id === result.message.id)
        ? previous
        : [...previous, toChatMessage(result.message)])
      setNewMessage('')
      if (socket?.connected && proofRef.current) {
        socket.emit('connection-message-created', {
          proof: proofRef.current,
          message: { id: result.message.id },
        })
        socket.emit('connection-typing', { proof: proofRef.current, typing: false })
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save your message.')
    } finally {
      setSending(false)
    }
  }, [socket, connectionId, newMessage, sending])

  return {
    messages, newMessage, isPeerTyping, error, sending,
    handleMessageChange, handleSendMessage,
  }
}
