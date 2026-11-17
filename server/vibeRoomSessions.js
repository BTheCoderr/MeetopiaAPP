'use strict'

// Four server-authoritative phases: Spark, Curveball, Real Talk, Co-Create.
// Conversation answers stay in memory only; the final jointly approved
// creation MAY be saved on mutual Vibe using a short-lived signed proof.
const { randomUUID } = require('node:crypto')
const { getTheme, isBridgeChoice, validateCreation } = require('./themeCatalog')

const CURVEBALL = Object.freeze({
  id: 'curveball-first-adventure',
  title: 'THE CURVEBALL',
  subtitle: 'Choose privately. Reveal together.',
  prompt: 'You have one free evening. Which plan feels more like you?',
  options: [
    { id: 'explore', label: 'Go somewhere new and explore' },
    { id: 'cozy', label: 'Find a cozy spot and talk for hours' },
  ],
})
const REAL_TALK = Object.freeze({
  id: 'real-talk-connection',
  title: 'THE REAL TALK',
  subtitle: 'No perfect answers. Just a real conversation.',
  prompt: 'What helps you feel understood when meeting someone new?',
})

function createVibeRoomSessions({ canContinue = () => true } = {}) {
  const rooms = new Map()
  const bySocket = new Map()
  function current(socket) {
    const id = bySocket.get(socket.id)
    const room = id && rooms.get(id)
    if (!room || !room.sockets.some(s => s.id === socket.id)) return null
    if (!room.sockets.every(s => s.connected) || !canContinue(...room.sockets)) {
      cancel(socket.id)
      return null
    }
    return room
  }
  function round(room) {
    const theme = getTheme(room.themeId)
    if (room.index === 0) return {
      id: 'spark-' + room.themeId, title: 'THE SPARK',
      subtitle: 'A story behind your chosen theme.', prompt: theme.spark,
    }
    if (room.index === 1) return CURVEBALL
    if (room.index === 2) return REAL_TALK
    return {
      id: 'the-bridge-' + room.themeId, title: 'THE BRIDGE',
      subtitle: 'Create an adventure together. Both must approve to save it.',
      prompt: theme.bridgePrompt,
    }
  }
  function bridgeSnapshot(room, socket) {
    if (room.index !== 3) return null
    const theme = getTheme(room.themeId)
    const role = socket.id === room.sockets[0].id ? 'activity' : 'setting'
    const mine = room.contributions.get(socket.id) || null
    const bothContributed = room.contributions.size === 2
    const first = room.contributions.get(room.sockets[0].id)
    const second = room.contributions.get(room.sockets[1].id)
    return {
      role, options: role === 'activity' ? theme.activities : theme.settings,
      myChoice: mine, waitingForPartner: Boolean(mine && !bothContributed),
      proposal: bothContributed ? { activity: first, setting: second } : null,
      revision: room.revision,
      approved: room.approvals.has(socket.id),
      otherApproved: room.approvals.size === 1 && !room.approvals.has(socket.id),
    }
  }
  function snapshot(room, socket) {
    const other = room.sockets.find(s => s.id !== socket.id)
    const bothAnswered = room.answers.size === 2
    return {
      sessionId: room.id, themeId: room.themeId, themeTitle: getTheme(room.themeId).title,
      index: room.index, total: 4, completed: room.completed,
      round: room.completed ? null : round(room),
      ready: room.ready.has(socket.id),
      waitingForPartner: room.ready.has(socket.id) && room.ready.size !== 2,
      myChoice: room.index === 1 && !room.completed ? room.answers.get(socket.id) || null : null,
      waitingForAnswer: room.index === 1 && room.answers.has(socket.id) && !bothAnswered,
      revealed: room.index === 1 && bothAnswered,
      reveal: room.index === 1 && bothAnswered
        ? [
          { label: 'You', choice: room.answers.get(socket.id) },
          { label: 'Them', choice: room.answers.get(other.id) },
        ] : null,
      bridge: bridgeSnapshot(room, socket),
      finalCreation: room.completed ? { ...room.finalCreation } : null,
    }
  }
  function broadcast(room) {
    for (const socket of room.sockets) if (socket.connected) socket.emit('vibe-room-state', snapshot(room, socket))
  }
  function start(a, b, themeId) {
    cancel(a.id); cancel(b.id)
    if (!a.connected || !b.connected || a.id === b.id || !canContinue(a, b) || !getTheme(themeId)) return null
    const room = {
      id: randomUUID(), themeId, sockets: [a, b], index: 0, completed: false,
      answers: new Map(), ready: new Set(), contributions: new Map(),
      approvals: new Set(), revision: 0, finalCreation: null,
    }
    rooms.set(room.id, room)
    bySocket.set(a.id, room.id); bySocket.set(b.id, room.id)
    broadcast(room)
    return room.id
  }
  function cancel(socketId) {
    const id = bySocket.get(socketId)
    if (!id) return false
    const room = rooms.get(id)
    if (!room) { bySocket.delete(socketId); return false }
    rooms.delete(id)
    for (const socket of room.sockets) {
      bySocket.delete(socket.id)
      if (socket.connected) socket.emit('vibe-room-ended', { sessionId: id })
    }
    room.answers.clear(); room.ready.clear()
    room.contributions.clear(); room.approvals.clear(); room.finalCreation = null
    return true
  }
  function answer(socket, { sessionId, choice } = {}) {
    const room = current(socket)
    if (!room || room.id !== sessionId || room.index !== 1 || room.completed || room.answers.has(socket.id)) return false
    if (typeof choice !== 'string' || !CURVEBALL.options.some(o => o.id === choice)) return false
    room.answers.set(socket.id, choice)
    broadcast(room)
    return true
  }
  function next(socket, { sessionId } = {}) {
    const room = current(socket)
    if (!room || room.id !== sessionId || room.completed || room.index === 3 || room.ready.has(socket.id)) return false
    if (room.index === 1 && room.answers.size !== 2) return false
    room.ready.add(socket.id)
    if (room.ready.size === 2) {
      room.ready.clear(); room.answers.clear(); room.index += 1
    }
    broadcast(room)
    return true
  }
  function contribute(socket, { sessionId, choice } = {}) {
    const room = current(socket)
    if (!room || room.id !== sessionId || room.index !== 3 || room.completed) return false
    const role = room.sockets[0].id === socket.id ? 'activity' : 'setting'
    if (!isBridgeChoice(room.themeId, role, choice)) return false
    if (room.contributions.get(socket.id) === choice) return false
    room.contributions.set(socket.id, choice)
    // Any revision invalidates BOTH previous approvals. An approval is bound to
    // a specific revision, preventing stale approval packets from finalizing.
    room.revision += 1; room.approvals.clear()
    broadcast(room)
    return true
  }
  function approve(socket, { sessionId, revision, share } = {}) {
    const room = current(socket)
    if (!room || room.id !== sessionId || room.completed || room.index !== 3) return false
    if (room.contributions.size !== 2 || !Number.isInteger(revision) || revision !== room.revision || share !== true) return false
    if (room.approvals.has(socket.id)) return false
    room.approvals.add(socket.id)
    if (room.approvals.size === 2) {
      const proposed = {
        themeId: room.themeId,
        activity: room.contributions.get(room.sockets[0].id),
        setting: room.contributions.get(room.sockets[1].id),
      }
      const final = validateCreation(proposed)
      if (!final) { room.approvals.clear(); return false }
      room.finalCreation = final
      room.completed = true
    }
    broadcast(room)
    return true
  }
  function approvedOutcome(socketId, peerId) {
    const id = bySocket.get(socketId)
    const room = id && rooms.get(id)
    if (!room || !room.completed || bySocket.get(peerId) !== id || !room.sockets.some(s => s.id === peerId)) return null
    return room.finalCreation && { ...room.finalCreation }
  }
  function canVibe(socketId, peerId) { return Boolean(approvedOutcome(socketId, peerId)) }
  return { start, cancel, answer, next, contribute, approve, canVibe, approvedOutcome,
    hasSession: id => bySocket.has(id), sessionCount: () => rooms.size }
}

module.exports = { createVibeRoomSessions, CURVEBALL, REAL_TALK }
