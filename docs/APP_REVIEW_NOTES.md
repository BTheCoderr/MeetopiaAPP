> ⚠️ **HISTORICAL PARITY REVIEW PLAN.** This file describes an earlier rebuilt branch, not the current Vibe Room/Encore draft.
> For an up-to-date audit of the app's custom code, original development process and Guideline 4.2.6 questions, read [APP_REVIEW_426_CODE_PROVENANCE.md](./APP_REVIEW_426_CODE_PROVENANCE.md).
> For accurate staging, two-iPhone testing, and remaining Guideline 4.3 evidence, read [MEETOPIA_STAGING_TWO_DEVICE_QA.md](./MEETOPIA_STAGING_TWO_DEVICE_QA.md).
> Do not imply the current draft is available in TestFlight until a signed build is created and actually tested.

# Meetopia iOS App Review notes — rebuild in progress

**Status: DO NOT RESUBMIT YET.** These instructions describe the proposed native rebuild on branch `meetopia-mobile-current-parity`, not the already rejected build 17. Confirm a newly installed TestFlight build on physical iPhones before copying any claim to App Store Connect.

## What Meetopia actually does

Meetopia is an independent, conversation-first social and dating product for adults 18 or older. Its intended experience is:

1. Create an account or sign in to the same Meetopia network as the web product.
2. Confirm 18+ status on the server.
3. Start a live Chemistry Check with another online adult.
4. Communicate face to face through WebRTC; controls include mute, camera, report, block, skip and leave.
5. Choose Vibe independently; only mutual Vibe can create a lasting server-backed Connection.
6. Return to Connections for persistent messaging and calling again.

This is a dedicated application with custom native React Native screens, a WebRTC media layer, Socket.IO signaling, a session-backed Next.js API, and persisted social state. Standard development frameworks and common infrastructure are not evidence that the app is a commercial template.

## Critical distinction from rejected iOS build

The original mobile submission routed Suggested Matches through five hardcoded profiles and simulated acceptance, even outside an explicitly selected demo. The proposed rebuild removes the hardcoded suggested-match routes, the simulated peer hook, and local-only onboarding from the native product flow. It integrates server-backed accounts and live matching instead.

The current desktop/web product has more functionality than the rejected native build. Do not use website-only functionality as proof that a particular iOS binary supports it.

## Reviewer test credentials and path

Create a dedicated nonproduction reviewer account after the native build is validated. Never place a real user password or production secret in this repository.

Review should include two real devices and two accounts. Make sure the reviewer can complete sign-in, age confirmation, live pairing, Vibe/Connection creation, Connection messages, report/block, sign-out and account deletion. Document how they can reach a second participant; reviewers cannot verify person-to-person video with a simulated peer.

## Evidence required before reply to Apple

- Full iOS build number and exact tested commit
- Physical iPhone model and iOS version for both test devices
- Sign-in/session cookie verified from the native networking layer
- Camera and microphone, live matching, TURN/Wi-Fi/cellular, reconnect and call lifecycle verified
- Mutual Vibe saved to a persistent Connection; post-match messaging verified after restart
- Report/block/privacy/delete account verified end to end against configured backend
- TestFlight tester count, dates, specific feedback and implemented changes (do not invent)
- Clear distinction from unrelated apps in the same Apple developer account
- Details of any code/assets shared across apps, plus ownership and content provider statement
- Updated App Store screenshots matching the actual iOS build

## References

- Native parity work: https://github.com/BTheCoderr/MeetopiaAPP/pull/29
- Native release checklist: `docs/TESTFLIGHT_QA.md`
- Product behavior: `apps/mobile/CURRENT_PRODUCT_PARITY.md`
- Public service: https://meetopia-live.netlify.app

The App Review response must answer all nine of Apple's questions with verified facts. Do not resubmit or represent this branch as a shipped app until release QA is complete.
