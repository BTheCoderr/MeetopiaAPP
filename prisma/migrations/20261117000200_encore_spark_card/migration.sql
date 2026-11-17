-- Encore choices are private until both Connection members opt to share.
-- This additive migration must NOT be applied to production as part of a draft PR.
CREATE TABLE "Encore" (
  "connectionId" TEXT NOT NULL,
  "userAChoice" TEXT,
  "userBChoice" TEXT,
  "userAShared" BOOLEAN NOT NULL DEFAULT false,
  "userBShared" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Encore_pkey" PRIMARY KEY ("connectionId")
);
ALTER TABLE "Encore"
  ADD CONSTRAINT "Encore_connectionId_fkey"
  FOREIGN KEY ("connectionId") REFERENCES "Connection"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
