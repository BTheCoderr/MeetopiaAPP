BEGIN;
CREATE TABLE "PasswordResetBudget" (
  "bucket" TEXT NOT NULL,
  "windowStart" TIMESTAMP(3) NOT NULL,
  "count" INTEGER NOT NULL,
  CONSTRAINT "PasswordResetBudget_pkey" PRIMARY KEY ("bucket"),
  CONSTRAINT "PasswordResetBudget_count_check" CHECK ("count" > 0)
);
ALTER TABLE "PasswordResetBudget" ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE "PasswordResetBudget" FROM PUBLIC, anon, authenticated;
COMMIT;
