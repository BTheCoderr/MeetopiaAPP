# Temporary isolated Render staging

This branch is for disposable testing only. Never merge its provider-specific pin or deployment guards into main. Source base: cfe7dd2c5825be36f3749d3d2f5d3bb70517ca1b.

- The existing free Render PostgreSQL instance is meetopia-staging-db (dpg-dc2ssq40916s73b2dgg0-a). It has no external IP access and expires 2026-12-24.
- The separate render-staging.yaml Blueprint references only this database and new free web/signaling services. No production services or production credentials are referenced. Auto-deploy is disabled.
- The web startup validates exact database identity, prepares NOLOGIN roles required by existing migrations, and applies Prisma migrations on the isolated database only. The dedicated secret is generated in a shared staging environment group. All production fallback URLs are rejected.
- Hosted staging is not yet verified. Verify Render's reviewed plan and available free hours before approval, then inspect startup logs, migration status, health, and real two-device consent and media tests. Configure only approved browser-facing TURN credentials if needed. Staging reporting uses ephemeral storage and does not send email. Do not use real user data.
- The existing production and source development branches remain unchanged. No production migrations, Netlify builds, EAS builds or paid resources are authorized.
- Free services share 750 monthly instance hours per workspace; keep this test environment idle when not testing. Do not enable paid plans or automatic sync. No assumption that a free quota is unlimited.
