import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Modal,
  ScrollView,
  Animated,
  Share,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

interface HomeScreenProps {
  navigation: any;
}

const { width, height } = Dimensions.get('window');

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { isDark, toggleTheme } = useTheme();
  const [showTutorial, setShowTutorial] = useState(false);
  const [stats, setStats] = useState({
    activeUsers: 2847,
    connections: 15632,
    countries: 89,
  });
  
  // Floating animations
  const floatingAnim1 = new Animated.Value(0);
  const floatingAnim2 = new Animated.Value(0);
  const floatingAnim3 = new Animated.Value(0);
  const rocketAnim = new Animated.Value(0);

  useEffect(() => {
    // Create floating animations
    const createFloatingAnimation = (animValue: Animated.Value, delay: number = 0) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: 1,
            duration: 3000,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 3000,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const rocket = Animated.loop(
      Animated.sequence([
        Animated.timing(rocketAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(rocketAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    // Start animations
    createFloatingAnimation(floatingAnim1, 0).start();
    createFloatingAnimation(floatingAnim2, 1000).start();
    createFloatingAnimation(floatingAnim3, 2000).start();
    rocket.start();

    // Update stats every 3 seconds
    const statsInterval = setInterval(() => {
      setStats(prev => ({
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 10) - 5,
        connections: prev.connections + Math.floor(Math.random() * 20) - 10,
        countries: prev.countries,
      }));
    }, 3000);

    return () => clearInterval(statsInterval);
  }, []);

  // Real functionality handlers
  const handleStartConnecting = () => {
    navigation.navigate('Matching');
  };

  const handleWatchDemo = () => {
    navigation.navigate('VideoCall');
  };

  const handleCreateProfile = () => {
    navigation.navigate('Profile');
  };

  const handleProductHunt = async () => {
    try {
      await Linking.openURL('https://www.producthunt.com/posts/meetopia');
    } catch (error) {
      console.log('Cannot open Product Hunt link');
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Check out Meetopia - Connect with people worldwide! 🌍',
        url: 'https://meetopia.app',
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  // Dynamic colors
  const gradientColors = isDark 
    ? ['#0f172a', '#1e293b', '#334155'] as const
    : ['#f8fafc', '#e2e8f0', '#cbd5e1'] as const;

  const textColor = isDark ? '#ffffff' : '#1f2937';
  const subtitleColor = isDark ? '#cbd5e1' : '#64748b';
  const cardBg = isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.9)';

  // Animation transforms
  const floating1Transform = floatingAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });

  const floating2Transform = floatingAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  const floating3Transform = floatingAnim3.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -12],
  });

  const rocketTransform = rocketAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -25],
  });

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Floating Elements */}
        <Animated.View style={[
          styles.floatingElement1,
          { transform: [{ translateY: floating1Transform }] }
        ]}>
          <Text style={styles.floatingEmoji}>🌍</Text>
        </Animated.View>
        
        <Animated.View style={[
          styles.floatingElement2,
          { transform: [{ translateY: floating2Transform }] }
        ]}>
          <Text style={styles.floatingEmoji}>✨</Text>
        </Animated.View>
        
        <Animated.View style={[
          styles.floatingElement3,
          { transform: [{ translateY: floating3Transform }] }
        ]}>
          <Text style={styles.floatingEmoji}>💫</Text>
        </Animated.View>

        {/* SCROLLABLE CONTENT */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          {/* Header Navigation */}
          <View style={styles.header}>
            {/* FIXED LOGO - Matching Web App */}
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoM}>M</Text>
              </View>
              <View style={styles.logoText}>
                <Text style={[styles.brandName, { color: textColor }]}>Meetopia</Text>
                <Text style={[styles.tagline, { color: subtitleColor }]}>Connect Worldwide</Text>
              </View>
              <Text style={styles.globeEmoji}>🌍</Text>
            </View>
            
            {/* Top Action Buttons */}
            <View style={styles.headerButtons}>
              <TouchableOpacity 
                style={[styles.roundButton, { backgroundColor: cardBg }]}
                onPress={handleProductHunt}
              >
                <Text style={styles.buttonEmoji}>🦋</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.roundButton, { backgroundColor: cardBg }]}
                onPress={() => setShowTutorial(true)}
              >
                <Text style={styles.buttonEmoji}>❓</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.roundButton, { backgroundColor: cardBg }]}
                onPress={toggleTheme}
              >
                <Text style={styles.buttonEmoji}>{isDark ? '☀️' : '🌙'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Main Hero Section */}
          <View style={styles.heroSection}>
            {/* Animated Rocket */}
            <Animated.View style={[
              styles.rocketContainer,
              { transform: [{ translateY: rocketTransform }] }
            ]}>
              <Text style={styles.rocket}>🚀</Text>
            </Animated.View>
            
            {/* Main Title */}
            <Text style={[styles.mainTitle, { color: textColor }]}>
              Meet People
            </Text>
            
            {/* Gradient Subtitle */}
            <LinearGradient
              colors={['#3b82f6', '#8b5cf6', '#ec4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientBadge}
            >
              <Text style={styles.gradientText}>Worldwide</Text>
            </LinearGradient>
            
            {/* Description */}
            <Text style={[styles.description, { color: subtitleColor }]}>
              Advanced video chat platform with smart matching, virtual backgrounds, and enterprise-grade security. 
              {'\n\n'}
              Connect with confidence! 🎨 ✨
            </Text>

            {/* ROUND ACTION BUTTONS - REAL FUNCTIONALITY */}
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.primaryRoundButton}
                onPress={handleStartConnecting}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#3b82f6', '#8b5cf6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryButtonGradient}
                >
                  <Text style={styles.primaryButtonIcon}>⭐</Text>
                  <Text style={styles.primaryButtonText}>Start Connecting Now</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.secondaryRoundButton, { backgroundColor: cardBg }]}
                onPress={handleWatchDemo}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryButtonIcon}>📹</Text>
                <Text style={[styles.secondaryButtonText, { color: textColor }]}>
                  Watch Demo
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.secondaryRoundButton, { backgroundColor: cardBg }]}
                onPress={handleCreateProfile}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryButtonIcon}>👤</Text>
                <Text style={[styles.secondaryButtonText, { color: textColor }]}>
                  Create Profile
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Live Stats Section */}
          <View style={[styles.statsSection, { backgroundColor: cardBg }]}>
            <Text style={[styles.statsTitle, { color: textColor }]}>
              🔥 Live Activity
            </Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.activeUsers.toLocaleString()}</Text>
                <Text style={[styles.statLabel, { color: subtitleColor }]}>Active Users</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.connections.toLocaleString()}</Text>
                <Text style={[styles.statLabel, { color: subtitleColor }]}>Connections Made</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.countries}</Text>
                <Text style={[styles.statLabel, { color: subtitleColor }]}>Countries</Text>
              </View>
            </View>
          </View>

          {/* Features Preview */}
          <View style={styles.featuresSection}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              ✨ What Makes Us Special
            </Text>
            
            <View style={styles.featureCards}>
              <View style={[styles.featureCard, { backgroundColor: cardBg }]}>
                <Text style={styles.featureEmoji}>🎥</Text>
                <Text style={[styles.featureTitle, { color: textColor }]}>HD Video Chat</Text>
                <Text style={[styles.featureDesc, { color: subtitleColor }]}>
                  Crystal clear video calls with smart matching
                </Text>
              </View>

              <View style={[styles.featureCard, { backgroundColor: cardBg }]}>
                <Text style={styles.featureEmoji}>🌈</Text>
                <Text style={[styles.featureTitle, { color: textColor }]}>Virtual Backgrounds</Text>
                <Text style={[styles.featureDesc, { color: subtitleColor }]}>
                  Express yourself with fun backgrounds
                </Text>
              </View>

              <View style={[styles.featureCard, { backgroundColor: cardBg }]}>
                <Text style={styles.featureEmoji}>🔒</Text>
                <Text style={[styles.featureTitle, { color: textColor }]}>Secure & Private</Text>
                <Text style={[styles.featureDesc, { color: subtitleColor }]}>
                  Enterprise-grade security for safe connections
                </Text>
              </View>
            </View>
          </View>

          {/* Bottom Action */}
          <View style={styles.bottomSection}>
            <TouchableOpacity 
              style={[styles.shareButton, { backgroundColor: cardBg }]}
              onPress={handleShare}
            >
              <Text style={styles.shareEmoji}>📱</Text>
              <Text style={[styles.shareText, { color: textColor }]}>
                Share Meetopia with Friends
              </Text>
            </TouchableOpacity>
          </View>

          {/* Extra spacing for scroll */}
          <View style={styles.bottomSpacing} />
        </ScrollView>

        {/* Tutorial Modal */}
        <Modal
          visible={showTutorial}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowTutorial(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <LinearGradient
                colors={isDark ? ['#1e293b', '#334155'] : ['#ffffff', '#f8fafc']}
                style={styles.modalContent}
              >
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: textColor }]}>
                    🎉 Welcome to Meetopia!
                  </Text>
                  <TouchableOpacity 
                    onPress={() => setShowTutorial(false)} 
                    style={styles.closeButton}
                  >
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalScroll}>
                  <View style={styles.tutorialSteps}>
                    <View style={styles.tutorialStep}>
                      <Text style={styles.stepNumber}>1</Text>
                      <Text style={[styles.stepText, { color: textColor }]}>
                        🎥 Tap "Start Connecting" to begin video chatting
                      </Text>
                    </View>
                    
                    <View style={styles.tutorialStep}>
                      <Text style={styles.stepNumber}>2</Text>
                      <Text style={[styles.stepText, { color: textColor }]}>
                        👤 Create your profile for better matches
                      </Text>
                    </View>
                    
                    <View style={styles.tutorialStep}>
                      <Text style={styles.stepNumber}>3</Text>
                      <Text style={[styles.stepText, { color: textColor }]}>
                        🌍 Connect with people from around the world
                      </Text>
                    </View>
                    
                    <View style={styles.tutorialStep}>
                      <Text style={styles.stepNumber}>4</Text>
                      <Text style={[styles.stepText, { color: textColor }]}>
                        🎨 Use virtual backgrounds and filters
                      </Text>
                    </View>
                    
                    <View style={styles.tutorialStep}>
                      <Text style={styles.stepNumber}>5</Text>
                      <Text style={[styles.stepText, { color: textColor }]}>
                        🤝 Be respectful and have fun!
                      </Text>
                    </View>
                  </View>
                </ScrollView>
                
                <TouchableOpacity 
                  style={styles.modalButton}
                  onPress={() => setShowTutorial(false)}
                >
                  <LinearGradient
                    colors={['#3b82f6', '#8b5cf6']}
                    style={styles.modalButtonGradient}
                  >
                    <Text style={styles.modalButtonText}>Let's Go! 🚀</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </View>
        </Modal>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  
  // Floating Elements
  floatingElement1: {
    position: 'absolute',
    top: height * 0.15,
    left: width * 0.1,
    zIndex: 1,
  },
  floatingElement2: {
    position: 'absolute',
    top: height * 0.25,
    right: width * 0.15,
    zIndex: 1,
  },
  floatingElement3: {
    position: 'absolute',
    top: height * 0.4,
    left: width * 0.85,
    zIndex: 1,
  },
  floatingEmoji: {
    fontSize: 24,
    opacity: 0.7,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  
  // FIXED LOGO - Matching Web App
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoM: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
  },
  logoText: {
    flex: 1,
  },
  brandName: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 28,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 16,
  },
  globeEmoji: {
    fontSize: 20,
    marginLeft: 8,
  },
  
  // Header Buttons - ROUND
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  roundButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonEmoji: {
    fontSize: 18,
  },
  
  // Hero Section
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  rocketContainer: {
    marginBottom: 20,
  },
  rocket: {
    fontSize: 64,
  },
  mainTitle: {
    fontSize: 42,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 48,
  },
  gradientBadge: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 24,
  },
  gradientText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  
  // ROUND ACTION BUTTONS - REAL FUNCTIONALITY
  actionButtons: {
    width: '100%',
    gap: 16,
  },
  primaryRoundButton: {
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    gap: 12,
  },
  primaryButtonIcon: {
    fontSize: 20,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryRoundButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryButtonIcon: {
    fontSize: 18,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Stats Section
  statsSection: {
    marginHorizontal: 20,
    marginVertical: 30,
    padding: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#3b82f6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  
  // Features Section
  featuresSection: {
    paddingHorizontal: 20,
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
  },
  featureCards: {
    gap: 16,
  },
  featureCard: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureEmoji: {
    fontSize: 32,
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDesc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  
  // Bottom Section
  bottomSection: {
    paddingHorizontal: 20,
    marginVertical: 30,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 20,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  shareEmoji: {
    fontSize: 20,
  },
  shareText: {
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 50,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.9,
    maxHeight: height * 0.8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalContent: {
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  modalScroll: {
    maxHeight: height * 0.5,
  },
  tutorialSteps: {
    gap: 16,
  },
  tutorialStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 32,
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
  },
  modalButton: {
    marginTop: 24,
    borderRadius: 25,
    overflow: 'hidden',
  },
  modalButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
}); 