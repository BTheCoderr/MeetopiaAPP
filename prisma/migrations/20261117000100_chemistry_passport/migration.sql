-- Chemistry Passport is opt-in and separate from editable public-profile interests.
-- This migration must be applied before releasing the updated API or signaling service.
ALTER TABLE "User"
  ADD COLUMN "chemistryIntent" TEXT,
  ADD COLUMN "chemistryStyle" TEXT,
  ADD COLUMN "chemistryInterests" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
