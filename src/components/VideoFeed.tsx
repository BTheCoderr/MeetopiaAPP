import { useState, useEffect } from 'react';
import axios from 'axios';
import InfiniteScroll from 'react-infinite-scroll-component';

interface Video {
  id: string;
  title: string;
  description?: string;
  url: string;
  thumbnailUrl?: string;
  views: number;
  likes: number;
  createdAt: string;
  user: {
    username: string;
    displayName?: string;
  };
  _count: {
    comments: number;
  };
}

interface VideoFeedProps {
  onVideoClick?: (video: Video) => void;
}

export default function VideoFeed({ onVideoClick }: VideoFeedProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchVideos = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const { data } = await axios.get(`/api/videos/feed?page=${page}`);
      if (data.videos.length === 0) {
        setHasMore(false);
      } else {
        setVideos((prev) => [...prev, ...data.videos]);
        setPage((prev) => prev + 1);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const formatCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <InfiniteScroll
      dataLength={videos.length}
      next={fetchVideos}
      hasMore={hasMore}
      loader={<div className="text-center py-4">Loading...</div>}
      endMessage={
        <div className="text-center py-4 text-gray-500">
          No more videos to load
        </div>
      }
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4"
    >
      {videos.map((video) => (
        <div
          key={video.id}
          className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transform transition hover:scale-105"
          onClick={() => onVideoClick?.(video)}
        >
          <div className="aspect-w-16 aspect-h-9">
            <video
              src={video.url}
              poster={video.thumbnailUrl}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-1 truncate">
              {video.title}
            </h3>
            <p className="text-gray-600 text-sm mb-2">
              {video.user.displayName || video.user.username}
            </p>
            <div className="flex items-center text-sm text-gray-500">
              <span>{formatCount(video.views)} views</span>
              <span className="mx-2">•</span>
              <span>{formatCount(video.likes)} likes</span>
              <span className="mx-2">•</span>
              <span>{formatCount(video._count.comments)} comments</span>
            </div>
          </div>
        </div>
      ))}
    </InfiniteScroll>
  );
} 