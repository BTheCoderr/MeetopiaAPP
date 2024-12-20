'use client'
import { useState, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { usePeerConnection } from '@/hooks/usePeerConnection'
import ChatMenu from '@/components/ChatMenu'

let socket: Socket | null = null

export default function CombinedChatPage() {
  const [isSocketConnected, setIsSocketConnected] = useState(false)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [currentPeer, setCurrentPeer] = useState<string | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [messageInput, setMessageInput] = useState('')
  const [messages, setMessages] = useState<Array<{ text: string; isSelf: boolean }>>([])
  const [isMuted, setIsMuted] = useState(false)
  const [isCameraOff, setIsCameraOff] = useState(false)
  const [isRemoteMuted, setIsRemoteMuted] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const { peerConnection } = usePeerConnection(stream)

  // Add click handler to close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMenuOpen && !(event.target as Element).closest('.menu-container')) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isMenuOpen])

  // Media stream setup
  useEffect(() => {
    let currentStream: MediaStream | null = null;
    
    async function setupMedia() {
      try {
        console.log('Setting up media stream...')
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        })
        console.log('Media stream obtained:', mediaStream.getTracks().map(t => t.kind))
        currentStream = mediaStream;
        setStream(mediaStream)
        
        if (localVideoRef.current) {
          console.log('Setting local video stream')
          localVideoRef.current.srcObject = mediaStream
        }
      } catch (err) {
        console.error('Error accessing media devices:', err)
      }
    }
    setupMedia()

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  // Socket setup - basic connection
  useEffect(() => {
    if (socket) return

    console.log('Setting up socket connection...')
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000
    })

    socket = newSocket

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id)
      setIsSocketConnected(true)
    })

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      setIsSocketConnected(false)
    })

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason)
      setIsSocketConnected(false)
    })

    return () => {
      console.log('Cleaning up socket connection')
      newSocket.disconnect()
      socket = null
    }
  }, [])

  // Socket event handlers - dependent on peer connection and stream
  useEffect(() => {
    const currentSocket = socket
    if (!currentSocket || !peerConnection || !stream) return

    // Wait for peer connection to be stable before adding tracks
    if (peerConnection.signalingState === 'stable') {
      const senders = peerConnection.getSenders()
      if (senders.length === 0) {
        stream.getTracks().forEach(track => {
          console.log('Adding track to peer connection:', track.kind)
          try {
            peerConnection.addTrack(track, stream)
          } catch (err) {
            console.warn('Error adding track:', err)
          }
        })
      }
    }

    const handleUserFound = async ({ partnerId }: { partnerId: string }) => {
      console.log('Found peer:', partnerId)
      setCurrentPeer(partnerId)
      
      if (partnerId > (currentSocket?.id || '')) {
        try {
          console.log('Creating and sending offer...')
          const offer = await peerConnection.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true
          })
          await peerConnection.setLocalDescription(offer)
          console.log('Sending offer to peer:', partnerId)
          currentSocket.emit('call-user', { offer, to: partnerId })
        } catch (err) {
          console.error('Error creating offer:', err)
        }
      }
    }

    const handleCallMade = async ({ offer, from }: { offer: RTCSessionDescriptionInit, from: string }) => {
      try {
        console.log('Received offer from:', from)
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
        const answer = await peerConnection.createAnswer()
        await peerConnection.setLocalDescription(answer)
        currentSocket.emit('make-answer', { answer, to: from })
      } catch (err) {
        console.error('Error handling call:', err)
      }
    }

    const handleAnswerMade = async ({ answer, from }: { answer: RTCSessionDescriptionInit, from: string }) => {
      try {
        console.log('Received answer from:', from)
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
      } catch (err) {
        console.error('Error handling answer:', err)
      }
    }

    const handleIceCandidate = ({ candidate, from }: { candidate: RTCIceCandidate, from: string }) => {
      try {
        console.log('Received ICE candidate from:', from)
        if (peerConnection.remoteDescription) {
          peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
        } else {
          console.log('Skipping ICE candidate - no remote description yet')
        }
      } catch (err) {
        console.error('Error adding ICE candidate:', err)
      }
    }

    const handlePeerLeft = () => {
      console.log('Peer left')
      setCurrentPeer(null)
      setRemoteStream(null)
    }

    currentSocket.on('user-found', handleUserFound)
    currentSocket.on('call-made', handleCallMade)
    currentSocket.on('answer-made', handleAnswerMade)
    currentSocket.on('ice-candidate', handleIceCandidate)
    currentSocket.on('peer-left', handlePeerLeft)

    return () => {
      currentSocket.off('user-found', handleUserFound)
      currentSocket.off('call-made', handleCallMade)
      currentSocket.off('answer-made', handleAnswerMade)
      currentSocket.off('ice-candidate', handleIceCandidate)
      currentSocket.off('peer-left', handlePeerLeft)
    }
  }, [peerConnection, stream])

  // Handle peer connection cleanup
  useEffect(() => {
    return () => {
      try {
        if (peerConnection?.signalingState !== 'closed') {
          peerConnection?.getSenders().forEach(sender => {
            if (sender.track) sender.track.stop()
          })
        }
      } catch (err) {
        console.warn('Cleanup error:', err)
      }
    }
  }, [peerConnection])

  // Video refs setup
  useEffect(() => {
    if (localVideoRef.current && stream) {
      localVideoRef.current.srcObject = stream
    }
  }, [stream])

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      console.log('Setting remote video stream')
      remoteVideoRef.current.srcObject = remoteStream
    }
  }, [remoteStream])

  // Track handling
  useEffect(() => {
    if (!peerConnection) return

    peerConnection.ontrack = (event) => {
      console.log('Received remote track:', event.track.kind)
      console.log('Remote streams:', event.streams)
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

    peerConnection.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', peerConnection.iceConnectionState)
      if (peerConnection.iceConnectionState === 'connected') {
        console.log('ICE Connected - Remote stream:', peerConnection.getReceivers().map(r => r.track.kind))
      }
    }
  }, [peerConnection, currentPeer])

  const handleStartCall = async () => {
    console.log('Start Call clicked')
    if (!socket?.connected) {
      console.error('Socket not connected')
      return
    }
    
    socket.emit('find-next-user')
    console.log('Looking for users...')
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

  // Local video controls
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

  // Remote video controls
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

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageInput.trim() || !currentPeer) return

    setMessages(prev => [...prev, { text: messageInput, isSelf: true }])
    socket?.emit('chat-message', { message: messageInput, to: currentPeer })
    setMessageInput('')
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
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {isSocketConnected ? 'Connected' : 'Disconnected'}
          </span>
          <div className={`w-2 h-2 rounded-full ${isSocketConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {/* Videos Section */}
        <div className="grid grid-cols-2 gap-0 mb-4">
          {/* Local Video */}
          <div className="relative bg-gray-900 rounded-lg overflow-hidden">
            <div className="relative h-[480px] bg-gray-900 rounded-lg overflow-hidden">
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
                ref={remoteVideoRef}
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

        {/* Chat Section */}
        <div className="border rounded-lg shadow-sm bg-white">
          <div className="text-center p-1 border-b border-gray-100">
            <h2 className="text-base font-medium">💬 Chat</h2>
          </div>
          
          <div className="h-[150px] p-2 flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-1.5">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-1.5 rounded-lg max-w-[80%] text-xs ${
                    msg.isSelf
                      ? 'ml-auto bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>
          </div>

          <div className="p-1.5 border-t border-gray-100">
            <form onSubmit={handleSendMessage} className="flex gap-1.5">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-2.5 py-1.5 text-xs rounded-full border border-gray-300 focus:outline-none focus:border-blue-400"
              />
              <button
                type="submit"
                className="px-3 py-1.5 text-xs bg-blue-500 text-white rounded-full hover:bg-blue-600"
              >
                Send
              </button>
            </form>
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