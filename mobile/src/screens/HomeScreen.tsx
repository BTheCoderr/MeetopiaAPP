import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';

const HomeScreen = ({navigation}: any) => {
  const handleQuickMatch = () => {
    navigation.navigate('Matching');
  };

  const handleStartVideoCall = () => {
    navigation.navigate('VideoCall', {
      roomId: `room_${Date.now()}`,
      type: 'create',
    });
  };

  const handleJoinCall = () => {
    navigation.navigate('VideoCall', {
      roomId: 'demo_room',
      type: 'join',
    });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#ffffff',
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 10,
    },
    greeting: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: 5,
    },
    subtitle: {
      fontSize: 16,
      color: '#6b7280',
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
    },
    actionCard: {
      backgroundColor: '#f8fafc',
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: '#e5e7eb',
    },
    primaryAction: {
      backgroundColor: '#6366f1',
    },
    actionTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: 8,
    },
    actionTitlePrimary: {
      color: '#ffffff',
    },
    actionDescription: {
      fontSize: 14,
      color: '#6b7280',
      marginBottom: 16,
    },
    actionDescriptionPrimary: {
      color: 'rgba(255, 255, 255, 0.8)',
    },
    button: {
      backgroundColor: '#6366f1',
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      alignItems: 'center',
    },
    buttonSecondary: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: '#6366f1',
    },
    buttonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '600',
    },
    buttonTextSecondary: {
      color: '#6366f1',
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      backgroundColor: '#f8fafc',
      borderRadius: 16,
      padding: 20,
      marginTop: 20,
    },
    statItem: {
      alignItems: 'center',
    },
    statNumber: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#6366f1',
    },
    statLabel: {
      fontSize: 12,
      color: '#6b7280',
      marginTop: 4,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome back, User!</Text>
          <Text style={styles.subtitle}>Ready to connect with new people?</Text>
        </View>

        <View style={styles.content}>
          {/* Quick Match Action */}
          <TouchableOpacity
            style={[styles.actionCard, styles.primaryAction]}
            onPress={handleQuickMatch}
            activeOpacity={0.8}>
            <Text style={[styles.actionTitle, styles.actionTitlePrimary]}>
              Quick Match
            </Text>
            <Text style={[styles.actionDescription, styles.actionDescriptionPrimary]}>
              Find someone compatible right now and start a video chat
            </Text>
            <View style={[styles.button, {backgroundColor: 'rgba(255, 255, 255, 0.2)'}]}>
              <Text style={styles.buttonText}>Start Matching</Text>
            </View>
          </TouchableOpacity>

          {/* Start Video Call */}
          <TouchableOpacity
            style={styles.actionCard}
            onPress={handleStartVideoCall}
            activeOpacity={0.8}>
            <Text style={styles.actionTitle}>Start Video Call</Text>
            <Text style={styles.actionDescription}>
              Create a new room and invite others to join
            </Text>
            <View style={styles.button}>
              <Text style={styles.buttonText}>Create Room</Text>
            </View>
          </TouchableOpacity>

          {/* Join Call */}
          <TouchableOpacity
            style={styles.actionCard}
            onPress={handleJoinCall}
            activeOpacity={0.8}>
            <Text style={styles.actionTitle}>Join Call</Text>
            <Text style={styles.actionDescription}>
              Enter a room code to join an existing call
            </Text>
            <View style={[styles.button, styles.buttonSecondary]}>
              <Text style={[styles.buttonText, styles.buttonTextSecondary]}>
                Join Room
              </Text>
            </View>
          </TouchableOpacity>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>127</Text>
              <Text style={styles.statLabel}>Connections</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>89</Text>
              <Text style={styles.statLabel}>Video Calls</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>4.8</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen; 