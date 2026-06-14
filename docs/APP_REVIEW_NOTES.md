# App Review Notes (copy into App Store Connect)

Paste the sections below into **App Review Information** when submitting Meetopia for TestFlight or App Store review.

## Demo account / special instructions

Meetopia is a **profile-based, video-first dating app**. It is **not** anonymous or random matching. Users create a local profile, choose a dating intent, browse **suggested profiles**, and request a **Chemistry Check** with a specific person. Live video starts **only after** a profile-based match accepts the request. No sign-in is required for this beta.

### Primary flow

Age Gate (18+) → Create Profile → Choose Intent → **Suggested Matches** → Profile Card → **Request Chemistry Check** → Match accepts → Video (Chemistry Check) → mutual **Vibe** → Chat unlocks.

### Reviewer test path (single device — recommended)

1. Open the app and confirm the **18+** age gate.
2. Create a basic local profile and choose a dating/meeting intent.
3. On the home screen, tap **View Suggested Matches** (or **Try Demo Mode**).
4. Open any suggested profile to see name, age, city, intent, prompt, and interests.
5. Tap **Request Chemistry Check**. The screen shows "Waiting for [Name] to accept…", then the match accepts (simulated for review).
6. Allow **camera** and **microphone** when prompted.
7. You enter the **Chemistry Check** video screen titled "You're meeting [Name]".
8. Tap **✨ Vibe** — mutual Vibe unlocks chat after a short delay. Send a message.
9. Test **Report (🚩)**, **Block (⛔)**, **Skip (⏭)**, and **Leave (✕)** from the control bar.
10. Open **Settings** for privacy, terms, support, community guidelines, safety, website home, and delete-local-profile options.

**Why simulated acceptance:** in this beta, Suggested Matches uses local demo profiles so a single reviewer can experience the entire profile → request → accept → video flow without needing two live users. Requesting a Chemistry Check never opens random/anonymous video — it always meets the specific profile you selected.

### Known beta limits

- Suggested matches and the accept step use **local demo data** for review.
- Profiles, blocks, and matches are stored **locally on the device**.
- Reports are stored in Supabase for review by the Meetopia team.
- No payments, push notifications, AI moderation, automatic blur, or subscription features in this build.

### Optional — live two-user test

If you want to schedule a live video test between two real devices, email **ermias6822@gmail.com** and we will arrange a test window.

## Signaling backend

Production signaling: `https://meetopiaapp.onrender.com`  
(Cold start may take ~30 seconds on first connection.)

## Hardware

- Physical iPhone with front camera and microphone required for video features.
- Simulator can open Demo Mode but camera preview may be limited.

## Safety features (MVP — no AI moderation)

- 18+ age gate
- Community Guidelines, Privacy Policy, Terms, Support, and Safety pages (web URLs in Settings)
- In-app Report with categories
- Block (persists on device by profile fingerprint)
- Delete local profile & data in Settings

## Public website URLs (App Store Connect + Settings)

| Field | URL |
|-------|-----|
| Marketing / Home | https://meetopia-live.netlify.app |
| Support | https://meetopia-live.netlify.app/support |
| Privacy Policy | https://meetopia-live.netlify.app/privacy |
| Terms | https://meetopia-live.netlify.app/terms |
| Community Guidelines | https://meetopia-live.netlify.app/community-guidelines |
| Safety & Reporting | https://meetopia-live.netlify.app/safety |

Mobile Settings imports these from `apps/mobile/src/config/links.ts`.

## Contact for review support

ermias6822@gmail.com

## Notes

- No payments or subscriptions in this build.
- No push notifications in this build.
- Profile data is stored locally on device (no server account yet).
- Reports are stored in Supabase for review (no email alerts in this build).
