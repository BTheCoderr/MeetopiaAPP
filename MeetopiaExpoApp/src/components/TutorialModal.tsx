import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface TutorialModalProps {
  visible: boolean;
  onClose: () => void;
}

const { width, height } = Dimensions.get('window');

// Tutorial steps matching the web app exactly
const tutorialSteps = [
  {
    id: 'welcome',
    title: 'Welcome to Meetopia! 🎉',
    description: 'Let\'s take a quick tour of all the amazing features available to you.',
    icon: '👋'
  },
  {
    id: 'connection-button',
    title: 'Start Connecting Now',
    description: 'Click "Start Video Chat" to find someone new to video chat with. You\'ll be matched instantly!',
    icon: '🔗'
  },
  {
    id: 'keep-exploring',
    title: 'Keep Exploring',
    description: 'Not vibing with someone? No worries! Click "Next" to find a new person to chat with.',
    icon: '🔄'
  },
  {
    id: 'video-controls',
    title: 'Video Controls & Dragging',
    description: 'Control your camera and microphone from your picture-in-picture window. You can drag it anywhere on screen!',
    icon: '🎥'
  },
  {
    id: 'chat-feature',
    title: 'Chat While You Talk',
    description: 'Send messages in real-time! The chat appears during calls. Great for sharing links or continuing conversations.',
    icon: '💬'
  },
  {
    id: 'screen-share',
    title: 'Screen Sharing',
    description: 'Share your screen with the screen share button at the bottom during calls.',
    icon: '🖥️'
  },
  {
    id: 'themes',
    title: 'Dark/Light Mode',
    description: 'Toggle between dark and light themes using the button in the top right corner.',
    icon: '🌙'
  },
  {
    id: 'shortcuts',
    title: 'Pro Tips & Shortcuts',
    description: 'Tap controls to show/hide them • Move your video window • Everything auto-hides for immersion! • Be respectful and have fun!',
    icon: '⚡'
  },
  {
    id: 'ready',
    title: 'You\'re All Set! 🚀',
    description: 'Ready to meet amazing people from around the world? Let\'s get started!',
    icon: '✨'
  }
];

export default function TutorialModal({ visible, onClose }: TutorialModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setCurrentStep(0);
    onClose();
  };

  const handleSkip = () => {
    handleClose();
  };

  if (!visible) return null;

  const step = tutorialSteps[currentStep];
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['#1f2937', '#374151', '#4b5563']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.modalContent}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Tutorial</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
              <Text style={styles.progressText}>
                {currentStep + 1} of {tutorialSteps.length}
              </Text>
            </View>

            {/* Step Content */}
            <View style={styles.stepContainer}>
              <Text style={styles.stepIcon}>{step.icon}</Text>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepDescription}>{step.description}</Text>
            </View>

            {/* Navigation Buttons */}
            <View style={styles.buttonContainer}>
              <View style={styles.leftButtons}>
                <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                  <Text style={styles.skipButtonText}>Skip</Text>
                </TouchableOpacity>
                
                {currentStep > 0 && (
                  <TouchableOpacity onPress={handlePrevious} style={styles.prevButton}>
                    <Text style={styles.prevButtonText}>← Previous</Text>
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
                <LinearGradient
                  colors={['#3b82f6', '#8b5cf6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.nextButtonGradient}
                >
                  <Text style={styles.nextButtonText}>
                    {currentStep === tutorialSteps.length - 1 ? 'Get Started!' : 'Next →'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Step Indicators */}
            <View style={styles.indicators}>
              {tutorialSteps.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicator,
                    index === currentStep && styles.activeIndicator,
                    index < currentStep && styles.completedIndicator,
                  ]}
                />
              ))}
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
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
  progressContainer: {
    marginBottom: 24,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 2,
  },
  progressText: {
    color: '#9ca3af',
    fontSize: 12,
    textAlign: 'center',
  },
  stepContainer: {
    alignItems: 'center',
    marginBottom: 32,
    minHeight: 200,
    justifyContent: 'center',
  },
  stepIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  stepTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 28,
  },
  stepDescription: {
    color: '#d1d5db',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  leftButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipButtonText: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '500',
  },
  prevButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  prevButtonText: {
    color: '#d1d5db',
    fontSize: 14,
    fontWeight: '500',
  },
  nextButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  nextButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  activeIndicator: {
    backgroundColor: '#3b82f6',
  },
  completedIndicator: {
    backgroundColor: '#10b981',
  },
}); 