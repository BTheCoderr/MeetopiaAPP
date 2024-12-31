import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongodb'
import { ReportModel } from '@/lib/db/models/Report'

export async function POST(request: Request) {
  try {
    const { reportedUserId, reason, details } = await request.json()

    await connectDB()

    const report = await ReportModel.create({
      reportedUserId,
      reason,
      details,
      timestamp: new Date(),
      status: 'pending'
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