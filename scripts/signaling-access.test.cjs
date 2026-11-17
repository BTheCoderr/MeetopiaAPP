const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const { createHmac } = require('node:crypto');

process.env.SOCKET_AUTH_SECRET = 'local-regression-test-only';
function signed(payload) {
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 120000 })).toString('base64url');
  return body + '.' + createHmac('sha256', process.env.SOCKET_AUTH_SECRET).update(body).digest('base64url');
}

function harness() {
  let connect;
  let allowed = true;
  const sockets = new Map();
  class Server {
    constructor() { this.engine = { on() {} }; this.sockets = { sockets }; }
    on(name, handler) { if (name === 'connection') connect = handler; }
    use() {}
    to(id) { return { emit: (event, data) => sockets.get(id)?.emit(event, data) }; }
  }
  const root = path.join(__dirname, '..', 'server');
  const timers = new Set();
  vm.runInNewContext(fs.readFileSync(path.join(root, 'index.js'), 'utf8'), {
    require(name) {
      if (name === 'socket.io') return { Server };
      if (name === 'http') return { createServer: () => ({ listen() {} }) };
      if (name === 'cors') return () => (_req, _res, next) => next();
      if (name === './reportsStore') return { getReportBackendStatus: () => ({}) };
      if (name === './socketAuth') return require(path.join(root, 'socketAuth'));
      if (name === './activePeerRelay') return require(path.join(root, 'activePeerRelay'));
      if (name === './consentIntroductions') return require(path.join(root, 'consentIntroductions'));
      if (name === './vibeRoomSessions') return require(path.join(root, 'vibeRoomSessions'));
      if (name === './connectionAccess') return { validateConnection: async (userId, _proof, details) => allowed ? {
        connectionId: 'connection', otherUserId: userId === 'alice' ? 'bob' : 'alice',
        message: details?.messageId === 'saved' ? { id: 'saved', content: 'Saved server content', senderId: 'alice', receiverId: 'bob' } : null,
        readMessages: details?.messageIds?.includes('saved') ? [{ id: 'saved', readAt: '2026-09-29T00:00:00.000Z' }] : [],
      } : null };
      return require(name);
    },
    process, Buffer, console: { log() {}, warn() {}, error() {} },
    setTimeout(fn, ms) { const id = setTimeout(fn, ms); timers.add(id); return id; },
    clearTimeout,
  });
  function socket(id, userId, { protocol = 2 } = {}) {
    const handlers = new Map(), events = [];
    const s = { id, connected: true, handshake: { auth: { meetopiaProtocol: protocol } }, data: { userId, adultConfirmed: true, blockedUserIds: new Set(), passport: { intent: 'relationship', style: 'balanced', interests: ['music', 'travel'] } },
      on: (name, handler) => handlers.set(name, handler),
      emit: (name, payload) => events.push({ name, payload }),
      to: target => ({ emit: (name, payload) => sockets.get(target)?.emit(name, payload) }),
      events, run: (name, ...args) => handlers.get(name)(...args),
    };
    sockets.set(id, s); connect(s); return s;
  }
  return { socket, revoke: () => { allowed = false; }, close: () => timers.forEach(clearTimeout) };
}

const proof = () => signed({ type: 'connection-realtime', users: ['alice', 'bob'], connectionId: 'connection' });
const callProof = () => signed({ type: 'direct-call', callerId: 'alice', calleeId: 'bob', connectionId: 'connection' });

test('realtime messages use saved content and reject unpersisted messages', async () => {
  const h = harness();
  try {
    const a = h.socket('a', 'alice'), b = h.socket('b', 'bob');
    await a.run('connection-message-created', { proof: proof(), message: { id: 'saved', content: 'Forged content' } });
    assert.equal(b.events[0].payload.message.content, 'Saved server content');
    await a.run('connection-message-created', { proof: proof(), message: { id: 'never-saved', content: 'Forged content' } });
    assert.equal(b.events.length, 1);
  } finally { h.close(); }
});

