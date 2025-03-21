'use client'
import React, { useState } from 'react'
import MainLayout from '../../components/Layout/MainLayout'
import VideoCall from '../../components/VideoCall'

export default function TestVideoPage() {
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  
  // Generate a random room ID for testing
  const roomId = `test_room_${Math.floor(Math.random() * 10000)}`
  
  return (
    <MainLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Test Video Call</h1>
        <p className="mb-4 text-gray-700">
          This is a test page to preview the FaceTime-style video chat interface.
          Open this page in two different browsers to test the connection.
        </p>
        
        <div className="bg-white rounded-lg shadow-lg p-4">
          <VideoCall
            roomId={roomId}
            isMuted={isMuted}
            setIsMuted={setIsMuted}
            isVideoOff={isVideoOff}
            setIsVideoOff={setIsVideoOff}
            blindDate={false}
            peerId={null}
          />
          
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h2 className="font-medium mb-2">Test Controls</h2>
            <div className="flex gap-4">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`px-4 py-2 rounded-lg ${isMuted ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
              >
                {isMuted ? 'Unmute' : 'Mute'}
              </button>
              
              <button
                onClick={() => setIsVideoOff(!isVideoOff)}
                className={`px-4 py-2 rounded-lg ${isVideoOff ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
              >
                {isVideoOff ? 'Turn on Video' : 'Turn off Video'}
              </button>
            </div>
            
            <div className="mt-4 text-sm text-gray-600">
              <p>Room ID: {roomId}</p>
              <p>This room ID is randomly generated for testing. In a real application, the room ID would be generated by the server when matching users.</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
} 