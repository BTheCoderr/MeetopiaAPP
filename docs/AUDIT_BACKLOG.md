# npm audit backlog (safe fixes applied)

Last verified after `cleanup/mobile-types-and-audit` branch work.

## Root web (`/`)

**Removed:** `next-auth` (unused — no imports in `src/`, `app/`, or `middleware.ts`).

**Safe fixes applied:** prior `npm audit fix` reduced transitive issues; `next-auth` removal cleared uuid chain.

### Remaining (2) — requires planned Next upgrade

| Package | Severity | Path | Why not auto-fixed |
|---------|----------|------|-------------------|
| `next@14.0.4` | critical/high | direct dependency | Patched versions (`14.2.35+`) fail `npm run build` on `/chat/video` prerender in this repo. Needs tested upgrade to latest **14.2.x** (or 15+) with full QA — not `npm audit fix --force`. |
| `postcss` (via `next`) | moderate | `node_modules/next/node_modules/postcss` | Bundled with `next`; resolves when Next is upgraded. |

**Recommended future fix:** Upgrade Next.js within 14.2.x patch line on a branch, run full build + `/chat/video` QA, then deploy Netlify.

## Server (`server/`)

**0 vulnerabilities** — no changes needed.

## Mobile (`apps/mobile/`)

**0 vulnerabilities** after targeted `overrides` in `package.json` (March 2026):

| Override | Reason |
|----------|--------|
| `expo@~52.0.46` | Prevent nested Expo 56 peer install |
| `@xmldom/xmldom@0.9.10` | XML injection / DoS in plist tooling |
| `tar@7.5.16` | Path traversal in `@expo/cli` cache |
| `uuid@11.1.1` | Buffer bounds in `xcode` / `@expo/rudder-sdk-node` |
| `postcss@8.5.15` | XSS in metro CSS stringify |
| `ajv@8.18.0` | ReDoS in dev-launcher |

**Do not** run `npm audit fix --force` on mobile — it jumps to Expo SDK 56 and breaks the pinned WebRTC stack.

After changing overrides: `rm -rf node_modules package-lock.json && npm install && npm audit && npm run typecheck`.

## Mobile TypeScript

`cd apps/mobile && npm run typecheck` — **passes**. Prior 72 errors were from root type-checking mobile with web React types; fixed via root `exclude` + mobile-only tsconfig.
