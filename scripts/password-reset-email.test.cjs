const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')
const vm = require('node:vm')
const exportsObj = {}
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/passwordResetEmail.ts', 'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText, {exports:exportsObj,URL,AbortSignal,process,fetch})
const { passwordResetConfig, sendPasswordResetEmail } = exportsObj
const env = {PASSWORD_RESET_EMAIL_PROVIDER:'smtp2go',SMTP2GO_API_KEY:'test-only',PASSWORD_RESET_FROM_EMAIL:'test@example.invalid',PASSWORD_RESET_BASE_URL:'https://meetopia-live.netlify.app'}
test('configuration fails closed, requires explicit provider and fixed HTTPS origin', () => {
  assert.equal(passwordResetConfig({...env,SMTP2GO_API_KEY:''}),null)
  assert.equal(passwordResetConfig({...env,PASSWORD_RESET_EMAIL_PROVIDER:'unknown'}),null)
  assert.equal(passwordResetConfig({...env,PASSWORD_RESET_BASE_URL:'http://example.invalid'}),null)
  assert.equal(passwordResetConfig({...env,PASSWORD_RESET_BASE_URL:'https://example.invalid/path'}),null)
  assert.equal(passwordResetConfig({...env,MEETOPIA_DEPLOY_ENV:'staging'}),null)
  assert.ok(passwordResetConfig({...env,MEETOPIA_DEPLOY_ENV:'staging',PASSWORD_RESET_BASE_URL:'https://meetopia-stage-web-e25e.onrender.com'}))
  assert.equal(passwordResetConfig(env).origin,'https://meetopia-live.netlify.app')
})
test('SMTP2GO uses correct endpoint and accepts only confirmed single-recipient success',async()=>{
  const c=passwordResetConfig(env)
  const msg={to:'recipient@example.invalid',subject:'test',text:'body'}
  assert.equal(await sendPasswordResetEmail(c,msg,async(url,init)=>{
    assert.equal(url,'https://api.smtp2go.com/v3/email/send')
    assert.equal(init.headers['X-Smtp2go-Api-Key'],'test-only')
    assert.equal(init.redirect,'error')
    assert.equal(JSON.parse(init.body).text_body,'body')
    return new Response(JSON.stringify({data:{succeeded:1,failed:0}}),{status:200})
  }),true)
  assert.equal(await sendPasswordResetEmail(c,msg,async()=>new Response(JSON.stringify({data:{succeeded:0,failed:1}}),{status:200})),false)
  assert.equal(await sendPasswordResetEmail(c,msg,async()=>{throw new Error('network')}),false)
})
test('Resend is explicitly selected only; no automatic fallback',async()=>{
  const c=passwordResetConfig({...env,PASSWORD_RESET_EMAIL_PROVIDER:'resend',RESEND_API_KEY:'test-only'})
  let calls=0
  const ok=await sendPasswordResetEmail(c,{to:'recipient@example.invalid',subject:'test',text:'body'},async(url)=>{calls++;assert.equal(url,'https://api.resend.com/emails');return new Response('{}',{status:403})})
  assert.equal(ok,false);assert.equal(calls,1)
})
