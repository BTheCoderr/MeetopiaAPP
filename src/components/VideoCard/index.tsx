import React from 'react'
import type { Video } from '@/lib/models/Video'

interface VideoCardProps {
  video: Video
  onLike: (videoId: string) => void
}

const VideoCard = ({ video, onLike }: VideoCardProps) => {
  return (
    <div className="video-card">
      <video src={video.url} className="w-full" />
      <div className="video-controls">
        <button onClick={() => onLike(video.id)}>Like ({video.likes})</button>
      </div>
    </div>
  )
}

export default VideoCard 