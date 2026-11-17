import { useCallback, useEffect, useRef, useState } from 'react'
import { MediaStream, RTCIceCandidate, RTCPeerConnection, RTCSessionDescription } from 'react-native-webrtc'
import type { Socket } from 'socket.io-client'
import { getAuthenticatedSocket } from '../lib/socket'
import { confirmVibeRoomServer } from '../lib/vibeRoomProtocol'
import { currentProduct } from '../lib/currentProduct'
import type { ChemistryIntroduction } from '../types/chemistryPassport'
import type { VibeRoomState } from '../types/vibeRoom'

type PeerEvents = {
  addEventListener: (name: string, listener: (...args: any[]) => void) => void
  removeEventListener: (name: string, listener: (...args: any[]) => void) => void
}

type Description = { type: string; sdp: string }
type Candidate = ConstructorParameters<typeof RTCIceCandidate>[0]
type MutualVibe = { partnerUserId: string | null; partnerDisplayName: string | null; connectionId: string | null; saved: boolean; error: string | null }
type Options = { stream: MediaStream | null; peerConnection: RTCPeerConnection | null; restartConnection: () => void; directConnectionId?: string | null; incomingCallId?: string | null }
const usable = (pc: RTCPeerConnection) => pc.signalingState !== 'closed' && pc.connectionState !== 'closed'

