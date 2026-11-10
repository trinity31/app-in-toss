// Actual main/App/pages, with local adapters only; no fixture/customer-control UI.
import assert from 'node:assert/strict'
import {mkdtemp} from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {pathToFileURL} from 'node:url'
import {startPreview} from './anonymousSession.local.mjs'
const playwright=await import(process.env.PLAYWRIGHT_MODULE?pathToFileURL(process.env.PLAYWRIGHT_MODULE).href:'playwright')
const output=await mkdtemp(path.join(os.tmpdir(),'catbot-actual-app-'))
const preview=await startPreview({port:0,actualApp:true})
let checks=0
try {
for(const engine of ['chromium','webkit']) {
  const browser=await playwright[engine].launch({headless:true,...(engine==='webkit'&&process.env.WEBKIT_EXECUTABLE?{executablePath:process.env.WEBKIT_EXECUTABLE}:{})})
  try {
    await fetch('http://127.0.0.1:8019/__preview/reset',{method:'POST'})
    const page=await browser.newPage({viewport:{width:390,height:844}});page.setDefaultTimeout(15000)
    const errors=[],external=[],requests=[]
    page.on('pageerror',e=>errors.push(e.message))
    page.on('request',r=>requests.push(new URL(r.url()).pathname))
    await page.route('**/*',route=>{const u=new URL(route.request().url());if(u.hostname==='127.0.0.1')return route.continue();external.push(u.origin);return route.abort()})
    await page.goto(preview.origin)
    await page.getByText('사주로 알아보는 나의 업',{exact:true}).waitFor()
    assert.equal(await page.getByText('테스트 조건 변경',{exact:true}).count(),0)
    await page.screenshot({path:path.join(output,`${engine}-home.png`),fullPage:true});checks++
    await page.getByText('나의 타고난 성향',{exact:true}).click()
    await page.getByRole('button',{name:'시작하기',exact:true}).waitFor()
    assert.equal(requests.includes('/toss-anonymous-session'),false)
    await page.screenshot({path:path.join(output,`${engine}-intro.png`),fullPage:true});checks++
    await page.getByRole('button',{name:'시작하기',exact:true}).click()
    await page.getByPlaceholder('이름 또는 닉네임').waitFor()
    assert.ok(requests.includes('/toss-anonymous-session'));assert.equal(requests.includes('/toss-login'),false)
    await page.screenshot({path:path.join(output,`${engine}-input.png`),fullPage:true});checks++
    await page.getByPlaceholder('이름 또는 닉네임').fill('복냥이')
    await page.getByPlaceholder('1995').fill('1995');await page.getByLabel('출생 월').fill('9');await page.getByLabel('출생 일').fill('12')
    await page.getByRole('button',{name:'여성',exact:true}).click()
    await page.getByRole('button',{name:'다음',exact:true}).click()
    await page.getByText('[MOCK] 로컬 테스트 생성 풀이, 실제 AI 호출 없음.',{exact:true}).waitFor()
    await page.screenshot({path:path.join(output,`${engine}-result-preview.png`),fullPage:true});checks++
    await page.getByRole('button',{name:'보유한 풀이 1회로 전체보기',exact:true}).click()
    await page.getByPlaceholder('더 알고 싶은 점이 있으신가요?').waitFor()
    const quota=await page.evaluate(async()=>{const {authenticatedReadingFetch}=await import('/src/lib/tossSession.js');return(await authenticatedReadingFetch('/quota')).json()})
    assert.equal(quota.reading_remaining,1)
    await page.screenshot({path:path.join(output,`${engine}-result-full.png`),fullPage:true});checks++
    await page.getByPlaceholder('더 알고 싶은 점이 있으신가요?').fill('어떤 점을 먼저 살펴볼까요?')
    await page.getByRole('button',{name:'전송',exact:true}).click()
    await page.getByText('[MOCK] 로컬 화면 확인용 답변입니다. 실제 AI 호출이나 결제는 없습니다.',{exact:true}).waitFor();checks++
    // Reload the actual app directly at the library route: memory is gone, marker only.
    const before=requests.filter(p=>p==='/toss-anonymous-session').length
    await page.goto(`${preview.origin}/library`)
    await page.getByRole('tab',{name:'사주 풀이',exact:true}).waitFor()
    await page.waitForFunction(()=>document.querySelectorAll('.tap-card').length===2)
    assert.ok(requests.filter(p=>p==='/toss-anonymous-session').length>before)
    assert.equal(await page.getByRole('button',{name:'시작하기',exact:true}).count(),0);checks++
    await page.screenshot({path:path.join(output,`${engine}-library.png`),fullPage:true})
    await page.getByRole('tab',{name:'심화 타로 상담',exact:true}).click()
    await page.getByRole('button',{name:'[MOCK] 기존 타로 풀이 preview_legacy',exact:true}).click()
    await page.getByText('고민에 대한 복냥이의 이야기',{exact:true}).waitFor()
    await page.screenshot({path:path.join(output,`${engine}-tarot-saved.png`),fullPage:true});checks++
    await page.goto(`${preview.origin}/tarot`)
    await page.getByText('심화 타로상담',{exact:true}).waitFor()
    await page.screenshot({path:path.join(output,`${engine}-tarot-home.png`),fullPage:true});checks++
    await page.goto(`${preview.origin}/tarot?mode=deep`)
    await page.getByRole('button',{name:'고민 이야기하러 가기',exact:true}).waitFor()
    await page.screenshot({path:path.join(output,`${engine}-tarot-intro.png`),fullPage:true});checks++
    await page.getByRole('button',{name:'고민 이야기하러 가기',exact:true}).click()
    await page.getByRole('textbox').fill('새로운 일을 시작하는 것이 좋을까요?')
    await page.getByRole('button',{name:'고민 이야기하기',exact:true}).click()
    await page.getByRole('button',{name:'카드 뽑기',exact:true}).click()
    await page.getByText('고민에 대한 복냥이의 이야기',{exact:true}).waitFor()
    await page.screenshot({path:path.join(output,`${engine}-tarot-result.png`),fullPage:true});checks++
    assert.equal(requests.includes('/toss-login'),false)
    const stored=await page.evaluate(()=>Object.entries(localStorage));assert.equal(stored.some(([key])=>/token/i.test(key)),false)
    assert.deepEqual(external,[]);assert.deepEqual(errors,[]);checks++
    await page.close()
  }finally{await browser.close()}
}
console.log(`Actual app UI: ${checks} checks passed (Chromium + WebKit). Screenshots: ${output}`)
}finally{await preview.stop()}
