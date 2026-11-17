# Meetopia: staging + two-person iPhone release gate

**All items below are UNVERIFIED until executed on real devices.** This document
is a test protocol, not a TestFlight report or evidence of beta participation.

**Do not deploy to production, change production database schema, merge draft PRs,
spend an EAS cloud build or reply to Apple just because CI is green.**

## Release sequence

1. Review the three draft PRs in order:
   - #32: Chemistry Passport, compatible introduction and two-sided consent
   - #33: synchronized Vibe Rounds, Encore and Spark Cards
   - Release gates PR: protocol-capability handshake and disposable database tests
2. Prepare a **separate staging deployment** of Next.js API and signaling.
   Use a separate PostgreSQL database and project credentials. Keep actual
   secrets out of Git and screenshots.
3. Staging database administrator reviews and applies both additive migrations
   through the normal Prisma process, in order:
   - `20261117000100_chemistry_passport`
   - `20261117000200_encore_spark_card`
   Preserve existing legacy migrations and account data. Verify rollback plan.
4. Deploy matching API/web and signaling commits to staging. The signaling
   protocol is **v2**. Old mobile/web matchmaking clients fail closed with
   `CLIENT_UPDATE_REQUIRED`; existing Connection calls remain separately
   authorized. A current client confirms `vibe-room-hello` with the server
   before emitting `find-user` or `find-next-user`.
5. Point a **development/preview EAS profile** to staging using the intended
   build environment. Confirm iOS bundle ID, permissions, WebRTC plugin, STUN/TURN
   credentials and EAS project ownership. Never commit TURN credentials.
6. From `apps/mobile` and the expected Expo account, inspect the EAS archive:
   `npx eas-cli build:inspect --platform ios --stage archive --profile production --output ./eas-archive`
   Confirm it contains the source, assets, config, lockfile and plugins and
   excludes historical `ios/`, `android/`, `.env` and `node_modules`.
   **This is inspection only, not a cloud build.** Ask the founder before any
   build or submission.
7. Once authorized, create a distinct EAS iOS beta build. Two physical iPhones
   are required for the live WebRTC/ICE and reconnection tests below.

## Real-user test matrix (mark each with date, device, build ID, PASS/FAIL)

| ID | Tester action | Expected result | Result |
| --- | --- | --- | --- |
| A1 | First adult signs up and confirms age, then relaunches app | Valid session persists; no false identity-verification claim | UNTESTED |
| A2 | New adult creates/edit Passport from Settings | Intention, style and 2–5 interests persist; bad input rejected | UNTESTED |
| A3 | Two compatible adult test accounts search from separate phones | Both see exactly one shared-introduction offer, not live partner video | UNTESTED |
| A4 | One person accepts; other does nothing | No remote video/SDP/ICE/call starts; 30-second expiry cancels | UNTESTED |
| A5 | One person declines, skips or blocks | Both are notified; old invitation is invalid | UNTESTED |
| A6 | Both accept same introduction | Only then authorized WebRTC starts; no unrelated peer receives signals | UNTESTED |
| A7 | Start on old/bad signaling version | App errors safely; no legacy random pairing | UNTESTED |
| A8 | Two incompatible intentions or no shared interests | No introduction; no fabricated compatibility score | UNTESTED |
| R1 | Both complete The Spark | Neither advances without both ready | UNTESTED |
| R2 | One chooses Curveball answer | Other receives no private answer, even through network event | UNTESTED |
| R3 | Both choose Curveball answers | Both receive correctly labeled synchronized reveal | UNTESTED |
| R4 | Both finish Real Talk | Vibe becomes available on both devices; premature Vibe rejected server-side | UNTESTED |
| V1 | Only one participant chooses Vibe | No saved Connection | UNTESTED |
| V2 | Both choose Vibe | One persisted Connection, usable after app restart | UNTESTED |
| E1 | One member shares Encore | Other cannot see the private choice or Spark Card | UNTESTED |
| E2 | Both explicitly share Encore | Spark Card shows both ideas, including same/different ideas | UNTESTED |
| E3 | Either withdraws Encore or blocks | Spark Card hidden on refresh; blocked user cannot fetch or update | UNTESTED |
| E4 | Connection deleted | Encore record and Spark Card cascade-delete | UNTESTED |
| C1 | Existing saved Connection calls another | Ring, accept, decline, expiry, missed call work | UNTESTED |
| C2 | After leaving, returning to app can receive direct calls | Presence listener and authenticated socket work | UNTESTED |
| C3 | Chat and read receipt survive restart | Server-persisted messaging is correct, no duplicate sends | UNTESTED |
| N1 | iPhone A on Wi-Fi, B on cellular, then reverse | Audio/video bidirectional through properly configured TURN | UNTESTED |
| N2 | Background, incoming phone call, denied permissions, reconnection | Safe transition with obvious retry and no stale remote video | UNTESTED |
| S1 | Report and block during an active call | Call terminates, report persists, no rematch to blocked person | UNTESTED |
| S2 | Request account deletion | Session revoked, account and eligible personal data removed | UNTESTED |
| S3 | Sign out or expire session then retry protected APIs | No unauthorized messaging, matching, or private Encore access | UNTESTED |
| UI1 | Test iPhone sizes and accessibility settings | Consent, round controls and safety buttons are reachable | UNTESTED |

## Evidence template — DO NOT FILL WITH INVENTED RESULTS

- Date and time tested:
- Build number / EAS build URL:
- Staging environment and signaling protocol version:
- Tester count and how each tester was recruited:
- iPhone models, iOS versions, Wi-Fi/cellular conditions:
- Each case passed/failed with short notes:
- Most significant tester feedback in tester's own words (with permission):
- Issue links, fix commits, retest date:
- Screenshots or screen recording consent:
- Moderation and incident escalation reviewed by:
- Whether this evidence covers the **actual submitted binary**:

## Apple Guideline 4.3 / 4.2.6 evidence requirements

Do not claim Apple approval or real beta-user feedback from automated CI.
Prepare a nine-question response only after real beta testing and verifying
Meetopia's authorship, the other apps on the Apple account, shared code/assets,
third-party templates (if any), the user benefit and distinctive three-round
experience. Under Guideline 1.2, confirm safety/moderation procedures and
restricted access to structured adult interactions. Self-attested age is **not
identity verification**.

## Current blockers

- A signed EAS iPhone beta and two physical iPhones have not been verified.
- Public signaling/web/mobile have not been changed to the v2 protocol.
- STUN/TURN availability and cellular routes are not yet verified.
- Existing connected socket credentials can become stale when another device
  blocks a user; verify block propagation before release.
- No real beta-user feedback or moderation-operation test record exists here.

**Release status: NO GO for production or App Store resubmission until gates pass.**
