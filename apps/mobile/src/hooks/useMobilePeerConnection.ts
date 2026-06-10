import { useCallback, useEffect, useRef, useState } from 'react'
import { MediaStream, RTCPeerConnection } from 'react-native-webrtc'
import { fallbackConfigurations } from '@/lib/iceServers'

const LOG = '[Mobile:PeerConnection]'

function isUsable(pc: RTCPeerConnection): boolean {
  return pc.signalingState !== 'closed' && pc.connectionState !== 'closed'
}

export function useMobilePeerConnection(stream: MediaStream | null) {
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null)
  const [configurationIndex, setConfigurationIndex] = useState(0)
  const streamRef = useRef<MediaStream | null>(null)
  const pcRef = useRef<RTCPeerConnection | null>(null)

  streamRef.current = stream

  const attachLocalTracks = useCallback((pc: RTCPeerConnection, mediaStream: MediaStream | null) => {
    if (!mediaStream || !isUsable(pc)) return
    const senders = pc.getSenders()
    mediaStream.getTracks().forEach(track => {
      const sender = senders.find(s => s.track?.kind === track.kind)
      if (sender) {
        sender.replaceTrack(track).catch(err => console.error(LOG, 'replaceTrack', err))
      } else {
        try {
          pc.addTrack(track, mediaStream)
        } catch (err) {
          console.error(LOG, 'addTrack', err)
        }
      }
    })
  }, [])

  const createPeerConnection = useCallback(
    (configIndex: number) => {
      const config = fallbackConfigurations[configIndex] ?? fallbackConfigurations[0]
      const pc = new RTCPeerConnection(config)
      pcRef.current = pc
      attachLocalTracks(pc, streamRef.current)
      return pc
    },
    [attachLocalTracks],
  )

  const restartConnection = useCallback(() => {
    pcRef.current?.close()
    const nextIndex = Math.min(configurationIndex + 1, fallbackConfigurations.length - 1)
    setConfigurationIndex(nextIndex)
    const pc = createPeerConnection(nextIndex)
    setPeerConnection(pc)
  }, [configurationIndex, createPeerConnection])

  useEffect(() => {
    const pc = createPeerConnection(configurationIndex)
    setPeerConnection(pc)
    return () => {
      pc.close()
      pcRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (peerConnection && stream) attachLocalTracks(peerConnection, stream)
  }, [peerConnection, stream, attachLocalTracks])

  return { peerConnection, restartConnection }
}
