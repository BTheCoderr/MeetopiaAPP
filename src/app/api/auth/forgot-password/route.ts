import { createHash, randomBytes } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const genericMessage = 'If an account matches that email or username, a password reset link has been sent.'

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Password reset email is not configured yet.' },
        { status: 503 },
      )
    }

    const { identifier } = await request.json()
    const login = typeof identifier === 'string' ? identifier.trim() : ''

    if (!login) {
      return NextResponse.json({ error: 'Enter your email or username.' }, { status: 400 })
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: login.toLowerCase() },
          { username: { equals: login, mode: 'insensitive' } },
        ],
      },
      select: { id: true, email: true, username: true },
    })

    if (!user) {
      return NextResponse.json({ message: genericMessage })
    }

    const token = randomBytes(32).toString('hex')
    const tokenHash = createHash('sha256').update(token).digest('hex')
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordTokenHash: tokenHash,
        resetPasswordExpiresAt: expiresAt,
      },
    })

    const resetUrl = new URL('/auth/reset-password', request.nextUrl.origin)
    resetUrl.searchParams.set('token', token)

    const from =
      process.env.PASSWORD_RESET_FROM_EMAIL ||
      process.env.REPORT_FROM_EMAIL ||
      'Meetopia <onboarding@resend.dev>'

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [user.email],
        subject: 'Reset your Meetopia password',
        text: [
          `Hi ${user.username},`,
          '',
          'Use this link to reset your Meetopia password:',
          resetUrl.toString(),
          '',
          'This link expires in 30 minutes.',
          'If you did not request this, you can ignore this email.',
        ].join('\n'),
      }),
    })

    if (!emailResponse.ok) {
      const details = await emailResponse.text()
      console.error('Password reset email failed:', emailResponse.status, details)
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordTokenHash: null,
          resetPasswordExpiresAt: null,
        },
      })
      return NextResponse.json(
        { error: 'Could not send the reset email. Please try again.' },
        { status: 502 },
      )
    }

    return NextResponse.json({ message: genericMessage })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Could not start password reset. Please try again.' },
      { status: 500 },
    )
  }
}
