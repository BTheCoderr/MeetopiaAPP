# Meetopia Report Handling

How in-app reports are stored and reviewed.

## Flow

1. User taps **Report** during a Chemistry Check and selects a category.
2. Mobile emits `report-user` to the Render signaling server with category, profiles, and socket IDs.
3. Server persists the report (priority order):
   - **Primary:** Supabase Postgres table `mobile_reports`
   - **Fallback:** append to `server/data/reports.jsonl` (ephemeral on Render — not for production)
4. *(Optional later)* Server sends an email via Resend when `RESEND_API_KEY` is configured.

For **external TestFlight / App Store review**, configure **Supabase** on Render. Email alerts are optional.

## Supabase setup (recommended)

1. Create a Supabase project (or use existing).
2. Run [`server/sql/mobile_reports.sql`](../server/sql/mobile_reports.sql) in the SQL Editor.
3. On Render signaling service, set:
   - `SUPABASE_URL` — Project URL
   - `SUPABASE_SERVICE_ROLE_KEY` — service role key (server only, never in mobile app)

Verify `/health` returns `"reports": { "supabase": true, ... }`. Email can stay `false` until you add Resend later.

## Report record shape

```json
{
  "id": "uuid",
  "reporterSocketId": "...",
  "reportedSocketId": "...",
  "category": "harassment",
  "timestamp": 1710000000000,
  "reporterProfile": { "name": "...", "age": 28 },
  "reportedProfile": { "name": "...", "age": 30 },
  "sessionId": "socketA:socketB",
  "status": "new"
}
```

Status values: `new`, `reviewed`, `actioned` (update in Supabase SQL editor or dashboard).

## Render environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `SUPABASE_URL` | **Yes (external TF)** | Durable report storage |
| `SUPABASE_SERVICE_ROLE_KEY` | **Yes (external TF)** | Server-side insert/read |
| `REPORT_NOTIFY_EMAIL` | Optional | Inbox for new report alerts (Resend) |
| `RESEND_API_KEY` | Optional | Resend API key |
| `REPORT_FROM_EMAIL` | Optional | Sender, e.g. `Meetopia Reports <onboarding@resend.dev>` |
| `REPORT_ADMIN_TOKEN` | Optional | Protects `GET /admin/reports` |

See [`server/.env.example`](../server/.env.example).

## Manual review (no dashboard)

**Supabase:** Table Editor → `mobile_reports`, or SQL:

```sql
select * from mobile_reports order by created_at desc limit 20;
```

**HTTP:**

```bash
curl "https://meetopiaapp.onrender.com/admin/reports?token=YOUR_REPORT_ADMIN_TOKEN&limit=20"
```

## Persistence options

| Option | Durability | Notes |
|--------|------------|-------|
| **Supabase/Postgres** | Durable | Recommended for Apple review |
| Resend email only | Durable as inbox record | OK if DB not ready yet |
| JSONL on Render web service | **Not durable** | Ephemeral filesystem; fallback only |
| Render persistent disk | Durable | Alternative if you skip Supabase |

## Block reports

Blocking a user does **not** automatically create a moderation report unless the user also submits Report. Block is handled locally on device.

## Response SLA

Documented on `/support`: aim to respond within **2 business days**.
