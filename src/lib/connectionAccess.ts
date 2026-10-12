import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getRequestSession } from '@/lib/auth/session'

export async function currentUserId(request: NextRequest) {
  const session = await getRequestSession(request)
  return session?.userId || null
}

export async function getConnectionForUser(connectionId: string, userId: string) {
  const connection = await prisma.connection.findFirst({
    where: {
      id: connectionId,
      OR: [{ userAId: userId }, { userBId: userId }],
    },
    include: {
      userA: {
        select: {
          id: true,
          username: true,
          displayName: true,
          bio: true,
          interests: true,
          lastSeenAt: true,
        },
      },
      userB: {
        select: {
          id: true,
          username: true,
          displayName: true,
          bio: true,
          interests: true,
          lastSeenAt: true,
        },
      },
    },
  })

  if (!connection) return null

  return {
    connection,
    person: connection.userAId === userId ? connection.userB : connection.userA,
  }
}

export async function isBlockedBetween(userId: string, otherUserId: string) {
  const block = await prisma.block.findFirst({
    where: {
      OR: [
        { blockerId: userId, blockedId: otherUserId },
        { blockerId: otherUserId, blockedId: userId },
      ],
    },
    select: { id: true },
  })

  return Boolean(block)
}
