'use strict'
const { test } = require('node:test')
const assert = require('node:assert/strict')
const { createVibeRoomSessions } = require('./vibeRoomSessions')

function fake(id) {
  const events=[]
  return { id, connected:true, events,
    emit(name, payload){ events.push({name,payload}) },
    last(name='vibe-room-state'){ return events.filter(e => e.name===name).at(-1)?.payload },
  }
}
function start(themeId='music-memories') {
  const a=fake('a'), b=fake('b'), rooms=createVibeRoomSessions()
  const id=rooms.start(a,b,themeId)
  assert.equal(typeof id,'string')
  return {a,b,rooms,id}
}
function bridgeStage({a,b,rooms,id}){
  rooms.next(a,{sessionId:id});rooms.next(b,{sessionId:id})
  rooms.answer(a,{sessionId:id,choice:'explore'})
  rooms.answer(b,{sessionId:id,choice:'cozy'})
  rooms.next(a,{sessionId:id});rooms.next(b,{sessionId:id})
  rooms.next(a,{sessionId:id});rooms.next(b,{sessionId:id})
  assert.equal(a.last().index,3)
  assert.equal(a.last().round.title,'THE BRIDGE')
}
test('theme selects an original shared Spark prompt and no user can Vibe early',()=>{
  const {a,b,rooms,id}=start()
  assert.equal(a.last().themeTitle,'Music & Memories')
  assert.equal(a.last().round.id,'spark-music-memories')
  assert.equal(a.last().round.title,'THE SPARK')
  assert.equal(rooms.canVibe(a.id,b.id),false)
  assert.equal(rooms.next(a,{sessionId:id}),true)
  assert.equal(a.last().waitingForPartner,true)
  assert.equal(b.last().index,0)
  assert.equal(rooms.next(a,{sessionId:id}),false)
  assert.equal(rooms.next(b,{sessionId:id}),true)
  assert.equal(a.last().index,1)
})
test('Curveball private choices remain hidden until both choose',()=>{
  const {a,b,rooms,id}=start()
  rooms.next(a,{sessionId:id});rooms.next(b,{sessionId:id})
  assert.equal(rooms.answer(a,{sessionId:id,choice:'fake'}),false)
  assert.equal(rooms.answer(a,{sessionId:'forged',choice:'explore'}),false)
  assert.equal(rooms.answer(a,{sessionId:id,choice:'explore'}),true)
  assert.equal(rooms.answer(a,{sessionId:id,choice:'cozy'}),false)
  assert.equal(a.last().myChoice,'explore')
  assert.equal(b.last().myChoice,null)
  assert.equal(b.last().reveal,null)
  assert.equal(rooms.next(a,{sessionId:id}),false)
  assert.equal(rooms.answer(b,{sessionId:id,choice:'cozy'}),true)
  assert.deepEqual(a.last().reveal,[{label:'You',choice:'explore'},{label:'Them',choice:'cozy'}])
  assert.deepEqual(b.last().reveal,[{label:'You',choice:'cozy'},{label:'Them',choice:'explore'}])
  rooms.next(a,{sessionId:id});rooms.next(b,{sessionId:id})
  assert.equal(a.last().round.title,'THE REAL TALK')
  assert.equal(a.last().reveal,null)
})
test('The Bridge splits complementary roles and hides proposals until BOTH contribute',()=>{
  const state=start('weekend-adventures'),{a,b,rooms,id}=state
  bridgeStage(state)
  assert.equal(a.last().bridge.role,'activity')
  assert.equal(b.last().bridge.role,'setting')
  assert.equal(rooms.contribute(a,{sessionId:id,choice:'fake'}),false)
  assert.equal(rooms.contribute(a,{sessionId:id,choice:'food-hunt'}),true)
  assert.equal(b.last().bridge.myChoice,null)
  assert.equal(b.last().bridge.proposal,null)
  assert.equal(b.last().bridge.proposalLabels,null)
  assert.equal(rooms.next(a,{sessionId:id}),false)
  assert.equal(rooms.approve(a,{sessionId:id,revision:1,share:true}),false)
  assert.equal(rooms.contribute(b,{sessionId:id,choice:'golden-hour'}),true)
  assert.deepEqual(a.last().bridge.proposal,{activity:'food-hunt',setting:'golden-hour'})
  assert.equal(a.last().bridge.proposalLabels.activity,'Discover a new food spot')
  assert.equal(b.last().bridge.proposalLabels.setting,'Just before sunset')
  assert.equal(rooms.canVibe(a.id,b.id),false)
})
test('approval is explicitly mutual, revision-safe and produces one approved artifact',()=>{
  const state=start('weekend-adventures'),{a,b,rooms,id}=state
  bridgeStage(state)
  rooms.contribute(a,{sessionId:id,choice:'food-hunt'})
  rooms.contribute(b,{sessionId:id,choice:'golden-hour'})
  const revision=a.last().bridge.revision
  assert.equal(rooms.approve(a,{sessionId:id,revision,share:false}),false)
  assert.equal(rooms.approve(a,{sessionId:id,revision,share:true}),true)
  assert.equal(rooms.canVibe(a.id,b.id),false)
  assert.equal(rooms.approve(a,{sessionId:id,revision,share:true}),false)
  assert.equal(rooms.contribute(b,{sessionId:id,choice:'daylight'}),true)
  assert.equal(a.last().bridge.approved,false)
  assert.equal(rooms.approve(a,{sessionId:id,revision,share:true}),false)
  const newRevision=a.last().bridge.revision
  assert.equal(newRevision>revision,true)
  assert.equal(rooms.approve(a,{sessionId:id,revision:newRevision,share:true}),true)
  assert.equal(rooms.canVibe(a.id,b.id),false)
  assert.equal(rooms.approve(b,{sessionId:id,revision:newRevision,share:true}),true)
  assert.equal(a.last().completed,true)
  assert.equal(a.last().round,null)
  assert.deepEqual(rooms.approvedOutcome(a.id,b.id),{themeId:'weekend-adventures',activity:'food-hunt',setting:'daylight'})
  assert.equal(rooms.canVibe(a.id,b.id),true)
  assert.equal(rooms.canVibe(b.id,a.id),true)
  assert.equal(rooms.canVibe(a.id,'outsider'),false)
  assert.equal(rooms.approve(a,{sessionId:id,revision:newRevision,share:true}),false)
  assert.equal(rooms.contribute(a,{sessionId:id,choice:'creative-stop'}),false)
})
test('skip, disconnect and stale session clear private choices and approved artifacts',()=>{
  const state=start(),{a,b,rooms,id}=state
  bridgeStage(state)
  rooms.contribute(a,{sessionId:id,choice:'live-music'})
  assert.equal(rooms.cancel(a.id),true)
  assert.equal(rooms.sessionCount(),0)
  assert.equal(b.last('vibe-room-ended').sessionId,id)
  assert.equal(rooms.contribute(b,{sessionId:id,choice:'cafe'}),false)
  assert.equal(rooms.approve(b,{sessionId:id,revision:1,share:true}),false)
  assert.equal(rooms.canVibe(a.id,b.id),false)
})
test('a forged or unpaired socket cannot advance, approve, reveal or Vibe',()=>{
  const {a,b,rooms,id}=start()
  const outsider=fake('stranger')
  for(const action of [
    () => rooms.answer(outsider,{sessionId:id,choice:'explore'}),
    () => rooms.next(outsider,{sessionId:id}),
    () => rooms.contribute(outsider,{sessionId:id,choice:'live-music'}),
    () => rooms.approve(outsider,{sessionId:id,revision:2,share:true}),
    () => rooms.contribute(a,{sessionId:'wrong',choice:'live-music'}),
  ]) assert.equal(action(),false)
  assert.equal(rooms.start(a,outsider,'bad-theme'),null)
  const newId=rooms.start(a,outsider,'curious-minds')
  assert.equal(typeof newId,'string')
  assert.equal(rooms.next(b,{sessionId:id}),false)
  assert.equal(rooms.canVibe(a.id,b.id),false)
})
