import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Linking,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

interface SupportScreenProps {
  navigation: any;
}

const { width } = Dimensions.get('window');

const SupportScreen: React.FC<SupportScreenProps> = ({ navigation }) => {
  const { isDark } = useTheme();
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const textColor = isDark ? '#ffffff' : '#1f2937';
  const subtitleColor = isDark ? '#cbd5e1' : '#64748b';
  const cardBg = isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.9)';
  const gradientColors = isDark 
    ? ['#0f172a', '#1e293b', '#334155'] as const
    : ['#f8fafc', '#e2e8f0', '#cbd5e1'] as const;

  const handleEmailSupport = async () => {
    try {
      await Linking.openURL('mailto:support@meetopia.app?subject=Meetopia App Support');
    } catch (error) {
      Alert.alert('Error', 'Cannot open email client. Please email us at support@meetopia.app');
    }
  };

  const handleWebsiteSupport = async () => {
    try {
      await Linking.openURL('https://meetopia.app/support');
    } catch (error) {
      Alert.alert('Error', 'Cannot open website. Please visit meetopia.app/support');
    }
  };

  const handleReportBug = async () => {
    try {
      await Linking.openURL('mailto:bugs@meetopia.app?subject=Bug Report - Meetopia App');
    } catch (error) {
      Alert.alert('Error', 'Cannot open email client. Please email us at bugs@meetopia.app');
    }
  };

  const faqData = [
    {
      question: "How do I start a video chat?",
      answer: "Tap 'Start Connecting Now' on the home screen, and we'll match you with someone worldwide instantly!"
    },
    {
      question: "Is Meetopia safe and secure?",
      answer: "Yes! We use enterprise-grade encryption and have strict community guidelines. You can report any inappropriate behavior."
    },
    {
      question: "How does the matching system work?",
      answer: "Our smart algorithm matches you based on interests, location preferences, and availability for the best conversations."
    },
    {
      question: "Can I use virtual backgrounds?",
      answer: "Absolutely! We have a variety of fun virtual backgrounds and filters to express yourself during video chats."
    },
    {
      question: "What if I encounter technical issues?",
      answer: "Try restarting the app first. If issues persist, contact our support team at support@meetopia.app"
    },
    {
      question: "How do I create a profile?",
      answer: "Tap the Profile tab at the bottom, then 'Edit Profile' to add your interests, photo, and preferences."
    },
    {
      question: "Is Meetopia free to use?",
      answer: "Yes! Meetopia is completely free with unlimited video chats and all features included."
    },
    {
      question: "How do I report inappropriate behavior?",
      answer: "Use the report button during any chat, or email us at support@meetopia.app with details."
    }
  ];

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

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
            Support & Help
          </Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Welcome Section */}
          <View style={[styles.welcomeCard, { backgroundColor: cardBg }]}>
            <Text style={styles.welcomeEmoji}>🤝</Text>
            <Text style={[styles.welcomeTitle, { color: textColor }]}>
              We're Here to Help!
            </Text>
            <Text style={[styles.welcomeText, { color: subtitleColor }]}>
              Need assistance with Meetopia? We're committed to providing you with the best support experience.
            </Text>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              📞 Get Support
            </Text>
            
            <TouchableOpacity 
              style={[styles.actionCard, { backgroundColor: cardBg }]}
              onPress={handleEmailSupport}
            >
              <View style={styles.actionIcon}>
                <Text style={styles.actionEmoji}>📧</Text>
              </View>
              <View style={styles.actionContent}>
                <Text style={[styles.actionTitle, { color: textColor }]}>
                  Email Support
                </Text>
                <Text style={[styles.actionSubtitle, { color: subtitleColor }]}>
                  support@meetopia.app
                </Text>
              </View>
              <Text style={styles.actionArrow}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionCard, { backgroundColor: cardBg }]}
              onPress={handleWebsiteSupport}
            >
              <View style={styles.actionIcon}>
                <Text style={styles.actionEmoji}>🌐</Text>
              </View>
              <View style={styles.actionContent}>
                <Text style={[styles.actionTitle, { color: textColor }]}>
                  Website Support
                </Text>
                <Text style={[styles.actionSubtitle, { color: subtitleColor }]}>
                  meetopia.app/support
                </Text>
              </View>
              <Text style={styles.actionArrow}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionCard, { backgroundColor: cardBg }]}
              onPress={handleReportBug}
            >
              <View style={styles.actionIcon}>
                <Text style={styles.actionEmoji}>🐛</Text>
              </View>
              <View style={styles.actionContent}>
                <Text style={[styles.actionTitle, { color: textColor }]}>
                  Report Bug
                </Text>
                <Text style={[styles.actionSubtitle, { color: subtitleColor }]}>
                  bugs@meetopia.app
                </Text>
              </View>
              <Text style={styles.actionArrow}>→</Text>
            </TouchableOpacity>
          </View>

          {/* FAQ Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              ❓ Frequently Asked Questions
            </Text>
            
            {faqData.map((faq, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.faqCard, { backgroundColor: cardBg }]}
                onPress={() => toggleFAQ(index)}
              >
                <View style={styles.faqHeader}>
                  <Text style={[styles.faqQuestion, { color: textColor }]}>
                    {faq.question}
                  </Text>
                  <Text style={styles.faqToggle}>
                    {expandedFAQ === index ? '−' : '+'}
                  </Text>
                </View>
                {expandedFAQ === index && (
                  <Text style={[styles.faqAnswer, { color: subtitleColor }]}>
                    {faq.answer}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Contact Info */}
          <View style={[styles.contactCard, { backgroundColor: cardBg }]}>
            <Text style={styles.contactEmoji}>📱</Text>
            <Text style={[styles.contactTitle, { color: textColor }]}>
              Still Need Help?
            </Text>
            <Text style={[styles.contactText, { color: subtitleColor }]}>
              Our support team typically responds within 24 hours. 
              {'\n\n'}
              For urgent issues, please email support@meetopia.app with "URGENT" in the subject line.
            </Text>
            
            <TouchableOpacity 
              style={styles.contactButton}
              onPress={handleEmailSupport}
            >
              <LinearGradient
                colors={['#3b82f6', '#8b5cf6']}
                style={styles.contactButtonGradient}
              >
                <Text style={styles.contactButtonText}>Contact Support</Text>
              </LinearGradient>
            </TouchableOpacity>
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
    fontSize: 18,
    fontWeight: '700',
  },
  placeholder: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  welcomeCard: {
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  welcomeEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionEmoji: {
    fontSize: 24,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionArrow: {
    fontSize: 18,
    color: '#3b82f6',
    fontWeight: '600',
  },
  faqCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 16,
  },
  faqToggle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#3b82f6',
    width: 24,
    textAlign: 'center',
  },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  contactCard: {
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  contactEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  contactTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  contactText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 24,
  },
  contactButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  contactButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  contactButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  bottomSpacing: {
    height: 50,
  },
});

export default SupportScreen; 