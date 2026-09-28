import { NextRequest, NextResponse } from 'next/server'
import { currentUserId, getConnectionForUser, isBlockedBetween } from '@/lib/connectionAccess'
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
