# Meetopia Native (Expo)

Separate iOS/Android app. Does **not** replace the Next.js web app.

## Prerequisites

- Node 18+
- Expo account + EAS CLI (`npm i -g eas-cli`)
- Apple Developer account (TestFlight)
- Signaling server running (same as web)

## Setup

```bash
cd apps/mobile
cp .env.example .env
npm install
# WebRTC requires @config-plugins/react-native-webrtc (not the raw package as a plugin)
npx expo install @config-plugins/react-native-webrtc react-native-webrtc@124.0.4
eas login
eas init   # sets projectId in app.config.ts extra.eas.projectId
```

Set `EXPO_PUBLIC_SOCKET_URL` to your signaling server (LAN IP for device testing, HTTPS for production).

## Quick test (no EAS cloud build)

**Easiest:** use the web app on your phone — `http://YOUR_LAN_IP:3000/chat/video` with `npm run dev` at repo root. No native build needed.

**Native app (local only):**

```bash
# Terminal 1 — repo root
cd ~/Desktop/MeetopiaAPP && npm run dev

# Terminal 2 — mobile (real iPhone via USB; Simulator has no camera)
cd ~/Desktop/MeetopiaAPP/apps/mobile
npm install
echo "EXPO_PUBLIC_SOCKET_URL=http://192.168.1.152:3003" > .env
npx expo config                    # must exit 0
npx expo run:ios -d                # builds locally, installs on device (Xcode required)
# then optionally:
npx expo start --dev-client
```

Do **not** use Expo Go — this app uses WebRTC and requires a **development build** (`expo-dev-client`). Expo Go on your phone is SDK 54; this project is SDK 52, and Expo Go cannot run WebRTC anyway.

### Expo Go error (SDK 54 vs SDK 52)

If you see *"Project is incompatible with this version of Expo Go"*:

1. Do **not** press `s` to switch to Expo Go.
2. Install a **dev build** once (EAS cloud — no CocoaPods on your Mac):

```bash
cd apps/mobile
eas build --profile development --platform ios
```

3. After install, run `npm start` and open the **Meetopia dev app** on your phone (not Expo Go).

### EAS slug mismatch

If `eas build` says slug does not match `meetopia-app`, ensure `app.config.ts` has `slug: 'meetopia-app'` (matches your EAS project).

### CocoaPods / `expo run:ios`

Local `expo run:ios` needs Xcode + CocoaPods. If pod install fails, skip it and use `eas build` above instead.

Do **not** paste comments or TypeScript into the terminal — run one command per line.

### TypeScript / IDE shows errors but typecheck passes

The web app root `tsconfig.json` **excludes** `apps/mobile`. Mobile uses its own config under `apps/mobile/tsconfig.json`.

If the Problems panel still shows old JSX/WebRTC errors (e.g. 72 stale errors):

1. Run the real check: `cd apps/mobile && npm run typecheck`
2. In VS Code: **Cmd+Shift+P** → **TypeScript: Restart TS Server**
3. Ensure workspace TypeScript is **5.4+** (repo root `node_modules/typescript`)

### If `expo start` says missing `expo-asset`

```bash
npx expo install expo-asset expo-font
```

### If `eas build` says `Invalid UUID appId`

`app.config.ts` still has `REPLACE_WITH_EAS_PROJECT_ID`. Either skip EAS and use `expo run:ios -d`, or run:

```bash
eas init
```

(answer prompts only — no `#` comments on the same line)

## EAS / TestFlight (later)

```bash
eas build --profile development --platform ios
# or
npx expo run:ios
```

```bash
npx expo start --dev-client
```

## Milestones

1. Home + local camera + socket — **scaffold**
2. WebRTC match + PIP + next/leave — hooks in `src/hooks/`
3. Messages + dating payload
4. TestFlight via `eas build --profile production --platform ios`

See [../../docs/MOBILE_APP_AUDIT.md](../../docs/MOBILE_APP_AUDIT.md).
