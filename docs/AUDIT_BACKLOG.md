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

**26 vulnerabilities** (9 moderate, 17 high) — mostly Expo / Metro / `@expo/*` / `xcode` transitive.

**Safe `npm audit fix`:** no material reduction without breaking changes.

**Recommended future fix:** Expo SDK upgrade (`expo install --fix` on new SDK) — do not force during live web MVP.

## Mobile TypeScript

`cd apps/mobile && npm run typecheck` — **passes**. Prior 72 errors were from root type-checking mobile with web React types; fixed via root `exclude` + mobile-only tsconfig.
