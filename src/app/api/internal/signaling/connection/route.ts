import { timingSafeEqual } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { getConnectionForUser, isBlockedBetween } from '@/lib/connectionAccess'
import { verifyConnectionRealtimeProof, verifyDirectCallProof } from '@/lib/socketToken'
import { prisma } from '@/lib/prisma'

// Render revalidates cached proofs here. Prisma remains the database access path.
export async function POST(request: NextRequest) {
  const secret = process.env.SOCKET_AUTH_SECRET
  const authorization = request.headers.get('authorization') || ''
  const provided = Buffer.from(authorization.startsWith('Bearer ') ? authorization.slice(7) : '')
  const expected = Buffer.from(secret || '')
  if (!secret || provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    if (typeof body.proof !== 'string' || typeof body.userId !== 'string') {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
    const realtime = verifyConnectionRealtimeProof(body.proof)
    const direct = realtime ? null : verifyDirectCallProof(body.proof)
    const connectionId = realtime?.connectionId || direct?.connectionId
    const otherUserId = realtime
      ? realtime.users.find(id => id !== body.userId)
      : direct?.calleeId
    const permitted = realtime
      ? realtime.users.includes(body.userId)
      : direct?.callerId === body.userId
    if (!permitted || !connectionId || !otherUserId) {
      return NextResponse.json({ error: 'Invalid proof' }, { status: 403 })
    }

    const record = await getConnectionForUser(connectionId, body.userId)
    if (!record || record.person.id !== otherUserId || await isBlockedBetween(body.userId, otherUserId)) {
      return NextResponse.json({ error: 'Connection unavailable' }, { status: 403 })
    }

    let message = null
    if (body.messageId !== undefined) {
      if (typeof body.messageId !== 'string') {
        return NextResponse.json({ error: 'Invalid message' }, { status: 400 })
      }
      message = await prisma.message.findFirst({
        where: { id: body.messageId, senderId: body.userId, receiverId: otherUserId },
        select: { id: true, content: true, createdAt: true, readAt: true, senderId: true, receiverId: true },
      })
      if (!message) return NextResponse.json({ error: 'Message unavailable' }, { status: 403 })
    }

    const ids = Array.isArray(body.messageIds)
      ? body.messageIds.filter((id: unknown): id is string => typeof id === 'string').slice(0, 100)
      : []
    const readMessages = ids.length ? await prisma.message.findMany({
      where: { id: { in: ids }, senderId: otherUserId, receiverId: body.userId, readAt: { not: null } },
      select: { id: true, readAt: true },
    }) : []

    return NextResponse.json(
      { connectionId, otherUserId, message, readMessages },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  } catch {
    return NextResponse.json({ error: 'Connection validation unavailable' }, { status: 503 })
  }
}
