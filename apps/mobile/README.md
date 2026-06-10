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
npx expo install expo-dev-client react-native-safe-area-context
```

Set `EXPO_PUBLIC_SOCKET_URL` to your signaling server (LAN IP for device testing, HTTPS for production).

## Development build (required — not Expo Go)

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
