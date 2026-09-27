import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth/session'

async function currentUserId() {
  const sessionId = cookies().get('meetopia_session')?.value
  if (!sessionId) return null
  const session = await getSession(sessionId)
  return session?.userId || null
}

export async function GET() {
  const userId = await currentUserId()
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { adultConfirmedAt: true },
  })

  return NextResponse.json({ confirmed: Boolean(user?.adultConfirmedAt) })
}

export async function POST() {
  const userId = await currentUserId()
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  await prisma.user.update({
    where: { id: userId },
    data: { adultConfirmedAt: new Date() },
  })

  return NextResponse.json({ confirmed: true })
}
