# Meetopia Report Handling

How in-app reports are stored and reviewed (MVP).

## Flow

1. User taps **Report** during a Chemistry Check and selects a category.
2. Mobile emits `report-user` to the Render signaling server with category, profiles, and socket IDs.
3. Server appends a JSON line to `server/data/reports.jsonl`.
4. Server sends an email via Resend (when configured).

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

Status values: `new`, `reviewed`, `actioned` (update manually in JSONL until dashboard exists).

## Render environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `REPORT_NOTIFY_EMAIL` | For email | Inbox for new report alerts |
| `RESEND_API_KEY` | For email | Resend API key |
| `REPORT_FROM_EMAIL` | Optional | Verified sender, e.g. `reports@yourdomain.com` |
| `REPORT_ADMIN_TOKEN` | Optional | Protects `GET /admin/reports` |

## Manual review (no dashboard)

```bash
curl "https://meetopiaapp.onrender.com/admin/reports?token=YOUR_REPORT_ADMIN_TOKEN&limit=20"
```

Or SSH/read `data/reports.jsonl` on the Render instance (if disk persists).

## Persistence note

Render free-tier filesystem may reset on redeploy. **Email notification** ensures you still receive reports. For durable storage, add Render Disk or migrate to a database (Phase 2).

## Block reports

Blocking a user does **not** automatically create a moderation report unless the user also submits Report. Block is handled locally on device.

## Response SLA

Documented on `/support`: aim to respond within **2 business days**.
