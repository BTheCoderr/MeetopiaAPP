const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { saveReport, readRecentReports, sessionIdFor, getReportBackendStatus } = require('./reportsStore');

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

  if (!normalizedOrigin || allowedOrigins.includes(normalizedOrigin)) {
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
  if (normalizedOrigin && allowedOrigins.includes(normalizedOrigin)) {
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

function pairUsers(userIdA, userIdB) {
  activePairs.set(userIdA, userIdB);
  activePairs.set(userIdB, userIdA);
  console.log(`[Signaling] paired ${userIdA} <-> ${userIdB}`);
}

function clearActivePair(socketId, notifyPeer = true) {
  const peerId = activePairs.get(socketId);
  if (!peerId) return null;
  activePairs.delete(socketId);
  activePairs.delete(peerId);
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

function findDatingMatch(userId, userProfile) {
  let bestMatch = null;

  for (const [partnerId, partnerData] of datingUsers.entries()) {
    if (partnerId === userId) continue;
    if (activePairs.has(partnerId)) continue;

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
  const profile = data.profile || null;

  if (isDatingMode && profile) {
    console.log(`User ${socket.id} is looking for a dating match with profile:`, profile);
    datingUsers.set(socket.id, {
      profile,
      timestamp: Date.now()
    });

    const partnerId = findDatingMatch(socket.id, profile);
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
        profile
      });
      pairUsers(socket.id, partnerId);
      console.log(`Dating match found between ${socket.id} and ${partnerId}`);
    } else {
      console.log(`User ${socket.id} is waiting for a dating match`);
    }
    return;
  }

  if (waitingUsers.size > 0) {
    const partnerId = [...waitingUsers].find((id) => id !== socket.id && !activePairs.has(id));
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
    if (!to) return;
    socket.to(to).emit('vibe-tap', { from: socket.id });
    console.log(`[Signaling] vibe-tap ${socket.id} -> ${to}`);
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
