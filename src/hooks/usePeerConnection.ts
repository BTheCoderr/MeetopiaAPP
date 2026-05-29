'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { fallbackConfigurations } from '@/lib/iceServers'

const LOG = '[WebRTC:PeerConnection]'

interface UsePeerConnectionResult {
  peerConnection: RTCPeerConnection | null
  restartConnection: () => void
  connectionState: RTCPeerConnectionState | 'closed'
  configurationIndex: number
}

function isPeerConnectionUsable(pc: RTCPeerConnection): boolean {
  return (
    pc.connectionState !== 'closed' &&
    pc.signalingState !== 'closed'
  )
}

export function usePeerConnection(stream: MediaStream | null): UsePeerConnectionResult {
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null)
  const [configurationIndex, setConfigurationIndex] = useState(0)
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState | 'closed'>('closed')

  const streamRef = useRef<MediaStream | null>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const hadSuccessfulConnectionRef = useRef(false)
  const MAX_RECONNECT_ATTEMPTS = 3

  streamRef.current = stream

  const attachLocalTracks = useCallback((pc: RTCPeerConnection, mediaStream: MediaStream | null) => {
    if (!mediaStream || !isPeerConnectionUsable(pc)) return

    const senders = pc.getSenders()
    mediaStream.getTracks().forEach(track => {
      const sender = senders.find(s => s.track?.kind === track.kind)
      if (sender) {
        sender.replaceTrack(track).catch(err => {
          console.error(LOG, `replaceTrack(${track.kind}) failed:`, err)
        })
      } else if (isPeerConnectionUsable(pc)) {
        try {
          pc.addTrack(track, mediaStream)
          console.log(LOG, 'addTrack', track.kind)
        } catch (err) {
          console.error(LOG, `addTrack(${track.kind}) failed:`, err)
        }
      }
    })
  }, [])

  const createPeerConnection = useCallback((configIndex: number) => {
    const configuration = fallbackConfigurations[configIndex] ?? fallbackConfigurations[0]
    const pc = new RTCPeerConnection(configuration)
    peerConnectionRef.current = pc

    const onConnectionStateChange = () => {
      const state = pc.connectionState
      console.log(LOG, 'connectionState', state)
      setConnectionState(state)
      if (state === 'connected') {
        hadSuccessfulConnectionRef.current = true
      }
    }
    const onIceConnectionStateChange = () => {
      console.log(LOG, 'iceConnectionState', pc.iceConnectionState)
    }
    pc.addEventListener('connectionstatechange', onConnectionStateChange)
    pc.addEventListener('iceconnectionstatechange', onIceConnectionStateChange)

    attachLocalTracks(pc, streamRef.current)
    return pc
  }, [attachLocalTracks])

  const restartConnection = useCallback(() => {
    reconnectAttemptsRef.current += 1
    console.log(LOG, 'restartConnection attempt', reconnectAttemptsRef.current)

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
      peerConnectionRef.current = null
    }

    if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
      reconnectAttemptsRef.current = 0
      setConfigurationIndex(0)
      const pc = createPeerConnection(0)
      setPeerConnection(pc)
      return
    }

    const nextConfigIndex = (configurationIndex + 1) % fallbackConfigurations.length
    setConfigurationIndex(nextConfigIndex)
  }, [configurationIndex, createPeerConnection])

  // Create peer connection once per configurationIndex (not on every render)
  useEffect(() => {
    console.log(LOG, 'creating peer connection, config index', configurationIndex)
    const pc = createPeerConnection(configurationIndex)
    setPeerConnection(pc)

    return () => {
      console.log(LOG, 'closing peer connection (cleanup)')
      pc.close()
      if (peerConnectionRef.current === pc) {
        peerConnectionRef.current = null
      }
      setPeerConnection(null)
      setConnectionState('closed')
    }
  }, [configurationIndex, createPeerConnection])

  // Attach tracks when stream becomes available without recreating the PC
  useEffect(() => {
    const pc = peerConnectionRef.current
    if (!pc || !stream) return
    attachLocalTracks(pc, stream)
  }, [stream, attachLocalTracks, peerConnection])

  // Only auto-restart after a real failure post-connection — not during negotiation "disconnected"
  useEffect(() => {
    if (connectionState !== 'failed') return
    if (!hadSuccessfulConnectionRef.current) {
      console.log(LOG, 'ignoring failed state before first successful connection')
      return
    }

    console.log(LOG, 'connection failed after connect, scheduling restart')
    const timeoutId = window.setTimeout(() => {
      hadSuccessfulConnectionRef.current = false
      restartConnection()
    }, 2000)

    return () => window.clearTimeout(timeoutId)
  }, [connectionState, restartConnection])

  return {
    peerConnection,
    restartConnection,
    connectionState,
    configurationIndex,
  }
}
