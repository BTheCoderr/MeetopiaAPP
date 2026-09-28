import { createHash } from 'crypto'
import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (typeof token !== 'string' || !token || typeof password !== 'string' || password.length < 8) {
      return NextResponse.json(
        { error: 'Use a valid reset link and a password of at least 8 characters.' },
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

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          password: passwordHash,
          resetPasswordTokenHash: null,
          resetPasswordExpiresAt: null,
        },
      }),
      prisma.session.deleteMany({ where: { userId: user.id } }),
    ])

    return NextResponse.json({ message: 'Password updated. You can sign in now.' })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'Could not reset password. Please try again.' },
      { status: 500 },
    )
  }
}
