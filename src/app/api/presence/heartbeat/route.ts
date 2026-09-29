import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { currentUserId } from '@/lib/connectionAccess'

export async function POST(request: NextRequest) {
  try {
    const userId = await currentUserId(request)
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { lastSeenAt: new Date() },
      select: { lastSeenAt: true },
    })

    return NextResponse.json({ lastSeenAt: user.lastSeenAt })
  } catch (error) {
    console.error('Presence heartbeat error:', error)
    return NextResponse.json({ error: 'Could not update presence.' }, { status: 500 })
  }
}
