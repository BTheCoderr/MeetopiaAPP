import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { type } = await req.json()
    
    // For now, generate a temporary user ID
    const tempUserId = `user_${Date.now()}`
    
    return NextResponse.json({
      success: true,
      match: {
        type,
        userId: tempUserId,
        status: 'searching'
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to initiate matching' },
      { status: 500 }
    )
  }
} 