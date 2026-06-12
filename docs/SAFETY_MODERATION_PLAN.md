# Meetopia Safety & Moderation Plan (MVP)

## Goals

- Keep Meetopia **18+** and oriented toward respectful dating/meeting.
- Give users immediate tools: **Report**, **Block**, **Leave**.
- Establish a path to human review without overclaiming automation.

## In-app safety surfaces

### Video / Chemistry Check

| Control | Behavior |
|---------|----------|
| Report | Opens modal with categories; emits `report-user` to signaling server |
| Block | Confirms, adds socket ID to local block list, leaves chat, skips on rematch |
| Leave | Confirms before disconnecting |

### Report categories

1. Nudity or sexual content  
2. Harassment  
3. Hate or threats  
4. Spam/scam  
5. Underage user  
6. Other  

User sees: *“Report submitted. Our team reviews reports. Leave the chat if you feel unsafe.”*

### Block

- Immediate disconnect from current chat.
- Blocked IDs stored in AsyncStorage and checked on `user-found` / `call-made`.
- Session-scoped on signaling server (no global ban until account system exists).

## Server handling (MVP)

- `report-user` events are **logged** on Render (`server/index.js`) with reason, reported user ID, timestamp.
- No automated ban from reports in MVP.
- `vibe-tap` relayed for mutual Vibe UX only.

## Moderation workflow (Phase 2)

1. Ingest reports into database / admin queue.
2. Triage by category (underage = priority).
3. Actions: warn, suspend, ban by account/device.
4. Retain reports per legal retention policy.

## What we do NOT claim in MVP

- ❌ AI video moderation  
- ❌ Auto-blur of inappropriate content  
- ❌ 24/7 human monitoring of live calls  
- ❌ Guaranteed response time on reports  

## Age gate

- Required 18+ confirmation before onboarding.
- Stored locally; re-shown after account deletion.
- Underage reports escalated when review tooling exists.

## Account deletion

- Settings → Delete account data clears local profile, blocks, vibe matches, age flag.
- Server-side deletion when auth ships; document in Privacy Policy.

## Community standards

See [COMMUNITY_GUIDELINES.md](./COMMUNITY_GUIDELINES.md).

## TestFlight validation

Verify report/block/leave flows in [TESTFLIGHT_QA.md](./TESTFLIGHT_QA.md).
