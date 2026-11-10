import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import TossAccountGate from './src/components/TossAccountGate.jsx'
import LibraryRecoveryHelp from './src/components/LibraryRecoveryHelp.jsx'
import { createTarotLibrary } from './src/lib/tarotLibrary.js'
import { createTarotConsultation } from './src/lib/tarotConsultation.js'
import { authenticatedReadingFetch, authenticatedTarotFetch, backend, customer, getTossAccountHeaders, getTossSession, helper, subscribeTossAccount } from './session.js'
import './src/index.css'
import './preview.css'

function Library() {
  const [owner,setOwner]=useState(()=>getTossSession()?.userId)
  const [data,setData]=useState(null)
  const [result,setResult]=useState(null)
  const [error,setError]=useState(null)
  const [busy,setBusy]=useState(false)
  const tarot = createTarotLibrary({baseUrl:backend,accountHeaders:getTossAccountHeaders,fetcher:authenticatedTarotFetch})
  useEffect(()=>subscribeTossAccount(()=>setOwner(getTossSession()?.userId)),[])
  async function load() {
    const responses=await Promise.all([authenticatedReadingFetch('/quota'),authenticatedReadingFetch('/deep-reading/history'),tarot.list()])
    if(!responses[0].ok||!responses[1].ok)throw Error(`MOCK ${responses[0].status}/${responses[1].status}`)
    setData({quota:await responses[0].json(),readings:(await responses[1].json()).items,tarot:responses[2].items})
  }
  useEffect(()=>{setData(null);setResult(null);load().catch(e=>setError(e.message))},[owner])
  async function run(work) {if(busy)return;setBusy(true);setError(null);try{setResult(await work());await load()}catch(e){setError(e.message)}finally{setBusy(false)}}
  async function request(path,body) {const r=await authenticatedReadingFetch(path,body?{method:'POST',body:JSON.stringify(body)}:{});if(!r.ok)throw Error(`MOCK HTTP ${r.status}`);return r.json()}
  const [order,setOrder]=useState('preview-order-local-1')
  return <main className="preview-library" data-testid="protected">
    <h1>내 풀이 보관함</h1><p data-testid="owner">검증된 테스트 사용자: {owner}</p>
    {data && !owner.startsWith('toss:') && data.readings.length === 0 && data.tarot.length === 0 && <LibraryRecoveryHelp key={owner} />}
    {error&&<p role="alert">{error}</p>}
    {!data?<p role="status">테스트 보관함을 불러오고 있어요.</p>:<>
      <h2>남은 이용권</h2><pre data-testid="quota">{JSON.stringify(data.quota,null,2)}</pre>
      <h2>기존 사주 풀이 ({data.readings.length})</h2>
      {data.readings.map(item=><button key={item.thread_id} disabled={busy} onClick={()=>run(()=>request(`/deep-reading/conversation?thread_id=${item.thread_id}`))}>{item.title||item.thread_id}</button>)}
      <h2>기존 타로 풀이 ({data.tarot.length})</h2>
      {data.tarot.map(item=><button key={item.id} disabled={busy} onClick={()=>run(()=>tarot.detail(item.id))}>{item.question||item.id}</button>)}
      <h2>생성·권한 테스트</h2>
      <button disabled={busy} onClick={()=>run(()=>request('/deep-reading/start',{paid:true,reading_type:'preview'}))}>MOCK 유료 풀이 생성 (이용권 1회 차감)</button>
      <button disabled={busy} onClick={()=>run(()=>request(`/deep-reading/conversation?thread_id=${customer==='other'?'preview-reading-1':'preview-reading-3'}`))}>다른 사용자 풀이 요청 (404 예상)</button>
      <button disabled={busy} onClick={()=>run(async()=>{
        const memory=new Map();const client=createTarotConsultation({baseUrl:backend,accountHeaders:getTossAccountHeaders,fetcher:authenticatedTarotFetch,storage:{getItem:async k=>memory.get(k),setItem:async(k,v)=>memory.set(k,v),removeItem:async k=>memory.delete(k)}})
        await client.start('[MOCK] 새로운 일을 시작해도 될까요?');const state=client.getSnapshot();if(state.error)throw Error(state.error);return state.session
      })}>MOCK 새 타로 상담 (무료 사용 여부 유지)</button>
      <label>테스트 주문 ID<input value={order} onChange={e=>setOrder(e.target.value)} /></label>
      <button disabled={busy} onClick={()=>run(()=>request('/payment/deep-reading/toss-grant',{orderId:order}))}>MOCK 결제 지급 (같은 주문은 한 번)</button>
      <button disabled={busy} onClick={()=>run(()=>helper('state'))}>테스트 데이터·호출 횟수 확인</button>
      <button disabled={busy} onClick={()=>run(async()=>{await window.__preview.expire();return {mock:true,refreshed:true}})}>15분 경과, 새 익명 인증</button>
      {result&&<pre data-testid="result">{JSON.stringify(result,null,2)}</pre>}
    </>}
  </main>
}
function Controls() {
  const params=new URLSearchParams(location.search)
  const [selected,setSelected]=useState(customer)
  const [scenario,setScenario]=useState(params.get('scenario')||'normal')
  return <aside className="preview-controls"><strong>로컬 MOCK 테스트, 실제 고객·AI·결제 호출 없음</strong>
    <details><summary>테스트 조건 변경</summary>
      <label>고객<select value={selected} onChange={e=>setSelected(e.target.value)}>{[['legacy','기존 익명 고객'],['mapped','연결된 기존 고객'],['new','새 고객'],['other','다른 고객'],['orphan','이전 로그인 기록 미연결 고객']].map(([v,t])=><option key={v} value={v}>{t}</option>)}</select></label>
      <label>상황<select value={scenario} onChange={e=>setScenario(e.target.value)}>{['normal','proof-failure','provider-unavailable','expired-session','unsupported','native-timeout'].map(v=><option key={v}>{v}</option>)}</select></label>
      <button onClick={()=>{location.search=new URLSearchParams({customer:selected,scenario}).toString()}}>적용 (메모리 세션 초기화)</button>
      <button onClick={()=>window.__preview.first()}>처음 진입 화면 보기</button>
      <button onClick={async()=>{await fetch(`${backend}/__preview/reset`,{method:'POST'});localStorage.clear();location.href='/'}}>모든 MOCK 데이터 초기화</button>
      <p>새로고침은 토큰을 버리고 새 증명을 발급해요. 실제 토스 SDK·mTLS 연결은 별도 기기 검증이 필요해요.</p>
    </details>
  </aside>
}
createRoot(document.getElementById('root')).render(<React.StrictMode><Controls/><TossAccountGate><Library/></TossAccountGate></React.StrictMode>)
