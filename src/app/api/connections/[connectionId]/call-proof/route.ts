import { NextRequest, NextResponse } from 'next/server'
import { currentUserId, getConnectionForUser, isBlockedBetween } from '@/lib/connectionAccess'
import { prisma } from '@/lib/prisma'
import { createDirectCallProof } from '@/lib/socketToken'

type RouteContext = {
  params: Promise<{ connectionId: string }>
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

    if (await isBlockedBetween(userId, record.person.id)) {
      return NextResponse.json({ error: 'Calling is unavailable for this Connection.' }, { status: 403 })
    }

    const caller = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        displayName: true,
        username: true,
      },
    })

    const callerName = caller?.displayName || caller?.username || 'A Connection'
    await prisma.notification.create({
      data: {
        userId: record.person.id,
        type: 'call',
        title: `${callerName} wants to talk again`,
        body: 'Open Meetopia to answer or call them back.',
        data: {
          connectionId,
          callerId: userId,
          path: `/connections/${connectionId}`,
        },
      },
    })

    return NextResponse.json({
      proof: createDirectCallProof({
        callerId: userId,
        calleeId: record.person.id,
        connectionId,
      }),
      person: {
        id: record.person.id,
        username: record.person.username,
        displayName: record.person.displayName,
      },
    })
  } catch (error) {
    console.error('Connection call proof error:', error)
    return NextResponse.json({ error: 'Could not start this call.' }, { status: 500 })
  }
}
