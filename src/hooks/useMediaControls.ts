'use client'

import { useState, useEffect, useCallback } from 'react'
import { Socket } from 'socket.io-client'
import type { BandwidthQuality } from '@/types/videoChat'

interface UseMediaControlsOptions {
  stream: MediaStream | null
  peerConnection: RTCPeerConnection | null
  currentPeer: string | null
  socket: Socket | null
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>
  bandwidthQuality: BandwidthQuality
  isAdaptiveQuality: boolean
  onError?: (message: string) => void
}

export function useMediaControls({
  stream,
  peerConnection,
  currentPeer,
  socket,
  remoteVideoRef,
  bandwidthQuality,
  isAdaptiveQuality,
  onError,
}: UseMediaControlsOptions) {
  const [isMuted, setIsMuted] = useState(false)
  const [isCameraOff, setIsCameraOff] = useState(false)
  const [isRemoteMuted, setIsRemoteMuted] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user')
  const [canScreenShare, setCanScreenShare] = useState(false)

  useEffect(() => {
    setCanScreenShare(
      typeof navigator !== 'undefined' &&
      Boolean(navigator.mediaDevices?.getDisplayMedia)
    )
  }, [])

  const emitStreamState = useCallback((type: 'audio' | 'video', state: boolean) => {
    if (socket && currentPeer) {
      socket.emit('stream-state-change', { type, state, to: currentPeer })
    }
  }, [socket, currentPeer])

  const toggleLocalCamera = useCallback(() => {
    if (!stream) return
    const videoTrack = stream.getVideoTracks()[0]
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled
      setIsCameraOff(!videoTrack.enabled)
      emitStreamState('video', videoTrack.enabled)
    }
  }, [stream, emitStreamState])

  const toggleLocalMute = useCallback(() => {
    if (!stream) return
    const audioTrack = stream.getAudioTracks()[0]
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled
      setIsMuted(!audioTrack.enabled)
      emitStreamState('audio', audioTrack.enabled)
    }
  }, [stream, emitStreamState])

  const switchCamera = useCallback(async () => {
    if (!stream) return

    const nextFacingMode = facingMode === 'user' ? 'environment' : 'user'
    const currentVideoTrack = stream.getVideoTracks()[0]

    try {
      const replacementStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { exact: nextFacingMode } },
        audio: false,
      })
      const replacementTrack = replacementStream.getVideoTracks()[0]
      if (!replacementTrack) return

      replacementTrack.enabled = !isCameraOff

      if (peerConnection) {
        const sender = peerConnection.getSenders().find(sender => sender.track?.kind === 'video')
        if (sender) await sender.replaceTrack(replacementTrack)
      }

      if (currentVideoTrack) {
        stream.removeTrack(currentVideoTrack)
        currentVideoTrack.stop()
      }
      stream.addTrack(replacementTrack)
      setFacingMode(nextFacingMode)
    } catch (error) {
      console.error('Error switching camera:', error)
      onError?.('Meetopia could not switch cameras on this device.')
    }
  }, [stream, peerConnection, facingMode, isCameraOff])

  const toggleScreenShare = useCallback(async () => {
    try {
      if (isScreenSharing) {
        screenStream?.getTracks().forEach(track => track.stop())
        if (peerConnection && stream) {
          const cameraTrack = stream.getVideoTracks()[0]
          const sender = peerConnection.getSenders().find(s => s.track?.kind === 'video')
          if (sender && cameraTrack) await sender.replaceTrack(cameraTrack)
        }
        setIsScreenSharing(false)
        setScreenStream(null)
      } else {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false })
        setScreenStream(displayStream)
        setIsScreenSharing(true)
        if (peerConnection && currentPeer) {
          const videoTrack = displayStream.getVideoTracks()[0]
          const sender = peerConnection.getSenders().find(s => s.track?.kind === 'video')
          if (sender) await sender.replaceTrack(videoTrack)
          videoTrack.onended = () => {
            if (stream) {
              const cameraTrack = stream.getVideoTracks()[0]
              if (sender && cameraTrack) sender.replaceTrack(cameraTrack)
              setIsScreenSharing(false)
              setScreenStream(null)
            }
          }
        }
      }
    } catch (err) {
      console.error('Error toggling screen share:', err)
      setIsScreenSharing(false)
      setScreenStream(null)
      const message =
        err instanceof DOMException && err.name === 'NotAllowedError'
          ? 'Screen sharing was not allowed.'
          : 'Screen sharing is not available right now.'
      onError?.(message)
    }
  }, [isScreenSharing, screenStream, peerConnection, stream, currentPeer, onError])

  useEffect(() => {
    if (!currentPeer && screenStream) {
      screenStream.getTracks().forEach(track => track.stop())
      setIsScreenSharing(false)
      setScreenStream(null)
    }
  }, [currentPeer, screenStream])

  const toggleRemoteAudio = useCallback(() => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.muted = !remoteVideoRef.current.muted
      setIsRemoteMuted(remoteVideoRef.current.muted)
    }
  }, [remoteVideoRef])

  const toggleRemoteVideo = useCallback(() => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.style.display =
        remoteVideoRef.current.style.display === 'none' ? 'block' : 'none'
    }
  }, [remoteVideoRef])

  useEffect(() => {
    if (!peerConnection || !isAdaptiveQuality || !stream) return
    const applyQualityConstraints = async () => {
      const videoTrack = stream.getVideoTracks()[0]
      if (!videoTrack) return
      const constraints: MediaTrackConstraints = {}
      switch (bandwidthQuality) {
        case 'high':
          constraints.width = { ideal: 1280 }
          constraints.height = { ideal: 720 }
          constraints.frameRate = { max: 30 }
          break
        case 'medium':
          constraints.width = { ideal: 640 }
          constraints.height = { ideal: 480 }
          constraints.frameRate = { max: 24 }
          break
        case 'low':
          constraints.width = { ideal: 320 }
          constraints.height = { ideal: 240 }
          constraints.frameRate = { max: 15 }
          break
      }
      try {
        await videoTrack.applyConstraints(constraints)
      } catch (err) {
        console.error('Error applying quality constraints:', err)
      }
    }
    applyQualityConstraints()
  }, [bandwidthQuality, stream, peerConnection, isAdaptiveQuality])

  return {
    isMuted,
    isCameraOff,
    isRemoteMuted,
    isScreenSharing,
    canScreenShare,
    toggleLocalCamera,
    toggleLocalMute,
    switchCamera,
    toggleScreenShare,
    toggleRemoteAudio,
    toggleRemoteVideo,
  }
}
