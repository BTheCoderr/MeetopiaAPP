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

export type PermissionStatus = 'granted' | 'denied' | 'pending'

export type BandwidthQuality = 'high' | 'medium' | 'low'

export type SimulatedDemoState = 'connecting' | 'connected' | 'chatting' | null

export interface KeyboardShortcut {
  key: string
  action: string
}

export interface VideoChatSearchParams {
  isDating: boolean
  isDemo: boolean
  demoPartnerId: string | null
  selectedInterest: string | null
}
