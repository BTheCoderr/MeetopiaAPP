'use client'
import React, { useState } from 'react'
import MainLayout from '../../components/Layout/MainLayout'
import TextChat from '../../components/TextChat'

export default function TestChatPage() {
  // Generate a random room ID for testing
  const roomId = `test_room_${Math.floor(Math.random() * 10000)}`
  
  // Simulate a peer ID (would come from server in real app)
  const [peerId, setPeerId] = useState<string | null>(null)
  
  const simulatePeerConnection = () => {
    // Simulate a peer connecting after 1 second
    setPeerId(null)
    setTimeout(() => {
      setPeerId(`peer_${Math.floor(Math.random() * 10000)}`)
    }, 1000)
  }
  
  return (
    <MainLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Test Text Chat</h1>
        <p className="mb-4 text-gray-700">
          This is a test page to preview the text chat interface.
          Open this page in two different browsers to test the connection.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white rounded-lg shadow-lg overflow-hidden h-[600px]">
            <TextChat roomId={roomId} peerId={peerId} />
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-4">
            <h2 className="font-medium mb-4">Test Controls</h2>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Room ID: {roomId}</p>
              <p className="text-sm text-gray-600 mb-2">Peer ID: {peerId || 'Not connected'}</p>
            </div>
            
            <button
              onClick={simulatePeerConnection}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Simulate Peer Connection
            </button>
            
            <div className="mt-6 text-sm text-gray-600">
              <p className="mb-2">Instructions:</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Open this page in two browsers</li>
                <li>Click "Simulate Peer Connection" on both</li>
                <li>You should now be able to exchange messages</li>
              </ol>
              <p className="mt-4">Note: In a real app, peers would be matched by the server based on preferences.</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
} 