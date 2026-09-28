import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function normalizePostgresUrl(value?: string | null) {
  if (!value) return null

  let normalized = value.trim()

  // Be forgiving of values pasted as KEY=value or wrapped in quotes.
  normalized = normalized.replace(/^DATABASE_URL(?:_UNPOOLED)?=/, '').trim()
  normalized = normalized.replace(/^['"]|['"]$/g, '').trim()

  if (!/^postgres(?:ql)?:\/\//i.test(normalized)) return null

  // Supabase/Supavisor transaction mode runs on port 6543. Prisma needs
  // PgBouncer mode there so it does not use prepared statements, and a
  // single client connection is the safe default for serverless functions.
  try {
    const url = new URL(normalized)
    const isSupabaseTransactionPooler =
      url.hostname.endsWith('.pooler.supabase.com') && url.port === '6543'

    if (isSupabaseTransactionPooler) {
      if (!url.searchParams.has('pgbouncer')) {
        url.searchParams.set('pgbouncer', 'true')
      }
      if (!url.searchParams.has('connection_limit')) {
        url.searchParams.set('connection_limit', '1')
      }
      normalized = url.toString()
    }
  } catch {
    return null
  }

  return normalized
}

function resolveDatabaseUrl() {
  const candidates = [
    process.env.MEETOPIA_DATABASE_URL,
    process.env.DATABASE_URL,
    process.env.DATABASE_URL_UNPOOLED,
  ]

  for (const candidate of candidates) {
    const normalized = normalizePostgresUrl(candidate)
    if (normalized) return normalized
  }

  return null
}

const databaseUrl = resolveDatabaseUrl()

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient(
    databaseUrl
      ? {
          datasources: {
            db: { url: databaseUrl },
          },
        }
      : undefined,
  )

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
