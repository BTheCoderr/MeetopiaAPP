import React from 'react';
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

interface FeaturesScreenProps {
  navigation: any;
}

const { width, height } = Dimensions.get('window');

const FeatureCard = ({ icon, title, description }: { icon: string, title: string, description: string }) => (
  <View style={styles.featureCard}>
    <Text style={styles.featureIcon}>{icon}</Text>
    <Text style={styles.featureTitle}>{title}</Text>
    <Text style={styles.featureDescription}>{description}</Text>
      </View>
  );

const TestimonialCard = ({ avatar, quote, name, location }: { avatar: string, quote: string, name: string, location: string }) => (
  <View style={styles.testimonialCard}>
    <Text style={styles.testimonialAvatar}>{avatar}</Text>
    <Text style={styles.testimonialQuote}>"{quote}"</Text>
    <Text style={styles.testimonialName}>{name}</Text>
    <Text style={styles.testimonialLocation}>{location}</Text>
    </View>
  );

export default function FeaturesScreen({ navigation }: FeaturesScreenProps) {
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
          {/* Powerful Features Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Powerful Features</Text>
          <Text style={styles.sectionSubtitle}>
              Everything you need for meaningful connections with cutting-edge technology
          </Text>
          
          <View style={styles.featuresGrid}>
              <FeatureCard
                icon="🧠"
                title="Smart Matching"
                description="AI-powered algorithm matches you with compatible people based on interests, location, and preferences"
              />
              
              <FeatureCard
                icon="📹"
                title="HD Video Chat"
                description="Crystal clear video calls with adaptive quality and virtual backgrounds"
              />
              
              <FeatureCard
                icon="✨"
                title="Virtual Backgrounds"
                description="Professional backgrounds, blur effects, and custom uploads for perfect video calls"
              />
              
              <FeatureCard
                icon="📱"
                title="Screen Sharing"
                description="Share your screen, presentations, or applications with recording capabilities"
              />
              
              <FeatureCard
                icon="🛡️"
                title="Safe & Secure"
                description="End-to-end encryption, reporting tools, and advanced safety features"
              />
              
              <FeatureCard
                icon="🌍"
                title="Global Community"
                description="Connect with people worldwide with language preferences and location matching"
              />
            </View>
          </View>

          {/* What People Say Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What People Say</Text>
            
            <View style={styles.testimonialsContainer}>
              <TestimonialCard
                avatar="👩‍💼"
                quote="The smart matching really works! I've met amazing people who share my interests."
                name="Sarah M."
                location="New York, USA"
              />
              
              <TestimonialCard
                avatar="👨‍💻"
                quote="Video quality is incredible and the virtual backgrounds are so professional!"
                name="Alex K."
                location="London, UK"
              />
              
              <TestimonialCard
                avatar="👩‍🎓"
                quote="I love how safe and secure the platform feels. Great for meeting new friends!"
                name="Maria S."
                location="Barcelona, Spain"
              />
          </View>
        </View>

          {/* Ready to Start Section */}
        <View style={styles.ctaSection}>
            <Text style={styles.ctaIcon}>✨</Text>
            <Text style={styles.ctaTitle}>Ready to Start Connecting?</Text>
          <Text style={styles.ctaSubtitle}>
              Join millions of users already making meaningful connections worldwide. It's free, fast, and secure.
          </Text>
          
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => navigation.navigate('VideoCall' as never)}
            >
              <LinearGradient
                colors={['#3b82f6', '#8b5cf6', '#ec4899']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaButtonGradient}
              >
                <Text style={styles.ctaButtonText}>⚡ Start Connecting Now</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <View style={styles.ctaFeatures}>
              <View style={styles.ctaFeature}>
                <Text style={styles.ctaFeatureIcon}>🛡️</Text>
                <Text style={styles.ctaFeatureText}>100% Secure</Text>
              </View>
              <View style={styles.ctaFeature}>
                <Text style={styles.ctaFeatureIcon}>⚡</Text>
                <Text style={styles.ctaFeatureText}>Instant Connect</Text>
              </View>
              <View style={styles.ctaFeature}>
                <Text style={styles.ctaFeatureIcon}>🕐</Text>
                <Text style={styles.ctaFeatureText}>24/7 Available</Text>
              </View>
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
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 48,
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#d1d5db',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  featuresGrid: {
    gap: 20,
  },
  featureCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  featureIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 14,
    color: '#d1d5db',
    textAlign: 'center',
    lineHeight: 20,
  },
  testimonialsContainer: {
    gap: 20,
  },
  testimonialCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  testimonialAvatar: {
    fontSize: 48,
    marginBottom: 16,
  },
  testimonialQuote: {
    fontSize: 16,
    color: '#d1d5db',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 16,
    lineHeight: 24,
  },
  testimonialName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  testimonialLocation: {
    fontSize: 14,
    color: '#9ca3af',
  },
  ctaSection: {
    paddingHorizontal: 24,
    paddingBottom: 48,
    alignItems: 'center',
  },
  ctaIcon: {
    fontSize: 48,
    marginBottom: 24,
  },
  ctaTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
  },
  ctaSubtitle: {
    fontSize: 16,
    color: '#d1d5db',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  ctaButton: {
    width: '100%',
    maxWidth: 320,
    marginBottom: 32,
    borderRadius: 12,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  ctaButtonGradient: {
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  ctaButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  ctaFeatures: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    maxWidth: 320,
  },
  ctaFeature: {
    alignItems: 'center',
  },
  ctaFeatureIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  ctaFeatureText: {
    fontSize: 12,
    color: '#d1d5db',
    fontWeight: '600',
  },
});