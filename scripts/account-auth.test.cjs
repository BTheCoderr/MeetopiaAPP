const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

test('native Authorization Bearer tokens are parsed and cookies stay httpOnly for web', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'src/lib/auth/session.ts'), 'utf8')
  assert.match(source, /\^Bearer\\s\+\(\\S\+\)/)
  assert.match(source, /x-meetopia-client/)
  assert.match(source, /getSessionByToken/)
  const signin = fs.readFileSync(path.join(__dirname, '..', 'src/app/api/auth/signin/route.ts'), 'utf8')
  const signup = fs.readFileSync(path.join(__dirname, '..', 'src/app/api/auth/signup/route.ts'), 'utf8')
  assert.match(signin, /nativeSessionToken: session\.token/)
  assert.match(signup, /nativeSessionToken: session\.token/)
  assert.match(signin, /httpOnly: true/)
  assert.match(signup, /httpOnly: true/)

  function parseBearerToken(authorization) {
    if (!authorization) return null
    const match = authorization.match(/^Bearer\s+(\S+)/i)
    return match?.[1] ?? null
  }
  assert.equal(parseBearerToken('Bearer abc.def'), 'abc.def')
  assert.equal(parseBearerToken('bearer token-only'), 'token-only')
  assert.equal(parseBearerToken('Basic nope'), null)
  assert.equal(parseBearerToken(null), null)
})

test('account deletion removes associated records before deleting the user', () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'src/lib/auth/deleteAccount.ts'), 'utf8')
  const order = [
    'message.deleteMany',
    'report.deleteMany',
    'feedback.deleteMany',
    'friends: { set: [] }',
    'user.delete',
  ]
  let last = -1
  for (const token of order) {
    const idx = src.indexOf(token)
    assert.ok(idx > last, `missing or out of order: ${token}`)
    last = idx
  }
  const route = fs.readFileSync(path.join(__dirname, '..', 'src/app/api/auth/account/route.ts'), 'utf8')
  assert.match(route, /getRequestSession/)
  assert.match(route, /bcrypt\.compare/)
  assert.match(route, /confirm/)
})
