const assert = require('node:assert/strict')
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')
const base = process.env.TEST_VITE_URL || 'http://127.0.0.1:5190'
const session = {
  id: 'saved', question: '이전에 저장한 고민', plan: { summary: '저장된 상담 제목', positions: ['현재'], limitations: '저장된 제한사항' },
  cards: [{ id: 0, name_ko: '바보' }], answers: [{ question: '추가 질문', answer: '이전 답변' }],
  reading: { positions: [{ card_id: 0, position: '현재', interpretation: '저장된 카드 해석' }], answer: '저장된 전체 풀이', relationships: '저장된 관계', reality_checks: ['확인할 것'], actions: ['해볼 일'] },
  clarifier: { card: { id: 1, name_ko: '마법사' }, target_index: 0, reading: { meaning: '저장된 확인 카드 해석', reality_check: '확인 카드 점검', action: '확인 카드 행동' } }, notice: '저장된 안내',
}
session.reading.positions[0].interpretation += '\n\n' + '지금의 상황을 다른 관점에서 살펴보고, 확인할 수 있는 사실을 바탕으로 선택을 생각해 보세요. '.repeat(4)
;(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, headless: true })
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
    const errors = [], api = []
    page.on('pageerror', error => { errors.push(error.message); console.error(error.message) })
    page.setDefaultTimeout(10000)
    let fail = false, loggedIn = false
    await page.route('**/*', route => {
      const url = new URL(route.request().url())
      if (url.pathname === '/test-library') return route.fulfill({ contentType: 'text/html', body: `<div id="root"></div><script type="module">
import RefreshRuntime from '/@react-refresh'; RefreshRuntime.injectIntoGlobalHook(window); window.$RefreshReg$ = () => {}; window.$RefreshSig$ = () => type => type; window.__vite_plugin_react_preamble_installed__ = true;
await import('/src/index.css');
const React = (await import('/node_modules/.vite/deps/react.js')).default;
const {createRoot} = (await import('/node_modules/.vite/deps/react-dom_client.js')).default;
const {default: Library} = await import('/src/components/TarotLibrary.jsx');
createRoot(document.getElementById('root')).render(React.createElement(Library));</script>` })
      if (url.pathname === '/src/lib/tossAccount.js') return route.fulfill({ contentType: 'text/javascript', body: "export const createTossAccountHeaders = () => async () => ({'X-Toss-Access-Token':'test-only'}); export const isTossLoggedIn = async () => " + loggedIn + ";" })
      if (url.pathname === '/src/lib/analytics.js') return route.fulfill({ contentType: 'text/javascript', body: 'export const isSandbox = () => true;' })
      if (url.pathname.includes('/tarot/sessions/history')) {
        api.push(route.request().method() + ' ' + url.pathname)
        return route.fulfill({ status: fail ? 503 : 200, json: url.pathname.endsWith('/saved') ? session : { items: [{ id: 'saved', question: session.question }], has_more: false } })
      }
      if (url.origin !== base) return route.fulfill({ json: {} })
      return route.continue()
    })
    await page.goto(base + '/test-library')
    // 로그인 안 된 사용자: 로그인 창 없이 안내부터, 버튼을 눌러야 불러온다.
    await page.getByText('로그인하면 저장한 풀이를 볼 수 있어요.').waitFor()
    assert.deepEqual(api, [])
    fail = true
    await page.getByRole('button', { name: '토스 로그인하고 풀이 보기' }).click()
    await page.getByRole('alert').waitFor()
    fail = false
    await page.getByRole('button', { name: '토스 로그인하고 풀이 보기' }).click()
    await page.getByRole('button', { name: session.question }).click()
    await page.getByText('저장된 전체 풀이', { exact: true }).waitFor()
    await page.getByText('저장된 확인 카드 해석', { exact: true }).waitFor()
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
    await page.screenshot({ path: '/tmp/tarot-library-spacing.png', fullPage: true })
    for (const width of [320, 390, 430]) {
      await page.setViewportSize({ width, height: 844 })
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
    }
    await page.getByRole('button', { name: '타로 목록으로 돌아가기' }).first().click()
    await page.getByRole('button', { name: session.question }).waitFor()
    assert.equal(await page.getByText('로그인하면 저장한 풀이를 볼 수 있어요.').count(), 0)
    // 이미 로그인한 사용자: 안내 없이 바로 불러온다.
    loggedIn = true
    await page.goto(base + '/test-library')
    await page.getByRole('button', { name: session.question }).waitFor()
    assert.equal(await page.getByText('로그인하면 저장한 풀이를 볼 수 있어요.').count(), 0)
    assert.deepEqual(errors, [])
    assert.ok(api.every(call => call.startsWith('GET /sandbox/tarot/sessions/history')))
    console.log('Mobile library login guide, logged-in auto-load, error/retry, list, saved reading, clarifier, back, read-only routing passed')
  } finally { await browser.close() }
})().catch(error => { console.error(error); process.exitCode = 1 })
