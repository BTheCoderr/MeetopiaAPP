# Meetopia Native (Expo)

Separate iOS and Android app. It does not replace the Next.js web app.

Release builds use Expo and EAS only. This project is Expo SDK 58 with Continuous Native Generation. Do not install CocoaPods, open the historical Xcode project, or run `expo run:ios` / `expo run:android` to produce a TestFlight or Play build. Expo Go cannot run this app: it depends on `react-native-webrtc` and `expo-dev-client`.

## Stack

- Expo SDK 58 (`expo ~58.0.25`), Expo Router `~58.0.31`
- React Native 0.88.1 and React 19.3.0
- `react-native-webrtc` 124.0.7 with `@config-plugins/react-native-webrtc`
- Node `^22.13.0`, `^24.3.0`, or `>=26`. CI uses 22.16.0. The EAS `sdk-58` image uses Node 22.23.3, and `eas.json` pins that version on every build profile.

## App identity

These values are already set. Do not run `eas init` or replace them.

| Setting | Value |
| --- | --- |
| Slug | `meetopia-app` |
| iOS bundle / Android package | `com.meetopia.app` |
| Expo project ID | `37e69074-d079-4c60-a3c4-5d468645bcf1` |
| EAS owner | `bferrell514` |
| iOS build number | `18` in `app.config.ts` (`cli.appVersionSource` is `local`) |
| Production API | `https://meetopia-live.netlify.app` |
| Signaling | `https://meetopia-signaling-v2.onrender.com` |

## Setup

From `apps/mobile`:

```bash
npm ci
```

Copy `.env.example` to `.env` only on a machine that is running a local dev client. Do not commit `.env`. When `EXPO_PUBLIC_SOCKET_URL` is unset, the app uses the production signaling URL above.

TURN is not configured. Public Google STUN is always used. A TURN server is added only when `EXPO_PUBLIC_TURN_URL`, `EXPO_PUBLIC_TURN_USERNAME`, and `EXPO_PUBLIC_TURN_CREDENTIAL` are all set. Those `EXPO_PUBLIC_*` values are embedded in the app bundle, so do not put a long-lived TURN password there.

## Local checks

Run these from `apps/mobile` before spending an EAS build. None of them uploads a build or submits to Apple.

```bash
npm ci
npm run typecheck
npm run lint
npx expo-doctor
npx expo config --type public
npx expo export --platform ios --output-dir dist-ios
node scripts/check-eas-config.cjs
```

`dist-ios` is generated output. It is gitignored and excluded from the EAS upload.

## Continuous Native Generation

`apps/mobile/ios` and `apps/mobile/android` may still exist in Git from earlier native checkouts. EAS must not compile those trees.

`.easignore` replaces `.gitignore` for the upload:

- The repository-root `.easignore` is what EAS reads for this monorepo. It excludes `/apps/mobile/ios/` and `/apps/mobile/android/`.
- `apps/mobile/.easignore` excludes `ios/` and `android/` when the EAS project root is `apps/mobile` (no Git repository, or a repository created in that directory).
- Both files also exclude `node_modules`, local `.env` files, and generated `dist-ios` / `dist-android` output.

EAS then runs prebuild and generates the native projects from `app.config.ts` and `@config-plugins/react-native-webrtc`.

## Inspect the upload

After `npx eas-cli login`, from `apps/mobile`:

```bash
npx eas-cli build:inspect --platform ios --stage archive --profile production --output ./eas-archive
```

The output directory must not already exist. This command does not start a cloud build. Confirm the archive contains `app.config.ts`, `eas.json`, `package-lock.json`, the app source, and `assets/`. Confirm it does not contain `ios/` or `android/`.

## EAS iOS build

Run this only when you intend to spend a build, from `apps/mobile`, on the commit you inspected:

```bash
npx eas-cli build --platform ios --profile production
```

Do not pass `--auto-submit`. Production `autoSubmit` is off. Submitting build 18 to TestFlight is a separate step.

A development client, still through EAS and not Expo Go:

```bash
npx eas-cli build --platform ios --profile development
```

Then `npm start` and open the installed Meetopia development app.