test('revoked Connection proofs cannot relay chat, typing, reads, presence, or calls', async () => {
  const h = harness();
  try {
    const a = h.socket('a', 'alice'), b = h.socket('b', 'bob');
    const cached = proof(); h.revoke();
    await a.run('connection-message-created', { proof: cached, message: { id: 'saved' } });
    await a.run('connection-typing', { proof: cached, typing: true });
    await a.run('connection-read', { proof: cached, messageIds: ['saved'] });
    await a.run('connection-presence-query', { proofs: [cached] });
    await a.run('call-connection', { proof: callProof() });
    assert.equal(b.events.length, 0);
    assert.equal(a.events.find(e => e.name === 'connection-presence-result').payload.presence.length, 0);
    assert.ok(a.events.some(e => e.name === 'direct-call-unavailable'));
  } finally { h.close(); }
});

test('a block/removal while a call rings prevents later acceptance', async () => {
  const h = harness();
  try {
    const a = h.socket('a', 'alice'), b = h.socket('b', 'bob');
    await a.run('call-connection', { proof: callProof() });
    const invite = b.events.find(e => e.name === 'incoming-connection-call').payload;
    h.revoke(); await b.run('accept-connection-call', { inviteId: invite.inviteId });
    assert.equal(a.events.some(e => e.name === 'user-found'), false);
    assert.equal(b.events.some(e => e.name === 'user-found'), false);
  } finally { h.close(); }
});

test('authorized calls and persisted read receipts still work', async () => {
  const h = harness();
  try {
    const a = h.socket('a', 'alice'), b = h.socket('b', 'bob');
    await b.run('connection-read', { proof: proof(), messageIds: ['saved', 'forged'] });
    assert.equal(a.events[0].payload.messageIds.length, 1);
    await a.run('call-connection', { proof: callProof() });
    const invite = b.events.find(e => e.name === 'incoming-connection-call').payload;
    await b.run('accept-connection-call', { inviteId: invite.inviteId });
    assert.ok(a.events.some(e => e.name === 'user-found'));
    assert.ok(b.events.some(e => e.name === 'user-found'));
  } finally { h.close(); }
});

test('Prisma gateway requires server authentication, a valid proof, and a current unblocked Connection', async () => {
  const ts = require('typescript');
  const { NextRequest } = require('next/server');
  function loadTs(relativePath, overrides = {}) {
    const exports = {};
    const source = fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');
    vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, {
      exports, require: name => overrides[name] || require(name), Buffer, process,
    });
    return exports;
  }
  const tokens = loadTs('src/lib/socketToken.ts');
  let exists = true, blocked = false;
  const route = loadTs('src/app/api/internal/signaling/connection/route.ts', {
    '@/lib/socketToken': tokens,
    '@/lib/connectionAccess': {
      getConnectionForUser: async (id, userId) => exists && id === 'connection' && userId === 'alice'
        ? { person: { id: 'bob' } } : null,
      isBlockedBetween: async () => blocked,
    },
    '@/lib/prisma': { prisma: { message: {
      findFirst: async () => ({ id: 'saved', content: 'Database content' }),
      findMany: async () => [],
    } } },
  });
  const call = (body, authenticated = true) => route.POST(new NextRequest('https://meetopia-live.netlify.app/api/internal/signaling/connection', {
    method: 'POST', headers: { 'Content-Type': 'application/json', ...(authenticated ? { Authorization: `Bearer ${process.env.SOCKET_AUTH_SECRET}` } : {}) }, body: JSON.stringify(body),
  }));
  const body = { userId: 'alice', proof: proof(), messageId: 'saved' };
  assert.equal((await call(body, false)).status, 401);
  assert.equal((await call({ ...body, userId: 'outsider' })).status, 403);
  assert.equal((await call({ ...body, proof: 'invalid' })).status, 403);
  const success = await call(body);
  assert.equal(success.status, 200);
  assert.equal((await success.json()).message.content, 'Database content');
  blocked = true; assert.equal((await call(body)).status, 403);
  blocked = false; exists = false; assert.equal((await call(body)).status, 403);
});


