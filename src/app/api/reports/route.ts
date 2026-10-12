import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { currentUserId } from '@/lib/connectionAccess'

export async function POST(request: NextRequest) {
  try {
    const { reportedUserId, reason, details } = await request.json()

    const userId = await currentUserId(request)
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const report = await prisma.report.create({
      data: {
        reporterId: userId,
        reportedUserId,
        reason,
        details,
        status: 'PENDING',
      },
    })

    return NextResponse.json({ success: true, report })
  } catch (error) {
    console.error('Error creating report:', error)
    return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 })
  }
}
