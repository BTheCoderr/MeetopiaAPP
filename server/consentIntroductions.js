'use strict'

const { randomUUID } = require('node:crypto')
const { getTheme } = require('./themeCatalog')

const INTENTS = new Set(['relationship', 'dating', 'friendship', 'open'])
const STYLES = new Set(['playful', 'thoughtful', 'balanced'])
const INTERESTS = new Set(['music', 'fitness', 'food', 'travel', 'art', 'gaming', 'books', 'outdoors', 'movies', 'tech', 'sports', 'culture'])

function validatePassport(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const { intent, style, interests } = value
  if (!INTENTS.has(intent) || !STYLES.has(style) || !Array.isArray(interests)) return null
  if (interests.length < 2 || interests.length > 5 || new Set(interests).size !== interests.length) return null
  if (!interests.every(interest => typeof interest === 'string' && INTERESTS.has(interest))) return null
  return { intent, style, interests }
}

function comparePassports(a, b) {
  const x = validatePassport(a), y = validatePassport(b)
  if (!x || !y) return null
  // Two incompatible explicit intentions are never matched. "Open" means flexible.
  if (x.intent !== y.intent && x.intent !== 'open' && y.intent !== 'open') return null
  const sharedInterests = x.interests.filter(interest => y.interests.includes(interest))
  if (!sharedInterests.length) return null
  return {
    sharedInterests,
    score: sharedInterests.length * 10 + (x.style === y.style ? 3 : 0) + (x.intent === y.intent ? 2 : 0),
  }
}

/**
 * Ephemeral, server-authoritative, two-party introduction protocol.
 * No WebRTC authorization is granted here. Only onApproved may call pairUsers,
 * after both authenticated sockets explicitly accept the same live invitation.
 */
function createConsentIntroductions({ canIntroduce, onApproved, ttlMs = 30000, now = Date.now }) {
  const waiting = new Map()
  const pending = new Map()
  const bySocket = new Map()

  function resolve(invite, event, reason) {
    if (pending.get(invite.id) !== invite) return false
    pending.delete(invite.id)
    bySocket.delete(invite.a.id)
    bySocket.delete(invite.b.id)
    clearTimeout(invite.timer)
    if (event) {
      for (const socket of [invite.a, invite.b]) {
        if (socket.connected) socket.emit(event, { invitationId: invite.id, reason })
      }
    }
    return true
  }

  function cancel(socketId) {
    waiting.delete(socketId)
    const id = bySocket.get(socketId), invite = id && pending.get(id)
    if (invite) resolve(invite, 'introduction-cancelled', 'A participant left the introduction.')
  }

  function start(socket, themeId) {
    cancel(socket.id)
    const theme = getTheme(themeId)
    if (!theme) {
      socket.emit('match-error', { code: 'THEME_REQUIRED', message: 'Choose a real Vibe Session to join.' })
      return false
    }
    if (!socket.connected || !socket.data?.userId || !socket.data.adultConfirmed) {
      socket.emit('match-error', { code: 'AUTH_REQUIRED', message: 'Sign in and confirm you are 18+ to join introductions.' })
      return false
    }
    if (!validatePassport(socket.data.passport)) {
      socket.emit('match-error', { code: 'PASSPORT_REQUIRED', message: 'Complete your Chemistry Passport before meeting someone.' })
      return false
    }
    let best = null
    for (const entry of waiting.values()) {
      const candidate = entry.socket
      if (entry.themeId !== theme.id) continue
      if (!candidate.connected || candidate.id === socket.id || candidate.data.userId === socket.data.userId) continue
      const comparison = comparePassports(socket.data.passport, candidate.data.passport)
      if (!comparison || !canIntroduce(socket, candidate)) continue
      if (!best || comparison.score > best.comparison.score) best = { candidate, comparison }
    }
    if (!best) {
      waiting.set(socket.id, { socket, themeId: theme.id })
      socket.emit('introduction-searching', { themeId: theme.id, themeTitle: theme.title, message: 'Looking for someone who chose this Vibe Session.' })
      return true
    }
    const candidate = best.candidate
    waiting.delete(candidate.id)
    const id = randomUUID()
    const invite = {
      id, a: socket, b: candidate, themeId: theme.id, accepted: new Set(),
      expiresAt: now() + ttlMs, timer: null,
    }
    pending.set(id, invite)
    bySocket.set(socket.id, id)
    bySocket.set(candidate.id, id)
    invite.timer = setTimeout(() => resolve(invite, 'introduction-expired', 'The introduction timed out.'), ttlMs)
    for (const [me, other] of [[socket, candidate], [candidate, socket]]) {
      me.emit('introduction-offered', {
        invitationId: id,
        themeId: theme.id,
        themeTitle: theme.title,
        expiresAt: invite.expiresAt,
        person: {
          displayName: typeof other.data.displayName === 'string' ? other.data.displayName.slice(0, 60) : 'Meetopia member',
          conversationStyle: other.data.passport.style,
          sharedInterests: best.comparison.sharedInterests,
        },
      })
    }
    return true
  }

  function respond(socket, invitationId, accept) {
    if (typeof invitationId !== 'string' || bySocket.get(socket.id) !== invitationId) return false
    const invite = pending.get(invitationId)
    if (!invite || ![invite.a.id, invite.b.id].includes(socket.id)) return false
    if (invite.expiresAt <= now()) {
      resolve(invite, 'introduction-expired', 'The introduction timed out.')
      return false
    }
    if (!invite.a.connected || !invite.b.connected || !canIntroduce(invite.a, invite.b)) {
      resolve(invite, 'introduction-cancelled', 'This introduction is no longer available.')
      return false
    }
    if (accept !== true) {
      resolve(invite, 'introduction-declined', 'The introduction was declined.')
      return true
    }
    invite.accepted.add(socket.id)
    socket.emit('introduction-response-recorded', { invitationId })
    if (invite.accepted.has(invite.a.id) && invite.accepted.has(invite.b.id)) {
      resolve(invite, null, null)
      onApproved(invite.a, invite.b, { themeId: invite.themeId })
    }
    return true
  }

  return {
    start,
    respond,
    cancel,
    hasPending: socketId => bySocket.has(socketId),
    waitingCount: () => waiting.size,
    pendingCount: () => pending.size,
  }
}

module.exports = { validatePassport, comparePassports, createConsentIntroductions }
