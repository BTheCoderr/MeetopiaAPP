import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { prisma } from '@/lib/prisma'
import { parseChemistryPassport } from '@/lib/chemistryPassport'

async function currentUserId(request: NextRequest) {
  const id = request.cookies.get('meetopia_session')?.value
  if (!id) return null
  const session = await getSession(id)
  return session?.userId ?? null
}

const select = {
  chemistryIntent: true,
  chemistryStyle: true,
  chemistryInterests: true,
  adultConfirmedAt: true,
} as const

function toResponse(user: {
  chemistryIntent: string | null; chemistryStyle: string | null; chemistryInterests: string[]; adultConfirmedAt: Date | null
}) {
  const passport = parseChemistryPassport({
    intent: user.chemistryIntent,
    style: user.chemistryStyle,
    interests: user.chemistryInterests,
  })
  return { complete: Boolean(passport), passport, adultConfirmed: Boolean(user.adultConfirmedAt) }
}

export async function GET(request: NextRequest) {
  try {
    const userId = await currentUserId(request)
    if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    const user = await prisma.user.findUnique({ where: { id: userId }, select })
    if (!user) return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    return NextResponse.json(toResponse(user), { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Chemistry Passport load failed', error)
    return NextResponse.json({ error: 'Could not load Chemistry Passport.' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = await currentUserId(request)
    if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    if (Number(request.headers.get('content-length') || '0') > 2048) {
      return NextResponse.json({ error: 'Passport is too large.' }, { status: 413 })
    }
    const body: unknown = await request.json().catch(() => null)
    const passport = parseChemistryPassport(body)
    if (!passport) {
      return NextResponse.json({ error: 'Choose an intention, conversation style, and 2 to 5 distinct interests.' }, { status: 400 })
    }
    const user = await prisma.user.update({
      where: { id: userId },
      data: { chemistryIntent: passport.intent, chemistryStyle: passport.style, chemistryInterests: passport.interests },
      select,
    })
    return NextResponse.json(toResponse(user), { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Chemistry Passport save failed', error)
    return NextResponse.json({ error: 'Could not save Chemistry Passport.' }, { status: 500 })
  }
}
