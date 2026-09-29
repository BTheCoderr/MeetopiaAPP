import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { currentUserId } from '@/lib/connectionAccess'

export async function GET(request: NextRequest) {
  try {
    const userId = await currentUserId(request)
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.notification.count({
        where: {
          userId,
          readAt: null,
        },
      }),
    ])

    return NextResponse.json({
      unreadCount,
      notifications,
    })
  } catch (error) {
    console.error('Notifications error:', error)
    return NextResponse.json({ error: 'Could not load notifications.' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userId = await currentUserId(request)
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json().catch(() => null)
    const ids = Array.isArray(body?.ids)
      ? body.ids.filter((id: unknown): id is string => typeof id === 'string').slice(0, 100)
      : []
    const markAll = body?.all === true
    const readAt = new Date()

    await prisma.notification.updateMany({
      where: {
        userId,
        readAt: null,
        ...(markAll ? {} : { id: { in: ids } }),
      },
      data: { readAt },
    })

    return NextResponse.json({ success: true, readAt })
  } catch (error) {
    console.error('Mark notifications read error:', error)
    return NextResponse.json({ error: 'Could not update notifications.' }, { status: 500 })
  }
}
