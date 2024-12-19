import React from 'react'
import type { Video } from '../lib/models/Video'

interface Props {
  video: Video
  onLike: () => void
}

export const VideoCard: React.FC<Props> = ({ video, onLike }) => {
  return (
    <div className="video-card">
      <video src={video.url} className="w-full" />
      <div className="video-controls">
        <button onClick={onLike}>Like ({video.likes})</button>
      </div>
    </div>
  )
} 