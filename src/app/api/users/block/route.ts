import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db/mongodb'
import { User } from '@/lib/db/models/User'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { blockedUserId } = await request.json()
    await connectDB()
    
    await User.findByIdAndUpdate(
      session.user.id,
      { $addToSet: { blockedUsers: blockedUserId } }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to block user:', error)
    return NextResponse.json({ error: 'Failed to block user' }, { status: 500 })
  }
} 