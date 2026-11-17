# Meetopia native brand assets

These files are referenced by `apps/mobile/app.config.ts`:

| File | Use |
| --- | --- |
| `icon.png` | iOS and Android app identity |
| `adaptive-icon.png` | Android adaptive icon |
| `splash.png` | Native app launch image |

## Apple review and asset provenance

- Verify who originally created or licensed **each asset**, including its source artwork, permissions and any reused fonts or stock elements. This README does not establish asset ownership.
- The existence of an icon, splash file or Expo scaffold is **not** evidence of a commercialized dating-app template.
- Use visually consistent, original Meetopia assets that reflect the actual live Vibe Room experience. Do not use fabricated user photos or screenshots.
- Check that the exact files in the EAS archive and build are the ones reviewed, not historical placeholders.
- The repo's original code included default Next.js asset files from a project scaffold, and the native project may contain historical generated iOS assets. These are separate from the app's commercial product logic. Verify final-brand identity before submitting.
- No `eas init` is required: the existing Expo EAS project ID and owner are already configured in `apps/mobile/app.config.ts`.
- Build releases through **Expo/EAS only**. Do not rebuild with manual CocoaPods or Xcode.
- Run `npx eas-cli build:inspect --platform ios --stage archive --profile production --output ./eas-archive` from `apps/mobile` once authenticated to review the upload; this inspection is not a cloud build.

See `docs/APP_REVIEW_426_CODE_PROVENANCE.md` and `docs/MEETOPIA_STAGING_TWO_DEVICE_QA.md` before the next App Store submission.