test('consent introduction never authorizes WebRTC before both participants accept', () => {
  const h = harness();
  try {
    const a = h.socket('a', 'alice'), b = h.socket('b', 'bob');
    a.run('find-user'); b.run('find-user');
    const offeredA = a.events.find(e => e.name === 'introduction-offered');
    const offeredB = b.events.find(e => e.name === 'introduction-offered');
    assert.ok(offeredA); assert.ok(offeredB);
    assert.equal(offeredA.payload.invitationId, offeredB.payload.invitationId);
    assert.equal(a.events.some(e => e.name === 'user-found'), false);
    assert.equal(b.events.some(e => e.name === 'user-found'), false);
    a.run('call-user', { to: 'b', offer: { type: 'offer', sdp: 'unapproved' } });
    assert.equal(b.events.some(e => e.name === 'call-made'), false);
    a.run('introduction-response', { invitationId: offeredA.payload.invitationId, accept: true });
    assert.equal(a.events.some(e => e.name === 'user-found'), false);
    b.run('introduction-response', { invitationId: offeredA.payload.invitationId, accept: true });
    assert.ok(a.events.some(e => e.name === 'user-found'));
    assert.ok(b.events.some(e => e.name === 'user-found'));
    a.run('call-user', { to: 'b', offer: { type: 'offer', sdp: 'approved' } });
    assert.ok(b.events.some(e => e.name === 'call-made'));
  } finally { h.close(); }
});

test('decline and incompatible Chemistry Passports never authorize a peer relay', () => {
  const h = harness();
  try {
    const a = h.socket('a', 'alice'), b = h.socket('b', 'bob');
    b.data.passport = { intent: 'friendship', style: 'balanced', interests: ['music', 'travel'] };
    a.run('find-user'); b.run('find-user');
    assert.equal(a.events.some(e => e.name === 'introduction-offered'), false);
    assert.equal(b.events.some(e => e.name === 'user-found'), false);
    b.data.passport = { intent: 'relationship', style: 'balanced', interests: ['music', 'travel'] };
    b.run('find-user');
    const invite = a.events.find(e => e.name === 'introduction-offered')?.payload;
    assert.ok(invite);
    b.run('introduction-response', { invitationId: invite.invitationId, accept: false });
    assert.equal(a.events.some(e => e.name === 'user-found'), false);
    a.run('call-user', { to: 'b', offer: { type: 'offer', sdp: 'forged' } });
    assert.equal(b.events.some(e => e.name === 'call-made'), false);
  } finally { h.close(); }
});


test('Vibe is forbidden until both participants finish all three server-owned rounds', () => {
  const h = harness();
  try {
    const a = h.socket('a', 'alice'), b = h.socket('b', 'bob');
    a.run('find-user'); b.run('find-user');
    const invite = a.events.find(e => e.name === 'introduction-offered')?.payload;
    assert.ok(invite);
    a.run('introduction-response', { invitationId: invite.invitationId, accept: true });
    b.run('introduction-response', { invitationId: invite.invitationId, accept: true });
    const room = a.events.find(e => e.name === 'vibe-room-state')?.payload;
    assert.ok(room);
    assert.equal(room.round.title, 'THE SPARK');
    a.run('vibe-tap', { to: 'b' });
    assert.equal(b.events.some(e => e.name === 'vibe-received'), false);
    assert.ok(a.events.some(e => e.name === 'vibe-room-error'));

    a.run('vibe-room-next', { sessionId: room.sessionId });
    b.run('vibe-room-next', { sessionId: room.sessionId });
    a.run('vibe-room-answer', { sessionId: room.sessionId, choice: 'explore' });
    assert.equal(b.events.filter(e => e.name === 'vibe-room-state').at(-1).payload.reveal, null);
    // Cannot skip the private reveal with a forged progression.
    a.run('vibe-room-next', { sessionId: room.sessionId });
    assert.equal(a.events.filter(e => e.name === 'vibe-room-state').at(-1).payload.index, 1);
    b.run('vibe-room-answer', { sessionId: room.sessionId, choice: 'cozy' });
    a.run('vibe-room-next', { sessionId: room.sessionId });
    b.run('vibe-room-next', { sessionId: room.sessionId });
    a.run('vibe-room-next', { sessionId: room.sessionId });
    b.run('vibe-room-next', { sessionId: room.sessionId });
    const end = a.events.filter(e => e.name === 'vibe-room-state').at(-1)?.payload;
    assert.equal(end.completed, true);
    a.run('vibe-tap', { to: 'b' });
    b.run('vibe-tap', { to: 'a' });
    assert.ok(a.events.some(e => e.name === 'mutual-vibe'));
    assert.ok(b.events.some(e => e.name === 'mutual-vibe'));
  } finally { h.close(); }
});


