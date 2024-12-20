'use client'
import { useUser } from '../../context/UserContext'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { ErrorMessage } from '../ui/ErrorMessage'

interface RoomProps {
  type: 'text' | 'combined'
}

export function Room({ type }: RoomProps) {
  const { user } = useUser()

  if (!user) {
    return <ErrorMessage message="Please sign in to access chat" />
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">
          {type === 'text' ? 'Text Chat' : 'Combined Chat'}
        </h1>
        {/* Add your chat implementation here */}
        <div className="p-4 text-center">
          <LoadingSpinner />
          <p className="mt-2">Setting up {type} chat...</p>
        </div>
      </div>
    </div>
  )
} 