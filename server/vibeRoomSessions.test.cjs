'use strict'
const { test } = require('node:test')
const assert = require('node:assert/strict')
const { createVibeRoomSessions } = require('./vibeRoomSessions')

function fake(id) {
  const events = []
  return {
    id,
    connected: true,
    events,
    emit(name, payload) { events.push({ name, payload }) },
    last(name = 'vibe-room-state') { return events.filter(e => e.name === name).at(-1)?.payload },
  }
}

function start() {
  const a = fake('alice-socket'), b = fake('bob-socket')
  const rooms = createVibeRoomSessions()
  const id = rooms.start(a, b, ['music', 'food'])
  assert.equal(typeof id, 'string')
  return { a, b, rooms, id }
}

test('both members share a synchronized original Spark round and cannot Vibe early', () => {
  const { a, b, rooms, id } = start()
  assert.equal(a.last().sessionId, id)
  assert.equal(b.last().sessionId, id)
  assert.equal(a.last().round.title, 'THE SPARK')
  assert.equal(a.last().round.id, 'spark-music')
  assert.equal(rooms.canVibe(a.id, b.id), false)
  assert.equal(rooms.next(a, { sessionId: id }), true)
  assert.equal(a.last().waitingForPartner, true)
  assert.equal(b.last().index, 0)
  assert.equal(rooms.next(a, { sessionId: id }), false)
  assert.equal(rooms.next(b, { sessionId: id }), true)
  assert.equal(a.last().index, 1)
  assert.equal(b.last().round.title, 'THE CURVEBALL')
})

test('Curveball answers remain private until both choose, then reveal to correct party', () => {
  const { a, b, rooms, id } = start()
  rooms.next(a, { sessionId: id }); rooms.next(b, { sessionId: id })
  assert.equal(rooms.answer(a, { sessionId: id, choice: 'fake' }), false)
  assert.equal(rooms.answer(a, { sessionId: 'forged', choice: 'explore' }), false)
  assert.equal(rooms.answer(a, { sessionId: id, choice: 'explore' }), true)
  assert.equal(rooms.answer(a, { sessionId: id, choice: 'cozy' }), false)
  assert.equal(a.last().myChoice, 'explore')
  assert.equal(b.last().myChoice, null)
  assert.equal(b.last().reveal, null)
  assert.equal(rooms.next(a, { sessionId: id }), false)
  assert.equal(rooms.answer(b, { sessionId: id, choice: 'cozy' }), true)
  assert.deepEqual(a.last().reveal, [
    { label: 'You', choice: 'explore' }, { label: 'Them', choice: 'cozy' },
  ])
  assert.deepEqual(b.last().reveal, [
    { label: 'You', choice: 'cozy' }, { label: 'Them', choice: 'explore' },
  ])
  rooms.next(a, { sessionId: id }); rooms.next(b, { sessionId: id })
  assert.equal(a.last().round.title, 'THE REAL TALK')
  assert.equal(a.last().reveal, null)
})

test('mutual next on Real Talk completes session, authorizes Vibe, and cannot be replayed', () => {
  const { a, b, rooms, id } = start()
  rooms.next(a, { sessionId: id }); rooms.next(b, { sessionId: id })
  rooms.answer(a, { sessionId: id, choice: 'cozy' })
  rooms.answer(b, { sessionId: id, choice: 'explore' })
  rooms.next(a, { sessionId: id }); rooms.next(b, { sessionId: id })
  assert.equal(rooms.canVibe(a.id, b.id), false)
  rooms.next(a, { sessionId: id })
  assert.equal(rooms.canVibe(a.id, b.id), false)
  rooms.next(b, { sessionId: id })
  assert.equal(a.last().completed, true)
  assert.equal(a.last().round, null)
  assert.equal(rooms.canVibe(a.id, b.id), true)
  assert.equal(rooms.canVibe(b.id, a.id), true)
  assert.equal(rooms.canVibe(a.id, 'stranger'), false)
  assert.equal(rooms.next(a, { sessionId: id }), false)
})

test('disconnect/leave revokes private room data and all Vibe rights', () => {
  const { a, b, rooms, id } = start()
  rooms.next(a, { sessionId: id }); rooms.next(b, { sessionId: id })
  rooms.answer(a, { sessionId: id, choice: 'explore' })
  assert.equal(rooms.cancel(a.id), true)
  assert.equal(rooms.sessionCount(), 0)
  assert.equal(b.last('vibe-room-ended').sessionId, id)
  assert.equal(rooms.answer(b, { sessionId: id, choice: 'cozy' }), false)
  assert.equal(rooms.next(b, { sessionId: id }), false)
  assert.equal(rooms.canVibe(a.id, b.id), false)
})

test('stale/unpaired sockets cannot read, mutate or complete other rooms', () => {
  const { a, b, rooms, id } = start()
  const outsider = fake('outsider')
  assert.equal(rooms.answer(outsider, { sessionId: id, choice: 'cozy' }), false)
  assert.equal(rooms.next(outsider, { sessionId: id }), false)
  const another = rooms.start(a, outsider, [])
  assert.equal(typeof another, 'string')
  assert.equal(rooms.canVibe(a.id, b.id), false)
  assert.equal(rooms.next(b, { sessionId: id }), false)
})
