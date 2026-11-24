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
  const configurationIndex = 0
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState | 'closed'>('closed')

  const streamRef = useRef<MediaStream | null>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)

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
      if (peerConnectionRef.current === pc) setConnectionState(state)
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
    const old = peerConnectionRef.current
    peerConnectionRef.current = null
    old?.close()
    setConnectionState('closed')
    const pc = createPeerConnection(0)
    setPeerConnection(pc)
  }, [createPeerConnection])

  useEffect(() => {
    restartConnection()
    return () => {
      const pc = peerConnectionRef.current
      peerConnectionRef.current = null
      pc?.close()
    }
  }, [restartConnection])

  // Attach tracks when stream becomes available without recreating the PC
  useEffect(() => {
    const pc = peerConnectionRef.current
    if (!pc || !stream) return
    attachLocalTracks(pc, stream)
  }, [stream, attachLocalTracks, peerConnection])

  return {
    peerConnection,
    restartConnection,
    connectionState,
    configurationIndex,
  }
}
