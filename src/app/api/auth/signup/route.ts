import { NextResponse } from 'next/server'
import { connectDB } from '../../../../lib/db/mongodb'
import { UserModel } from '../../../../lib/db/models/User'
import { hashPassword } from '../../../../lib/auth'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Connect to database
    await connectDB()

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await UserModel.create({
      email,
      password: hashedPassword
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email
      }
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 