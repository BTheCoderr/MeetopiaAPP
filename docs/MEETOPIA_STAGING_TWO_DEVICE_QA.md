# Meetopia consent-first release: two-device test protocol

**Every case below is UNTESTED until a person runs it on real devices and records the result.**
This is a protocol, not evidence. Green CI does not replace it.

Applies to: branch `meetopia-staging-preflight` (PR #37 stack), signaling **protocol v3**, four new
additive migrations (`…000100_chemistry_passport`, `…000200_encore_spark_card`,
`…000300_shared_creation`, `…000400_lock_vibe_room_tables_server_only`).

**Never test against the production database or production signaling.** Use only synthetic adult
test accounts (for example `qa-a@example.invalid`). No real member data.

---

## 1. Choose a test environment (all $0)

### Option A — laptop + two phones over free HTTPS tunnels (available today)

Phones need HTTPS for camera/microphone, and phone B must be on **cellular** to prove TURN.

1. On the laptop, from the repo root on the exact release commit:
   ```bash
   docker run -d --name meetopia-qa-db -p 5432:5432 \
     -e POSTGRES_DB=meetopia -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres postgres:16-alpine
   npm ci && npm --prefix server ci
   export DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/meetopia
   export DATABASE_URL_UNPOOLED=$DATABASE_URL MEETOPIA_DISPOSABLE_DB=yes
   node scripts/prepare-disposable-db.cjs && npx prisma migrate deploy
   ```
   This database is local and disposable. Delete it afterwards: `docker rm -f meetopia-qa-db`.
2. Start two free Cloudflare quick tunnels (no account needed) in two terminals:
   ```bash
   cloudflared tunnel --url http://localhost:3000   # → https://<web>.trycloudflare.com
   cloudflared tunnel --url http://localhost:3003   # → https://<signal>.trycloudflare.com
   ```
3. Generate one throwaway signing secret (`openssl rand -hex 32`). **Do not reuse the production
   secret.** Put it in both files below. Never commit either file.
   - `.env.local` (repo root):
     `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `SOCKET_AUTH_SECRET=<throwaway>`,
     `NEXT_PUBLIC_SOCKET_URL=https://<signal>.trycloudflare.com`,
     `NEXT_PUBLIC_APP_URL=https://<web>.trycloudflare.com`,
     `NEXT_PUBLIC_TURN_URL`, `NEXT_PUBLIC_TURN_USERNAME`, `NEXT_PUBLIC_TURN_CREDENTIAL`
     (ExpressTURN values; `NEXT_PUBLIC_TURN_URL` may be a comma-separated list of UDP/TCP/TLS URLs).
   - `server/.env`:
     `PORT=3003`, `SOCKET_AUTH_SECRET=<same throwaway>`,
     `CORS_ORIGINS=https://<web>.trycloudflare.com`, `WEB_APP_URL=https://<web>.trycloudflare.com`.
     Leave `SUPABASE_*` empty so reports go to the local JSONL file, not production.
4. Run the **production** build (it matches what Netlify serves, and `next dev` rejects requests
   from tunnel hostnames because `allowedDevOrigins` is not configured):
   ```bash
   npm run build && npm start          # web on 3000; rebuild after any NEXT_PUBLIC_* change
   npm run dev:server                  # second terminal: signaling on 3003 (reads server/.env)
   ```
5. Open `https://<web>.trycloudflare.com` on both phones.

### Option B — native iPhone app (requires founder approval)

A local development build on a physical iPhone from a Mac (`npx expo run:ios --device`) does **not**
use EAS cloud credits, but installs a development build and needs Xcode and an Apple ID. Point
`EXPO_PUBLIC_API_URL` / `EXPO_PUBLIC_SOCKET_URL` at the Option A tunnels. An EAS cloud build or
TestFlight distribution needs separate approval.

### Option C — hosted staging (blocked)

Separate Netlify + Render + database staging is blocked by the Supabase free-project quota
(`docs/MEETOPIA_STAGING_CUTOVER.md`). Use it only once an isolated, approved database exists.

---

## 2. Preflight (before any device test)

| ID | Check | Expected | Result |
|----|-------|----------|--------|
| P1 | `curl https://<signal>/health` | 200 OK | UNTESTED |
| P2 | Server log on first page load | `[CORS] Allowed origin: https://<web>…` and no `Blocked origin` | UNTESTED |
| P3 | TURN credentials in the WebRTC "Trickle ICE" sample page (webrtc.github.io/samples) using your ExpressTURN URL/user/credential | At least one candidate of type **relay** | UNTESTED |
| P4 | Browser console on the video page | No `[WebRTC:ICE] TURN not configured` warning | UNTESTED |

---

## 3. Device matrix

Devices: **Phone A** (Wi-Fi) and **Phone B** (Wi-Fi off, cellular only). Then swap networks for N2.
Record date, device model, OS version, browser/build, network and PASS/FAIL with a short note.

### Onboarding and interface

| ID | Action | Expected | Result |
|----|--------|----------|--------|
| U1 | Open home page | Copy describes Passport → mutual consent → Vibe Room → mutual Connection; no "Chemistry Check", "random", "Next person" | UNTESTED |
| U2 | Sign up as adult A, confirm 18+ | Signup message points to Chemistry Passport; age gate cannot be skipped | UNTESTED |
| U3 | First visit to video page | New 4-step tutorial shows once; "Skip" and "Got it" both dismiss it permanently | UNTESTED |
| U4 | Press Space during an active Vibe Room (desktop) | Does **not** skip the partner | UNTESTED |
| U5 | Nav on phone width | "Vibe Sessions" reachable; consent, round and safety buttons reachable at large text size | UNTESTED |
| U6 | Open /privacy | Describes Passport, Encore, Co-Create, TURN, deletion (owner-approved wording) | UNTESTED |

### Chemistry Passport and consent

| ID | Action | Expected | Result |
|----|--------|----------|--------|
| A1 | A and B create Passports with at least one shared interest | Saved; invalid/oversized input rejected | UNTESTED |
| A2 | Both search | Each sees one introduction showing display name, style and **only shared interests** — no video yet | UNTESTED |
| A3 | Only A accepts; B waits | No video, no SDP/ICE; introduction expires | UNTESTED |
| A4 | B selects "Not this introduction" | A is notified; invitation is dead | UNTESTED |
| A5 | Both accept | Only now does two-way video start | UNTESTED |
| A6 | Incompatible intent, or no shared interest | No introduction; no fake score | UNTESTED |
| A7 | Themed Vibe Session: A and B choose **different** themes, then the **same** theme | Different → no introduction; same → introduction for that theme | UNTESTED |

### Vibe Room and Co-Create

| ID | Action | Expected | Result |
|----|--------|----------|--------|
| R1 | Spark round | Neither advances until both are ready | UNTESTED |
| R2 | A picks a Curveball answer; B has not | B cannot see A's answer | UNTESTED |
| R3 | Both pick | Synchronized, correctly labelled reveal | UNTESTED |
| R4 | The Bridge | Complementary roles; proposals hidden until both contribute | UNTESTED |
| R5 | Final creation approval: A approves, B revises | Approval resets; saved only when both approve the same revision | UNTESTED |
| R6 | Try Vibe before the final round | Not allowed (button disabled and rejected by the server) | UNTESTED |
| R7 | "Keep Exploring" or "Back to Base" mid-room | Partner is notified; private choices cleared; nothing saved | UNTESTED |

### Vibe, Connection, Encore

| ID | Action | Expected | Result |
|----|--------|----------|--------|
| V1 | Only A sends Vibe | No Connection | UNTESTED |
| V2 | Both Vibe | One Connection with the approved shared creation; survives reload | UNTESTED |
| E1 | A shares Encore | B cannot see A's choice until B shares | UNTESTED |
| E2 | Both share | Spark Card shows both ideas | UNTESTED |
| E3 | A withdraws, or removes the shared creation | Hidden for both on refresh | UNTESTED |

### Connections, calls, network

| ID | Action | Expected | Result |
|----|--------|----------|--------|
| C1 | Message, then reload both phones | Messages and read receipts persist; no duplicates | UNTESTED |
| C2 | A calls B from Connections | Ring, accept, decline, expiry all work | UNTESTED |
| N1 | A on Wi-Fi, B on cellular | Two-way audio **and** video within ~10 s | UNTESTED |
| N2 | Swap networks | Same | UNTESTED |
| N3 | Lock screen / background, incoming phone call, return | Safe recovery or clear retry; no frozen remote video | UNTESTED |
| N4 | Deny camera, then allow in settings | Clear message; works after granting | UNTESTED |
| N5 | Toggle airplane mode for 5 s mid-call | Reconnect or clean end; no stale partner | UNTESTED |

### Safety and data removal

| ID | Action | Expected | Result |
|----|--------|----------|--------|
| S1 | Report during an active Vibe Room | Report saved locally (JSONL in Option A); call ends | UNTESTED |
| S2 | Block mid-call | Call ends; never introduced again; Connection, Encore and creation removed | UNTESTED |
| S3 | Block from **another device** while a call is active | Record actual behavior — known open risk | UNTESTED |
| S4 | Delete account B | Signed out; Passport, Connections, Encore, creation, messages removed; live-session report retained | UNTESTED |
| S5 | Old session cookie after deletion / sign-out | Protected APIs return 401; no matching | UNTESTED |

---

## 4. Evidence template — DO NOT FILL WITH INVENTED RESULTS

- Date/time, testers (synthetic accounts only):
- Commit SHA of web and signaling (must be the same release commit):
- Environment option (A/B/C) and tunnel or staging URLs (no secrets):
- Devices, OS versions, browsers/builds, network for each phone:
- Each case ID: PASS/FAIL + note; issue links; fix commit; retest date:
- TURN relay observed (P3/N1): yes/no:
- Screen recordings only with tester consent:

## 5. Release gate

Production cutover (`docs/MEETOPIA_STAGING_CUTOVER.md`) may be scheduled only when **P1–P4, A1–A7,
R1–R7, V1–V2, N1–N2 and S1–S2, S4–S5 pass**, S3 behavior is recorded and accepted by the owner, the
owner has approved `/privacy`, and the production migrations have been reviewed separately.

Apple Guideline 4.3 / 4.2.6 / 1.2 answers still require real TestFlight testers and verified
authorship. Self-attested age is **not** identity verification.

**Release status: NO GO until the gates above pass.**
