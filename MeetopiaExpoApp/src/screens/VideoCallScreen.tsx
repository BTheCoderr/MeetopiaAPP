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
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [virtualBackground, setVirtualBackground] = useState('none');
  const [videoQuality, setVideoQuality] = useState('4K');
  const [isSecureMode, setIsSecureMode] = useState(true);
  const [showControls, setShowControls] = useState(true);
  
  // Camera permissions
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  
  const callStartTime = useRef<number | null>(null);
  const hideControlsTimer = useRef<NodeJS.Timeout | null>(null);

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
        const now = Date.now();
        const diff = Math.floor((now - callStartTime.current!) / 1000);
        setCallDuration(diff);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isConnected]);

  // Timer to hide controls after 10 seconds when connected
  useEffect(() => {
    if (isConnected && hasRemoteUser && showControls) {
      // Clear existing timer
      if (hideControlsTimer.current) {
        clearTimeout(hideControlsTimer.current);
      }
      
      // Start new timer
      hideControlsTimer.current = setTimeout(() => {
        setShowControls(false);
      }, 10000); // 10 seconds
    }

    return () => {
      if (hideControlsTimer.current) {
        clearTimeout(hideControlsTimer.current);
      }
    };
  }, [isConnected, hasRemoteUser, showControls]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startCall = () => {
    if (cameraPermission?.granted) {
      setIsConnected(true);
      callStartTime.current = Date.now();
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

  // Add disconnect when navigating away
  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      if (isConnected) {
        handleEndCall();
      }
    });
    return unsubscribe;
  }, [navigation, isConnected]);

  // Show controls when user taps screen
  const handleScreenTap = () => {
    if (isConnected && hasRemoteUser && !showControls) {
      setShowControls(true);
    }
  };

  // Reset timer when controls are shown
  const resetControlsTimer = () => {
    setShowControls(true);
    if (hideControlsTimer.current) {
      clearTimeout(hideControlsTimer.current);
    }
  };

  const handleLetUsKnow = () => {
    Alert.alert(
      'Report & Feedback',
      'What would you like to report?',
      [
        { text: 'Report Inappropriate Behavior', onPress: () => Alert.alert('Reported', 'Thank you for your report') },
        { text: 'Technical Issue', onPress: () => Alert.alert('Reported', 'We will look into this issue') },
        { text: 'General Feedback', onPress: () => Alert.alert('Thanks!', 'Your feedback helps us improve') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
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

  // Virtual background handler
  const handleVirtualBackground = () => {
    const backgrounds = ['none', 'blur', 'office', 'nature', 'space'];
    const currentIndex = backgrounds.indexOf(virtualBackground);
    const nextIndex = (currentIndex + 1) % backgrounds.length;
    setVirtualBackground(backgrounds[nextIndex]);
    Alert.alert('Virtual Background', `Changed to: ${backgrounds[nextIndex]}`);
    resetControlsTimer();
  };

  // Video quality handler
  const handleVideoQuality = () => {
    const qualities = ['720p', '1080p', '4K', '8K'];
    const currentIndex = qualities.indexOf(videoQuality);
    const nextIndex = (currentIndex + 1) % qualities.length;
    setVideoQuality(qualities[nextIndex]);
    Alert.alert('Video Quality', `Set to: ${qualities[nextIndex]} (Max supported: 4K)`);
    resetControlsTimer();
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
        {/* Header - Show only if controls are visible */}
        {showControls && (
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
        )}

        {/* Navigation Buttons - Show only if controls are visible */}
        {showControls && (
          <View style={styles.navContainer}>
            <TouchableOpacity onPress={startCall} style={[styles.navButton, styles.exploreButton]}>
              <Text style={styles.navButtonText}>Keep Exploring!</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('HomeMain')} style={[styles.navButton, styles.baseButton]}>
              <Text style={styles.navButtonText}>Back to Base</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLetUsKnow} style={[styles.navButton, styles.reportButton]}>
              <Text style={styles.navButtonText}>Let Us Know!</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Call Status Section - Show only if controls are visible */}
        {showControls && (
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
        )}

        {/* Video Container - Touchable for full screen */}
        <TouchableOpacity 
          style={styles.videoContainer} 
          onPress={handleScreenTap}
          activeOpacity={1}
        >
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
                  Finding someone awesome...
                </Text>
              </View>
            ) : (
              // Not connected - show local camera preview
              <CameraView
                style={styles.mainVideo}
                facing={facing}
              />
            )}

            {/* Picture-in-Picture: Local Video */}
            {isConnected && hasRemoteUser && (
              <View style={styles.pipContainer}>
                <CameraView
                  style={styles.pipVideo}
                  facing={facing}
                />
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* Enhanced Controls - Show only if controls are visible */}
        {showControls && (
          <View style={styles.controlsContainer}>
            <View style={styles.topControls}>
              <TouchableOpacity 
                style={[styles.controlButton, styles.backgroundButton]} 
                onPress={handleVirtualBackground}
              >
                <Ionicons name="image-outline" size={24} color="white" />
                <Text style={styles.controlButtonText}>BG: {virtualBackground}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.controlButton, styles.qualityButton]} 
                onPress={handleVideoQuality}
              >
                <Ionicons name="videocam-outline" size={24} color="white" />
                <Text style={styles.controlButtonText}>{videoQuality}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.controlButton, styles.securityButton]} 
                onPress={() => {
                  setIsSecureMode(!isSecureMode);
                  resetControlsTimer();
                }}
              >
                <Ionicons name={isSecureMode ? "shield-checkmark" : "shield-outline"} size={24} color="white" />
                <Text style={styles.controlButtonText}>
                  {isSecureMode ? 'Secure' : 'Standard'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.mainControls}>
              <TouchableOpacity 
                style={[styles.controlButton, isMuted ? styles.mutedButton : styles.activeButton]} 
                onPress={() => {
                  setIsMuted(!isMuted);
                  resetControlsTimer();
                }}
              >
                <Ionicons name={isMuted ? "mic-off" : "mic"} size={24} color="white" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.controlButton, !isVideoEnabled ? styles.mutedButton : styles.activeButton]} 
                onPress={() => {
                  setIsVideoEnabled(!isVideoEnabled);
                  resetControlsTimer();
                }}
              >
                <Ionicons name={isVideoEnabled ? "videocam" : "videocam-off"} size={24} color="white" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.controlButton, isScreenSharing ? styles.activeButton : styles.inactiveButton]} 
                onPress={() => {
                  setIsScreenSharing(!isScreenSharing);
                  resetControlsTimer();
                }}
              >
                <Ionicons name="desktop-outline" size={24} color="white" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.controlButton, styles.endCallButton]} 
                onPress={() => {
                  handleEndCall();
                  resetControlsTimer();
                }}
              >
                <Ionicons name="call" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        )}
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
  controlsContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 15,
  },
  topControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  mainControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  controlButtonText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
    textAlign: 'center',
  },
  backgroundButton: {
    backgroundColor: '#10b981',
    borderColor: '#059669',
    shadowColor: '#10b981',
  },
  qualityButton: {
    backgroundColor: '#3b82f6',
    borderColor: '#2563eb',
    shadowColor: '#3b82f6',
  },
  securityButton: {
    backgroundColor: '#8b5cf6',
    borderColor: '#7c3aed',
    shadowColor: '#8b5cf6',
  },
  activeButton: {
    backgroundColor: '#1f2937',
    borderColor: '#4b5563',
    shadowColor: '#1f2937',
  },
  mutedButton: {
    backgroundColor: '#ef4444',
    borderColor: '#dc2626',
    shadowColor: '#ef4444',
  },
  inactiveButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: 'rgba(0,0,0,0.2)',
  },
  endCallButton: {
    backgroundColor: '#ef4444',
    borderColor: '#dc2626',
    shadowColor: '#ef4444',
  },
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  navButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 16,
    flex: 1,
    marginHorizontal: 3,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  navButtonText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  exploreButton: {
    backgroundColor: '#10b981',
    borderColor: '#059669',
    shadowColor: '#10b981',
  },
  baseButton: {
    backgroundColor: '#3b82f6',
    borderColor: '#2563eb',
    shadowColor: '#3b82f6',
  },
  reportButton: {
    backgroundColor: '#8b5cf6',
    borderColor: '#7c3aed',
    shadowColor: '#8b5cf6',
  },
});

export default function VideoCallScreen({ navigation }: VideoCallScreenProps) {
  return <VideoCallContent navigation={navigation} />;
} 