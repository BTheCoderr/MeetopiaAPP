import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  SafeAreaView, 
  TextInput, 
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Logo from '../components/Logo';

interface ProfileScreenProps {
  navigation: any;
}

const { width, height } = Dimensions.get('window');

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const [name, setName] = useState('');
  const [interests, setInterests] = useState('');

  const handleSaveProfile = () => {
    // Save profile logic here
    navigation.navigate('VideoCall');
  };

  const handleSkip = () => {
    navigation.navigate('VideoCall');
  };

  return (
    <LinearGradient
      colors={['#f8fafc', '#e2e8f0', '#cbd5e1']}
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
          <Logo size="sm" isDarkTheme={false} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Profile Icon */}
            <View style={styles.profileIconContainer}>
              <Text style={styles.profileIcon}>👤</Text>
            </View>

            {/* Title */}
            <Text style={styles.title}>Quick Profile (Optional)</Text>
            <Text style={styles.subtitle}>Just a name and interests - takes 30 seconds</Text>

        {/* Form */}
        <View style={styles.form}>
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>What should people call you?</Text>
            <TextInput
                  style={styles.textInput}
                  placeholder="Your name or nickname"
              placeholderTextColor="#9ca3af"
                  value={name}
                  onChangeText={setName}
            />
          </View>

              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>What are you interested in?</Text>
            <TextInput
                  style={styles.textInput}
                  placeholder="Gaming, music, travel..."
              placeholderTextColor="#9ca3af"
                  value={interests}
                  onChangeText={setInterests}
              multiline
            />
                <Text style={styles.inputHint}>Separate with commas</Text>
          </View>

              {/* Save Button */}
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleSaveProfile}
          >
                <LinearGradient
                  colors={['#3b82f6', '#8b5cf6', '#ec4899']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.saveButtonGradient}
                >
                  <Text style={styles.saveButtonText}>→ Save & Start Chatting</Text>
                </LinearGradient>
          </TouchableOpacity>

              {/* Skip Button */}
          <TouchableOpacity 
            style={styles.skipButton}
            onPress={handleSkip}
          >
                <Text style={styles.skipButtonText}>✕ Skip for Now</Text>
          </TouchableOpacity>

              <Text style={styles.skipHint}>You can always add more details later</Text>
            </View>
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
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
    minHeight: height * 0.8,
  },
  profileIconContainer: {
    width: 120,
    height: 120,
    backgroundColor: '#4f46e5',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  profileIcon: {
    fontSize: 48,
    color: '#ffffff',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 48,
  },
  form: {
    width: '100%',
    maxWidth: 400,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#111827',
    minHeight: 56,
    textAlignVertical: 'top',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputHint: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
  },
  saveButton: {
    width: '100%',
    marginTop: 16,
    marginBottom: 24,
    borderRadius: 12,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  saveButtonGradient: {
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 16,
  },
  skipButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
  skipHint: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
}); 