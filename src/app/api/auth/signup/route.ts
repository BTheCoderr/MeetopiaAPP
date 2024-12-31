import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { username, email, password } = await req.json()

    // Check if user already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email }
    })

    const existingUsername = await prisma.user.findUnique({
      where: { username }
    })

    if (existingEmail) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please try signing in or use a different email.' },
        { status: 400 }
      )
    }

    if (existingUsername) {
      return NextResponse.json(
        { error: 'This username is already taken. Please choose a different username.' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create new user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword
      }
    })

    return NextResponse.json(
      { message: 'User created successfully', user: { id: user.id, username: user.username, email: user.email } },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Error creating user. Please try again later.' },
      { status: 500 }
    )
  }
} 