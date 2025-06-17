import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AuthSession from 'expo-auth-session';
import * as Crypto from 'expo-crypto';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: 'google' | 'apple' | 'email';
  createdAt: string;
  stats: {
    connections: number;
    videoCalls: number;
    messages: number;
    totalCallTime: number;
  };
  preferences: {
    notifications: boolean;
    darkMode: boolean;
    language: string;
  };
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (name: string, email: string, password: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<boolean>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  updateStats: (statType: keyof User['stats'], increment: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    loadStoredUser();
  }, []);

  // Auto-create a guest user if none exists (for demo/development)
  useEffect(() => {
    if (!isLoading && !user) {
      createGuestUser();
    }
  }, [isLoading, user]);

  const createGuestUser = async () => {
    try {
      const guestUser = createUserObject(
        'Guest User',
        `guest_${Date.now()}@meetopia.demo`,
        'email'
      );
      await saveUser(guestUser);
    } catch (error) {
      console.error('Error creating guest user:', error);
    }
  };

  const loadStoredUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('meetopia_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading stored user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveUser = async (userData: User) => {
    try {
      await AsyncStorage.setItem('meetopia_user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const generateUserId = () => {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const createUserObject = (name: string, email: string, provider: User['provider']): User => {
    return {
      id: generateUserId(),
      name,
      email,
      provider,
      createdAt: new Date().toISOString(),
      stats: {
        connections: 0,
        videoCalls: 0,
        messages: 0,
        totalCallTime: 0,
      },
      preferences: {
        notifications: true,
        darkMode: false,
        language: 'en',
      },
    };
  };

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Simulate API call - in real app, this would hit your backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo, create user if email contains "demo"
      if (email.toLowerCase().includes('demo')) {
        const userData = createUserObject('Demo User', email, 'email');
        await saveUser(userData);
        return true;
      }
      
      // Check if user exists in local storage (simulate database)
      const existingUsers = await AsyncStorage.getItem('meetopia_users');
      const users = existingUsers ? JSON.parse(existingUsers) : [];
      
      const foundUser = users.find((u: any) => u.email === email);
      if (foundUser) {
        await saveUser(foundUser);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Sign in error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create new user
      const userData = createUserObject(name, email, 'email');
      
      // Save to "database" (local storage for demo)
      const existingUsers = await AsyncStorage.getItem('meetopia_users');
      const users = existingUsers ? JSON.parse(existingUsers) : [];
      users.push(userData);
      await AsyncStorage.setItem('meetopia_users', JSON.stringify(users));
      
      // Set as current user
      await saveUser(userData);
      return true;
    } catch (error) {
      console.error('Sign up error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // For demo purposes, create a Google user
      // In real app, this would use expo-auth-session with Google OAuth
      const userData = createUserObject(
        'Google User',
        'user@gmail.com',
        'google'
      );
      
      await saveUser(userData);
      return true;
    } catch (error) {
      console.error('Google sign in error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem('meetopia_user');
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const updateProfile = async (updates: Partial<User>): Promise<void> => {
    if (!user) return;
    
    try {
      const updatedUser = { ...user, ...updates };
      await saveUser(updatedUser);
    } catch (error) {
      console.error('Update profile error:', error);
    }
  };

  const updateStats = async (statType: keyof User['stats'], increment: number): Promise<void> => {
    if (!user) return;
    
    try {
      const updatedStats = {
        ...user.stats,
        [statType]: user.stats[statType] + increment,
      };
      
      const updatedUser = {
        ...user,
        stats: updatedStats,
      };
      
      await saveUser(updatedUser);
    } catch (error) {
      console.error('Update stats error:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    updateProfile,
    updateStats,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 