import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    console.log('Attempting signin for:', email)

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    })
    console.log('User found:', user ? 'yes' : 'no')

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    console.log('Password valid:', isValidPassword)

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'your-fallback-secret',
      { expiresIn: '1d' }
    )
    console.log('JWT generated successfully')

    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      },
      token
    })
  } catch (error) {
    console.error('Signin error:', error)
    return NextResponse.json(
      { error: 'Error during signin', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 