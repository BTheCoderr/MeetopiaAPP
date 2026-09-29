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

    const unreadIds = rows
      .filter(
        message =>
          message.senderId === otherUserId &&
          message.receiverId === userId &&
          !message.readAt,
      )
      .map(message => message.id)

    let readAt: Date | null = null
    if (unreadIds.length > 0) {
      readAt = new Date()
      await prisma.message.updateMany({
        where: {
          id: { in: unreadIds },
          receiverId: userId,
          readAt: null,
        },
        data: { readAt },
      })

      await prisma.notification.updateMany({
        where: {
          userId,
          type: 'message',
          readAt: null,
          data: {
            path: ['connectionId'],
            equals: connectionId,
          },
        },
        data: { readAt },
      })
    }

    return NextResponse.json({
      newlyReadIds: unreadIds,
      messages: rows.reverse().map(message => ({
        id: message.id,
        content: message.content,
        createdAt: message.createdAt,
        readAt:
          message.readAt ||
          (readAt && unreadIds.includes(message.id) ? readAt : null),
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

    const [message, sender] = await Promise.all([
      prisma.message.create({
        data: {
          content,
          senderId: userId,
          receiverId: otherUserId,
        },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          displayName: true,
          username: true,
        },
      }),
    ])

    const senderName = sender?.displayName || sender?.username || 'A Connection'
    await prisma.notification.create({
      data: {
        userId: otherUserId,
        type: 'message',
        title: senderName,
        body: content.slice(0, 160),
        data: {
          connectionId,
          messageId: message.id,
          senderId: userId,
          path: `/connections/${connectionId}`,
        },
      },
    })

    return NextResponse.json({
      message: {
        id: message.id,
        content: message.content,
        createdAt: message.createdAt,
        readAt: message.readAt,
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


export async function PATCH(request: NextRequest, context: RouteContext) {
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
    const messageIds = Array.isArray(body?.messageIds)
      ? body.messageIds
          .filter((id: unknown): id is string => typeof id === 'string')
          .slice(0, 100)
      : []

    if (messageIds.length === 0) {
      return NextResponse.json({ readAt: null, messageIds: [] })
    }

    const readAt = new Date()
    const messages = await prisma.message.findMany({
      where: {
        id: { in: messageIds },
        senderId: record.person.id,
        receiverId: userId,
        readAt: null,
      },
      select: { id: true },
    })

    const validIds = messages.map(message => message.id)
    if (validIds.length > 0) {
      await prisma.message.updateMany({
        where: {
          id: { in: validIds },
          receiverId: userId,
          readAt: null,
        },
        data: { readAt },
      })

      await prisma.notification.updateMany({
        where: {
          userId,
          type: 'message',
          readAt: null,
          data: {
            path: ['connectionId'],
            equals: connectionId,
          },
        },
        data: { readAt },
      })
    }

    return NextResponse.json({
      readAt,
      messageIds: validIds,
    })
  } catch (error) {
    console.error('Mark Connection messages read error:', error)
    return NextResponse.json({ error: 'Could not mark messages read.' }, { status: 500 })
  }
}
