'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Video {
  id: string;
  title: string;
  description: string;
  url: string;
  createdAt: string;
  userId: string;
  user?: {
    username: string;
    displayName: string;
  };
}

export default function VideoFeedPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch('/api/videos/feed');
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch videos');
        }
        
        setVideos(data.videos);
      } catch (error) {
        console.error('Error fetching videos:', error);
        setError('Failed to load videos');
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-white">Loading videos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] p-8">
        <div className="text-red-500 bg-red-500/10 border border-red-500/50 rounded-lg p-4">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text">
            Video Feed
          </h1>
          <button
            onClick={() => router.push('/chat/upload')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Upload Video
          </button>
        </div>

        {videos.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <p>No videos uploaded yet.</p>
            <button
              onClick={() => router.push('/chat/upload')}
              className="mt-4 text-blue-400 hover:text-blue-500"
            >
              Upload your first video
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div
                key={video.id}
                className="bg-[#2a2a2a] rounded-lg border border-[#333] overflow-hidden hover:border-blue-500/50 transition-colors"
              >
                <video
                  src={video.url}
                  className="w-full aspect-video object-cover bg-[#1a1a1a]"
                  controls
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {video.title}
                  </h3>
                  {video.description && (
                    <p className="text-gray-400 text-sm mb-2">
                      {video.description}
                    </p>
                  )}
                  <div className="flex justify-between items-center">
                    <p className="text-gray-500 text-xs">
                      {new Date(video.createdAt).toLocaleDateString()}
                    </p>
                    {video.user && (
                      <p className="text-gray-400 text-sm">
                        {video.user.displayName || video.user.username}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 