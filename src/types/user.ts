export interface UserProfile {
  id: string;
  username: string;
  displayName?: string;
  avatar?: string;
  age?: number;
  location?: {
    country: string;
    city?: string;
    timezone: string;
  };
  interests: string[];
  bio?: string;
  languages: string[];
  preferences: UserPreferences;
  settings: UserSettings;
  stats: UserStats;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  matching: MatchingPreferences;
  privacy: PrivacyPreferences;
  notifications: NotificationPreferences;
  accessibility: AccessibilityPreferences;
}

export interface MatchingPreferences {
  ageRange: {
    min: number;
    max: number;
  };
  languages: string[];
  interests: string[];
  location: {
    sameCountry?: boolean;
    sameTimezone?: boolean;
    maxDistance?: number; // in km
  };
  chatType: 'video' | 'text' | 'both';
  sessionLength: '3min' | '5min' | '10min' | 'unlimited';
  maturityLevel: 'all' | 'casual' | 'serious';
}

export interface PrivacyPreferences {
  showAge: boolean;
  showLocation: boolean;
  allowScreenshots: boolean;
  allowRecording: boolean;
  blockList: string[];
  reportHistory: string[];
}

export interface NotificationPreferences {
  newMatch: boolean;
  messageReceived: boolean;
  connectionLost: boolean;
  systemUpdates: boolean;
  emailNotifications: boolean;
}

export interface AccessibilityPreferences {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  closedCaptions: boolean;
  keyboardNavigation: boolean;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  videoQuality: 'auto' | 'high' | 'medium' | 'low';
  audioQuality: 'auto' | 'high' | 'medium' | 'low';
  autoConnect: boolean;
  showTutorial: boolean;
  betaFeatures: boolean;
}

export interface UserStats {
  totalChats: number;
  totalTime: number; // in minutes
  favoriteTimeSlot: string;
  averageSessionLength: number;
  reportsSent: number;
  reportsReceived: number;
  positiveRatings: number;
  negativeRatings: number;
  lastActive: Date;
}

export interface MatchingAlgorithm {
  compatibilityScore: number;
  factors: {
    interests: number;
    location: number;
    language: number;
    availability: number;
    preferences: number;
  };
  reasoning: string[];
}

export interface VirtualBackground {
  id: string;
  name: string;
  url: string;
  category: 'nature' | 'office' | 'abstract' | 'custom';
  premium?: boolean;
}

export interface ScreenShareOptions {
  allowAudio: boolean;
  quality: 'auto' | 'high' | 'medium' | 'low';
  fps: number;
  maxDuration: number; // in minutes
} 