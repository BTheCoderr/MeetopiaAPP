import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { Alert, Platform } from 'react-native';
import { Camera } from 'expo-camera';
import * as Audio from 'expo-audio';
import { useAuth } from './AuthContext';

// WebRTC types (simplified for demo - in real app you'd use react-native-webrtc)
interface RTCPeerConnection {
  createOffer: () => Promise<RTCSessionDescription>;
  createAnswer: () => Promise<RTCSessionDescription>;
  setLocalDescription: (desc: RTCSessionDescription) => Promise<void>;
  setRemoteDescription: (desc: RTCSessionDescription) => Promise<void>;
  addIceCandidate: (candidate: RTCIceCandidate) => Promise<void>;
  close: () => void;
}

interface MediaStream {
  id: string;
  active: boolean;
  getTracks: () => MediaStreamTrack[];
}

interface MediaStreamTrack {
  id: string;
  kind: 'audio' | 'video';
  enabled: boolean;
  stop: () => void;
}

interface CallParticipant {
  id: string;
  name: string;
  avatar?: string;
  isHost: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
  stream?: MediaStream;
}

interface VideoCallContextType {
  // Call state
  isInCall: boolean;
  callId: string | null;
  participants: CallParticipant[];
  localStream: MediaStream | null;
  
  // Controls
  isMuted: boolean;
  isVideoOff: boolean;
  isSpeakerOn: boolean;
  isScreenSharing: boolean;
  
  // Permissions
  hasCameraPermission: boolean;
  hasMicrophonePermission: boolean;
  
  // Actions
  startCall: (roomId?: string) => Promise<string>;
  joinCall: (callId: string) => Promise<boolean>;
  endCall: () => Promise<void>;
  toggleMute: () => Promise<void>;
  toggleVideo: () => Promise<void>;
  toggleSpeaker: () => Promise<void>;
  startScreenShare: () => Promise<void>;
  stopScreenShare: () => Promise<void>;
  
  // Stats
  callDuration: number;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'disconnected';
}

const VideoCallContext = createContext<VideoCallContextType | undefined>(undefined);

export const useVideoCall = () => {
  const context = useContext(VideoCallContext);
  if (!context) {
    throw new Error('useVideoCall must be used within a VideoCallProvider');
  }
  return context;
};

interface VideoCallProviderProps {
  children: ReactNode;
}

