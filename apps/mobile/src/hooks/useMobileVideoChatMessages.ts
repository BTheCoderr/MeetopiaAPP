import { useCallback, useEffect, useRef, useState } from 'react'
import { Socket } from 'socket.io-client'
import type { ChatMessage } from '@/types/videoChat'

interface Options {
  socket: Socket
  currentPeer: string | null
  enabled?: boolean
}

export function useMobileVideoChatMessages({ socket, currentPeer, enabled = true }: Options) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isPeerTyping, setIsPeerTyping] = useState(false)
  const typingRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!enabled) return
    const onMessage = (data: { id: string; text: string; from: string; timestamp: number }) => {
      if (data.from === socket.id) return
      setMessages(prev => [
        ...prev,
        {
          id: data.id,
          text: data.text,
          sender: 'peer',
          timestamp: data.timestamp ?? Date.now(),
        },
      ])
    }
    const onTypingStart = ({ from }: { from: string }) => {
      if (from === currentPeer) setIsPeerTyping(true)
    }
    const onTypingStop = ({ from }: { from: string }) => {
      if (from === currentPeer) setIsPeerTyping(false)
    }
    socket.on('chat-message', onMessage)
    socket.on('typing-start', onTypingStart)
    socket.on('typing-stop', onTypingStop)
    return () => {
      socket.off('chat-message', onMessage)
      socket.off('typing-start', onTypingStart)
      socket.off('typing-stop', onTypingStop)
    }
  }, [socket, currentPeer, enabled])

  useEffect(() => {
    if (!enabled) return
    setMessages([])
    setIsPeerTyping(false)
  }, [currentPeer, enabled])

  useEffect(() => {
    if (!enabled || !currentPeer || messages.length === 0) return
    const unreadIds = messages.filter(m => m.sender === 'peer' && !m.read).map(m => m.id)
    if (unreadIds.length === 0) return
    socket.emit('mark-messages-read', { messageIds: unreadIds, to: currentPeer })
    setMessages(prev =>
      prev.map(m => (unreadIds.includes(m.id) ? { ...m, read: true, readAt: Date.now() } : m)),
    )
  }, [messages, currentPeer, socket, enabled])

  useEffect(() => {
    if (!enabled) return
    const onRead = ({ messageIds }: { messageIds: string[] }) => {
      setMessages(prev =>
        prev.map(m => (messageIds.includes(m.id) ? { ...m, read: true, readAt: Date.now() } : m)),
      )
    }
    socket.on('message-read', onRead)
    return () => {
      socket.off('message-read', onRead)
    }
  }, [socket, enabled])

  const handleMessageChange = useCallback(
    (text: string) => {
      if (!enabled) return
      setNewMessage(text)
      if (!currentPeer) return
      socket.emit('typing-start', { to: currentPeer })
      if (typingRef.current) clearTimeout(typingRef.current)
      typingRef.current = setTimeout(() => {
        socket.emit('typing-stop', { to: currentPeer })
      }, 2000)
    },
    [socket, currentPeer, enabled],
  )

  const handleSendMessage = useCallback(() => {
    if (!enabled || !newMessage.trim() || !currentPeer) return
    const id = `${socket.id}-${Date.now()}`
    const text = newMessage.trim()
    socket.emit('chat-message', {
      id,
      text,
      to: currentPeer,
      from: socket.id,
      timestamp: Date.now(),
    })
    setMessages(prev => [...prev, { id, text, sender: 'me', timestamp: Date.now() }])
    setNewMessage('')
    socket.emit('typing-stop', { to: currentPeer })
  }, [newMessage, socket, currentPeer, enabled])

  return { messages, newMessage, isPeerTyping, handleMessageChange, handleSendMessage }
}
