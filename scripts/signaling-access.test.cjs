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
  function socket(id, userId) {
    const handlers = new Map(), events = [];
    const s = { id, connected: true, data: { userId, adultConfirmed: true, blockedUserIds: new Set() },
      on: (name, handler) => handlers.set(name, handler),
      emit: (name, payload) => events.push({ name, payload }),
      to: target => ({ emit: (name, payload) => sockets.get(target)?.emit(name, payload) }),
      events, run: (name, payload) => handlers.get(name)(payload),
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
