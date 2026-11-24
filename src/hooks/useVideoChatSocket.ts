'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import type { VibeRoomState } from '@/lib/vibeRoom'
import { VIBE_ROOM_PROTOCOL, confirmVibeRoomServer } from '@/lib/vibeRoomProtocol'
import type { VibeThemeId } from '@/lib/vibeThemes'
import { useRouter } from 'next/navigation'
import { getSocketUrl } from '@/lib/socketUrl'

const LOG = '[WebRTC:Signaling]'

interface IntroductionState {
  themeId: string
  themeTitle: string
  invitationId: string
  expiresAt: number
  accepted: boolean
  person: { displayName: string; conversationStyle: string; sharedInterests: string[] }
}

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
  directConnectionId?: string | null
  incomingCallId?: string | null
  themeId?: VibeThemeId | null
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
  directConnectionId = null,
  incomingCallId = null,
  themeId = null,
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
  const [callStatus, setCallStatus] = useState<string | null>(null)
  const [introduction, setIntroduction] = useState<IntroductionState | null>(null)
  const [room, setRoom] = useState<VibeRoomState | null>(null)

  const socketRef = useRef<Socket | null>(null)
  const currentPeerRef = useRef<string | null>(null)
  const pendingIceCandidatesRef = useRef<RTCIceCandidateInit[]>([])
  const remoteReadyRef = useRef(false)
  const receivedStreamRef = useRef<MediaStream | null>(null)
  const isCallerRef = useRef(false)
  const readyPcRef = useRef<RTCPeerConnection | null>(null)
  const pendingNextRef = useRef<{ requestId: number; themeId: VibeThemeId } | null>(null)
  const directCallAttemptedRef = useRef<string | null>(null)
  const incomingCallAcceptedRef = useRef<string | null>(null)
  const searchGenerationRef = useRef(0)

  useEffect(() => {
    socketRef.current = socket
  }, [socket])

  const resetCall = useCallback(() => {
    readyPcRef.current = null
    currentPeerRef.current = null
    pendingIceCandidatesRef.current = []
    remoteReadyRef.current = false
    receivedStreamRef.current = null
    isCallerRef.current = false
    setCurrentPeer(null)
    setCurrentPeerUserId(null)
    setRemoteStream(null)
    setIsPeerConnected(false)
    setIsRemoteCameraOff(false)
    setIsRemoteAudioOff(false)
    setHasVibed(false)
    setMutualVibe(null)
    setCallStatus(null)
    setIntroduction(null)
    setRoom(null)
    restartConnection()
  }, [restartConnection])

  useEffect(() => {
    let disposed = false
    let newSocket: Socket | null = null

    const connect = async () => {
      const socketUrl = getSocketUrl()
      if (!socketUrl) {
        setError('Meetopia video is not configured. Please contact support.')
        return
      }
      console.log(LOG, 'socket URL', socketUrl)

      let token: string | undefined
      try {
        const tokenResponse = await fetch('/api/auth/socket-token', {
          cache: 'no-store',
          credentials: 'same-origin',
          headers: { Accept: 'application/json' },
        })
        const data = await tokenResponse.json().catch(() => null)

        if (tokenResponse.status === 401) {
          setError('Your Meetopia session has expired. Please sign in again.')
          router.replace('/auth/signin?next=/chat/video')
          return
        }

        if (!tokenResponse.ok || !data?.token) {
          console.error(LOG, 'socket token unavailable', tokenResponse.status, data?.error)
          setError(data?.error || 'Meetopia video authentication is unavailable right now.')
          return
        }

        token = data.token
      } catch (error) {
        console.error(LOG, 'socket token request failed', error)
        setError('Meetopia video authentication is unavailable right now.')
        return
      }

      if (disposed) return

      let firstToken = token
      newSocket = io(socketUrl, {
        transports: ['polling', 'websocket'],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
        auth: (callback) => {
          if (firstToken) {
            const value = firstToken
            firstToken = undefined
            callback({ token: value, meetopiaProtocol: VIBE_ROOM_PROTOCOL })
            return
          }
          void (async () => {
            try {
              const response = await fetch('/api/auth/socket-token', {
                cache: 'no-store', credentials: 'same-origin',
                headers: { Accept: 'application/json' },
              })
              const data = await response.json().catch(() => null)
              if (disposed) return
              if (!response.ok || !data?.token) {
                setError('Meetopia video authentication is unavailable. Please sign in again.')
                callback({ meetopiaProtocol: VIBE_ROOM_PROTOCOL })
                return
              }
              callback({ token: data.token, meetopiaProtocol: VIBE_ROOM_PROTOCOL })
            } catch {
              if (!disposed) callback({ meetopiaProtocol: VIBE_ROOM_PROTOCOL })
            }
          })()
        },
      })
      setSocket(newSocket)
      socketRef.current = newSocket

      newSocket.on('connect', async () => {
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
        setIsSocketConnected(false)
        setIsSearching(false)
        setError(err.message === 'AUTH_REQUIRED'
          ? 'Meetopia video authentication was rejected. Please sign in again or contact support.'
          : 'Unable to connect to Meetopia right now. Please try again.')
      })

      newSocket.on('disconnect', () => {
        searchGenerationRef.current += 1
        console.log(LOG, 'socket disconnected')
        setIsSocketConnected(false)
        pendingNextRef.current = null
        resetCall()
        setIsSearching(false)
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
        } else if (code === 'PASSPORT_REQUIRED') {
          router.push('/chemistry/passport')
        }
      })

      newSocket.on('search-cancelled', () => {
        setIsSearching(false); setIntroduction(null); setError(null)
      })
      newSocket.on('introduction-searching', () => {
        setIsSearching(true); setIntroduction(null); setError(null)
      })
      newSocket.on('introduction-offered', (invite: Omit<IntroductionState, 'accepted'>) => {
        setIntroduction({ ...invite, accepted: false })
        setIsSearching(false)
        setError(null)
      })
      newSocket.on('introduction-response-recorded', ({ invitationId }: { invitationId: string }) => {
        setIntroduction(current => current?.invitationId === invitationId ? { ...current, accepted: true } : current)
      })
      const ended = ({ reason }: { reason?: string }) => {
        setIntroduction(null); setIsSearching(false)
        if (reason) setError(reason)
      }
      newSocket.on('introduction-declined', ended)
      newSocket.on('introduction-expired', ended)
      newSocket.on('introduction-cancelled', ended)
      newSocket.on('introduction-approved', () => { setIntroduction(null); setError(null) })
      newSocket.on('vibe-room-state', (next: VibeRoomState) => setRoom(next))
      newSocket.on('vibe-room-ended', () => setRoom(null))
      newSocket.on('vibe-room-error', ({ message }: { message?: string }) => {
        setError(message || 'Unable to advance the Vibe Room.')
      })

      newSocket.on(
        'direct-call-unavailable',
        ({ message }: { message?: string }) => {
          setIsSearching(false)
          setCallStatus(null)
          setError(message || 'Your Connection is not available for a video call right now.')
        }
      )

      newSocket.on('connection-call-ringing', () => {
        setIsSearching(true)
        setError(null)
        setCallStatus('Calling your Connection…')
      })

      newSocket.on('connection-call-accepted', () => {
        setIsSearching(false)
        setCallStatus('Connecting…')
        setError(null)
      })

      newSocket.on('connection-call-declined', () => {
        setIsSearching(false)
        setCallStatus(null)
        setError('Your Connection declined the call.')
      })

      newSocket.on('connection-call-expired', () => {
        setIsSearching(false)
        setCallStatus(null)
        setError('No answer. You can try again later.')
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
  }, [router, setError, setIsSearching, resetCall])

  // WebRTC handlers on the current peer connection (stable refs for ICE peer id)
  useEffect(() => {
    const pc = peerConnection
    const sock = socket
    if (!pc || !sock || !stream || !isPeerConnectionUsable(pc)) return
    const isCurrent = (peerId: string) => readyPcRef.current === pc &&
      currentPeerRef.current === peerId && socketRef.current === sock &&
      sock.connected && isPeerConnectionUsable(pc)

    const addCandidate = async (candidate: RTCIceCandidateInit, peerId: string) => {
      if (!isCurrent(peerId)) return
      try {
        await pc.addIceCandidate(candidate)
      } catch (err) {
        if (!isCurrent(peerId)) return
        console.error(LOG, 'addIceCandidate failed:', err)
        setError('A video network candidate failed. Select Next if the connection does not recover.')
      }
    }

    const drainIceCandidates = async (peerId: string) => {
      if (!isCurrent(peerId) || !pc.remoteDescription) return
      while (isCurrent(peerId) && pendingIceCandidatesRef.current.length) {
        const pending = pendingIceCandidatesRef.current.splice(0)
        console.log(LOG, 'draining queued ICE candidates', pending.length)
        for (const candidate of pending) await addCandidate(candidate, peerId)
      }
      if (isCurrent(peerId)) remoteReadyRef.current = true
    }

    const queueOrAddIceCandidate = (candidate: RTCIceCandidateInit, peerId: string) => {
      if (!isCurrent(peerId)) return
      if (remoteReadyRef.current && pc.remoteDescription) {
        void addCandidate(candidate, peerId)
      } else {
        console.log(LOG, 'ICE candidate received → queued (no remoteDescription yet)')
        pendingIceCandidatesRef.current.push(candidate)
      }
    }

    const onTrack = (event: RTCTrackEvent) => {
      const peerId = currentPeerRef.current
      if (!peerId || !isCurrent(peerId)) return
      const mediaStream = event.streams[0] ?? receivedStreamRef.current ?? new MediaStream()
      if (!mediaStream.getTracks().some(track => track.id === event.track.id)) mediaStream.addTrack(event.track)
      receivedStreamRef.current = mediaStream
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
      if (!peerId || !sock || !isCurrent(peerId)) {
        console.log(LOG, 'ICE candidate generated but peer/socket not ready — skipped')
        return
      }
      const payload = serializeCandidate(event.candidate)
      console.log(LOG, 'ICE candidate sent →', peerId)
      sock.emit('ice-candidate', { candidate: payload, to: peerId })
    }

    const onConnectionStateChange = () => {
      const peerId = currentPeerRef.current
      if (!peerId || !isCurrent(peerId)) return
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
        if (state === 'failed') setError('Video connection failed. Check your network or select Next.')
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
      const activePc = pc
      if (!sock.id || readyPcRef.current !== pc || !isPeerConnectionUsable(pc)) {
        console.error(LOG, 'user-found but peer connection not ready')
        setError('Failed to establish video connection. Please try again.')
        return
      }

      if (currentPeerRef.current) return
      remoteReadyRef.current = false
      receivedStreamRef.current = null
      console.log(LOG, 'matched peer ID', partnerId, '| my ID', sock.id)
      currentPeerRef.current = partnerId
      setIntroduction(null)
      setCurrentPeer(partnerId)
      setIsSearching(false)
      setCallStatus(null)
      pendingIceCandidatesRef.current = []

      setCurrentPeerUserId(typeof partnerUserId === 'string' ? partnerUserId : null)
      setHasVibed(false)
      setMutualVibe(null)

      const shouldOffer = partnerId > sock.id
      isCallerRef.current = shouldOffer
      console.log(LOG, shouldOffer ? 'role: CALLER (creating offer)' : 'role: CALLEE (waiting for offer)')

      if (!shouldOffer) return

      try {
        if (activePc.signalingState !== 'stable') throw new Error('Peer connection not stable')
        const offer = await activePc.createOffer()
        if (!isCurrent(partnerId)) return
        await activePc.setLocalDescription(offer)
        if (!isCurrent(partnerId)) return
        console.log(LOG, 'created offer → call-user', partnerId)
        sock.emit('call-user', { offer, to: partnerId })
      } catch (err) {
        if (!isCurrent(partnerId)) return
        console.error(LOG, 'createOffer failed:', err)
        setError('Failed to establish video connection. Please select Next.')
      }
    }

    const handleCallMade = async ({ offer, from }: { offer: RTCSessionDescriptionInit; from: string }) => {
      const activePc = pc
      if (!isCurrent(from) || isCallerRef.current || activePc.signalingState !== 'stable') return
      console.log(LOG, 'received offer from', from)

      try {
        await activePc.setRemoteDescription(offer)
        if (!isCurrent(from)) return
        console.log(LOG, 'remoteDescription set (offer)')
        await drainIceCandidates(from)
        if (!isCurrent(from)) return

        const answer = await activePc.createAnswer()
        if (!isCurrent(from)) return
        await activePc.setLocalDescription(answer)
        if (!isCurrent(from)) return
        console.log(LOG, 'created answer → make-answer', from)
        sock.emit('make-answer', { answer, to: from })
        setError(null)
      } catch (err) {
        if (!isCurrent(from)) return
        console.error(LOG, 'handleCallMade failed:', err)
        setError('Failed to establish video connection. Please try again.')
      }
    }

    const handleAnswerMade = async ({ answer, from }: { answer: RTCSessionDescriptionInit; from: string }) => {
      const activePc = pc
      if (!isCurrent(from) || !isCallerRef.current || activePc.signalingState !== 'have-local-offer') return

      console.log(LOG, 'received answer from', from)

      try {
        await activePc.setRemoteDescription(answer)
        if (!isCurrent(from)) return
        console.log(LOG, 'remoteDescription set (answer)')
        await drainIceCandidates(from)
      } catch (err) {
        if (!isCurrent(from)) return
        console.error(LOG, 'handleAnswerMade failed:', err)
        setError('Failed to establish video connection. Please try again.')
      }
    }

    const handleIceCandidate = ({ candidate, from }: { candidate: RTCIceCandidateInit; from: string }) => {
      console.log(LOG, 'ICE candidate received ←', from)
      queueOrAddIceCandidate(candidate, from)
    }

    const handlePeerLeft = () => {
      console.log(LOG, 'peer-left')
      if (!currentPeerRef.current) return
      pendingNextRef.current = null
      searchGenerationRef.current += 1
      resetCall()
      setIsSearching(false)
    }

    sock.on('user-found', handleUserFound)
    sock.on('call-made', handleCallMade)
    sock.on('answer-made', handleAnswerMade)
    sock.on('ice-candidate', handleIceCandidate)
    sock.on('peer-left', handlePeerLeft)
    readyPcRef.current = pc
    const pendingNext = pendingNextRef.current
    if (pendingNext && sock.connected) {
      void confirmVibeRoomServer(sock).then(supported => {
        if (pendingNextRef.current !== pendingNext ||
          pendingNext.requestId !== searchGenerationRef.current ||
          readyPcRef.current !== pc) return
        pendingNextRef.current = null
        if (!supported || !sock.connected) {
          setIsSearching(false)
          setError('The Vibe Room signaling server must be updated before another introduction.')
          return
        }
        sock.emit('find-next-user', { themeId: pendingNext.themeId })
        startCooldown()
      })
    }

    return () => {
      if (readyPcRef.current === pc) readyPcRef.current = null
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
    resetCall,
    startCooldown,
  ])

  useEffect(() => {
    if (!currentPeer || isPeerConnected) return
    const timer = window.setTimeout(() => {
      if (currentPeerRef.current === currentPeer) setError('Video connection timed out. Check your network or select Next.')
    }, 25_000)
    return () => window.clearTimeout(timer)
  }, [currentPeer, isPeerConnected, setError])

  useEffect(() => {
    if (
      !directConnectionId ||
      incomingCallId ||
      !isSocketConnected ||
      !socket?.connected ||
      !stream ||
      !peerConnection ||
      readyPcRef.current !== peerConnection ||
      directCallAttemptedRef.current === directConnectionId
    ) {
      return
    }

    directCallAttemptedRef.current = directConnectionId
    setIsSearching(true)
    setError(null)

    const startDirectCall = async () => {
      try {
        const response = await fetch(
          `/api/connections/${directConnectionId}/call-proof`,
          {
            method: 'POST',
            credentials: 'same-origin',
            headers: { Accept: 'application/json' },
          }
        )
        const data = await response.json().catch(() => null)

        if (!response.ok || !data?.proof) {
          throw new Error(data?.error || 'Could not start this Connection call.')
        }

        socket.emit('call-connection', { proof: data.proof })
      } catch (error) {
        console.error(LOG, 'direct Connection call failed to start', error)
        setIsSearching(false)
        setError(
          error instanceof Error
            ? error.message
            : 'Could not start this Connection call.'
        )
      }
    }

    void startDirectCall()
  }, [
    directConnectionId,
    incomingCallId,
    socket,
    isSocketConnected,
    stream,
    peerConnection,
    setIsSearching,
    setError,
  ])

  useEffect(() => {
    if (
      !incomingCallId ||
      !isSocketConnected ||
      !socket?.connected ||
      !stream ||
      !peerConnection ||
      readyPcRef.current !== peerConnection ||
      incomingCallAcceptedRef.current === incomingCallId
    ) {
      return
    }

    incomingCallAcceptedRef.current = incomingCallId
    setIsSearching(true)
    setError(null)
    setCallStatus('Connecting your call…')
    socket.emit('accept-connection-call', { inviteId: incomingCallId })
  }, [
    incomingCallId,
    socket,
    isSocketConnected,
    stream,
    peerConnection,
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
    if (buttonCooldown || !themeId) return
    if (!socket?.connected || !stream || !readyPcRef.current) {
      setError('Video is not ready yet. Check your camera and connection and try again.')
      return
    }
    const requestId = ++searchGenerationRef.current
    setIsSearching(true)
    setError(null)
    setIntroduction(null)
    void confirmVibeRoomServer(socket).then(supported => {
      if (requestId !== searchGenerationRef.current) return
      if (!supported || !socket.connected || !readyPcRef.current) {
        setIsSearching(false)
        setError('The Vibe Room signaling server must be updated before starting a Chemistry Check.')
        return
      }
      socket.emit('find-user', { themeId })
      startCooldown()
    })
  }, [socket, stream, buttonCooldown, setIsSearching, setError, startCooldown, themeId])

  const handleCancelSearch = useCallback(() => {
    searchGenerationRef.current += 1
    const pendingNext = pendingNextRef.current
    pendingNextRef.current = null
    if (!socket?.connected) return
    if (pendingNext) socket.emit('leave-chat')
    socket.emit('cancel-search')
    setIsSearching(false)
    setIntroduction(null)
    setError(null)
  }, [socket, setIsSearching, setError])

  const handleNextPerson = useCallback(() => {
    if (!socket?.connected || !stream || buttonCooldown || !themeId) return
    const requestId = ++searchGenerationRef.current
    pendingNextRef.current = { requestId, themeId }
    resetCall()
    setIsSearching(true)
    setError(null)
    return 'next' as const
  }, [socket, stream, buttonCooldown, themeId, resetCall, setIsSearching, setError])

  const acceptIntroduction = useCallback(() => {
    if (socket?.connected && introduction && !introduction.accepted) {
      socket.emit('introduction-response', { invitationId: introduction.invitationId, accept: true })
    }
  }, [socket, introduction])

  const declineIntroduction = useCallback(() => {
    if (socket?.connected && introduction) {
      socket.emit('introduction-response', { invitationId: introduction.invitationId, accept: false })
    }
    setIntroduction(null); setIsSearching(false)
  }, [socket, introduction, setIsSearching])

  const answerRound = useCallback((choice: string) => {
    if (socket?.connected && room && !room.completed && room.index === 1 && !room.myChoice) {
      socket.emit('vibe-room-answer', { sessionId: room.sessionId, choice })
    }
  }, [socket, room])

  const contribute = useCallback((choice: string) => {
    if (socket?.connected && room && room.index === 3 && !room.completed) {
      socket.emit('vibe-room-contribute', { sessionId: room.sessionId, choice })
    }
  }, [socket, room])

  const approveCreation = useCallback(() => {
    if (socket?.connected && room?.index === 3 && !room.completed && room.bridge?.proposal && !room.bridge.approved) {
      socket.emit('vibe-room-approve', { sessionId: room.sessionId, revision: room.bridge.revision, share: true })
    }
  }, [socket, room])

  const nextRound = useCallback(() => {
    if (socket?.connected && room && !room.completed && !room.ready && room.index < 3) {
      socket.emit('vibe-room-next', { sessionId: room.sessionId })
    }
  }, [socket, room])

  const handleVibe = useCallback(() => {
    if (!socket?.connected || !currentPeer || !room?.completed || hasVibed) return
    socket.emit('vibe-tap', { to: currentPeer })
    setHasVibed(true)
  }, [socket, currentPeer, room, hasVibed])

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
    searchGenerationRef.current += 1
    pendingNextRef.current = null
    resetCall()
    setIsSearching(false)
    return true
  }, [socket, currentPeer, currentPeerUserId, setError, setIsSearching, resetCall])

  const handleLeaveChat = useCallback(() => {
    const confirmLeave = window.confirm('Are you sure you want to leave the chat?')
    if (!confirmLeave) return false
    searchGenerationRef.current += 1
    socket?.emit('leave-chat')
    pendingNextRef.current = null
    resetCall()
    setIsSearching(false)
    router.push('/')
    return true
  }, [socket, router, resetCall, setIsSearching])

  const reportExplicitContent = useCallback(() => {
    socket?.emit('report-explicit-content', { timestamp: new Date().toISOString() })
  }, [socket])

  return {
    socket,
    isSocketConnected,
    introduction,
    room,
    answerRound,
    nextRound,
    contribute,
    approveCreation,
    acceptIntroduction,
    declineIntroduction,
    currentPeer,
    currentPeerUserId,
    remoteStream,
    setRemoteStream,
    isPeerConnected,
    isRemoteCameraOff,
    isRemoteAudioOff,
    hasVibed,
    mutualVibe,
    callStatus,
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
