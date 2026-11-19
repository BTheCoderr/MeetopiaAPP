'use strict'

// Real HTTP + Socket.IO integration in GitHub Actions, backed by a disposable
// PostgreSQL 16 service. NEVER run against an external database or production.
const assert = require('node:assert/strict')
const { randomUUID } = require('node:crypto')
const { PrismaClient } = require('@prisma/client')
const { io } = require('socket.io-client')

const dbUrl = process.env.DATABASE_URL || ''
if (process.env.MEETOPIA_DISPOSABLE_DB !== 'yes' ||
    !/^postgresql:\/\/postgres:postgres@(?:localhost|127\.0\.0\.1):5432\/meetopia(?:\?|$)/.test(dbUrl)) {
  throw new Error('Full-stack test refuses non-disposable databases.')
}
const API = 'http://127.0.0.1:3100'
const SIGNAL = 'http://127.0.0.1:3103'
const SECRET_KEY = process.env.SOCKET_AUTH_SECRET || ''
if (SECRET_KEY.length < 32 || process.env.MEETOPIA_DEPLOY_ENV !== 'ci') {
  throw new Error('Use an isolated CI signing key/environment only.')
}
const prisma = new PrismaClient()
const sockets = []
const createdUsers = []
const TIMEOUT = 15000

async function eventually(check, label, limitMs = 60000) {
  const started = Date.now()
  let lastError
  while (Date.now() - started < limitMs) {
    try {
      const result = await check()
      if (result) return result
    } catch (e) { lastError = e }
    await new Promise(resolve => setTimeout(resolve, 650))
  }
  throw new Error(`Timed out waiting for ${label}: ${lastError?.message || 'no response'}`)
}

