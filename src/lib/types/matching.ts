export interface Match {
  id: string
  type: 'video'
  status: 'pending' | 'active' | 'ended'
  participants: string[]
  createdAt: Date
}

export interface MatchRequest {
  userId: string
  type: 'video'
  filters?: {
    age?: number[]
    location?: string
    interests?: string[]
  }
} 