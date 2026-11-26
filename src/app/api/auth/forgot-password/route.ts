import { createHash, randomBytes } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { passwordResetConfig, sendPasswordResetEmail } from '@/lib/passwordResetEmail'
import { consumeResetBudget } from '@/lib/passwordResetBudget'

const genericMessage = 'If an account matches that email or username, a password reset link has been sent.'
const generic = () => NextResponse.json({ message: genericMessage })

export async function POST(request: NextRequest) {
  try {
    const config = passwordResetConfig()
    if (!config) return NextResponse.json({ error: 'Password reset email is not configured yet.' }, { status: 503 })
    let input: unknown
    try { input = await request.json() } catch { return NextResponse.json({ error: 'Enter your email or username.' }, { status: 400 }) }
    const identifier = (input as { identifier?: unknown } | null)?.identifier
    const login = typeof identifier === 'string' ? identifier.trim() : ''
    if (!login || login.length > 254) return NextResponse.json({ error: 'Enter your email or username.' }, { status: 400 })
    if (!await consumeResetBudget('requests-minute')) return generic()

    const user = await prisma.user.findFirst({
      where: { OR: [{ email: login.toLowerCase() }, { username: { equals: login, mode: 'insensitive' } }] },
      select: { id: true, email: true, username: true, resetPasswordExpiresAt: true },
    })
    if (!user) return generic()
    const now = new Date()
    if (user.resetPasswordExpiresAt && user.resetPasswordExpiresAt > now) return generic()

    const token = randomBytes(32).toString('hex')
    const tokenHash = createHash('sha256').update(token).digest('hex')
    const expiresAt = new Date(now.getTime() + 30 * 60 * 1000)
    // One outstanding reset link per account, even across aliases and simultaneous requests.
    const claimed = await prisma.user.updateMany({
      where: { id: user.id, OR: [{ resetPasswordExpiresAt: null }, { resetPasswordExpiresAt: { lte: now } }] },
      data: { resetPasswordTokenHash: tokenHash, resetPasswordExpiresAt: expiresAt },
    })
    if (claimed.count !== 1) return generic()

    if (!await consumeResetBudget('emails-day')) {
      await prisma.user.updateMany({ where: { id: user.id, resetPasswordTokenHash: tokenHash }, data: { resetPasswordTokenHash: null, resetPasswordExpiresAt: null } })
      return generic()
    }
    // Never trust a caller-controlled Host header when constructing a reset link.
    const resetUrl = new URL('/auth/reset-password', config.origin)
    resetUrl.searchParams.set('token', token)
    const sent = await sendPasswordResetEmail(config, {
      to: user.email, subject: 'Reset your Meetopia password',
      text: ['Hi ' + user.username + ',', '', 'Use this link to reset your Meetopia password:', resetUrl.toString(), '', 'This link expires in 30 minutes.', 'If you did not request this, you can ignore this email.'].join('\n'),
    })
    // A timeout can occur after acceptance. Keep the existing token valid and do not retry.
    // Log neither recipient, reset link, provider response nor credentials.
    if (!sent) console.error('Password reset delivery was not confirmed')
    return generic()
  } catch {
    console.error('Password reset request failed')
    return NextResponse.json({ error: 'Could not start password reset. Please try again.' }, { status: 503 })
  }
}
