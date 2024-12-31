import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongodb'
import { UserModel } from '@/lib/db/models/User'

export async function GET() {
  try {
    await connectDB()
    const users = await UserModel.find({})
    return NextResponse.json(users)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
} 