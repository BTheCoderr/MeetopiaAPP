# Meetopia Vibe Room — Milestone 1: Chemistry Passport + Consent Introductions

Status: **review branch only; no migration, deployment, EAS build or Apple submission authorized.**

## Actual implementation

- Account-backed Chemistry Passport: conversation intention, style, and 2–5 interests
- Dedicated server-side API with session-cookie authentication and bounded validation
- Separate Prisma columns from the existing public profile interests, with an additive SQL migration
- Signed Socket.IO token carries validated Passport values; clients cannot impersonate other preferences in an introduction event
- Server ranks *compatible* adult members by shared interests, honors mutually compatible stated intentions, and excludes blocked/recently matched pairs
- One private, expiring introduction is offered to both members before any authorized WebRTC pairing
- The server allows peer media/ICE/chat relaying only after both participants accept **the same** invitation
- Decline, cancellation, disconnect and 30-second expiry do not create a media pair
- Existing direct calls for a verified Connection continue through their separate authorization flow
- Mobile and web Passport screens and mutually approved introduction overlays share one API and protocol
- No fictitious accounts, scores, profile images, conversations, or videos are generated

## Feature stages that are **NOT** part of Milestone 1

- The Spark / The Curveball / The Real Talk synchronized interactive rounds
- The Encore collaborative follow-up choices and persistent Spark Cards
- Real-device video/cellular TURN, media readiness before accepting (the local camera currently prepares as video screen mounts), native background recovery and external beta tests
- Moderation staff procedures and comprehensive UGC filtering
- Live blocklist freshness while sockets remain connected (signed blocklist is captured when token issued; auth session and block changes should trigger socket refresh)

Do not advertise or describe these as implemented.

## Critical migration / rollout dependencies

1. The additive migration `prisma/migrations/20261117000100_chemistry_passport/migration.sql` must be reviewed and applied to the correct staging database **before** enabling the new API. Do not run migrations on production as part of the PR.
2. API, web, iOS and signaling changes must be coordinated. The existing production signaling server immediately pairs waiting sockets; the new web/mobile clients expect an introduction event and will not prevent old-server pairing. Conversely, new signaling will not match legacy web/iOS clients that lack Passport support.
3. Deploy to a controlled staging environment and test two signed-in adults with different and compatible preferences, one-sided acceptance, both acceptance, decline, expiry, block, skip, and direct Connection calls. Observe rollback readiness.
4. Plan a deployment feature flag/protocol version handshake before exposing old and new clients to the same live service. **Do not flip production yet.**
5. TURN infrastructure, secure cookie persistence on physical iPhones, reviewer/tester access and UGC compliance require proof before App Review.

## Automated validation

The dedicated branch workflow `.github/workflows/vibe-room-m1-check.yml` runs the live-state policy unit tests, signaling integration/revocation regression tests, Next.js/Prisma build, and Expo mobile TypeScript, lint, iOS JS export and EAS configuration gate. Green JavaScript checks do not prove physical iPhone/video behavior.

## Suggested next product milestone

Build the synchronized 3-round Vibe Room interaction, with age-appropriate curated prompt decks, both-sided private answer and reveal consent, explicit safety controls, and no storage of private answers. Then add mutually chosen follow-up plans (Encore) and optional consented Spark Card state on an existing Connection. All persistence must be backed by server-authoritative state.
