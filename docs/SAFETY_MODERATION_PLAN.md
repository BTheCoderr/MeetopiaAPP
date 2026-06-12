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
| Block | Confirms, saves profile fingerprint + socket ID locally, leaves chat, skips on rematch |
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

- Immediate disconnect from current chat.
- Blocked profile fingerprints and socket IDs stored in AsyncStorage on device.
- Checked on `user-found` / `call-made` before accepting a match.
- Server-side global bans require authenticated accounts (planned).

## Server handling (MVP)

- `report-user` events are **appended to `server/data/reports.jsonl`** on Render.
- Team receives **email notification** via Resend when `RESEND_API_KEY` and `REPORT_NOTIFY_EMAIL` are configured.
- Optional: `GET /admin/reports?token=...` for manual review.
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

- Required 18+ confirmation before onboarding.
- Stored locally; re-shown after local profile deletion.
- Underage reports prioritized when triaged.

## Account deletion

- Settings → **Delete local profile & data** clears local profile, blocks, vibe matches, age flag.
- Server-side deletion when auth ships; document in Privacy Policy.

## Community standards

See [COMMUNITY_GUIDELINES.md](./COMMUNITY_GUIDELINES.md).

## Public safety page

https://meetopia-live.netlify.app/safety

## TestFlight validation

Verify report/block/leave flows in [TESTFLIGHT_QA.md](./TESTFLIGHT_QA.md).
