// Offline browser integration through actual gate/controller/transports and local signed sessions.
import assert from 'node:assert/strict'
import { mkdir, mkdtemp } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { startPreview } from './anonymousSession.local.mjs'
const output=process.env.GATE_TEST_OUTPUT||await mkdtemp(path.join(os.tmpdir(),'catbot-anonymous-browser-'))
await mkdir(output,{recursive:true})
const playwright=await import(process.env.PLAYWRIGHT_MODULE?pathToFileURL(process.env.PLAYWRIGHT_MODULE).href:'playwright')
const preview=await startPreview({port:0})
let checks=0
const reset=()=>fetch('http://127.0.0.1:8019/__preview/reset',{method:'POST'})
try {
for(const engine of ['chromium','webkit']) {
  const browser=await playwright[engine].launch({headless:true,...(engine==='webkit'&&process.env.WEBKIT_EXECUTABLE?{executablePath:process.env.WEBKIT_EXECUTABLE}:{})})
  try {
    const context=await browser.newContext({viewport:{width:390,height:844}})
    const page=await context.newPage();const errors=[],external=[]
    page.on('pageerror',e=>errors.push(e.message))
    await page.route('**/*',route=>{const url=new URL(route.request().url());if(url.hostname==='127.0.0.1')return route.continue();external.push(url.origin);return route.abort()})
    const go=(customer='legacy',scenario='normal')=>page.goto(`${preview.origin}/?customer=${customer}&scenario=${scenario}`)
    const start=()=>page.getByRole('button',{name:'시작하기',exact:true})
    const protectedView=()=>page.getByTestId('protected')
    const loaded=()=>page.getByTestId('quota').waitFor()
    await reset();await go();await start().waitFor()
    assert.deepEqual(await page.evaluate(()=>window.__stats),{proof:0,oauth:0,exchange:0});assert.equal(await protectedView().count(),0)
    assert.match(await page.getByRole('heading').innerText(),/복냥이와 나를/);checks++
    await page.screenshot({path:path.join(output,`${engine}-first-entry.png`),fullPage:true})
    await start().click();await loaded()
    assert.match(await page.getByTestId('owner').innerText(),/preview_legacy/)
    assert.match(await protectedView().innerText(),/기존 사주 풀이 \(1\)/);assert.match(await protectedView().innerText(),/기존 타로 풀이 \(1\)/)
    assert.deepEqual(await page.evaluate(()=>window.__stats),{proof:1,oauth:0,exchange:1});checks++
    const before=await page.getByTestId('quota').innerText()
    const persisted=await page.evaluate(()=>Object.entries(localStorage));assert.deepEqual(persisted,[['preview-intro-legacy','1']]);checks++
    await page.reload();await loaded();assert.equal(await start().count(),0)
    assert.deepEqual(await page.evaluate(()=>window.__stats),{proof:1,oauth:0,exchange:1});assert.equal(await page.getByTestId('quota').innerText(),before);checks++
    await page.getByRole('button',{name:'다른 사용자 풀이 요청 (404 예상)',exact:true}).click();await page.getByRole('alert').waitFor();assert.match(await page.getByRole('alert').innerText(),/404/);checks++
    await page.getByRole('button',{name:'15분 경과, 새 익명 인증',exact:true}).click();await page.waitForFunction(()=>window.__stats.exchange===2 && window.__preview.session() !== null);await page.getByRole('button',{name:'15분 경과, 새 익명 인증',exact:true}).waitFor({state:'visible'});await page.waitForFunction(()=>!document.querySelector('[data-testid="protected"] button:disabled'));assert.equal(await page.evaluate(()=>window.__stats.oauth),0);checks++
    await page.evaluate(()=>window.__preview.clear());await start().waitFor();assert.equal(await protectedView().count(),0);await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>window.__stats.exchange),2);await start().click();await loaded();checks++
    await page.getByRole('button',{name:'MOCK 결제 지급 (같은 주문은 한 번)',exact:true}).click();await page.getByTestId('result').waitFor();const granted=await page.getByTestId('quota').innerText();await page.getByRole('button',{name:'MOCK 결제 지급 (같은 주문은 한 번)',exact:true}).click();await page.waitForTimeout(200);assert.equal(await page.getByTestId('quota').innerText(),granted);checks++
    await page.getByRole('button',{name:'MOCK 유료 풀이 생성 (이용권 1회 차감)',exact:true}).click();await page.waitForFunction(()=>document.querySelector('[data-testid="protected"]').textContent.includes('기존 사주 풀이 (2)'));checks++
    await page.screenshot({path:path.join(output,`${engine}-legacy-library.png`),fullPage:true})
    await go('mapped');await start().waitFor();await start().click();await loaded();assert.match(await page.getByTestId('owner').innerText(),/toss:202/);assert.match(await protectedView().innerText(),/기존 사주 풀이 \(1\)/);checks++
    await go('new');await start().waitFor();await start().click();await loaded();assert.match(await protectedView().innerText(),/기존 사주 풀이 \(0\)/)
    await page.getByRole('button',{name:'MOCK 유료 풀이 생성 (이용권 1회 차감)',exact:true}).click();await page.getByRole('alert').waitFor();assert.match(await page.getByRole('alert').innerText(),/402/);checks++
    await go('orphan');await start().waitFor();await start().click();await loaded();assert.match(await protectedView().innerText(),/기존 사주 풀이 \(0\)/)
    const oldToken=await page.evaluate(()=>window.__preview.session().token)
    await page.getByText('보관함 도움말',{exact:true}).click()
    await page.getByRole('button',{name:'이전 토스 로그인 계정의 기록 연결',exact:true}).click();assert.equal(await page.evaluate(()=>window.__stats.oauth),0)
    await page.getByRole('button',{name:'토스 로그인으로 기록 연결',exact:true}).click();await page.waitForFunction(()=>document.querySelector('[data-testid="owner"]')?.textContent.includes('toss:303'))
    await page.waitForFunction(()=>document.querySelector('[data-testid="protected"]').textContent.includes('기존 사주 풀이 (1)'))
    assert.deepEqual(await page.evaluate(()=>window.__stats),{proof:3,oauth:1,exchange:2})
    const stale=await fetch('http://127.0.0.1:8019/quota?user_anonymous_id=preview_orphan',{headers:{'X-Toss-Anon-Token':oldToken}});assert.equal(stale.status,401);checks++
    await page.reload();await loaded();assert.match(await page.getByTestId('owner').innerText(),/toss:303/);assert.equal(await page.evaluate(()=>window.__stats.oauth),0);checks++
    for(const scenario of ['proof-failure','provider-unavailable','expired-session','unsupported']) {
      await go('legacy',scenario)
      if(scenario==='expired-session')await start().waitFor();else await start().waitFor()
      assert.equal(await protectedView().count(),0);assert.equal(await page.evaluate(()=>window.__stats.oauth),0)
      await page.waitForTimeout(50);assert.equal(await page.evaluate(()=>window.__stats.proof),1);checks++
    }
    await go('legacy','pending');await page.waitForFunction(()=>window.__releaseProof)
    const status=page.getByRole('status');await status.waitFor();assert.match(await status.innerText(),/사용자를 확인/)
    const metrics=await status.locator('p').evaluate(e=>({font:getComputedStyle(e).fontSize,box:e.parentElement.getBoundingClientRect().toJSON()}))
    assert.equal(metrics.font,'18px');assert.ok(metrics.box.x+metrics.box.width/2>170&&metrics.box.x+metrics.box.width/2<220)
    await page.screenshot({path:path.join(output,`${engine}-centered-loading.png`),fullPage:true});checks++
    await page.evaluate(()=>window.__releaseProof());await loaded()
    for(const size of [{width:320,height:568},{width:768,height:1024}]) {
      await page.setViewportSize(size);await page.evaluate(()=>window.__preview.first());await start().waitFor();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true)
      await start().scrollIntoViewIfNeeded();const box=await start().boundingBox();assert.ok(box.height>=44&&box.width>=44);checks++
    }
    await page.setViewportSize({width:320,height:568});await page.evaluate(()=>{document.documentElement.style.fontSize='32px'});await start().scrollIntoViewIfNeeded();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);checks++
    assert.deepEqual(external,[]);assert.deepEqual(errors,[]);checks++
    await context.close()
  }finally{await browser.close()}
}
console.log(`Anonymous gate/browser integration: ${checks} checks passed (Chromium + WebKit). Screenshots: ${output}`)
}finally{await preview.stop()}
