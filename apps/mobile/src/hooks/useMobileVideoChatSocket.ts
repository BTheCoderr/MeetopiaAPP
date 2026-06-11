import { useCallback, useEffect, useRef, useState } from 'react'
import { Alert } from 'react-native'
import {
  MediaStream,
  RTCIceCandidate,
  RTCPeerConnection,
  RTCSessionDescription,
} from 'react-native-webrtc'
import { Socket } from 'socket.io-client'
import type { UserProfile } from '@/types/videoChat'
import { getSocket } from '@/lib/socket'

const LOG = '[Mobile:Signaling]'

type SignalingSessionDescription = {
  type: string
  sdp: string
}

type IceCandidateInit = ConstructorParameters<typeof RTCIceCandidate>[0]

function isUsable(pc: RTCPeerConnection): boolean {
  return pc.signalingState !== 'closed' && pc.connectionState !== 'closed'
}

function toSessionDescription(init: SignalingSessionDescription): RTCSessionDescription {
  if (!init.sdp) {
    throw new Error('Missing SDP in session description')
  }
  return new RTCSessionDescription({ type: init.type, sdp: init.sdp })
}

interface Options {
  stream: MediaStream | null
  peerConnection: RTCPeerConnection | null
  restartConnection: () => void
  isDating: boolean
  userProfile: UserProfile | null
}

export function useMobileVideoChatSocket({
  stream,
  peerConnection,
  restartConnection,
  isDating,
  userProfile,
}: Options) {
  const [socket] = useState<Socket>(() => getSocket())
  const [isSocketConnected, setIsSocketConnected] = useState(false)
  const [currentPeer, setCurrentPeer] = useState<string | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [isPeerConnected, setIsPeerConnected] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pcRef = useRef(peerConnection)
  const peerRef = useRef<string | null>(null)
  const pendingIce = useRef<IceCandidateInit[]>([])
  const isCallerRef = useRef(false)

  useEffect(() => {
    pcRef.current = peerConnection
  }, [peerConnection])

  const resetPeerState = useCallback(() => {
    peerRef.current = null
    setCurrentPeer(null)
    setRemoteStream(null)
    setIsPeerConnected(false)
    setIsSearching(false)
    pendingIce.current = []
    isCallerRef.current = false
  }, [])

  useEffect(() => {
    const onConnect = () => {
      console.log(LOG, 'socket connected')
      setIsSocketConnected(true)
      setError(null)
    }
    const onDisconnect = () => {
      console.log(LOG, 'socket disconnected')
      setIsSocketConnected(false)
      setCurrentPeer(null)
      setRemoteStream(null)
      setIsSearching(false)
    }
    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    if (socket.connected) onConnect()
    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
    }
  }, [socket])

  useEffect(() => {
    const pc = peerConnection
    if (!pc) return

    const drain = () => {
      if (!pc.remoteDescription) return
      const batch = pendingIce.current.splice(0)
      batch.forEach(c => pc.addIceCandidate(new RTCIceCandidate(c)).catch(console.error))
    }

    const onTrack = (event: { streams: readonly MediaStream[] }) => {
      const ms = event.streams[0]
      if (ms) setRemoteStream(ms)
    }

    const onIce = (event: { candidate: RTCIceCandidate | null }) => {
      if (!event.candidate) return
      const peerId = peerRef.current
      if (!peerId) return
      socket.emit('ice-candidate', {
        candidate: event.candidate.toJSON(),
        to: peerId,
      })
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

    const handleUserFound = async ({ partnerId }: { partnerId: string }) => {
      const activePc = pcRef.current
      if (!socket.id || !activePc || !isUsable(activePc)) return
      peerRef.current = partnerId
      setCurrentPeer(partnerId)
      setIsSearching(false)
      pendingIce.current = []
      if (partnerId <= socket.id) return
      try {
        const offer = await activePc.createOffer({})
        await activePc.setLocalDescription(offer)
        if (isDating && userProfile) {
          socket.emit('call-user', { offer, to: partnerId, profile: userProfile })
        } else {
          socket.emit('call-user', { offer, to: partnerId })
        }
      } catch (err) {
        console.error(LOG, 'offer failed', err)
        setError('Failed to connect video')
      }
    }

    const handleCallMade = async ({ offer, from }: { offer: SignalingSessionDescription; from: string }) => {
      const activePc = pcRef.current
      if (!activePc || !isUsable(activePc)) return
      peerRef.current = from
      setCurrentPeer(from)
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
      if (activePc.signalingState === 'stable' && activePc.remoteDescription) {
        console.log(LOG, 'answer ignored — already stable')
        return
      }
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
  }, [peerConnection, socket, isDating, userProfile, restartConnection, resetPeerState])

  useEffect(() => {
    const onRemoteStreamState = ({ type, state }: { type: 'audio' | 'video'; state: boolean }) => {
      console.log(LOG, 'remote stream-state', type, state)
    }
    socket.on('stream-state-change', onRemoteStreamState)
    return () => {
      socket.off('stream-state-change', onRemoteStreamState)
    }
  }, [socket])

  const emitStreamState = useCallback(
    (type: 'audio' | 'video', enabled: boolean) => {
      const peerId = peerRef.current
      if (!peerId || !socket.connected) return
      socket.emit('stream-state-change', { type, state: enabled, to: peerId })
    },
    [socket],
  )

  const handleStartChat = useCallback(() => {
    if (!socket.connected || !stream) return
    setIsSearching(true)
    if (isDating && userProfile) {
      socket.emit('find-user', { mode: 'dating', profile: userProfile })
    } else {
      socket.emit('find-user')
    }
  }, [socket, stream, isDating, userProfile])

  const handleNextPerson = useCallback(() => {
    pendingIce.current = []
    if (currentPeer) restartConnection()
    setIsPeerConnected(false)
    setCurrentPeer(null)
    setRemoteStream(null)
    setIsSearching(true)
    setTimeout(() => {
      if (isDating && userProfile) {
        socket.emit('find-next-user', { mode: 'dating', profile: userProfile })
      } else {
        socket.emit('find-next-user')
      }
    }, 350)
  }, [currentPeer, restartConnection, socket, isDating, userProfile])

  const handleLeaveChat = useCallback(() => {
    Alert.alert('Leave chat?', 'Return to home?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: () => {
          socket.emit('leave-chat')
          resetPeerState()
          restartConnection()
        },
      },
    ])
  }, [socket, resetPeerState, restartConnection])

  return {
    isSocketConnected,
    currentPeer,
    remoteStream,
    isPeerConnected,
    isSearching,
    error,
    handleStartChat,
    handleNextPerson,
    handleLeaveChat,
    emitStreamState,
  }
}
