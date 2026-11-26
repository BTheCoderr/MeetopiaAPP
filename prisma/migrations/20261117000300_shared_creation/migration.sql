-- Persist only the final approved Co-Create artifact on a mutual Connection.
-- Independent, additive migration: execute only after reviewed staging rollout.
CREATE TABLE "SharedCreation" (
  "connectionId" TEXT NOT NULL,
  "themeId" TEXT NOT NULL,
  "activity" TEXT NOT NULL,
  "setting" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SharedCreation_pkey" PRIMARY KEY ("connectionId")
);
ALTER TABLE "SharedCreation"
  ADD CONSTRAINT "SharedCreation_connectionId_fkey"
  FOREIGN KEY ("connectionId") REFERENCES "Connection"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
