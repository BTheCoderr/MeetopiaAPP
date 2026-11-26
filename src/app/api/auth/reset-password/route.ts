import { createHash } from 'crypto'
import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token) || typeof password !== 'string' || password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) {
      return NextResponse.json(
        { error: 'Use a valid reset link and a password of at least 8 characters (maximum 72 UTF-8 bytes).' },
        { status: 400 },
      )
    }

    const tokenHash = createHash('sha256').update(token).digest('hex')

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordTokenHash: tokenHash,
        resetPasswordExpiresAt: { gt: new Date() },
      },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'This password reset link is invalid or has expired.' },
        { status: 400 },
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const consumed = await prisma.$transaction(async (tx) => {
      const updated = await tx.user.updateMany({
        where: { id: user.id, resetPasswordTokenHash: tokenHash, resetPasswordExpiresAt: { gt: new Date() } },
        data: { password: passwordHash, resetPasswordTokenHash: null, resetPasswordExpiresAt: null },
      })
      if (updated.count !== 1) return false
      await tx.session.deleteMany({ where: { userId: user.id } })
      return true
    })
    if (!consumed) return NextResponse.json({ error: 'This password reset link is invalid or has expired.' }, { status: 400 })

    return NextResponse.json({ message: 'Password updated. You can sign in now.' })
  } catch (error) {
    console.error('Reset password error')
    return NextResponse.json(
      { error: 'Could not reset password. Please try again.' },
      { status: 500 },
    )
  }
}
