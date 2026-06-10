# Native Mobile App — Audit (Track B)

**Scope:** Separate Expo app at `apps/mobile/`. Does **not** modify Next.js web app.

## What can be copied conceptually

| Web source | Mobile reuse |
|------------|--------------|
| [`server/index.js`](../server/index.js) | Same Socket.io events — no server changes |
| [`useVideoChatSocket.ts`](../src/hooks/useVideoChatSocket.ts) | Event handlers, caller rule (`partnerId > socket.id`), ICE queue, dating payloads |
| [`usePeerConnection.ts`](../src/hooks/usePeerConnection.ts) | PC lifecycle, `addTrack`/`replaceTrack`, fallback ICE configs |
| [`useVideoChatMessages.ts`](../src/hooks/useVideoChatMessages.ts) | chat-message, typing, read receipts |
| [`iceServers.ts`](../src/lib/iceServers.ts) | STUN/TURN list (env → `EXPO_PUBLIC_*`) |
| [`videoChat.ts`](../src/types/videoChat.ts) | Types |
| [`VideoStage.tsx`](../src/components/video-chat/VideoStage.tsx) | `hasRemote` gating, stream assignment logic |
| Layout tokens | Same hierarchy in RN `StyleSheet` (not Tailwind) |

## What must be rewritten for React Native

| Web | Native |
|-----|--------|
| `<video>` + `srcObject` | `RTCView` + `streamURL` from `react-native-webrtc` |
| `navigator.mediaDevices.getUserMedia` | `mediaDevices.getUserMedia` (RN WebRTC) |
| `framer-motion` | `Animated` / `react-native-reanimated` (optional) |
| Tailwind classes | `StyleSheet` + safe-area insets |
| `next/navigation` | Expo Router |
| `process.env.NEXT_PUBLIC_*` | `expo-constants` / `EXPO_PUBLIC_*` |
| DOM keyboard shortcuts | Omit or platform-specific |
| `window.confirm` | `Alert.alert` |

## Required packages

- `expo` ~52, `expo-router`, `expo-dev-client`
- `react-native-webrtc` (requires dev build, not Expo Go)
- `socket.io-client`
- `react-native-safe-area-context`
- `@react-native-async-storage/async-storage` (dating profile storage)

## iOS permission strings (`Info.plist` via app.config)

- `NSCameraUsageDescription`
- `NSMicrophoneUsageDescription`

## Android permissions

- `CAMERA`, `RECORD_AUDIO`, `MODIFY_AUDIO_SETTINGS`, `INTERNET`, `ACCESS_NETWORK_STATE`

## EAS setup

- `eas.json`: `development`, `preview`, `production` profiles
- iOS bundle: `com.meetopia.app`
- Android package: `com.meetopia.app`
- Apple Developer account for TestFlight

## Risks — `react-native-webrtc`

- **Not compatible with Expo Go** — must use `expo-dev-client` + EAS build
- Background/foreground transitions may drop tracks
- iOS simulator has limited WebRTC support — test on device
- TURN required for many LTE ↔ Wi‑Fi pairs (same as web)
- App Store review: camera/mic usage strings must be accurate

## Milestones

| # | Deliverable | Status |
|---|-------------|--------|
| 1 | Scaffold + home + local camera + socket | Scaffold in `apps/mobile/` |
| 2 | WebRTC offer/answer, ICE, remote + PIP, next/leave | Hooks stubbed; wire in video screen |
| 3 | Message pill, typing, report, dating payload | Partial in scaffold |
| 4 | EAS dev + production profiles | `eas.json` added |
| 5 | TestFlight after mobile↔web QA | Manual |

## First milestone file list

```
apps/mobile/
  app.config.ts
  eas.json
  package.json
  tsconfig.json
  babel.config.js
  app/_layout.tsx
  app/index.tsx
  app/chat/video.tsx
  src/components/video/VideoStage.tsx
  src/components/video/PictureInPicture.tsx
  src/components/video/MessageBar.tsx
  src/components/video/ControlBar.tsx
  src/hooks/useMobileMedia.ts
  src/hooks/useMobilePeerConnection.ts
  src/hooks/useMobileVideoChatSocket.ts
  src/hooks/useMobileVideoChatMessages.ts
  src/lib/iceServers.ts
  src/lib/socket.ts
  src/types/videoChat.ts
```
