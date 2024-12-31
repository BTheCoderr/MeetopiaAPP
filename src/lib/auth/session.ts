import { connectDB } from '../db/mongodb'
import { SessionModel } from '../db/models/Session'
import { randomBytes } from 'crypto'

export async function createSession(userId: string) {
  await connectDB()
  
  const sessionId = randomBytes(32).toString('hex')
  
  const session = await SessionModel.create({
    id: sessionId,
    userId,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1 week
  })
  
  return session
}

export async function getSession(sessionId: string) {
  await connectDB()
  
  const session = await SessionModel.findOne({
    id: sessionId,
    expiresAt: { $gt: new Date() }
  })
  
  return session
}

export async function deleteSession(sessionId: string) {
  await connectDB()
  await SessionModel.deleteOne({ id: sessionId })
} 