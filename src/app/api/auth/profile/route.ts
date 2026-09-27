import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

async function currentUserId() {
  const sessionId = cookies().get('meetopia_session')?.value
  if (!sessionId) return null
  const session = await getSession(sessionId)
  return session?.userId || null
}

export async function GET() {
  try {
    const userId = await currentUserId()
    if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        bio: true,
        interests: true,
      }
    })

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    return NextResponse.json({
      ...user,
      name: user.displayName || user.username,
    })
  } catch (error) {
    console.error('Profile error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const userId = await currentUserId()
    if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const body = await request.json()
    const displayName =
      typeof (body.displayName ?? body.name) === 'string'
        ? String(body.displayName ?? body.name).trim().slice(0, 60)
        : undefined
    const bio = typeof body.bio === 'string' ? body.bio.trim().slice(0, 500) : undefined
    const interests = Array.isArray(body.interests)
      ? body.interests.filter((value: unknown): value is string => typeof value === 'string').map((value: string) => value.trim()).filter(Boolean).slice(0, 20)
      : undefined


    const user = await prisma.user.update({
      where: { id: userId },
      data: { displayName, bio, interests },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        bio: true,
        interests: true,
      }
    })

    return NextResponse.json({ ...user, name: user.displayName || user.username })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
