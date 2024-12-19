import mongoose from 'mongoose'
import type { UserProfile } from '../../types/user'

const userSchema = new mongoose.Schema<UserProfile>({
  id: String,
  name: String,
  age: Number,
  location: String,
  interests: [String],
  preferences: {
    ageRange: [Number],
    location: String,
    interests: [String],
    videoOnly: Boolean
  },
  blockedUsers: [String],
  reports: [{
    id: String,
    reportedUserId: String,
    reporterId: String,
    reason: String,
    details: String,
    timestamp: Date,
    status: String
  }]
})

export const User = mongoose.models.User || mongoose.model<UserProfile>('User', userSchema) 