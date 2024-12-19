import React, { useEffect, useRef, useState } from 'react'

interface VideoPlayerProps {
  src?: string
  muted?: boolean
  autoPlay?: boolean
  controls?: boolean
  className?: string
  useCamera?: boolean
  userName?: string
  likes?: number
  onLike?: () => void
  onDislike?: () => void
  onReport?: () => void
  onViewProfile?: () => void
  onMicToggle?: (isOn: boolean) => void
  onCameraToggle?: (isOn: boolean) => void
  initialMicState?: boolean
  initialCameraState?: boolean
  remoteStream?: MediaStream
  isRemoteActive?: boolean
  remoteUserName?: string
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  muted = false,
  autoPlay = true,
  controls = true,
  className = '',
  useCamera = false,
  userName = '',
  likes = 0,
  onLike,
  onDislike,
  onReport,
  onViewProfile,
  onMicToggle,
  onCameraToggle,
  initialMicState = true,
  initialCameraState = true,
  remoteStream,
  isRemoteActive = false,
  remoteUserName = 'Waiting for partner...'
}) => {
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState<string>('')
  const [isMicOn, setIsMicOn] = useState(initialMicState)
  const [isCameraOn, setIsCameraOn] = useState(initialCameraState)
  const [stream, setStream] = useState<MediaStream | null>(null)

  const toggleMicrophone = () => {
    if (stream) {
      const audioTracks = stream.getAudioTracks()
      audioTracks.forEach(track => {
        track.enabled = !isMicOn
      })
      setIsMicOn(!isMicOn)
      onMicToggle?.(!isMicOn)
    }
  }

  const toggleCamera = () => {
    if (stream) {
      const videoTracks = stream.getVideoTracks()
      videoTracks.forEach(track => {
        track.enabled = !isCameraOn
      })
      setIsCameraOn(!isCameraOn)
      onCameraToggle?.(!isCameraOn)
    }
  }

  useEffect(() => {
    if (useCamera && localVideoRef.current) {
      navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      })
      .then(mediaStream => {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = mediaStream
          setStream(mediaStream)
        }
      })
      .catch(err => {
        console.error('Error accessing media devices:', err)
        setError('Could not access camera/microphone')
      })

      return () => {
        if (stream) {
          stream.getTracks().forEach(track => track.stop())
        }
      }
    }
  }, [useCamera])

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream
    }
  }, [remoteStream])

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Local Video */}
      <div className="relative">
        <div className={`aspect-video bg-black rounded-lg overflow-hidden ${className}`}>
          <video
            ref={localVideoRef}
            muted={true} // Local video should always be muted
            autoPlay={autoPlay}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-white text-sm">
            You
          </div>
        </div>
        {/* Local Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70">
          <div className="flex justify-center space-x-4">
            <button 
              onClick={toggleMicrophone}
              className={`p-2 rounded-full ${isMicOn ? 'bg-green-500' : 'bg-red-500'}`}
            >
              {isMicOn ? '🎤' : '🔇'}
            </button>
            <button 
              onClick={toggleCamera}
              className={`p-2 rounded-full ${isCameraOn ? 'bg-green-500' : 'bg-red-500'}`}
            >
              {isCameraOn ? '📹' : '🚫'}
            </button>
          </div>
        </div>
      </div>

      {/* Remote Video */}
      <div className="relative">
        <div className={`aspect-video bg-black rounded-lg overflow-hidden ${className}`}>
          {isRemoteActive ? (
            <video
              ref={remoteVideoRef}
              autoPlay={true}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-white">
              {remoteUserName}
            </div>
          )}
          {isRemoteActive && (
            <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-white text-sm">
              {remoteUserName}
            </div>
          )}
        </div>
        {/* Remote User Controls */}
        {isRemoteActive && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70">
            <div className="flex justify-between">
              <button 
                onClick={onReport}
                className="text-red-500 hover:text-red-400"
              >
                Report
              </button>
              <button 
                onClick={onViewProfile}
                className="text-blue-500 hover:text-blue-400"
              >
                View Profile
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 