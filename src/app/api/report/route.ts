import { NextResponse } from 'next/server'
import { connectDB } from '../../../lib/db/mongodb'
import { ReportModel } from '../../../lib/db/models/Report'
import { randomBytes } from 'crypto'

export async function POST(request: Request) {
  try {
    const { reportedUserId, reporterId, reason, details } = await request.json()

    // Connect to database
    await connectDB()

    // Create report
    const report = await ReportModel.create({
      id: randomBytes(16).toString('hex'),
      reportedUserId,
      reporterId,
      reason,
      details,
      timestamp: new Date(),
      status: 'pending'
    })

    return NextResponse.json({
      success: true,
      report: {
        id: report.id,
        status: report.status
      }
    })
  } catch (error) {
    console.error('Report error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 