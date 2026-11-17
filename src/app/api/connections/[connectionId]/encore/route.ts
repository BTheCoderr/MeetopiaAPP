import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { currentUserId, getConnectionForUser, isBlockedBetween } from '@/lib/connectionAccess'
import { encoreView, isEncoreChoice, type EncoreRecord } from '@/lib/encore'

type RouteContext = { params: Promise<{ connectionId: string }> }

async function contextFor(request: NextRequest, context: RouteContext) {
  const userId = await currentUserId(request)
  if (!userId) return { error: NextResponse.json({ error: 'Not authenticated' }, { status: 401 }) }
  const { connectionId } = await context.params
  const record = await getConnectionForUser(connectionId, userId)
  if (!record) return { error: NextResponse.json({ error: 'Connection not found' }, { status: 404 }) }
  if (await isBlockedBetween(userId, record.person.id)) {
    return { error: NextResponse.json({ error: 'Connection is unavailable' }, { status: 403 }) }
  }
  return { connectionId, memberIsA: record.connection.userAId === userId }
}

const headers = { 'Cache-Control': 'private, no-store' }

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const match = await contextFor(request, context)
    if (match.error) return match.error
    const record = await prisma.encore.findUnique({ where: { connectionId: match.connectionId! } })
    return NextResponse.json(encoreView(record as EncoreRecord | null, match.memberIsA!), { headers })
  } catch (error) {
    console.error('Encore load failed', error)
    return NextResponse.json({ error: 'Could not load this Encore.' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const match = await contextFor(request, context)
    if (match.error) return match.error
    if (Number(request.headers.get('content-length') || 0) > 512) {
      return NextResponse.json({ error: 'Encore selection too large.' }, { status: 413 })
    }
    const body = await request.json().catch(() => null)
    if (!isEncoreChoice(body?.choice) || body?.share !== true) {
      return NextResponse.json({ error: 'Choose an Encore idea and explicitly agree to share it.' }, { status: 400 })
    }
    const fields = match.memberIsA
      ? { userAChoice: body.choice, userAShared: true }
      : { userBChoice: body.choice, userBShared: true }
    const record = await prisma.encore.upsert({
      where: { connectionId: match.connectionId! },
      create: { connectionId: match.connectionId!, ...fields },
      update: fields,
    })
    return NextResponse.json(encoreView(record, match.memberIsA!), { headers })
  } catch (error) {
    console.error('Encore share failed', error)
    return NextResponse.json({ error: 'Could not share your Encore choice.' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const match = await contextFor(request, context)
    if (match.error) return match.error
    const fields = match.memberIsA
      ? { userAChoice: null, userAShared: false }
      : { userBChoice: null, userBShared: false }
    // No-op if no Encore was created; explicit revocation hides the shared
    // Spark Card on both sides at the next refresh.
    await prisma.encore.updateMany({ where: { connectionId: match.connectionId! }, data: fields })
    const record = await prisma.encore.findUnique({ where: { connectionId: match.connectionId! } })
    return NextResponse.json(encoreView(record, match.memberIsA!), { headers })
  } catch (error) {
    console.error('Encore revoke failed', error)
    return NextResponse.json({ error: 'Could not withdraw your Encore.' }, { status: 500 })
  }
}
