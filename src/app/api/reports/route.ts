import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { connectDB } from '../../../lib/db/mongodb'
import { ReportModel } from '../../../lib/db/models/Report'
import type { ReportReason } from '../../../lib/types/user'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { reportedUserId, reason, details } = await request.json()

    const db = await connectDB()
    const report = await ReportModel.create({
      reporterId: session.user.id,
      reportedUserId,
      reason: reason as ReportReason,
      details,
      timestamp: new Date(),
      status: 'pending'
    })

    return NextResponse.json(report)
  } catch (error) {
    console.error('Failed to create report:', error)
    return NextResponse.json(
      { error: 'Failed to create report' },
      { status: 500 }
    )
  }
} 