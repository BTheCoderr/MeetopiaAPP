# Password recovery release checklist

No provider is selected automatically. Existing recovery stays disabled until the four runtime settings below are configured. Do not put keys in Git, client bundles, screenshots, or chat.

For SMTP2GO: verify the Meetopia sender, create a dedicated key restricted to /email/send, set a provider-side rate limit, disable click tracking/archiving for password reset mail. Set on the server only:
- PASSWORD_RESET_EMAIL_PROVIDER=smtp2go
- SMTP2GO_API_KEY (secret)
- PASSWORD_RESET_FROM_EMAIL (verified sender)
- PASSWORD_RESET_BASE_URL=https://meetopia-live.netlify.app

For isolated staging use a separate restricted key and its own HTTPS origin. Resend remains an explicit optional provider with RESEND_API_KEY, not a fallback. No provider credentials are shared across apps. No automated retries. Global quota: 120 requests per UTC minute and 30 sending attempts per UTC day; one active reset link per account for 30 minutes. The low global quota is intentional for the pilot; monitor and adjust as usage grows. A provider failure or uncertain timeout may leave a valid token for 30 minutes. Responses do not reveal whether an account exists.

Apply the new Prisma migration before enabling the provider in either environment. Run disposable DB CI and mock provider tests, then test actual delivery, link origin, expiry, single use, session revocation, and concurrent requests on staging. Do not copy production data or credentials into staging. No production deploy is part of this patch.

Credential audit: current tracked tree has only example env files and the public iOS build environment configuration; historical .env.production readable versions contain only NEXT_PUBLIC_SOCKET_URL. This is a targeted path audit, not a full history scan. GitGuardian/secret scanning and full-history scans still required. Rotate any confirmed exposed keys; do not assume the Resend restriction was caused by a leak.
