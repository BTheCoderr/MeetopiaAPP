import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, SafeAreaView, Alert, Dimensions } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';

const { width, height } = Dimensions.get('window');

type VideoChatScreenProps = NativeStackScreenProps<RootStackParamList, 'VideoChat'>;

export default function VideoChatScreen({ route, navigation }: VideoChatScreenProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [currentRoom, setCurrentRoom] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

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

  const toggleMute = () => setIsMuted(!isMuted);
  const toggleVideo = () => setIsVideoOff(!isVideoOff);

  if (!isConnected) {
    // Pre-call interface
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Video Chat</Text>
        </View>

        <View style={styles.videoContainer}>
          <View style={styles.videoFrame}>
            {/* Top Action Buttons */}
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
                onPress={() => Alert.alert('Feedback', 'Thanks for your feedback!')}
              >
                <Text style={styles.actionButtonText}>Let Us Know!</Text>
              </TouchableOpacity>
            </View>

            {/* Video Chat Area */}
            <View style={styles.videoChatArea}>
              <View style={styles.cameraIcon}>
                <Text style={styles.cameraEmoji}>🎥</Text>
              </View>

              <Text style={styles.mainTitle}>Ready for your Meetopia</Text>
              <Text style={styles.mainTitle}>adventure?</Text>
              
              <Text style={styles.subtitle}>
                🌍 Connect with amazing people worldwide!
              </Text>
              <Text style={styles.description}>
                Every conversation is a new adventure waiting to unfold.
              </Text>

              <View style={styles.ctaContainer}>
                <Text style={styles.ctaText}>
                  👆 Click "Keep Exploring!" to begin!
                </Text>
              </View>
            </View>

            {/* Bottom Controls */}
            <View style={styles.bottomControls}>
              <TouchableOpacity style={styles.controlIcon}>
                <Text style={styles.controlEmoji}>🔊</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.controlIcon}>
                <Text style={styles.controlEmoji}>💬</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.controlIcon}>
                <Text style={styles.controlEmoji}>💻</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.bottomSection}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputPlaceholder}>Type a message...</Text>
            <TouchableOpacity style={styles.sendButton}>
              <Text style={styles.sendIcon}>➤</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.roomInfo}>
            Room: {currentRoom} {isSearching && '(searching...)'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // FaceTime-style interface when connected
  return (
    <View style={styles.facetimeContainer}>
      {/* Main video (remote person) */}
      <View style={styles.mainVideo}>
        <View style={styles.remoteVideoPlaceholder}>
          <Text style={styles.remoteVideoText}>👤</Text>
          <Text style={styles.remoteVideoLabel}>Connected User</Text>
          <Text style={styles.connectionStatus}>🟢 Connected to {currentRoom}</Text>
        </View>
      </View>

      {/* Picture-in-picture (your video) */}
      <View style={styles.pipVideo}>
        <View style={styles.localVideoPlaceholder}>
          <Text style={styles.localVideoText}>📱</Text>
          <Text style={styles.localVideoLabel}>You</Text>
        </View>
      </View>

      {/* Top status bar */}
      <View style={styles.statusBar}>
        <TouchableOpacity style={styles.minimizeButton} onPress={() => navigation.goBack()}>
          <Text style={styles.minimizeText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.callDuration}>00:42</Text>
        <View style={styles.statusIndicator}>
          <Text style={styles.statusText}>🔒 Encrypted</Text>
        </View>
      </View>

      {/* FaceTime controls */}
      <View style={styles.facetimeControls}>
        <TouchableOpacity 
          style={[styles.facetimeButton, isMuted && styles.mutedButton]} 
          onPress={toggleMute}
        >
          <Text style={styles.facetimeButtonIcon}>
            {isMuted ? '🔇' : '🎤'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.facetimeButton, styles.endCallButton]} 
          onPress={handleEndCall}
        >
          <Text style={styles.facetimeButtonIcon}>📞</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.facetimeButton, isVideoOff && styles.videoOffButton]} 
          onPress={toggleVideo}
        >
          <Text style={styles.facetimeButtonIcon}>
            {isVideoOff ? '📹' : '🎥'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Additional controls */}
      <View style={styles.additionalControls}>
        <TouchableOpacity style={styles.smallControl}>
          <Text style={styles.smallControlIcon}>🔄</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.smallControl}>
          <Text style={styles.smallControlIcon}>💬</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.smallControl}>
          <Text style={styles.smallControlIcon}>👥</Text>
        </TouchableOpacity>
      </View>
    </View>
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
  },
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
  topButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 8,
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
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    lineHeight: 32,
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
  ctaContainer: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  ctaText: {
    fontSize: 14,
    color: '#92400e',
    fontWeight: '500',
    textAlign: 'center',
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  controlIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  controlEmoji: {
    fontSize: 20,
  },
  bottomSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  inputPlaceholder: {
    flex: 1,
    color: '#9ca3af',
    fontSize: 16,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendIcon: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  roomInfo: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  
  // FaceTime styles
  facetimeContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  mainVideo: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  remoteVideoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
  },
  remoteVideoText: {
    fontSize: 120,
    marginBottom: 16,
  },
  remoteVideoLabel: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 8,
  },
  connectionStatus: {
    color: '#4ade80',
    fontSize: 14,
    fontWeight: '500',
  },
  pipVideo: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 120,
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  localVideoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#374151',
  },
  localVideoText: {
    fontSize: 40,
    marginBottom: 4,
  },
  localVideoLabel: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  statusBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  minimizeButton: {
    padding: 8,
  },
  minimizeText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  callDuration: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  statusIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  facetimeControls: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  facetimeButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  facetimeButtonIcon: {
    fontSize: 28,
  },
  endCallButton: {
    backgroundColor: '#ef4444',
  },
  mutedButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
  },
  videoOffButton: {
    backgroundColor: 'rgba(107, 114, 128, 0.8)',
  },
  additionalControls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallControl: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  smallControlIcon: {
    fontSize: 20,
  },
}); 