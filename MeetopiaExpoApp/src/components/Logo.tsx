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
          </Defs>
          
          {/* Main circle with gradient */}
          <Circle cx="24" cy="24" r="22" fill="url(#logoGradient)" />
          
          {/* Inner circle for contrast */}
          <Circle cx="24" cy="24" r="20" fill="rgba(255,255,255,0.1)" />
          
          {/* T Letter - Top horizontal line */}
          <Path
            d="M12 16 L36 16"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
          />
          
          {/* T Letter - Vertical line */}
          <Path
            d="M24 16 L24 36"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
          />
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
                color: isDarkTheme ? '#A78BFA' : '#8B5CF6'
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