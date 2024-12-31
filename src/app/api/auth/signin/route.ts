import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongodb'
import { UserModel } from '@/lib/db/models/User'
import { comparePassword } from '@/lib/auth'
import { cookies } from 'next/headers'
import { createSession } from '@/lib/auth/session'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Connect to database
    await connectDB()

    // Find user
    const user = await UserModel.findOne({ email })
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    const isValid = await comparePassword(password, user.password)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Create session
    const session = await createSession(user.id)

    // Set session cookie
    cookies().set('meetopia_session', session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email
      }
    })
  } catch (error) {
    console.error('Signin error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 