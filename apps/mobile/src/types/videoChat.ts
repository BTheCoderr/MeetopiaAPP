export interface UserProfile {
  name: string
  age: number
  gender: string
  lookingFor: string
  interests: string[]
  bio: string
}

export interface ChatMessage {
  id: string
  text: string
  sender: 'me' | 'peer'
  timestamp: number
  read?: boolean
  readAt?: number
}

export type BandwidthQuality = 'high' | 'medium' | 'low'
