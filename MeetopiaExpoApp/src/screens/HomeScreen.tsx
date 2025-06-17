import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Modal,
  Alert,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Logo from '../components/Logo';
// Temporarily comment out TutorialModal to fix import issues
// import TutorialModal from '../components/TutorialModal';

interface HomeScreenProps {
  navigation: any;
}

const { width, height } = Dimensions.get('window');

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [isLightMode, setIsLightMode] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  
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
            duration: 2000,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const rocket = Animated.loop(
      Animated.sequence([
        Animated.timing(rocketAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(rocketAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    // Start animations
    createFloatingAnimation(floatingAnim1, 0).start();
    createFloatingAnimation(floatingAnim2, 1000).start();
    createFloatingAnimation(floatingAnim3, 2000).start();
    rocket.start();
  }, []);

  // Watch Demo handler
  const handleWatchDemo = () => {
    Alert.alert(
      "Watch Demo",
      "This would play a demo video showing how to use Meetopia!",
      [{ text: "OK" }]
    );
  };

  // Toggle theme
  const toggleTheme = () => {
    setIsLightMode(!isLightMode);
  };

  // Dynamic colors
  const gradientColors = isLightMode 
    ? ['#f8fafc', '#e2e8f0', '#cbd5e1'] as const
    : ['#111827', '#1e3a8a', '#7c3aed'] as const;

  const textColor = isLightMode ? '#1f2937' : '#ffffff';
  const subtitleColor = isLightMode ? '#4b5563' : '#d1d5db';

  // Animation transforms
  const floating1Transform = floatingAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  const floating2Transform = floatingAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });

  const floating3Transform = floatingAnim3.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -12],
  });

  const rocketTransform = rocketAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
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
          <Text style={styles.floatingEmoji}>🌎</Text>
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

        {/* Navigation */}
        <View style={styles.nav}>
          <View style={styles.logo}>
            <View style={styles.logoIcon}>
              <Text style={styles.logoText}>M</Text>
            </View>
            <View>
              <Text style={[styles.logoTitle, { color: textColor }]}>Meetopia</Text>
              <Text style={[styles.logoSubtitle, { color: subtitleColor }]}>Connect Worldwide</Text>
            </View>
          </View>
          
          <View style={styles.topButtons}>
            <TouchableOpacity 
              style={[styles.productHuntButton, isLightMode && styles.lightThemeButton]}
              onPress={() => Alert.alert('Product Hunt', 'Visit us on Product Hunt!')}
            >
              <Text style={[styles.topButtonText, isLightMode && { color: '#1f2937' }]}>🦋 Product Hunt</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.tutorialButton}
              onPress={() => setShowTutorial(true)}
            >
              <Text style={styles.tutorialButtonText}>? Tutorial</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.themeButton}
              onPress={toggleTheme}
            >
              <Text style={styles.themeButtonText}>🌙 Dark</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          <View style={styles.centerContainer}>
            {/* Rocket Icon */}
            <Animated.View style={[
              styles.rocketContainer,
              { transform: [{ translateY: rocketTransform }] }
            ]}>
              <Text style={styles.rocket}>🚀</Text>
            </Animated.View>
            
            {/* Main Title */}
            <Text style={[styles.title, { color: textColor }]}>
              Meet People
            </Text>
            <LinearGradient
              colors={['#60a5fa', '#a855f7', '#ec4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.titleGradient}
            >
              <Text style={styles.titleGradientText}>Worldwide</Text>
            </LinearGradient>
            
            {/* Subtitle */}
            <Text style={[styles.subtitle, { color: subtitleColor }]}>
              Advanced video chat platform with smart matching, fun virtual backgrounds, screen sharing, and enterprise-grade security. Connect with confidence and style! 🎨✨
            </Text>

            {/* Action Buttons */}
            <View style={styles.buttonSection}>
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={() => navigation.navigate('VideoCall')}
              >
                <LinearGradient
                  colors={['#3b82f6', '#8b5cf6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryButtonGradient}
                >
                  <Text style={styles.primaryButtonText}>⭐ Start Connecting Now</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.secondaryButton, isLightMode && styles.secondaryButtonLight]}
                onPress={handleWatchDemo}
              >
                <Text style={[styles.secondaryButtonText, isLightMode && { color: '#3b82f6' }]}>
                  📹 Watch Demo
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Simple Tutorial Modal - Inline for now */}
        <Modal
          visible={showTutorial}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setShowTutorial(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <LinearGradient
                colors={['#1f2937', '#374151', '#4b5563']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.modalContent}
              >
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Tutorial</Text>
                  <TouchableOpacity 
                    onPress={() => setShowTutorial(false)} 
                    style={styles.closeButton}
                  >
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.modalBody}>
                  <Text style={styles.modalIcon}>🎉</Text>
                  <Text style={styles.modalSubtitle}>Welcome to Meetopia!</Text>
                  <Text style={styles.modalDescription}>
                    • Tap "Start Video Chat" to connect with someone new{'\n'}
                    • Use the light/dark mode toggle in the top right{'\n'}
                    • Create a profile to match with similar interests{'\n'}
                    • Be respectful and have fun!
                  </Text>
                </View>
                
                <TouchableOpacity 
                  style={styles.modalButton}
                  onPress={() => setShowTutorial(false)}
                >
                  <LinearGradient
                    colors={['#3b82f6', '#8b5cf6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.modalButtonGradient}
                  >
                    <Text style={styles.modalButtonText}>Got it!</Text>
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
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  topButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    maxWidth: width * 0.45,
    flexShrink: 1,
  },
  tutorialButton: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.5)',
    minWidth: 70,
  },
  tutorialButtonText: {
    color: '#a78bfa',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  productHuntButton: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.5)',
    minWidth: 70,
  },
  topButtonText: {
    color: '#a78bfa',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  lightThemeButton: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    borderColor: 'rgba(251, 191, 36, 0.5)',
  },
  themeButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 60,
  },
  themeButtonText: {
    color: '#60a5fa',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    minHeight: height * 0.8,
  },
  centerContainer: {
    alignItems: 'center',
    maxWidth: width * 0.9,
    width: '100%',
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
  },
  logoTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 4,
  },
  logoSubtitle: {
    fontSize: 16,
    fontWeight: '400',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
  },
  titleGradient: {
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  titleGradientText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 24,
  },
  buttonSection: {
    width: '100%',
    gap: 16,
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#6b7280',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    width: '100%',
    maxWidth: 320,
    alignSelf: 'center',
  },
  primaryButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    overflow: 'hidden',
  },
  primaryButtonText: {
    color: '#d1d5db',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#6b7280',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    width: '100%',
    maxWidth: 320,
    alignSelf: 'center',
  },
  secondaryButtonLight: {
    borderColor: '#374151',
  },
  secondaryButtonText: {
    color: '#d1d5db',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  rocketContainer: {
    marginBottom: 32,
  },
  rocket: {
    fontSize: 48,
  },
  
  // Floating element styles
  floatingElement1: {
    position: 'absolute',
    top: 80,
    left: 30,
    zIndex: 1,
  },
  floatingElement2: {
    position: 'absolute',
    top: 120,
    right: 50,
    zIndex: 1,
  },
  floatingElement3: {
    position: 'absolute',
    bottom: 150,
    left: 40,
    zIndex: 1,
  },
  floatingEmoji: {
    fontSize: 32,
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
  },
  modalContent: {
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalBody: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  modalSubtitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalDescription: {
    color: '#d1d5db',
    fontSize: 16,
    textAlign: 'left',
    lineHeight: 24,
  },
  modalButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  modalButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 