import { useCallback, useEffect, useRef, useState } from 'react'
import { MediaStream, RTCIceCandidate, RTCPeerConnection, RTCSessionDescription } from 'react-native-webrtc'
import type { Socket } from 'socket.io-client'
import { getAuthenticatedSocket } from '../lib/socket'
import { currentProduct } from '../lib/currentProduct'

type Description = { type: string; sdp: string }
type Candidate = ConstructorParameters<typeof RTCIceCandidate>[0]

type MutualVibe = {
  partnerUserId: string | null
  partnerDisplayName: string | null
  connectionId: string | null
  saved: boolean
  error: string | null
}

type Options = {
  stream: MediaStream | null
  peerConnection: RTCPeerConnection | null
  restartConnection: () => void
  directConnectionId?: string | null
  incomingCallId?: string | null
}

const usable = (pc: RTCPeerConnection) => pc.signalingState !== 'closed' && pc.connectionState !== 'closed'

export function useCurrentMeetopiaSignaling({ stream, peerConnection, restartConnection, directConnectionId = null, incomingCallId = null }: Options) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [searching, setSearching] = useState(false)
  const [peerId, setPeerId] = useState<string | null>(null)
  const [peerUserId, setPeerUserId] = useState<string | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [peerConnected, setPeerConnected] = useState(false)
  const [hasVibed, setHasVibed] = useState(false)
  const [mutualVibe, setMutualVibe] = useState<MutualVibe | null>(null)
  const [callStatus, setCallStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const peerRef = useRef<string | null>(null)
  const pcRef = useRef(peerConnection)
  const pendingIce = useRef<Candidate[]>([])
  const directAttempt = useRef<string | null>(null)
  const incomingAttempt = useRef<string | null>(null)

  useEffect(() => { pcRef.current = peerConnection }, [peerConnection])

  const clearPeer = useCallback(() => {
    peerRef.current = null
    pendingIce.current = []
    setPeerId(null); setPeerUserId(null); setRemoteStream(null); setPeerConnected(false)
    setHasVibed(false); setMutualVibe(null); setSearching(false); setCallStatus(null)
  }, [])

  useEffect(() => {
    let disposed = false
    let active: Socket | null = null
    void getAuthenticatedSocket().then((sock) => {
      if (disposed) return
      active = sock; setSocket(sock); setConnected(sock.connected)
      const onConnect = () => { setConnected(true); setError(null) }
      const onDisconnect = () => { setConnected(false); clearPeer(); setError('Connection lost. Attempting to reconnect…') }
      const onMatchError = ({ message }: { message?: string }) => { setSearching(false); setError(message || 'Unable to start a Chemistry Check.') }
      const onMutual = async ({ partnerUserId, partnerDisplayName, connectionProof }: { partnerUserId?: string; partnerDisplayName?: string; connectionProof?: string }) => {
        setHasVibed(true)
        if (!connectionProof) return setMutualVibe({ partnerUserId: partnerUserId || null, partnerDisplayName: partnerDisplayName || null, connectionId: null, saved: false, error: 'Mutual Vibe confirmed, but this Connection could not be saved.' })
        try {
          const result = await currentProduct.connections.saveMutualVibe(connectionProof)
          setMutualVibe({ partnerUserId: partnerUserId || null, partnerDisplayName: partnerDisplayName || result.connection.person.displayName, connectionId: result.connection.id, saved: true, error: null })
        } catch (e) {
          setMutualVibe({ partnerUserId: partnerUserId || null, partnerDisplayName: partnerDisplayName || null, connectionId: null, saved: false, error: e instanceof Error ? e.message : 'Failed to save Connection' })
        }
      }
      sock.on('connect', onConnect); sock.on('disconnect', onDisconnect); sock.on('match-error', onMatchError)
      sock.on('search-cancelled', () => setSearching(false)); sock.on('mutual-vibe', onMutual)
      sock.on('connection-call-ringing', () => { setSearching(true); setCallStatus('Calling your Connection…') })
      sock.on('connection-call-accepted', () => { setSearching(false); setCallStatus('Connecting…') })
      sock.on('connection-call-declined', () => { setSearching(false); setCallStatus(null); setError('Your Connection declined the call.') })
      sock.on('connection-call-expired', () => { setSearching(false); setCallStatus(null); setError('No answer. You can try again later.') })
    }).catch((e) => setError(e instanceof Error ? e.message : 'Meetopia video authentication is unavailable.'))
    return () => { disposed = true; if (active) { active.off('connect'); active.off('disconnect'); active.off('match-error'); active.off('search-cancelled'); active.off('mutual-vibe'); active.off('connection-call-ringing'); active.off('connection-call-accepted'); active.off('connection-call-declined'); active.off('connection-call-expired') } }
  }, [clearPeer])

  useEffect(() => {
    if (!socket || !peerConnection) return
    const pc = peerConnection
    const drain = () => { if (pc.remoteDescription) pendingIce.current.splice(0).forEach((c) => pc.addIceCandidate(new RTCIceCandidate(c)).catch(console.error)) }
    const onTrack = (e: { streams: readonly MediaStream[] }) => { if (e.streams[0]) { setRemoteStream(e.streams[0]); setError(null) } }
    const onIce = (e: { candidate: RTCIceCandidate | null }) => { if (e.candidate && peerRef.current) socket.emit('ice-candidate', { candidate: e.candidate.toJSON(), to: peerRef.current }) }
    const onState = () => { setPeerConnected(pc.connectionState === 'connected'); if (pc.connectionState === 'failed' || pc.connectionState === 'closed') setRemoteStream(null) }
    const userFound = async ({ partnerId, partnerUserId }: { partnerId: string; partnerUserId?: string | null }) => {
      const active = pcRef.current
      if (!socket.id || !active || !usable(active)) return setError('Failed to establish video connection.')
      peerRef.current = partnerId; setPeerId(partnerId); setPeerUserId(partnerUserId || null); setSearching(false); setHasVibed(false); setMutualVibe(null); pendingIce.current = []
      if (partnerId <= socket.id || active.signalingState !== 'stable') return
      try { const offer = await active.createOffer({}); await active.setLocalDescription(offer); socket.emit('call-user', { offer, to: partnerId }) } catch { setError('Failed to establish video connection.') }
    }
    const callMade = async ({ offer, from }: { offer: Description; from: string }) => {
      const active = pcRef.current; if (!active || !usable(active)) return
      peerRef.current = from; setPeerId(from)
      try { await active.setRemoteDescription(new RTCSessionDescription(offer)); drain(); const answer = await active.createAnswer(); await active.setLocalDescription(answer); socket.emit('make-answer', { answer, to: from }) } catch { setError('Failed to establish video connection.') }
    }
    const answerMade = async ({ answer }: { answer: Description }) => { const active = pcRef.current; if (!active || !usable(active)) return; try { if (!(active.signalingState === 'stable' && active.remoteDescription)) { await active.setRemoteDescription(new RTCSessionDescription(answer)); drain() } } catch { setError('Failed to establish video connection.') } }
    const ice = ({ candidate }: { candidate: Candidate }) => { if (pc.remoteDescription) pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(console.error); else pendingIce.current.push(candidate) }
    const left = () => { clearPeer(); restartConnection() }
    pc.addEventListener('track', onTrack); pc.addEventListener('icecandidate', onIce); pc.addEventListener('connectionstatechange', onState)
    socket.on('user-found', userFound); socket.on('call-made', callMade); socket.on('answer-made', answerMade); socket.on('ice-candidate', ice); socket.on('peer-left', left)
    return () => { pc.removeEventListener('track', onTrack); pc.removeEventListener('icecandidate', onIce); pc.removeEventListener('connectionstatechange', onState); socket.off('user-found', userFound); socket.off('call-made', callMade); socket.off('answer-made', answerMade); socket.off('ice-candidate', ice); socket.off('peer-left', left) }
  }, [socket, peerConnection, clearPeer, restartConnection])

  useEffect(() => {
    if (!directConnectionId || incomingCallId || !socket?.connected || !peerConnection || directAttempt.current === directConnectionId) return
    directAttempt.current = directConnectionId; setSearching(true); setError(null)
    void currentProduct.connections.callProof(directConnectionId).then(({ callProof }) => socket.emit('call-connection', { proof: callProof })).catch((e) => { setSearching(false); setError(e instanceof Error ? e.message : 'Could not start this Connection call.') })
  }, [directConnectionId, incomingCallId, socket, peerConnection])

  useEffect(() => {
    if (!incomingCallId || !socket?.connected || !peerConnection || incomingAttempt.current === incomingCallId) return
    incomingAttempt.current = incomingCallId; setSearching(true); setCallStatus('Connecting your call…'); socket.emit('accept-connection-call', { inviteId: incomingCallId })
  }, [incomingCallId, socket, peerConnection])

  const start = useCallback(() => { if (socket?.connected && stream) { setSearching(true); setError(null); socket.emit('find-user') } }, [socket, stream])
  const cancel = useCallback(() => { socket?.emit('cancel-search'); setSearching(false) }, [socket])
  const next = useCallback(() => { pendingIce.current = []; if (peerRef.current) restartConnection(); clearPeer(); setSearching(true); setTimeout(() => socket?.emit('find-next-user'), 350) }, [socket, restartConnection, clearPeer])
  const vibe = useCallback(() => { if (socket?.connected && peerRef.current && !hasVibed) { socket.emit('vibe-tap', { to: peerRef.current }); setHasVibed(true) } }, [socket, hasVibed])
  const leave = useCallback(() => { socket?.emit('leave-chat'); clearPeer(); restartConnection() }, [socket, clearPeer, restartConnection])
  const streamState = useCallback((type: 'audio' | 'video', state: boolean) => { if (socket?.connected && peerRef.current) socket.emit('stream-state-change', { type, state, to: peerRef.current }) }, [socket])

  return { socket, connected, searching, peerId, peerUserId, remoteStream, peerConnected, hasVibed, mutualVibe, callStatus, error, start, cancel, next, vibe, leave, streamState, dismissMutualVibe: () => setMutualVibe(null) }
}
