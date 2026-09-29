# Meetopia Safety & Moderation Plan (MVP)

## Goals

- Keep Meetopia **18+** and oriented toward respectful dating/meeting.
- Give users immediate tools: **Report**, **Block**, **Leave**.
- Establish human review via stored reports and email alerts — without overclaiming automation.

## In-app safety surfaces

### Video / Chemistry Check

| Control | Behavior |
|---------|----------|
| Report | Opens modal with categories; emits `report-user` to signaling server |
| Block | Confirms, persists an account-level block, removes the saved Connection, and prevents future matching |
| Leave | Confirms before disconnecting |

### Report categories

1. Nudity or sexual content  
2. Harassment  
3. Hate or threats  
4. Spam/scam  
5. Underage user  
6. Other  

User sees: *“Meetopia logs reports for review. Leave the chat if you feel unsafe.”*

### Block

- Immediate disconnect from the current chat.
- Blocks are stored against authenticated accounts in Postgres.
- A block removes the saved Connection and its private messages.
- Blocked accounts are excluded from future Chemistry Check matching.
- Users can review and reverse their own blocks from Profile → Blocked users.

## Server handling (MVP)

- `report-user` events are stored durably in Supabase `mobile_reports` when the Render service is configured correctly.
- JSONL is an emergency fallback only and is not treated as durable production storage.
- Team can receive email notification via Resend when `RESEND_API_KEY` and `REPORT_NOTIFY_EMAIL` are configured.
- Optional manual review endpoint: `GET /admin/reports` with `Authorization: Bearer <REPORT_ADMIN_TOKEN>`.
- No automated ban from reports in MVP.

See [REPORT_HANDLING.md](./REPORT_HANDLING.md).

## Moderation workflow (Phase 2)

1. Ingest reports into database / admin queue.
2. Triage by category (underage = priority).
3. Actions: warn, suspend, ban by account/device.
4. Retain reports per legal retention policy.

## What we do NOT claim in MVP

- AI video moderation  
- Auto-blur of inappropriate content  
- 24/7 human monitoring of live calls  
- Guaranteed response time on reports  
- Verified users or background checks  

## Age gate

- Required 18+ confirmation before Chemistry Check access.
- Confirmation is tied to the authenticated account.
- Underage reports are prioritized when triaged.

## Account deletion

- Meetopia now uses authenticated accounts for Connections, blocks, sessions, and age confirmation.
- Account-deletion UX and server-side cascading deletion must stay aligned with the Privacy Policy before public launch.

## Community standards

See [COMMUNITY_GUIDELINES.md](./COMMUNITY_GUIDELINES.md).

## Public safety page

https://meetopia-live.netlify.app/safety

## TestFlight validation

Verify report/block/leave flows in [TESTFLIGHT_QA.md](./TESTFLIGHT_QA.md).
