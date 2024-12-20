'use client'
import { useState, useEffect } from 'react'
import { io, Socket } from 'socket.io-client'
import ConnectionStatus from '@/components/ConnectionStatus'
import ChatMenu from '@/components/ChatMenu'
import { usePeerConnection } from '@/hooks/usePeerConnection'

let socket: Socket | null = null

export default function VideoChatPage() {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [permissionError, setPermissionError] = useState<string>('')
  const [currentPeer, setCurrentPeer] = useState<string | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isCameraOff, setIsCameraOff] = useState(false)
  const [isRemoteMuted, setIsRemoteMuted] = useState(false)

  const { peerConnection } = usePeerConnection(stream)

  // Socket setup
  useEffect(() => {
    if (socket) return

    console.log('Setting up socket connection...')
    const newSocket = io('http://localhost:3001', {
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000
    })

    socket = newSocket

    newSocket.on('user-found', ({ partnerId }) => {
      console.log('Found peer:', partnerId)
      setCurrentPeer(partnerId)
    })

    return () => {
      console.log('Cleaning up socket connection')
      newSocket.disconnect()
      socket = null
    }
  }, [])

  useEffect(() => {
    async function getMediaPermissions() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        })
        setStream(mediaStream)
      } catch (error) {
        console.error('Error accessing media devices:', error)
        setPermissionError('Please allow camera and microphone access to use video chat')
      }
    }
    getMediaPermissions()
  }, [])

  useEffect(() => {
    const videoElement = document.getElementById('localVideo') as HTMLVideoElement
    if (videoElement && stream) {
      videoElement.srcObject = stream
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [stream])

  useEffect(() => {
    if (!peerConnection) return

    peerConnection.ontrack = (event) => {
      console.log('Received remote track:', event.track.kind)
      setRemoteStream(event.streams[0])
    }

    peerConnection.onicecandidate = (event) => {
      if (event.candidate && currentPeer) {
        console.log('Sending ICE candidate')
        socket?.emit('ice-candidate', {
          candidate: event.candidate,
          to: currentPeer
        })
      }
    }
  }, [peerConnection, currentPeer])

  const handleStartCall = () => {
    console.log('Start Call clicked')
    if (!socket?.connected) {
      console.error('Socket not connected')
      return
    }
    socket.emit('find-next-user')
  }

  const handleNextPerson = () => {
    console.log('Next Person clicked')
    if (currentPeer) {
      socket?.emit('leave-chat')
    }
    socket?.emit('find-next-user')
  }

  const handleLeaveChat = () => {
    console.log('Leave Chat clicked')
    if (currentPeer) {
      socket?.emit('leave-chat')
    }
    window.location.href = '/'
  }

  const toggleLocalCamera = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOff(!videoTrack.enabled);
      }
    }
  }

  const toggleLocalMute = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  }

  const toggleRemoteVideo = () => {
    if (remoteStream) {
      const videoTrack = remoteStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
      }
    }
  }

  const toggleRemoteAudio = () => {
    if (remoteStream) {
      const audioTrack = remoteStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsRemoteMuted(!isRemoteMuted);
      }
    }
  }

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      {/* Header with Back Button, Logo, and Connection Status */}
      <div className="flex items-center justify-between mb-4 md:mb-8">
        <div className="flex items-center gap-2 md:gap-4">
          <ChatMenu onLeaveChat={handleLeaveChat} />
          <h1 className="text-xl md:text-2xl font-bold">
            <span className="text-blue-500">Meet</span>
            <span className="text-gray-700">opia</span>
          </h1>
        </div>
        <ConnectionStatus />
      </div>

      {permissionError && (
        <div className="text-center text-red-500 mb-4">
          {permissionError}
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 gap-0">
          {/* Local Video */}
          <div className="relative bg-gray-900 rounded-lg overflow-hidden">
            <div className="relative h-[480px] bg-gray-900 rounded-lg overflow-hidden">
              <video
                id="localVideo"
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent">
                <div className="flex items-center justify-center gap-2 p-2">
                  <button
                    onClick={toggleLocalMute}
                    className={`p-2 text-xs border-2 rounded-full transition-colors ${
                      isMuted 
                        ? 'border-red-500 bg-red-500 text-white' 
                        : 'border-white/50 text-white hover:bg-white/10'
                    }`}
                  >
                    {isMuted ? '🔇' : '🔊'}
                  </button>
                  <button
                    onClick={toggleLocalCamera}
                    className={`p-2 text-xs border-2 rounded-full transition-colors ${
                      isCameraOff 
                        ? 'border-red-500 bg-red-500 text-white' 
                        : 'border-white/50 text-white hover:bg-white/10'
                    }`}
                  >
                    {isCameraOff ? '⏸️' : '📹'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Remote Video */}
          <div className="relative bg-gray-900 rounded-lg overflow-hidden">
            <div className="relative h-[480px] bg-gray-900 rounded-lg overflow-hidden">
              <video
                id="remoteVideo"
                autoPlay
                playsInline
                className="w-full h-full object-cover"
                style={{ display: remoteStream ? 'block' : 'none' }}
              />
              {!remoteStream && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  Waiting for meeter...
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent">
                <div className="flex items-center justify-center gap-2 p-2">
                  <button
                    onClick={toggleRemoteAudio}
                    className={`p-2 text-xs border-2 rounded-full transition-colors ${
                      isRemoteMuted
                        ? 'border-red-500 bg-red-500 text-white' 
                        : 'border-white/50 text-white hover:bg-white/10'
                    }`}
                  >
                    {isRemoteMuted ? '🔇' : '🎤'}
                  </button>
                  <button
                    onClick={toggleRemoteVideo}
                    className={`p-2 text-xs border-2 rounded-full transition-colors ${
                      !remoteStream?.getVideoTracks()[0]?.enabled
                        ? 'border-red-500 bg-red-500 text-white' 
                        : 'border-white/50 text-white hover:bg-white/10'
                    }`}
                  >
                    {!remoteStream?.getVideoTracks()[0]?.enabled ? '⏸️' : '📹'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="flex flex-wrap justify-center gap-1.5 mt-3">
          <button 
            onClick={handleStartCall}
            className="px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 text-xs"
          >
            ▶️ START
          </button>
          <button 
            onClick={handleNextPerson}
            className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-xs"
          >
            ⏭️ NEXT
          </button>
          <button 
            onClick={handleLeaveChat}
            className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 text-xs"
          >
            ⏹️ LEAVE
          </button>
        </div>
      </div>
    </div>
  )
}