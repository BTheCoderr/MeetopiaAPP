'use client'
import { useEffect, useState } from 'react'

const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ]
}

export function usePeerConnection(stream: MediaStream | null) {
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null)

  useEffect(() => {
    const pc = new RTCPeerConnection(configuration)
    setPeerConnection(pc)

    if (stream) {
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream)
        console.log('Added track to peer connection:', track.kind)
      })
    }

    return () => {
      pc.close()
      setPeerConnection(null)
    }
  }, [stream])

  return { peerConnection }
} 