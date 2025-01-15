export interface Match {
  id: string
  type: 'video' | 'text'
  status: 'pending' | 'active' | 'ended'
  participants: string[]
  createdAt: Date
}

export interface MatchRequest {
  userId: string
  type: 'video' | 'text'
  filters?: {
    age?: number[]
    location?: string
    interests?: string[]
  }
} 