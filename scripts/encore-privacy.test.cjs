'use strict'

const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')

const root = path.join(__dirname, '..')
function load(relativePath, overrides = {}) {
  const exports = {}
  const source = fs.readFileSync(path.join(root, relativePath), 'utf8')
  const js = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  vm.runInNewContext(js, {
    exports, Buffer, process,
    console: { error() {}, log() {} },
    require: name => Object.hasOwn(overrides, name) ? overrides[name] : require(name),
  }, { filename: relativePath })
  return exports
}

const encore = load('src/lib/encore.ts')

test('no Spark Card is disclosed unless both participants explicitly share valid options', () => {
  const record = {
    userAChoice: 'coffee-chat', userBChoice: null,
    userAShared: true, userBShared: false,
  }
  const bBefore = encore.encoreView(record, false)
  assert.equal(bBefore.card, null)
  assert.equal(bBefore.mine, null)
  assert.equal(bBefore.status, 'not-started')
  assert.equal(JSON.stringify(bBefore).includes('coffee-chat'), false)
  assert.equal(encore.encoreView(record, true).status, 'waiting')
  record.userBChoice = 'playlist-swap'
  record.userBShared = true
  const aAfter = encore.encoreView(record, true)
  const bAfter = encore.encoreView(record, false)
  assert.equal(aAfter.status, 'shared')
  assert.equal(aAfter.card.theirs, 'playlist-swap')
  assert.equal(bAfter.card.theirs, 'coffee-chat')
  record.userAShared = false
  record.userAChoice = null
  assert.equal(encore.encoreView(record, false).card, null)
  assert.equal(encore.isEncoreChoice('forged-choice'), false)
})

test('API isolates strangers, blocked users and unshared Encore choices', async () => {
  let record = null
  let blocked = false
  const prisma = {
    encore: {
      findUnique: async () => record && { ...record },
      upsert: async ({ create, update }) => {
        record = record
          ? { ...record, ...update }
          : { userAChoice: null, userBChoice: null, userAShared: false, userBShared: false, ...create }
        return { ...record }
      },
      updateMany: async ({ data }) => {
        if (record) record = { ...record, ...data }
        return { count: record ? 1 : 0 }
      },
    },
  }
  const access = {
    currentUserId: async request => request.headers.get('x-test-account'),
    getConnectionForUser: async (connectionId, userId) => {
      if (connectionId !== 'valid' || !['a', 'b'].includes(userId)) return null
      return { connection: { userAId: 'a', userBId: 'b' }, person: { id: userId === 'a' ? 'b' : 'a' } }
    },
    isBlockedBetween: async () => blocked,
  }
  const Response = {
    json: (payload, options = {}) => ({
      status: options.status ?? 200,
      json: async () => payload,
    }),
  }
  const route = load('src/app/api/connections/[connectionId]/encore/route.ts', {
    'next/server': { NextResponse: Response },
    '@/lib/prisma': { prisma },
    '@/lib/connectionAccess': access,
    '@/lib/encore': encore,
  })
  const request = (userId, body) => ({
    headers: new Headers(userId ? { 'x-test-account': userId } : {}),
    json: async () => body,
  })
  const context = { params: Promise.resolve({ connectionId: 'valid' }) }
  const choose = (choice, share = true) => ({ choice, share })
  assert.equal((await route.GET(request(null), context)).status, 401)
  assert.equal((await route.GET(request('outsider'), context)).status, 404)
  assert.equal((await route.PUT(request('a', choose('fake')), context)).status, 400)
  assert.equal((await route.PUT(request('a', choose('coffee-chat', false)), context)).status, 400)

  const aShare = await route.PUT(request('a', choose('coffee-chat')), context)
  assert.equal(aShare.status, 200)
  assert.equal((await aShare.json()).status, 'waiting')
  const bBefore = await (await route.GET(request('b'), context)).json()
  assert.equal(bBefore.card, null)
  assert.equal(bBefore.mine, null)
  assert.equal(JSON.stringify(bBefore).includes('coffee-chat'), false)

  const bShare = await route.PUT(request('b', choose('playlist-swap')), context)
  const after = await bShare.json()
  assert.equal(after.status, 'shared')
  assert.equal(after.card.theirs, 'coffee-chat')

  blocked = true
  assert.equal((await route.GET(request('a'), context)).status, 403)
  assert.equal((await route.PUT(request('b', choose('game-night')), context)).status, 403)
  blocked = false

  const revoked = await (await route.DELETE(request('a'), context)).json()
  assert.equal(revoked.card, null)
  const bLater = await (await route.GET(request('b'), context)).json()
  assert.equal(bLater.card, null)
  assert.equal(JSON.stringify(bLater).includes('coffee-chat'), false)
})
