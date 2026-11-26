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
  q.start(a, 'music-memories'); q.start(b, 'music-memories')
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
  q.start(a, 'music-memories'); q.start(b, 'music-memories')
  const id=event(a,'introduction-offered').payload.invitationId
  q.respond(a,id,false)
  assert.ok(event(b,'introduction-declined'))
  assert.equal(q.respond(b,id,true),false)
  q.start(a, 'music-memories'); q.start(b, 'music-memories')
  q.cancel(a.id)
  assert.ok(event(b,'introduction-cancelled'))
  assert.equal(approved,0)
})

test('blocks, same account and missing passport never create an offer', () => {
  const q=createConsentIntroductions({canIntroduce:()=>false,onApproved:()=>{throw Error('unwanted pair')}})
  const a=fake('a','u1'), b=fake('b','u2')
  q.start(a, 'music-memories'); q.start(b, 'music-memories')
  assert.equal(q.pendingCount(),0)
  assert.equal(q.waitingCount(),2)
  const c=fake('c','u3',null)
  assert.equal(q.start(c, 'music-memories'),false)
  assert.equal(event(c,'match-error').payload.code,'PASSPORT_REQUIRED')
})

test('expiration does not authorize a call', async () => {
  let approved=0
  const q=createConsentIntroductions({canIntroduce:()=>true,onApproved:()=>approved++,ttlMs:12})
  const a=fake('a','u1'), b=fake('b','u2')
  q.start(a, 'music-memories'); q.start(b, 'music-memories')
  const id=event(a,'introduction-offered').payload.invitationId
  q.respond(a,id,true)
  await new Promise(resolve=>setTimeout(resolve,35))
  assert.equal(q.respond(b,id,true),false)
  assert.equal(approved,0)
  assert.ok(event(a,'introduction-expired'))
})

test('a themed Vibe Session requires a real opt-in and matches only same-theme adults', () => {
  const approved = []
  const q = createConsentIntroductions({ canIntroduce: () => true, onApproved: (a,b,context) => approved.push(context) })
  const a=fake('a','alice'), b=fake('b','bob'), c=fake('c','carol')
  assert.equal(q.start(a, 'invented-theme'), false)
  assert.equal(event(a,'match-error').payload.code, 'THEME_REQUIRED')
  assert.equal(q.start(a, 'music-memories'), true)
  assert.equal(q.start(b, 'curious-minds'), true)
  assert.equal(q.pendingCount(),0)
  assert.equal(q.waitingCount(),2)
  assert.equal(q.start(c, 'music-memories'), true)
  const invite=event(a,'introduction-offered')?.payload
  assert.equal(invite.themeId,'music-memories')
  assert.equal(invite.themeTitle,'Music & Memories')
  assert.equal(event(b,'introduction-offered'),undefined)
  assert.equal(q.respond(a, invite.invitationId, true),true)
  assert.equal(q.respond(c, invite.invitationId, true),true)
  assert.equal(approved.length,1)
  assert.deepEqual(approved[0],{themeId:'music-memories'})
})
