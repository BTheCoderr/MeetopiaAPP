'use strict'

// Supabase provides anon/authenticated roles automatically. Our existing
// historic RLS migration revokes their permissions. Standalone PostgreSQL does
// not have those roles, so only the temporary CI service needs them.
//
// NEVER use this helper with a non-disposable database.
const { PrismaClient } = require('@prisma/client')
const url = process.env.DATABASE_URL || ''
if (process.env.MEETOPIA_DISPOSABLE_DB !== 'yes'
  || !/^postgresql:\/\/postgres:postgres@(?:localhost|127\.0\.0\.1):5432\/meetopia(?:\?|$)/.test(url)) {
  throw new Error('Refusing bootstrap outside disposable local PostgreSQL.')
}

async function main() {
  const db = new PrismaClient()
  try {
    await db.$executeRawUnsafe('CREATE ROLE anon NOLOGIN')
    await db.$executeRawUnsafe('CREATE ROLE authenticated NOLOGIN')
    console.log('Created synthetic Supabase anon/authenticated roles in disposable PostgreSQL only.')
  } finally {
    await db.$disconnect()
  }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
