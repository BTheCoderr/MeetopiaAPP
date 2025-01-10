import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log('Received signup request with body:', body)
    
    const { username, email, phone, password } = body

    // Validate that both email and phone are provided
    if (!email || !phone) {
      console.log('Validation failed: Both email and phone are required')
      return NextResponse.json(
        { error: 'Both email and phone number are required' },
        { status: 400 }
      )
    }

    // Check if user already exists with either email or phone
    console.log('Checking for existing email:', email)
    const existingEmail = await prisma.user.findUnique({
      where: { email }
    })
    if (existingEmail) {
      console.log('Found existing email')
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      )
    }

    console.log('Checking for existing phone:', phone)
    const existingPhone = await prisma.user.findUnique({
      where: { phone }
    })
    if (existingPhone) {
      console.log('Found existing phone')
      return NextResponse.json(
        { error: 'An account with this phone number already exists' },
        { status: 400 }
      )
    }

    console.log('Checking for existing username:', username)
    const existingUsername = await prisma.user.findUnique({
      where: { username }
    })

    if (existingUsername) {
      console.log('Found existing username')
      return NextResponse.json(
        { error: 'This username is already taken' },
        { status: 400 }
      )
    }

    // Hash password
    console.log('Hashing password')
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create new user
    console.log('Creating new user')
    const user = await prisma.user.create({
      data: {
        username,
        email,
        phone,
        password: hashedPassword
      }
    })

    console.log('User created successfully:', user.id)
    return NextResponse.json(
      { 
        message: 'User created successfully', 
        user: { 
          id: user.id, 
          username: user.username, 
          email: user.email,
          phone: user.phone 
        } 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    })
    return NextResponse.json(
      { error: 'Error creating user. Please try again later.' },
      { status: 500 }
    )
  }
} 