ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "resetPasswordTokenHash" TEXT,
ADD COLUMN IF NOT EXISTS "resetPasswordExpiresAt" TIMESTAMP(3);

CREATE UNIQUE INDEX IF NOT EXISTS "User_resetPasswordTokenHash_key"
ON "User"("resetPasswordTokenHash");
