import { Video } from '@/lib/models/Video'

interface VideoCardProps {
  video: Video
  onLike?: () => void
}

export default function VideoCard({ video, onLike }: VideoCardProps) {
  return (
    <div className="video-card">
      <video src={video.url} className="w-full" />
      <div className="p-4">
        <h3 className="text-lg font-semibold">{video.title}</h3>
        {video.description && (
          <p className="text-gray-600 mt-1">{video.description}</p>
        )}
        <div className="flex justify-between items-center mt-2">
          <span className="text-sm text-gray-500">
            {new Date(video.createdAt).toLocaleDateString()}
          </span>
          {onLike && (
            <button 
              onClick={onLike}
              className="text-blue-500 hover:text-blue-600"
            >
              Like
            </button>
          )}
        </div>
      </div>
    </div>
  )
} 