import AsyncStorage from '@react-native-async-storage/async-storage';
import io, {Socket} from 'socket.io-client';

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  bio: string;
  photos: string[];
  location: {
    latitude: number;
    longitude: number;
    city: string;
    country: string;
  };
  preferences: UserPreferences;
  interests: string[];
  occupation: string;
  education: string;
  height: number;
  isOnline: boolean;
  lastSeen: Date;
  verified: boolean;
}

export interface UserPreferences {
  ageRange: {min: number; max: number};
  maxDistance: number; // in kilometers
  interestedIn: 'men' | 'women' | 'both';
  lookingFor: 'casual' | 'serious' | 'friendship' | 'both';
  dealBreakers: string[];
  mustHaves: string[];
}

export interface Match {
  id: string;
  userId: string;
  matchedUserId: string;
  matchedUserProfile: UserProfile;
  compatibilityScore: number;
  matchedAt: Date;
  isLiked: boolean;
  isMatched: boolean; // Both users liked each other
  chatRoomId?: string;
  commonInterests: string[];
  matchReason: string;
}

export interface SwipeAction {
  userId: string;
  targetUserId: string;
  action: 'like' | 'pass' | 'superlike';
  timestamp: Date;
}

export interface MatchingStats {
  totalSwipes: number;
  totalLikes: number;
  totalMatches: number;
  profileViews: number;
  successRate: number;
}

class MatchingService {
  private socket: Socket | null = null;
  private currentUserId: string = '';
  private isConnected: boolean = false;

  // Callbacks
  private onNewMatchCallback?: (match: Match) => void;
  private onProfilesReceivedCallback?: (profiles: UserProfile[]) => void;
  private onMatchLikedCallback?: (matchId: string) => void;
  private onConnectionStateChangedCallback?: (connected: boolean) => void;
  private onErrorCallback?: (error: string) => void;

  async initialize(socketUrl: string, userId: string): Promise<void> {
    try {
      this.currentUserId = userId;

      // Connect to matching server
      this.socket = io(socketUrl, {
        auth: {
          userId: userId,
        },
      });

      this.setupSocketListeners();

    } catch (error) {
      console.error('Error initializing matching service:', error);
      this.onErrorCallback?.('Failed to initialize matching service');
      throw error;
    }
  }

