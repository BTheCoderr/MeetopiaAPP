const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { randomUUID } = require('crypto');
const { saveReport, readRecentReports, sessionIdFor, getReportBackendStatus } = require('./reportsStore');
const { verifySocketToken, createConnectionProof, verifyDirectCallProof } = require('./socketAuth');

const normalizeOrigin = (origin) =>
  origin ? origin.trim().replace(/^["']|["']$/g, '').replace(/\/$/, '') : origin;

const productionOrigins = [
  'https://meetopia-live.netlify.app',
];

const configuredOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3003'];

const allowedOrigins = [...new Set([...configuredOrigins, ...productionOrigins])]
  .map(normalizeOrigin)
  .filter(Boolean);

const isMeetopiaPreviewOrigin = (origin) =>
  typeof origin === 'string' &&
  /^https:\/\/deploy-preview-\d+--meetopia-live\.netlify\.app$/.test(origin);

const corsOriginCheck = (origin, callback) => {
  const normalizedOrigin = normalizeOrigin(origin);
  const isMeetopiaPreview = isMeetopiaPreviewOrigin(normalizedOrigin);

  if (!normalizedOrigin || allowedOrigins.includes(normalizedOrigin) || isMeetopiaPreview) {
    console.log('[CORS] Allowed origin:', normalizedOrigin || '(no origin)');
    return callback(null, true);
  }

  console.warn('[CORS] Blocked origin:', normalizedOrigin);
  console.warn('[CORS] Allowed origins:', allowedOrigins);
  return callback(new Error('Not allowed by CORS'));
};

const app = express();
app.use(cors({ origin: corsOriginCheck, credentials: true }));

app.get('/health', (req, res) => {
  res.json({
    ok: true,
    nodeEnv: process.env.NODE_ENV,
    allowedOrigins,
    reports: getReportBackendStatus(),
  });
});

app.get('/admin/reports', async (req, res) => {
  const token = process.env.REPORT_ADMIN_TOKEN;
  if (!token || req.query.token !== token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
  try {
    const reports = await readRecentReports(limit);
    return res.json({ reports, backend: getReportBackendStatus() });
  } catch (err) {
    console.error('[Reports] admin fetch failed', err);
    return res.status(500).json({ error: 'Failed to load reports' });
  }
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: corsOriginCheck,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Ensure ACAO on Engine.io polling/WebSocket handshake responses (not always set by callback alone).
io.engine.on('headers', (headers, req) => {
  const normalizedOrigin = normalizeOrigin(req.headers.origin);
  const isMeetopiaPreview = isMeetopiaPreviewOrigin(normalizedOrigin);
  if (normalizedOrigin && (allowedOrigins.includes(normalizedOrigin) || isMeetopiaPreview)) {
    headers['Access-Control-Allow-Origin'] = normalizedOrigin;
    headers['Access-Control-Allow-Credentials'] = 'true';
    console.log('[CORS] Engine headers for origin:', normalizedOrigin);
  } else if (!normalizedOrigin) {
    console.log('[CORS] Engine headers (no origin)');
  } else {
    console.warn('[CORS] Engine headers blocked:', normalizedOrigin);
    console.warn('[CORS] Allowed origins:', allowedOrigins);
  }
});

const waitingUsers = new Set();
// Active 1:1 video chat pairs for /chat/video random matching (socketId -> partnerId)
const activePairs = new Map();
const vibeTargets = new Map();
const activeDatingSocketsByUser = new Map();
const pendingConnectionCalls = new Map();
const pendingCallByCallerSocket = new Map();
const CONNECTION_CALL_TTL_MS = 30 * 1000;
// Keep a short-lived memory of recent peers so "Next" does not immediately rematch the same two people.
const recentPeers = new Map();
const RECENT_PEER_TTL_MS = 10 * 60 * 1000;

function rememberRecentPeer(userId, peerId) {
  const peers = recentPeers.get(userId) || new Map();
  peers.set(peerId, Date.now());
  recentPeers.set(userId, peers);
}

function hasRecentPeer(userId, peerId) {
  const peers = recentPeers.get(userId);
  if (!peers) return false;

  const matchedAt = peers.get(peerId);
  if (!matchedAt) return false;

  if (Date.now() - matchedAt > RECENT_PEER_TTL_MS) {
    peers.delete(peerId);
    if (peers.size === 0) recentPeers.delete(userId);
    return false;
  }

  return true;
}

function isBlockedBetween(socketIdA, socketIdB) {
  const socketA = io.sockets.sockets.get(socketIdA);
  const socketB = io.sockets.sockets.get(socketIdB);
  if (!socketA || !socketB) return false;

  const userA = socketA.data.userId;
  const userB = socketB.data.userId;
  if (!userA || !userB) return false;

  return socketA.data.blockedUserIds?.has(userB) || socketB.data.blockedUserIds?.has(userA);
}

function canPair(userIdA, userIdB) {
  return (
    !hasRecentPeer(userIdA, userIdB) &&
    !hasRecentPeer(userIdB, userIdA) &&
    !isBlockedBetween(userIdA, userIdB)
  );
}

function pairUsers(userIdA, userIdB) {
  vibeTargets.delete(userIdA);
  vibeTargets.delete(userIdB);
  activePairs.set(userIdA, userIdB);
  activePairs.set(userIdB, userIdA);
  rememberRecentPeer(userIdA, userIdB);
  rememberRecentPeer(userIdB, userIdA);
  console.log(`[Signaling] paired ${userIdA} <-> ${userIdB}`);
}

function clearActivePair(socketId, notifyPeer = true) {
  const peerId = activePairs.get(socketId);
  if (!peerId) return null;
  activePairs.delete(socketId);
  activePairs.delete(peerId);
  vibeTargets.delete(socketId);
  vibeTargets.delete(peerId);
  if (notifyPeer) {
    io.to(peerId).emit('peer-left');
    console.log(`[Signaling] peer-left: ${socketId} -> notified ${peerId}`);
  }
  return peerId;
}

function removeFromMatchQueues(socketId) {
  waitingUsers.delete(socketId);
}

function clearPendingConnectionCall(inviteId, callerEvent, targetEvent) {
  const invite = pendingConnectionCalls.get(inviteId);
  if (!invite) return null;

  pendingConnectionCalls.delete(inviteId);
  if (pendingCallByCallerSocket.get(invite.callerSocketId) === inviteId) {
    pendingCallByCallerSocket.delete(invite.callerSocketId);
  }
  if (invite.timeout) clearTimeout(invite.timeout);

  const callerSocket = io.sockets.sockets.get(invite.callerSocketId);
  if (callerEvent && callerSocket) {
    callerSocket.emit(callerEvent, {
      inviteId,
      connectionId: invite.connectionId,
      calleeUserId: invite.calleeUserId,
    });
  }

  const targetSocketId = activeDatingSocketsByUser.get(invite.calleeUserId);
  const targetSocket = targetSocketId ? io.sockets.sockets.get(targetSocketId) : null;
  if (targetEvent && targetSocket) {
    targetSocket.emit(targetEvent, {
      inviteId,
      connectionId: invite.connectionId,
      callerUserId: invite.callerUserId,
    });
  }

  return invite;
}

function cancelPendingCallFromCaller(socketId) {
  const inviteId = pendingCallByCallerSocket.get(socketId);
  if (!inviteId) return false;
  clearPendingConnectionCall(inviteId, null, 'connection-call-cancelled');
  return true;
}

function leaveCurrentRoom(socket, { notifyVideoPeer = false } = {}) {
  clearActivePair(socket.id, notifyVideoPeer);
  removeFromMatchQueues(socket.id);
}

function runFindUser(socket) {
  if (activePairs.has(socket.id)) {
    console.log(`User ${socket.id} already paired, skipping match queue`);
    return;
  }

  if (!socket.data.userId) {
    removeFromMatchQueues(socket.id);
    socket.emit('match-error', {
      code: 'AUTH_REQUIRED',
      message: 'Sign in before starting a Chemistry Check.',
    });
    return;
  }

  if (!socket.data.adultConfirmed) {
    removeFromMatchQueues(socket.id);
    socket.emit('match-error', {
      code: 'ADULT_CONFIRMATION_REQUIRED',
      message: 'Confirm you are 18 or older before starting a Chemistry Check.',
    });
    return;
  }

  if (waitingUsers.size > 0) {
    const partnerId = [...waitingUsers].find(
      (id) => id !== socket.id && !activePairs.has(id) && canPair(socket.id, id)
    );

    if (partnerId) {
      const partnerSocket = io.sockets.sockets.get(partnerId);
      waitingUsers.delete(partnerId);

      socket.emit('user-found', {
        partnerId,
        partnerUserId: partnerSocket?.data.userId || null,
      });
      io.to(partnerId).emit('user-found', {
        partnerId: socket.id,
        partnerUserId: socket.data.userId,
      });

      pairUsers(socket.id, partnerId);
      console.log(`[Signaling] Chemistry Check matched: ${socket.id} <-> ${partnerId}`);
      return;
    }
  }

  waitingUsers.add(socket.id);
  console.log(`User ${socket.id} is waiting for a Chemistry Check`);
}

io.use((socket, next) => {
  const payload = verifySocketToken(socket.handshake.auth?.token);
  if (!payload) {
    console.warn('[Auth] Rejected unauthenticated signaling connection');
    return next(new Error('AUTH_REQUIRED'));
  }

  socket.data.userId = payload.sub;
  socket.data.displayName = payload.displayName || null;
  socket.data.adultConfirmed = payload.adultConfirmed === true;
  socket.data.blockedUserIds = new Set(Array.isArray(payload.blocked) ? payload.blocked : []);
  next();
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  if (socket.data.userId) {
    activeDatingSocketsByUser.set(socket.data.userId, socket.id);
  }

  socket.on('find-user', () => {
    if (activePairs.has(socket.id)) {
      console.log(`User ${socket.id} already paired, ignoring duplicate find-user`);
      return;
    }
    leaveCurrentRoom(socket, { notifyVideoPeer: false });
    runFindUser(socket);
  });

  socket.on('call-connection', ({ proof } = {}) => {
    const payload = verifyDirectCallProof(proof);
    if (!payload || payload.callerId !== socket.data.userId) {
      socket.emit('direct-call-unavailable', {
        message: 'This call invitation is invalid or has expired.',
      });
      return;
    }

    if (!socket.data.adultConfirmed) {
      socket.emit('match-error', {
        code: 'ADULT_CONFIRMATION_REQUIRED',
        message: 'Confirm you are 18 or older before starting a call.',
      });
      return;
    }

    const targetSocketId = activeDatingSocketsByUser.get(payload.calleeId);
    const targetSocket = targetSocketId ? io.sockets.sockets.get(targetSocketId) : null;

    if (
      !targetSocket ||
      !targetSocket.data.adultConfirmed ||
      activePairs.has(socket.id) ||
      activePairs.has(targetSocket.id) ||
      isBlockedBetween(socket.id, targetSocket.id)
    ) {
      socket.emit('direct-call-unavailable', {
        message: 'Your Connection is not available for a video call right now.',
      });
      return;
    }

    cancelPendingCallFromCaller(socket.id);

    const inviteId = randomUUID();
    const invite = {
      inviteId,
      callerSocketId: socket.id,
      callerUserId: socket.data.userId,
      callerDisplayName: socket.data.displayName || 'Your Connection',
      calleeUserId: payload.calleeId,
      connectionId: payload.connectionId,
      expiresAt: Date.now() + CONNECTION_CALL_TTL_MS,
      timeout: null,
    };

    invite.timeout = setTimeout(() => {
      if (!pendingConnectionCalls.has(inviteId)) return;
      clearPendingConnectionCall(
        inviteId,
        'connection-call-expired',
        'connection-call-expired'
      );
    }, CONNECTION_CALL_TTL_MS);

    pendingConnectionCalls.set(inviteId, invite);
    pendingCallByCallerSocket.set(socket.id, inviteId);

    socket.emit('connection-call-ringing', {
      inviteId,
      connectionId: payload.connectionId,
      calleeUserId: payload.calleeId,
    });

    targetSocket.emit('incoming-connection-call', {
      inviteId,
      connectionId: payload.connectionId,
      callerUserId: socket.data.userId,
      callerDisplayName: socket.data.displayName || 'Your Connection',
      expiresAt: invite.expiresAt,
    });

    console.log(
      `[Signaling] Connection call invite: ${socket.data.userId} -> ${payload.calleeId}`
    );
  });

  socket.on('accept-connection-call', ({ inviteId } = {}) => {
    const invite = pendingConnectionCalls.get(inviteId);
    if (!invite || invite.expiresAt < Date.now()) {
      socket.emit('direct-call-unavailable', {
        message: 'This call invitation has expired.',
      });
      return;
    }

    if (invite.calleeUserId !== socket.data.userId) {
      socket.emit('direct-call-unavailable', {
        message: 'This call invitation does not belong to your account.',
      });
      return;
    }

    const callerSocket = io.sockets.sockets.get(invite.callerSocketId);
    if (
      !callerSocket ||
      !callerSocket.data.adultConfirmed ||
      !socket.data.adultConfirmed ||
      activePairs.has(callerSocket.id) ||
      activePairs.has(socket.id) ||
      isBlockedBetween(callerSocket.id, socket.id)
    ) {
      clearPendingConnectionCall(inviteId, 'direct-call-unavailable', null);
      socket.emit('direct-call-unavailable', {
        message: 'This Connection is no longer available for a video call.',
      });
      return;
    }

    pendingConnectionCalls.delete(inviteId);
    if (pendingCallByCallerSocket.get(callerSocket.id) === inviteId) {
      pendingCallByCallerSocket.delete(callerSocket.id);
    }
    if (invite.timeout) clearTimeout(invite.timeout);

    removeFromMatchQueues(callerSocket.id);
    removeFromMatchQueues(socket.id);

    callerSocket.emit('connection-call-accepted', {
      inviteId,
      connectionId: invite.connectionId,
    });
    socket.emit('connection-call-accepted', {
      inviteId,
      connectionId: invite.connectionId,
    });

    callerSocket.emit('user-found', {
      partnerId: socket.id,
      partnerUserId: socket.data.userId,
    });
    socket.emit('user-found', {
      partnerId: callerSocket.id,
      partnerUserId: callerSocket.data.userId,
    });

    pairUsers(callerSocket.id, socket.id);
    console.log(
      `[Signaling] accepted Connection call: ${callerSocket.data.userId} <-> ${socket.data.userId}`
    );
  });

  socket.on('decline-connection-call', ({ inviteId } = {}) => {
    const invite = pendingConnectionCalls.get(inviteId);
    if (!invite || invite.calleeUserId !== socket.data.userId) return;
    clearPendingConnectionCall(inviteId, 'connection-call-declined', null);
    socket.emit('connection-call-declined', { inviteId });
  });

  socket.on('find-next-user', () => {
    clearActivePair(socket.id, true);
    removeFromMatchQueues(socket.id);
    runFindUser(socket);
  });

  socket.on('cancel-search', () => {
    const cancelledCall = cancelPendingCallFromCaller(socket.id);
    removeFromMatchQueues(socket.id);
    socket.emit('search-cancelled', { cancelledCall });
    console.log(`[Signaling] search/call cancelled by ${socket.id}`);
  });

  socket.on('leave-chat', () => {
    console.log(`User ${socket.id} is leaving chat`);
    clearActivePair(socket.id, true);
    removeFromMatchQueues(socket.id);
    if (socket.data.userId && activeDatingSocketsByUser.get(socket.data.userId) === socket.id) {
      activeDatingSocketsByUser.delete(socket.data.userId);
    }
  });

  socket.on('call-user', ({ offer, to }) => {
    console.log(`[Signaling] call-user ${socket.id} -> ${to}`);
    socket.to(to).emit('call-made', {
      offer,
      from: socket.id,
    });
  });

  socket.on('make-answer', ({ answer, to }) => {
    console.log(`[Signaling] make-answer ${socket.id} -> ${to}`);
    socket.to(to).emit('answer-made', {
      answer,
      from: socket.id
    });
  });

  socket.on('ice-candidate', ({ candidate, to }) => {
    socket.to(to).emit('ice-candidate', {
      candidate,
      from: socket.id
    });
  });

  socket.on('chat-message', ({ id, text, to, from, timestamp }) => {
    socket.to(to).emit('chat-message', {
      id,
      text,
      from,
      timestamp
    });
  });

  socket.on('stream-state-change', ({ type, state, to }) => {
    socket.to(to).emit('stream-state-change', {
      type,
      state
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    cancelPendingCallFromCaller(socket.id);
    clearActivePair(socket.id, true);
    removeFromMatchQueues(socket.id);
    if (socket.data.userId && activeDatingSocketsByUser.get(socket.data.userId) === socket.id) {
      activeDatingSocketsByUser.delete(socket.data.userId);
    }
    recentPeers.delete(socket.id);
    for (const [userId, peers] of recentPeers.entries()) {
      peers.delete(socket.id);
      if (peers.size === 0) recentPeers.delete(userId);
    }
  });

  socket.on('typing-start', ({ to }) => {
    socket.to(to).emit('typing-start', { from: socket.id });
    console.log(`User ${socket.id} started typing (to ${to})`);
  });

  socket.on('typing-stop', ({ to }) => {
    socket.to(to).emit('typing-stop', { from: socket.id });
    console.log(`User ${socket.id} stopped typing (to ${to})`);
  });

  socket.on('mark-messages-read', ({ messageIds, to }) => {
    if (!Array.isArray(messageIds) || messageIds.length === 0) return;

    socket.to(to).emit('message-read', {
      messageIds,
      from: socket.id
    });
    console.log(`User ${socket.id} marked messages as read: ${messageIds.length} messages`);
  });

  socket.on('vibe-tap', ({ to }) => {
    if (!to || activePairs.get(socket.id) !== to) return;

    vibeTargets.set(socket.id, to);
    socket.to(to).emit('vibe-received', { from: socket.id });
    console.log(`[Signaling] vibe-tap ${socket.id} -> ${to}`);

    if (vibeTargets.get(to) !== socket.id) return;

    const peerSocket = io.sockets.sockets.get(to);
    const userId = socket.data.userId;
    const peerUserId = peerSocket?.data.userId || null;
    const proof = userId && peerUserId ? createConnectionProof(userId, peerUserId) : null;

    socket.emit('mutual-vibe', {
      partnerUserId: peerUserId,
      partnerDisplayName: peerSocket?.data.displayName || null,
      connectionProof: proof,
    });
    io.to(to).emit('mutual-vibe', {
      partnerUserId: userId,
      partnerDisplayName: socket.data.displayName || null,
      connectionProof: proof,
    });
  });

  socket.on('block-user', ({ to }) => {
    if (!to || activePairs.get(socket.id) !== to) return;
    const peerSocket = io.sockets.sockets.get(to);
    const peerUserId = peerSocket?.data.userId;
    if (peerUserId) socket.data.blockedUserIds.add(peerUserId);
    clearActivePair(socket.id, true);
    removeFromMatchQueues(socket.id);
    socket.emit('blocked-user', { userId: peerUserId || null });
  });

  socket.on('report-user', (payload = {}) => {
    const reportedSocketId = payload.reportedUserId || payload.reportedSocketId;
    if (!reportedSocketId) {
      console.warn('[Signaling] report-user missing reported user id');
      return;
    }

    saveReport({
      reporterSocketId: socket.id,
      reportedSocketId,
      category: payload.category || payload.reason || 'other',
      timestamp: payload.timestamp || Date.now(),
      reporterProfile: payload.reporterProfile || null,
      reportedProfile: payload.reportedProfile || null,
      sessionId: payload.sessionId || sessionIdFor(socket.id, reportedSocketId),
    })
      .then((record) => {
        console.log(`[Signaling] report-user from ${socket.id}:`, record.id, record.category);
      })
      .catch((err) => console.error('[Reports] save failed', err));
  });

  socket.on('reconnect-attempt', ({ to }) => {
    socket.to(to).emit('peer-reconnecting', { from: socket.id });
    console.log(`User ${socket.id} is attempting to reconnect with ${to}`);
  });

  socket.on('reconnect-success', ({ to }) => {
    socket.to(to).emit('peer-reconnected', { from: socket.id });
    console.log(`User ${socket.id} has successfully reconnected with ${to}`);
  });
});

const PORT = process.env.PORT || 3003;
server.listen(PORT, () => {
  console.log(`Signaling server running on port ${PORT}`);
  console.log('[CORS] CORS_ORIGINS env:', process.env.CORS_ORIGINS || '(not set — localhost fallback)');
  console.log('[CORS] Allowed origins:', allowedOrigins.join(', ') || '(none)');
});
