import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth/session'

async function currentUserId(request: NextRequest) {
  const sessionId = request.cookies.get('meetopia_session')?.value
  if (!sessionId) return null

  const session = await getSession(sessionId)
  return session?.userId || null
}

export async function GET(request: NextRequest) {
  try {
    const userId = await currentUserId(request)
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { adultConfirmedAt: true },
    })

    return NextResponse.json({ confirmed: Boolean(user?.adultConfirmedAt) })
  } catch (error) {
    console.error('Adult confirmation GET error:', error)
    return NextResponse.json(
      { error: 'Could not verify your age confirmation.' },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await currentUserId(request)
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    await prisma.user.update({
      where: { id: userId },
      data: { adultConfirmedAt: new Date() },
    })

    return NextResponse.json({ confirmed: true })
  } catch (error) {
    console.error('Adult confirmation POST error:', error)
    return NextResponse.json(
      { error: 'Could not save your age confirmation.' },
      { status: 500 },
    )
  }
}
