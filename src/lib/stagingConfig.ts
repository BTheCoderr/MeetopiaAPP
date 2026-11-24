// Staging configuration must never silently fall back to live production data.
// These functions are run at build/startup and intentionally throw on unsafe config.
function parseHost(url: string, label: string) {
  let parsed: URL
  try { parsed = new URL(url) } catch { throw new Error(`Staging ${label} must be a valid URL.`) }
  return parsed
}

export function assertStagingDatabaseConfig(env: NodeJS.ProcessEnv) {
  if (env.MEETOPIA_DEPLOY_ENV !== 'staging') return
  if (env.MEETOPIA_STAGING_DB_PROVIDER === 'render') {
    require('../../scripts/render-staging-guard.cjs').assertRenderStagingDatabase(env)
    return
  }
  const ref = env.MEETOPIA_STAGING_DB_REF
  if (!ref || !/^[a-z0-9]{20}$/.test(ref)) {
    throw new Error('Staging requires a separate Supabase project reference (MEETOPIA_STAGING_DB_REF).')
  }
  const candidates = ['MEETOPIA_DATABASE_URL', 'DATABASE_URL', 'DATABASE_URL_UNPOOLED']
  const values = candidates.map(key => ({ key, value: env[key] })).filter((v): v is {key: string; value: string} => Boolean(v.value))
  if (!values.length) throw new Error('Staging requires a dedicated DATABASE_URL; production fallback is forbidden.')
  for (const { key, value } of values) {
    const url = parseHost(value, key)
    const direct = url.hostname === `db.${ref}.supabase.co`
    const pooler = url.hostname.endsWith('.pooler.supabase.com') &&
      decodeURIComponent(url.username) === `postgres.${ref}`
    if (!['postgres:', 'postgresql:'].includes(url.protocol) || (!direct && !pooler)) {
      throw new Error(`Staging ${key} does not target the approved isolated Supabase branch.`)
    }
  }
}

export function assertStagingWebConfig(env: NodeJS.ProcessEnv) {
  if (env.MEETOPIA_DEPLOY_ENV !== 'staging') return
  const socket = env.NEXT_PUBLIC_SOCKET_URL
  const site = env.MEETOPIA_STAGING_WEB_URL
  if (!socket || !site) throw new Error('Staging requires NEXT_PUBLIC_SOCKET_URL and MEETOPIA_STAGING_WEB_URL.')
  const socketUrl = parseHost(socket, 'socket URL')
  const webUrl = parseHost(site, 'web URL')
  if (socketUrl.protocol !== 'https:' || webUrl.protocol !== 'https:' ||
      socketUrl.hostname === 'meetopia-signaling-v2.onrender.com' ||
      webUrl.hostname === 'meetopia-live.netlify.app' ||
      socketUrl.hostname === webUrl.hostname) {
    throw new Error('Staging must use distinct HTTPS preview web and signaling hosts.')
  }
}

export function assertStagingConfig(env: NodeJS.ProcessEnv) {
  assertStagingDatabaseConfig(env)
  assertStagingWebConfig(env)
}
