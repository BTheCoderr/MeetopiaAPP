import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { createSession } from '@/lib/auth/session'

export async function POST(req: Request) {
  try {
    const { identifier, email, password } = await req.json()
    const login = typeof identifier === 'string'
      ? identifier.trim()
      : typeof email === 'string'
        ? email.trim()
        : ''

    if (!login || typeof password !== 'string') {
      return NextResponse.json({ error: 'Email or username and password are required' }, { status: 400 })
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: login.toLowerCase() },
          { username: { equals: login, mode: 'insensitive' } },
        ],
      },
    })

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ error: 'Invalid email/username or password' }, { status: 401 })
    }

    const session = await createSession(user.id)
    const response = NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
      },
    })

    response.cookies.set('meetopia_session', session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: session.expiresAt,
    })

    return response
  } catch (error) {
    console.error('Signin error:', error)
    return NextResponse.json({ error: 'Error during signin' }, { status: 500 })
  }
}
