'use client'
import { useState } from 'react'
import Link from 'next/link'

type ChatType = 'text' | 'video' | 'both'

interface Match {
  id: string
  name: string
  location: string
  timestamp: Date
  avatar?: string
  lastMessage?: string
  chatType: ChatType
}

export const Feed = () => {
  const [activeTab, setActiveTab] = useState<ChatType>('text')
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)

  const mockMatches: Match[] = [
    {
      id: '1',
      name: 'John from New York',
      location: 'New York',
      timestamp: new Date(),
      lastMessage: 'Hey, nice to meet you!',
      chatType: 'text'
    },
    {
      id: '2',
      name: 'Sarah from London',
      location: 'London',
      timestamp: new Date(),
      chatType: 'video'
    },
    {
      id: '3',
      name: 'Mike from Tokyo',
      location: 'Tokyo',
      timestamp: new Date(),
      chatType: 'both'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-blue-600">MEETOPIA</h1>
          <div className="flex gap-4">
            <button 
              onClick={() => setActiveTab('text')}
              className={`px-4 py-2 rounded-full ${
                activeTab === 'text' ? 'bg-blue-500 text-white' : 'bg-white'
              }`}
            >
              Text Chats
            </button>
            <button 
              onClick={() => setActiveTab('video')}
              className={`px-4 py-2 rounded-full ${
                activeTab === 'video' ? 'bg-blue-500 text-white' : 'bg-white'
              }`}
            >
              Video Chats
            </button>
            <button 
              onClick={() => setActiveTab('both')}
              className={`px-4 py-2 rounded-full ${
                activeTab === 'both' ? 'bg-blue-500 text-white' : 'bg-white'
              }`}
            >
              All Chats
            </button>
          </div>
        </div>
      </div>

      {/* Matches Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockMatches
          .filter(match => activeTab === 'both' || match.chatType === activeTab)
          .map(match => (
            <div 
              key={match.id}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => {
                if (match.chatType === 'video') {
                  window.location.href = `/chat/video/${match.id}`
                } else {
                  setSelectedMatch(match)
                }
              }}
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                  {match.chatType === 'video' ? '🎥' : '💬'}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{match.name}</h3>
                  <p className="text-gray-500">{match.location}</p>
                  {match.lastMessage && (
                    <p className="text-sm text-gray-400 mt-2">{match.lastMessage}</p>
                  )}
                </div>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-xs text-gray-400">
                  {match.timestamp.toLocaleTimeString()}
                </span>
                <div className="flex gap-2">
                  {match.chatType === 'video' && (
                    <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm">
                      Video
                    </span>
                  )}
                  {(match.chatType === 'text' || match.chatType === 'both') && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">
                      Text
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  )
} 