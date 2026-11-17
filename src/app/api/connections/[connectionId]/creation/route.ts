import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { currentUserId, getConnectionForUser, isBlockedBetween } from '@/lib/connectionAccess'
import { creationLabels, validateCreation } from '@/lib/sharedCreation'

type Context = { params: Promise<{ connectionId: string }> }
const headers = { 'Cache-Control': 'private, no-store' }

async function authorized(request: NextRequest, context: Context) {
  const userId = await currentUserId(request)
  if (!userId) return { error: NextResponse.json({ error: 'Not authenticated' }, { status: 401 }) }
  const { connectionId } = await context.params
  const record = await getConnectionForUser(connectionId, userId)
  if (!record) return { error: NextResponse.json({ error: 'Connection not found' }, { status: 404 }) }
  if (await isBlockedBetween(userId, record.person.id)) {
    return { error: NextResponse.json({ error: 'Connection not available' }, { status: 403 }) }
  }
  return { connectionId }
}

export async function GET(request: NextRequest, context: Context) {
  try {
    const match = await authorized(request, context)
    if (match.error) return match.error
    const record = await prisma.sharedCreation.findUnique({ where: { connectionId: match.connectionId! } })
    const creation = validateCreation(record)
    return NextResponse.json({ creation, labels: creation ? creationLabels(creation) : null }, { headers })
  } catch (error) {
    console.error('Shared creation lookup failed', error)
    return NextResponse.json({ error: 'Could not load your shared creation.' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: Context) {
  try {
    const match = await authorized(request, context)
    if (match.error) return match.error
    // Either participant may revoke the shared creation at any point.
    await prisma.sharedCreation.deleteMany({ where: { connectionId: match.connectionId! } })
    return NextResponse.json({ creation: null, labels: null }, { headers })
  } catch (error) {
    console.error('Shared creation revocation failed', error)
    return NextResponse.json({ error: 'Could not remove shared creation.' }, { status: 500 })
  }
}
