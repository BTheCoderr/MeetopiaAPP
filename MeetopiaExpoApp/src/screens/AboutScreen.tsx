import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';

const {width} = Dimensions.get('window');

const teamMembers = [
  {
    name: 'Sarah Chen',
    role: 'CEO & Co-Founder',
    bio: 'Former Google engineer passionate about connecting people through technology',
    emoji: '👩‍💼'
  },
  {
    name: 'Marcus Johnson',
    role: 'CTO & Co-Founder',
    bio: 'AI/ML expert with 10+ years in video technology and real-time communications',
    emoji: '👨‍💻'
  },
  {
    name: 'Elena Rodriguez',
    role: 'Head of Design',
    bio: 'Award-winning UX designer focused on creating inclusive and accessible experiences',
    emoji: '🎨'
  },
  {
    name: 'David Kim',
    role: 'Head of Security',
    bio: 'Cybersecurity specialist ensuring safe and private connections for all users',
    emoji: '🔒'
  }
];

const values = [
  {
    icon: '🤝',
    title: 'Authentic Connections',
    description: 'We believe in fostering genuine relationships built on trust and mutual respect'
  },
  {
    icon: '🌍',
    title: 'Global Inclusivity',
    description: 'Breaking down barriers and connecting people across cultures, languages, and backgrounds'
  },
  {
    icon: '🔒',
    title: 'Privacy First',
    description: 'Your safety and privacy are our top priorities in everything we build'
  },
  {
    icon: '✨',
    title: 'Innovation',
    description: 'Constantly pushing the boundaries of what\'s possible in digital communication'
  }
];

const milestones = [
  {
    year: '2020',
    title: 'Founded',
    description: 'Started with a vision to revolutionize online dating and networking'
  },
  {
    year: '2021',
    title: '100K Users',
    description: 'Reached our first major milestone with users from 50+ countries'
  },
  {
    year: '2022',
    title: 'AI Matching',
    description: 'Launched our revolutionary AI-powered matching algorithm'
  },
  {
    year: '2023',
    title: '1M+ Connections',
    description: 'Facilitated over 1 million meaningful connections worldwide'
  },
  {
    year: '2024',
    title: 'Global Expansion',
    description: 'Now serving users in 195+ countries with 50+ language support'
  }
];

const AboutScreen: React.FC = () => {
  const navigation = useNavigation();

  const renderTeamMember = (member: any, index: number) => (
    <View key={member.name} style={styles.teamCard}>
      <Text style={styles.memberEmoji}>{member.emoji}</Text>
      <Text style={styles.memberName}>{member.name}</Text>
      <Text style={styles.memberRole}>{member.role}</Text>
      <Text style={styles.memberBio}>{member.bio}</Text>
    </View>
  );

  const renderValue = (value: any, index: number) => (
    <View key={value.title} style={styles.valueCard}>
      <View style={styles.valueIcon}>
        <Text style={styles.valueEmoji}>{value.icon}</Text>
      </View>
      <Text style={styles.valueTitle}>{value.title}</Text>
      <Text style={styles.valueDescription}>{value.description}</Text>
    </View>
  );

  const renderMilestone = (milestone: any, index: number) => (
    <View key={milestone.year} style={styles.milestoneItem}>
      <View style={styles.milestoneYear}>
        <Text style={styles.milestoneYearText}>{milestone.year}</Text>
      </View>
      <View style={styles.milestoneContent}>
        <Text style={styles.milestoneTitle}>{milestone.title}</Text>
        <Text style={styles.milestoneDescription}>{milestone.description}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <View style={styles.headerIcon}>
              <Text style={styles.headerIconText}>💫</Text>
            </View>
            <Text style={styles.headerTitle}>About Meetopia</Text>
            <Text style={styles.headerSubtitle}>
              Connecting hearts and minds across the globe through innovative technology
            </Text>
          </View>
        </View>

        {/* Mission Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <View style={styles.missionCard}>
            <Text style={styles.missionText}>
              To create meaningful connections that transcend geographical boundaries, 
              cultural differences, and language barriers. We believe everyone deserves 
              to find their perfect match and build lasting relationships in a safe, 
              inclusive environment.
            </Text>
          </View>
        </View>

        {/* Story Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Story</Text>
          <View style={styles.storyCard}>
            <Text style={styles.storyText}>
              Founded in 2020 by a team of passionate engineers and designers, 
              Meetopia was born from the belief that technology should bring people 
              closer together, not drive them apart.
            </Text>
            <Text style={styles.storyText}>
              What started as a simple video chat platform has evolved into a 
              comprehensive ecosystem for meaningful connections, powered by 
              cutting-edge AI and built with privacy and safety at its core.
            </Text>
          </View>
        </View>

        {/* Values Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Values</Text>
          <View style={styles.valuesGrid}>
            {values.map(renderValue)}
          </View>
        </View>

        {/* Timeline Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Journey</Text>
          <View style={styles.timeline}>
            {milestones.map(renderMilestone)}
          </View>
        </View>

        {/* Team Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meet Our Team</Text>
          <Text style={styles.sectionSubtitle}>
            The passionate people behind Meetopia's success
          </Text>
          <View style={styles.teamGrid}>
            {teamMembers.map(renderTeamMember)}
          </View>
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>Join Our Global Community</Text>
          <Text style={styles.ctaSubtitle}>
            Be part of the story. Connect with people who share your interests, 
            values, and dreams from around the world.
          </Text>
          
          <View style={styles.ctaButtons}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation.navigate('Matching' as never)}
            >
              <Text style={styles.primaryButtonText}>💕 Start Connecting</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigation.navigate('Features' as never)}
            >
              <Text style={styles.secondaryButtonText}>Explore Features →</Text>
            </TouchableOpacity>
          </View>
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
    backgroundColor: 'linear-gradient(135deg, #3B82F6, #8B5CF6, #6366F1)',
    paddingHorizontal: 20,
    paddingVertical: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    marginBottom: 20,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerContent: {
    alignItems: 'center',
  },
  headerIcon: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerIconText: {
    fontSize: 40,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
  },
  headerSubtitle: {
    fontSize: 18,
    color: '#e0e7ff',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 20,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  missionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  missionText: {
    fontSize: 18,
    color: '#374151',
    lineHeight: 28,
    textAlign: 'center',
  },
  storyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  storyText: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 26,
    marginBottom: 16,
  },
  valuesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  valueCard: {
    width: (width - 56) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  valueIcon: {
    width: 60,
    height: 60,
    backgroundColor: '#f3f4f6',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  valueEmoji: {
    fontSize: 28,
  },
  valueTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  valueDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  timeline: {
    gap: 20,
  },
  milestoneItem: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  milestoneYear: {
    width: 60,
    height: 60,
    backgroundColor: '#3B82F6',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  milestoneYearText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  milestoneContent: {
    flex: 1,
  },
  milestoneTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  milestoneDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  teamGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  teamCard: {
    width: (width - 56) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  memberEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  memberName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  memberRole: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  memberBio: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  ctaSection: {
    backgroundColor: 'linear-gradient(135deg, #3B82F6, #8B5CF6, #6366F1)',
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
  },
  ctaSubtitle: {
    fontSize: 18,
    color: '#e0e7ff',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  ctaButtons: {
    width: '100%',
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#3B82F6',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: '#ffffff',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AboutScreen; 