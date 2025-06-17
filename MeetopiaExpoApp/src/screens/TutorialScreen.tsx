import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Logo from '../components/Logo';

interface TutorialScreenProps {
  navigation: any;
}

const { width, height } = Dimensions.get('window');

const TutorialStep = ({ step, title, description, icon }: { step: number, title: string, description: string, icon: string }) => (
  <View style={styles.stepCard}>
    <View style={styles.stepHeader}>
      <View style={styles.stepNumber}>
        <Text style={styles.stepNumberText}>{step}</Text>
      </View>
      <Text style={styles.stepIcon}>{icon}</Text>
    </View>
    <Text style={styles.stepTitle}>{title}</Text>
    <Text style={styles.stepDescription}>{description}</Text>
  </View>
);

export default function TutorialScreen({ navigation }: TutorialScreenProps) {
  return (
    <LinearGradient
      colors={['#111827', '#1e3a8a', '#7c3aed']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Logo size="sm" isDarkTheme={true} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Title */}
            <Text style={styles.title}>How to Use Meetopia</Text>
            <Text style={styles.subtitle}>
              Get the most out of your video chat experience with these simple steps
            </Text>

            {/* Tutorial Steps */}
            <View style={styles.stepsContainer}>
              <TutorialStep
                step={1}
                title="Join a Video Chat"
                description="Click 'Start Video Chat' to instantly connect with someone new. Your camera and microphone will be requested."
                icon="📹"
              />
              
              <TutorialStep
                step={2}
                title="Allow Camera & Microphone"
                description="Grant permissions for your camera and microphone so you can see and hear each other clearly."
                icon="🎤"
              />
              
              <TutorialStep
                step={3}
                title="Enjoy Your Conversation"
                description="Have fun chatting! Be respectful and kind. If you don't click, simply click 'Next' to meet someone new."
                icon="💬"
              />
              
              <TutorialStep
                step={4}
                title="Use Video Controls"
                description="Toggle your camera, mute/unmute microphone, and use the hang up button when you're ready to leave."
                icon="🎛️"
              />
              
              <TutorialStep
                step={5}
                title="Create a Profile (Optional)"
                description="Add your name and interests so you can connect with like-minded people more easily."
                icon="👤"
              />
              
              <TutorialStep
                step={6}
                title="Stay Safe"
                description="Never share personal information. Report inappropriate behavior. Your safety is our priority."
                icon="🛡️"
              />
            </View>

            {/* Tips Section */}
            <View style={styles.tipsSection}>
              <Text style={styles.tipsTitle}>💡 Pro Tips</Text>
              <View style={styles.tipsList}>
                <Text style={styles.tipItem}>• Use good lighting for better video quality</Text>
                <Text style={styles.tipItem}>• Find a quiet space for clear audio</Text>
                <Text style={styles.tipItem}>• Be yourself and have fun!</Text>
                <Text style={styles.tipItem}>• Respect others and they'll respect you</Text>
              </View>
            </View>

            {/* CTA Button */}
            <TouchableOpacity 
              style={styles.startButton}
              onPress={() => navigation.navigate('VideoCall')}
            >
              <LinearGradient
                colors={['#3b82f6', '#8b5cf6', '#ec4899']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.startButtonGradient}
              >
                <Text style={styles.startButtonText}>🚀 Start Video Chatting</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#d1d5db',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  stepsContainer: {
    gap: 24,
    marginBottom: 40,
  },
  stepCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    backgroundColor: '#3b82f6',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  stepIcon: {
    fontSize: 24,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
  },
  stepDescription: {
    fontSize: 16,
    color: '#d1d5db',
    lineHeight: 24,
  },
  tipsSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  tipsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    fontSize: 16,
    color: '#d1d5db',
    lineHeight: 24,
  },
  startButton: {
    width: '100%',
    borderRadius: 12,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  startButtonGradient: {
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
}); 