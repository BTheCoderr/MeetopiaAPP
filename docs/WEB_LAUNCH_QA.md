# Web + Dating Launch — QA Checklist

**Baseline commit:** `Unify video chat layout across desktop and mobile`  
**Freeze:** No UI redesign, no WebRTC/signaling changes unless a bug is found.

## Product surface

| Route | Purpose |
|-------|---------|
| `/chat/video` | Random video chat |
| `/chat/video?mode=dating` | Dating video (after profile) |
| `/dating/profile` | Profile setup |
| `/dating/interests` | Interests flow |

## Local real-device QA

**Phone URL:** `http://<LAN_IP>:3000/chat/video` (signaling on `:3003`)  
Start: `npm run dev` from repo root.

### Random mode (`/chat/video`)

| Check | Pass |
|-------|------|
| Desktop normal + incognito both load | [ ] |
| Phone + laptop on same Wi‑Fi | [ ] |
| Before match: local camera full-screen | [ ] |
| Before match: **no PIP** | [ ] |
| After match: remote full-screen | [ ] |
| After match: local PIP top-right | [ ] |
| Message pill above controls | [ ] |
| Controls bottom center | [ ] |
| No horizontal scroll | [ ] |
| No blank gray PIP | [ ] |
| Next person → local full-screen, PIP gone | [ ] |
| Server: single `peer-left` per disconnect | [ ] |
| WebRTC logs: paired → call-user → make-answer | [ ] |

### Dating mode

| Check | Pass |
|-------|------|
| `/dating/profile` → `/chat/video?mode=dating` | [ ] |
| `find-user` emits `{ mode: "dating", profile }` (network tab) | [ ] |
| Compatible profiles match | [ ] |
| Layout same as random mode | [ ] |

## After layout QA passes

Say: **"Layout QA passed. Now audit video quality only."**  
Do not mix quality fixes with layout.

## Launch order

1. Local QA pass  
2. Commit baseline  
3. Deploy signaling server  
4. Deploy frontend  
5. HTTPS camera/mic test  
6. Add TURN env vars  
7. Final deployed two-device QA  

See [DEPLOYMENT.md](./DEPLOYMENT.md) and [MVP_RELEASE_CHECKLIST.md](./MVP_RELEASE_CHECKLIST.md).
