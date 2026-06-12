# Meetopia TestFlight QA Checklist

Use this checklist before promoting a build from TestFlight to App Store review.

**Build under test:** _______________  
**Tester:** _______________  
**Date:** _______________  
**Device / iOS version:** _______________

## Install & launch

- [ ] App installs from TestFlight without crash
- [ ] Splash and icon display (or documented placeholder)
- [ ] Home screen shows dating/meeting positioning (not “random chat”)

## Onboarding

- [ ] Age gate: Continue disabled until 18+ confirmed
- [ ] Age gate persists after app restart
- [ ] Profile screen: name, age, city, gender, interested in, prompt
- [ ] Intent screen: all six intents selectable
- [ ] Incomplete onboarding redirects from Chemistry Check

## Chemistry Check (video)

- [ ] Camera/mic permission prompts show correct copy
- [ ] Local preview full-screen before match
- [ ] Searching copy: “Looking for someone who matches your intent…”
- [ ] Match connects with second device/browser (web or mobile)
- [ ] Peer profile card shows name, age, city, intent (no private extras)
- [ ] 3-minute Chemistry Check timer visible during call
- [ ] Mute / camera toggle work
- [ ] Skip/Next finds another partner
- [ ] Leave shows confirmation and returns cleanly

## Vibe & chat

- [ ] Vibe button sends vibe (UI shows sent state)
- [ ] Mutual Vibe shows “It’s a vibe — chat unlocked”
- [ ] Chat input disabled until mutual Vibe
- [ ] Messages send/receive after mutual Vibe
- [ ] Typing indicator (if peer typing)

## Safety

- [ ] Report modal: all six categories
- [ ] Report shows confirmation (no false “AI reviewed instantly” copy)
- [ ] Block: confirmation, leaves chat, skips blocked user on rematch
- [ ] Settings: Delete account clears local data and returns to age gate

## Settings & legal links

- [ ] Privacy Policy link opens (placeholder OK for beta)
- [ ] Terms link opens (placeholder OK for beta)
- [ ] Community guidelines accessible
- [ ] Support contact (mailto or URL)

## Network & backend

- [ ] Connects to `EXPO_PUBLIC_SOCKET_URL` (Render production)
- [ ] Reconnect after background/foreground (best effort)
- [ ] No CORS errors on web (regression check — web unchanged)

## Performance

- [ ] Video latency acceptable on Wi‑Fi
- [ ] Video acceptable on cellular (note quality)
- [ ] No memory leak after 5+ skip cycles

## Known limitations (expected in MVP)

- Profile/matches stored locally only
- No push notifications
- No payments
- Reports logged server-side; no admin dashboard yet
- No AI moderation / auto-blur

## Sign-off

| Role | Name | Pass/Fail | Notes |
|------|------|-----------|-------|
| Engineering | | | |
| Product | | | |

**Do not submit to App Store until all critical paths pass.**
