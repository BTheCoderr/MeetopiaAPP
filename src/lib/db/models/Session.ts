import mongoose from 'mongoose'

const sessionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  createdAt: { type: Date, required: true },
  expiresAt: { type: Date, required: true }
})

export const SessionModel = mongoose.models.Session || mongoose.model('Session', sessionSchema) 