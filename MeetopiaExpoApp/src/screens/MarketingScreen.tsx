import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Linking,
  Dimensions,
  Animated,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

interface MarketingScreenProps {
  navigation: any;
}

const { width, height } = Dimensions.get('window');

const MarketingScreen: React.FC<MarketingScreenProps> = ({ navigation }) => {
  const { isDark } = useTheme();
  const [stats, setStats] = useState({
    users: 150000,
    connections: 2500000,
    countries: 195,
    satisfaction: 4.8,
  });

  // Animations
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate stats
    const interval = setInterval(() => {
      setStats(prev => ({
        users: prev.users + Math.floor(Math.random() * 50),
        connections: prev.connections + Math.floor(Math.random() * 100),
        countries: prev.countries,
        satisfaction: prev.satisfaction,
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const textColor = isDark ? '#ffffff' : '#1f2937';
  const subtitleColor = isDark ? '#cbd5e1' : '#64748b';
  const cardBg = isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.9)';
  const gradientColors = isDark 
    ? ['#0f172a', '#1e293b', '#334155'] as const
    : ['#f8fafc', '#e2e8f0', '#cbd5e1'] as const;

  const handleDownloadApp = async () => {
    try {
      await Linking.openURL('https://apps.apple.com/app/meetopia');
    } catch (error) {
      console.log('App Store link not available yet');
    }
  };

  const handleVisitWebsite = async () => {
    try {
      await Linking.openURL('https://meetopia.app');
    } catch (error) {
      console.log('Website not available');
    }
  };

  const handleShareApp = async () => {
    try {
      await Share.share({
        message: 'Check out Meetopia - The best way to connect with people worldwide! 🌍✨',
        url: 'https://meetopia.app',
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const features = [
    {
      emoji: '🎥',
      title: 'HD Video Chat',
      description: 'Crystal clear video calls with advanced compression technology',
      color: '#3b82f6',
    },
    {
      emoji: '🌍',
      title: 'Global Matching',
      description: 'Connect with people from 195+ countries worldwide',
      color: '#10b981',
    },
    {
      emoji: '🎨',
      title: 'Virtual Backgrounds',
      description: 'Express yourself with fun filters and backgrounds',
      color: '#8b5cf6',
    },
    {
      emoji: '🔒',
      title: 'Secure & Private',
      description: 'Enterprise-grade encryption and privacy protection',
      color: '#f59e0b',
    },
    {
      emoji: '⚡',
      title: 'Instant Connection',
      description: 'Connect in seconds with our smart matching algorithm',
      color: '#ef4444',
    },
    {
      emoji: '📱',
      title: 'Cross-Platform',
      description: 'Available on iOS, Android, and Web browsers',
      color: '#06b6d4',
    },
  ];

  const testimonials = [
    {
      text: "Meetopia changed how I connect with people! Amazing quality and so easy to use.",
      author: "Sarah M.",
      rating: 5,
    },
    {
      text: "Best video chat app I've ever used. The virtual backgrounds are incredible!",
      author: "David L.",
      rating: 5,
    },
    {
      text: "Safe, secure, and fun. I've made friends from all over the world!",
      author: "Maria G.",
      rating: 5,
    },
  ];

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={[styles.backButton, { backgroundColor: cardBg }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]}>
            Meetopia
          </Text>
          <TouchableOpacity 
            style={[styles.shareButton, { backgroundColor: cardBg }]}
            onPress={handleShareApp}
          >
            <Text style={styles.shareIcon}>📤</Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section */}
          <Animated.View 
            style={[
              styles.heroSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoM}>M</Text>
              </View>
              <Text style={styles.logoGlow}>✨</Text>
            </View>
            
            <Text style={[styles.heroTitle, { color: textColor }]}>
              Connect Worldwide
            </Text>
            
            <LinearGradient
              colors={['#3b82f6', '#8b5cf6', '#ec4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.heroBadge}
            >
              <Text style={styles.heroBadgeText}>🌟 World's #1 Video Chat App</Text>
            </LinearGradient>
            
            <Text style={[styles.heroDescription, { color: subtitleColor }]}>
              Join millions of people connecting across the globe with HD video chat, 
              smart matching, and enterprise-grade security.
            </Text>

            <TouchableOpacity 
              style={styles.ctaButton}
              onPress={handleDownloadApp}
            >
              <LinearGradient
                colors={['#3b82f6', '#8b5cf6']}
                style={styles.ctaGradient}
              >
                <Text style={styles.ctaText}>📱 Download Free</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Stats Section */}
          <View style={[styles.statsContainer, { backgroundColor: cardBg }]}>
            <Text style={[styles.statsTitle, { color: textColor }]}>
              🔥 Trusted by Millions
            </Text>
            
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.users.toLocaleString()}+</Text>
                <Text style={[styles.statLabel, { color: subtitleColor }]}>Active Users</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.connections.toLocaleString()}+</Text>
                <Text style={[styles.statLabel, { color: subtitleColor }]}>Connections</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.countries}</Text>
                <Text style={[styles.statLabel, { color: subtitleColor }]}>Countries</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.satisfaction}⭐</Text>
                <Text style={[styles.statLabel, { color: subtitleColor }]}>App Rating</Text>
              </View>
            </View>
          </View>

          {/* Features Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              ✨ Why Choose Meetopia?
            </Text>
            
            <View style={styles.featuresGrid}>
              {features.map((feature, index) => (
                <View 
                  key={index}
                  style={[styles.featureCard, { backgroundColor: cardBg }]}
                >
                  <View style={[styles.featureIcon, { backgroundColor: `${feature.color}20` }]}>
                    <Text style={styles.featureEmoji}>{feature.emoji}</Text>
                  </View>
                  <Text style={[styles.featureTitle, { color: textColor }]}>
                    {feature.title}
                  </Text>
                  <Text style={[styles.featureDesc, { color: subtitleColor }]}>
                    {feature.description}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Testimonials */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              💬 What Users Say
            </Text>
            
            {testimonials.map((testimonial, index) => (
              <View 
                key={index}
                style={[styles.testimonialCard, { backgroundColor: cardBg }]}
              >
                <View style={styles.starsContainer}>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Text key={i} style={styles.star}>⭐</Text>
                  ))}
                </View>
                <Text style={[styles.testimonialText, { color: textColor }]}>
                  "{testimonial.text}"
                </Text>
                <Text style={[styles.testimonialAuthor, { color: subtitleColor }]}>
                  — {testimonial.author}
                </Text>
              </View>
            ))}
          </View>

          {/* Call to Action */}
          <View style={[styles.ctaSection, { backgroundColor: cardBg }]}>
            <Text style={styles.ctaEmoji}>🚀</Text>
            <Text style={[styles.ctaTitle, { color: textColor }]}>
              Ready to Connect?
            </Text>
            <Text style={[styles.ctaDescription, { color: subtitleColor }]}>
              Join millions of users worldwide and start meaningful conversations today!
            </Text>
            
            <View style={styles.ctaButtons}>
              <TouchableOpacity 
                style={styles.primaryCta}
                onPress={handleDownloadApp}
              >
                <LinearGradient
                  colors={['#3b82f6', '#8b5cf6']}
                  style={styles.primaryCtaGradient}
                >
                  <Text style={styles.primaryCtaText}>📱 Get Meetopia</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.secondaryCta, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}
                onPress={handleVisitWebsite}
              >
                <Text style={[styles.secondaryCtaText, { color: '#3b82f6' }]}>
                  🌐 Visit Website
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: subtitleColor }]}>
              © 2024 Meetopia. Connecting the world, one conversation at a time.
            </Text>
            
            <View style={styles.footerLinks}>
              <TouchableOpacity onPress={() => navigation.navigate('Support')}>
                <Text style={styles.footerLink}>Support</Text>
              </TouchableOpacity>
              <Text style={[styles.footerSeparator, { color: subtitleColor }]}>•</Text>
              <TouchableOpacity onPress={handleVisitWebsite}>
                <Text style={styles.footerLink}>Website</Text>
              </TouchableOpacity>
              <Text style={[styles.footerSeparator, { color: subtitleColor }]}>•</Text>
              <TouchableOpacity onPress={() => navigation.navigate('About')}>
                <Text style={styles.footerLink}>About</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 20,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  shareButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareIcon: {
    fontSize: 18,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoM: {
    fontSize: 36,
    fontWeight: '800',
    color: '#1f2937',
  },
  logoGlow: {
    fontSize: 32,
    marginLeft: 12,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 42,
  },
  heroBadge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginBottom: 24,
  },
  heroBadgeText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  heroDescription: {
    fontSize: 18,
    lineHeight: 28,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  ctaButton: {
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  ctaGradient: {
    paddingVertical: 18,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  ctaText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  statsContainer: {
    padding: 24,
    borderRadius: 20,
    marginVertical: 30,
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
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#3b82f6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  section: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureEmoji: {
    fontSize: 28,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDesc: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  testimonialCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  star: {
    fontSize: 16,
    marginRight: 2,
  },
  testimonialText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  testimonialAuthor: {
    fontSize: 14,
    fontWeight: '600',
  },
  ctaSection: {
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    marginVertical: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  ctaTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
  },
  ctaDescription: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 32,
  },
  ctaButtons: {
    width: '100%',
    gap: 12,
  },
  primaryCta: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  primaryCtaGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  primaryCtaText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryCta: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignItems: 'center',
  },
  secondaryCtaText: {
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerLink: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },
  footerSeparator: {
    marginHorizontal: 12,
    fontSize: 14,
  },
  bottomSpacing: {
    height: 50,
  },
});

export default MarketingScreen; 