'use strict'
const { test } = require('node:test')
const assert = require('node:assert/strict')
const { assertBranchMode, assertRenderStagingDatabase, assertRenderStagingWeb, assertRenderStagingSignaling } = require('./render-staging-guard.cjs')
const db = 'postgresql://stage:fake@dpg-dc2ssq40916s73b2dgg0-a:5432/meetopia_staging_db'
const base = { MEETOPIA_DEPLOY_ENV: 'staging', MEETOPIA_STAGING_DB_PROVIDER: 'render',
  DATABASE_URL: db, DATABASE_URL_UNPOOLED: db,
  SOCKET_AUTH_SECRET: 'x'.repeat(40) }
const web = 'https://meetopia-stage-web-test.onrender.com'
const signaling = 'https://meetopia-stage-signal-test.onrender.com'
const webEnv = { ...base, MEETOPIA_STAGING_WEB_URL: web, NEXT_PUBLIC_APP_URL: web,
  NEXT_PUBLIC_SITE_URL: web, NEXT_PUBLIC_SOCKET_URL: signaling, RENDER_EXTERNAL_URL: web }
test('only the dedicated database and hosts are accepted', () => {
  assert.doesNotThrow(() => assertRenderStagingWeb(webEnv))
  assert.doesNotThrow(() => assertRenderStagingSignaling({ ...base, WEB_APP_URL: web, CORS_ORIGINS: web, RENDER_EXTERNAL_URL: signaling }))
  assert.throws(() => assertRenderStagingDatabase({ ...base, MEETOPIA_DATABASE_URL: 'postgresql://postgres:fake@db.irdacfchqzbbfvwclinh.supabase.co/postgres' }))
  assert.throws(() => assertRenderStagingDatabase({ ...base, DATABASE_URL_UNPOOLED: db.replace('meetopia_staging_db', 'postgres') }))
  assert.throws(() => assertRenderStagingWeb({ ...webEnv, NEXT_PUBLIC_SOCKET_URL: 'https://meetopia-signaling-v2.onrender.com' }))
  assert.throws(() => assertRenderStagingSignaling({ ...base, WEB_APP_URL: web, CORS_ORIGINS: web + ',https://meetopia-live.netlify.app', RENDER_EXTERNAL_URL: signaling }))
  assert.throws(() => assertRenderStagingSignaling({ ...base, WEB_APP_URL: web, CORS_ORIGINS: web, RENDER_EXTERNAL_URL: signaling, SUPABASE_URL: 'https://example.supabase.co' }))
  assert.throws(() => assertBranchMode({}))
})
test('CI exception is restricted to its disposable local database', () => {
  const local = 'postgresql://postgres:postgres@127.0.0.1:5432/meetopia'
  const ci = { MEETOPIA_DEPLOY_ENV: 'ci', MEETOPIA_DISPOSABLE_DB: 'yes', DATABASE_URL: local, DATABASE_URL_UNPOOLED: local }
  assert.equal(assertBranchMode(ci), 'ci')
  assert.throws(() => assertBranchMode({ ...ci, DATABASE_URL: db }))
})
