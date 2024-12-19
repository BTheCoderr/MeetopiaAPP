import React from 'react'

interface ChatMessageProps {
  message: string
  sender: 'me' | 'them'
  timestamp: Date
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, sender, timestamp }) => {
  return (
    <div className={`flex ${sender === 'me' ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[70%] rounded-lg p-3 ${
        sender === 'me' ? 'bg-blue-500 text-white' : 'bg-gray-200'
      }`}>
        <p>{message}</p>
        <span className="text-xs opacity-70">
          {timestamp.toLocaleTimeString()}
        </span>
      </div>
    </div>
  )
} 