'use client'
import { useState, useRef, useEffect } from 'react'
import { io, Socket } from 'socket.io-client'
import ChatLayout from '@/components/ChatLayout'
import ConnectionStatus from '@/components/ConnectionStatus'
import VideoIcon from '@/components/VideoIcon'

let socket: Socket | null = null
let peerConnection: RTCPeerConnection | null = null

const createPeerConnection = () => {
  const configuration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' },
    ]
  }
  return new RTCPeerConnection(configuration)
}

// Helper function to get the correct socket URL
const getSocketUrl = () => {
  // In production, use the deployed signaling server URL
  if (process.env.NODE_ENV === 'production') {
    return 'https://meetopia-signaling.onrender.com'
  }
  // In development, use localhost
  return 'http://localhost:3001'
}

export default function VideoChatPage() {
  const [isConnected, setIsConnected] = useState(false)
  const [isWaiting, setIsWaiting] = useState(false)
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor' | 'disconnected'>('disconnected')
  const [connectionError, setConnectionError] = useState<string>()
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStats, setConnectionStats] = useState<{
    latency?: number
    packetLoss?: number
    bandwidth?: number
  }>()
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)

  const setupPeerConnection = (stream: MediaStream) => {
    if (peerConnection) {
      peerConnection.close()
    }
    peerConnection = createPeerConnection()

    // Add local stream tracks to peer connection
    stream.getTracks().forEach(track => {
      if (peerConnection && stream) {
        peerConnection.addTrack(track, stream)
      }
    })

    // Handle incoming remote stream
    peerConnection.ontrack = (event) => {
      console.log('Received remote track:', event.track.kind)
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0]
      }
    }

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('Sending ICE candidate')
        socket?.emit('video-ice-candidate', {
          candidate: event.candidate,
          to: socket?.id
        })
      }
    }

    // Monitor connection quality
    peerConnection.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', peerConnection?.iceConnectionState)
      switch (peerConnection?.iceConnectionState) {
        case 'checking':
          setConnectionQuality('poor')
          setIsConnecting(true)
          break
        case 'connected':
          setConnectionQuality('excellent')
          setIsConnecting(false)
          break
        case 'completed':
          setConnectionQuality('excellent')
          setIsConnecting(false)
          break
        case 'failed':
          setConnectionQuality('disconnected')
          setConnectionError('Connection failed. Please try again.')
          setIsConnecting(false)
          break
        case 'disconnected':
          setConnectionQuality('poor')
          break
        case 'closed':
          setConnectionQuality('disconnected')
          break
      }
    }

    return peerConnection
  }

  // Socket setup
  useEffect(() => {
    if (socket) return

    const socketUrl = getSocketUrl()
    console.log('Connecting to socket server:', socketUrl)
    setIsConnecting(true)

    socket = io(socketUrl, {
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000
    })

    socket.on('connect', () => {
      console.log('Socket connected:', socket?.id)
      setConnectionQuality('good')
      setIsConnecting(false)
      setConnectionError(undefined)
    })

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      setConnectionQuality('disconnected')
      setConnectionError('Failed to connect to server. Please check your internet connection.')
      setIsConnecting(false)
    })

    socket.on('video-user-found', async ({ partnerId }) => {
      console.log('Found video partner:', partnerId)
      setIsConnected(true)
      setIsWaiting(false)
      setConnectionError(undefined)
      setIsConnecting(true)

      if (stream) {
        setupPeerConnection(stream)
        // Create and send offer if we're the initiator
        if (socket?.id && socket.id > partnerId) {
          try {
            const offer = await peerConnection?.createOffer()
            await peerConnection?.setLocalDescription(offer)
            socket.emit('video-offer', { offer, to: partnerId })
          } catch (err) {
            console.error('Error creating offer:', err)
            setConnectionError('Failed to establish video connection. Please try again.')
            setIsConnecting(false)
          }
        }
      }
    })

    socket.on('video-offer', async ({ offer, from }) => {
      console.log('Received video offer from:', from)
      if (stream && peerConnection) {
        try {
          await peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
          const answer = await peerConnection.createAnswer()
          await peerConnection.setLocalDescription(answer)
          socket?.emit('video-answer', { answer, to: from })
        } catch (err) {
          console.error('Error handling video offer:', err)
        }
      }
    })

    socket.on('video-answer', async ({ answer, from }) => {
      console.log('Received video answer from:', from)
      try {
        await peerConnection?.setRemoteDescription(new RTCSessionDescription(answer))
      } catch (err) {
        console.error('Error handling video answer:', err)
      }
    })

    socket.on('video-ice-candidate', async ({ candidate, from }) => {
      console.log('Received ICE candidate from:', from)
      try {
        await peerConnection?.addIceCandidate(new RTCIceCandidate(candidate))
      } catch (err) {
        console.error('Error adding ICE candidate:', err)
      }
    })

    socket.on('waiting-for-match', () => {
      console.log('Waiting for video match')
      setIsConnected(false)
      setIsWaiting(true)
    })

    socket.on('move-to-next', () => {
      console.log('Moving to next partner')
      setIsConnected(false)
      setIsWaiting(true)
      cleanupVideoConnection()
      socket?.emit('find-video-user')
    })

    socket.on('peer-left', () => {
      console.log('Partner left')
      setIsConnected(false)
      setIsWaiting(false)
      cleanupVideoConnection()
    })

    return () => {
      cleanupVideoConnection()
      if (socket) {
        socket.disconnect()
        socket = null
      }
    }
  }, [stream])

  const cleanupVideoConnection = () => {
    if (remoteVideoRef.current?.srcObject) {
      const tracks = (remoteVideoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach(track => track.stop())
      remoteVideoRef.current.srcObject = null
    }
    if (peerConnection) {
      peerConnection.close()
      peerConnection = null
    }
  }

  // Video stream setup
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((mediaStream) => {
        setStream(mediaStream)
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = mediaStream
        }
      })
      .catch((err) => {
        console.error('Error accessing media devices:', err)
      })

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
      cleanupVideoConnection()
    }
  }, [])

  const handleStart = () => {
    setIsWaiting(true)
    socket?.emit('find-video-user')
  }

  const handleNext = () => {
    cleanupVideoConnection()
    socket?.emit('find-video-user')
  }

  const handleLeave = () => {
    cleanupVideoConnection()
    socket?.emit('leave-video')
    window.location.href = '/'
  }

  useEffect(() => {
    if (peerConnection) {
      // Monitor connection stats
      const statsInterval = setInterval(async () => {
        try {
          const stats = await peerConnection.getStats()
          let totalPacketsLost = 0
          let totalPackets = 0
          let currentRoundTripTime = 0
          let availableOutgoingBitrate = 0

          stats.forEach(report => {
            if (report.type === 'remote-inbound-rtp') {
              totalPacketsLost += report.packetsLost || 0
              totalPackets += report.packetsReceived || 0
            }
            if (report.type === 'candidate-pair' && report.state === 'succeeded') {
              currentRoundTripTime = report.currentRoundTripTime * 1000 // Convert to ms
              availableOutgoingBitrate = report.availableOutgoingBitrate || 0
            }
          })

          const packetLoss = totalPackets > 0 ? (totalPacketsLost / totalPackets) * 100 : 0
          
          setConnectionStats({
            latency: Math.round(currentRoundTripTime),
            packetLoss: Math.round(packetLoss * 10) / 10,
            bandwidth: availableOutgoingBitrate
          })

          // Update connection quality based on stats
          if (currentRoundTripTime < 100 && packetLoss < 1) {
            setConnectionQuality('excellent')
          } else if (currentRoundTripTime < 200 && packetLoss < 5) {
            setConnectionQuality('good')
          } else {
            setConnectionQuality('poor')
          }
        } catch (err) {
          console.error('Error getting connection stats:', err)
        }
      }, 2000)

      return () => clearInterval(statsInterval)
    }
  }, [peerConnection])

  // Update connection status when peer connection state changes
  useEffect(() => {
    if (peerConnection) {
      const handleConnectionStateChange = () => {
        const state = peerConnection.connectionState
        if (state === 'failed' || state === 'disconnected' || state === 'closed') {
          setConnectionQuality('disconnected')
          setConnectionError('Connection lost. Please try again.')
        }
        setIsConnecting(state === 'connecting' || state === 'new')
      }

      peerConnection.addEventListener('connectionstatechange', handleConnectionStateChange)
      return () => {
        peerConnection.removeEventListener('connectionstatechange', handleConnectionStateChange)
      }
    }
  }, [peerConnection])

  return (
    <ChatLayout
      title="Video Chat"
      icon={<VideoIcon className="w-5 h-5" />}
      onStart={handleStart}
      onNext={handleNext}
      onLeave={handleLeave}
    >
      <div className="relative flex flex-col items-center justify-center w-full h-full">
        <ConnectionStatus
          quality={connectionQuality}
          isConnecting={isConnecting}
          error={connectionError}
          stats={connectionStats}
          onRetry={handleRetry}
        />
        
        {/* Video Chat Area */}
        <div className="h-[400px] p-4 flex flex-col">
          <div className="flex-1 grid grid-cols-2 gap-4">
            {/* Local Video */}
            <div className="relative">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover rounded-lg bg-gray-900"
              />
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
                You
              </div>
              {isConnecting && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                  <div className="text-white flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Connecting...
                  </div>
                </div>
              )}
            </div>

            {/* Remote Video */}
            <div className="relative">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover rounded-lg bg-gray-900"
              />
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
                Partner
              </div>
              {!isConnected && (
                <div className="absolute inset-0 flex items-center justify-center text-white bg-gray-900 bg-opacity-75 rounded-lg">
                  {isWaiting ? 'Waiting for partner...' : 'Start video chat!'}
                </div>
              )}
              {isConnecting && isConnected && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                  <div className="text-white flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Establishing connection...
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Video Controls */}
          <div className="mt-4 flex justify-center gap-4">
            <button 
              className="p-3 bg-gray-200 rounded-full hover:bg-gray-300 disabled:opacity-50"
              disabled={isConnecting}
            >
              🎤
            </button>
            <button 
              className="p-3 bg-gray-200 rounded-full hover:bg-gray-300 disabled:opacity-50"
              disabled={isConnecting}
            >
              📷
            </button>
          </div>
        </div>
      </div>
    </ChatLayout>
  )
}