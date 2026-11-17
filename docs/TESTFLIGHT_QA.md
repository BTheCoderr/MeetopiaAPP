# Meetopia iOS TestFlight release gate (native parity rebuild)

**Build under test:** ______   **Commit:** ______   **Date:** ______
**Tester/account A:** ______   **Device/iOS:** ______
**Tester/account B:** ______   **Device/iOS:** ______

Do not promote to App Review until all critical items below have a verified result. Leave unchecked items unchecked.

## Build workflow: Expo + EAS only

Meetopia is an **Expo Router / EAS Build** application, not a hand-maintained CocoaPods/Xcode build. Do not add manual `pod install`, `xcodebuild`, or native signing commands to GitHub Actions.

The Git repository intentionally contains historical native iOS files, but root `.easignore` excludes `/apps/mobile/ios/` and `/apps/mobile/android/` from EAS Build upload. EAS regenerates native projects through Expo config plugins, including React Native WebRTC. This prevents stale native build numbers and SDK changes from persisting.

Run the following from `apps/mobile/` using the correct connected Expo account:

```sh
npm ci
npm run typecheck
npm run lint
npx expo config --type public
npx expo export --platform ios
npx eas-cli build:inspect --platform ios --stage archive --profile production --output ./eas-archive
# Confirm the EAS archive has app.config.ts/assets and DOES NOT contain ios/.
# Only after release QA:
npx eas-cli build --platform ios --profile production
# After a verified signed build, use EAS submit deliberately:
# npx eas-cli submit --platform ios --profile production --latest
```

`build:inspect` is not an EAS build and should not spend a build slot. The production profile is for TestFlight/App Store; the preview profile uses internal distribution and may need registered iPhone devices. Never auto-submit or upload build 18 while the checklist below is incomplete.

## Automated checks

- [ ] Native TypeScript typecheck passes from locked dependencies
- [ ] Native lint passes
- [ ] Expo iOS JavaScript export passes
- [ ] Root web build and signaling tests pass
- [ ] Dependency audits reviewed and high/critical findings resolved or documented with an approved fix plan
- [ ] EAS archive inspection confirms native ios/ and android/ folders are excluded and all Expo assets/plugins are included
- [ ] EAS cloud iOS production build succeeds from the reviewed commit with build number 18 or higher; no auto-submit
- [ ] Full device validation performed using the resulting TestFlight binary

## Identity and account

- [ ] Sign up on iPhone returns an authenticated native session that survives app restart
- [ ] Sign in with the same account on web and iPhone
- [ ] Invalid credentials fail without entering the product
- [ ] Server-backed 18+ confirmation required for matching
- [ ] Sign out revokes session and disconnects realtime socket
- [ ] Password-confirmed account deletion removes account and associated Connections/messages
- [ ] Existing web account can sign in after mobile account deletion, or receives accurate account-not-found response
- [ ] Native cookie handling does not leak/lose sessions across accounts

## Real Chemistry Check — test with two physical devices

- [ ] No suggested sample profiles or simulated peer acceptance appear in ordinary product flow
- [ ] Camera/microphone prompts show correct descriptions
- [ ] Both independently authenticated adults enter live queue and are paired
- [ ] Realtime socket authenticates and reconnects after temporary network loss
- [ ] Audio/video work both directions over Wi-Fi and over cellular/TURN
- [ ] Mute/camera off/skip/leave work without stale peer connections or unwanted re-pairing
- [ ] 3-minute timer and correct peer states are presented
- [ ] In-call safety report/block remove or prevent unwanted contact
- [ ] Vibe on one side alone does not save a Connection
- [ ] Mutual Vibe saves exactly one persistent Connection for both users
- [ ] Connection remains visible after app restart and on web
- [ ] Message send/receive, read and presence behave correctly
- [ ] Call Again invites the right Connection, with accept/decline/missed states

## UX, compliance, review evidence

- [ ] Test on current supported physical iPhone sizes and accessibility settings
- [ ] Native foreground/background and interrupted-call recovery tested
- [ ] Settings URLs for privacy, support, terms and safety work
- [ ] Report persistence and handling are confirmed (no unimplemented moderation claims)
- [ ] App screenshot set and descriptions reflect the current native build
- [ ] Rejection response answers all 9 questions factually
- [ ] Named beta testers and actual feedback/changes documented
- [ ] Reviewer can test real two-person video without relying on a hardcoded mock
- [ ] Original developer/ownership and shared-framework answers verified

## Sign off

Engineering: ______   Product: ______   Reviewer test account details stored securely: ______

Do not submit if live video, session handling, account deletion, moderation or app originality cannot be demonstrated on the compiled iOS binary.
