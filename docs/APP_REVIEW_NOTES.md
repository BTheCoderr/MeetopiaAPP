# App Review Notes (copy into App Store Connect)

Paste the sections below into **App Review Information** when submitting Meetopia for TestFlight or App Store review.

## Demo account / special instructions

Meetopia is a live video dating app. **No login is required.**

### Option A — Demo Mode (recommended, single device)

1. Open the Meetopia app.
2. Confirm you are **18+** on the age gate (one-time).
3. On the home screen, tap **Try Demo Mode**.
4. Allow **camera** and **microphone** when prompted.
5. Tap the **play (▶)** button to start a simulated Chemistry Check.
6. After ~2 seconds, a **simulated peer profile** (Alex, Demo City) appears.
7. Tap **✨ Vibe** — mutual vibe unlocks after a short delay.
8. Send a text message once chat unlocks.
9. Test **Report (🚩)**, **Block (⛔)**, and **Leave (✕)** from the control bar.

Demo Mode is clearly labeled and does **not** connect to real users or the live matching server.

### Option B — Live two-user test

1. Complete onboarding (profile + intent) on two devices.
2. Tap **Start Chemistry Check** on both devices within ~30 seconds.
3. Allow camera/microphone on both.
4. Test video, Vibe, chat unlock, skip, report, and block.

If live matching is difficult during review, use **Demo Mode** or email **ermias6822@gmail.com** to schedule a live test window.

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
