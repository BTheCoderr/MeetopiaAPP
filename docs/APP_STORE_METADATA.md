# Meetopia — App Store Metadata (Draft)

## App name

**Meetopia**

## Subtitle options (pick one, 30 chars max)

1. **Video-first dating** *(recommended — clear category signal)*  
2. **Meet real chemistry**

## Promotional text (optional, 170 chars)

Meet people through live video Chemistry Checks. Match by intent, tap Vibe, and chat when the feeling is mutual. 18+ only.

## Description (draft)

Meetopia is profile-based, video-first dating for people who want **real chemistry**. Create a profile, choose your intent, browse suggested matches, and request a Chemistry Check.

**How it works**

1. Create a lightweight profile and choose your intent — dating, new friends, local meetups, and more.  
2. Browse **suggested matches** who share your intent and open a profile.  
3. **Request a Chemistry Check** — a short live video conversation that starts only after your match accepts.  
4. Tap **Vibe** if you feel a connection. When you both do, chat unlocks.  
5. Skip anytime, report problems, or block users who make you uncomfortable.

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

## Age rating (Guideline 2.3.6 — required settings)

Meetopia is a dating app, so the age rating **must be 18+**. Set the following in
**App Store Connect → App → Age Rating → Edit**:

| Questionnaire item | Answer |
|--------------------|--------|
| **Mature/Suggestive Themes** | **Frequent/Intense** |
| **Medical/Treatment, Gambling, etc.** | None |
| **Override to a higher age rating** | **Yes → 18+** |
| **Made for Kids** | No |

Also complete the App Privacy / app questionnaire consistently:

| Item | Answer |
|------|--------|
| **User-Generated Content** | **Yes** (profiles, chat, live video) |
| **Messaging and Chat** | **Yes** |
| **Age Assurance / Age Verification** | **Yes** (18+ age gate on first launch) |
| **Unrestricted Web Access** | **No** (in-app links open fixed policy pages only) |

Result: the app must display an **18+** rating. Do not submit at 9+/12+/17+.

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

Meetopia is profile-based, video-first dating for people who want real chemistry.

**How it works**

1. Create a lightweight local profile and choose your dating intent.  
2. Browse **suggested matches** and open a profile (name, age, city, intent, prompt, interests).  
3. **Request a Chemistry Check.** Video starts only after the match accepts.  
4. Tap **Vibe** if you feel a connection. When you both do, chat unlocks.  
5. Skip anytime, **report**, or **block** users who make you uncomfortable.

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

1. Home — “Video-first dating for real chemistry” + **View Suggested Matches**  
2. Suggested Matches list (profiles with intent + interests)  
3. Profile card with **Request Chemistry Check**  
4. Chemistry Check video — “You're meeting [Name]” + profile card + timer  
5. Mutual Vibe unlocked chat  
6. Report modal + Settings & safety  
