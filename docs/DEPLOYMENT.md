# Meetopia Web MVP — Deployment

## Deploy targets

| Service | Target | Config |
|---------|--------|--------|
| **Frontend** | Vercel | Root Next.js app (`npm run build`) |
| **Signaling** | Render | `server/` via [`render.yaml`](../render.yaml) |

Historical URLs from [`.env.render`](../.env.render):
- Frontend: `https://meetopia-app.vercel.app`
- Signaling: `https://meetopia-signaling.onrender.com`

## Production environment

### Frontend (Vercel)

```env
NEXT_PUBLIC_SOCKET_URL=https://meetopia-signaling.onrender.com
NEXT_PUBLIC_TURN_URL=turn:your-turn-server.com:3478
NEXT_PUBLIC_TURN_USERNAME=...
NEXT_PUBLIC_TURN_CREDENTIAL=...
NEXT_PUBLIC_URL=https://meetopia-app.vercel.app
```

Redeploy after changing `NEXT_PUBLIC_*` (inlined at build time).

### Signaling (Render)

```env
PORT=3003
NODE_ENV=production
CORS_ORIGINS=https://meetopia-app.vercel.app,https://meetopia-signaling.onrender.com
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
- [ ] Rollback IDs noted (Vercel + Render)

## Mobile native app

Separate Expo app under `apps/mobile/` — does not replace this deploy. Uses same signaling server via `EXPO_PUBLIC_SOCKET_URL`. See [MOBILE_APP_AUDIT.md](./MOBILE_APP_AUDIT.md).
