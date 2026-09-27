import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { createSession } from '@/lib/auth/session'

export async function POST(req: Request) {
  try {
    const { username, email, password } = await req.json()
    const cleanUsername = typeof username === 'string' ? username.trim() : ''
    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : ''

    if (cleanUsername.length < 2 || !cleanEmail || typeof password !== 'string' || password.length < 8) {
      return NextResponse.json(
        { error: 'Use a valid email, a username of at least 2 characters, and a password of at least 8 characters.' },
        { status: 400 }
      )
    }

    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email: cleanEmail }, { username: cleanUsername }]
      }
    })

    if (existing) {
      return NextResponse.json(
        { error: existing.email === cleanEmail ? 'An account with this email already exists.' : 'This username is already taken.' },
        { status: 400 }
      )
    }

    const user = await prisma.user.create({
      data: {
        username: cleanUsername,
        email: cleanEmail,
        password: await bcrypt.hash(password, 12),
        interests: [],
      }
    })

    const session = await createSession(user.id)
    const response = NextResponse.json(
      { message: 'Account created successfully', user: { id: user.id, username: user.username, email: user.email } },
      { status: 201 }
    )

    response.cookies.set('meetopia_session', session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: session.expiresAt,
    })

    return response
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ error: 'Error creating user. Please try again later.' }, { status: 500 })
  }
}
