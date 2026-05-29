# Meetopia MVP — Video Chat Release Checklist

**Status:** Local manual QA passed (desktop two-browser + mobile/second device).  
**Freeze:** Do not refactor `/chat/video` WebRTC, `VideoStage`, PIP, `MessageBar`, or `ControlBar` unless a production bug is found.

---

## Code freeze (no changes unless bug)

- [ ] `src/components/video-chat/VideoStage.tsx` — `hasRemote`, stream `srcObject`, overlays
- [ ] `src/components/video-chat/PictureInPicture.tsx` — PIP mount + camera-paused fallback
- [ ] `src/components/video-chat/MessageBar.tsx` + `ChatPanel.tsx`
- [ ] `src/components/video-chat/ControlBar.tsx`
- [ ] `src/hooks/useVideoChatSocket.ts` + `usePeerConnection.ts` — signaling only; no layout edits

---

## Environment variables

### Frontend (Vercel / host)

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SOCKET_URL` | HTTPS signaling URL, e.g. `https://meetopia-signaling.onrender.com` |
| `NEXT_PUBLIC_TURN_URL` | TURN URI(s) for strict NAT / mobile LTE |
| `NEXT_PUBLIC_TURN_USERNAME` | TURN username |
| `NEXT_PUBLIC_TURN_CREDENTIAL` | TURN credential |
| `NEXT_PUBLIC_URL` | Public app URL (if used elsewhere) |

Reference: [`.env.example`](../.env.example), ICE via [`src/lib/iceServers.ts`](../src/lib/iceServers.ts).

### Signaling server (Render / host)

| Variable | Purpose |
|----------|---------|
| `PORT` | `3003` (or platform-assigned) |
| `NODE_ENV` | `production` |
| `CORS_ORIGINS` | Comma-separated allowed frontend origins (see CORS below) |

---

## 1. Signaling server deploy

- [ ] Deploy `server/` (e.g. Render: [`render.yaml`](../render.yaml))
- [ ] Process listens and logs `Signaling server running on port …`
- [ ] Health check responds on deployed URL
- [ ] **Production CORS:** Socket.IO `cors.origin` includes every production frontend URL (HTTPS). Confirm [`server/index.js`](../server/index.js) matches `CORS_ORIGINS` / Render config — today defaults include `localhost` only; production domains must be allowed before go-live.
- [ ] No `EADDRINUSE` on target port in production (one instance per port)

---

## 2. Frontend deploy

- [ ] Build passes: `npx tsc --noEmit` and `npm run build`
- [ ] Deploy Next.js app (e.g. Vercel)
- [ ] `NEXT_PUBLIC_SOCKET_URL` points at **deployed** signaling server (HTTPS, not `localhost:3003`)
- [ ] Public routes work without login: `/chat`, `/chat/video`, `/dating/profile`, `/dating/interests` ([`src/middleware.ts`](../src/middleware.ts))

---

## 3. HTTPS camera / microphone

- [ ] App served over **HTTPS** (required for `getUserMedia` on real devices)
- [ ] Browser prompts for camera + mic; grant on both test devices
- [ ] No mixed-content errors (HTTPS page → HTTP socket blocked by browser)
- [ ] iOS Safari: test from home screen / Safari with permissions (not HTTP LAN IP)

---

## 4. TURN (production WebRTC)

- [ ] TURN provider provisioned (Twilio, Metered, Xirsys, etc.)
- [ ] All three `NEXT_PUBLIC_TURN_*` set on frontend production env
- [ ] Redeploy frontend after TURN vars are set (Next inlines `NEXT_PUBLIC_*` at build)
- [ ] Optional: verify relay candidates in `chrome://webrtc-internals` when testing across networks

---

## 5. Final deployed two-device QA

Use **production URLs** (not `localhost`).

| Step | Pass |
|------|------|
| Device A + B open `/chat/video` (HTTPS) | [ ] |
| Both connect to signaling (header/socket connected) | [ ] |
| Match → remote full-screen, local PIP top-right | [ ] |
| In-call message pill send/receive | [ ] |
| Mute / camera / next / leave | [ ] |
| Disconnect / next → local full-screen, **no empty PIP** | [ ] |
| Dating: `/chat/video?mode=dating` after profile setup | [ ] |
| Cross-network (e.g. Wi‑Fi + cellular) if TURN configured | [ ] |

---

## 6. Post-release smoke

- [ ] Server logs: `paired`, `call-user`, `make-answer`, clean `peer-left` on disconnect
- [ ] No sustained client runtime errors on `/chat/video`
- [ ] Rollback plan: previous Vercel + Render deploy IDs noted

---

## Local dev note

If `npm run dev` fails with `EADDRINUSE :::3003`, stop the old signaling process or free port 3003. If Next uses **3001**, open `http://localhost:3001/chat/video` and keep `NEXT_PUBLIC_SOCKET_URL=http://localhost:3003`.
