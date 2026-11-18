'use strict'
const assert = require('node:assert/strict')
const { test } = require('node:test')
const ts = require('typescript')
const fs = require('node:fs')
const vm = require('node:vm')
const path = require('node:path')
const source=fs.readFileSync(path.join(__dirname,'..','src/lib/stagingConfig.ts'),'utf8')
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText
const moduleExports={}
vm.runInNewContext(compiled,{exports:moduleExports,URL,console,process}, { filename:'stagingConfig.js' })
const { assertStagingConfig }=moduleExports
const ref='abcdefghijklmnopqrst'
const base={
  MEETOPIA_DEPLOY_ENV:'staging',
  MEETOPIA_STAGING_DB_REF:ref,
  MEETOPIA_STAGING_WEB_URL:'https://meetopia-staging.netlify.app',
  NEXT_PUBLIC_SOCKET_URL:'https://meetopia-staging-signaling.onrender.com',
  DATABASE_URL:`postgresql://postgres.${ref}:fake@aws-0-us-east-2.pooler.supabase.com:6543/postgres`,
  DATABASE_URL_UNPOOLED:`postgresql://postgres:fake@db.${ref}.supabase.co:5432/postgres`,
}
const check=env=>assertStagingConfig(env)
test('a separate staging DB and separate HTTPS web/socket endpoints pass',()=>assert.equal(check(base),undefined))
test('live database is rejected even when another URL is staging',()=>{
  assert.throws(()=>check({...base,MEETOPIA_DATABASE_URL:'postgresql://postgres:fake@db.irdacfchqzbbfvwclinh.supabase.co:5432/postgres'}),/approved isolated/)
  assert.throws(()=>check({...base,DATABASE_URL:'postgresql://postgres:fake@db.irdacfchqzbbfvwclinh.supabase.co:5432/postgres'}),/approved isolated/)
})
test('missing staging ref and missing database reject build',()=>{
  assert.throws(()=>check({...base,MEETOPIA_STAGING_DB_REF:undefined}),/separate Supabase/)
  assert.throws(()=>check({...base,DATABASE_URL:undefined,DATABASE_URL_UNPOOLED:undefined}),/dedicated DATABASE_URL/)
})
test('production signaling and production web domains are rejected',()=>{
  assert.throws(()=>check({...base,NEXT_PUBLIC_SOCKET_URL:'https://meetopia-signaling-v2.onrender.com'}),/distinct HTTPS/)
  assert.throws(()=>check({...base,MEETOPIA_STAGING_WEB_URL:'https://meetopia-live.netlify.app'}),/distinct HTTPS/)
})
test('non-staging/CI production builds continue unchanged',()=>{
  assert.equal(check({MEETOPIA_DEPLOY_ENV:'ci'}),undefined)
  assert.equal(check({MEETOPIA_DEPLOY_ENV:undefined}),undefined)
})
