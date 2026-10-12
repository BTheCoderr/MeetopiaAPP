import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { getRequestSession } from '@/lib/auth/session'
import { deleteUserAccount } from '@/lib/auth/deleteAccount'

export async function DELETE(request: NextRequest) {
  try {
    const session = await getRequestSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const password = typeof body.password === 'string' ? body.password : ''
    const confirmed = body.confirm === true || body.confirm === 'true'

    if (!confirmed) {
      return NextResponse.json(
        { error: 'Confirm account deletion to continue.' },
        { status: 400 },
      )
    }

    if (!password) {
      return NextResponse.json({ error: 'Password is required.' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, password: true },
    })

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ error: 'Invalid password.' }, { status: 401 })
    }

    await deleteUserAccount(user.id)

    const response = NextResponse.json({ deleted: true })
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
    return NextResponse.json({ error: 'Could not delete this account.' }, { status: 500 })
  }
}
