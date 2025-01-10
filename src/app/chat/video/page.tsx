'use client'

import { useState, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { usePeerConnection } from '@/hooks/usePeerConnection'
import ChatMenu from '@/components/ChatMenu'
import ReportModal from '@/components/ReportModal'
import { useReporting } from '@/hooks/useReporting'

let socket: Socket | null = null

export default function VideoChatPage() {
  const [isSocketConnected, setIsSocketConnected] = useState(false)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [currentPeer, setCurrentPeer] = useState<string | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isCameraOff, setIsCameraOff] = useState(false)
  const [isRemoteMuted, setIsRemoteMuted] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [buttonCooldown, setButtonCooldown] = useState(false)
  const [permissionStatus, setPermissionStatus] = useState<{
    camera: 'granted' | 'denied' | 'pending'
    microphone: 'granted' | 'denied' | 'pending'
  }>({
    camera: 'pending',
    microphone: 'pending'
  })

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const { peerConnection } = usePeerConnection(stream)
  const {
    isReportModalOpen,
    handleReport,
    openReportModal,
    closeReportModal
  } = useReporting()

  // Media stream setup
  useEffect(() => {
    let currentStream: MediaStream | null = null
    
    async function setupMedia() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30, max: 30 }
          },
          audio: {
            echoCancellation: { exact: true },
            noiseSuppression: { exact: true },
            autoGainControl: { exact: true },
            sampleRate: 48000,
            sampleSize: 16,
            channelCount: 1
          }
        })

        setPermissionStatus({
          camera: 'granted',
          microphone: 'granted'
        })

        currentStream = mediaStream
        setStream(mediaStream)
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = mediaStream
        }
      } catch (err: any) {
        console.error('Error accessing media devices:', err)
        if (err.name === 'NotAllowedError') {
          setPermissionStatus({
            camera: 'denied',
            microphone: 'denied'
          })
          setError(
            'Camera or microphone access denied. ' +
            'Please allow access in your browser settings and refresh the page.'
          )
        } else {
          setError(
            'Failed to access camera/microphone. ' +
            'Please check your device connections and try again.'
          )
        }
      }
    }

    setupMedia()

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop())
        currentStream = null
      }
    }
  }, [])

  // Socket setup
  useEffect(() => {
    if (socket) return

    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3003', {
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000
    })

    socket.on('connect', () => {
      console.log('Socket connected')
      setIsSocketConnected(true)
      setError(null)
    })

    socket.on('disconnect', () => {
      console.log('Socket disconnected')
      setIsSocketConnected(false)
      setCurrentPeer(null)
      setRemoteStream(null)
      setIsSearching(false)
      setError('Connection lost. Attempting to reconnect...')
    })

    return () => {
      if (socket) {
        socket.disconnect()
        socket = null
      }
    }
  }, [])

  // Socket event handlers
  useEffect(() => {
    if (!socket || !peerConnection || !stream) return

    const handleUserFound = async ({ partnerId }: { partnerId: string }) => {
      console.log('Found peer:', partnerId)
      setCurrentPeer(partnerId)
      setIsSearching(false)

      if (socket && socket.id && partnerId > socket.id) {
        try {
          const offer = await peerConnection.createOffer()
          await peerConnection.setLocalDescription(offer)
          socket.emit('call-user', { offer, to: partnerId })
        } catch (err) {
          console.error('Error creating offer:', err)
          setError('Failed to establish video connection. Please try again.')
        }
      }
    }

    const handleCallMade = async ({ offer, from }: { offer: RTCSessionDescriptionInit, from: string }) => {
      try {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
        const answer = await peerConnection.createAnswer()
        await peerConnection.setLocalDescription(answer)
        if (socket) {
          socket.emit('make-answer', { answer, to: from })
        }
      } catch (err) {
        console.error('Error handling call:', err)
      }
    }

    const handleAnswerMade = async ({ answer, from }: { answer: RTCSessionDescriptionInit, from: string }) => {
      try {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
      } catch (err) {
        console.error('Error handling answer:', err)
      }
    }

    const handleIceCandidate = ({ candidate, from }: { candidate: RTCIceCandidate, from: string }) => {
      try {
        if (peerConnection.remoteDescription) {
          peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
        }
      } catch (err) {
        console.error('Error adding ICE candidate:', err)
      }
    }

    const handlePeerLeft = () => {
      console.log('Peer left')
      setCurrentPeer(null)
      setRemoteStream(null)
      setIsSearching(false)
    }

    socket.on('user-found', handleUserFound)
    socket.on('call-made', handleCallMade)
    socket.on('answer-made', handleAnswerMade)
    socket.on('ice-candidate', handleIceCandidate)
    socket.on('peer-left', handlePeerLeft)

    return () => {
      socket?.off('user-found', handleUserFound)
      socket?.off('call-made', handleCallMade)
      socket?.off('answer-made', handleAnswerMade)
      socket?.off('ice-candidate', handleIceCandidate)
      socket?.off('peer-left', handlePeerLeft)
    }
  }, [peerConnection, stream])

  // Track handling
  useEffect(() => {
    if (!peerConnection) return

    peerConnection.ontrack = (event) => {
      console.log('Received remote track:', event.track.kind)
      setRemoteStream(event.streams[0])
    }

    peerConnection.onicecandidate = (event) => {
      if (event.candidate && currentPeer) {
        socket?.emit('ice-candidate', {
          candidate: event.candidate,
          to: currentPeer
        })
      }
    }
  }, [peerConnection, currentPeer])

  // Video refs setup
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream
    }
  }, [remoteStream])

  const startCooldown = () => {
    setButtonCooldown(true)
    setTimeout(() => setButtonCooldown(false), 5000)
  }

  const handleStartChat = () => {
    if (!socket?.connected || !stream || buttonCooldown) return
    setIsSearching(true)
    socket.emit('find-user')
    startCooldown()
  }

  const handleNextPerson = () => {
    if (!socket?.connected || !stream || buttonCooldown) return
    setIsSearching(true)
    socket.emit('find-next-user')
    startCooldown()
  }

  const handleLeaveChat = () => {
    if (!socket?.connected) return
    socket.emit('leave-chat')
    setCurrentPeer(null)
    setRemoteStream(null)
    setIsSearching(false)
    window.location.href = '/'
  }

  // Local video controls
  const toggleLocalCamera = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsCameraOff(!videoTrack.enabled)
      }
    }
  }

  const toggleLocalMute = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsMuted(!audioTrack.enabled)
      }
    }
  }

  // Remote video controls
  const toggleRemoteVideo = () => {
    if (remoteStream) {
      const videoTrack = remoteStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
      }
    }
  }

  const toggleRemoteAudio = () => {
    if (remoteStream) {
      const audioTrack = remoteStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsRemoteMuted(!isRemoteMuted)
      }
    }
  }

  return (
    <div className="relative min-h-screen bg-gray-100">
      {/* Header with Menu, Logo, and Connection Status */}
      <div className="flex flex-col gap-4 mb-4 md:mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4">
            <ChatMenu onLeaveChat={handleLeaveChat} variant="hamburger" />
            <h1 className="text-xl md:text-2xl font-bold">
              <span className="text-blue-500">Meet</span>
              <span className="text-gray-700">opia</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {isSocketConnected ? 'Connected' : 'Disconnected'}
            </span>
            <div className={`w-2 h-2 rounded-full ${isSocketConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>⚠️</span>
              <p className="text-sm">{error}</p>
            </div>
            <button 
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-600"
            >
              ✕
            </button>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex justify-center gap-2">
          <button 
            onClick={handleStartChat}
            disabled={!isSocketConnected || isSearching || buttonCooldown}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              !isSocketConnected || isSearching || buttonCooldown
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {isSearching ? '🔄 Searching' : buttonCooldown ? '⏳ Wait 5s' : '▶️ START'}
          </button>
          <button 
            onClick={handleNextPerson}
            disabled={!currentPeer || isSearching}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              !currentPeer || isSearching
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            ⏭️ NEXT
          </button>
          <button 
            onClick={handleLeaveChat}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium"
          >
            ⏹️ LEAVE
          </button>
          <button
            onClick={() => openReportModal(currentPeer || '')}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-yellow-500 hover:bg-yellow-600 text-white"
          >
            ⚠️ Report
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {/* Videos Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-0">
          {/* Local Video */}
          <div className="relative bg-gray-900 rounded-lg overflow-hidden">
            <div className="relative h-[320px] md:h-[480px] bg-gray-900 rounded-lg overflow-hidden">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent">
                <div className="flex items-center justify-center gap-2 p-2">
                  <button
                    onClick={toggleLocalMute}
                    className={`p-2.5 md:p-2 text-sm md:text-xs border-2 rounded-full transition-colors ${
                      isMuted 
                        ? 'border-red-500 bg-red-500 text-white' 
                        : 'border-white/50 text-white hover:bg-white/10'
                    }`}
                  >
                    {isMuted ? '🔇' : '🔊'}
                  </button>
                  <button
                    onClick={toggleLocalCamera}
                    className={`p-2.5 md:p-2 text-sm md:text-xs border-2 rounded-full transition-colors ${
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
            <div className="relative h-[320px] md:h-[480px] bg-gray-900 rounded-lg overflow-hidden">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
                style={{ display: remoteStream ? 'block' : 'none' }}
              />
              {!remoteStream && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  {isSearching ? 'Looking for someone to chat with...' : 'Click START to begin meeting'}
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent">
                <div className="flex items-center justify-center gap-2 p-2">
                  <button
                    onClick={toggleRemoteAudio}
                    className={`p-2.5 md:p-2 text-sm md:text-xs border-2 rounded-full transition-colors ${
                      isRemoteMuted
                        ? 'border-red-500 bg-red-500 text-white' 
                        : 'border-white/50 text-white hover:bg-white/10'
                    }`}
                  >
                    {isRemoteMuted ? '🔇' : '🎤'}
                  </button>
                  <button
                    onClick={toggleRemoteVideo}
                    className={`p-2.5 md:p-2 text-sm md:text-xs border-2 rounded-full transition-colors ${
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
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={closeReportModal}
        onSubmit={handleReport}
        reportedUserId={currentPeer || undefined}
      />
    </div>
  )
}