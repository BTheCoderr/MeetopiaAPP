import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  StatusBar,
  Dimensions,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';

const { width, height } = Dimensions.get('window');

type VideoChatScreenProps = NativeStackScreenProps<RootStackParamList, 'VideoChat'>;

export default function VideoChatScreen({ route, navigation }: VideoChatScreenProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [currentRoom, setCurrentRoom] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  // Local video controls
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  
  // Remote user controls (NEW)
  const [isRemoteMuted, setIsRemoteMuted] = useState(false);
  const [isRemoteVideoOff, setIsRemoteVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [windowMode, setWindowMode] = useState<'normal' | 'fullscreen' | 'pip'>('normal');

  // Generate random room on component mount
  useEffect(() => {
    generateRandomRoom();
  }, []);

  const generateRandomRoom = () => {
    const rooms = [
      'global-chat-1',
      'worldwide-meet',
      'random-connect',
      'global-room-' + Math.floor(Math.random() * 1000),
      'meetopia-' + Math.floor(Math.random() * 9999),
      'world-chat-' + Math.floor(Math.random() * 100)
    ];
    const randomRoom = rooms[Math.floor(Math.random() * rooms.length)];
    setCurrentRoom(randomRoom);
  };

  const handleKeepExploring = () => {
    setIsSearching(true);
    // Simulate finding a new random room
    setTimeout(() => {
      generateRandomRoom();
      setIsSearching(false);
      setIsConnected(true);
    }, 1500);
  };

  const handleEndCall = () => {
    Alert.alert(
      'End Call',
      'Are you sure you want to end this call?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'End Call', style: 'destructive', onPress: () => navigation.goBack() }
      ]
    );
  };

  // Local controls
  const toggleMute = () => setIsMuted(!isMuted);
  const toggleVideo = () => setIsVideoOff(!isVideoOff);

  // NEW: Remote user controls
  const toggleRemoteMute = () => {
    setIsRemoteMuted(!isRemoteMuted);
    Alert.alert(
      isRemoteMuted ? 'Unmuted Friend' : 'Muted Friend',
      isRemoteMuted ? 'You can now hear your friend' : "You won't hear your friend's audio"
    );
  };

  const toggleRemoteVideo = () => {
    setIsRemoteVideoOff(!isRemoteVideoOff);
    Alert.alert(
      isRemoteVideoOff ? 'Enabled Friend Video' : 'Disabled Friend Video',
      isRemoteVideoOff ? 'You can now see your friend' : "You won't see your friend's video"
    );
  };

  const toggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    Alert.alert(
      'Screen Sharing',
      isScreenSharing ? 'Stopped screen sharing' : 'Started screen sharing'
    );
  };

  const cycleWindowMode = () => {
    const modes: Array<'normal' | 'fullscreen' | 'pip'> = ['normal', 'fullscreen', 'pip'];
    const currentIndex = modes.indexOf(windowMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setWindowMode(nextMode);
    
    Alert.alert(
      'Window Mode',
      `Switched to ${nextMode === 'pip' ? 'Picture-in-Picture' : nextMode} mode`
    );
  };

  const showReportModal = () => {
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#374151" />
      
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Video Chat</Text>
        <View style={styles.connectionStatus}>
          <View style={[styles.statusDot, { backgroundColor: isConnected ? '#10b981' : '#ef4444' }]} />
          <Text style={styles.statusText}>{isConnected ? 'Connected' : 'Not Connected'}</Text>
        </View>
      </View>

      {/* ALWAYS VISIBLE: Action Buttons Bar */}
      <View style={styles.topButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.keepExploringButton]} 
          onPress={handleKeepExploring}
          disabled={isSearching}
        >
          <Text style={styles.actionButtonText}>
            {isSearching ? 'Finding...' : 'Keep Exploring!'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.backToBaseButton]} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.actionButtonText}>Back to Base</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.letUsKnowButton]} 
          onPress={showReportModal}
        >
          <Text style={styles.actionButtonText}>Let Us Know!</Text>
        </TouchableOpacity>
      </View>

      {/* Main Video Container */}
      <View style={styles.videoContainer}>
        <View style={[styles.videoFrame, windowMode === 'fullscreen' && styles.fullscreenVideo]}>
          
          {/* Video Chat Area */}
          <View style={styles.videoChatArea}>
            <View style={styles.cameraIcon}>
              <Text style={styles.cameraEmoji}>🎥</Text>
            </View>
            
            {isConnected ? (
              <View style={styles.connectedContent}>
                <Text style={styles.connectedTitle}>Connected to {currentRoom}</Text>
                <Text style={styles.subtitle}>💬 Ready for your Meetopia adventure?</Text>
                <Text style={styles.description}>Every conversation is a new adventure waiting to unfold.</Text>
              </View>
            ) : (
              <View style={styles.waitingContent}>
                <Text style={styles.mainTitle}>Ready for your Meetopia adventure?</Text>
                <Text style={styles.subtitle}>🌍 Connect with amazing people worldwide</Text>
                <Text style={styles.description}>Every conversation is a new adventure waiting to unfold.</Text>
                <Text style={styles.callToAction}>👆 Click "Keep Exploring!" to begin! 👆</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* NEW: Extended Video Controls */}
      <View style={styles.controlsContainer}>
        {/* Local Controls Row */}
        <View style={styles.controlRow}>
          <Text style={styles.controlLabel}>Your Controls:</Text>
          <View style={styles.controlButtons}>
            <TouchableOpacity 
              style={[styles.controlButton, isMuted && styles.controlButtonActive]} 
              onPress={toggleMute}
            >
              <Text style={styles.controlIcon}>{isMuted ? '🔇' : '🎤'}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.controlButton, isVideoOff && styles.controlButtonActive]} 
              onPress={toggleVideo}
            >
              <Text style={styles.controlIcon}>{isVideoOff ? '📷' : '🎥'}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.controlButton, isScreenSharing && styles.controlButtonActive]} 
              onPress={toggleScreenShare}
            >
              <Text style={styles.controlIcon}>🖥️</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.controlButton} 
              onPress={cycleWindowMode}
            >
              <Text style={styles.controlIcon}>
                {windowMode === 'fullscreen' ? '🖼️' : windowMode === 'pip' ? '📱' : '🔳'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Friend Controls Row (NEW) */}
        <View style={styles.controlRow}>
          <Text style={styles.controlLabel}>Friend Controls:</Text>
          <View style={styles.controlButtons}>
            <TouchableOpacity 
              style={[styles.controlButton, isRemoteMuted && styles.controlButtonActive]} 
              onPress={toggleRemoteMute}
            >
              <Text style={styles.controlIcon}>{isRemoteMuted ? '🔇' : '🔊'}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.controlButton, isRemoteVideoOff && styles.controlButtonActive]} 
              onPress={toggleRemoteVideo}
            >
              <Text style={styles.controlIcon}>{isRemoteVideoOff ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.controlButton} 
              onPress={handleEndCall}
            >
              <Text style={styles.controlIcon}>📞</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Chat Input */}
      <View style={styles.chatContainer}>
        <View style={styles.chatInput}>
          <Text style={styles.chatPlaceholder}>Type a message...</Text>
          <TouchableOpacity style={styles.sendButton}>
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#e5e7eb' 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#374151',
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
  },
  
  // ALWAYS VISIBLE: Top Action Buttons
  topButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 80,
  },
  keepExploringButton: {
    backgroundColor: '#3b82f6',
  },
  backToBaseButton: {
    backgroundColor: '#6b7280',
  },
  letUsKnowButton: {
    backgroundColor: '#8b5cf6',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Video Container
  videoContainer: {
    flex: 1,
    padding: 16,
  },
  videoFrame: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#6366f1',
    overflow: 'hidden',
  },
  fullscreenVideo: {
    borderRadius: 0,
    margin: -16,
  },
  videoChatArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  cameraIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  cameraEmoji: {
    fontSize: 40,
  },
  
  // Content States
  waitingContent: {
    alignItems: 'center',
  },
  connectedContent: {
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    lineHeight: 32,
  },
  connectedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10b981',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#6366f1',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  callToAction: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f59e0b',
    textAlign: 'center',
    marginTop: 16,
  },

  // NEW: Extended Controls
  controlsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: '#f9fafb',
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  controlLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  controlButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#d1d5db',
  },
  controlButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#2563eb',
  },
  controlIcon: {
    fontSize: 16,
  },

  // Chat Input
  chatContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
  },
  chatInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  chatPlaceholder: {
    flex: 1,
    color: '#9ca3af',
    fontSize: 16,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendIcon: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  navButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  navButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
}); 