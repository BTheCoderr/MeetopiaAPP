# Meetopia Native Mobile — Status Audit

Last updated: Phase 1 audit before native hardening pass.

## 1. What already exists and works (in code)

| Area | Status |
|------|--------|
| Expo SDK 52 + expo-dev-client + react-native-webrtc config plugin | Scaffolded |
| Home screen (Meetopia branding, Suggested Matches / Demo Mode) | Done |
| Video screen composition (VideoStage, PIP, MessageBar, ControlBar) | Done |
| `useMobileMedia` — getUserMedia camera/mic | Done |
| `useMobilePeerConnection` — RTCPeerConnection + addTrack | Done |
| `useMobileVideoChatSocket` — find-user, offer/answer, ICE queue/drain | Done |
| `useMobileVideoChatMessages` — chat-message, typing | Done |
| Layout tokens mirroring web (`mobileLayout.ts`) | Done |
| iOS permission strings in `app.config.ts` | Done |
| `apps/mobile npm run typecheck` | Passes |
| Root web build (mobile excluded from root tsconfig) | Passes |

## 2. What is incomplete

- `socket.ts` uses **websocket-only** transport (should match web: polling → websocket).
- No socket debug logs (URL, connect_error, transport name).
- `stream-state-change` not emitted on mute/camera toggle (web does).
- `stream-state-change` remote handling not wired on mobile.
- `mark-messages-read` / `message-read` not implemented on mobile.
- Report/help UI missing on mobile video screen.
- `peer-left` / `leave-chat` do not restart RTCPeerConnection (stale PC risk on next match).
- Dating profile only from AsyncStorage — no on-device fallback for testing.
- EAS `projectId` / Apple IDs are placeholders.

## 3. Camera preview gaps

- **Implemented:** `useMobileMedia`, `RTCView` full-screen before match, camera-off opacity.
- **Needs device QA:** permission prompt, front camera mirror, no crash on real iPhone.
- **Simulator:** no camera — use physical device.

## 4. Socket.io gaps

- Client exists but transport + logging need Render/Netlify parity fixes.
- Production URL via `EXPO_PUBLIC_SOCKET_URL` (see `.env.example`).

## 5. WebRTC gaps

- Core offer/answer/ICE flow implemented.
- Needs device QA: mobile ↔ web match, TURN on cellular if STUN fails.
- Answer dedup (stable + remoteDescription) should match web guard.

## 6. Mobile ↔ web matching gaps

- Caller rule (`partnerId <= socket.id`) matches web.
- Untested on physical device in this pass.
- `restartConnection` on next/leave/peer-left must be verified.

## 7. In-call messaging gaps

- Send/receive + typing work in code.
- Read receipts optional / not wired.

## 8. EAS / TestFlight gaps

- `REPLACE_WITH_EAS_PROJECT_ID` in `app.config.ts`
- `eas.json` Apple ID placeholders
- No app icon / splash assets committed
- No privacy policy URL in mobile config
- Phases 9–10 blocked until local `expo run:ios -d` QA passes

## Verification commands

```bash
# Root web (must stay green)
cd ~/Desktop/MeetopiaAPP && npx tsc --noEmit && npm run build

# Mobile
cd apps/mobile && npm run typecheck

# Local native (physical iPhone)
cd apps/mobile
cp .env.example .env   # set EXPO_PUBLIC_SOCKET_URL=https://meetopiaapp.onrender.com
npx expo run:ios -d
```
