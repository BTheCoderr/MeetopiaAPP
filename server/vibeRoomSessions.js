'use strict'

// The Vibe Room is intentionally ephemeral. No private round answers, audio,
// video, transcripts, or behavioural/compatibility scores are persisted.
const { randomUUID } = require('node:crypto')

const SPARK_BY_INTEREST = Object.freeze({
  music: 'What is a song you wish you could hear for the first time again?',
  fitness: 'What activity makes you forget to look at the clock?',
  food: 'If you could share one meal with someone, what would you pick?',
  travel: 'Where would you take someone for an unforgettable weekend?',
  art: 'What is a piece of art or creativity that changed how you see things?',
  gaming: 'What game would you teach someone on a first hangout?',
  books: 'What is a story you still think about?',
  outdoors: 'What is your favorite way to spend an afternoon outside?',
  movies: 'Which movie would you happily watch one more time?',
  tech: 'What invention made your day-to-day life more fun?',
  sports: 'What sporting moment would you relive?',
  culture: 'What tradition would you love to share with someone?',
})

const CURVEBALL = Object.freeze({
  id: 'curveball-first-adventure',
  title: 'THE CURVEBALL',
  subtitle: 'Choose privately. Reveal together.',
  prompt: 'You have one free evening together. Which plan feels more like you?',
  options: [
    { id: 'explore', label: 'Go somewhere new and explore' },
    { id: 'cozy', label: 'Find a cozy spot and talk for hours' },
  ],
})

const REAL_TALK = Object.freeze({
  id: 'real-talk-connection',
  title: 'THE REAL TALK',
  subtitle: 'No perfect answers. Just a real conversation.',
  prompt: 'What helps you feel safe and genuinely understood when meeting someone new?',
})

function createVibeRoomSessions({ canContinue = () => true } = {}) {
  const sessions = new Map()
  const bySocket = new Map()

  function roundFor(room) {
    if (room.index === 0) return {
      id: 'spark-' + room.interest,
      title: 'THE SPARK',
      subtitle: 'Start with something you both care about.',
      prompt: SPARK_BY_INTEREST[room.interest],
    }
    if (room.index === 1) return CURVEBALL
    return REAL_TALK
  }

  function validRoom(socket) {
    const id = bySocket.get(socket.id)
    const room = id && sessions.get(id)
    if (!room || !room.sockets.some(s => s.id === socket.id)) return null
    if (!room.sockets.every(s => s.connected) || !canContinue(room.sockets[0], room.sockets[1])) {
      cancel(socket.id)
      return null
    }
    return room
  }

  function snapshot(room, socket) {
    const peer = room.sockets.find(s => s.id !== socket.id)
    const bothAnswered = room.answers.size === 2
    return {
      sessionId: room.id,
      index: room.index,
      total: 3,
      completed: room.completed,
      round: room.completed ? null : roundFor(room),
      ready: room.ready.has(socket.id),
      waitingForPartner: room.ready.has(socket.id) && room.ready.size !== 2,
      myChoice: room.index === 1 && !room.completed ? room.answers.get(socket.id) || null : null,
      waitingForAnswer: room.index === 1 && room.answers.has(socket.id) && !bothAnswered,
      revealed: room.index === 1 && bothAnswered,
      // Don't send the other participant's answer until BOTH have intentionally
      // chosen. Even in a response, the other's user id is never disclosed.
      reveal: room.index === 1 && bothAnswered
        ? [
          { label: 'You', choice: room.answers.get(socket.id) },
          { label: 'Them', choice: room.answers.get(peer.id) },
        ]
        : null,
    }
  }

  function broadcast(room) {
    for (const socket of room.sockets) {
      socket.emit('vibe-room-state', snapshot(room, socket))
    }
  }

  function start(a, b, sharedInterests = []) {
    cancel(a.id)
    cancel(b.id)
    if (!a.connected || !b.connected || a.id === b.id || !canContinue(a, b)) return null
    const interest = sharedInterests.find(value => Object.hasOwn(SPARK_BY_INTEREST, value)) || 'music'
    const room = {
      id: randomUUID(), sockets: [a, b], interest, index: 0,
      completed: false, answers: new Map(), ready: new Set(),
    }
    sessions.set(room.id, room)
    bySocket.set(a.id, room.id)
    bySocket.set(b.id, room.id)
    broadcast(room)
    return room.id
  }

  function cancel(socketId) {
    const id = bySocket.get(socketId)
    if (!id) return false
    const room = sessions.get(id)
    if (!room) { bySocket.delete(socketId); return false }
    sessions.delete(id)
    for (const socket of room.sockets) {
      bySocket.delete(socket.id)
      if (socket.connected) socket.emit('vibe-room-ended', { sessionId: id })
    }
    room.answers.clear()
    room.ready.clear()
    return true
  }

  function answer(socket, { sessionId, choice } = {}) {
    const room = validRoom(socket)
    if (!room || room.id !== sessionId || room.index !== 1 || room.completed || room.answers.has(socket.id)) return false
    if (typeof choice !== 'string' || !CURVEBALL.options.some(option => option.id === choice)) return false
    room.answers.set(socket.id, choice)
    broadcast(room)
    return true
  }

  function next(socket, { sessionId } = {}) {
    const room = validRoom(socket)
    if (!room || room.id !== sessionId || room.completed || room.ready.has(socket.id)) return false
    // Answers must be voluntarily submitted by BOTH participants before the
    // private reveal and before either can progress past The Curveball.
    if (room.index === 1 && room.answers.size !== 2) return false
    room.ready.add(socket.id)
    if (room.ready.size === 2) {
      room.ready.clear()
      room.answers.clear()
      if (room.index === 2) room.completed = true
      else room.index += 1
    }
    broadcast(room)
    return true
  }

  function canVibe(socketId, peerId) {
    const id = bySocket.get(socketId)
    const room = id && sessions.get(id)
    return Boolean(room && room.completed && room.sockets.some(s => s.id === peerId) && bySocket.get(peerId) === id)
  }

  return {
    start, cancel, answer, next, canVibe,
    hasSession: socketId => bySocket.has(socketId),
    sessionCount: () => sessions.size,
  }
}

module.exports = { createVibeRoomSessions, SPARK_BY_INTEREST, CURVEBALL, REAL_TALK }
