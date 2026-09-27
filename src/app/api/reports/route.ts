import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { getSession } from '@/lib/auth/session'

export async function POST(request: Request) {
  try {
    const { reportedUserId, reason, details } = await request.json()

    if (typeof reportedUserId !== 'string' || !reportedUserId.trim()) {
      return NextResponse.json({ error: 'A matched user is required.' }, { status: 400 })
    }

    if (typeof reason !== 'string' || !reason.trim()) {
      return NextResponse.json({ error: 'A report reason is required.' }, { status: 400 })
    }

    const sessionId = cookies().get('meetopia_session')?.value
    if (!sessionId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const session = await getSession(sessionId)
    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    if (session.userId === reportedUserId) {
      return NextResponse.json({ error: 'You cannot report your own account.' }, { status: 400 })
    }

    const reportedUser = await prisma.user.findUnique({
      where: { id: reportedUserId },
      select: { id: true },
    })

    if (!reportedUser) {
      return NextResponse.json({ error: 'Reported user was not found.' }, { status: 404 })
    }

    const report = await prisma.report.create({
      data: {
        reporterId: session.userId,
        reportedUserId,
        reason: reason.trim(),
        details: typeof details === 'string' && details.trim() ? details.trim() : null,
        status: 'PENDING',
      },
    })

    return NextResponse.json({ success: true, report })
  } catch (error) {
    console.error('Error creating report:', error)
    return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 })
  }
}
