import { NextRequest, NextResponse } from 'next/server'
import { deleteSession } from '@/lib/auth/session'

export async function POST(request: NextRequest) {
  const sessionId = request.cookies.get('meetopia_session')?.value
  if (sessionId) {
    try {
      await deleteSession(sessionId)
    } catch (error) {
      // A stale/missing session is already signed out.
      if (!(error instanceof Error) || !error.message.includes('Record to delete does not exist')) {
        console.error('Signout error:', error)
        return NextResponse.json({ error: 'Could not sign out.' }, { status: 500 })
      }
    }
  }
  const response = NextResponse.json({ success: true })
  response.cookies.set('meetopia_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(0),
  })
  return response
}
