import { useCallback, useEffect, useRef, useState } from 'react'
import { Alert } from 'react-native'
import {
  MediaStream,
  RTCIceCandidate,
  RTCPeerConnection,
  RTCSessionDescription,
} from 'react-native-webrtc'
import { Socket } from 'socket.io-client'
import {
  getBlockedEntries,
  isBlockedEntry,
  addVibeMatch,
  type BlockedEntry,
} from '@/lib/onboardingStorage'
import { getSocket } from '@/lib/socket'
import type { ReportCategory } from '@/components/safety/ReportModal'

const LOG = '[Mobile:Signaling]'

type SignalingSessionDescription = { type: string; sdp: string }
type IceCandidateInit = ConstructorParameters<typeof RTCIceCandidate>[0]

export type PeerProfilePayload = {
  name?: string
  age?: number
  city?: string
  intent?: string
  prompt?: string
  bio?: string
  gender?: string
  lookingFor?: string
}

function isUsable(pc: RTCPeerConnection): boolean {
  return pc.signalingState !== 'closed' && pc.connectionState !== 'closed'
}

function toSessionDescription(init: SignalingSessionDescription): RTCSessionDescription {
  if (!init.sdp) throw new Error('Missing SDP in session description')
  return new RTCSessionDescription({ type: init.type, sdp: init.sdp })
}

interface Options {
  stream: MediaStream | null
  peerConnection: RTCPeerConnection | null
  restartConnection: () => void
  signalingProfile: Record<string, unknown> | null
  enabled?: boolean
}

