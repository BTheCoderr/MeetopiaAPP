import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth/session'
import { verifyConnectionProof } from '@/lib/socketToken'

async function currentUserId() {
  const sessionId = cookies().get('meetopia_session')?.value
  if (!sessionId) return null
  const session = await getSession(sessionId)
  return session?.userId || null
}

const personSelect = {
  id: true,
  username: true,
  displayName: true,
  bio: true,
  interests: true,
  age: true,
} as const

export async function GET() {
  const userId = await currentUserId()
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const connections = await prisma.connection.findMany({
    where: {
      OR: [{ userAId: userId }, { userBId: userId }],
    },
    include: {
      userA: { select: personSelect },
      userB: { select: personSelect },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({
    connections: connections.map(connection => ({
      id: connection.id,
      createdAt: connection.createdAt,
      person: connection.userAId === userId ? connection.userB : connection.userA,
    })),
  })
}

export async function POST(request: Request) {
  try {
    const userId = await currentUserId()
    if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { connectionProof } = await request.json()
    const proof = typeof connectionProof === 'string' ? verifyConnectionProof(connectionProof) : null
    if (!proof || !proof.users.includes(userId)) {
      return NextResponse.json({ error: 'Invalid or expired mutual-Vibe proof' }, { status: 400 })
    }

    const [userAId, userBId] = [...proof.users].sort()
    const partnerId = userAId === userId ? userBId : userAId

    const blocked = await prisma.block.findFirst({
      where: {
        OR: [
          { blockerId: userId, blockedId: partnerId },
          { blockerId: partnerId, blockedId: userId },
        ],
      },
    })

    if (blocked) {
      return NextResponse.json({ error: 'Connection cannot be saved because one user has blocked the other.' }, { status: 409 })
    }

    const connection = await prisma.$transaction(async tx => {
      await tx.vibe.upsert({
        where: { senderId_receiverId: { senderId: userAId, receiverId: userBId } },
        update: {},
        create: { senderId: userAId, receiverId: userBId },
      })
      await tx.vibe.upsert({
        where: { senderId_receiverId: { senderId: userBId, receiverId: userAId } },
        update: {},
        create: { senderId: userBId, receiverId: userAId },
      })

      return tx.connection.upsert({
        where: { userAId_userBId: { userAId, userBId } },
        update: {},
        create: { userAId, userBId },
        include: {
          userA: { select: personSelect },
          userB: { select: personSelect },
        },
      })
    })

    return NextResponse.json({
      connection: {
        id: connection.id,
        createdAt: connection.createdAt,
        person: connection.userAId === userId ? connection.userB : connection.userA,
      },
    })
  } catch (error) {
    console.error('Save connection error:', error)
    return NextResponse.json({ error: 'Failed to save connection' }, { status: 500 })
  }
}
