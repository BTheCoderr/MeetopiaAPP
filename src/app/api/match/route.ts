import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { type, mode, blindDate, chatMode } = await req.json()
    
    // For now, generate a temporary user ID
    const tempUserId = `user_${Date.now()}`
    
    return NextResponse.json({
      success: true,
      match: {
        type,
        mode: mode || 'regular', // Default to regular mode if not specified
        blindDate: blindDate || false, // Default to false if not specified
        chatMode: chatMode || 'chat', // Default to chat mode if not specified
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