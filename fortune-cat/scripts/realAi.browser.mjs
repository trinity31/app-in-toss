// Explicit live check: this generates one real, billable reading for synthetic birth data.
import assert from 'node:assert/strict'
import { pathToFileURL } from 'node:url'
if (!process.argv.includes('--live')) throw Error('Pass --live to generate one billable AI reading')
const playwright = await import(process.env.PLAYWRIGHT_MODULE ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href : 'playwright')
const browser = await playwright.chromium.launch({ channel: 'chrome', headless: true })
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
  page.setDefaultTimeout(30000)
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('http://127.0.0.1:5190/')
  await page.getByText('사주로 보는 내 성격 분석', { exact: true }).click()
  const sessionResponse = page.waitForResponse(r => new URL(r.url()).pathname === '/toss-anonymous-session')
  await page.getByRole('button', { name: '시작하기', exact: true }).click()
  assert.equal((await sessionResponse).status(), 200)
  await page.getByPlaceholder('이름 또는 닉네임').fill('로컬검증')
  await page.getByPlaceholder('1995').fill('1995')
  await page.getByLabel('출생 월').fill('9')
  await page.getByLabel('출생 일').fill('12')
  await page.getByRole('button', { name: '여성', exact: true }).click()
  const readingResponse = page.waitForResponse(r => new URL(r.url()).pathname === '/deep-reading/start', { timeout: 190000 })
  await page.getByRole('button', { name: '다음', exact: true }).click()
  const response = await readingResponse
  assert.equal(response.status(), 200)
  const data = await response.json()
  assert.ok(data.reading?.length >= 200)
  assert.equal(data.is_preview, false)
  assert.equal(data.reading.includes('[MOCK]'), false)
  assert.equal(/다시 시도|문제가 생겼/.test(data.reading), false)
  const visibleSample = data.reading.split('\n').map(line => line.replace(/[#*_`>]/g, '').trim()).find(line => line.length >= 40)
  assert.ok(visibleSample)
  await page.getByText(visibleSample.slice(0, 40), { exact: false }).first().waitFor()
  await page.getByPlaceholder('더 알고 싶은 점이 있으신가요?').waitFor()
  await page.screenshot({ path: '/tmp/fortune-real-ai.png', fullPage: true, animations: 'disabled' })
  console.log(JSON.stringify({ session: 200, generation: response.status(), threadId: data.thread_id, readingChars: data.reading.length, preview: data.is_preview, sample: data.reading.slice(0, 150), browserErrors: errors }))
} finally { await browser.close() }
