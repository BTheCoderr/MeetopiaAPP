export interface UserProfile {
  id: string
  name: string
  age: number
  location: string
  interests: string[]
  preferences: MatchPreferences
  blockedUsers: string[]
  reports: Report[]
}

export interface MatchPreferences {
  ageRange: [number, number]
  location?: string
  interests: string[]
  videoOnly: boolean
}

export interface Report {
  id: string
  reportedUserId: string
  reporterId: string
  reason: ReportReason
  details?: string
  timestamp: Date
  status: 'pending' | 'reviewed' | 'resolved'
}

export type ReportReason = 
  | 'inappropriate_behavior'
  | 'harassment'
  | 'spam'
  | 'underage'
  | 'other'

export const INTERESTS = [
  'Gaming',
  'Music',
  'Movies',
  'Sports',
  'Technology',
  'Art',
  'Travel',
  'Food',
  'Reading',
  'Fitness'
] as const 