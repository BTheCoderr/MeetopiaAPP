'use strict'
const { assertBranchMode, assertRenderStagingDatabase } = require('./render-staging-guard.cjs')
if (assertBranchMode(process.env) !== 'staging') throw new Error('Render bootstrap is staging only.')
assertRenderStagingDatabase(process.env)
const { PrismaClient } = require('@prisma/client')
async function main() {
  const db = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } })
  try {
    const [identity] = await db.$queryRawUnsafe('SELECT current_database() AS name')
    if (identity?.name !== 'meetopia_staging_db') throw new Error('Unexpected staging database name.')
    // Historical migrations refer to these roles, provided automatically on Supabase.
    // They are NOLOGIN and receive no default privileges on this isolated database.
    await db.$executeRawUnsafe(`DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN CREATE ROLE anon NOLOGIN; END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN CREATE ROLE authenticated NOLOGIN; END IF;
    END $$`)
    console.log('Isolated staging database role prerequisites verified.')
  } finally { await db.$disconnect() }
}
main().catch(error => {
  console.error('Staging database bootstrap failed:', error?.code || error?.name || 'Error')
  process.exitCode = 1
})
