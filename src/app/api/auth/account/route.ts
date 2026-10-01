import { randomBytes } from 'crypto'
import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth/session'

export async function DELETE(request: NextRequest) {
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
    const password = typeof body?.password === 'string' ? body.password : ''
    if (!password) {
      return NextResponse.json(
        { error: 'Enter your password to confirm account deletion.' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, password: true, deletedAt: true },
    })

    if (!user || user.deletedAt) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    if (!(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ error: 'Password is incorrect.' }, { status: 403 })
    }

    const deletedAt = new Date()
    const tombstonePassword = await bcrypt.hash(randomBytes(32).toString('hex'), 12)
    const tombstoneEmail = `deleted+${user.id}@deleted.invalid`
    const tombstoneUsername = `deleted_${user.id}`

    await prisma.$transaction(async (tx) => {
      await tx.session.deleteMany({ where: { userId: user.id } })
      await tx.notification.deleteMany({ where: { userId: user.id } })
      await tx.feedback.deleteMany({ where: { userId: user.id } })
      await tx.message.deleteMany({
        where: {
          OR: [{ senderId: user.id }, { receiverId: user.id }],
        },
      })
      await tx.connection.deleteMany({
        where: {
          OR: [{ userAId: user.id }, { userBId: user.id }],
        },
      })
      await tx.vibe.deleteMany({
        where: {
          OR: [{ senderId: user.id }, { receiverId: user.id }],
        },
      })
      await tx.block.deleteMany({
        where: {
          OR: [{ blockerId: user.id }, { blockedId: user.id }],
        },
      })

      await tx.user.update({
        where: { id: user.id },
        data: {
          email: tombstoneEmail,
          username: tombstoneUsername,
          password: tombstonePassword,
          displayName: null,
          bio: null,
          interests: [],
          adultConfirmedAt: null,
          resetPasswordTokenHash: null,
          resetPasswordExpiresAt: null,
          lastSeenAt: null,
          deletedAt,
          friends: { set: [] },
          friendOf: { set: [] },
        },
      })
    })

    const response = NextResponse.json({
      success: true,
      message: 'Your Meetopia account has been deleted.',
    })
    response.cookies.set('meetopia_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(0),
      maxAge: 0,
    })

    return response
  } catch (error) {
    console.error('Account deletion error:', error)
    return NextResponse.json(
      { error: 'Could not delete your account. Please try again.' },
      { status: 500 }
    )
  }
}