test('new clients negotiate protocol 2 before matching; legacy clients cannot bypass consent', () => {
  const h = harness()
  try {
    const a = h.socket('a', 'alice'), b = h.socket('b', 'bob')
    const legacy = h.socket('old', 'old-user', { protocol: 1 })
    let reply
    a.run('vibe-room-hello', { version: 2 }, value => { reply = value })
    assert.equal(reply.protocol, 2)
    assert.equal(reply.status, 'ready')
    let wrongReply
    legacy.run('vibe-room-hello', { version: 2 }, value => { wrongReply = value })
    assert.equal(wrongReply.status, 'update-required')
    legacy.run('find-user')
    assert.equal(legacy.events.some(e => e.name === 'introduction-offered'), false)
    assert.equal(legacy.events.find(e => e.name === 'match-error')?.payload.code, 'CLIENT_UPDATE_REQUIRED')
    // A legacy client cannot be paired even by a newer compatible partner.
    a.run('find-user')
    assert.equal(a.events.some(e => e.name === 'introduction-offered'), false)
    // A newer client can only enter an invitation, not a media pair, before both agree.
    b.run('find-user')
    const offer = a.events.find(e => e.name === 'introduction-offered')?.payload
    assert.ok(offer)
    assert.equal(a.events.some(e => e.name === 'user-found'), false)
    a.run('introduction-response', { invitationId: offer.invitationId, accept: true })
    b.run('introduction-response', { invitationId: offer.invitationId, accept: true })
    assert.ok(a.events.some(e => e.name === 'user-found'))
    assert.ok(b.events.some(e => e.name === 'user-found'))
  } finally { h.close() }
})

test('legacy Connection calls remain authorized while old random matching is rejected', async () => {
  const h = harness()
  try {
    const a = h.socket('a', 'alice', { protocol: 1 })
    const b = h.socket('b', 'bob')
    a.run('find-user')
    assert.equal(a.events.some(e => e.name === 'introduction-offered'), false)
    await a.run('call-connection', { proof: callProof() })
    const invite = b.events.find(e => e.name === 'incoming-connection-call')?.payload
    assert.ok(invite)
    await b.run('accept-connection-call', { inviteId: invite.inviteId })
    assert.ok(a.events.some(e => e.name === 'user-found'))
    assert.ok(b.events.some(e => e.name === 'user-found'))
  } finally { h.close() }
})

test('skipping an active Vibe Room notifies the partner and revokes old room', () => {
  const h = harness()
  try {
    const a = h.socket('a', 'alice'), b = h.socket('b', 'bob')
    a.run('find-user'); b.run('find-user')
    const offer = a.events.find(e => e.name === 'introduction-offered')?.payload
    a.run('introduction-response', { invitationId: offer.invitationId, accept: true })
    b.run('introduction-response', { invitationId: offer.invitationId, accept: true })
    const oldRoom = a.events.find(e => e.name === 'vibe-room-state')?.payload
    assert.ok(oldRoom)
    a.run('find-next-user')
    assert.equal(b.events.some(e => e.name === 'peer-left'), true)
    assert.equal(b.events.some(e => e.name === 'vibe-room-ended'), true)
    const before = b.events.filter(e => e.name === 'vibe-room-state').length
    b.run('vibe-room-next', { sessionId: oldRoom.sessionId })
    assert.equal(b.events.filter(e => e.name === 'vibe-room-state').length, before)
    assert.equal(b.events.some(e => e.name === 'mutual-vibe'), false)
  } finally { h.close() }
})
