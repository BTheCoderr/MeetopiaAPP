import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    // Add user to matching queue logic here
    return NextResponse.json({ message: 'Added to queue' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 