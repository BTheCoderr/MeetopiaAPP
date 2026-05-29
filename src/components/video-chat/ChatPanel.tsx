'use client'

import MessageBar from './MessageBar'
import type { ChatMessage } from '@/types/videoChat'

interface ChatPanelProps {
  isChatOpen: boolean
  isDarkTheme: boolean
  hasPeer: boolean
  updatedMessages: ChatMessage[]
  newMessage: string
  isPeerTyping: boolean
  markAllAsRead: () => void
  handleMessageChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSendMessage: (e: React.FormEvent) => void
  onFocus?: () => void
}

export default function ChatPanel({
  isChatOpen,
  isDarkTheme,
  hasPeer,
  updatedMessages,
  newMessage,
  isPeerTyping,
  markAllAsRead,
  handleMessageChange,
  handleSendMessage,
  onFocus,
}: ChatPanelProps) {
  const showBubbles =
    isChatOpen ||
    updatedMessages.length > 0 ||
    isPeerTyping

  const handleFocus = () => {
    markAllAsRead()
    onFocus?.()
  }

  return (
    <MessageBar
      messages={updatedMessages}
      value={newMessage}
      onChange={handleMessageChange}
      onSend={handleSendMessage}
      disabled={!hasPeer}
      isPeerTyping={isPeerTyping}
      showBubbles={showBubbles}
      onFocus={handleFocus}
      isDarkTheme={isDarkTheme}
    />
  )
}
