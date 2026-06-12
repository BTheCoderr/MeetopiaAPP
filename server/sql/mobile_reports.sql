-- Meetopia mobile safety reports (signaling server)
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

create table if not exists public.mobile_reports (
  id uuid primary key,
  reporter_socket_id text not null,
  reported_socket_id text not null,
  category text not null,
  created_at timestamptz not null default now(),
  reporter_profile jsonb,
  reported_profile jsonb,
  session_id text,
  status text not null default 'new' check (status in ('new', 'reviewed', 'actioned'))
);

create index if not exists mobile_reports_created_at_idx
  on public.mobile_reports (created_at desc);

create index if not exists mobile_reports_status_idx
  on public.mobile_reports (status);

-- Service role bypasses RLS; block anon/authenticated direct access.
alter table public.mobile_reports enable row level security;

-- No public policies: only service_role (Render signaling server) can read/write.

comment on table public.mobile_reports is
  'In-app user reports from Meetopia mobile Chemistry Check (signaling server ingest).';
