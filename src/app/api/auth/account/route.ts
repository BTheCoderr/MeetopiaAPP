import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth/session'

export async function DELETE(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('meetopia_session')?.value
    const session = sessionId ? await getSession(sessionId) : null
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const payload = await request.json().catch(() => null)
    const password = typeof payload?.password === 'string' ? payload.password : ''
    if (!password) return NextResponse.json({ error: 'Password confirmation required.' }, { status: 400 })

    const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { password: true } })
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ error: 'Incorrect account password.' }, { status: 403 })
    }

    const userId = session.userId
    // Delete rows with required user foreign keys, then cascade related
    // connections, vibes, blocks, notifications and sessions via User deletion.
    await prisma.$transaction([
      prisma.message.deleteMany({ where: { OR: [{ senderId: userId }, { receiverId: userId }] } }),
      prisma.report.deleteMany({ where: { OR: [{ reporterId: userId }, { reportedUserId: userId }] } }),
      prisma.feedback.deleteMany({ where: { userId } }),
      prisma.user.delete({ where: { id: userId } }),
    ])
    const response = NextResponse.json({ success: true })
    response.cookies.set('meetopia_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(0),
    })
    return response
  } catch (error) {
    console.error('Account deletion error:', error)
    return NextResponse.json({ error: 'Could not delete the account. Please contact support.' }, { status: 500 })
  }
}
