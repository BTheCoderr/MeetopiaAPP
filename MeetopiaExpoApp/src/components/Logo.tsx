import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Svg, Circle, Defs, LinearGradient, Stop, Path } from 'react-native-svg';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  isDarkTheme?: boolean;
  onPress?: () => void;
}

export default function Logo({ 
  size = 'md', 
  showText = true,
  isDarkTheme = false,
  onPress
}: LogoProps) {
  const dimensions = {
    sm: { iconSize: 32, containerSize: 40 },
    md: { iconSize: 40, containerSize: 50 },
    lg: { iconSize: 48, containerSize: 60 }
  };

  const textSizes = {
    sm: { title: 18, subtitle: 10 },
    md: { title: 22, subtitle: 12 },
    lg: { title: 28, subtitle: 14 }
  };

  const { iconSize, containerSize } = dimensions[size];
  const { title: titleSize, subtitle: subtitleSize } = textSizes[size];

  const LogoContent = () => (
    <View style={styles.logoContainer}>
      {/* Custom SVG Logo */}
      <View style={[styles.iconContainer, { width: containerSize, height: containerSize }]}>
        <Svg width={iconSize} height={iconSize} viewBox="0 0 48 48">
          <Defs>
            <LinearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#3B82F6" />
              <Stop offset="50%" stopColor="#8B5CF6" />
              <Stop offset="100%" stopColor="#EC4899" />
            </LinearGradient>
            <LinearGradient id="innerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#60A5FA" />
              <Stop offset="100%" stopColor="#A78BFA" />
            </LinearGradient>
          </Defs>
          
          {/* Main circle with gradient */}
          <Circle cx="24" cy="24" r="22" fill="url(#logoGradient)" />
          
          {/* Inner highlight circle */}
          <Circle cx="24" cy="24" r="18" fill="url(#innerGradient)" opacity="0.8" />
          
          {/* Connection nodes - representing meeting people */}
          <Circle cx="16" cy="16" r="3" fill="white" opacity="0.9" />
          <Circle cx="32" cy="16" r="3" fill="white" opacity="0.9" />
          <Circle cx="24" cy="32" r="3" fill="white" opacity="0.9" />
          
          {/* Connection lines */}
          <Path
            d="M16 16 L32 16 M24 16 L24 32"
            stroke="white"
            strokeWidth="2"
            opacity="0.7"
            strokeLinecap="round"
          />
          
          {/* Center meeting point */}
          <Circle cx="24" cy="20" r="2" fill="white" />
        </Svg>
      </View>

      {showText && (
        <View style={styles.textContainer}>
          <View style={styles.titleContainer}>
            <Text style={[
              styles.titleMeet, 
              { 
                fontSize: titleSize,
                color: isDarkTheme ? '#60A5FA' : '#3B82F6'
              }
            ]}>
              Meet
            </Text>
            <Text style={[
              styles.titleOpia, 
              { 
                fontSize: titleSize,
                color: isDarkTheme ? '#ffffff' : '#1f2937'
              }
            ]}>
              opia
            </Text>
          </View>
          <Text style={[
            styles.subtitle, 
            { 
              fontSize: subtitleSize,
              color: isDarkTheme ? '#cbd5e1' : '#6b7280'
            }
          ]}>
            Connect Worldwide
          </Text>
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} style={styles.touchable}>
        <LogoContent />
      </TouchableOpacity>
    );
  }

  return <LogoContent />;
}

const styles = StyleSheet.create({
  touchable: {
    alignSelf: 'flex-start',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    alignItems: 'flex-start',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  titleMeet: {
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  titleOpia: {
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontWeight: '600',
    letterSpacing: 0.5,
    marginTop: 2,
  },
}); 