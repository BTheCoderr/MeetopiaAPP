-- Encore (Spark Cards) and SharedCreation hold private, mutually approved content
-- between two Connections. Like every other Meetopia table they are accessed only
-- server-side through Prisma, so lock them away from Supabase's public Data API
-- (anon / authenticated roles), matching 20260929013100_lock_prisma_tables_server_only.
ALTER TABLE "Encore" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SharedCreation" ENABLE ROW LEVEL SECURITY;

REVOKE ALL PRIVILEGES ON TABLE "Encore" FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON TABLE "SharedCreation" FROM anon, authenticated;
