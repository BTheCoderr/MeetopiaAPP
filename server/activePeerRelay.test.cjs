'use strict'
const { test } = require('node:test')
const assert = require('node:assert/strict')
const { isActivePeerRelay } = require('./activePeerRelay')

test('only a reciprocal active pair may relay messages', () => {
  const pairs = new Map([['alice-socket', 'bob-socket'], ['bob-socket', 'alice-socket']])
  assert.equal(isActivePeerRelay(pairs, 'alice-socket', 'bob-socket'), true)
  assert.equal(isActivePeerRelay(pairs, 'bob-socket', 'alice-socket'), true)
  assert.equal(isActivePeerRelay(pairs, 'alice-socket', 'alice-socket'), false)
  assert.equal(isActivePeerRelay(pairs, 'alice-socket', 'stranger'), false)
  assert.equal(isActivePeerRelay(pairs, 'stranger', 'bob-socket'), false)
  assert.equal(isActivePeerRelay(pairs, 'alice-socket', null), false)
  assert.equal(isActivePeerRelay(pairs, 'alice-socket', { id: 'bob-socket' }), false)
})

test('one-sided or revoked pair does not permit relays', () => {
  const pairs = new Map([['alice-socket', 'bob-socket']])
  assert.equal(isActivePeerRelay(pairs, 'alice-socket', 'bob-socket'), false)
  pairs.set('bob-socket', 'alice-socket')
  assert.equal(isActivePeerRelay(pairs, 'alice-socket', 'bob-socket'), true)
  pairs.delete('bob-socket')
  assert.equal(isActivePeerRelay(pairs, 'alice-socket', 'bob-socket'), false)
})
