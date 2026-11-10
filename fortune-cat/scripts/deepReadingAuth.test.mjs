import test from 'node:test'
import assert from 'node:assert/strict'
import { createDeepReadingRequest, createTossResourceFetch } from '../src/lib/deepReadingAuth.js'
const reply=()=>({ok:true,json:async()=>({})})
for(const owner of ['legacy-1','toss:202'])test(`requests overwrite forged owner with verified ${owner}`,async()=>{
  const calls=[];const request=createDeepReadingRequest({baseUrl:'https://example.test',session:()=>({userId:owner,token:'signed'}),fetcher:async(...args)=>{calls.push(args);return reply()}})
  await request('/quota?user_anonymous_id=forged');assert.equal(new URL(calls[0][0]).searchParams.get('user_anonymous_id'),owner)
  await request('/deep-reading/chat?user_anonymous_id=forged',{method:'POST',headers:{'X-API-Key':'bad','X-Toss-Access-Token':'bad',Authorization:'bad','X-Tarot-User':'bad'},body:JSON.stringify({user_anonymous_id:'forged',message:'fixture'})})
  assert.equal(JSON.parse(calls[1][1].body).user_anonymous_id,owner);assert.equal(new URL(calls[1][0]).searchParams.has('user_anonymous_id'),false)
  for(const name of ['X-API-Key','X-Toss-Access-Token','Authorization','X-Tarot-User'])assert.equal(calls[1][1].headers.get(name),null)
  assert.equal(calls[1][1].headers.get('X-Toss-Anon-Token'),'signed');assert.equal(calls[1][1].redirect,'error')
  const form=new FormData();form.append('user_anonymous_id','forged');await request('/deep-reading/start',{method:'POST',body:form});assert.equal(calls[2][1].body.get('user_anonymous_id'),owner);assert.equal(form.get('user_anonymous_id'),'forged')
})
for(const userId of [undefined,'a b','toss:',{},1])test('invalid or missing session denied before network',async()=>{
  const request=createDeepReadingRequest({baseUrl:'https://example.test',session:()=>({userId,token:'fixture'}),fetcher:()=>assert.fail('no network')});await assert.rejects(request('/quota'),/사용자 확인/)
})
for(const path of ['https://evil.test/quota','/toss-login','/toss-anonymous-session','/admin','/tarot/sessions'])test(`reading target forbidden ${path}`,async()=>{
  const request=createDeepReadingRequest({baseUrl:'https://example.test',session:()=>({userId:'legacy',token:'fixture'}),fetcher:()=>assert.fail('no network')});await assert.rejects(request(path),/주소/)
})
for(const factory of [createDeepReadingRequest,createTossResourceFetch])for(const stale of [false,true])test(`${factory.name} 401 clears only matching token (${stale})`,async()=>{
  let account={userId:'legacy',token:'old'},cleared=0,calls=0;const request=factory({baseUrl:'https://example.test',session:()=>account,onUnauthorized:()=>{cleared++;account=null},fetcher:async()=>{calls++;if(stale)account={userId:'legacy',token:'new'};return{ok:false,status:401}}});await request(factory===createDeepReadingRequest?'/quota':'/tarot/sessions/history');assert.equal(calls,1);assert.equal(cleared,stale?0:1)
})
test('Tarot capability preserved and competing authentication stripped',async()=>{
  const request=createTossResourceFetch({baseUrl:'https://example.test',session:()=>({userId:'legacy',token:'signed'}),fetcher:async(url,opts)=>{assert.equal(opts.headers.get('X-Tarot-Token'),'capability');assert.equal(opts.headers.get('X-Toss-Anon-Token'),'signed');assert.equal(opts.headers.get('X-Toss-Access-Token'),null);return reply()}});await request('/tarot/sessions/history',{headers:{'X-Tarot-Token':'capability','X-Toss-Access-Token':'old'}});await assert.rejects(request('https://evil.test/tarot/sessions/history'));await assert.rejects(request('/quota'))
})
