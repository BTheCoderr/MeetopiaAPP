# Meetopia — App Store Metadata (Draft)

## App name

**Meetopia**

## Subtitle options (pick one, 30 chars max)

1. **Video-first dating** *(recommended — clear category signal)*  
2. **Meet real chemistry**

## Promotional text (optional, 170 chars)

Meet people through live video Chemistry Checks. Match by intent, tap Vibe, and chat when the feeling is mutual. 18+ only.

## Description (draft)

Meetopia is video-first dating and meeting for people who want **real chemistry** — not endless swiping or anonymous random chat.

**How it works**

1. Create a lightweight profile and choose your intent — dating, new friends, local meetups, and more.  
2. Start a **Chemistry Check**: a short live video conversation with someone who matches your vibe.  
3. Tap **Vibe** if you feel a connection. When you both do, chat unlocks.  
4. Skip anytime, report problems, or block users who make you uncomfortable.

**Built for safety**

- 18+ only with age confirmation  
- Report and block from every Chemistry Check  
- Leave any call instantly  
- Delete your local account data from Settings  

Meetopia uses your camera and microphone for live video conversations. We do not record your calls on our servers.

Questions or feedback during beta? Contact ermias6822@gmail.com

## Keywords (100 chars max, comma-separated)

**Use in App Store Connect (MVP — no verified profiles / AI moderation claims):**

```
dating,video dating,chemistry,meet people,singles,chat,local dating,new friends
```

**Do not use:** `verified profiles`, `compatibility matching`, `safe dating`, `meaningful dating`, or other claims for features not live in MVP.

## Category

**Primary: Lifestyle**  
**Secondary: Social Networking** *(optional)*

**Why Lifestyle:** Apple groups dating and relationship apps under Lifestyle alongside Social Networking; “video-first dating” aligns with Lifestyle user expectations. Social Networking is a reasonable secondary tag for friend/meetup intents.

## Age rating

Likely **17+** based on:

- Unrestricted web access (signaling)  
- User-generated content (profile, chat, live video)  
- Dating/meeting theme  

**Do not hardcode the final rating** — complete Apple’s questionnaire in App Store Connect.

## App Store Connect — paste these URLs

| Field | URL |
|-------|-----|
| **Support URL** | `https://meetopia-live.netlify.app/support` |
| **Marketing URL** | `https://meetopia-live.netlify.app` |
| **Privacy Policy URL** | `https://meetopia-live.netlify.app/privacy` |
| **Terms of Service** | `https://meetopia-live.netlify.app/terms` |
| **Community Guidelines** | `https://meetopia-live.netlify.app/community-guidelines` |
| **Safety & Reporting** | `https://meetopia-live.netlify.app/safety` |

Mobile Settings opens the same URLs via `apps/mobile/src/config/links.ts`.

## Description — App Store Connect paste (honest MVP)

Meetopia is video-first dating for people who want real chemistry — not endless swiping.

**How it works**

1. Create a lightweight local profile and choose your dating intent.  
2. Start a **Chemistry Check**: a short live video conversation.  
3. Tap **Vibe** if you feel a connection. When you both do, chat unlocks.  
4. Skip anytime, **report**, or **block** users who make you uncomfortable.

**MVP limits (this beta)**

- No payments, push notifications, AI moderation, or automatic video blur  
- Profile stored on device until authenticated accounts launch  
- Reports logged for review — not instant AI review  

Meetopia uses your camera and microphone for live video. We do not record your calls on our servers.

Questions during beta? Contact ermias6822@gmail.com

## Copyright

© 2026 Baheem Ferrell (update as needed)

## TestFlight beta description

Thanks for testing Meetopia!

Please exercise:

- Onboarding (18+, profile, intent)  
- Chemistry Check matching and video quality (Wi‑Fi + cellular)  
- 3-minute timer, mute, camera, skip  
- Mutual **Vibe** and chat unlock  
- Report, block, and leave flows  
- Settings → delete local account data  

Known MVP limits: local-only profile storage, no push notifications, no payments. Reports are logged for review — no AI moderation yet.

Send feedback to ermias6822@gmail.com

## Screenshot storyboard (suggested)

1. Home — “Start Chemistry Check”  
2. Profile / intent selection  
3. Live video with profile card + timer  
4. Mutual Vibe unlocked chat  
5. Report modal  
6. Settings & safety  
