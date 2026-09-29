import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { currentUserId, getConnectionForUser } from '@/lib/connectionAccess'
import { createConnectionRealtimeProof } from '@/lib/socketToken'

type RouteContext = {
  params: Promise<{ connectionId: string }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const userId = await currentUserId(request)
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { connectionId } = await context.params
    const record = await getConnectionForUser(connectionId, userId)

    if (!record) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 })
    }

    return NextResponse.json({
      connection: {
        id: record.connection.id,
        createdAt: record.connection.createdAt,
        person: record.person,
        realtimeProof: createConnectionRealtimeProof(
          userId,
          record.person.id,
          record.connection.id,
        ),
      },
    })
  } catch (error) {
    console.error('Connection detail error:', error)
    return NextResponse.json({ error: 'Could not load this Connection.' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const userId = await currentUserId(request)
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { connectionId } = await context.params
    const record = await getConnectionForUser(connectionId, userId)

    if (!record) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 })
    }

    const otherUserId = record.person.id
    const [userAId, userBId] = [userId, otherUserId].sort()

    await prisma.connection.deleteMany({
      where: { id: connectionId, userAId, userBId },
    })

    await prisma.vibe.deleteMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
    })

    await prisma.message.deleteMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Remove connection error:', error)
    return NextResponse.json({ error: 'Could not remove this Connection.' }, { status: 500 })
  }
}
