import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Dimensions,
} from 'react-native';
import VideoCallService, {CallParticipant} from '../services/VideoCallService';

interface VideoCallScreenProps {
  route: any;
  navigation: any;
}

const {width, height} = Dimensions.get('window');

const VideoCallScreen: React.FC<VideoCallScreenProps> = ({route, navigation}) => {
  const {roomId, type} = route.params;
  
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState('connecting');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [participants, setParticipants] = useState<CallParticipant[]>([]);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    initializeCall();
    setupEventListeners();
    
    // Start call duration timer
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => {
      clearInterval(timer);
      VideoCallService.endCall();
    };
  }, []);

  const initializeCall = async () => {
    try {
      const config = {
        roomId: roomId,
        userId: `user_${Date.now()}`,
        isHost: type === 'create',
      };

      // TODO: Replace with your actual socket server URL
      const socketUrl = 'ws://localhost:3001';
      
      await VideoCallService.initializeCall(config, socketUrl);
      
    } catch (error) {
      console.error('Error initializing call:', error);
      Alert.alert('Connection Error', 'Failed to initialize the call', [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
    }
  };

  const setupEventListeners = () => {
    VideoCallService.onConnectionStateChanged((state) => {
      setConnectionState(state);
      setIsConnected(state === 'connected');
    });

    VideoCallService.onParticipantJoined((participant) => {
      setParticipants(prev => [...prev, participant]);
    });

    VideoCallService.onParticipantLeft((participantId) => {
      setParticipants(prev => prev.filter(p => p.id !== participantId));
    });

    VideoCallService.onCallEnded(() => {
      Alert.alert('Call Ended', 'The call has been ended by the host', [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
    });

    VideoCallService.onError((error) => {
      Alert.alert('Call Error', error, [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
    });
  };

  const handleEndCall = () => {
    Alert.alert(
      'End Call',
      'Are you sure you want to end this call?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'End Call',
          style: 'destructive',
          onPress: () => {
            VideoCallService.endCall();
            navigation.goBack();
          },
        },
      ]
    );
  };

  const toggleMute = () => {
    const newMuteState = VideoCallService.toggleAudio();
    setIsMuted(!newMuteState);
  };

  const toggleVideo = () => {
    const newVideoState = VideoCallService.toggleVideo();
    setIsVideoEnabled(newVideoState);
  };

  const switchCamera = async () => {
    try {
      await VideoCallService.switchCamera();
    } catch (error) {
      console.error('Error switching camera:', error);
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getConnectionStatusText = (): string => {
    switch (connectionState) {
      case 'connecting':
        return 'Connecting...';
      case 'connected':
        return participants.length > 0 ? 'Connected' : 'Waiting for participants...';
      case 'disconnected':
        return 'Disconnected';
      default:
        return 'Unknown';
    }
  };

  const getConnectionStatusColor = (): string => {
    switch (connectionState) {
      case 'connected':
        return '#10b981';
      case 'connecting':
        return '#f59e0b';
      case 'disconnected':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#000000',
    },
    videoContainer: {
      flex: 1,
      position: 'relative',
    },
    mainVideo: {
      flex: 1,
      backgroundColor: '#1f2937',
      justifyContent: 'center',
      alignItems: 'center',
    },
    participantVideo: {
      position: 'absolute',
      top: 60,
      right: 20,
      width: 120,
      height: 160,
      borderRadius: 12,
      backgroundColor: '#374151',
      borderWidth: 2,
      borderColor: '#ffffff',
      justifyContent: 'center',
      alignItems: 'center',
    },
    placeholderText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '500',
      textAlign: 'center',
    },
    participantPlaceholderText: {
      color: '#ffffff',
      fontSize: 12,
      fontWeight: '500',
      textAlign: 'center',
    },
    statusBar: {
      position: 'absolute',
      top: 60,
      left: 20,
      right: 160,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    statusContainer: {
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      flexDirection: 'row',
      alignItems: 'center',
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 6,
    },
    statusText: {
      color: '#ffffff',
      fontSize: 12,
      fontWeight: '500',
    },
    durationText: {
      color: '#ffffff',
      fontSize: 14,
      fontWeight: '600',
    },
    roomInfo: {
      position: 'absolute',
      top: 100,
      left: 20,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    roomText: {
      color: '#ffffff',
      fontSize: 12,
    },
    participantsList: {
      position: 'absolute',
      top: 140,
      left: 20,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      maxWidth: width - 180,
    },
    participantsText: {
      color: '#ffffff',
      fontSize: 12,
    },
    controls: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingVertical: 30,
      paddingBottom: 50,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    controlButton: {
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    controlButtonActive: {
      backgroundColor: '#6366f1',
    },
    controlButtonMuted: {
      backgroundColor: '#ef4444',
    },
    endCallButton: {
      backgroundColor: '#ef4444',
    },
    controlButtonText: {
      color: '#ffffff',
      fontSize: 24,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.videoContainer}>
        {/* Main Video Area */}
        <View style={styles.mainVideo}>
          <Text style={styles.placeholderText}>
            {getConnectionStatusText()}
          </Text>
          {participants.length > 0 && (
            <Text style={[styles.placeholderText, {marginTop: 10, fontSize: 14}]}>
              {participants.length} participant{participants.length > 1 ? 's' : ''} connected
            </Text>
          )}
        </View>

        {/* Participant Video (Self View) */}
        <View style={styles.participantVideo}>
          <Text style={styles.participantPlaceholderText}>You</Text>
          {!isVideoEnabled && (
            <Text style={[styles.participantPlaceholderText, {marginTop: 5}]}>
              Video Off
            </Text>
          )}
        </View>

        {/* Status Bar */}
        <View style={styles.statusBar}>
          <View style={styles.statusContainer}>
            <View 
              style={[
                styles.statusDot, 
                {backgroundColor: getConnectionStatusColor()}
              ]} 
            />
            <Text style={styles.statusText}>
              {getConnectionStatusText()}
            </Text>
          </View>
          
          <Text style={styles.durationText}>
            {formatDuration(callDuration)}
          </Text>
        </View>

        {/* Room Info */}
        <View style={styles.roomInfo}>
          <Text style={styles.roomText}>Room: {roomId}</Text>
        </View>

        {/* Participants List */}
        {participants.length > 0 && (
          <View style={styles.participantsList}>
            <Text style={styles.participantsText}>
              Participants: {participants.map(p => p.name).join(', ')}
            </Text>
          </View>
        )}

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={[
              styles.controlButton, 
              isMuted && styles.controlButtonMuted
            ]}
            onPress={toggleMute}
            activeOpacity={0.8}>
            <Text style={styles.controlButtonText}>
              {isMuted ? '🔇' : '🎤'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.controlButton, 
              !isVideoEnabled && styles.controlButtonMuted
            ]}
            onPress={toggleVideo}
            activeOpacity={0.8}>
            <Text style={styles.controlButtonText}>
              {isVideoEnabled ? '📹' : '📷'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={switchCamera}
            activeOpacity={0.8}>
            <Text style={styles.controlButtonText}>🔄</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, styles.endCallButton]}
            onPress={handleEndCall}
            activeOpacity={0.8}>
            <Text style={styles.controlButtonText}>📞</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default VideoCallScreen; 