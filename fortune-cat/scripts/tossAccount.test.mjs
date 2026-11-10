import test from 'node:test'
import assert from 'node:assert/strict'
import { createTossAccountHeaders, validAccountId } from '../src/lib/tossAccount.js'
const reply = (data = { token: 'fixture-token', userId: 'old_anon-1', expiresIn: 900 }, status = 200) => ({ ok: status < 400, status, json: async () => data })
const fixture = extra => createTossAccountHeaders({ baseUrl: 'https://example.test', readIntro: () => true, createAnonymousKeyAuthCode: async () => ({code:'fixture-code',expiresIn:300}), fetcher: async () => reply(), appLogin: () => assert.fail('OAuth must be explicit'), ...extra })
const deferred = () => { let resolve; const promise = new Promise(r => {resolve=r}); return {promise,resolve} }

test('fresh single-use proof only, exact body, shared exchange and legacy UID', async () => {
  let proofs=0, exchanges=0, markers=0
  const account=fixture({createAnonymousKeyAuthCode: async () => ({code:`proof-${++proofs}`,expiresIn:300}),writeIntro: () => markers++,fetcher: async (url, options) => {
    exchanges++; assert.equal(url,'https://example.test/toss-anonymous-session'); assert.deepEqual(JSON.parse(options.body),{code:`proof-${exchanges}`}); assert.equal(options.redirect,'error'); return reply()
  }})
  await Promise.all([account(),account(),account.restore()]); assert.deepEqual([proofs,exchanges,markers],[1,1,1]); assert.equal(account.getSession().userId,'old_anon-1'); assert.deepEqual(await account(),{'X-Toss-Anon-Token':'fixture-token'})
})
for (const marker of [false,undefined,'1',1,{},null]) test(`marker ${String(marker)} cannot authorize or request proof`,async()=>{
  const account=fixture({readIntro:()=>marker,createAnonymousKeyAuthCode:()=>assert.fail('first entry must wait')}); assert.equal(await account.restore(),null); assert.equal(account.getSession(),null)
})
test('even a forged completed marker requires server authentication',async()=>{
  let calls=0; const account=fixture({fetcher:async()=>{calls++;return reply({},401)}});assert.equal(await account.restore(),null);assert.equal(await account.restore(),null);assert.equal(calls,1);assert.equal(account.getSession(),null)
})
for (const readIntro of [()=>{throw Error('private')},()=>new Promise(()=>{})]) test('marker failure bounded and no silent fallback',async()=>{
  const account=fixture({readIntro,timeoutMs:5,createAnonymousKeyAuthCode:()=>assert.fail('no proof')});assert.equal(await account.restore(),null)
})
for (const userId of ['old-key_1','toss:202','toss:opaque_owner', 'a'.repeat(200)]) test(`valid owner ${userId.slice(0,20)} preserved`,async()=>{
  const account=fixture({fetcher:async()=>reply({token:'fixture',userId,expiresIn:900})});await account();assert.equal(account.getSession().userId,userId)
})
for (const userId of [undefined,null,'','toss:','toss:a:b','a'.repeat(201),'a/b','a b',{},1]) test('malformed owner never published',async()=>{
  assert.equal(validAccountId(userId),false); const account=fixture({fetcher:async()=>reply({token:'fixture',userId,expiresIn:900})});await assert.rejects(account(),e=>e.stage==='exchangeInvalid');assert.equal(account.getSession(),null)
})
for (const token of [undefined,null,'','a b','a\nb','a'.repeat(4097),{},1]) test('invalid token never cached',async()=>{
  const account=fixture({fetcher:async()=>reply({token,userId:'legacy',expiresIn:900})});await assert.rejects(account(),e=>e.stage==='exchangeInvalid')
})
for (const expiresIn of [undefined,null,0,60,899,901,3600,'900',true]) test('server lifetime must be exactly 900 seconds',async()=>{
  const account=fixture({fetcher:async()=>reply({token:'fixture',userId:'legacy',expiresIn})});await assert.rejects(account(),e=>e.stage==='exchangeInvalid')
})
for (const proof of [undefined,{}, {code:'',expiresIn:300},{code:'  ',expiresIn:300},{code:'a'.repeat(2049),expiresIn:300},{code:'proof',expiresIn:0},{code:'proof',expiresIn:'300'}]) test('invalid native proof rejected before exchange',async()=>{
  const account=fixture({createAnonymousKeyAuthCode:()=>proof,fetcher:()=>assert.fail('no exchange')});await assert.rejects(account(),e=>e.stage==='login')
})
for (const stage of ['native','network','body','401','503']) test(`failed ${stage} attempt sanitized and explicit retry uses fresh code`,async()=>{
  let proofs=0, fail=true
  const account=fixture({createAnonymousKeyAuthCode:()=>{proofs++;if(fail&&stage==='native')throw Error('private native payload');return {code:`proof-${proofs}`,expiresIn:300}},fetcher:()=>{if(fail){if(stage==='network')throw Error('private network payload');if(stage==='body')return{ok:true,json:()=>{throw Error('private body')}};if(['401','503'].includes(stage))return reply({},Number(stage))}return reply()}})
  assert.equal(await account.restore(),null);assert.equal(await account.restore(),null);assert.equal(account.getSession(),null);fail=false;await account();assert.equal(proofs,2)
})
for (const stage of ['native','exchange','body']) test(`${stage} timeout cannot publish a late response`,async()=>{
  const pending=deferred();const account=fixture({timeoutMs:5,createAnonymousKeyAuthCode:stage==='native'?()=>pending.promise:async()=>({code:'proof',expiresIn:300}),fetcher:stage==='exchange'?()=>pending.promise:async()=>stage==='body'?{ok:true,json:()=>pending.promise}:reply()});assert.equal(await account.restore(),null);pending.resolve(reply());await Promise.resolve();assert.equal(account.getSession(),null)
})
for (const stage of ['native','exchange']) test(`clear during ${stage} invalidates late generation`,async()=>{
  const d=deferred();let calls=0
  const account=fixture({createAnonymousKeyAuthCode:async()=>stage==='native'&&++calls===1?d.promise:{code:'proof',expiresIn:300},fetcher:async()=>stage==='exchange'&&++calls===1?d.promise:reply({token:'new',userId:'new',expiresIn:900})})
  const request=account.restore();for(let i=0;i<20;i++)await Promise.resolve();account.clear();await account();d.resolve(stage==='native'?{code:'old',expiresIn:300}:reply());assert.equal(await request,null);assert.equal(account.getSession().token,'new')
})
test('expiry obtains fresh proof, clear suppresses automatic loop, manual retry available',async()=>{
  let time=0, proofs=0;const account=fixture({now:()=>time,createAnonymousKeyAuthCode:()=>({code:`proof-${++proofs}`,expiresIn:300})});await account.restore();time=839999;await account.restore();assert.equal(proofs,1);time=840000;await Promise.all([account.restore(),account.restore()]);assert.equal(proofs,2);account.clear();assert.equal(await account.restore(),null);assert.equal(proofs,2);await account();assert.equal(proofs,3)
})
test('origin binding rejects before native proof and prevents credential redirect',async()=>{
  const account=fixture({createAnonymousKeyAuthCode:()=>assert.fail('no proof')});for(const url of ['https://evil.test/tarot/sessions','https://user:pass@example.test/tarot/sessions'])await assert.rejects(account(url));assert.equal(account.getSession(),null)
})
for(const linked of [false,undefined,'true',1])test('legacy recovery requires strict server acknowledgment',async()=>{
  let calls=0;const account=fixture({appLogin:async()=>({authorizationCode:'oauth-proof',referrer:'DEFAULT'}),fetcher:async()=>{calls++;return reply({legacyLinked:linked})}});await assert.rejects(account.recoverLegacy(),e=>e.stage==='exchangeInvalid');assert.equal(calls,1);assert.equal(account.getSession(),null)
})
test('explicit recovery alone uses OAuth, fresh proof after link, shared session changes owner',async()=>{
  let proofs=0, oauth=0;const bodies=[];const account=fixture({appLogin:async()=>{oauth++;return{authorizationCode:'oauth',referrer:'DEFAULT'}},createAnonymousKeyAuthCode:()=>({code:`proof-${++proofs}`,expiresIn:300}),fetcher:async(url,opts)=>{bodies.push(JSON.parse(opts.body));return url.endsWith('/toss-login')?reply({legacyLinked:true}):reply({token:'fixture',userId:oauth?'toss:303':'legacy',expiresIn:900})}});await account();assert.equal(oauth,0);await Promise.all([account.recoverLegacy(),account.recoverLegacy()]);assert.equal(oauth,1);assert.equal(account.getSession().userId,'toss:303');assert.deepEqual(bodies,[{code:'proof-1'},{authorizationCode:'oauth',referrer:'DEFAULT',anonymousAuthCode:'proof-2'},{code:'proof-3'}])
})

test('new JS instance uses only presentation marker and fresh native proof, never persisted token',async()=>{
  let completed=false,proofs=0
  for(let i=0;i<2;i++){
    const account=fixture({readIntro:()=>completed,writeIntro:()=>{completed=true},createAnonymousKeyAuthCode:()=>({code:`new-${++proofs}`,expiresIn:300})})
    if(i===0){assert.equal(await account.restore(),null);await account()}
    else {assert.equal(account.getSession(),null);await account.restore()}
    assert.equal(account.getSession().userId,'old_anon-1')
  }
  assert.equal(proofs,2)
})
