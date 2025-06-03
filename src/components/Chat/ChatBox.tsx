'use client'
import React, { useState } from 'react'
import { Socket } from 'socket.io-client'

interface ChatBoxProps {
  socket: Socket
  roomId: string
  userId: string
}

export default function ChatBox({ socket, roomId, userId }: ChatBoxProps) {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Array<{text: string, sender: string}>>([])

  const sendMessage = () => {
    if (!message.trim()) return
    
    socket.emit('chat-message', {
      roomId,
      userId,
      message
    })
    
    setMessages(prev => [...prev, { text: message, sender: userId }])
    setMessage('')
  }

  return (
    <div className="bg-gray-100 p-4 rounded h-full">
      <div className="h-[400px] overflow-y-auto mb-4">
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`mb-2 p-2 rounded ${
              msg.sender === userId ? 'bg-blue-500 text-white ml-auto' : 'bg-gray-300'
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          className="flex-1 p-2 rounded border"
          placeholder="Type a message..."
        />
        <button 
          onClick={sendMessage}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Send
        </button>
      </div>
    </div>
  )
} 