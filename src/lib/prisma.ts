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

  return /^postgres(?:ql)?:\/\//i.test(normalized) ? normalized : null
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
