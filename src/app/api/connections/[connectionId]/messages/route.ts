import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { currentUserId, getConnectionForUser, isBlockedBetween } from '@/lib/connectionAccess'

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

    const otherUserId = record.person.id
    const rows = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    return NextResponse.json({
      messages: rows.reverse().map(message => ({
        id: message.id,
        content: message.content,
        createdAt: message.createdAt,
        senderId: message.senderId,
        receiverId: message.receiverId,
        mine: message.senderId === userId,
      })),
    })
  } catch (error) {
    console.error('Connection messages error:', error)
    return NextResponse.json({ error: 'Could not load messages.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
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

    const body = await request.json().catch(() => null)
    const content = typeof body?.content === 'string' ? body.content.trim() : ''

    if (!content) {
      return NextResponse.json({ error: 'Message cannot be empty.' }, { status: 400 })
    }

    if (content.length > 2000) {
      return NextResponse.json({ error: 'Message is too long.' }, { status: 400 })
    }

    const otherUserId = record.person.id
    if (await isBlockedBetween(userId, otherUserId)) {
      return NextResponse.json({ error: 'Messaging is unavailable for this Connection.' }, { status: 403 })
    }

    const message = await prisma.message.create({
      data: {
        content,
        senderId: userId,
        receiverId: otherUserId,
      },
    })

    return NextResponse.json({
      message: {
        id: message.id,
        content: message.content,
        createdAt: message.createdAt,
        senderId: message.senderId,
        receiverId: message.receiverId,
        mine: true,
      },
    })
  } catch (error) {
    console.error('Send Connection message error:', error)
    return NextResponse.json({ error: 'Could not send message.' }, { status: 500 })
  }
}
