// Run against the built web preview. Mock external requests to avoid live writes.
const assert = require('node:assert/strict')
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')

async function checkRoutes() {
  const browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH,
    headless: true,
  })
  try {
    const page = await browser.newPage()
    const errors = []
    const scripts = []
    page.on('pageerror', error => errors.push(error.name))
    page.on('request', request => {
      if (request.resourceType() === 'script') scripts.push(request.url())
    })
    await page.route('**/*', route => {
      const url = new URL(route.request().url())
      return url.hostname === '127.0.0.1'
        ? route.continue()
        : route.fulfill({ json: [] })
    })
    const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:4173'
    for (const path of ['/', '/tarot', '/library', '/saju', '/newyear', '/amulet', '/unknown']) {
      await page.goto(baseUrl + path, { waitUntil: 'networkidle' })
      await page.waitForTimeout(300)
      const text = await page.locator('#root').innerText()
      assert.ok(text.length, `Empty route: ${path}`)
      assert.ok(!text.includes('화면을 불러오고 있어요.'), `Suspended route: ${path}`)
      if (path === '/') {
        assert.ok(!scripts.some(url => /(?:Tarot|Saju|NewYear|Amulet|Library)Page-/.test(url)), 'Home eagerly loads other routes')
      }
      if (path === '/tarot') {
        assert.ok(scripts.some(url => /TarotPage-/.test(url)), 'Tarot chunk was not loaded')
      }
      console.log(JSON.stringify({ path, rendered: true }))
    }
    // Query/history changes must not remount a healthy Tarot screen.
    await page.goto(baseUrl + '/tarot', { waitUntil: 'networkidle' })
    await page.locator('[data-current-page]').first().evaluate(element => { element.dataset.remountProbe = 'retained' })
    await page.evaluate(() => {
      history.pushState({ ...history.state, key: 'query-probe' }, '', '/tarot?probe=1')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    await page.waitForTimeout(100)
    assert.equal(await page.locator('[data-current-page]').first().getAttribute('data-remount-probe'), 'retained', 'Healthy route remounted on location key change')
    assert.deepEqual(errors, [], 'Route import/render errors')

    const recovery = await browser.newPage()
    const recoveryErrors = []
    let tarotRequests = 0
    recovery.on('pageerror', error => recoveryErrors.push(error.name))
    await recovery.route('**/*', route => {
      const url = new URL(route.request().url())
      if (url.pathname.endsWith('/rest/v1/tarot_cards')) {
        return route.fulfill({ json: Array.from({ length: 22 }, (_, id) => ({ id, name_ko: `테스트 카드 ${id}`, name_en: `Test card ${id}` })) })
      }
      if (url.hostname !== '127.0.0.1') return route.fulfill({ json: [] })
      if (/TarotPage-.*\.js$/.test(url.pathname)) {
        tarotRequests += 1
        if (tarotRequests === 1) return route.abort()
      }
      return route.continue()
    })
    await recovery.goto(baseUrl, { waitUntil: 'networkidle' })
    const homeText = await recovery.locator('h1').allTextContents()
    const nav = recovery.getByRole('navigation', { name: '주요 메뉴' })
    await nav.getByRole('button', { name: /^타로/ }).click()
    const status = recovery.getByRole('status')
    await status.getByRole('heading', { name: '화면을 불러오지 못했어요.' }).waitFor()
    assert.equal(await nav.count(), 1, 'Navigation disappeared on rejection')
    assert.ok(!(await status.innerText()).includes('Failed to fetch'), 'Raw error exposed')
    await status.getByRole('link', { name: '홈으로 이동' }).click()
    await recovery.waitForURL(baseUrl + '/')
    await recovery.getByRole('heading', { name: '화면을 불러오지 못했어요.' }).waitFor({ state: 'hidden' })
    assert.equal(await recovery.getByText('화면을 불러오지 못했어요.').count(), 0, 'Boundary did not reset')
    assert.deepEqual(await recovery.locator('h1').allTextContents(), homeText, 'Home did not recover')
    await nav.getByRole('button', { name: /^타로/ }).click()
    await status.getByRole('heading', { name: '화면을 불러오지 못했어요.' }).waitFor()
    assert.equal(tarotRequests, 1, 'Cached rejected lazy loader unexpectedly retried')
    await Promise.all([
      recovery.waitForEvent('load'),
      status.getByRole('button', { name: '다시 불러오기' }).click(),
    ])
    await recovery.getByRole('heading', { name: '복냥타로', exact: true }).waitFor()
    assert.equal(tarotRequests, 2, 'Reload did not fetch Tarot again')
    assert.equal(await recovery.getByRole('status').count(), 0)
    assert.equal(await nav.count(), 1)
    assert.deepEqual(recoveryErrors, [], 'Uncaught failure/recovery errors')
    console.log(JSON.stringify({ chunkAbort: 1, errorVisible: true, navigationPreserved: true, homeRecovered: true, cachedRejectionVerified: true, reloadRenderedTarot: true, pageerrors: recoveryErrors }))
    await recovery.close()

  } finally {
    await browser.close()
  }
}

checkRoutes().catch(error => {
  console.error(error)
  process.exitCode = 1
})
