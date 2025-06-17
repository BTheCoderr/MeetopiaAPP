import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  Alert,
} from 'react-native';
import MatchingService from '../services/MatchingService';

const {width, height} = Dimensions.get('window');

interface Profile {
  id: string;
  name: string;
  age: number;
  interests: string[];
  bio: string;
  distance: string;
  compatibility: number;
}

interface MatchingScreenProps {
  navigation: any;
}

const MatchingScreen: React.FC<MatchingScreenProps> = ({navigation}) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    setLoading(true);
    try {
      // Generate mock profiles using MatchingService
      const mockProfiles = [
        {
          id: '1',
          name: 'Sarah',
          age: 28,
          interests: ['Travel', 'Photography', 'Yoga'],
          bio: 'Love exploring new places and capturing beautiful moments. Looking for someone to share adventures with! 📸✈️',
          distance: '2.5 km away',
          compatibility: 92
        },
        {
          id: '2',
          name: 'Alex',
          age: 32,
          interests: ['Cooking', 'Music', 'Hiking'],
          bio: 'Chef by day, musician by night. Always up for a good hike and great conversation! 🎵🥾',
          distance: '1.8 km away',
          compatibility: 87
        },
        {
          id: '3',
          name: 'Emma',
          age: 26,
          interests: ['Art', 'Books', 'Coffee'],
          bio: 'Artist and bookworm seeking someone who appreciates creativity and deep conversations over coffee ☕📚',
          distance: '3.2 km away',
          compatibility: 94
        },
        {
          id: '4',
          name: 'David',
          age: 30,
          interests: ['Fitness', 'Technology', 'Movies'],
          bio: 'Tech enthusiast who loves staying active and binge-watching sci-fi series. Let\'s build something amazing together! 💪🚀',
          distance: '4.1 km away',
          compatibility: 89
        }
      ];
      setProfiles(mockProfiles);
    } catch (error) {
      console.error('Error loading profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    const currentProfile = profiles[currentProfileIndex];
    if (direction === 'right') {
      console.log(`💕 Liked ${currentProfile.name}!`);
      
      // Simulate a match (in real app, this would check if they liked you back)
      const isMatch = Math.random() > 0.5; // 50% chance of match
      
      if (isMatch) {
        // It's a match! Navigate to chat
        Alert.alert(
          '🎉 It\'s a Match!',
          `You and ${currentProfile.name} liked each other! Start chatting now?`,
          [
            {
              text: 'Maybe Later',
              style: 'cancel'
            },
            {
              text: 'Start Chat',
              onPress: () => {
                // Navigate to chat with this person
                navigation.navigate('Chat', {
                  roomId: `match_${currentProfile.id}_${Date.now()}`,
                  roomName: `Chat with ${currentProfile.name}`,
                  participantName: currentProfile.name,
                  participantId: currentProfile.id
                });
              }
            }
          ]
        );
      } else {
        // Like sent, waiting for response
        Alert.alert(
          '💕 Like Sent!',
          `Your like has been sent to ${currentProfile.name}. You'll be notified if they like you back!`,
          [{text: 'Continue Matching', style: 'default'}]
        );
      }
    } else {
      console.log(`👎 Passed on ${currentProfile.name}`);
    }
    
    // Move to next profile
    if (currentProfileIndex < profiles.length - 1) {
      setCurrentProfileIndex(currentProfileIndex + 1);
    } else {
      // Reset to beginning or load more profiles
      setCurrentProfileIndex(0);
      loadProfiles();
    }
  };

  const renderProfile = (profile: Profile) => (
    <View style={styles.profileCard}>
      <View style={styles.profileImageContainer}>
        <View style={styles.profileImagePlaceholder}>
          <Text style={styles.profileImageText}>📸</Text>
        </View>
        <View style={styles.compatibilityBadge}>
          <Text style={styles.compatibilityText}>{profile.compatibility}% Match</Text>
        </View>
      </View>
      
      <View style={styles.profileInfo}>
        <View style={styles.profileHeader}>
          <Text style={styles.profileName}>{profile.name}, {profile.age}</Text>
          <Text style={styles.profileDistance}>{profile.distance}</Text>
        </View>
        
        <Text style={styles.profileBio}>{profile.bio}</Text>
        
        <View style={styles.interestsContainer}>
          {profile.interests.map((interest, index) => (
            <View key={index} style={styles.interestTag}>
              <Text style={styles.interestText}>{interest}</Text>
            </View>
          ))}
        </View>
        
        {/* Quick Action Buttons */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.chatButton}
            onPress={() => {
              navigation.navigate('Chat', {
                roomId: `chat_${profile.id}_${Date.now()}`,
                roomName: `Chat with ${profile.name}`,
                participantName: profile.name,
                participantId: profile.id
              });
            }}
          >
            <Text style={styles.quickActionText}>💬 Chat Now</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.videoButton}
            onPress={() => {
              Alert.alert(
                '📹 Start Video Call?',
                `Would you like to start a video call with ${profile.name}?`,
                [
                  {text: 'Cancel', style: 'cancel'},
                  {
                    text: 'Start Call',
                    onPress: () => {
                      navigation.navigate('VideoCall', {
                        roomId: `video_${profile.id}_${Date.now()}`,
                        participantName: profile.name,
                        type: 'start'
                      });
                    }
                  }
                ]
              );
            }}
          >
            <Text style={styles.quickActionText}>📹 Video Call</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>🔍 Finding amazing people for you...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (profiles.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>🎉 You've seen everyone nearby!</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={loadProfiles}>
            <Text style={styles.refreshButtonText}>🔄 Load More</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentProfile = profiles[currentProfileIndex];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Smart Matching</Text>
        <Text style={styles.headerSubtitle}>Discover people you'll love</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderProfile(currentProfile)}
        
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.passButton]}
            onPress={() => handleSwipe('left')}
          >
            <Text style={styles.actionButtonText}>👎 Pass</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.likeButton]}
            onPress={() => handleSwipe('right')}
          >
            <Text style={styles.actionButtonText}>💕 Like</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            Profile {currentProfileIndex + 1} of {profiles.length}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#e0e7ff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  refreshButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  profileImageContainer: {
    position: 'relative',
    height: 300,
    backgroundColor: '#f3f4f6',
  },
  profileImagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e5e7eb',
  },
  profileImageText: {
    fontSize: 60,
  },
  compatibilityBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  compatibilityText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  profileInfo: {
    padding: 20,
    paddingBottom: 10,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  profileDistance: {
    fontSize: 14,
    color: '#6b7280',
  },
  profileBio: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 16,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  interestTag: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  interestText: {
    color: '#6366f1',
    fontSize: 12,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
    marginBottom: 20,
  },
  actionButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    minWidth: 120,
    alignItems: 'center',
  },
  passButton: {
    backgroundColor: '#ef4444',
  },
  likeButton: {
    backgroundColor: '#10b981',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statsContainer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  statsText: {
    fontSize: 14,
    color: '#6b7280',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 15,
  },
  chatButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
    flex: 1,
    alignItems: 'center',
  },
  videoButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
    flex: 1,
    alignItems: 'center',
  },
  quickActionText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default MatchingScreen; 