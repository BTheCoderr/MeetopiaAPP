'use client'
import { VideoChat } from '@/components/Chat/VideoChat'
import { ChatNavigation } from '@/components/Chat/ChatNavigation'

export default function VideoChatPage() {
  return (
    <>
      <ChatNavigation />
      <VideoChat />
    </>
  )
}