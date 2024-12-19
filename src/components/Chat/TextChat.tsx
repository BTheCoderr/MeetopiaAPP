'use client'
import React, { useState } from 'react'

export const TextChat = () => {
  const [messages, setMessages] = useState<Array<{text: string, sender: 'me' | 'them'}>>([])
  const [newMessage, setNewMessage] = useState('')

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-2xl font-bold">Text Chat</h2>
        </div>
        
        <div className="h-[70vh] flex flex-col">
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] rounded-lg p-3 ${
                  msg.sender === 'me' ? 'bg-blue-500 text-white' : 'bg-gray-100'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 px-4 py-2 border rounded-full"
                placeholder="Type a message..."
              />
              <button 
                onClick={() => {
                  if (newMessage.trim()) {
                    setMessages(prev => [...prev, { text: newMessage, sender: 'me' }])
                    setNewMessage('')
                  }
                }}
                className="px-6 py-2 bg-blue-500 text-white rounded-full"
              >
                Send
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Controls - Centered */}
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex justify-center gap-4">
          <button 
            className="px-8 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors shadow-lg"
          >
            NEXT PERSON
          </button>
          <button className="px-8 py-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg">
            LEAVE CHAT
          </button>
        </div>
      </div>
    </div>
  )
} 