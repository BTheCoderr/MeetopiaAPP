'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useRouter } from 'next/navigation'
import type { UserProfile } from '@/types/videoChat'

const LOG = '[WebRTC:Signaling]'

interface UseVideoChatSocketOptions {
  stream: MediaStream | null
  peerConnection: RTCPeerConnection | null
  restartConnection: () => void
  isDating: boolean
  isDemo: boolean
  userProfile: UserProfile | null
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
  isDating,
  isDemo,
  userProfile,
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
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3003'
    console.log(LOG, 'socket URL', socketUrl)

    const newSocket = io(socketUrl, {
      transports: ['polling', 'websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    })
    setSocket(newSocket)
    socketRef.current = newSocket

    newSocket.on('connect', () => {
      const transport = newSocket.io.engine?.transport?.name ?? 'unknown'
      console.log(LOG, 'socket connected', newSocket.id, 'transport', transport)
      setIsSocketConnected(true)
      setError(null)

      newSocket.io.engine?.on('upgrade', (transport) => {
        console.log(LOG, 'transport upgraded to', transport.name)
      })
    })

    newSocket.on('connect_error', (err) => {
      console.error(LOG, 'connect_error', err.message)
    })

    newSocket.on('disconnect', () => {
      console.log(LOG, 'socket disconnected')
      setIsSocketConnected(false)
      setCurrentPeer(null)
      currentPeerRef.current = null
      setRemoteStream(null)
      setIsSearching(false)
      setError('Connection lost. Attempting to reconnect...')
    })

    return () => {
      newSocket.disconnect()
      socketRef.current = null
    }
  }, [setError, setIsSearching])

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

    const handleUserFound = async ({ partnerId, profile }: { partnerId: string; profile?: unknown }) => {
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

      if (isDating && profile) {
        console.log(LOG, 'dating peer profile', profile)
      }

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

        if (isDating && userProfile) {
          sock.emit('call-user', { offer, to: partnerId, profile: userProfile })
        } else {
          sock.emit('call-user', { offer, to: partnerId })
        }
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
      setRemoteStream(null)
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
    isDating,
    userProfile,
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
    if (isDating && userProfile) {
      socket.emit('find-user', { mode: 'dating', profile: userProfile })
    } else {
      socket.emit('find-user')
    }
    startCooldown()
  }, [socket, stream, buttonCooldown, setIsSearching, startCooldown, isDating, userProfile])

  const handleNextPerson = useCallback(() => {
    if (isDemo) return 'leave' as const
    console.log(LOG, 'find-next-user')
    pendingIceCandidatesRef.current = []
    if (currentPeer) {
      restartConnection()
    }
    setIsPeerConnected(false)
    currentPeerRef.current = null
    setCurrentPeer(null)
    setRemoteStream(null)
    setIsSearching(true)
    setError(null)
    window.setTimeout(() => {
      if (isDating && userProfile) {
        socket?.emit('find-next-user', { mode: 'dating', profile: userProfile })
      } else {
        socket?.emit('find-next-user')
      }
    }, 350)
    startCooldown()
    return 'next' as const
  }, [isDemo, currentPeer, restartConnection, socket, startCooldown, setError, isDating, userProfile])

  const handleLeaveChat = useCallback(() => {
    const confirmLeave = window.confirm('Are you sure you want to leave the chat?')
    if (!confirmLeave) return false
    socket?.emit('leave-chat')
    currentPeerRef.current = null
    setCurrentPeer(null)
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
    remoteStream,
    setRemoteStream,
    isPeerConnected,
    isRemoteCameraOff,
    isRemoteAudioOff,
    handleStartChat,
    handleNextPerson,
    handleLeaveChat,
    reportExplicitContent,
  }
}
