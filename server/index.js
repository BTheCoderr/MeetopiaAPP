const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3003"],
    methods: ["GET", "POST"]
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

  socket.on('call-user', ({ offer, to }) => {
    console.log(`[Signaling] call-user ${socket.id} -> ${to}`);
    socket.to(to).emit('call-made', {
      offer,
      from: socket.id
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
});
