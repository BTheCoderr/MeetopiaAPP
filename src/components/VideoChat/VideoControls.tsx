'use client'

import React from 'react'

interface VideoControlsProps {
  isMuted: boolean
  isVideoOff: boolean
  onToggleMute: () => void
  onToggleVideo: () => void
  onNextPerson: () => void
}

export const VideoControls: React.FC<VideoControlsProps> = ({
  isMuted,
  isVideoOff,
  onToggleMute,
  onToggleVideo,
  onNextPerson
}) => {
  return (
    <div className="flex gap-4 p-4 bg-white rounded-lg shadow">
      <button
        onClick={onToggleMute}
        className={`p-3 rounded-full ${isMuted ? 'bg-red-500' : 'bg-gray-200'}`}
      >
        {isMuted ? 'Unmute' : 'Mute'}
      </button>
      <button
        onClick={onToggleVideo}
        className={`p-3 rounded-full ${isVideoOff ? 'bg-red-500' : 'bg-gray-200'}`}
      >
        {isVideoOff ? 'Start Video' : 'Stop Video'}
      </button>
      <button
        onClick={onNextPerson}
        className="p-3 rounded-full bg-blue-500 text-white"
      >
        Next Person
      </button>
    </div>
  )
} 