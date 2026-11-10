// One explicit, billable browser check using an existing representative reflection case.
import assert from 'node:assert/strict'
import { pathToFileURL } from 'node:url'
if (!process.argv.includes('--live')) throw Error('Pass --live to generate one billable tarot reading')
const playwright = await import(process.env.PLAYWRIGHT_MODULE ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href : 'playwright')
const browser = await playwright.chromium.launch({ channel: 'chrome', headless: true })
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
  page.setDefaultTimeout(30000)
  const errors = [], responses = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('response', response => {
    if (new URL(response.url()).pathname.startsWith('/tarot/sessions')) responses.push(response.status())
  })
  await page.goto('http://127.0.0.1:5190/tarot?mode=deep')
  await page.getByRole('button', { name: '고민 이야기하러 가기', exact: true }).click()
  await page.getByRole('textbox').fill('친구와 만난 뒤에는 즐거운데 혼자 돌아오면 지쳐요. 당장 관계를 바꾸기보다 지금 내 마음의 두 측면을 이해하고 싶어요.')
  const planned = page.waitForResponse(r => /\/tarot\/sessions\/[^/]+\/plan$/.test(new URL(r.url()).pathname), { timeout: 110000 })
  await page.getByRole('button', { name: '고민 이야기하기', exact: true }).click()
  const plan = await (await planned).json()
  assert.equal(plan.status, 'ready')
  assert.equal('_ai' in plan, false)
  const interpreted = page.waitForResponse(r => /\/tarot\/sessions\/[^/]+\/interpret$/.test(new URL(r.url()).pathname), { timeout: 110000 })
  await page.getByRole('button', { name: '카드 뽑기', exact: true }).click()
  const response = await interpreted
  const result = await response.json()
  assert.equal(response.status(), 200)
  assert.equal(result.status, 'complete')
  assert.equal(result.cards.length, 2)
  assert.ok(result.reading.answer.length >= 50)
  await page.getByText('고민에 대한 복냥이의 이야기', { exact: true }).waitFor()
  const answer = page.getByText(result.reading.answer, { exact: true })
  await answer.waitFor()
  const cardsHeading = page.getByRole('heading', { name: '각 카드가 들려주는 이야기', exact: true })
  assert.ok(await answer.evaluate((element, heading) => !!(element.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING), await cardsHeading.elementHandle()))
  assert.ok(responses.every(status => status === 200))
  assert.deepEqual(errors, [])
  await page.screenshot({ path: '/tmp/tarot-real-ai-browser.png', fullPage: true, animations: 'disabled' })
  console.log(JSON.stringify({ sessionId: result.id, status: result.status, cards: result.cards.map(card => card.id), answerChars: result.reading.answer.length, responses, browserErrors: errors }))
} finally { await browser.close() }
