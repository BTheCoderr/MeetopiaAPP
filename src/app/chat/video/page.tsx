'use client'
import { useState, useRef, useEffect } from 'react'
import ChatLayout from '@/components/ChatLayout'
import { io, Socket } from 'socket.io-client'

interface ConnectionStats {
  quality: 'good' | 'fair' | 'poor';
  latency?: number;
  packetLoss?: number;
}

const createPeerConnection = () => {
  return new RTCPeerConnection({
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ]
  });
}

export default function VideoChatPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [connectionStats, setConnectionStats] = useState<ConnectionStats | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const socketRef = useRef<Socket>();
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const [localVideoDrag, setLocalVideoDrag] = useState(() => {
    if (typeof window === 'undefined') return { x: 680, y: 20 };
    return {
      x: window.innerWidth - 380,
      y: 120  // Position below the status bar
    };
  });

  const videoConstraints = {
    video: {
      width: { min: 1280, ideal: 1920, max: 2560 },
      height: { min: 720, ideal: 1080, max: 1440 },
      frameRate: { min: 24, ideal: 30, max: 60 }
    },
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true
    }
  };

  const handleRetry = async () => {
    setConnectionError(null);
    if (socketRef.current) {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        socketRef.current.emit('find-video-user');
        setIsWaiting(true);
      } catch (err) {
        console.error('Error accessing media devices:', err);
        setConnectionError('Failed to access camera/microphone. Please check permissions.');
      }
    }
  };

  const setupPeerConnection = async (initiator: boolean, partnerId: string) => {
    if (!localStreamRef.current) return;

    const pc = createPeerConnection();
    peerConnectionRef.current = pc;

    localStreamRef.current.getTracks().forEach(track => {
      if (localStreamRef.current) {
        pc.addTrack(track, localStreamRef.current);
      }
    });

    pc.ontrack = (event) => {
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit('video-ice-candidate', {
          candidate: event.candidate,
          to: partnerId
        });
      }
    };

    if (initiator && socketRef.current) {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socketRef.current.emit('video-offer', {
          offer,
          to: partnerId
        });
      } catch (err) {
        console.error('Error creating offer:', err);
        setConnectionError('Failed to create connection offer');
      }
    }

    return pc;
  };

  useEffect(() => {
    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3003';
    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
      setConnectionError(null);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
      setConnectionError('Lost connection to server');
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setConnectionError('Failed to connect to server');
    });

    socket.on('video-user-found', async ({ partnerId }) => {
      console.log('Found video partner:', partnerId);
      setIsWaiting(false);
      const isInitiator = socket.id && socket.id > partnerId;
      await setupPeerConnection(isInitiator || false, partnerId);
    });

    socket.on('video-offer-received', async ({ offer, from }) => {
      if (!peerConnectionRef.current) {
        await setupPeerConnection(false, from);
      }
      const pc = peerConnectionRef.current;
      if (pc && socketRef.current) {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socketRef.current.emit('video-answer', {
            answer,
            to: from
          });
        } catch (err) {
          console.error('Error handling offer:', err);
          setConnectionError('Failed to handle connection offer');
        }
      }
    });

    socket.on('video-answer-received', async ({ answer, from }) => {
      const pc = peerConnectionRef.current;
      if (pc) {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (err) {
          console.error('Error handling answer:', err);
          setConnectionError('Failed to handle connection answer');
        }
      }
    });

    socket.on('video-ice-candidate', async ({ candidate, from }) => {
      const pc = peerConnectionRef.current;
      if (pc) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error('Error adding ICE candidate:', err);
        }
      }
    });

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia(videoConstraints)
      .then((stream) => {
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        console.error('Error accessing media devices:', err);
        setConnectionError('Failed to access camera/microphone. Please check permissions.');
      });

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, []);

  const handleStart = () => {
    if (!socketRef.current) return;
    setIsWaiting(true);
    socketRef.current.emit('find-video-user');
  };

  const handleNext = () => {
    if (!socketRef.current) return;
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    setIsWaiting(true);
    socketRef.current.emit('find-video-user');
  };

  const handleLeave = () => {
    if (socketRef.current) {
      socketRef.current.emit('leave-video');
      socketRef.current.disconnect();
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    window.location.href = '/';
  };

  useEffect(() => {
    const handleResize = () => {
      setLocalVideoDrag(prev => ({
        x: window.innerWidth - 380,
        y: 120  // Keep consistent with initial position
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getConnectionStatusClass = () => {
    if (!isConnected) return 'bg-red-500/20 text-red-400';
    if (isWaiting) return 'bg-yellow-500/20 text-yellow-400';
    return 'bg-green-500/20 text-green-400';
  };

  const getConnectionStatusText = () => {
    if (!isConnected) return 'Not Connected';
    if (isWaiting) return 'Almost There...';
    return 'Connected';
  };

  return (
    <ChatLayout
      onStart={handleStart}
      onNext={handleNext}
      onLeave={handleLeave}
      isConnected={isConnected}
      isWaiting={isWaiting}
      connectionError={connectionError}
      connectionStats={connectionStats}
      onRetry={handleRetry}
    >
      <div className="h-[600px] p-4 flex flex-col">
        <div className={`absolute top-4 right-4 px-3 py-1 rounded-full ${getConnectionStatusClass()}`}>
          {getConnectionStatusText()}
        </div>
        <div className="grid grid-cols-2 gap-4 h-[500px]">
          <div className="relative">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover rounded-lg bg-gray-900"
            />
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
              You
            </div>
          </div>

          <div className="relative">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover rounded-lg bg-gray-900"
            />
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
              Partner
            </div>
            {!isConnected && (
              <div className="absolute inset-0 flex items-center justify-center text-white bg-gray-900 bg-opacity-75 rounded-lg">
                {isWaiting ? 'Waiting for partner...' : 'Start chat!'}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 flex justify-center gap-4">
          <button className="p-3 bg-gray-200 rounded-full hover:bg-gray-300">
            🎤
          </button>
          <button className="p-3 bg-gray-200 rounded-full hover:bg-gray-300">
            📷
          </button>
        </div>
      </div>
    </ChatLayout>
  );
}