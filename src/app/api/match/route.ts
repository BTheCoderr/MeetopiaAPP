import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, mode, blindDate, chatMode, bio, interests } = body
    
    // Validate inputs
    if (!type || !['video', 'text'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be "video" or "text".' },
        { status: 400 }
      )
    }
    
    if (mode && !['regular', 'speed'].includes(mode)) {
      return NextResponse.json(
        { error: 'Invalid mode. Must be "regular" or "speed".' },
        { status: 400 }
      )
    }
    
    if (chatMode && !['chat', 'dating'].includes(chatMode)) {
      return NextResponse.json(
        { error: 'Invalid chatMode. Must be "chat" or "dating".' },
        { status: 400 }
      )
    }
    
    // Generate a unique user ID for this match request
    const userId = uuidv4()
    
    return NextResponse.json({
      success: true,
      match: {
        userId,
        type,
        mode: mode || 'regular',
        blindDate: blindDate || false,
        chatMode: chatMode || 'chat',
        bio: bio || '',
        interests: interests || [],
      }
    })
  } catch (error) {
    console.error('Error in match API:', error)
    return NextResponse.json(
      { error: 'Failed to process match request' },
      { status: 500 }
    )
  }
} 