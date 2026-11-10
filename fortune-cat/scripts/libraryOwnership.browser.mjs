// Render the actual library components with deliberately delayed owner-scoped responses.
import assert from 'node:assert/strict'
import { cp, mkdir, mkdtemp, realpath, rm, symlink, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createServer } from 'vite'
import react from '@vitejs/plugin-react'
const app=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..')
const root=await realpath(await mkdtemp(path.join(os.tmpdir(),'catbot-library-owner-')))
const playwright=await import(process.env.PLAYWRIGHT_MODULE?pathToFileURL(process.env.PLAYWRIGHT_MODULE).href:'playwright')
let server,checks=0
try {
  for(const file of ['src/pages/LibraryPage.jsx','src/components/TarotLibrary.jsx','src/components/TarotLibrary.css','src/lib/tarotLibrary.js','src/components/LegacyAccountRecovery.jsx','src/components/LegacyAccountRecovery.module.css','src/components/LibraryRecoveryHelp.jsx','src/components/LibraryRecoveryHelp.module.css']) {
    await mkdir(path.dirname(path.join(root,file)),{recursive:true});await cp(path.join(app,file),path.join(root,file))
  }
  await symlink(path.join(app,'node_modules'),path.join(root,'node_modules'))
  await writeFile(path.join(root,'index.html'),'<meta charset="utf-8"><div id="root"></div><script type="module" src="/fixture.jsx"></script>')
  await writeFile(path.join(root,'stubs.jsx'),`import React from 'react'
export const JOB_MENU={title_ko:'MOCK'}
export const useSafeAreaInsets=()=>({bottom:0})
export const useToast=()=>({openToast:()=>{}})
export const supabase={from:()=>({select:async()=>({data:[]})})}
export const tarotRuntime=()=>({baseUrl:'https://offline.invalid'})
export const isSandbox=()=>false
export const getCardImageUrl=()=>''
export default function Stub({userData}) {return userData?<div data-testid="detail">{userData.fortuneResult.reading}</div>:null}
`)
  await writeFile(path.join(root,'session.js'),`
let owner='legacy';const listeners=new Set();window.__pending=[];window.__recoveries=0
export const getTossSession=()=>({userId:owner,token:'MOCK'})
export const subscribeTossAccount=fn=>{listeners.add(fn);return()=>listeners.delete(fn)}
export const getTossAccountHeaders=async()=>({'X-Toss-Anon-Token':'MOCK'})
window.__owner=value=>{owner=value;listeners.forEach(fn=>fn())}
export const recoverLegacyTossAccount=async()=>{window.__recoveries++;window.__owner('toss:recovered');return getTossSession()}
const request=(url,options)=>new Promise((resolve,reject)=>{
  const kind=url.includes('/tarot/')?'tarot':url.includes('/conversation')?'detail':'reading'
  window.__pending.push({owner,kind,url,resolve:data=>resolve({ok:true,json:async()=>data}),reject:()=>reject(Error('STALE OWNER ERROR'))})
  // Intentionally ignore AbortSignal to model an already parsed/uncancellable response.
})
export const authenticatedReadingFetch=request
export const authenticatedTarotFetch=request
`)
  await writeFile(path.join(root,'fixture.jsx'),`import React from 'react';import{createRoot}from'react-dom/client';import LibraryPage from './src/pages/LibraryPage.jsx';createRoot(document.getElementById('root')).render(<LibraryPage/>);`)
  const aliases=['../lib/jobMenu','../hooks/useToast','../hooks/useSafeAreaInsets','../lib/supabase','../components/DeepReadingResult','../lib/tarotRuntime','../lib/analytics','./TarotCardArt','../assets/images/cards'].map(find=>({find,replacement:path.join(root,'stubs.jsx')}))
  aliases.push({find:'../lib/tossSession',replacement:path.join(root,'session.js')})
  server=await createServer({root,configFile:false,envDir:root,plugins:[react()],resolve:{alias:aliases},server:{host:'127.0.0.1',port:0}});await server.listen()
  const origin=`http://127.0.0.1:${server.httpServer.address().port}`
  for(const engine of ['chromium','webkit']) {
    const browser=await playwright[engine].launch({headless:true,...(engine==='webkit'&&process.env.WEBKIT_EXECUTABLE?{executablePath:process.env.WEBKIT_EXECUTABLE}:{})})
    try {
      const page=await browser.newPage();page.setDefaultTimeout(5000);const errors=[]
      page.on('pageerror',e=>errors.push(e.message))
      await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort())
      const waitRequests=owner=>page.waitForFunction(value=>['reading','tarot'].every(kind=>window.__pending.some(p=>p.owner===value&&p.kind===kind)),owner)
      const resolveOwner=(owner,headline)=>page.evaluate(({owner,headline})=>{for(const p of window.__pending.filter(p=>p.owner===owner))p.resolve(p.kind==='tarot'?{items:[{id:owner,question:headline}],has_more:false}:{items:[{thread_id:owner,headline,reading_type:'MOCK'}]})},{owner,headline})
      await page.goto(origin);await waitRequests('legacy')
      await page.evaluate(()=>window.__owner('toss:202'));await waitRequests('toss:202')
      // New owner's request must start while the old Tarot request is still busy.
      await resolveOwner('toss:202','CURRENT OWNER');await page.getByText('CURRENT OWNER',{exact:true}).last().waitFor();checks++
      await resolveOwner('legacy','STALE OWNER');await page.waitForTimeout(100);assert.equal(await page.getByText('STALE OWNER',{exact:true}).count(),0);assert.equal(await page.getByRole('alert').count(),0);checks++
      // Show the Tarot tab so old-result protection is tested in the rendered component too.
      await page.getByRole('tab',{name:'심화 타로 상담',exact:true}).click();await page.getByRole('button',{name:'CURRENT OWNER',exact:true}).waitFor();checks++
      await page.getByRole('button',{name:'CURRENT OWNER',exact:true}).click();await page.waitForFunction(()=>window.__pending.some(p=>p.owner==='toss:202'&&p.kind==='tarot'&&!p.url.includes('?')))
      await page.evaluate(()=>window.__owner('toss:303'));await waitRequests('toss:303');await resolveOwner('toss:303','NEW MAPPED OWNER')
      await page.getByRole('button',{name:'NEW MAPPED OWNER',exact:true}).waitFor()
      await page.evaluate(()=>window.__pending.filter(p=>p.owner==='toss:202'&&!p.url.includes('?')).forEach(p=>p.reject()))
      await page.waitForTimeout(100);assert.equal(await page.getByRole('alert').count(),0);assert.equal(await page.getByRole('button',{name:'NEW MAPPED OWNER',exact:true}).isEnabled(),true);checks++
      // Stale reading detail success cannot reopen selected after the owner changed.
      await page.getByRole('tab',{name:'사주 풀이',exact:true}).click();await page.getByText('NEW MAPPED OWNER',{exact:true}).last().click()
      await page.waitForFunction(()=>window.__pending.some(p=>p.kind==='detail'))
      await page.evaluate(()=>window.__owner('toss:404'));await waitRequests('toss:404');await resolveOwner('toss:404','LATEST OWNER')
      await page.getByText('LATEST OWNER',{exact:true}).last().waitFor()
      await page.evaluate(()=>window.__pending.filter(p=>p.kind==='detail').forEach(p=>p.resolve({reading:'STALE DETAIL'})))
      await page.waitForTimeout(100);assert.equal(await page.getByTestId('detail').count(),0);assert.equal(await page.getByText('STALE DETAIL',{exact:true}).count(),0);checks++
      // A stale list error must not set error/loading state in the newer owner.
      await page.reload();await waitRequests('legacy');await page.evaluate(()=>window.__owner('toss:505'));await waitRequests('toss:505')
      await page.evaluate(()=>window.__pending.filter(p=>p.owner==='legacy').forEach(p=>p.reject()))
      await page.waitForTimeout(100);assert.equal(await page.getByRole('alert').count(),0)
      assert.equal(await page.locator('[aria-label="심화 타로 보관함"] [role="status"]').count(),1)
      assert.equal(await page.getByText('불러오는 중...',{exact:true}).count(),1);checks++
      await resolveOwner('toss:505','FINAL OWNER');await page.getByText('FINAL OWNER',{exact:true}).last().waitFor()
      assert.equal(await page.getByRole('alert').count(),0);assert.deepEqual(errors,[]);checks++
      const recovery=()=>page.getByRole('button',{name:'이전 토스 로그인 계정의 기록 연결',exact:true})
      const help=()=>page.getByText('보관함 도움말',{exact:true})
      const openHelp=async()=>{await help().waitFor();await help().click();await recovery().waitFor()}
      const reset=async()=>{await page.goto(origin);await waitRequests('legacy');assert.equal(await recovery().count(),0)}
      const complete=async(owner,kind,count=0,error=false,hasMore=false)=>{
        await page.evaluate(({owner,kind,count,error,hasMore})=>{
          for(const p of window.__pending.filter(p=>p.owner===owner&&p.kind===kind)){
            if(error)p.reject()
            else p.resolve(kind==='tarot'?{items:count?[{id:owner,question:'SAVED TAROT'}]:[],has_more:hasMore}:{items:count?[{thread_id:owner,headline:'SAVED READING',reading_type:'MOCK'}]:[]})
          }
        },{owner,kind,count,error,hasMore})
        await page.waitForTimeout(30)
      }
      for(const [readings,tarots] of [[1,0],[0,1],[1,1]]){
        await reset();await complete('legacy','reading',readings);assert.equal(await recovery().count(),0)
        await complete('legacy','tarot',tarots);assert.equal(await recovery().count(),0);checks++
      }
      await reset();await complete('legacy','reading');assert.equal(await recovery().count(),0)
      await complete('legacy','tarot');await help().waitFor();assert.equal(await recovery().count(),0)
      assert.equal(await page.locator('[aria-label="기존 계정 연결"]').count(),0);assert.equal(await page.evaluate(()=>window.__recoveries),0);checks++
      await help().focus();await page.keyboard.press('Enter');await recovery().waitFor()
      assert.equal(await page.getByRole('button',{name:'토스 로그인으로 기록 연결',exact:true}).count(),0)
      assert.equal(await page.evaluate(()=>window.__recoveries),0);checks++
      await help().click();await page.waitForFunction(()=>document.querySelector('[aria-label="기존 계정 연결"]')===null);assert.equal(await recovery().count(),0);checks++
      await openHelp()
      // A fresh token for the same owner must retain the loaded-empty status.
      await page.evaluate(()=>window.__owner('legacy'));assert.equal(await recovery().count(),1)
      assert.equal(await page.evaluate(()=>window.__pending.length),2);checks++
      // Already canonical accounts never offer recovery, including empty histories.
      await page.evaluate(()=>window.__owner('toss:empty'));await waitRequests('toss:empty');assert.equal(await recovery().count(),0)
      await complete('toss:empty','reading');await complete('toss:empty','tarot');assert.equal(await recovery().count(),0);assert.equal(await help().count(),0);checks++
      for(const failed of ['reading','tarot']){
        await reset();await complete('legacy',failed,0,true);await complete('legacy',failed==='reading'?'tarot':'reading')
        assert.equal(await recovery().count(),0);checks++
      }
      await reset();await page.evaluate(()=>window.__pending.filter(p=>p.kind==='reading').forEach(p=>p.resolve({})))
      await complete('legacy','tarot');assert.equal(await recovery().count(),0);checks++
      await reset();await complete('legacy','reading')
      await page.evaluate(()=>window.__pending.filter(p=>p.kind==='tarot').forEach(p=>p.resolve({items:[],has_more:'false'})))
      await page.waitForTimeout(30);assert.equal(await recovery().count(),0);checks++
      await reset();await complete('legacy','reading');await complete('legacy','tarot',0,false,true)
      assert.equal(await recovery().count(),0);checks++
      // Empty status from A cannot cross into raw owner B while B is loading.
      await reset();await complete('legacy','reading');await complete('legacy','tarot');await openHelp()
      await page.evaluate(()=>window.__owner('second_raw'));await waitRequests('second_raw');assert.equal(await recovery().count(),0)
      await complete('second_raw','reading');assert.equal(await recovery().count(),0)
      await complete('second_raw','tarot');await help().waitFor();assert.equal(await recovery().count(),0);await openHelp();checks++
      // A late old-owner empty response cannot show recovery for a current nonempty owner.
      await reset();await page.evaluate(()=>window.__owner('second_raw'));await waitRequests('second_raw')
      await complete('second_raw','reading',1);await complete('second_raw','tarot')
      await complete('legacy','reading');await complete('legacy','tarot');assert.equal(await recovery().count(),0);checks++
      // The real recovery component disappears immediately after a verified mapped owner arrives.
      await reset();await complete('legacy','reading');await complete('legacy','tarot');await openHelp();await recovery().click()
      await page.getByRole('button',{name:'토스 로그인으로 기록 연결',exact:true}).click()
      await waitRequests('toss:recovered');assert.equal(await recovery().count(),0);assert.equal(await page.evaluate(()=>window.__recoveries),1)
      assert.equal(await page.getByRole('button',{name:'토스 로그인으로 기록 연결',exact:true}).count(),0)
      await complete('toss:recovered','reading');await complete('toss:recovered','tarot');assert.equal(await recovery().count(),0);checks++
      assert.deepEqual(errors,[])
      await page.close()
    }finally{await browser.close()}
  }
  console.log(`Actual library owner-transition browser regression: ${checks} checks passed (Chromium + WebKit).`)
}finally{await server?.close();await rm(root,{recursive:true,force:true})}
