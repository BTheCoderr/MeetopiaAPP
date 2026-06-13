/** Public site URLs — live on Netlify (no custom domain required for App Store). */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://meetopia-live.netlify.app'

/** Support inbox until a custom domain is added. Override via Netlify env if needed. */
export const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? 'ermias6822@gmail.com'

export const POLICY_PATHS = {
  privacy: '/privacy',
  terms: '/terms',
  guidelines: '/community-guidelines',
  support: '/support',
  safety: '/safety',
} as const

export function policyUrl(path: keyof typeof POLICY_PATHS): string {
  return `${SITE_URL}${POLICY_PATHS[path]}`
}
