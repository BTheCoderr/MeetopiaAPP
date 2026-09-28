import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const noStoreHeaders = {
  'Cache-Control': 'no-store, max-age=0',
}

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json(
      { ok: true, database: 'connected' },
      { headers: noStoreHeaders },
    )
  } catch {
    return NextResponse.json(
      { ok: false, database: 'unavailable' },
      { status: 503, headers: noStoreHeaders },
    )
  }
}
