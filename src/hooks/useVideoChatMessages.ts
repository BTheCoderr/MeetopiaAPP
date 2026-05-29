'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Socket } from 'socket.io-client'
import { useReadReceipts } from '@/hooks/useReadReceipts'
import type { ChatMessage } from '@/types/videoChat'

interface UseVideoChatMessagesOptions {
  socket: Socket | null
  currentPeer: string | null
  chatOpen: boolean
}

export function useVideoChatMessages({ socket, currentPeer, chatOpen }: UseVideoChatMessagesOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isPeerTyping, setIsPeerTyping] = useState(false)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isLocalTypingRef = useRef(false)

  const { updatedMessages, markAllAsRead } = useReadReceipts({
    socket,
    currentPeer,
    messages,
    chatOpen,
  })

  useEffect(() => {
    if (!socket) return

    const handleTypingStart = ({ from }: { from: string }) => {
      if (from === currentPeer) setIsPeerTyping(true)
    }
    const handleTypingStop = ({ from }: { from: string }) => {
      if (from === currentPeer) setIsPeerTyping(false)
    }
    const handleChatMessage = (data: { id: string; text: string; from: string; timestamp: number }) => {
      if (data.from === socket.id) return
      setMessages(prev => {
        if (prev.some(msg => msg.id === data.id)) return prev
        return [...prev, {
          id: data.id || `${data.from}-${data.timestamp}`,
          text: data.text,
          sender: 'peer',
          timestamp: data.timestamp || Date.now(),
        }]
      })
    }

    socket.on('typing-start', handleTypingStart)
    socket.on('typing-stop', handleTypingStop)
    socket.on('chat-message', handleChatMessage)

    return () => {
      socket.off('typing-start', handleTypingStart)
      socket.off('typing-stop', handleTypingStop)
      socket.off('chat-message', handleChatMessage)
    }
  }, [socket, currentPeer])

  useEffect(() => {
    setMessages([])
    setIsPeerTyping(false)
    isLocalTypingRef.current = false
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
  }, [currentPeer])

  const handleMessageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value)
    if (!socket || !currentPeer) return

    if (!isLocalTypingRef.current) {
      isLocalTypingRef.current = true
      socket.emit('typing-start', { to: currentPeer })
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      isLocalTypingRef.current = false
      socket.emit('typing-stop', { to: currentPeer })
    }, 2000)
  }, [socket, currentPeer])

  const handleSendMessage = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !socket || !currentPeer) return

    const messageId = `${socket.id}-${Date.now()}`
    const messageText = newMessage.trim()

    socket.emit('chat-message', {
      id: messageId,
      text: messageText,
      to: currentPeer,
      from: socket.id,
      timestamp: Date.now(),
    })

    setMessages(prev => [...prev, {
      id: messageId,
      text: messageText,
      sender: 'me',
      timestamp: Date.now(),
    }])
    setNewMessage('')

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    isLocalTypingRef.current = false
    socket.emit('typing-stop', { to: currentPeer })
  }, [newMessage, socket, currentPeer])

  return {
    messages,
    updatedMessages,
    newMessage,
    isPeerTyping,
    markAllAsRead,
    handleMessageChange,
    handleSendMessage,
  }
}
