export interface UserProfile {
  id: string;
  coins: number;
  isPremium: boolean;
  premiumUntil?: Date;
} 