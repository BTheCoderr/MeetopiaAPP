import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Alert,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import Logo from '../components/Logo';

interface VideoCallScreenProps {
  navigation: any;
}

const { width, height } = Dimensions.get('window');

function VideoCallContent({ navigation }: VideoCallScreenProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isLightMode, setIsLightMode] = useState(false);
  const [localVideo, setLocalVideo] = useState(true);
  const [localAudio, setLocalAudio] = useState(true);
  const [facing, setFacing] = useState<'front' | 'back'>('front');
  const [hasRemoteUser, setHasRemoteUser] = useState(false);
  
  // Camera permissions
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  
  const callStartTime = useRef<Date | null>(null);

  // Request permissions but don't auto-connect
  useEffect(() => {
    const requestPermissions = async () => {
      if (!cameraPermission?.granted) {
        await requestCameraPermission();
      }
    };

    requestPermissions();
  }, [cameraPermission?.granted]);

  // Timer for call duration - only when actually connected
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isConnected && callStartTime.current) {
      interval = setInterval(() => {
        const now = new Date();
        const diff = Math.floor((now.getTime() - callStartTime.current!.getTime()) / 1000);
        setCallDuration(diff);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isConnected]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startCall = () => {
    if (cameraPermission?.granted) {
      setIsConnected(true);
      callStartTime.current = new Date();
      // Simulate finding a user after 3 seconds
      setTimeout(() => {
        setHasRemoteUser(true);
      }, 3000);
    }
  };

  const toggleMute = () => {
    setLocalAudio(!localAudio);
  };

  const toggleCamera = () => {
    setLocalVideo(!localVideo);
  };

  const flipCamera = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const toggleLightMode = () => {
    setIsLightMode(!isLightMode);
  };

  const handleTutorial = () => {
    Alert.alert(
      'Tutorial', 
      'Welcome to Meetopia!\n\n• Tap "Start Video Call" to begin\n• Use controls to mute/unmute\n• Flip between front/back camera\n• Light mode changes the theme\n\nEnjoy meeting new people!'
    );
  };

  const handleEndCall = () => {
    setIsConnected(false);
    setHasRemoteUser(false);
    setCallDuration(0);
    callStartTime.current = null;
    navigation.goBack();
  };

  const shareRoomLink = async () => {
    try {
      await Share.share({
        message: 'Join my Meetopia video call! 🎥\n\nClick here to join: https://meetopia.app/room/demo-room',
        title: 'Join my Meetopia call',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const gradientColors = isLightMode 
    ? ['#f8fafc', '#e2e8f0', '#cbd5e1'] as const
    : ['#111827', '#1e3a8a', '#7c3aed'] as const;

  const textColor = isLightMode ? '#1e293b' : 'white';
  const subtextColor = isLightMode ? '#64748b' : 'rgba(255,255,255,0.8)';

  if (!cameraPermission) {
    return (
      <LinearGradient colors={gradientColors} style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={[styles.permissionText, { color: textColor }]}>Loading camera...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (!cameraPermission.granted) {
    return (
      <LinearGradient colors={gradientColors} style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={[styles.permissionText, { color: textColor }]}>Camera permission required</Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestCameraPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={gradientColors} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Logo size="sm" />
          </View>
          
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={handleTutorial} style={styles.headerButton}>
              <Text style={[styles.headerButtonText, { color: textColor }]}>Tutorial</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleLightMode} style={styles.headerButton}>
              <Text style={[styles.headerButtonText, { color: textColor }]}>
                {isLightMode ? '🌙' : '☀️'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={shareRoomLink} style={styles.shareButton}>
              <Ionicons name="share-outline" size={24} color={textColor} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Call Status Section */}
        <View style={styles.callStatusSection}>
          <Text style={[styles.callStatus, { color: textColor }]}>
            {isConnected ? (hasRemoteUser ? 'Connected' : 'Connecting...') : 'Ready to Call'}
          </Text>
          {isConnected && (
            <Text style={[styles.callDuration, { color: subtextColor }]}>
              {formatTime(callDuration)}
            </Text>
          )}
        </View>

        {/* Video Container */}
        <View style={styles.videoContainer}>
          {/* Main Video Area */}
          <View style={styles.mainVideoContainer}>
            {isConnected && hasRemoteUser ? (
              // Remote user video (simulated)
              <View style={styles.remoteVideoPlaceholder}>
                <Ionicons name="person" size={80} color={subtextColor} />
                <Text style={[styles.remoteVideoText, { color: subtextColor }]}>
                  Connected User
                </Text>
              </View>
            ) : isConnected ? (
              // Connecting state
              <View style={styles.remoteVideoPlaceholder}>
                <Ionicons name="search" size={60} color={subtextColor} />
                <Text style={[styles.remoteVideoText, { color: subtextColor }]}>
                  Finding someone to chat with...
                </Text>
              </View>
            ) : (
              // Not connected - show local video large
              localVideo ? (
                <CameraView
                  style={styles.mainVideo}
                  facing={facing}
                />
              ) : (
                <View style={styles.remoteVideoPlaceholder}>
                  <Ionicons name="videocam-off" size={80} color={subtextColor} />
                  <Text style={[styles.remoteVideoText, { color: subtextColor }]}>
                    Camera Off
                  </Text>
                </View>
              )
            )}
          </View>

          {/* Picture-in-Picture (Local Video when connected) */}
          {isConnected && (
            <View style={styles.pipContainer}>
              {localVideo ? (
                <CameraView
                  style={styles.pipVideo}
                  facing={facing}
                />
              ) : (
                <View style={styles.pipPlaceholder}>
                  <Ionicons name="videocam-off" size={20} color="rgba(255,255,255,0.8)" />
                </View>
              )}
            </View>
          )}
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          {!isConnected ? (
            // Start Call Button
            <TouchableOpacity
              style={styles.startCallButton}
              onPress={startCall}
            >
              <Ionicons name="videocam" size={20} color="white" />
              <Text style={styles.startCallText}>Start Video Call</Text>
            </TouchableOpacity>
          ) : (
            // Call Controls
            <>
              <TouchableOpacity
                style={[styles.controlButton, !localAudio && styles.controlButtonMuted]}
                onPress={toggleMute}
              >
                <Ionicons
                  name={localAudio ? "mic" : "mic-off"}
                  size={24}
                  color="white"
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.controlButton, !localVideo && styles.controlButtonMuted]}
                onPress={toggleCamera}
              >
                <Ionicons
                  name={localVideo ? "videocam" : "videocam-off"}
                  size={24}
                  color="white"
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.controlButton}
                onPress={flipCamera}
              >
                <Ionicons name="camera-reverse" size={24} color="white" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.controlButton, styles.endCallButton]}
                onPress={handleEndCall}
              >
                <Ionicons name="call" size={24} color="white" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerLeft: {
    flex: 1,
  },
  callStatusSection: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  callStatus: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  callDuration: {
    fontSize: 16,
    fontWeight: '500',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
    gap: 10,
  },
  headerButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
  },
  headerButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  shareButton: {
    padding: 8,
  },
  videoContainer: {
    flex: 1,
    padding: 20,
  },
  mainVideoContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 15,
  },
  mainVideo: {
    flex: 1,
    transform: [{ scaleX: -1 }], // Mirror the front camera
  },
  remoteVideoPlaceholder: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  remoteVideoText: {
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
  pipContainer: {
    position: 'absolute',
    top: 30,
    right: 30,
    width: width * 0.3,
    aspectRatio: 3/4,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.8)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  pipVideo: {
    flex: 1,
    transform: [{ scaleX: -1 }], // Mirror the front camera
  },
  pipPlaceholder: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 20,
  },
  startCallButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  startCallText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  controlButtonMuted: {
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
  },
  endCallButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
  },
});

export default function VideoCallScreen({ navigation }: VideoCallScreenProps) {
  return <VideoCallContent navigation={navigation} />;
} 