export function useCurrentMeetopiaSignaling({ stream, peerConnection, restartConnection, directConnectionId = null, incomingCallId = null }: Options) {
  const [socket, setSocket] = useState<Socket | null>(null), [connected, setConnected] = useState(false), [searching, setSearching] = useState(false)
  const [peerId, setPeerId] = useState<string | null>(null), [peerUserId, setPeerUserId] = useState<string | null>(null), [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [peerConnected, setPeerConnected] = useState(false), [hasVibed, setHasVibed] = useState(false), [mutualVibe, setMutualVibe] = useState<MutualVibe | null>(null)
  const [callStatus, setCallStatus] = useState<string | null>(null), [error, setError] = useState<string | null>(null)
  const [remoteCameraOff, setRemoteCameraOff] = useState(false), [remoteMicOff, setRemoteMicOff] = useState(false)
  const [introduction, setIntroduction] = useState<ChemistryIntroduction | null>(null)
  const [room, setRoom] = useState<VibeRoomState | null>(null)
  const peerRef = useRef<string | null>(null), pcRef = useRef(peerConnection), pendingIce = useRef<Candidate[]>([]), directAttempt = useRef<string | null>(null), incomingAttempt = useRef<string | null>(null)
  const searchGeneration = useRef(0)
  useEffect(() => { pcRef.current = peerConnection }, [peerConnection])
  const clearPeer = useCallback(() => { peerRef.current = null; pendingIce.current = []; setPeerId(null); setPeerUserId(null); setRemoteStream(null); setPeerConnected(false); setHasVibed(false); setMutualVibe(null); setSearching(false); setCallStatus(null); setRemoteCameraOff(false); setRemoteMicOff(false); setIntroduction(null); setRoom(null) }, [])

  useEffect(() => {
    let disposed = false
    let cleanup: (() => void) | null = null
    void getAuthenticatedSocket().then((sock) => {
      if (disposed) return; setSocket(sock); setConnected(sock.connected)
      const onConnect = () => { setConnected(true); setError(null) }, onDisconnect = () => { setConnected(false); clearPeer(); setError('Connection lost. Attempting to reconnect…') }
      const onMatchError = ({ message }: { message?: string }) => { setSearching(false); setError(message || 'Unable to start a Chemistry Check.') }
      const onMutual = async ({ partnerUserId, partnerDisplayName, connectionProof }: { partnerUserId?: string; partnerDisplayName?: string; connectionProof?: string }) => {
        setHasVibed(true)
        if (!connectionProof) return setMutualVibe({ partnerUserId: partnerUserId || null, partnerDisplayName: partnerDisplayName || null, connectionId: null, saved: false, error: 'Mutual Vibe confirmed, but this Connection could not be saved.' })
        try { const result = await currentProduct.connections.saveMutualVibe(connectionProof); setMutualVibe({ partnerUserId: partnerUserId || null, partnerDisplayName: partnerDisplayName || result.connection.person.displayName, connectionId: result.connection.id, saved: true, error: null }) }
        catch (e) { setMutualVibe({ partnerUserId: partnerUserId || null, partnerDisplayName: partnerDisplayName || null, connectionId: null, saved: false, error: e instanceof Error ? e.message : 'Failed to save Connection' }) }
      }
      const onSearchCancelled = () => { setSearching(false); setIntroduction(null) }
      const onIntroSearching = () => { setSearching(true); setIntroduction(null); setError(null) }
      const onIntroOffered = (invite: Omit<ChemistryIntroduction, 'accepted'>) => {
        setSearching(false); setError(null); setIntroduction({ ...invite, accepted: false })
      }
      const onIntroAccepted = ({ invitationId }: { invitationId: string }) => {
        setIntroduction(current => current?.invitationId === invitationId ? { ...current, accepted: true } : current)
      }
      const onIntroEnded = ({ reason }: { reason?: string }) => {
        setIntroduction(null); setSearching(false)
        if (reason) setError(reason)
      }
      const onIntroApproved = () => { setIntroduction(null); setError(null) }
      const onRoomState = (next: VibeRoomState) => setRoom(next)
      const onRoomEnded = () => setRoom(null)
      const onRoomError = ({ message }: { message?: string }) => setError(message || 'Unable to advance the Vibe Room.')
      const onCallRinging = () => { setSearching(true); setCallStatus('Calling your Connection…') }
      const onCallAccepted = () => { setSearching(false); setCallStatus('Connecting…') }
      const onCallDeclined = () => { setSearching(false); setCallStatus(null); setError('Your Connection declined the call.') }
      const onCallExpired = () => { setSearching(false); setCallStatus(null); setError('No answer. You can try again later.') }
      const onDirectUnavailable = ({ message }: { message?: string }) => {
        setSearching(false); setCallStatus(null)
        setError(message || 'Your Connection is not available for a call.')
      }
      const onRemoteMedia = ({ type, state }: { type?: string; state?: boolean }) => {
        if (type === 'audio') setRemoteMicOff(state === false)
        else if (type === 'video') setRemoteCameraOff(state === false)
      }
      const listeners: [string, (...args: any[]) => void][] = [
        ['connect', onConnect], ['disconnect', onDisconnect],
        ['match-error', onMatchError], ['search-cancelled', onSearchCancelled],
        ['introduction-searching', onIntroSearching], ['introduction-offered', onIntroOffered],
        ['introduction-response-recorded', onIntroAccepted],
        ['introduction-declined', onIntroEnded], ['introduction-cancelled', onIntroEnded],
        ['introduction-expired', onIntroEnded], ['introduction-approved', onIntroApproved],
        ['vibe-room-state', onRoomState], ['vibe-room-ended', onRoomEnded], ['vibe-room-error', onRoomError],
        ['mutual-vibe', onMutual], ['connection-call-ringing', onCallRinging],
        ['connection-call-accepted', onCallAccepted],
        ['connection-call-declined', onCallDeclined],
        ['connection-call-expired', onCallExpired],
        ['direct-call-unavailable', onDirectUnavailable],
        ['stream-state-change', onRemoteMedia],
      ]
      listeners.forEach(([event, handler]) => sock.on(event, handler))
      cleanup = () => listeners.forEach(([event, handler]) => sock.off(event, handler))
    }).catch((e) => { if (!disposed) setError(e instanceof Error ? e.message : 'Meetopia video authentication is unavailable.') })
    return () => { disposed = true; cleanup?.() }
  }, [clearPeer])

  useEffect(() => {
    if (!socket || !peerConnection) return
    const pc = peerConnection, drain = () => { if (pc.remoteDescription) pendingIce.current.splice(0).forEach((c) => pc.addIceCandidate(new RTCIceCandidate(c)).catch(console.error)) }
    const onTrack = (e: { streams: readonly MediaStream[] }) => { if (e.streams[0]) { setRemoteStream(e.streams[0]); setError(null) } }, onIce = (e: { candidate: RTCIceCandidate | null }) => { if (e.candidate && peerRef.current) socket.emit('ice-candidate', { candidate: e.candidate.toJSON(), to: peerRef.current }) }, onState = () => { setPeerConnected(pc.connectionState === 'connected'); if (pc.connectionState === 'failed' || pc.connectionState === 'closed') setRemoteStream(null) }
    const userFound = async ({ partnerId, partnerUserId }: { partnerId: string; partnerUserId?: string | null }) => {
      const active = pcRef.current
      if (!socket.id || !active || !usable(active)) return setError('Failed to establish video connection.')
      peerRef.current = partnerId
      setIntroduction(null)
      setPeerId(partnerId)
      setPeerUserId(partnerUserId || null)
      setSearching(false)
      setHasVibed(false)
      setMutualVibe(null)
      setRemoteCameraOff(false)
      setRemoteMicOff(false)
      pendingIce.current = []
      // The lower socket id creates the offer, matching the web Chemistry Check.
      if (partnerId <= socket.id) return
      const sendOffer = async (pc: RTCPeerConnection) => {
        if (!usable(pc) || pc.signalingState !== 'stable') throw new Error('Peer connection is not ready.')
        const offer = await pc.createOffer({})
        await pc.setLocalDescription(offer)
        socket.emit('call-user', { offer, to: partnerId })
      }
      try {
        await sendOffer(active)
      } catch {
        await new Promise(resolve => setTimeout(resolve, 300))
        const retry = pcRef.current
        if (!retry) return setError('Failed to establish video connection.')
        try { await sendOffer(retry) } catch { setError('Failed to establish video connection.') }
      }
    }
    const callMade = async ({ offer, from }: { offer: Description; from: string }) => { const active = pcRef.current; if (!active || !usable(active)) return; peerRef.current = from; setPeerId(from); try { await active.setRemoteDescription(new RTCSessionDescription(offer)); drain(); const answer = await active.createAnswer(); await active.setLocalDescription(answer); socket.emit('make-answer', { answer, to: from }) } catch { setError('Failed to establish video connection.') } }
    const answerMade = async ({ answer }: { answer: Description }) => { const active = pcRef.current; if (!active || !usable(active)) return; try { if (!(active.signalingState === 'stable' && active.remoteDescription)) { await active.setRemoteDescription(new RTCSessionDescription(answer)); drain() } } catch { setError('Failed to establish video connection.') } }
    const ice = ({ candidate }: { candidate: Candidate }) => { if (pc.remoteDescription) pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(console.error); else pendingIce.current.push(candidate) }
    const left = () => { clearPeer(); restartConnection() }
    ;(pc as unknown as PeerEvents).addEventListener('track', onTrack); (pc as unknown as PeerEvents).addEventListener('icecandidate', onIce); (pc as unknown as PeerEvents).addEventListener('connectionstatechange', onState); socket.on('user-found', userFound); socket.on('call-made', callMade); socket.on('answer-made', answerMade); socket.on('ice-candidate', ice); socket.on('peer-left', left)
    return () => { (pc as unknown as PeerEvents).removeEventListener('track', onTrack); (pc as unknown as PeerEvents).removeEventListener('icecandidate', onIce); (pc as unknown as PeerEvents).removeEventListener('connectionstatechange', onState); socket.off('user-found', userFound); socket.off('call-made', callMade); socket.off('answer-made', answerMade); socket.off('ice-candidate', ice); socket.off('peer-left', left) }
  }, [socket, peerConnection, clearPeer, restartConnection])

  useEffect(() => { if (!directConnectionId || incomingCallId || !socket?.connected || !peerConnection || directAttempt.current === directConnectionId) return; directAttempt.current = directConnectionId; setSearching(true); setError(null); void currentProduct.connections.callProof(directConnectionId).then(({ proof }) => socket.emit('call-connection', { proof })).catch((e) => { setSearching(false); setError(e instanceof Error ? e.message : 'Could not start this Connection call.') }) }, [directConnectionId, incomingCallId, socket, peerConnection])
  useEffect(() => { if (!incomingCallId || !socket?.connected || !peerConnection || incomingAttempt.current === incomingCallId) return; incomingAttempt.current = incomingCallId; setSearching(true); setCallStatus('Connecting your call…'); socket.emit('accept-connection-call', { inviteId: incomingCallId }) }, [incomingCallId, socket, peerConnection])
  const answerRound = useCallback((choice: string) => {
    if (socket?.connected && room && !room.completed && room.index === 1 && !room.myChoice) {
      socket.emit('vibe-room-answer', { sessionId: room.sessionId, choice })
    }
  }, [socket, room])
  const nextRound = useCallback(() => {
    if (socket?.connected && room && !room.ready && !room.completed) {
      socket.emit('vibe-room-next', { sessionId: room.sessionId })
    }
  }, [socket, room])
  const start = useCallback(() => {
    if (!socket?.connected || !stream) return
    const requestId = ++searchGeneration.current
    setSearching(true); setError(null); setIntroduction(null)
    void confirmVibeRoomServer(socket).then(supported => {
      if (requestId !== searchGeneration.current) return
      if (!supported || !socket.connected) {
        setSearching(false)
        setError('The Vibe Room server needs to be updated before you can start a Chemistry Check.')
        return
      }
      socket.emit('find-user')
    })
  }, [socket, stream])
  const cancel = useCallback(() => {
    searchGeneration.current += 1
    socket?.emit('cancel-search'); setSearching(false); setIntroduction(null)
  }, [socket])
  const next = useCallback(() => {
    const requestId = ++searchGeneration.current
    pendingIce.current = []
    if (peerRef.current) restartConnection()
    clearPeer()
    setSearching(true)
    setTimeout(() => {
      if (!socket?.connected || requestId !== searchGeneration.current) return
      void confirmVibeRoomServer(socket).then(supported => {
        if (requestId !== searchGeneration.current) return
        if (!supported || !socket.connected) {
          setSearching(false)
          setError('The Vibe Room server needs an update before another introduction.')
          return
        }
        socket.emit('find-next-user')
      })
    }, 350)
  }, [socket, restartConnection, clearPeer])
  const acceptIntroduction = useCallback(() => { if (socket?.connected && introduction && !introduction.accepted) socket.emit('introduction-response', { invitationId: introduction.invitationId, accept: true }) }, [socket, introduction]), declineIntroduction = useCallback(() => { if (socket?.connected && introduction) socket.emit('introduction-response', { invitationId: introduction.invitationId, accept: false }); setIntroduction(null); setSearching(false) }, [socket, introduction]), vibe = useCallback(() => { if (socket?.connected && peerRef.current && room?.completed && !hasVibed) { socket.emit('vibe-tap', { to: peerRef.current }); setHasVibed(true) } }, [socket, room, hasVibed]), leave = useCallback(() => { searchGeneration.current += 1; socket?.emit('leave-chat'); clearPeer(); restartConnection() }, [socket, clearPeer, restartConnection]), streamState = useCallback((type: 'audio' | 'video', state: boolean) => { if (socket?.connected && peerRef.current) socket.emit('stream-state-change', { type, state, to: peerRef.current }) }, [socket])
  return { socket, connected, searching, introduction, acceptIntroduction, declineIntroduction, room, answerRound, nextRound, peerId, peerUserId, remoteStream, remoteCameraOff, remoteMicOff, peerConnected, hasVibed, mutualVibe, callStatus, error, start, cancel, next, vibe, leave, streamState, dismissMutualVibe: () => setMutualVibe(null) }
}
