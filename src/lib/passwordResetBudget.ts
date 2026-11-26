import { prisma } from './prisma'

// Only fixed server-controlled bucket names are persisted (no IPs, emails or usernames).
// Atomic SQL prevents concurrent/serverless instances from exceeding a window.
export async function consumeResetBudget(bucket: 'requests-minute' | 'emails-day'): Promise<boolean> {
  const duration = bucket === 'requests-minute' ? 60000 : 86400000
  const limit = bucket === 'requests-minute' ? 120 : 30
  const start = new Date(Math.floor(Date.now() / duration) * duration)
  const rows = await prisma.$queryRaw<{ count: number }[]>`
    INSERT INTO "PasswordResetBudget" ("bucket", "windowStart", "count")
    VALUES (${bucket}, ${start}, 1)
    ON CONFLICT ("bucket") DO UPDATE SET
      "windowStart" = EXCLUDED."windowStart",
      "count" = CASE WHEN "PasswordResetBudget"."windowStart" < EXCLUDED."windowStart" THEN 1
                     ELSE "PasswordResetBudget"."count" + 1 END
    WHERE "PasswordResetBudget"."windowStart" < EXCLUDED."windowStart"
       OR ("PasswordResetBudget"."windowStart" = EXCLUDED."windowStart" AND "PasswordResetBudget"."count" < ${limit})
    RETURNING "count"
  `
  return rows.length === 1
}
