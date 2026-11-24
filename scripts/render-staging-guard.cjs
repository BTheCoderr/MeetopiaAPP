'use strict'

// Deliberately pinned to the newly provisioned, isolated free staging database.
// No live DB URL can satisfy this guard, even if supplied as a fallback.
const approvedDb = 'dpg-dc2ssq40916s73b2dgg0'
const approvedDbName = 'meetopia_staging_db'
const urlKeys = ['MEETOPIA_DATABASE_URL', 'DATABASE_URL', 'DATABASE_URL_UNPOOLED']

function assertBranchMode(env) {
  if (env.MEETOPIA_DEPLOY_ENV === 'ci' && env.MEETOPIA_DISPOSABLE_DB === 'yes') {
    const configured = urlKeys.filter(key => env[key])
    if (!env.DATABASE_URL || !env.DATABASE_URL_UNPOOLED ||
        configured.some(key => !/^postgresql:\/\/postgres:postgres@(?:localhost|127\.0\.0\.1):5432\/meetopia(?:\?|$)/.test(env[key]))) {
      throw new Error('CI mode requires disposable local PostgreSQL.')
    }
    return 'ci'
  }
  if (env.MEETOPIA_DEPLOY_ENV !== 'staging' || env.MEETOPIA_STAGING_DB_PROVIDER !== 'render') {
    throw new Error('This temporary branch is Render staging only; production deployment is forbidden.')
  }
  return 'staging'
}

function assertRenderStagingDatabase(env) {
  if (assertBranchMode(env) === 'ci') return
  if (!env.DATABASE_URL || !env.DATABASE_URL_UNPOOLED) {
    throw new Error('Render staging requires both database URLs.')
  }
  for (const key of urlKeys.filter(key => env[key])) {
    let parsed
    try { parsed = new URL(env[key]) } catch { throw new Error('Invalid staging database URL: ' + key) }
    if (!['postgres:', 'postgresql:'].includes(parsed.protocol) ||
        ![approvedDb, approvedDb + '-a'].includes(parsed.hostname) ||
        parsed.pathname !== '/' + approvedDbName ||
        (parsed.port && parsed.port !== '5432') || !parsed.username || !parsed.password) {
      throw new Error('Refusing database URL outside the isolated Render staging database: ' + key)
    }
  }
}

function stageOrigin(value, kind) {
  let url
  try { url = new URL(value || '') } catch { throw new Error('Missing or invalid staging ' + kind + ' origin.') }
  const pattern = kind === 'web'
    ? /^meetopia-stage-web(?:-[a-z0-9-]+)?\.onrender\.com$/
    : /^meetopia-stage-signal(?:-[a-z0-9-]+)?\.onrender\.com$/
  if (url.protocol !== 'https:' || !pattern.test(url.hostname) || url.origin !== value) {
    throw new Error('Refusing non-staging ' + kind + ' origin.')
  }
  return url.origin
}

function assertRenderStagingWeb(env) {
  if (assertBranchMode(env) === 'ci') return
  assertRenderStagingDatabase(env)
  const web = stageOrigin(env.MEETOPIA_STAGING_WEB_URL, 'web')
  stageOrigin(env.NEXT_PUBLIC_SOCKET_URL, 'signal')
  if (env.RENDER_EXTERNAL_URL !== web || env.NEXT_PUBLIC_APP_URL !== web ||
      env.NEXT_PUBLIC_SITE_URL !== web || (env.SOCKET_AUTH_SECRET || '').length < 32) {
    throw new Error('Render staging web requires its own URLs and dedicated signing secret.')
  }
}

function assertRenderStagingSignaling(env) {
  if (assertBranchMode(env) === 'ci') return
  const web = stageOrigin(env.WEB_APP_URL, 'web')
  stageOrigin(env.RENDER_EXTERNAL_URL, 'signal')
  if (env.CORS_ORIGINS !== web || (env.SOCKET_AUTH_SECRET || '').length < 32 ||
      env.SUPABASE_URL || env.SUPABASE_SERVICE_ROLE_KEY ||
      env.RESEND_API_KEY || env.REPORT_NOTIFY_EMAIL) {
    throw new Error('Render staging signaling must not access production reports, credentials or email.')
  }
}

module.exports = { assertBranchMode, assertRenderStagingDatabase, assertRenderStagingWeb, assertRenderStagingSignaling }
