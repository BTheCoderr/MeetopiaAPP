# Meetopia Mobile — Current Product Parity

The current Meetopia web product on `main` is the canonical product specification for native mobile.

## Product contract

Mobile must participate in the same Meetopia network as web. It is not a separate product and must not revive legacy mobile behavior.

Canonical flow:

1. Account sign-in / creation
2. 18+ confirmation and current onboarding
3. Camera + microphone permission
4. Enter Chemistry Check matching
5. Live WebRTC Chemistry Check using current signaling/auth boundaries
6. In-call chat and current media controls
7. Vibe is private intent
8. A persistent Connection is created only after mutual Vibe
9. Connections support persistent messaging, presence/read state, call-again and incoming calls
10. Blocking/reporting/safety operate at the current account-backed product boundary

## Native implementation rule

Reuse the Expo/EAS, native camera/microphone and `react-native-webrtc` foundation where compatible. Replace legacy product behavior with the current web behavior and APIs.

## Required parity before TestFlight

- current auth/session and onboarding
- Chemistry Check queue/matching
- current signaling authentication
- native WebRTC call lifecycle
- mute/camera/flip/leave/next controls
- in-call chat
- Vibe and mutual-Vibe Connection creation
- Connections inbox/detail
- persistent Connection messaging
- realtime presence, typing/read state and notifications
- call-again plus incoming accept/decline/missed state
- block/report and blocked-user management
- disconnect/reconnect and foreground/background recovery
- native permissions, safe areas and keyboard behavior
- release configuration and physical-device QA

## Source-of-truth rule

When old `apps/mobile` behavior conflicts with the current web implementation under `src/`, the current web implementation wins.
