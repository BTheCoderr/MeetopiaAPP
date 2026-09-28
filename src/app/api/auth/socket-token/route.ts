import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth/session'
import { createSocketToken } from '@/lib/socketToken'

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('meetopia_session')?.value
    if (!sessionId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const session = await getSession(sessionId)
    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        displayName: true,
        username: true,
        adultConfirmedAt: true,
        blocksMade: { select: { blockedId: true } },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!process.env.SOCKET_AUTH_SECRET) {
      console.error('Socket token error: SOCKET_AUTH_SECRET is not configured')
      return NextResponse.json(
        { error: 'Meetopia video authentication is not configured.' },
        { status: 503 },
      )
    }

    return NextResponse.json({
      token: createSocketToken({
        sub: user.id,
        displayName: user.displayName || user.username,
        adultConfirmed: Boolean(user.adultConfirmedAt),
        blocked: user.blocksMade.map(block => block.blockedId),
      }),
    })
  } catch (error) {
    console.error('Socket token error:', error)
    return NextResponse.json(
      { error: 'Could not authenticate the Chemistry Check.' },
      { status: 500 },
    )
  }
}
