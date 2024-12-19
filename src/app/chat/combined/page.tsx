'use client'
import { useEffect } from 'react'
import { CombinedChat } from '@/components/Chat/CombinedChat'
import { ChatNavigation } from '@/components/Chat/ChatNavigation'

export default function CombinedChatPage() {
  useEffect(() => {
    const requestPermission = async () => {
      try {
        const permission = await Notification.requestPermission()
        console.log('Notification permission:', permission)
      } catch (error) {
        console.error('Error requesting permission:', error)
      }
    }
    
    requestPermission()
  }, [])

  return (
    <>
      <ChatNavigation />
      <CombinedChat />
    </>
  )
} 