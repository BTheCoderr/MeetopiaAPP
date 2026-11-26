# Meetopia Vibe Room — Milestone 2: Rounds, Encore and Spark Card

**Status: source implementation on a draft feature branch only.**
**Do not deploy, run production database migrations, build EAS, resubmit to Apple or merge into main.**

## Experience implemented

1. Two adults complete Chemistry Passports and accept the same server-mediated introduction (Milestone 1).
2. The server opens an ephemeral, authenticated 3-round session attached to their authorized active socket pair.
3. **THE SPARK** uses a curated, shared-interest conversation opener. Both participants must explicitly mark the round complete.
4. **THE CURVEBALL** shows the same curated, two-choice scenario to both members. Each voluntarily chooses a response privately. The other person's answer stays confidential until **both** have responded, when the two options are revealed. Neither private answer is persisted.
5. **THE REAL TALK** provides one thoughtful, open-ended discussion prompt. Both must mark completion.
6. Only after both complete the round sequence can either privately choose **Vibe**. The existing server-signed mutual-Vibe proof is then used for the persistent Connection. Direct video calls between existing Connections remain a separate authenticated flow.
7. In an existing Connection, each user may select and **explicitly share** an **Encore** follow-up idea.
8. An **Our Spark Card** shows both follow-up ideas only when both have opted in. Until then, the API shows each participant only their own selection; it never exposes the other member's private choice.
9. Either person can withdraw their Encore selection, immediately revoking the shared card on subsequent API reads.

## Security and data retention

- The server owns the session ID, round sequence, ready-to-advance state, Curveball answers and Vibe eligibility. Clients cannot skip rounds by sending a forged session ID.
- Only valid authenticated, reciprocally paired sockets can advance a round or reveal choices.
- No audio, video, transcripts, Curveball answers, or inferred compatibility scores are written to the database or logs. In-memory round state is discarded on disconnect, skip, block or leave.
- Encore API checks the current session, saved Connection membership and blocking state on **every** GET/PUT/DELETE. Validation accepts only a small fixed choice vocabulary.
- Encore storage is per-Connection, cascades on Connection deletion, and only releases a joint Spark Card with both affirmative share flags.
- The mobile/web Spark Card may take up to 15 seconds or a manual refresh to reflect another participant's choice or withdrawal; API checks determine current visibility.
- This feature is a structured conversation flow, not an identity verification or substitute for proactive moderation.

## Implementation

- Signaling: `server/vibeRoomSessions.js`, `server/index.js`
- Mobile: `apps/mobile/src/components/video/VibeRounds.tsx`, `apps/mobile/src/hooks/useCurrentMeetopiaSignaling.ts`, `apps/mobile/src/components/connections/EncoreCard.tsx`
- Web: `src/components/video-chat/VibeRounds.tsx`, `src/hooks/useVideoChatSocket.ts`, `src/components/connections/EncoreCard.tsx`
- Persistence: `prisma/schema.prisma`, `prisma/migrations/20261117000200_encore_spark_card/migration.sql`
- Authenticated API: `src/app/api/connections/[connectionId]/encore/route.ts`
- Tests: `server/vibeRoomSessions.test.cjs`, `scripts/signaling-access.test.cjs`, `scripts/encore-privacy.test.cjs`
- CI: `.github/workflows/vibe-room-m2-check.yml`

## Release gates and staging test scenarios

1. **Before any staging deployment**, review and apply BOTH additive migrations in sequence: `20261117000100_chemistry_passport` then `20261117000200_encore_spark_card`. Verify generated Prisma client matches the deployed database. Do not apply production migrations automatically.
2. Introduce an explicit **client/protocol version gate** and coordinated staging rollout for web, iPhone, APIs and signaling. Existing public web/native clients do not understand Passport invitations or the Vibe Room progression; updating signaling alone would break their matching.
3. Two real authenticated adults with compatible Passports: each accepts one introduction, receives the same 3-round session, and can see the partner's reveal only after both choose. Failed, blocked, expired, mismatched and forged sessions must never create a media pair or saved Connection.
4. Verify real WebRTC/ICE/TURN between two physical iPhones on cellular and Wi-Fi, session cookies after restart, camera/mic consent, skip, block, report, background interruption and reconnect. The current app may open a **local** camera preview before approval, but must never transmit media to a peer until both accept.
5. Verify no persisted Connection when Vibe is unilateral, and exactly one after mutual Vibe. Test both web-to-mobile and mobile-to-mobile.
6. In a saved Connection, test one-sided Encore with no leak, both opt in, same/different follow-up ideas, withdrawal, blocked account access, and deletion of the Connection.
7. Document moderation operations, explicit-content/user-report handling, reviewer access, accurate App Store screenshots, real TestFlight feedback and all nine Apple review responses.
8. Complete Expo/EAS archive inspection before approving a new build. No EAS build was triggered by this milestone.

## Unverified or intentionally out of scope

- Physical-device video, Bluetooth, TURN, background push notifications, Apple App Review acceptance, production database migrations and customer traction are not verified.
- Screens are functional source code, but not yet accessibility/device-tested. UI iterations may be required based on actual testers.
- The 3-round session currently lives in signaling memory; a signaling process restart ends the session. Multi-instance signaling requires shared authoritative session storage before scaling.
- Content moderation, identity verification, recommendations based on protected traits and saving any private Curveball answers are not implemented.
- Apple's guidelines may still require additional differentiation or safety improvements even with this feature.
