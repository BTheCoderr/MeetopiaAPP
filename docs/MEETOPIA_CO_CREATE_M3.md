# Meetopia Co-Create — Milestone 3 (themed sessions + The Bridge)

**Status:** Draft source implementation only. Not installed on iPhones; not deployed to production or submitted to Apple. Do NOT describe this as a shipped feature or completed TestFlight beta.

## Product behavior: what changed

### 1. Choose a named, opt-in Vibe Session

The current app routes account-backed, adult-confirmed members to `/sessions` after their Chemistry Passport. Three curated, fixed themes are available:

- Music & Memories
- Weekend Adventures
- Curious Minds

The server accepts only one of those theme IDs and matches two eligible available adults who selected **the same** theme and have compatible Passports. No fabricated people, scores, AI advice, or auto-chosen theme. A member still has to wait for another available person in the theme. **This is not a calendar-based or prescheduled session system.**

The server does **not** create a WebRTC media pair before both accept the same expiring introduction. Existing authenticated Connection calls work separately and need no theme.

### 2. Four synchronized rounds

1. **The Spark**: a question written for that theme; both mark ready.
2. **The Curveball**: independent, bounded choice; nobody sees the other person's answer before both choose.
3. **The Real Talk**: an open question; both mark ready.
4. **The Bridge (Co-Create)**: complementary roles. One participant contributes an **activity**, the other a **setting**. Both see the joint proposal only after both contribute. Each can revise their own contribution; this invalidates both previous approvals. Each must explicitly approve **and agree to share** the exact same revision. Only then can either send Vibe.

The server, not the client, owns the room ID, phase, contributions, approval set and version. Stale approvals, forged IDs, premature Vibe, cross-theme matching, declined invitations, timeouts, blocked users and disconnects must not authorize a new Connection.

### 3. Signed, consented shared creation

After both participants approve The Bridge **and** mutual Vibe is confirmed, signaling includes the validated joint outcome in a short-lived HMAC-signed proof. The authenticated Next.js API validates that proof and persists only the approved theme, activity and setting to the saved Connection. The private earlier choices, discarded versions, chat audio/video, transcripts and compatibility judgments are not stored.

Each member can see the saved **Our First Shared Adventure** card in Connections and independently revoke/delete it. Connection deletion cascades to the creation. The existing Encore is separate and remains optional.

## Code areas

- `server/themeCatalog.js`: allowlisted themes and choices
- `server/consentIntroductions.js`: themed queue + two-sided consent
- `server/vibeRoomSessions.js`: 4 phases and revision-bound Bridge dual approval
- `server/index.js`, `server/socketAuth.js`: authenticated events, protocol v3, signed final artifact
- `src/lib/sharedCreation.ts`, `src/lib/socketToken.ts`: proof validation/allowed choice catalogue
- `src/app/api/connections/route.ts`: creation persistence after mutual-Vibe proof
- `src/app/api/connections/[connectionId]/creation/route.ts`: Connection membership/blocked access checks, read and revoke
- `prisma/migrations/20261117000300_shared_creation/migration.sql`: additive `SharedCreation` table
- `apps/mobile/app/sessions/index.tsx`, `src/app/sessions/page.tsx`: themed session selection
- `apps/mobile/src/components/video/VibeRounds.tsx`, `src/components/video-chat/VibeRounds.tsx`: Bridge UI
- `apps/mobile/src/components/connections/CoCreationCard.tsx`, `src/components/connections/CoCreationCard.tsx`: saved cards
- `.github/workflows/meetopia-co-create-m3-check.yml`: CI including disposable PostgreSQL migrations

## Deployment / compatibility (NO production actions authorized)

- All 3 additive migrations must be reviewed and applied, in order, to **staging** before matching API, web and signaling changes:
  `20261117000100_chemistry_passport`, `20261117000200_encore_spark_card`, `20261117000300_shared_creation`.
- Staging must deploy a matching code revision of web/API, signaling and EAS beta. This milestone uses signaling **protocol v3**, which fails closed on old clients. Do not roll out only one component; keep rollback ready.
- The in-memory Vibe Room and waiting queue are single-instance: multi-instance signaling, server restarts and scaling need external shared authoritative state before production scale.
- A signed EAS iPhone beta, EAS archive, physical 2-device media, Wi-Fi/cellular TURN, app restart, permission interruptions, live-block/reconnect behavior and moderated UGC have **not** been validated.
- No cloud build has been started, and no staging or production database has been altered by this branch.
- The original 27-item 2-iPhone QA checklist still applies. Add: cross-theme isolation, theme persistence across retry, failed proposal approval, mid-approval revision, shared card creation only after mutual Vibe, and either-member revocation.

## Apple 4.3 and 4.2.6 evidence

Co-Create adds a more distinctive behavior than generic video speed dating: people jointly **author and approve an outcome** rather than only answering prompts or choosing whether to match. This is a meaningful candidate differentiation, **not a claim of uniqueness or a guarantee of App Store approval**. Competing apps may offer overlapping games or collaborative activities, so do not use unverified exclusivity language.

For 4.2.6, review the already completed historical code provenance work in `docs/APP_REVIEW_426_CODE_PROVENANCE.md`. Project ownership, asset rights, any third-party template history and Apple developer-account app overlaps still require truthful, owner-supplied confirmation.

For 1.2, a fixed theme plus consent is not the same as a complete moderation system or independent Apple clearance. Blocking/reporting and operational review must still be tested and documented.

## Automated evidence versus user evidence

Automated unit tests, two-client signaling mocks, Next.js builds, Expo iOS JS exports, Prisma migrations and synthetic Postgres writes are necessary, but **none** prove physical iPhone performance or real user feedback.

Before replying to Apple, record actual devices, iOS versions, dates, participant consent, test cases, defects fixed and the exact tested binary. See `docs/MEETOPIA_STAGING_TWO_DEVICE_QA.md`.

**Release status: NO GO** until staging, real users and device validation are complete.
