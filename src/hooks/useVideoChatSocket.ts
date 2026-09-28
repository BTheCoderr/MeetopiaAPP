'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useRouter } from 'next/navigation'

const LOG = '[WebRTC:Signaling]'

interface MutualVibeState {
  partnerUserId: string | null
  partnerDisplayName: string | null
  connectionId: string | null
  saved: boolean
  error: string | null
}

interface UseVideoChatSocketOptions {
  stream: MediaStream | null
  peerConnection: RTCPeerConnection | null
  restartConnection: () => void
  buttonCooldown: boolean
  setIsSearching: (v: boolean) => void
  setError: (v: string | null) => void
  startCooldown: () => void
  setBandwidthQuality: (q: 'high' | 'medium' | 'low') => void
  isAdaptiveQuality: boolean
}

function serializeCandidate(candidate: RTCIceCandidate): RTCIceCandidateInit {
  return candidate.toJSON ? candidate.toJSON() : (candidate as unknown as RTCIceCandidateInit)
}

function isPeerConnectionUsable(pc: RTCPeerConnection): boolean {
  return pc.signalingState !== 'closed' && pc.connectionState !== 'closed'
}

export function useVideoChatSocket({
  stream,
  peerConnection,
  restartConnection,
  buttonCooldown,
  setIsSearching,
  setError,
  startCooldown,
  setBandwidthQuality,
  isAdaptiveQuality,
}: UseVideoChatSocketOptions) {
  const router = useRouter()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isSocketConnected, setIsSocketConnected] = useState(false)
  const [currentPeer, setCurrentPeer] = useState<string | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [isPeerConnected, setIsPeerConnected] = useState(false)
  const [isRemoteCameraOff, setIsRemoteCameraOff] = useState(false)
  const [isRemoteAudioOff, setIsRemoteAudioOff] = useState(false)
  const [currentPeerUserId, setCurrentPeerUserId] = useState<string | null>(null)
  const [hasVibed, setHasVibed] = useState(false)
  const [mutualVibe, setMutualVibe] = useState<MutualVibeState | null>(null)

  const socketRef = useRef<Socket | null>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const currentPeerRef = useRef<string | null>(null)
  const pendingIceCandidatesRef = useRef<RTCIceCandidateInit[]>([])
  const isCallerRef = useRef(false)

  useEffect(() => {
    socketRef.current = socket
  }, [socket])

  useEffect(() => {
    peerConnectionRef.current = peerConnection
  }, [peerConnection])

  useEffect(() => {
    currentPeerRef.current = currentPeer
  }, [currentPeer])

  useEffect(() => {
    let disposed = false
    let newSocket: Socket | null = null

    const connect = async () => {
      const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3003'
      console.log(LOG, 'socket URL', socketUrl)

      let token: string | undefined
      try {
        const tokenResponse = await fetch('/api/auth/socket-token', { cache: 'no-store' })
        if (tokenResponse.ok) {
          const data = await tokenResponse.json()
          token = data.token
        }
      } catch (error) {
        console.warn(LOG, 'socket token unavailable', error)
      }

      if (disposed) return

      newSocket = io(socketUrl, {
        transports: ['polling', 'websocket'],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
        auth: token ? { token } : {},
      })
      setSocket(newSocket)
      socketRef.current = newSocket

      newSocket.on('connect', () => {
        const transport = newSocket?.io.engine?.transport?.name ?? 'unknown'
        console.log(LOG, 'socket connected', newSocket?.id, 'transport', transport)
        setIsSocketConnected(true)
        setError(null)

        newSocket?.io.engine?.on('upgrade', (transport) => {
          console.log(LOG, 'transport upgraded to', transport.name)
        })
      })

      newSocket.on('connect_error', (err) => {
        console.error(LOG, 'connect_error', err.message)
        setError('Unable to connect to Meetopia right now. Please try again.')
      })

      newSocket.on('disconnect', () => {
        console.log(LOG, 'socket disconnected')
        setIsSocketConnected(false)
        setCurrentPeer(null)
        setCurrentPeerUserId(null)
        currentPeerRef.current = null
        setRemoteStream(null)
        setIsSearching(false)
        setHasVibed(false)
        setMutualVibe(null)
        setError('Connection lost. Attempting to reconnect...')
      })

      newSocket.on('match-error', ({ code, message }: { code?: string; message?: string }) => {
        console.warn(LOG, 'match-error', code, message)
        setIsSearching(false)
        setError(message || 'Unable to start a Chemistry Check. Please try again.')
        if (code === 'AUTH_REQUIRED') {
          router.push('/auth/signin?next=/start')
        } else if (code === 'ADULT_CONFIRMATION_REQUIRED') {
          router.push('/start')
        }
      })

      newSocket.on('search-cancelled', () => {
        setIsSearching(false)
        setError(null)
      })

      newSocket.on(
        'mutual-vibe',
        async ({
          partnerUserId,
          partnerDisplayName,
          connectionProof,
        }: {
          partnerUserId?: string | null
          partnerDisplayName?: string | null
          connectionProof?: string | null
        }) => {
          setHasVibed(true)

          if (!connectionProof) {
            setMutualVibe({
              partnerUserId: partnerUserId || null,
              partnerDisplayName: partnerDisplayName || null,
              connectionId: null,
              saved: false,
              error: 'Mutual Vibe confirmed, but this Connection could not be saved.',
            })
            return
          }

          try {
            const response = await fetch('/api/connections', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ connectionProof }),
            })
            const data = await response.json()
            if (!response.ok) throw new Error(data.error || 'Failed to save Connection')

            setMutualVibe({
              partnerUserId: partnerUserId || null,
              partnerDisplayName: partnerDisplayName || data.connection?.person?.displayName || null,
              connectionId: data.connection?.id || null,
              saved: true,
              error: null,
            })
          } catch (error) {
            setMutualVibe({
              partnerUserId: partnerUserId || null,
              partnerDisplayName: partnerDisplayName || null,
              connectionId: null,
              saved: false,
              error: error instanceof Error ? error.message : 'Failed to save Connection',
            })
          }
        }
      )
    }

    void connect()

    return () => {
      disposed = true
      newSocket?.removeAllListeners()
      newSocket?.disconnect()
      socketRef.current = null
    }
  }, [router, setError, setIsSearching])

  // WebRTC handlers on the current peer connection (stable refs for ICE peer id)
  useEffect(() => {
    const pc = peerConnection
    if (!pc) return

    const drainIceCandidates = () => {
      if (!pc.remoteDescription) return
      const pending = pendingIceCandidatesRef.current.splice(0)
      if (pending.length > 0) {
        console.log(LOG, 'draining queued ICE candidates', pending.length)
      }
      pending.forEach(candidate => {
        pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(err => {
          console.error(LOG, 'addIceCandidate (drain) failed:', err)
        })
      })
    }

    const queueOrAddIceCandidate = (candidate: RTCIceCandidateInit) => {
      if (pc.remoteDescription) {
        console.log(LOG, 'ICE candidate received → add immediately')
        pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(err => {
          console.error(LOG, 'addIceCandidate failed:', err)
        })
      } else {
        console.log(LOG, 'ICE candidate received → queued (no remoteDescription yet)')
        pendingIceCandidatesRef.current.push(candidate)
      }
    }

    const onTrack = (event: RTCTrackEvent) => {
      const mediaStream = event.streams[0]
      console.log(LOG, 'ontrack fired', {
        trackKind: event.track.kind,
        streamId: mediaStream?.id,
        trackCount: mediaStream?.getTracks().length,
      })
      if (mediaStream) {
        setRemoteStream(mediaStream)
        console.log(LOG, 'remoteStream attached to state')
        setError(null)
      }
    }

    const onIceCandidate = (event: RTCPeerConnectionIceEvent) => {
      if (!event.candidate) return
      const peerId = currentPeerRef.current
      const sock = socketRef.current
      if (!peerId || !sock) {
        console.log(LOG, 'ICE candidate generated but peer/socket not ready — skipped')
        return
      }
      const payload = serializeCandidate(event.candidate)
      console.log(LOG, 'ICE candidate sent →', peerId)
      sock.emit('ice-candidate', { candidate: payload, to: peerId })
    }

    const onConnectionStateChange = () => {
      const state = pc.connectionState
      console.log(LOG, 'connectionState (signaling hook)', state)
      if (state === 'connected') {
        setIsPeerConnected(true)
        setError(null)
      } else if (state === 'disconnected') {
        setIsPeerConnected(false)
      } else if (state === 'failed' || state === 'closed') {
        setIsPeerConnected(false)
        setRemoteStream(null)
        setIsRemoteCameraOff(false)
        setIsRemoteAudioOff(false)
      }
    }

    pc.addEventListener('track', onTrack)
    pc.addEventListener('icecandidate', onIceCandidate)
    pc.addEventListener('connectionstatechange', onConnectionStateChange)

    const handleUserFound = async ({
      partnerId,
      partnerUserId,
    }: {
      partnerId: string
      partnerUserId?: string | null
    }) => {
      const sock = socketRef.current
      const activePc = peerConnectionRef.current
      if (!sock?.id || !activePc || !isPeerConnectionUsable(activePc)) {
        console.error(LOG, 'user-found but peer connection not ready')
        setError('Failed to establish video connection. Please try again.')
        return
      }

      console.log(LOG, 'matched peer ID', partnerId, '| my ID', sock.id)
      currentPeerRef.current = partnerId
      setCurrentPeer(partnerId)
      setIsSearching(false)
      pendingIceCandidatesRef.current = []

      setCurrentPeerUserId(typeof partnerUserId === 'string' ? partnerUserId : null)
      setHasVibed(false)
      setMutualVibe(null)

      const shouldOffer = partnerId > sock.id
      isCallerRef.current = shouldOffer
      console.log(LOG, shouldOffer ? 'role: CALLER (creating offer)' : 'role: CALLEE (waiting for offer)')

      if (!shouldOffer) return

      try {
        if (activePc.signalingState !== 'stable') {
          console.warn(LOG, 'offer skipped — signalingState', activePc.signalingState)
          return
        }

        const offer = await activePc.createOffer()
        await activePc.setLocalDescription(offer)
        console.log(LOG, 'created offer → call-user', partnerId)

        sock.emit('call-user', { offer, to: partnerId })
        setError(null)
      } catch (err) {
        console.error(LOG, 'createOffer failed (retrying):', err)
        await new Promise(resolve => setTimeout(resolve, 300))
        try {
          const pc = peerConnectionRef.current
          if (!pc || !isPeerConnectionUsable(pc) || pc.signalingState !== 'stable') {
            throw new Error('Peer connection not stable for retry')
          }
          const offer = await pc.createOffer()
          await pc.setLocalDescription(offer)
          console.log(LOG, 'created offer (retry) → call-user', partnerId)
          sock.emit('call-user', { offer, to: partnerId })
          setError(null)
        } catch (retryErr) {
          console.error(LOG, 'createOffer failed after retry:', retryErr)
          setError('Failed to establish video connection. Please try again.')
        }
      }
    }

    const handleCallMade = async ({ offer, from }: { offer: RTCSessionDescriptionInit; from: string }) => {
      const sock = socketRef.current
      const activePc = peerConnectionRef.current
      if (!sock || !activePc || !isPeerConnectionUsable(activePc)) {
        console.error(LOG, 'call-made but peer connection not ready')
        setError('Failed to establish video connection. Please try again.')
        return
      }

      console.log(LOG, 'received offer from', from)
      currentPeerRef.current = from
      setCurrentPeer(from)
      isCallerRef.current = false

      try {
        await activePc.setRemoteDescription(new RTCSessionDescription(offer))
        console.log(LOG, 'remoteDescription set (offer)')
        drainIceCandidates()

        const answer = await activePc.createAnswer()
        await activePc.setLocalDescription(answer)
        console.log(LOG, 'created answer → make-answer', from)
        sock.emit('make-answer', { answer, to: from })
        setError(null)
      } catch (err) {
        console.error(LOG, 'handleCallMade failed:', err)
        setError('Failed to establish video connection. Please try again.')
      }
    }

    const handleAnswerMade = async ({ answer, from }: { answer: RTCSessionDescriptionInit; from: string }) => {
      const activePc = peerConnectionRef.current
      if (!activePc || !isPeerConnectionUsable(activePc)) {
        console.error(LOG, 'answer-made but peer connection not ready')
        setError('Failed to establish video connection. Please try again.')
        return
      }

      console.log(LOG, 'received answer from', from)

      try {
        if (activePc.signalingState === 'stable' && activePc.remoteDescription) {
          console.log(LOG, 'answer ignored — already stable with remote description')
          return
        }
        await activePc.setRemoteDescription(new RTCSessionDescription(answer))
        console.log(LOG, 'remoteDescription set (answer)')
        drainIceCandidates()
        setError(null)
      } catch (err) {
        console.error(LOG, 'handleAnswerMade failed:', err)
        setError('Failed to establish video connection. Please try again.')
      }
    }

    const handleIceCandidate = ({ candidate, from }: { candidate: RTCIceCandidateInit; from: string }) => {
      console.log(LOG, 'ICE candidate received ←', from)
      queueOrAddIceCandidate(candidate)
    }

    const handlePeerLeft = () => {
      console.log(LOG, 'peer-left')
      currentPeerRef.current = null
      setCurrentPeer(null)
      setCurrentPeerUserId(null)
      setRemoteStream(null)
      setHasVibed(false)
      setMutualVibe(null)
      setIsPeerConnected(false)
      setIsRemoteCameraOff(false)
      setIsRemoteAudioOff(false)
      setIsSearching(false)
      pendingIceCandidatesRef.current = []
      isCallerRef.current = false
    }

    const sock = socketRef.current
    if (!sock) return

    sock.on('user-found', handleUserFound)
    sock.on('call-made', handleCallMade)
    sock.on('answer-made', handleAnswerMade)
    sock.on('ice-candidate', handleIceCandidate)
    sock.on('peer-left', handlePeerLeft)

    return () => {
      pc.removeEventListener('track', onTrack)
      pc.removeEventListener('icecandidate', onIceCandidate)
      pc.removeEventListener('connectionstatechange', onConnectionStateChange)
      sock.off('user-found', handleUserFound)
      sock.off('call-made', handleCallMade)
      sock.off('answer-made', handleAnswerMade)
      sock.off('ice-candidate', handleIceCandidate)
      sock.off('peer-left', handlePeerLeft)
    }
  }, [
    peerConnection,
    stream,
    socket,
    setIsSearching,
    setError,
  ])

  useEffect(() => {
    if (!socket) return
    const handleRemoteStreamState = ({ type, state }: { type: 'audio' | 'video'; state: boolean }) => {
      if (type === 'audio') setIsRemoteAudioOff(!state)
      else if (type === 'video') setIsRemoteCameraOff(!state)
    }
    socket.on('stream-state-change', handleRemoteStreamState)
    return () => {
      socket.off('stream-state-change', handleRemoteStreamState)
    }
  }, [socket])

  useEffect(() => {
    if (!remoteStream || !isAdaptiveQuality || !peerConnection) return
    const checkBandwidth = async () => {
      try {
        const stats = await peerConnection.getStats()
        let totalBitrate = 0
        let validStat = false
        stats.forEach((stat) => {
          if (stat.type === 'inbound-rtp' && 'kind' in stat && stat.kind === 'video') {
            const rtp = stat as RTCInboundRtpStreamStats
            if (rtp.bytesReceived && rtp.timestamp) {
              totalBitrate = (rtp.bytesReceived * 8) / (rtp.timestamp / 1000)
              validStat = true
            }
          }
        })
        if (validStat) {
          if (totalBitrate > 2000000) setBandwidthQuality('high')
          else if (totalBitrate > 700000) setBandwidthQuality('medium')
          else setBandwidthQuality('low')
        }
      } catch (err) {
        console.error(LOG, 'bandwidth check failed:', err)
      }
    }
    const interval = setInterval(checkBandwidth, 5000)
    return () => clearInterval(interval)
  }, [remoteStream, peerConnection, isAdaptiveQuality, setBandwidthQuality])

  const handleStartChat = useCallback(() => {
    if (!socket?.connected || !stream || buttonCooldown) return
    console.log(LOG, 'find-user')
    setIsSearching(true)
    setError(null)
    socket.emit('find-user')
    startCooldown()
  }, [socket, stream, buttonCooldown, setIsSearching, setError, startCooldown])

  const handleCancelSearch = useCallback(() => {
    if (!socket?.connected) return
    socket.emit('cancel-search')
    setIsSearching(false)
    setError(null)
  }, [socket, setIsSearching, setError])

  const handleNextPerson = useCallback(() => {
    console.log(LOG, 'find-next-user')
    pendingIceCandidatesRef.current = []
    if (currentPeer) {
      restartConnection()
    }
    setIsPeerConnected(false)
    currentPeerRef.current = null
    setCurrentPeer(null)
    setCurrentPeerUserId(null)
    setHasVibed(false)
    setMutualVibe(null)
    setRemoteStream(null)
    setIsSearching(true)
    setError(null)
    window.setTimeout(() => {
      socket?.emit('find-next-user')
    }, 350)
    startCooldown()
    return 'next' as const
  }, [currentPeer, restartConnection, socket, startCooldown, setError])

  const handleVibe = useCallback(() => {
    if (!socket?.connected || !currentPeer || hasVibed) return
    socket.emit('vibe-tap', { to: currentPeer })
    setHasVibed(true)
  }, [socket, currentPeer, hasVibed])

  const handleBlock = useCallback(async () => {
    if (!socket?.connected || !currentPeer) return false
    if (!window.confirm('Block this person? You will not be matched with them again.')) return false

    if (currentPeerUserId) {
      try {
        const response = await fetch('/api/blocks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ blockedUserId: currentPeerUserId }),
        })
        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to block user')
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to block user')
        return false
      }
    }

    socket.emit('block-user', { to: currentPeer })
    currentPeerRef.current = null
    setCurrentPeer(null)
    setCurrentPeerUserId(null)
    setRemoteStream(null)
    setHasVibed(false)
    setMutualVibe(null)
    setIsSearching(false)
    return true
  }, [socket, currentPeer, currentPeerUserId, setError, setIsSearching])

  const handleLeaveChat = useCallback(() => {
    const confirmLeave = window.confirm('Are you sure you want to leave the chat?')
    if (!confirmLeave) return false
    socket?.emit('leave-chat')
    currentPeerRef.current = null
    setCurrentPeer(null)
    setCurrentPeerUserId(null)
    setHasVibed(false)
    setMutualVibe(null)
    setRemoteStream(null)
    setIsSearching(false)
    router.push('/')
    return true
  }, [socket, router])

  const reportExplicitContent = useCallback(() => {
    socket?.emit('report-explicit-content', { timestamp: new Date().toISOString() })
  }, [socket])

  return {
    socket,
    isSocketConnected,
    currentPeer,
    currentPeerUserId,
    remoteStream,
    setRemoteStream,
    isPeerConnected,
    isRemoteCameraOff,
    isRemoteAudioOff,
    hasVibed,
    mutualVibe,
    dismissMutualVibe: () => setMutualVibe(null),
    handleStartChat,
    handleCancelSearch,
    handleNextPerson,
    handleVibe,
    handleBlock,
    handleLeaveChat,
    reportExplicitContent,
  }
}
