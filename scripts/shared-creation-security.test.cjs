'use strict'
const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')
const root = path.join(__dirname,'..')
process.env.SOCKET_AUTH_SECRET='CI-ONLY-temporary-shared-creation-test'

function compile(name, overrides={}) {
  const source = fs.readFileSync(path.join(root,name),'utf8')
  const js = ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText
  const exports={}
  vm.runInNewContext(js,{
    exports, Buffer, process, console:{error(){},log(){}},
    require: key => Object.hasOwn(overrides,key) ? overrides[key] : require(key),
  },{filename:name})
  return exports
}
const catalog=compile('src/lib/sharedCreation.ts')
const tokens=compile('src/lib/socketToken.ts',{'./sharedCreation':catalog})
const signer=require('../server/socketAuth')

test('only server-signed, allowed original Co-Create outcomes can be imported into saved Connections',()=>{
  const source={themeId:'weekend-adventures',activity:'food-hunt',setting:'golden-hour'}
  const signed=signer.createConnectionProof('a','b',source)
  const proof=tokens.verifyConnectionProof(signed)
  assert.ok(proof)
  assert.equal(proof.users.length,2)
  assert.equal(proof.creation.themeId,'weekend-adventures')
  assert.equal(proof.creation.activity,'food-hunt')
  assert.equal(proof.creation.setting,'golden-hour')
  assert.equal(tibbonsValidate({themeId:'music-memories',activity:'fake',setting:'cafe'}),null)
  const tampered=signed.slice(0,-1)+(signed.at(-1)==='A'?'B':'A')
  assert.equal(tokens.verifyConnectionProof(tampered),null)
  const invalid=signer.createConnectionProof('a','b',{themeId:'weekend-adventures',activity:'fake',setting:'golden-hour'})
  assert.equal(tokens.verifyConnectionProof(invalid).creation,null)
})
function tibbonsValidate(item){return catalog.validateCreation(item)}

test('only members of an unblocked saved Connection may read or revoke its jointly created card',async()=>{
  let deleted=false,blocked=false
  const creation={connectionId:'conn',themeId:'music-memories',activity:'live-music',setting:'cafe'}
  const prisma={
    sharedCreation:{
      findUnique:async()=>deleted?null:creation,
      deleteMany:async()=>{deleted=true;return {count:1}},
    },
  }
  const access={
    currentUserId:async req=>req.headers.get('x-user'),
    getConnectionForUser:async(id,user)=>id==='conn'&&['a','b'].includes(user)?{connection:{id},person:{id:user==='a'?'b':'a'}}:null,
    isBlockedBetween:async()=>blocked,
  }
  const response={json:(value,init={})=>({status:init.status||200,json:async()=>value})}
  const route=compile('src/app/api/connections/[connectionId]/creation/route.ts',{
    'next/server':{NextResponse:response},
    '@/lib/prisma':{prisma},
    '@/lib/connectionAccess':access,
    '@/lib/sharedCreation':catalog,
  })
  const ctx={params:Promise.resolve({connectionId:'conn'})}
  const req=user=>({headers:new Headers(user?{'x-user':user}:{})})
  assert.equal((await route.GET(req(null),ctx)).status,401)
  assert.equal((await route.GET(req('stranger'),ctx)).status,404)
  const a=await route.GET(req('a'),ctx)
  assert.equal(a.status,200)
  const data=await a.json()
  assert.equal(data.creation.activity,'live-music')
  assert.equal(data.labels.activity,'Find a small live-music show')
  blocked=true
  assert.equal((await route.GET(req('a'),ctx)).status,403)
  assert.equal((await route.DELETE(req('b'),ctx)).status,403)
  blocked=false
  assert.equal((await route.DELETE(req('stranger'),ctx)).status,404)
  const deletedResult=await route.DELETE(req('b'),ctx)
  assert.equal(deletedResult.status,200)
  assert.equal((await route.GET(req('a'),ctx)).json!==undefined,true)
  const after=await (await route.GET(req('a'),ctx)).json()
  assert.equal(after.creation,null)
})
