'use strict'

const { test } = require('node:test')
const assert = require('node:assert/strict')
const { validatePassport, comparePassports, createConsentIntroductions } = require('./consentIntroductions')

const passport = (interests = ['music', 'travel'], intent = 'relationship', style = 'balanced') => ({ interests, intent, style })
function fake(id, userId, p = passport()) {
  const events = []
  return {
    id, connected: true,
    data: { userId, displayName: 'Member ' + id, adultConfirmed: true, passport: p },
    events, emit: (name, payload) => events.push({ name, payload }),
  }
}
const event = (s, name) => s.events.filter(e => e.name === name).at(-1)

test('passport validation rejects fabricated or overlong matching preferences', () => {
  assert.equal(validatePassport({}), null)
  assert.equal(validatePassport(passport(['music', 'music'])), null)
  assert.equal(validatePassport(passport(['music', 'fake'])), null)
  assert.equal(validatePassport(passport(['music'])), null)
  assert.deepEqual(validatePassport(passport()), passport())
})

test('shared interests and compatible intent are required', () => {
  assert.equal(comparePassports(passport(), passport(['gaming','tech'])), null)
  assert.equal(comparePassports(passport(), passport(['music','art'], 'friendship')), null)
  assert.deepEqual(comparePassports(passport(), passport(['music','food'], 'open'))?.sharedInterests, ['music'])
})

test('both explicit acceptances required before active WebRTC pairing', () => {
  let approved = 0
  const q = createConsentIntroductions({ canIntroduce: () => true, onApproved: () => approved++ })
  const a = fake('a','u1'), b = fake('b','u2')
  q.start(a); q.start(b)
  const id = event(a,'introduction-offered').payload.invitationId
  assert.equal(approved,0)
  assert.equal(q.pendingCount(),1)
  assert.equal(q.respond(a,id,true),true)
  assert.equal(approved,0)
  assert.equal(q.respond(b,'wrong',true),false)
  assert.equal(approved,0)
  assert.equal(q.respond(b,id,true),true)
  assert.equal(approved,1)
  assert.equal(q.respond(b,id,true),false)
})

test('declines and disconnects revoke pending invites', () => {
  let approved=0
  const q = createConsentIntroductions({ canIntroduce:()=>true, onApproved:()=>approved++ })
  const a=fake('a','u1'), b=fake('b','u2')
  q.start(a); q.start(b)
  const id=event(a,'introduction-offered').payload.invitationId
  q.respond(a,id,false)
  assert.ok(event(b,'introduction-declined'))
  assert.equal(q.respond(b,id,true),false)
  q.start(a); q.start(b)
  q.cancel(a.id)
  assert.ok(event(b,'introduction-cancelled'))
  assert.equal(approved,0)
})

test('blocks, same account and missing passport never create an offer', () => {
  const q=createConsentIntroductions({canIntroduce:()=>false,onApproved:()=>{throw Error('unwanted pair')}})
  const a=fake('a','u1'), b=fake('b','u2')
  q.start(a); q.start(b)
  assert.equal(q.pendingCount(),0)
  assert.equal(q.waitingCount(),2)
  const c=fake('c','u3',null)
  assert.equal(q.start(c),false)
  assert.equal(event(c,'match-error').payload.code,'PASSPORT_REQUIRED')
})

test('expiration does not authorize a call', async () => {
  let approved=0
  const q=createConsentIntroductions({canIntroduce:()=>true,onApproved:()=>approved++,ttlMs:12})
  const a=fake('a','u1'), b=fake('b','u2')
  q.start(a); q.start(b)
  const id=event(a,'introduction-offered').payload.invitationId
  q.respond(a,id,true)
  await new Promise(resolve=>setTimeout(resolve,35))
  assert.equal(q.respond(b,id,true),false)
  assert.equal(approved,0)
  assert.ok(event(a,'introduction-expired'))
})
