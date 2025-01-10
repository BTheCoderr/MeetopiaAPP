'use client';

import { useState, useEffect } from 'react';
import AgoraRTC, {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
} from 'agora-rtc-sdk-ng';
import axios from 'axios';

interface LiveStreamProps {
  onEnd?: () => void;
}

export default function LiveStream({ onEnd }: LiveStreamProps) {
  const [client, setClient] = useState<IAgoraRTCClient | null>(null);
  const [localTracks, setLocalTracks] = useState<{
    videoTrack: ICameraVideoTrack | null;
    audioTrack: IMicrophoneAudioTrack | null;
  }>({
    videoTrack: null,
    audioTrack: null,
  });
  const [streaming, setStreaming] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [viewers, setViewers] = useState(0);
  const [messages, setMessages] = useState<Array<{
    text: string;
    user: string;
    timestamp: Date;
  }>>([]);
  const [messageInput, setMessageInput] = useState('');

  useEffect(() => {
    const initAgora = async () => {
      const agoraClient = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });
      setClient(agoraClient);
    };

    initAgora();

    return () => {
      if (streaming) {
        handleEndStream();
      }
    };
  }, []);

  const handleStartStream = async () => {
    if (!client || !title) return;

    try {
      // Get stream token and channel from backend
      const { data } = await axios.post('/api/live/start', {
        title,
        description,
      });

      const { channelName, token, appId } = data;

      // Initialize tracks
      const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
      setLocalTracks({
        audioTrack,
        videoTrack,
      });

      // Join channel
      await client.join(appId, channelName, token);
      await client.setClientRole('host');

      // Publish tracks
      await client.publish([audioTrack, videoTrack]);

      setStreaming(true);

      // Set up user joined/left listeners
      client.on('user-joined', () => {
        setViewers((prev) => prev + 1);
      });

      client.on('user-left', () => {
        setViewers((prev) => Math.max(0, prev - 1));
      });
    } catch (error) {
      console.error('Error starting stream:', error);
      alert('Failed to start stream. Please try again.');
    }
  };

  const handleEndStream = async () => {
    if (!client || !localTracks.audioTrack || !localTracks.videoTrack) return;

    // Stop tracks
    localTracks.audioTrack.stop();
    localTracks.videoTrack.stop();
    await localTracks.audioTrack.close();
    await localTracks.videoTrack.close();

    // Leave channel
    await client.leave();

    setLocalTracks({
      audioTrack: null,
      videoTrack: null,
    });
    setStreaming(false);
    setViewers(0);
    onEnd?.();
  };

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;

    const newMessage = {
      text: messageInput.trim(),
      user: 'You',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessageInput('');
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      {!streaming ? (
        <div className="mb-4">
          <input
            type="text"
            placeholder="Stream Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded mb-2"
          />
          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded mb-2"
          />
          <button
            onClick={handleStartStream}
            disabled={!title}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Start Streaming
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3">
            <div className="aspect-w-16 aspect-h-9 bg-black rounded-lg overflow-hidden">
              {localTracks.videoTrack && (
                <div ref={(ref) => ref && localTracks.videoTrack?.play(ref)} />
              )}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">{title}</h2>
                <p className="text-gray-500">{viewers} watching</p>
              </div>
              <button
                onClick={handleEndStream}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                End Stream
              </button>
            </div>
          </div>
          <div className="lg:col-span-1 bg-white rounded-lg shadow p-4">
            <div className="h-[400px] flex flex-col">
              <div className="flex-1 overflow-y-auto mb-4">
                {messages.map((message, index) => (
                  <div key={index} className="mb-2">
                    <span className="font-semibold">{message.user}: </span>
                    <span>{message.text}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 p-2 border rounded"
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 