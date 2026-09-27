const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { saveReport, readRecentReports, sessionIdFor, getReportBackendStatus } = require('./reportsStore');
const { verifySocketToken, createConnectionProof } = require('./socketAuth');

const normalizeOrigin = (origin) =>
  origin ? origin.trim().replace(/^["']|["']$/g, '').replace(/\/$/, '') : origin;

const allowedOrigins = (process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3003']
)
  .map(normalizeOrigin)
  .filter(Boolean);

const corsOriginCheck = (origin, callback) => {
  const normalizedOrigin = normalizeOrigin(origin);

  const isMeetopiaPreview =
    typeof normalizedOrigin === 'string' &&
    /^https:\/\/deploy-preview-\d+--meetopia-live\.netlify\.app$/.test(normalizedOrigin);

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
  const isMeetopiaPreview =
    typeof normalizedOrigin === 'string' &&
    /^https:\/\/deploy-preview-\d+--meetopia-live\.netlify\.app$/.test(normalizedOrigin);
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

// Legacy explicit-room flow (/room/[roomId], join-room) — separate from /chat/video random matching.
const rooms = new Map();
const waitingUsers = new Set();
const datingUsers = new Map();
// Active 1:1 video chat pairs for /chat/video random matching (socketId -> partnerId)
const activePairs = new Map();
const vibeTargets = new Map();
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

function leaveLegacyRooms(socket) {
  rooms.forEach((users, roomId) => {
    if (users.has(socket.id)) {
      users.delete(socket.id);
      for (const userId of users) {
        io.to(userId).emit('peer-left');
      }
      if (users.size === 0) {
        rooms.delete(roomId);
      }
    }
  });
}

function removeFromMatchQueues(socketId) {
  waitingUsers.delete(socketId);
  datingUsers.delete(socketId);
}

function leaveCurrentRoom(socket, { notifyVideoPeer = false } = {}) {
  clearActivePair(socket.id, notifyVideoPeer);
  leaveLegacyRooms(socket);
  removeFromMatchQueues(socket.id);
}

const DATING_QUEUE_TTL_MS = 5 * 60 * 1000;
const ALLOWED_GENDERS = new Set(['male', 'female', 'other']);
const ALLOWED_PREFERENCES = new Set(['male', 'female', 'both']);

function normalizeDatingProfile(profile) {
  if (!profile || typeof profile !== 'object') return null;

  const age = Number(profile.age);
  const name = typeof profile.name === 'string' ? profile.name.trim().slice(0, 60) : '';
  const gender = typeof profile.gender === 'string' ? profile.gender.toLowerCase() : '';
  const lookingFor = typeof profile.lookingFor === 'string' ? profile.lookingFor.toLowerCase() : '';

  if (!name || !Number.isInteger(age) || age < 18 || age > 99) return null;
  if (!ALLOWED_GENDERS.has(gender) || !ALLOWED_PREFERENCES.has(lookingFor)) return null;

  return {
    ...profile,
    name,
    age,
    gender,
    lookingFor,
    interests: Array.isArray(profile.interests)
      ? profile.interests.filter((item) => typeof item === 'string').slice(0, 20)
      : [],
    bio: typeof profile.bio === 'string' ? profile.bio.slice(0, 500) : '',
  };
}

function pruneDatingQueue() {
  const cutoff = Date.now() - DATING_QUEUE_TTL_MS;
  for (const [socketId, entry] of datingUsers.entries()) {
    if (!entry || entry.timestamp < cutoff || !io.sockets.sockets.has(socketId)) {
      datingUsers.delete(socketId);
    }
  }
}

function findDatingMatch(userId, userProfile) {
  let bestMatch = null;
  pruneDatingQueue();

  for (const [partnerId, partnerData] of datingUsers.entries()) {
    if (partnerId === userId) continue;
    if (activePairs.has(partnerId)) continue;
    if (!canPair(userId, partnerId)) continue;

    const partnerProfile = partnerData.profile;
    const userWants = userProfile.lookingFor;
    const partnerWants = partnerProfile.lookingFor;
    const userGender = userProfile.gender;
    const partnerGender = partnerProfile.gender;

    const userLikesPartner = userWants === 'both' || userWants === partnerGender;
    const partnerLikesUser = partnerWants === 'both' || partnerWants === userGender;

    if (userLikesPartner && partnerLikesUser) {
      bestMatch = partnerId;
      break;
    }
  }

  return bestMatch;
}

function runFindUser(socket, data = {}) {
  if (activePairs.has(socket.id)) {
    console.log(`User ${socket.id} already paired, skipping match queue`);
    return;
  }

  const isDatingMode = data.mode === 'dating';

  if (isDatingMode && !socket.data.userId) {
    removeFromMatchQueues(socket.id);
    socket.emit('match-error', {
      code: 'AUTH_REQUIRED',
      message: 'Sign in to use Meetopia dating and save Connections.',
    });
    return;
  }

  const profile = isDatingMode ? normalizeDatingProfile(data.profile) : null;

  if (isDatingMode && !profile) {
    removeFromMatchQueues(socket.id);
    socket.emit('match-error', {
      code: 'INVALID_DATING_PROFILE',
      message: 'Dating requires a complete 18+ profile before matching.',
    });
    console.warn(`[Dating] rejected invalid profile from ${socket.id}`);
    return;
  }

  if (isDatingMode && profile) {
    console.log(`User ${socket.id} is looking for a dating match with profile:`, {
      name: profile.name,
      age: profile.age,
      gender: profile.gender,
      lookingFor: profile.lookingFor,
    });
    const trustedProfile = {
      ...profile,
      userId: socket.data.userId,
      name: socket.data.displayName || profile.name,
    };

    datingUsers.set(socket.id, {
      profile: trustedProfile,
      timestamp: Date.now()
    });

    const partnerId = findDatingMatch(socket.id, trustedProfile);
    if (partnerId) {
      const partnerProfile = datingUsers.get(partnerId).profile;
      datingUsers.delete(socket.id);
      datingUsers.delete(partnerId);

      socket.emit('user-found', {
        partnerId,
        profile: partnerProfile
      });
      io.to(partnerId).emit('user-found', {
        partnerId: socket.id,
        profile: trustedProfile
      });
      pairUsers(socket.id, partnerId);
      console.log(`Dating match found between ${socket.id} and ${partnerId}`);
    } else {
      console.log(`User ${socket.id} is waiting for a dating match`);
    }
    return;
  }

  if (waitingUsers.size > 0) {
    const partnerId = [...waitingUsers].find(
      (id) => id !== socket.id && !activePairs.has(id) && canPair(socket.id, id)
    );
    if (partnerId) {
      waitingUsers.delete(partnerId);
      socket.emit('user-found', { partnerId });
      io.to(partnerId).emit('user-found', { partnerId: socket.id });
      pairUsers(socket.id, partnerId);
      console.log(`[Signaling] Matched users: ${socket.id} and ${partnerId}`);
      return;
    }
  }

  waitingUsers.add(socket.id);
  console.log(`User ${socket.id} is waiting for a match`);
}

io.use((socket, next) => {
  const payload = verifySocketToken(socket.handshake.auth?.token);
  socket.data.userId = payload?.sub || null;
  socket.data.displayName = payload?.displayName || null;
  socket.data.blockedUserIds = new Set(Array.isArray(payload?.blocked) ? payload.blocked : []);
  next();
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', ({ roomId }) => {
    socket.join(roomId);

    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }
    rooms.get(roomId).add(socket.id);

    const room = rooms.get(roomId);
    if (room.size === 2) {
      const users = Array.from(room);
      io.to(roomId).emit('start-call', { users });
    }

    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on('find-user', (data = {}) => {
    if (activePairs.has(socket.id)) {
      console.log(`User ${socket.id} already paired, ignoring duplicate find-user`);
      return;
    }
    leaveCurrentRoom(socket, { notifyVideoPeer: false });
    runFindUser(socket, data);
  });

  socket.on('find-next-user', (data = {}) => {
    clearActivePair(socket.id, true);
    leaveLegacyRooms(socket);
    removeFromMatchQueues(socket.id);
    runFindUser(socket, data);
  });

  socket.on('cancel-search', () => {
    removeFromMatchQueues(socket.id);
    socket.emit('search-cancelled');
    console.log(`[Signaling] search cancelled by ${socket.id}`);
  });

  socket.on('leave-chat', () => {
    console.log(`User ${socket.id} is leaving chat`);
    clearActivePair(socket.id, true);
    leaveLegacyRooms(socket);
    removeFromMatchQueues(socket.id);
  });

  socket.on('call-user', ({ offer, to, profile }) => {
    console.log(`[Signaling] call-user ${socket.id} -> ${to}`);
    socket.to(to).emit('call-made', {
      offer,
      from: socket.id,
      profile: profile || null,
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

  socket.on('leave-room', ({ roomId }) => {
    socket.leave(roomId);
    if (rooms.has(roomId)) {
      rooms.get(roomId).delete(socket.id);
      if (rooms.get(roomId).size === 0) {
        rooms.delete(roomId);
      }
    }
    io.to(roomId).emit('peer-left', { peerId: socket.id });
    console.log(`User ${socket.id} left room ${roomId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    clearActivePair(socket.id, true);
    leaveLegacyRooms(socket);
    removeFromMatchQueues(socket.id);
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
