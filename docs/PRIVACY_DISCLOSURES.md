# Meetopia Privacy Disclosures (Draft — owner review required)

Use this document for App Store Privacy Nutrition Labels, Privacy Policy drafting, and internal compliance review. **Not legal advice** — have counsel review before publication.

**Status (2026-11-24):** revised for the consent-first release on `meetopia-staging-preflight`
(Chemistry Passport, mutual-consent introductions, Vibe Rooms, Encore / Spark Cards, Co-Create).
The public page `src/app/privacy/page.tsx` was rewritten to match. **The owner must approve both
before production release.** Every statement below is traced to the code that implements it.

## Public policy URLs (live)

| Page | URL |
|------|-----|
| Home | https://meetopia-live.netlify.app |
| Privacy Policy | https://meetopia-live.netlify.app/privacy |
| Terms of Service | https://meetopia-live.netlify.app/terms |
| Community Guidelines | https://meetopia-live.netlify.app/community-guidelines |
| Support | https://meetopia-live.netlify.app/support |
| Safety & Reporting | https://meetopia-live.netlify.app/safety |

Mobile app Settings opens the same URLs (`apps/mobile/src/config/links.ts`).

## Data we store, where, and the code that controls it

| Data | Stored in | Who can see it | Source of truth |
|------|-----------|----------------|-----------------|
| Account: email, username, display name, bcrypt password hash | Supabase Postgres `User` | Server only | `prisma/schema.prisma`, `src/app/api/auth/signup` |
| Age confirmation timestamp | `User.adultConfirmedAt` | Server only; gates matching | `server/index.js` (`ADULT_CONFIRMATION_REQUIRED`) |
| Chemistry Passport: intent, style, interests (fixed lists) | `User.chemistryIntent/Style/Interests` | Introduced person sees display name, style and **shared interests only** | `src/lib/chemistry*`, `server/consentIntroductions.js` (`introduction-offered`) |
| Introduction accept/decline | Signaling memory only | Not shown to the other person as a reason | `server/consentIntroductions.js` |
| Vibe Room private round choices (e.g. Curveball) | Signaling memory only; cleared on skip/disconnect/expiry | Revealed only when both chose | `server/vibeRoomSessions.js`, `server/vibeRoomSessions.test.cjs` |
| In-room chat | Relayed only, not persisted | The two participants | `server/index.js` `chat-message` |
| Vibes and Connections | `Vibe`, `Connection` | The two members | `prisma/schema.prisma` |
| Connection messages + read status | `Message` | The two members | `src/app/api/connections/[connectionId]/messages` |
| Encore / Spark Card choice | `Encore` — written only with explicit `share: true`; member can withdraw | The Connection | `src/app/api/connections/[connectionId]/encore/route.ts` |
| Co-Create shared creation (theme, activity, setting) | `SharedCreation` — only after both approve **and** mutual Vibe; either member can delete | The Connection | `src/app/api/connections/[connectionId]/creation/route.ts`, `server/vibeRoomSessions.js` |
| Blocks | `Block`; blocking deletes the Connection (cascades Encore + SharedCreation) | Server only | `src/app/api/blocks/route.ts` |
| In-app reports (account-linked) | `Report` | Moderation | `prisma/schema.prisma` |
| Live-session reports (socket IDs, profile snapshot, category) | Supabase `mobile_reports` via Render service role; JSONL fallback; email to moderators | Moderation | `server/reportsStore.js`, `server/reportsDb.js` |
| Sign-in session | `Session` + `meetopia_session` cookie | Server only | `src/lib/auth/session` |

All Prisma tables have RLS enabled and no `anon`/`authenticated` grants
(`20260929013100_lock_prisma_tables_server_only`, `20261117000400_lock_vibe_room_tables_server_only`);
CI fails if any `public` table is exposed (`scripts/disposable-db-smoke.cjs`).

## Not collected / not done

- No recording or storage of live video or audio.
- No AI analysis of video or audio.
- No sale of personal data; Passport data is not used for advertising.
- Full interest lists are never sent to the other person — only the overlap.

## Camera, microphone and network

Camera and microphone are required for live video in Vibe Rooms. Media is peer-to-peer via WebRTC
where possible, which can reveal each device's IP address to the other device. When a direct path
fails, DTLS-SRTP-encrypted media is relayed by a TURN provider (ExpressTURN), which sees network
addresses but not media content.

## Account deletion

`DELETE /api/auth/account` (web) and **Settings → Delete your account** (mobile) delete the `User` row.
Cascades remove Passport fields, Vibes, Connections (with Encore and SharedCreation), blocks and
sessions; messages, `Report` rows and feedback tied to the user are deleted explicitly.
**Live-session reports in `mobile_reports` are not deleted** — the policy says they may be retained
for safety review.

## Third parties (processors)

| Service | Role |
|---------|------|
| Netlify | Web app and API hosting |
| Supabase | Postgres database; live-session report storage |
| Render | Real-time signaling hosting |
| ExpressTURN | TURN relay for encrypted media when direct connection fails |
| Resend | Password-reset and moderation notification email |
| Apple TestFlight / App Store | Distribution |
| Expo / EAS | Build and updates (when configured) |

## Owner decisions required before release

1. Approve the revised public privacy page wording.
2. Set a **retention period** for `mobile_reports` and state it in the policy.
3. Confirm `mobile_reports` has RLS on and no `anon`/`authenticated` grants in production (it is not a
   Prisma table, so the CI exposure check does not cover it).
4. Confirm ExpressTURN and Resend as named processors, and decide whether to name processors in the
   public policy.
5. Confirm the privacy contact address used by `ContactEmail` is monitored.
6. Update App Store privacy labels (below) in App Store Connect.

## Children

Meetopia is **18+ only**. We do not knowingly collect data from anyone under 18. Report underage users via in-app Report.

## App Store privacy label mapping (draft — revise in App Store Connect)

- **Contact Info:** Email address (account), name (display name)
- **User Content:** Messages; Chemistry Passport preferences; Encore choices; shared creations; reports
- **Identifiers:** User ID
- **Sensitive Info:** Consider whether relationship intent counts — owner/counsel decision
- **Usage Data:** None beyond product function

Linked to user: Yes. Used for tracking: No.