  private setupSocketListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to matching server');
      this.isConnected = true;
      this.onConnectionStateChangedCallback?.(true);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from matching server');
      this.isConnected = false;
      this.onConnectionStateChangedCallback?.(false);
    });

    this.socket.on('new-match', (data: any) => {
      const match: Match = {
        id: data.id,
        userId: data.userId,
        matchedUserId: data.matchedUserId,
        matchedUserProfile: data.matchedUserProfile,
        compatibilityScore: data.compatibilityScore,
        matchedAt: new Date(data.matchedAt),
        isLiked: data.isLiked,
        isMatched: data.isMatched,
        chatRoomId: data.chatRoomId,
        commonInterests: data.commonInterests || [],
        matchReason: data.matchReason || 'Great compatibility!',
      };

      this.onNewMatchCallback?.(match);
      this.saveMatchToStorage(match);
    });

    this.socket.on('profiles', (data: {profiles: any[]}) => {
      const profiles: UserProfile[] = data.profiles.map(p => ({
        ...p,
        lastSeen: new Date(p.lastSeen),
      }));

      this.onProfilesReceivedCallback?.(profiles);
    });

    this.socket.on('match-liked', (data: {matchId: string}) => {
      this.onMatchLikedCallback?.(data.matchId);
    });

    this.socket.on('error', (error: string) => {
      console.error('Matching error:', error);
      this.onErrorCallback?.(error);
    });
  }

  // Profile management
  async updateUserProfile(profile: Partial<UserProfile>): Promise<void> {
    if (!this.socket || !this.isConnected) {
      throw new Error('Not connected to matching server');
    }

    this.socket.emit('update-profile', {
      userId: this.currentUserId,
      profile: profile,
    });

    // Save to local storage
    await this.saveUserProfile(profile);
  }

  async getUserProfile(): Promise<UserProfile | null> {
    try {
      const profileJson = await AsyncStorage.getItem(`user_profile_${this.currentUserId}`);
      if (profileJson) {
        const profile = JSON.parse(profileJson);
        return {
          ...profile,
          lastSeen: new Date(profile.lastSeen),
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  private async saveUserProfile(profile: Partial<UserProfile>): Promise<void> {
    try {
      const existingProfile = await this.getUserProfile();
      const updatedProfile = existingProfile ? {...existingProfile, ...profile} : profile;
      
      await AsyncStorage.setItem(
        `user_profile_${this.currentUserId}`,
        JSON.stringify(updatedProfile)
      );
    } catch (error) {
      console.error('Error saving user profile:', error);
    }
  }

  // Matching and swiping
  async requestProfiles(limit: number = 10): Promise<void> {
    if (!this.socket || !this.isConnected) {
      throw new Error('Not connected to matching server');
    }

    this.socket.emit('request-profiles', {
      userId: this.currentUserId,
      limit: limit,
    });
  }

  async swipeProfile(targetUserId: string, action: 'like' | 'pass' | 'superlike'): Promise<void> {
    if (!this.socket || !this.isConnected) {
      throw new Error('Not connected to matching server');
    }

    const swipeAction: SwipeAction = {
      userId: this.currentUserId,
      targetUserId: targetUserId,
      action: action,
      timestamp: new Date(),
    };

    this.socket.emit('swipe', swipeAction);

    // Save swipe action locally
    await this.saveSwipeAction(swipeAction);
  }

  private async saveSwipeAction(swipeAction: SwipeAction): Promise<void> {
    try {
      const key = `swipe_actions_${this.currentUserId}`;
      const existingActions = await this.getSwipeActions();
      const updatedActions = [...existingActions, swipeAction];
      
      await AsyncStorage.setItem(key, JSON.stringify(updatedActions));
    } catch (error) {
      console.error('Error saving swipe action:', error);
    }
  }

  async getSwipeActions(): Promise<SwipeAction[]> {
    try {
      const key = `swipe_actions_${this.currentUserId}`;
      const actionsJson = await AsyncStorage.getItem(key);
      
      if (actionsJson) {
        const actions = JSON.parse(actionsJson);
        return actions.map((a: any) => ({
          ...a,
          timestamp: new Date(a.timestamp),
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Error getting swipe actions:', error);
      return [];
    }
  }

  // Match management
  async getMatches(): Promise<Match[]> {
    try {
      const key = `matches_${this.currentUserId}`;
      const matchesJson = await AsyncStorage.getItem(key);
      
      if (matchesJson) {
        const matches = JSON.parse(matchesJson);
        return matches.map((m: any) => ({
          ...m,
          matchedAt: new Date(m.matchedAt),
          matchedUserProfile: {
            ...m.matchedUserProfile,
            lastSeen: new Date(m.matchedUserProfile.lastSeen),
          },
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Error getting matches:', error);
      return [];
    }
  }

  private async saveMatchToStorage(match: Match): Promise<void> {
    try {
      const key = `matches_${this.currentUserId}`;
      const existingMatches = await this.getMatches();
      
      // Check if match already exists
      const matchExists = existingMatches.some(m => m.id === match.id);
      if (!matchExists) {
        const updatedMatches = [...existingMatches, match].sort(
          (a, b) => new Date(b.matchedAt).getTime() - new Date(a.matchedAt).getTime()
        );
        
        await AsyncStorage.setItem(key, JSON.stringify(updatedMatches));
      }
    } catch (error) {
      console.error('Error saving match to storage:', error);
    }
  }

  async removeMatch(matchId: string): Promise<void> {
    try {
      const key = `matches_${this.currentUserId}`;
      const existingMatches = await this.getMatches();
      const updatedMatches = existingMatches.filter(m => m.id !== matchId);
      
      await AsyncStorage.setItem(key, JSON.stringify(updatedMatches));

      // Notify server
      if (this.socket && this.isConnected) {
        this.socket.emit('remove-match', {
          userId: this.currentUserId,
          matchId: matchId,
        });
      }
    } catch (error) {
      console.error('Error removing match:', error);
    }
  }

  // Compatibility calculation
  calculateCompatibilityScore(userProfile: UserProfile, targetProfile: UserProfile): number {
    let score = 0;
    let maxScore = 0;

    // Age compatibility (20 points)
    maxScore += 20;
    const ageDiff = Math.abs(userProfile.age - targetProfile.age);
    if (ageDiff <= 2) score += 20;
    else if (ageDiff <= 5) score += 15;
    else if (ageDiff <= 10) score += 10;
    else if (ageDiff <= 15) score += 5;

    // Common interests (30 points)
    maxScore += 30;
    const commonInterests = userProfile.interests.filter(interest =>
      targetProfile.interests.includes(interest)
    );
    const interestScore = Math.min(30, (commonInterests.length / Math.max(userProfile.interests.length, 1)) * 30);
    score += interestScore;

    // Location proximity (20 points)
    maxScore += 20;
    const distance = this.calculateDistance(
      userProfile.location.latitude,
      userProfile.location.longitude,
      targetProfile.location.latitude,
      targetProfile.location.longitude
    );
    if (distance <= 5) score += 20;
    else if (distance <= 15) score += 15;
    else if (distance <= 30) score += 10;
    else if (distance <= 50) score += 5;

    // Education compatibility (15 points)
    maxScore += 15;
    if (userProfile.education === targetProfile.education) score += 15;
    else if (this.isEducationCompatible(userProfile.education, targetProfile.education)) score += 10;

    // Looking for compatibility (15 points)
    maxScore += 15;
    if (userProfile.preferences.lookingFor === targetProfile.preferences.lookingFor ||
        userProfile.preferences.lookingFor === 'both' ||
        targetProfile.preferences.lookingFor === 'both') {
      score += 15;
    }

    return Math.round((score / maxScore) * 100);
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in kilometers
    return d;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private isEducationCompatible(edu1: string, edu2: string): boolean {
    const educationLevels = [
      'High School',
      'Some College',
      'Bachelor\'s Degree',
      'Master\'s Degree',
      'PhD/Doctorate',
    ];

    const index1 = educationLevels.indexOf(edu1);
    const index2 = educationLevels.indexOf(edu2);

    if (index1 === -1 || index2 === -1) return false;

    return Math.abs(index1 - index2) <= 1;
  }

  // Statistics
  async getMatchingStats(): Promise<MatchingStats> {
    try {
      const swipeActions = await this.getSwipeActions();
      const matches = await this.getMatches();

      const totalSwipes = swipeActions.length;
      const totalLikes = swipeActions.filter(a => a.action === 'like' || a.action === 'superlike').length;
      const totalMatches = matches.filter(m => m.isMatched).length;
      const successRate = totalLikes > 0 ? (totalMatches / totalLikes) * 100 : 0;

      return {
        totalSwipes,
        totalLikes,
        totalMatches,
        profileViews: 0, // TODO: Implement profile view tracking
        successRate: Math.round(successRate),
      };
    } catch (error) {
      console.error('Error getting matching stats:', error);
      return {
        totalSwipes: 0,
        totalLikes: 0,
        totalMatches: 0,
        profileViews: 0,
        successRate: 0,
      };
    }
  }

  // Event handlers
  onNewMatch(callback: (match: Match) => void): void {
    this.onNewMatchCallback = callback;
  }

  onProfilesReceived(callback: (profiles: UserProfile[]) => void): void {
    this.onProfilesReceivedCallback = callback;
  }

  onMatchLiked(callback: (matchId: string) => void): void {
    this.onMatchLikedCallback = callback;
  }

  onConnectionStateChanged(callback: (connected: boolean) => void): void {
    this.onConnectionStateChangedCallback = callback;
  }

  onError(callback: (error: string) => void): void {
    this.onErrorCallback = callback;
  }

  // Utility methods
  isConnectedToServer(): boolean {
    return this.isConnected;
  }

  getCurrentUserId(): string {
    return this.currentUserId;
  }

  // Cleanup
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.isConnected = false;
    this.currentUserId = '';
  }

  // Mock data generators for development
  generateMockProfiles(count: number = 10): UserProfile[] {
    const names = ['Alex', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Riley', 'Avery', 'Quinn', 'Sage', 'River'];
    const interests = ['Travel', 'Photography', 'Cooking', 'Fitness', 'Music', 'Art', 'Reading', 'Dancing', 'Hiking', 'Gaming'];
    const occupations = ['Engineer', 'Designer', 'Teacher', 'Doctor', 'Artist', 'Writer', 'Entrepreneur', 'Lawyer', 'Chef', 'Photographer'];
    const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'];

    return Array.from({length: count}, (_, index) => ({
      id: `mock_user_${index + 1}`,
      name: names[index % names.length],
      age: Math.floor(Math.random() * 20) + 22, // 22-42
      bio: `I love ${interests[Math.floor(Math.random() * interests.length)].toLowerCase()} and ${interests[Math.floor(Math.random() * interests.length)].toLowerCase()}. Looking for someone to share adventures with!`,
      photos: [`https://picsum.photos/400/600?random=${index + 1}`],
      location: {
        latitude: 40.7128 + (Math.random() - 0.5) * 0.1,
        longitude: -74.0060 + (Math.random() - 0.5) * 0.1,
        city: cities[Math.floor(Math.random() * cities.length)],
        country: 'USA',
      },
      preferences: {
        ageRange: {min: 22, max: 35},
        maxDistance: 50,
        interestedIn: Math.random() > 0.5 ? 'men' : 'women',
        lookingFor: Math.random() > 0.5 ? 'serious' : 'casual',
        dealBreakers: [],
        mustHaves: [],
      },
      interests: interests.slice(0, Math.floor(Math.random() * 5) + 3),
      occupation: occupations[Math.floor(Math.random() * occupations.length)],
      education: 'Bachelor\'s Degree',
      height: Math.floor(Math.random() * 30) + 160, // 160-190 cm
      isOnline: Math.random() > 0.3,
      lastSeen: new Date(Date.now() - Math.random() * 86400000), // Within last 24 hours
      verified: Math.random() > 0.4,
    }));
  }
}

export default new MatchingService(); 