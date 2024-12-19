// Temporarily commented out for UI development
/*
import { NextResponse } from 'next/server'
import mongoose from 'mongoose'

export async function GET() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined')
    }

    await mongoose.connect(MONGODB_URI)
    return NextResponse.json({ status: 'Connected to MongoDB!' })
  } catch (error: any) {
    console.error('Connection error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
*/

export async function GET() {
  return new Response('Server temporarily disabled for UI development')
} 