function nextEvent(socket, name, predicate = () => true, timeout = TIMEOUT) {
  return new Promise((resolve, reject) => {
    let timer
    const cleanup = () => { clearTimeout(timer); socket.off(name, handler) }
    const handler = payload => { if (predicate(payload)) { cleanup(); resolve(payload) } }
    timer = setTimeout(() => { cleanup(); reject(new Error(`Timed out: ${name}`)) }, timeout)
    socket.on(name, handler)
  })
}
async function api(path, cookie, method = 'GET', body) {
  const response = await fetch(API + path, {
    method,
    headers: { Cookie: `meetopia_session=${cookie}`, Accept: 'application/json', ...(body ? { 'Content-Type': 'application/json' } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  const data = await response.json().catch(() => ({}))
  assert.equal(response.ok, true, `${method} ${path} returned ${response.status}: ${JSON.stringify(data)}`)
  return data
}
async function makeUser(suffix) {
  const username = `ci-co-create-${suffix}-${randomUUID().slice(0, 6)}`
  const user = await prisma.user.create({
    data: {
      email: `${username}@example.invalid`,
      username,
      password: 'ci-only-unusable-password',
      adultConfirmedAt: new Date(),
      chemistryIntent: 'relationship',
      chemistryStyle: 'balanced',
      chemistryInterests: ['music', 'travel'],
    },
  })
  createdUsers.push(user.id)
  const cookie = randomUUID().replaceAll('-', '') + randomUUID().replaceAll('-', '')
  await prisma.session.create({
    data: { id: cookie, userId: user.id, token: randomUUID(), expiresAt: new Date(Date.now() + 3600000) },
  })
  return { id: user.id, cookie }
}
async function connect(user) {
  const { token } = await api('/api/auth/socket-token', user.cookie)
  assert.ok(token)
  const socket = io(SIGNAL, {
    autoConnect: false,
    transports: ['websocket'],
    auth: { token, meetopiaProtocol: 3 },
    timeout: TIMEOUT,
    reconnection: false,
  })
  sockets.push(socket)
  const connected = nextEvent(socket, 'connect')
  socket.connect()
  await connected
  const hello = await socket.timeout(5000).emitWithAck('vibe-room-hello', { version: 3, token })
  assert.deepEqual(hello, { protocol: 3, status: 'ready' })
  return socket
}

async function test() {
  await eventually(async () => {
    const health = await fetch(SIGNAL + '/health').then(r => r.json())
    assert.equal(health.ok, true)
    assert.equal(health.protocol, 3)
    const response = await fetch(API + '/')
    return response.ok
  }, 'temporary Next.js and Socket.IO services')

  const a = await makeUser('a')
  const b = await makeUser('b')
  const sa = await connect(a)
  const sb = await connect(b)
  const offeredA = nextEvent(sa, 'introduction-offered')
  const offeredB = nextEvent(sb, 'introduction-offered')
  sa.emit('find-user', { themeId: 'music-memories' })
  sb.emit('find-user', { themeId: 'music-memories' })
  const [inviteA, inviteB] = await Promise.all([offeredA, offeredB])
  assert.equal(inviteA.themeId, 'music-memories')
  assert.equal(inviteA.invitationId, inviteB.invitationId)
  assert.deepEqual(inviteA.person.sharedInterests, ['music', 'travel'])
  // Verify no media authorization is granted before BOTH accept.
  const pairA = nextEvent(sa, 'user-found')
  const pairB = nextEvent(sb, 'user-found')
  const initialA = nextEvent(sa, 'vibe-room-state', x => x.index === 0)
  const initialB = nextEvent(sb, 'vibe-room-state', x => x.index === 0)
  sa.emit('introduction-response', { invitationId: inviteA.invitationId, accept: true })
  await new Promise(resolve => setTimeout(resolve, 100))
  sb.emit('introduction-response', { invitationId: inviteB.invitationId, accept: true })
  const [, , firstRoundA] = await Promise.all([pairA, pairB, initialA, initialB])

  let stateA, stateB
  const goRound = async nextIndex => {
    const aUpdate = nextEvent(sa, 'vibe-room-state', x => x.index === nextIndex)
    const bUpdate = nextEvent(sb, 'vibe-room-state', x => x.index === nextIndex)
    sa.emit('vibe-room-next', { sessionId: roomId })
    sb.emit('vibe-room-next', { sessionId: inviteA.sessionId || roomId })
    return Promise.all([aUpdate, bUpdate])
  }
  const firstState = await api('/api/chemistry/passport', a.cookie)
  assert.equal(firstState.complete, true)

  // Both members synchronize the Spark -> Curveball transition.
  const roomId = firstRoundA.sessionId
  // roomId above is bound to the first server state, not a client-generated UUID.
  ;[stateA, stateB] = await goRound(1)
  assert.equal(stateA.round.title, 'THE CURVEBALL')
  assert.equal(stateB.round.title, 'THE CURVEBALL')

  const privateStateB = nextEvent(sb, 'vibe-room-state', x => x.index === 1 && x.waitingForAnswer === false)
  sa.emit('vibe-room-answer', { sessionId: roomId, choice: 'explore' })
  const hidden = await privateStateB
  assert.equal(hidden.reveal, null)
  assert.equal(hidden.myChoice, null)

  const revealA = nextEvent(sa, 'vibe-room-state', x => x.revealed === true)
  const revealB = nextEvent(sb, 'vibe-room-state', x => x.revealed === true)
  sb.emit('vibe-room-answer', { sessionId: roomId, choice: 'cozy' })
  ;[stateA, stateB] = await Promise.all([revealA, revealB])
  assert.equal(stateA.reveal[0].choice, 'explore')
  assert.equal(stateB.reveal[0].choice, 'cozy')
  ;[stateA, stateB] = await goRound(2)
  assert.equal(stateA.round.title, 'THE REAL TALK')
  ;[stateA, stateB] = await goRound(3)
  assert.equal(stateA.round.title, 'THE BRIDGE')
  const aIsActivity = stateA.bridge.role === 'activity'
  const aChoice = aIsActivity ? 'live-music' : 'cafe'
  const bChoice = aIsActivity ? 'cafe' : 'live-music'

  const partialB = nextEvent(sb, 'vibe-room-state', x => x.index === 3 && x.bridge?.proposal === null && x.bridge?.myChoice === null)
  sa.emit('vibe-room-contribute', { sessionId: roomId, choice: aChoice })
  const noLeak = await partialB
  assert.equal(noLeak.bridge.proposal, null)
  const proposalA = nextEvent(sa, 'vibe-room-state', x => x.bridge?.proposal)
  const proposalB = nextEvent(sb, 'vibe-room-state', x => x.bridge?.proposal)
  sb.emit('vibe-room-contribute', { sessionId: roomId, choice: bChoice })
  ;[stateA, stateB] = await Promise.all([proposalA, proposalB])
  assert.deepEqual(stateA.bridge.proposal, { activity: 'live-music', setting: 'cafe' })
  const revision = stateA.bridge.revision
  const approvedA = nextEvent(sa, 'vibe-room-state', x => x.bridge?.approved === true)
  sa.emit('vibe-room-approve', { sessionId: roomId, revision, share: true })
  await approvedA
  // Second and final joint approval should unlock Vibe on both clients.
  const completedA = nextEvent(sa, 'vibe-room-state', x => x.completed === true)
  const completedB = nextEvent(sb, 'vibe-room-state', x => x.completed === true)
  sb.emit('vibe-room-approve', { sessionId: roomId, revision, share: true })
  ;[stateA, stateB] = await Promise.all([completedA, completedB])
  assert.equal(stateA.finalCreation.activity, 'live-music')
  assert.equal(stateA.finalCreation.setting, 'cafe')
  assert.deepEqual(stateA.finalCreation, stateB.finalCreation)

  const mutualA = nextEvent(sa, 'mutual-vibe')
  const mutualB = nextEvent(sb, 'mutual-vibe')
  sa.emit('vibe-tap', { to: sb.id })
  sb.emit('vibe-tap', { to: sa.id })
  const [mA, mB] = await Promise.all([mutualA, mutualB])
  assert.equal(mA.connectionProof, mB.connectionProof)
  assert.ok(mA.connectionProof)
  const saved = await api('/api/connections', a.cookie, 'POST', { connectionProof: mA.connectionProof })
  const connectionId = saved.connection.id
  assert.ok(connectionId)
  const creationA = await api(`/api/connections/${connectionId}/creation`, a.cookie)
  const creationB = await api(`/api/connections/${connectionId}/creation`, b.cookie)
  assert.equal(creationA.labels.activity, 'Find a small live-music show')
  assert.deepEqual(creationA.creation, creationB.creation)
  await api(`/api/connections/${connectionId}/creation`, b.cookie, 'DELETE')
  const removed = await api(`/api/connections/${connectionId}/creation`, a.cookie)
  assert.equal(removed.creation, null)
  console.log('PASS: live HTTP + real Socket.IO + disposable Prisma Co-Create E2E.')
}

async function run() {
  try { await test() }
  finally {
    for (const socket of sockets) socket.disconnect()
    if (createdUsers.length) {
      // Historic Meetopia migrations contain NO ACTION foreign keys for some
      // relations despite newer Prisma schema annotations. Delete test records
      // explicitly in child-first order instead of assuming cascades.
      await prisma.session.deleteMany({ where: { userId: { in: createdUsers } } })
      const connectionIds = (await prisma.connection.findMany({
        where: { OR: [{ userAId: { in: createdUsers } }, { userBId: { in: createdUsers } }] },
        select: { id: true },
      })).map(item => item.id)
      if (connectionIds.length) {
        await prisma.sharedCreation.deleteMany({ where: { connectionId: { in: connectionIds } } })
        await prisma.encore.deleteMany({ where: { connectionId: { in: connectionIds } } })
        await prisma.connection.deleteMany({ where: { id: { in: connectionIds } } })
      }
      await prisma.vibe.deleteMany({
        where: { OR: [{ senderId: { in: createdUsers } }, { receiverId: { in: createdUsers } }] },
      })
      await prisma.user.deleteMany({ where: { id: { in: createdUsers } } })
    }
    await prisma.$disconnect()
  }
}
run().catch(err => { console.error(err); process.exitCode = 1 })