export function useMobileVideoChatSocket({
  stream,
  peerConnection,
  restartConnection,
  signalingProfile,
  enabled = true,
}: Options) {
  const [socket] = useState<Socket>(() => getSocket())
  const [isSocketConnected, setIsSocketConnected] = useState(false)
  const [currentPeer, setCurrentPeer] = useState<string | null>(null)
  const [peerProfile, setPeerProfile] = useState<PeerProfilePayload | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [isPeerConnected, setIsPeerConnected] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [myVibeSent, setMyVibeSent] = useState(false)
  const [peerVibeReceived, setPeerVibeReceived] = useState(false)

  const pcRef = useRef(peerConnection)
  const peerRef = useRef<string | null>(null)
  const peerProfileRef = useRef<PeerProfilePayload | null>(null)
  const pendingIce = useRef<IceCandidateInit[]>([])
  const blockedRef = useRef<BlockedEntry[]>([])

  const mutualVibe = myVibeSent && peerVibeReceived

  useEffect(() => {
    pcRef.current = peerConnection
  }, [peerConnection])

  const refreshBlockedList = useCallback(async () => {
    blockedRef.current = await getBlockedEntries()
  }, [])

  useEffect(() => {
    if (!enabled) return
    refreshBlockedList()
  }, [enabled, refreshBlockedList])

  const resetVibeState = useCallback(() => {
    setMyVibeSent(false)
    setPeerVibeReceived(false)
  }, [])

  const resetPeerState = useCallback(() => {
    peerRef.current = null
    peerProfileRef.current = null
    setCurrentPeer(null)
    setPeerProfile(null)
    setRemoteStream(null)
    setIsPeerConnected(false)
    setIsSearching(false)
    pendingIce.current = []
    resetVibeState()
  }, [resetVibeState])

  useEffect(() => {
    if (!enabled) return

    const onConnect = () => {
      console.log(LOG, 'socket connected')
      setIsSocketConnected(true)
      setError(null)
    }
    const onDisconnect = () => {
      console.log(LOG, 'socket disconnected')
      setIsSocketConnected(false)
      resetPeerState()
    }
    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    if (socket.connected) onConnect()
    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
    }
  }, [socket, resetPeerState, enabled])

  useEffect(() => {
    if (!enabled) return

    const onVibe = ({ from }: { from: string }) => {
      if (from === peerRef.current) {
        setPeerVibeReceived(true)
      }
    }
    socket.on('vibe-tap', onVibe)
    return () => {
      socket.off('vibe-tap', onVibe)
    }
  }, [socket, enabled])

  useEffect(() => {
    if (!enabled || !mutualVibe || !currentPeer) return
    addVibeMatch(currentPeer).catch(console.error)
  }, [mutualVibe, currentPeer, enabled])

  useEffect(() => {
    if (!enabled) return
    const pc = peerConnection
    if (!pc) return

    const drain = () => {
      if (!pc.remoteDescription) return
      pendingIce.current.splice(0).forEach(c =>
        pc.addIceCandidate(new RTCIceCandidate(c)).catch(console.error),
      )
    }

    const onTrack = (event: { streams: readonly MediaStream[] }) => {
      const ms = event.streams[0]
      if (ms) setRemoteStream(ms)
    }

    const onIce = (event: { candidate: RTCIceCandidate | null }) => {
      if (!event.candidate) return
      const peerId = peerRef.current
      if (!peerId) return
      socket.emit('ice-candidate', { candidate: event.candidate.toJSON(), to: peerId })
    }

    const onState = () => {
      if (pc.connectionState === 'connected') setIsPeerConnected(true)
      else if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        setIsPeerConnected(false)
        setRemoteStream(null)
      }
    }

    pc.addEventListener('track', onTrack)
    pc.addEventListener('icecandidate', onIce)
    pc.addEventListener('connectionstatechange', onState)

    const skipBlockedPeer = (partnerId: string, profile?: PeerProfilePayload) => {
      if (!isBlockedEntry(blockedRef.current, partnerId, profile ?? null)) return false
      console.log(LOG, 'blocked peer skipped', partnerId)
      setIsSearching(true)
      if (signalingProfile) {
        socket.emit('find-next-user', { mode: 'dating', profile: signalingProfile })
      }
      return true
    }

    const handleUserFound = async ({
      partnerId,
      profile,
    }: {
      partnerId: string
      profile?: PeerProfilePayload
    }) => {
      if (skipBlockedPeer(partnerId, profile)) return
      const activePc = pcRef.current
      if (!socket.id || !activePc || !isUsable(activePc)) return

      peerRef.current = partnerId
      peerProfileRef.current = profile ?? null
      setCurrentPeer(partnerId)
      setPeerProfile(profile ?? null)
      setIsSearching(false)
      resetVibeState()
      pendingIce.current = []

      if (partnerId <= socket.id) return
      try {
        const offer = await activePc.createOffer({})
        await activePc.setLocalDescription(offer)
        socket.emit('call-user', { offer, to: partnerId, profile: signalingProfile ?? profile })
      } catch (err) {
        console.error(LOG, 'offer failed', err)
        setError('Failed to connect video')
      }
    }

    const handleCallMade = async ({
      offer,
      from,
      profile,
    }: {
      offer: SignalingSessionDescription
      from: string
      profile?: PeerProfilePayload
    }) => {
      if (skipBlockedPeer(from, profile)) return
      const activePc = pcRef.current
      if (!activePc || !isUsable(activePc)) return
      peerRef.current = from
      peerProfileRef.current = profile ?? null
      setCurrentPeer(from)
      setPeerProfile(profile ?? null)
      resetVibeState()
      try {
        await activePc.setRemoteDescription(toSessionDescription(offer))
        drain()
        const answer = await activePc.createAnswer()
        await activePc.setLocalDescription(answer)
        socket.emit('make-answer', { answer, to: from })
      } catch (err) {
        console.error(LOG, 'answer flow failed', err)
      }
    }

    const handleAnswerMade = async ({ answer }: { answer: SignalingSessionDescription }) => {
      const activePc = pcRef.current
      if (!activePc || !isUsable(activePc)) return
      if (activePc.signalingState === 'stable' && activePc.remoteDescription) return
      try {
        await activePc.setRemoteDescription(toSessionDescription(answer))
        drain()
        setIsPeerConnected(true)
      } catch (err) {
        console.error(LOG, 'set answer failed', err)
      }
    }

    const handleIceCandidate = ({ candidate }: { candidate: IceCandidateInit }) => {
      if (pc.remoteDescription) {
        pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(console.error)
      } else {
        pendingIce.current.push(candidate)
      }
    }

    const handlePeerLeft = () => {
      console.log(LOG, 'peer-left')
      resetPeerState()
      restartConnection()
    }

    socket.on('user-found', handleUserFound)
    socket.on('call-made', handleCallMade)
    socket.on('answer-made', handleAnswerMade)
    socket.on('ice-candidate', handleIceCandidate)
    socket.on('peer-left', handlePeerLeft)

    return () => {
      pc.removeEventListener('track', onTrack)
      pc.removeEventListener('icecandidate', onIce)
      pc.removeEventListener('connectionstatechange', onState)
      socket.off('user-found', handleUserFound)
      socket.off('call-made', handleCallMade)
      socket.off('answer-made', handleAnswerMade)
      socket.off('ice-candidate', handleIceCandidate)
      socket.off('peer-left', handlePeerLeft)
    }
  }, [
    peerConnection,
    socket,
    signalingProfile,
    restartConnection,
    resetPeerState,
    resetVibeState,
    enabled,
  ])

  const emitStreamState = useCallback(
    (type: 'audio' | 'video', enabledFlag: boolean) => {
      if (!enabled) return
      const peerId = peerRef.current
      if (!peerId || !socket.connected) return
      socket.emit('stream-state-change', { type, state: enabledFlag, to: peerId })
    },
    [socket, enabled],
  )

  const handleStartChat = useCallback(() => {
    if (!enabled || !socket.connected || !stream || !signalingProfile) return
    setIsSearching(true)
    socket.emit('find-user', { mode: 'dating', profile: signalingProfile })
  }, [socket, stream, signalingProfile, enabled])

  const handleNextPerson = useCallback(() => {
    if (!enabled) return
    pendingIce.current = []
    restartConnection()
    resetPeerState()
    setIsSearching(true)
    setTimeout(() => {
      if (signalingProfile) {
        socket.emit('find-next-user', { mode: 'dating', profile: signalingProfile })
      }
    }, 350)
  }, [restartConnection, resetPeerState, socket, signalingProfile, enabled])

  const handleLeaveChat = useCallback(() => {
    Alert.alert('Leave Chemistry Check?', 'You will return to the home screen.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: () => {
          if (enabled) socket.emit('leave-chat')
          resetPeerState()
          restartConnection()
        },
      },
    ])
  }, [socket, resetPeerState, restartConnection, enabled])

  const sendVibe = useCallback(() => {
    if (!enabled) return
    const peerId = peerRef.current
    if (!peerId || myVibeSent) return
    setMyVibeSent(true)
    socket.emit('vibe-tap', { to: peerId })
  }, [socket, myVibeSent, enabled])

  const reportUser = useCallback(
    (category: ReportCategory | string) => {
      if (!enabled) return
      const peerId = peerRef.current
      if (!peerId) return
      socket.emit('report-user', {
        category,
        reportedUserId: peerId,
        reportedSocketId: peerId,
        timestamp: Date.now(),
        reporterProfile: signalingProfile,
        reportedProfile: peerProfileRef.current,
      })
      console.log(LOG, 'report-user', category, peerId)
    },
    [socket, signalingProfile, enabled],
  )

  return {
    socket,
    isSocketConnected: enabled ? isSocketConnected : false,
    currentPeer: enabled ? currentPeer : null,
    peerProfile: enabled ? peerProfile : null,
    remoteStream: enabled ? remoteStream : null,
    isPeerConnected: enabled ? isPeerConnected : false,
    isSearching: enabled ? isSearching : false,
    error: enabled ? error : null,
    myVibeSent: enabled ? myVibeSent : false,
    peerVibeReceived: enabled ? peerVibeReceived : false,
    mutualVibe: enabled ? mutualVibe : false,
    handleStartChat,
    handleNextPerson,
    handleLeaveChat,
    emitStreamState,
    sendVibe,
    reportUser,
    refreshBlockedList,
  }
}
