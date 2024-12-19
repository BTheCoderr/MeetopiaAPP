'use client'
import { createContext, useContext, useState } from 'react';
import { UserProfile } from '@/types/user';

interface UserContextType {
  user: UserProfile | null;
  addCoins: (amount: number) => void;
  removeCoins: (amount: number) => void;
  upgradeToPremium: () => void;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>({
    id: '1', // In real app, this would come from authentication
    coins: 100,
    isPremium: false,
  });

  const addCoins = (amount: number) => {
    setUser(prev => prev ? { ...prev, coins: prev.coins + amount } : null);
  };

  const removeCoins = (amount: number) => {
    setUser(prev => prev ? { ...prev, coins: Math.max(0, prev.coins - amount) } : null);
  };

  const upgradeToPremium = () => {
    setUser(prev => prev ? {
      ...prev,
      isPremium: true,
      premiumUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    } : null);
  };

  return (
    <UserContext.Provider value={{ user, addCoins, removeCoins, upgradeToPremium }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
}; 