import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongodb'
import { UserModel } from '@/lib/db/models/User'
import { getSession } from '@/lib/auth/session'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const sessionId = cookies().get('meetopia_session')?.value
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const session = await getSession(sessionId)
    if (!session) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      )
    }

    await connectDB()
    const user = await UserModel.findOne({ id: session.userId })
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name
    })
  } catch (error) {
    console.error('Profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 