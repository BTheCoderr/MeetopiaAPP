'use client'

import { useState, useEffect } from 'react'
import type { PermissionStatus } from '@/types/videoChat'

export function useLocalMediaStream(
  localVideoRef: React.RefObject<HTMLVideoElement | null>,
  setError: (error: string | null) => void
) {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [permissionStatus, setPermissionStatus] = useState<{
    camera: PermissionStatus
    microphone: PermissionStatus
  }>({ camera: 'pending', microphone: 'pending' })

  useEffect(() => {
    let currentStream: MediaStream | null = null

    async function setupMedia() {
      try {
        try {
          currentStream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { min: 1280, ideal: 1920, max: 2560 },
              height: { min: 720, ideal: 1080, max: 1440 },
              frameRate: { min: 24, ideal: 30, max: 60 },
              aspectRatio: { ideal: 1.7777777778 },
              facingMode: 'user',
            },
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
              sampleRate: 48000,
              sampleSize: 16,
              channelCount: 1,
            },
          })
        } catch {
          currentStream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { min: 640, ideal: 1280, max: 1920 },
              height: { min: 480, ideal: 720, max: 1080 },
              frameRate: { min: 20, ideal: 24 },
              aspectRatio: { ideal: 1.7777777778 },
              facingMode: 'user',
            },
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          })
        }
        setStream(currentStream)
        setPermissionStatus({ camera: 'granted', microphone: 'granted' })
        if (localVideoRef.current) localVideoRef.current.srcObject = currentStream
      } catch (err: unknown) {
        try {
          currentStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
          setStream(currentStream)
          if (localVideoRef.current) localVideoRef.current.srcObject = currentStream
        } catch {
          const error = err as { name?: string }
          if (error.name === 'NotAllowedError') {
            setPermissionStatus({ camera: 'denied', microphone: 'denied' })
            setError('Camera or microphone access denied. Please allow access in your browser settings and refresh the page.')
          } else {
            setError('Failed to access camera/microphone. Please check your device connections and try again.')
          }
        }
      }
    }

    setupMedia()
    return () => {
      currentStream?.getTracks().forEach(track => track.stop())
    }
  }, [localVideoRef, setError])

  return { stream, permissionStatus }
}
