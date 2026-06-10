import { useEffect, useState } from 'react'
import { mediaDevices, MediaStream } from 'react-native-webrtc'

export function useMobileMedia() {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    let current: MediaStream | null = null

    async function start() {
      try {
        const s = await mediaDevices.getUserMedia({
          audio: true,
          video: {
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 },
          },
        })
        if (!active) {
          s.getTracks().forEach(t => t.stop())
          return
        }
        current = s
        setStream(s)
        setError(null)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Camera/mic permission denied')
      }
    }

    start()
    return () => {
      active = false
      current?.getTracks().forEach(t => t.stop())
    }
  }, [])

  return { stream, error }
}
