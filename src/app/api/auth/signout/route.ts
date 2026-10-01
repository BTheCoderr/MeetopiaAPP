import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const sessionId = request.cookies.get('meetopia_session')?.value

  if (sessionId) {
    await prisma.session.deleteMany({
      where: { id: sessionId },
    })
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set('meetopia_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(0),
    maxAge: 0,
  })

  return response
}
