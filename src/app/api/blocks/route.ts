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

  const blocks = await prisma.block.findMany({
    where: { blockerId: userId },
    include: {
      blocked: {
        select: { id: true, username: true, displayName: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ blocks })
}

export async function POST(request: Request) {
  const userId = await currentUserId()
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { blockedUserId } = await request.json()
  if (typeof blockedUserId !== 'string' || !blockedUserId || blockedUserId === userId) {
    return NextResponse.json({ error: 'Invalid user to block' }, { status: 400 })
  }

  const [userAId, userBId] = [userId, blockedUserId].sort()

  await prisma.$transaction([
    prisma.block.upsert({
      where: { blockerId_blockedId: { blockerId: userId, blockedId: blockedUserId } },
      update: {},
      create: { blockerId: userId, blockedId: blockedUserId },
    }),
    prisma.connection.deleteMany({ where: { userAId, userBId } }),
    prisma.vibe.deleteMany({
      where: {
        OR: [
          { senderId: userId, receiverId: blockedUserId },
          { senderId: blockedUserId, receiverId: userId },
        ],
      },
    }),
  ])

  return NextResponse.json({ success: true })
}

export async function DELETE(request: Request) {
  const userId = await currentUserId()
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { blockedUserId } = await request.json()
  if (typeof blockedUserId !== 'string' || !blockedUserId) {
    return NextResponse.json({ error: 'Invalid user to unblock' }, { status: 400 })
  }

  await prisma.block.deleteMany({
    where: { blockerId: userId, blockedId: blockedUserId },
  })

  return NextResponse.json({ success: true })
}
