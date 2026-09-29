import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth/session'
import { createConnectionRealtimeProof, verifyConnectionProof } from '@/lib/socketToken'

async function currentUserId(request: NextRequest) {
  const sessionId = request.cookies.get('meetopia_session')?.value
  if (!sessionId) return null
  const session = await getSession(sessionId)
  return session?.userId || null
}

const personSelect = {
  id: true,
  username: true,
  displayName: true,
  lastSeenAt: true,
} as const

export async function GET(request: NextRequest) {
  const userId = await currentUserId(request)
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

  const connectionSummaries = await Promise.all(
    connections.map(async connection => {
      const person = connection.userAId === userId ? connection.userB : connection.userA
      const [lastMessage, unreadCount] = await Promise.all([
        prisma.message.findFirst({
        where: {
          OR: [
            { senderId: userId, receiverId: person.id },
            { senderId: person.id, receiverId: userId },
          ],
        },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          content: true,
          createdAt: true,
          senderId: true,
        },
        }),
        prisma.message.count({
          where: {
            senderId: person.id,
            receiverId: userId,
            readAt: null,
          },
        }),
      ])

      return {
        id: connection.id,
        createdAt: connection.createdAt,
        person,
        unreadCount,
        realtimeProof: createConnectionRealtimeProof(
          userId,
          person.id,
          connection.id,
        ),
        lastMessage: lastMessage
          ? {
              id: lastMessage.id,
              content: lastMessage.content,
              createdAt: lastMessage.createdAt,
              mine: lastMessage.senderId === userId,
            }
          : null,
      }
    })
  )

  connectionSummaries.sort((a, b) => {
    const aTime = new Date(a.lastMessage?.createdAt || a.createdAt).getTime()
    const bTime = new Date(b.lastMessage?.createdAt || b.createdAt).getTime()
    return bTime - aTime
  })

  return NextResponse.json({ connections: connectionSummaries })
}

export async function POST(request: NextRequest) {
  try {
    const userId = await currentUserId(request)
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

    await prisma.vibe.upsert({
      where: { senderId_receiverId: { senderId: userAId, receiverId: userBId } },
      update: {},
      create: { senderId: userAId, receiverId: userBId },
    })

    await prisma.vibe.upsert({
      where: { senderId_receiverId: { senderId: userBId, receiverId: userAId } },
      update: {},
      create: { senderId: userBId, receiverId: userAId },
    })

    const connection = await prisma.connection.upsert({
      where: { userAId_userBId: { userAId, userBId } },
      update: {},
      create: { userAId, userBId },
      include: {
        userA: { select: personSelect },
        userB: { select: personSelect },
      },
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
