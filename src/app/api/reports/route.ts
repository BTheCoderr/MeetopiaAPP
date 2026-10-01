import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth/session'

async function sendReportNotification(report: {
  id: string
  reporterId: string
  reportedUserId: string
  reason: string
  details: string | null
  createdAt: Date
}) {
  const apiKey = process.env.RESEND_API_KEY
  const to =
    process.env.REPORT_NOTIFICATION_EMAIL ||
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL

  if (!apiKey || !to) {
    console.warn('Report notification email is not configured')
    return
  }

  const from =
    process.env.REPORT_FROM_EMAIL ||
    process.env.PASSWORD_RESET_FROM_EMAIL ||
    'Meetopia <onboarding@resend.dev>'

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: `Meetopia safety report: ${report.reason}`,
      text: [
        'A new Meetopia safety report was submitted.',
        '',
        `Report ID: ${report.id}`,
        `Reporter user ID: ${report.reporterId}`,
        `Reported user ID: ${report.reportedUserId}`,
        `Reason: ${report.reason}`,
        `Submitted: ${report.createdAt.toISOString()}`,
        '',
        'Details:',
        report.details || '(none provided)',
      ].join('\n'),
    }),
  })

  if (!response.ok) {
    const details = await response.text()
    console.error('Report notification email failed:', response.status, details)
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('meetopia_session')?.value
    if (!sessionId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const session = await getSession(sessionId)
    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const body = await request.json().catch(() => null)
    const reportedUserId =
      typeof body?.reportedUserId === 'string' ? body.reportedUserId.trim() : ''
    const reason = typeof body?.reason === 'string' ? body.reason.trim().slice(0, 120) : ''
    const details =
      typeof body?.details === 'string' ? body.details.trim().slice(0, 2000) : ''

    if (!reportedUserId || !reason || !details) {
      return NextResponse.json(
        { error: 'Choose a reason and include details before submitting.' },
        { status: 400 }
      )
    }

    if (reportedUserId === session.userId) {
      return NextResponse.json({ error: 'You cannot report your own account.' }, { status: 400 })
    }

    const reportedUser = await prisma.user.findUnique({
      where: { id: reportedUserId },
      select: { id: true },
    })

    if (!reportedUser) {
      return NextResponse.json({ error: 'This person is no longer available to report.' }, { status: 404 })
    }

    const report = await prisma.report.create({
      data: {
        reporterId: session.userId,
        reportedUserId,
        reason,
        details,
        status: 'PENDING',
      },
      select: {
        id: true,
        reporterId: true,
        reportedUserId: true,
        reason: true,
        details: true,
        createdAt: true,
      },
    })

    void sendReportNotification(report).catch((error) => {
      console.error('Report notification email failed:', error)
    })

    return NextResponse.json({ success: true, reportId: report.id }, { status: 201 })
  } catch (error) {
    console.error('Error creating report:', error)
    return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 })
  }
}
