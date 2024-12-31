import { prisma } from '../prisma'
import { randomBytes } from 'crypto'

export async function createSession(userId: string) {
  const sessionId = randomBytes(32).toString('hex')
  
  const session = await prisma.session.create({
    data: {
      id: sessionId,
      userId,
      token: randomBytes(32).toString('hex'),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1 week
    }
  })
  
  return session
}

export async function getSession(sessionId: string) {
  const session = await prisma.session.findFirst({
    where: {
      id: sessionId,
      expiresAt: {
        gt: new Date()
      }
    }
  })
  
  return session
}

export async function deleteSession(sessionId: string) {
  await prisma.session.delete({
    where: {
      id: sessionId
    }
  })
} 