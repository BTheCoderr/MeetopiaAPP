'use client'

import React from 'react'
import { VideoControls } from '../../components/VideoChat/VideoControls'
import { ConnectionStatus } from '../../components/VideoChat/ConnectionStatus'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { ErrorMessage } from '../../components/ui/ErrorMessage'
import { VideoPlayer } from '../../components/Video/VideoPlayer'
import { ChatMessage } from '../../components/Chat/ChatMessage'
import { ProfileCard } from '../../components/Profile/ProfileCard'
import { mockVideoChat } from '../../lib/mocks/videoChat'

export default function TestPage() {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">Component Testing</h1>
      
      <section className="space-y-4">
        <h2 className="text-xl">Video Controls</h2>
        <VideoControls {...mockVideoChat} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl">Connection Status</h2>
        <ConnectionStatus status={mockVideoChat.status} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl">Loading State</h2>
        <div className="h-40">
          <LoadingSpinner />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl">Error State</h2>
        <ErrorMessage 
          message="Something went wrong" 
          retry={() => alert('Retrying...')} 
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl">Chat Messages</h2>
        <div className="max-w-md mx-auto bg-white p-4 rounded-lg">
          <ChatMessage 
            message="Hello there!" 
            sender="me" 
            timestamp={new Date()} 
          />
          <ChatMessage 
            message="Hi! How are you?" 
            sender="them" 
            timestamp={new Date()} 
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl">Profile Card</h2>
        <ProfileCard 
          name="John Doe"
          age={25}
          interests={['Music', 'Travel', 'Photography']}
          onReport={() => alert('Report clicked')}
          onBlock={() => alert('Block clicked')}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl">Video Player with Controls</h2>
        <VideoPlayer 
          src="https://example.com/sample-video.mp4"
          className="max-w-2xl mx-auto"
          userName="Jane Smith"
          likes={42}
          onLike={() => alert('Liked!')}
          onDislike={() => alert('Disliked!')}
          onReport={() => alert('Reported!')}
          onViewProfile={() => alert('Viewing profile...')}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl">Camera Feed with Controls</h2>
        <VideoPlayer 
          useCamera={true}
          muted={false}
          className="max-w-2xl mx-auto"
          userName="My Camera"
          onReport={() => alert('Reported!')}
          onViewProfile={() => alert('Viewing profile...')}
          onMicToggle={(isOn) => console.log('Mic is:', isOn ? 'ON' : 'OFF')}
          onCameraToggle={(isOn) => console.log('Camera is:', isOn ? 'ON' : 'OFF')}
          initialMicState={true}
          initialCameraState={true}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl">Video Chat</h2>
        <VideoPlayer 
          useCamera={true}
          className="max-w-4xl mx-auto"
          userName="You"
          remoteUserName="John Doe"
          isRemoteActive={false}
          onReport={() => alert('Reported!')}
          onViewProfile={() => alert('Viewing profile...')}
          onMicToggle={(isOn) => console.log('Mic is:', isOn ? 'ON' : 'OFF')}
          onCameraToggle={(isOn) => console.log('Camera is:', isOn ? 'ON' : 'OFF')}
        />
      </section>
    </div>
  )
} 