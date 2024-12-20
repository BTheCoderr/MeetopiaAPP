'use client'
import { useState, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { usePeerConnection } from '@/hooks/usePeerConnection'
import Link from 'next/link'

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
  
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const { peerConnection } = usePeerConnection(stream)

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
    const newSocket = io('http://localhost:3001', {
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
      }
    }
  }

  const toggleRemoteMute = () => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.muted = !remoteVideoRef.current.muted
      setIsRemoteMuted(!isRemoteMuted)
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
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-2 border-b bg-white">
        <div className="flex items-center gap-2">
          <Link href="/" className="text-gray-600 hover:text-gray-800">
            ����
          </Link>
          <h1 className="text-xl font-bold">
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

      {/* Videos Section */}
      <div className="flex gap-2 p-2 bg-white">
        {/* Local Video */}
        <div className="relative w-1/2 aspect-video bg-gray-900 rounded-lg overflow-hidden">
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
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5z M7 4a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5V4z"/>
                </svg>
              </button>
              <button
                onClick={toggleLocalCamera}
                className={`p-2 text-xs border-2 rounded-full transition-colors ${
                  isCameraOff 
                    ? 'border-red-500 bg-red-500 text-white' 
                    : 'border-white/50 text-white hover:bg-white/10'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2V5zm11.5 5.175 3.5 1.556V4.269l-3.5 1.556v4.35zM2 4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h7.5a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H2z"/>
                </svg>
              </button>
              <button
                onClick={() => {
                  if (localVideoRef.current) {
                    localVideoRef.current.muted = !localVideoRef.current.muted;
                  }
                }}
                className="p-2 text-xs border-2 border-white/50 text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M11.536 14.01A8.473 8.473 0 0 0 14.026 8a8.473 8.473 0 0 0-2.49-6.01l-.708.707A7.476 7.476 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303l.708.707z"/>
                  <path d="M10.121 12.596A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.904-4.596l-.707.707A5.483 5.483 0 0 1 11.025 8a5.483 5.483 0 0 1-1.61 3.89l.706.706z"/>
                  <path d="M8.707 11.182A4.486 4.486 0 0 0 10.025 8a4.486 4.486 0 0 0-1.318-3.182L8 5.525A3.489 3.489 0 0 1 9.025 8 3.49 3.49 0 0 1 8 10.475l.707.707zM6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Remote Video */}
        <div className="relative w-1/2 aspect-video bg-gray-900 rounded-lg overflow-hidden">
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
                  remoteStream?.getAudioTracks()[0]?.enabled === false
                    ? 'border-red-500 bg-red-500 text-white' 
                    : 'border-white/50 text-white hover:bg-white/10'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5z M7 4a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5V4z"/>
                </svg>
              </button>
              <button
                onClick={toggleRemoteVideo}
                className={`p-2 text-xs border-2 rounded-full transition-colors ${
                  remoteStream?.getVideoTracks()[0]?.enabled === false
                    ? 'border-red-500 bg-red-500 text-white' 
                    : 'border-white/50 text-white hover:bg-white/10'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2V5zm11.5 5.175 3.5 1.556V4.269l-3.5 1.556v4.35zM2 4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h7.5a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H2z"/>
                </svg>
              </button>
              <button
                onClick={toggleRemoteMute}
                className={`p-2 text-xs border-2 rounded-full transition-colors ${
                  isRemoteMuted 
                    ? 'border-red-500 bg-red-500 text-white' 
                    : 'border-white/50 text-white hover:bg-white/10'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M11.536 14.01A8.473 8.473 0 0 0 14.026 8a8.473 8.473 0 0 0-2.49-6.01l-.708.707A7.476 7.476 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303l.708.707z"/>
                  <path d="M10.121 12.596A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.904-4.596l-.707.707A5.483 5.483 0 0 1 11.025 8a5.483 5.483 0 0 1-1.61 3.89l.706.706z"/>
                  <path d="M8.707 11.182A4.486 4.486 0 0 0 10.025 8a4.486 4.486 0 0 0-1.318-3.182L8 5.525A3.489 3.489 0 0 1 9.025 8 3.49 3.49 0 0 1 8 10.475l.707.707zM6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Section */}
      <div className="flex-1 bg-white p-4 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-2 mb-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`p-2 rounded-lg max-w-[80%] ${
                msg.isSelf
                  ? 'ml-auto bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {msg.text}
            </div>
          ))}
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
          >
            Send
          </button>
        </form>
      </div>

      {/* Bottom Controls with matching outline styles */}
      <div className="p-3 flex justify-center gap-3 bg-white border-t">
        <button
          onClick={handleStartCall}
          className="px-6 py-1.5 border-2 border-green-500 text-green-500 text-sm rounded-full 
          hover:bg-green-500 hover:text-white transition-colors"
        >
          START CALL
        </button>

        <button
          onClick={handleNextPerson}
          className="px-6 py-1.5 border-2 border-blue-500 text-blue-500 text-sm rounded-full 
          hover:bg-blue-500 hover:text-white transition-colors"
        >
          NEXT PERSON
        </button>

        <button
          onClick={handleLeaveChat}
          className="px-6 py-1.5 border-2 border-red-500 text-red-500 text-sm rounded-full 
          hover:bg-red-500 hover:text-white transition-colors"
        >
          LEAVE CHAT
        </button>
      </div>
    </div>
  )
} 