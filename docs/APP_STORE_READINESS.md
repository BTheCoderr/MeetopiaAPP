# Meetopia — App Store Readiness

Meetopia is a **video-first dating and meeting app** for real chemistry (not anonymous random chat). This document tracks what is required before TestFlight and App Store submission.

## App identity

| Field | Value |
|-------|-------|
| App name | Meetopia |
| Slug | `meetopia` |
| iOS bundle ID | `com.baheemferrell.meetopia` |
| Android package | `com.baheemferrell.meetopia` |
| Version | 1.0.0 (build 1) |
| EAS project ID | Replace `REPLACE_WITH_EAS_PROJECT_ID` in `apps/mobile/app.config.ts` after `eas init` |

## Data collected (MVP)

| Data | Purpose | Stored where (MVP) |
|------|---------|-------------------|
| First name, age, city, gender, intent, prompt | Matching and profile card during Chemistry Check | Device (AsyncStorage); backend persistence Phase 2 |
| Camera / microphone streams | Live video Chemistry Check | Ephemeral WebRTC; not recorded by Meetopia |
| Socket ID | Signaling and matching | Render signaling server (session) |
| Reports (category + reported user ID) | Safety moderation | Supabase `mobile_reports` + Resend email (+ JSONL fallback) |
| Block list | Prevent re-match on device | AsyncStorage (profile fingerprint + socket ID) |
| 18+ confirmation flag | Age gate compliance | Device (AsyncStorage) |
| Vibe / mutual match state | Unlock chat after mutual Vibe | Device (AsyncStorage) |

We do **not** claim AI moderation, auto-blur, or human review SLA in the live app until those systems are implemented.

## Permissions

| Permission | Why |
|------------|-----|
| **Camera** | Required for live video Chemistry Checks with other members. |
| **Microphone** | Required for voice during video dates and meetings. |

Copy is configured in `apps/mobile/app.config.ts` and the `@config-plugins/react-native-webrtc` plugin.

## Safety surfaces (in app)

- **Report** — categories: nudity/sexual content, harassment, hate/threats, spam/scam, underage user, other.
- **Block** — leaves chat immediately; blocked socket IDs skipped for the session; stored locally.
- **Leave** — confirmation before exiting Chemistry Check.
- **Account deletion** — Settings → **Delete local profile & data** (device-only MVP).

See also: [SAFETY_MODERATION_PLAN.md](./SAFETY_MODERATION_PLAN.md), [COMMUNITY_GUIDELINES.md](./COMMUNITY_GUIDELINES.md).

## Account deletion process

1. User opens **Settings & safety**.
2. Taps **Delete account** (placeholder).
3. MVP: clears local onboarding, profile, blocks, and vibe matches via AsyncStorage.
4. Phase 2: call backend/Supabase to delete account and associated data; document retention in Privacy Policy.

## Required App Store metadata checklist

- [ ] App name: Meetopia
- [ ] Subtitle (see [APP_STORE_METADATA.md](./APP_STORE_METADATA.md))
- [ ] Description and keywords
- [ ] Primary category recommendation (Lifestyle)
- [ ] Age rating questionnaire (expect 17+; final rating from Apple)
- [ ] Privacy Policy URL (placeholder until hosted)
- [ ] Terms of Service URL (placeholder)
- [ ] Community Guidelines URL (placeholder)
- [ ] Support URL / contact email (placeholder)
- [ ] App icon 1024×1024 (`apps/mobile/assets/icon.png`)
- [ ] Screenshots (6.7", 6.5", iPad if supporting tablet)
- [ ] Export compliance / encryption questionnaire
- [ ] App Privacy nutrition labels aligned with [PRIVACY_DISCLOSURES.md](./PRIVACY_DISCLOSURES.md)

## EAS build profiles

Configured in `apps/mobile/eas.json`:

| Profile | Use |
|---------|-----|
| `development` | Dev client, internal distribution |
| `preview` | Internal TestFlight-style builds |
| `production` | App Store / TestFlight production track |

### Commands

```bash
cd apps/mobile
npm install
npm run typecheck
npx expo run:ios -d          # local device/simulator
eas login
eas init                     # creates project; update app.config.ts projectId
eas build:configure
eas build --profile development --platform ios
eas build --profile production --platform ios
eas submit --platform ios    # after TestFlight QA passes
```

**Do not submit to full App Store until [TESTFLIGHT_QA.md](./TESTFLIGHT_QA.md) passes.**

## Known limitations (MVP)

- Profile and matches stored **locally only** until backend persistence ships.
- No in-app payments or subscriptions.
- No push notifications for matches yet.
- Report review is **logged server-side**; dedicated moderation dashboard is Phase 2.
- No AI content moderation or auto-blur in production.
- App icon/splash PNGs must be added under `apps/mobile/assets/` before store submission (see `assets/README.md`).
- Web app at https://meetopia-live.netlify.app is unchanged; mobile uses native Expo + WebRTC (no WebView).

## Verification before submit

From repo root:

```bash
npx tsc --noEmit
npm run build
cd apps/mobile && npm run typecheck
```

## Related docs

- [TESTFLIGHT_QA.md](./TESTFLIGHT_QA.md)
- [PRIVACY_DISCLOSURES.md](./PRIVACY_DISCLOSURES.md)
- [APP_STORE_METADATA.md](./APP_STORE_METADATA.md)
- [COMMUNITY_GUIDELINES.md](./COMMUNITY_GUIDELINES.md)
- [SAFETY_MODERATION_PLAN.md](./SAFETY_MODERATION_PLAN.md)
