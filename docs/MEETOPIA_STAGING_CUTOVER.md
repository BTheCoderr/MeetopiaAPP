# Meetopia staging cutover: Co-Create M3 + four-component release track

**Status:** staging preflight ONLY. A real hosted staging stack has not been created or deployed.
Updated: 2026-11-18. **Do not touch Meetopia production.**

## Discovered production infrastructure (read-only account inspection)

- Web/API: Netlify site `meetopia-live`, URL `https://meetopia-live.netlify.app`
- Signaling: Render web service `meetopia-signaling-v2`, URL `https://meetopia-signaling-v2.onrender.com`. Its Git branch is `feature/meetopia-revival` with auto-deploy; do not change this service.
- Database: active Supabase **Meetopia** project `irdacfchqzbbfvwclinh`; no development branches currently exist. Older inactive similarly named Meetopia projects exist under other organizations; do not reuse them.
- Expo app: owner `bferrell514`, original bundle `com.meetopia.app`, EAS project `37e69074-d079-4c60-a3c4-5d468645bcf1`.
- Unmerged source: branch `meetopia-co-create-m3`, draft PR #36, followed by `meetopia-staging-preflight`. No production deploy should track either branch.

## Isolation choice and cost approval

Supabase quoted **$0/month** for a new project in the same organization as current Meetopia (`gxiwiewcnavhdjxnwvld`), and **$0.01344/hour** for a preview branch. These are the provider's quoted base prices, not an estimate of any overage or separate hosting cost.

**Do not create either resource until the owner confirms the target organization and any applicable charges.** Prefer a new staging project in the existing Meetopia organization at the quoted $0/month if user authorizes; do not choose a paid preview branch by default. Never clone actual customers' or production user data into staging.

## Planned hosted staging architecture (proposed names, not created resources)

1. `Meetopia-Staging` Supabase project, US East 2, fresh data and distinct project ref. No production records.
2. `meetopia-staging` Netlify site pointing to the exact reviewed staging branch. Separate site-level env vars and its own HTTPS site domain; **never use the existing meetopia-live project's branch deploy with production DB secrets**.
3. `meetopia-co-create-staging-signaling` Render **free** Node service using the same Git commit/branch as the Netlify staging web; auto-deploy disabled until paired release testing is ready.
4. `Meetopia Staging` iPhone app on EAS staging profile: app ID `com.meetopia.app.staging`, distinct app name and URL scheme, internal distribution only. EAS cloud builds require separate founder approval and provisioning.

## Staging-only environment contract

Use new, distinct credentials. Store secrets only in the provider's secret/environment UI. **Never commit, print or send secret values in chat.** Set on staging *only*.

| Site | Required config | Special rule |
| --- | --- | --- |
| Netlify staging web/API | `MEETOPIA_DEPLOY_ENV=staging`, `MEETOPIA_STAGING_DB_REF`, `MEETOPIA_STAGING_WEB_URL`, `NEXT_PUBLIC_SOCKET_URL`, `MEETOPIA_DATABASE_URL`, `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `SOCKET_AUTH_SECRET` | All configured Postgres URLs must match the staging Supabase project ref; socket URL must be HTTPS and cannot be production |
| Render staging signaling | `MEETOPIA_DEPLOY_ENV=staging`, `MEETOPIA_STAGING_DB_REF`, `WEB_APP_URL`, `CORS_ORIGINS`, `SOCKET_AUTH_SECRET` | Web origin must be the separate staging Netlify origin; same freshly generated 32+ character secret as web, **not live secret** |
| Optional Render reports DB | `SUPABASE_URL` and appropriate isolated credentials | Must reference staging Supabase only. Outbound report email notifications are disabled in staging |
| EAS staging | `MEETOPIA_DEPLOY_ENV=staging`, `EXPO_PUBLIC_STAGING=true`, `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_SOCKET_URL` | Builds fail instead of falling back to live Netlify/Render, and use separate iOS/Android bundle identifiers |

The Nesting of app and domain names above is illustrative. Use the actual returned service URLs when creating resources, not guessed URLs. `NEXT_PUBLIC_*` and `EXPO_PUBLIC_*` values are embedded in web/browser/mobile binaries and must never contain database passwords, socket signing keys or long-lived TURN secrets.

Staging web and signaling are a **matched versioned pair**. Source protocol is v3. Signaling refuses legacy matching clients. The separate stage signing secret is used by both server and web API, but not production.

## Stage deployment order (no production migrations)

1. Confirm/create staging Supabase project; verify status `ACTIVE_HEALTHY`, capture staging database ref without sensitive credentials.
2. Verify pristine stage connection, schema and migration baseline. On **staging only**, apply full checked-in Prisma migration history with `npx prisma migrate deploy`. Confirm `prisma migrate status`, check both schema and RLS/database API exposure.
3. Create dedicated staging Netlify project, connect branch and set **stage** credentials. Use build logs to verify `MEETOPIA_DEPLOY_ENV=staging` gates.
4. Create Render free service with auto-deploy off using the exact staging branch, configure `WEB_APP_URL`, `CORS_ORIGINS`, stage signing key, optional stage reports credentials. Startup rejects the live origin. Trigger a first deploy only after env vars are configured.
5. Align staging Netlify `NEXT_PUBLIC_SOCKET_URL` with the **actual** Render staging HTTPS URL and redeploy it if necessary. Check health/status, token API auth, CORS, protocol v3 and a real two-person web session.
6. Configure EAS staging environment with actual stage endpoints; inspect archive (`eas build:inspect`) and verify distinct `com.meetopia.app.staging` bundle before **asking to authorize** cloud build.
7. If authorized, distribute staged beta to two physical iPhones and run `docs/MEETOPIA_STAGING_TWO_DEVICE_QA.md` including TURN/cellular, media, interruptions, Report/Block, and signed creation lifecycle. Then gather genuine TestFlight feedback.
8. Only after real iPhone QA and beta evidence pass, draft Apple's nine answers. No claim that 4.3/4.2.6 are resolved until evidenced.

## No-cost ephemeral full-stack staging check already implemented

`.github/workflows/meetopia-staging-smoke.yml` is a disposable GitHub Actions test environment:
- creates PostgreSQL 16 and installs **all historical migrations**
- runs the real Next.js API and Node Socket.IO signaling locally
- creates two synthetic authenticated adult accounts only in that temporary DB
- negotiates protocol v3, checks same-theme offer and two-sided acceptance
- executes Spark, private Curveball reveal, Real Talk and dual-approved Bridge
- saves mutual Vibe + signed co-created Connection and tests user-visible shared card removal
- deletes test data in child-first order, avoiding historical NO ACTION foreign keys
- verifies Expo SDK 58 iOS JS export and that staging config uses separate bundle ID and fails on missing stage URLs

These are **not** physical-device tests or a publicly accessible staging site. The CI runner is automatically torn down; no live data or paid external provisioning is involved.

## Next safety gates still pending

- Cross-device blocks during already-active calls; TURN across cellular networks; staging report moderation operations.
- Physical iPhone microphone/camera/video/permissions, reconnect and account deletion.
- Staging database/schema/security inspection, asset originality and account ownership verification.
- Actual testers and documented feedback for Apple Guidelines 4.3, 4.2.6 and 1.2.

**Current status: hosted staging NOT deployed; ephemeral integration verification in progress.** Check the latest GitHub Actions run before describing it as passed.
