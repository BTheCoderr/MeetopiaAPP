import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { getSession } from '@/lib/auth/session'

export async function POST(request: Request) {
  try {
    const { reportedUserId, reason, details } = await request.json()

    // Get the current user's ID from the session
    const sessionId = cookies().get('meetopia_session')?.value
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const session = await getSession(sessionId)
    if (!session) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      )
    }

    const report = await prisma.report.create({
      data: {
        reporterId: session.userId,
        reportedUserId,
        reason,
        details,
        status: 'PENDING'
      }
    })

    return NextResponse.json({ success: true, report })
  } catch (error) {
    console.error('Error creating report:', error)
    return NextResponse.json(
      { error: 'Failed to submit report' },
      { status: 500 }
    )
  }
} 