# Meetopia Privacy Disclosures (Draft)

Use this document for App Store Privacy Nutrition Labels, Privacy Policy drafting, and internal compliance review. **Not legal advice** — have counsel review before publication.

## Public policy URLs (live)

| Page | URL |
|------|-----|
| Home | https://meetopia-live.netlify.app |
| Privacy Policy | https://meetopia-live.netlify.app/privacy |
| Terms of Service | https://meetopia-live.netlify.app/terms |
| Community Guidelines | https://meetopia-live.netlify.app/community-guidelines |
| Support | https://meetopia-live.netlify.app/support |
| Safety & Reporting | https://meetopia-live.netlify.app/safety |

Mobile app Settings opens the same URLs (`apps/mobile/src/config/links.ts`).

## Summary

Meetopia is a video-first dating and meeting app. We collect information needed to match you for live video Chemistry Checks and to keep the community safe.

## Data we collect

### Information you provide

| Data | Examples | Purpose |
|------|----------|---------|
| Profile | First name, age, city, gender, who you’re interested in, intent, short prompt | Show a lightweight card to matches; improve intent-based pairing |
| Age confirmation | 18+ checkbox | Legal requirement; app is adults only |
| Safety actions | Report category, blocked user IDs | Safety and moderation |
| Messages | Text sent after mutual Vibe | In-call chat |

### Automatically collected

| Data | Purpose |
|------|---------|
| Device identifiers (socket session ID) | WebRTC signaling and matching |
| Connection / crash logs (if enabled later) | Reliability |

### Not collected by Meetopia (MVP)

- We do **not** record or store video/audio streams on our servers.
- We do **not** sell personal data.
- We do **not** use AI to analyze video content in the current MVP.

## Camera and microphone

Meetopia requires camera and microphone access for **live video Chemistry Checks**. Streams are peer-to-peer via WebRTC where possible; signaling runs through our Render backend. Users can deny permissions but cannot use video features without them.

## Data storage (MVP)

| Data | Location |
|------|----------|
| Profile, intent, age flag, blocks, vibe matches | On-device (AsyncStorage) |
| Signaling sessions | Render server (ephemeral) |
| Reports | Server logs (timestamp, category, reported socket ID) |

**Phase 2:** authenticated accounts with Supabase/API persistence and server-side deletion.

## Account deletion

Users can delete local account data from **Settings → Delete account data**. This removes profile, onboarding state, blocks, and local match history on the device. When accounts are authenticated, deletion will also remove server-side records (document retention period in Privacy Policy).

## Children

Meetopia is **18+ only**. We do not knowingly collect data from anyone under 18. Report underage users via in-app Report.

## Third parties

| Service | Role |
|---------|------|
| Render | Signaling server hosting |
| Apple TestFlight / App Store | Distribution |
| Expo / EAS | Build and updates (when configured) |

## Your choices

- Deny camera/mic (limits video features)
- Block and report users
- Delete local account data in Settings
- Leave any Chemistry Check at any time

## Contact

Support: `support@meetopia.app` (placeholder — update before launch)  
Privacy: `privacy@meetopia.app` (placeholder)

## App Store privacy label mapping (draft)

- **Contact Info:** Name (optional profile field)
- **User Content:** Messages, profile prompt
- **Identifiers:** User ID (socket session; may change)
- **Usage Data:** Product interaction (reports) — if analytics added later, update labels

Linked to user: Yes (profile and safety data tied to session/account).  
Used for tracking: No (MVP).