export const VideoCallProvider: React.FC<VideoCallProviderProps> = ({ children }) => {
  const { user, updateStats } = useAuth();
  
  // Call state
  const [isInCall, setIsInCall] = useState(false);
  const [callId, setCallId] = useState<string | null>(null);
  const [participants, setParticipants] = useState<CallParticipant[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  
  // Controls
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  
  // Permissions
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [hasMicrophonePermission, setHasMicrophonePermission] = useState(false);
  
  // Stats
  const [callDuration, setCallDuration] = useState(0);
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor' | 'disconnected'>('excellent');
  
  // Refs
  const callStartTime = useRef<number>(0);
  const durationInterval = useRef<NodeJS.Timeout | null>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);

  // Initialize permissions on mount
  useEffect(() => {
    requestPermissions();
  }, []);

  // Call duration timer
  useEffect(() => {
    if (isInCall && !durationInterval.current) {
      callStartTime.current = Date.now();
      durationInterval.current = setInterval(() => {
        setCallDuration(Math.floor((Date.now() - callStartTime.current) / 1000));
      }, 1000);
    } else if (!isInCall && durationInterval.current) {
      clearInterval(durationInterval.current);
      durationInterval.current = null;
      setCallDuration(0);
    }

    return () => {
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    };
  }, [isInCall]);

  const requestPermissions = async () => {
    try {
      // Camera permission
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(cameraStatus.status === 'granted');
      
      // Microphone permission
      const audioStatus = await Audio.requestRecordingPermissionsAsync();
      setHasMicrophonePermission(audioStatus.status === 'granted');
      
      if (cameraStatus.status !== 'granted' || audioStatus.status !== 'granted') {
        Alert.alert(
          'Permissions Required',
          'Camera and microphone permissions are required for video calls.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
    }
  };

  const generateCallId = () => {
    return `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const createLocalStream = async (): Promise<MediaStream | null> => {
    try {
      if (!hasCameraPermission || !hasMicrophonePermission) {
        await requestPermissions();
      }

      // In a real app, this would use react-native-webrtc
      // For demo purposes, we'll simulate a media stream
      const mockStream: MediaStream = {
        id: `local_stream_${Date.now()}`,
        active: true,
        getTracks: () => [
          {
            id: 'video_track',
            kind: 'video',
            enabled: !isVideoOff,
            stop: () => {},
          },
          {
            id: 'audio_track',
            kind: 'audio',
            enabled: !isMuted,
            stop: () => {},
          },
        ],
      };

      return mockStream;
    } catch (error) {
      console.error('Error creating local stream:', error);
      return null;
    }
  };

  const startCall = async (roomId?: string): Promise<string> => {
    try {
      if (!user) {
        console.log('⚠️ No user found, waiting for authentication...');
        // Wait a bit for user to load, then try again
        await new Promise(resolve => setTimeout(resolve, 1000));
      if (!user) {
        throw new Error('User must be authenticated to start a call');
        }
      }

      const newCallId = roomId || generateCallId();
      const stream = await createLocalStream();
      
      if (!stream) {
        throw new Error('Failed to access camera/microphone');
      }

      setCallId(newCallId);
      setLocalStream(stream);
      setIsInCall(true);
      
      // Add self as participant
      const selfParticipant: CallParticipant = {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        isHost: true,
        isMuted: false,
        isVideoOff: false,
        stream,
      };
      
      setParticipants([selfParticipant]);
      
      // Update user stats
      await updateStats('videoCalls', 1);
      
      Alert.alert(
        'Call Started!',
        `Call ID: ${newCallId}\nShare this ID with others to join your call.`,
        [{ text: 'OK' }]
      );
      
      return newCallId;
    } catch (error) {
      console.error('Error starting call:', error);
      Alert.alert('Error', 'Failed to start call. Please try again.');
      throw error;
    }
  };

  const joinCall = async (targetCallId: string): Promise<boolean> => {
    try {
      if (!user) {
        console.log('⚠️ No user found, waiting for authentication...');
        // Wait a bit for user to load, then try again
        await new Promise(resolve => setTimeout(resolve, 1000));
      if (!user) {
        throw new Error('User must be authenticated to join a call');
        }
      }

      const stream = await createLocalStream();
      
      if (!stream) {
        throw new Error('Failed to access camera/microphone');
      }

      setCallId(targetCallId);
      setLocalStream(stream);
      setIsInCall(true);
      
      // Add self as participant
      const selfParticipant: CallParticipant = {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        isHost: false,
        isMuted: false,
        isVideoOff: false,
        stream,
      };
      
      // Simulate joining an existing call with other participants
      const mockParticipants: CallParticipant[] = [
        selfParticipant,
        {
          id: 'demo_participant_1',
          name: 'Demo User 1',
          isHost: true,
          isMuted: false,
          isVideoOff: false,
        },
        {
          id: 'demo_participant_2',
          name: 'Demo User 2',
          isHost: false,
          isMuted: true,
          isVideoOff: false,
        },
      ];
      
      setParticipants(mockParticipants);
      
      // Update user stats
      await updateStats('videoCalls', 1);
      await updateStats('connections', 1);
      
      Alert.alert('Joined Call!', 'Successfully joined the video call.');
      
      return true;
    } catch (error) {
      console.error('Error joining call:', error);
      Alert.alert('Error', 'Failed to join call. Please check the call ID and try again.');
      return false;
    }
  };

  const endCall = async (): Promise<void> => {
    try {
      // Stop local stream
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      
      // Close peer connection
      if (peerConnection.current) {
        peerConnection.current.close();
        peerConnection.current = null;
      }
      
      // Update call duration stats
      if (callDuration > 0) {
        await updateStats('totalCallTime', callDuration);
      }
      
      // Reset state
      setIsInCall(false);
      setCallId(null);
      setParticipants([]);
      setLocalStream(null);
      setIsMuted(false);
      setIsVideoOff(false);
      setIsSpeakerOn(false);
      setIsScreenSharing(false);
      setCallDuration(0);
      
      Alert.alert('Call Ended', 'The video call has been ended.');
    } catch (error) {
      console.error('Error ending call:', error);
    }
  };

  const toggleMute = async (): Promise<void> => {
    try {
      const newMutedState = !isMuted;
      setIsMuted(newMutedState);
      
      // Update local stream audio track
      if (localStream) {
        const audioTrack = localStream.getTracks().find(track => track.kind === 'audio');
        if (audioTrack) {
          audioTrack.enabled = !newMutedState;
        }
      }
      
      // Update participant state
      setParticipants(prev => 
        prev.map(p => 
          p.id === user?.id ? { ...p, isMuted: newMutedState } : p
        )
      );
    } catch (error) {
      console.error('Error toggling mute:', error);
    }
  };

  const toggleVideo = async (): Promise<void> => {
    try {
      const newVideoState = !isVideoOff;
      setIsVideoOff(newVideoState);
      
      // Update local stream video track
      if (localStream) {
        const videoTrack = localStream.getTracks().find(track => track.kind === 'video');
        if (videoTrack) {
          videoTrack.enabled = !newVideoState;
        }
      }
      
      // Update participant state
      setParticipants(prev => 
        prev.map(p => 
          p.id === user?.id ? { ...p, isVideoOff: newVideoState } : p
        )
      );
    } catch (error) {
      console.error('Error toggling video:', error);
    }
  };

  const toggleSpeaker = async (): Promise<void> => {
    try {
      const newSpeakerState = !isSpeakerOn;
      setIsSpeakerOn(newSpeakerState);
      
      // In real app, this would configure audio output
      await Audio.setAudioModeAsync({
        allowsRecording: true,
        shouldPlayInBackground: true,
        playsInSilentMode: true,
        shouldRouteThroughEarpiece: !newSpeakerState,
      });
    } catch (error) {
      console.error('Error toggling speaker:', error);
    }
  };

  const startScreenShare = async (): Promise<void> => {
    try {
      setIsScreenSharing(true);
      Alert.alert('Screen Sharing', 'Screen sharing started! (Demo mode)');
    } catch (error) {
      console.error('Error starting screen share:', error);
      Alert.alert('Error', 'Failed to start screen sharing.');
    }
  };

  const stopScreenShare = async (): Promise<void> => {
    try {
      setIsScreenSharing(false);
      Alert.alert('Screen Sharing', 'Screen sharing stopped.');
    } catch (error) {
      console.error('Error stopping screen share:', error);
    }
  };

  const value: VideoCallContextType = {
    // Call state
    isInCall,
    callId,
    participants,
    localStream,
    
    // Controls
    isMuted,
    isVideoOff,
    isSpeakerOn,
    isScreenSharing,
    
    // Permissions
    hasCameraPermission,
    hasMicrophonePermission,
    
    // Actions
    startCall,
    joinCall,
    endCall,
    toggleMute,
    toggleVideo,
    toggleSpeaker,
    startScreenShare,
    stopScreenShare,
    
    // Stats
    callDuration,
    connectionQuality,
  };

  return (
    <VideoCallContext.Provider value={value}>
      {children}
    </VideoCallContext.Provider>
  );
}; 