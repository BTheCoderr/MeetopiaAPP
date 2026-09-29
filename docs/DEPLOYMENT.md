# Meetopia Web MVP — Deployment

## Deploy targets

| Service | Target | Config |
|---------|--------|--------|
| **Frontend** | Netlify | Root Next.js app (`npm run build`) — https://meetopia-live.netlify.app |
| **Signaling** | Render | `server/` via [`render.yaml`](../render.yaml) — https://meetopia-signaling-v2.onrender.com |

**App Store / public links:** use `https://meetopia-live.netlify.app` only. The deprecated `https://meeetopia.netlify.app` hostname is redirected to the canonical site by application middleware. The canonical production signaling service is `https://meetopia-signaling-v2.onrender.com` and Render should deploy the `main` branch.

## Production environment

### Frontend (Netlify)

```env
NEXT_PUBLIC_SITE_URL=https://meetopia-live.netlify.app
NEXT_PUBLIC_SOCKET_URL=https://meetopia-signaling-v2.onrender.com
NEXT_PUBLIC_TURN_URL=turn:your-turn-server.com:3478
NEXT_PUBLIC_TURN_USERNAME=...
NEXT_PUBLIC_TURN_CREDENTIAL=...
```

Redeploy after changing `NEXT_PUBLIC_*` (inlined at build time).

### Signaling (Render)

```env
PORT=3003
NODE_ENV=production
CORS_ORIGINS=https://meetopia-live.netlify.app
# Report handling (Supabase required for App Store; email optional)
# REPORT_NOTIFY_EMAIL=you@example.com
# RESEND_API_KEY=re_...
REPORT_ADMIN_TOKEN=long-random-token
```

**Blocker:** [`server/index.js`](../server/index.js) Socket.IO `cors.origin` must include production frontend HTTPS origins. Wire `CORS_ORIGINS` env before go-live (Render sets it; server code must read it).

## Pre-deploy verification

```bash
npx tsc --noEmit
npm run build
```

## Post-deploy checklist

- [ ] HTTPS frontend loads `/chat/video` without auth redirect
- [ ] `NEXT_PUBLIC_SOCKET_URL` is HTTPS (no mixed content)
- [ ] Camera/mic prompt on HTTPS (desktop + mobile Safari)
- [ ] TURN vars set; cross-network test if possible
- [ ] Two-device match on **production** URLs
- [ ] Dating profile → `{ mode: "dating", profile }` on production
- [ ] Rollback IDs noted (Netlify + Render)

## Mobile native app

Separate Expo app under `apps/mobile/` — does not replace this deploy. Uses same signaling server via `EXPO_PUBLIC_SOCKET_URL`. See [MOBILE_APP_AUDIT.md](./MOBILE_APP_AUDIT.md).


## Production security notes

- Browser code does not connect directly to Supabase. Prisma/Postgres handles application data server-side.
- The Render reporting service uses the Supabase service-role key only on the server.
- Deprecated production traffic from `meeetopia.netlify.app` is redirected to `meetopia-live.netlify.app`.
- CI fails on high-severity production dependency advisories for both the web app and signaling service.
