import { NextRequest, NextResponse } from 'next/server';

// Simple temporary chat API endpoints for development
// This bypasses the enterprise features while we focus on the WebSocket connection issue

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const meetingId = params.id;
  
  console.log('📱 Chat history requested for meeting:', meetingId);
  
  // Return mock chat history for development
  return NextResponse.json({
    success: true,
    data: {
      messages: [
        {
          id: '1',
          content: 'Welcome to the meeting!',
          type: 'SYSTEM',
          createdAt: new Date().toISOString(),
          user: {
            id: 'system',
            username: 'System',
            displayName: 'System'
          }
        }
      ],
      pagination: {
        page: 1,
        limit: 50,
        total: 1,
        totalPages: 1
      },
      meetingInfo: {
        id: meetingId,
        title: 'Development Meeting',
        allowChat: true
      }
    }
  });
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const meetingId = params.id;
  const { content, type = 'TEXT' } = await request.json();
  
  console.log('📱 Chat message sent to meeting:', meetingId, 'Content:', content);
  
  // Mock successful message send
  const mockMessage = {
    id: Math.random().toString(36).substr(2, 9),
    meetingId,
    content: content.trim(),
    type,
    createdAt: new Date().toISOString(),
    user: {
      id: 'dev-user-123',
      username: 'DevUser',
      displayName: 'Development User'
    }
  };
  
  return NextResponse.json({
    success: true,
    data: {
      message: mockMessage,
      success: true
    },
    message: 'Message sent successfully'
  });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const meetingId = params.id;
  const url = new URL(request.url);
  const messageId = url.pathname.split('/').pop();
  
  console.log('📱 Chat message deleted from meeting:', meetingId, 'Message ID:', messageId);
  
  return NextResponse.json({
    success: true,
    data: {
      messageId,
      success: true
    },
    message: 'Message deleted successfully'
  });
} 