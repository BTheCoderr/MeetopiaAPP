'use client'

import { useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import TypingIndicator from '@/components/TypingIndicator'
import type { ChatMessage } from '@/types/videoChat'

interface MessageBarProps {
  messages: ChatMessage[]
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSend: (e: React.FormEvent) => void
  disabled?: boolean
  isPeerTyping?: boolean
  showBubbles?: boolean
  onFocus?: () => void
  isDarkTheme?: boolean
}

export default function MessageBar({
  messages,
  value,
  onChange,
  onSend,
  disabled = false,
  isPeerTyping = false,
  showBubbles = false,
  onFocus,
  isDarkTheme = true,
}: MessageBarProps) {
  const bubblesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (showBubbles && messages.length > 0) {
      bubblesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, showBubbles, isPeerTyping])

  const recentMessages = messages.slice(-3)
  const hasBubbles = showBubbles && (recentMessages.length > 0 || isPeerTyping)

  return (
    <div className="fixed bottom-[calc(6.5rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 w-[min(calc(100%-2rem),22rem)] sm:w-[min(100%,24rem)] px-4 z-20 pointer-events-none">
      <AnimatePresence>
        {hasBubbles && (
          <motion.div
            className="mb-2 space-y-1.5 max-h-36 overflow-y-auto pointer-events-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18 }}
          >
            {recentMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[88%] px-3.5 py-2 rounded-[1.25rem] text-[15px] leading-snug shadow-md backdrop-blur-xl ${
                    message.sender === 'me'
                      ? 'bg-[#0A84FF]/92 text-white rounded-br-[0.35rem]'
                      : isDarkTheme
                        ? 'bg-white/18 text-white rounded-bl-[0.35rem]'
                        : 'bg-white/85 text-gray-900 rounded-bl-[0.35rem]'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {isPeerTyping && (
              <div className="flex justify-start">
                <div className={`px-3 py-1.5 rounded-[1.25rem] backdrop-blur-xl ${
                  isDarkTheme ? 'bg-white/12' : 'bg-black/5'
                }`}>
                  <TypingIndicator isTyping={true} isDarkTheme={isDarkTheme} />
                </div>
              </div>
            )}
            <div ref={bubblesEndRef} />
          </motion.div>
        )}
      </AnimatePresence>

      <form
        onSubmit={onSend}
        className={`flex items-center gap-2 pl-4 pr-1.5 py-1.5 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-2xl pointer-events-auto ${
          isDarkTheme
            ? 'bg-[rgba(28,28,30,0.72)] border border-white/[0.08]'
            : 'bg-white/80 border border-black/[0.06]'
        }`}
      >
        <input
          type="text"
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          placeholder={disabled ? 'Connect to chat…' : 'Type a message…'}
          disabled={disabled}
          className={`flex-1 bg-transparent text-[15px] outline-none min-w-0 ${
            isDarkTheme
              ? 'text-white placeholder-white/45'
              : 'text-gray-900 placeholder-gray-500'
          }`}
        />
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150 ${
            value.trim()
              ? 'bg-[#0A84FF] hover:bg-[#0077ED] text-white scale-100'
              : isDarkTheme
                ? 'bg-white/8 text-white/30 scale-95'
                : 'bg-black/5 text-gray-400 scale-95'
          } disabled:opacity-40`}
          aria-label="Send message"
        >
          <svg className="w-[15px] h-[15px] ml-0.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </form>
    </div>
  )
}
