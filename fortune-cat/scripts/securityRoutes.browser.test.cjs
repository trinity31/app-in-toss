// Run against a local build; every external request is stubbed.
const assert = require('node:assert/strict')
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')

async function check() {
  const browser = await chromium.launch({ headless: true })
  try {
    const page = await browser.newPage()
    const protectedCalls = []
    const errors = []
    page.on('pageerror', error => errors.push(error.name))
    await page.route('**/*', route => {
      const url = new URL(route.request().url())
      if (/^\/(deep-reading|quota|payment|saju-reading|amulet-order|toss-login)/.test(url.pathname)) {
        protectedCalls.push(url.pathname)
      }
      return url.origin === 'http://127.0.0.1:4173'
        ? route.continue() : route.fulfill({ json: [] })
    })
    for (const path of ['/newyear', '/library']) {
      await page.goto(`http://127.0.0.1:4173${path}`, { waitUntil: 'networkidle' })
      await page.getByRole('button', { name: '시작하기' }).waitFor()
      assert.match(await page.getByRole('heading', { level: 1 }).innerText(), /복냥이와 나를/)
      assert.equal(await page.getByRole('list', { name: '이렇게 이용해요' }).getByRole('listitem').count(), 3)
      assert.deepEqual(protectedCalls, [], 'A protected request ran before explicit login')
    }
    // A normal browser has no native Toss login. Rejection must stay recoverable.
    await page.getByRole('button', { name: '시작하기' }).click()
    await page.getByRole('alert').waitFor({ timeout: 20000 })
    await page.getByRole('button', { name: '시작하기' }).waitFor()
    assert.deepEqual(protectedCalls, [], 'Failed native login reached backend')
    for (const path of ['/saju', '/amulet']) {
      await page.goto(`http://127.0.0.1:4173${path}`, { waitUntil: 'networkidle' })
      assert.match(await page.locator('#root').innerText(), /점검/)
      assert.equal(await page.locator('input[type=file]').count(), 0)
    }
    assert.deepEqual(protectedCalls, [])
    assert.deepEqual(errors, [])
    console.log('Security routes passed: explicit login, rejected login recovery, no protected calls, closed legacy routes')
  } finally { await browser.close() }
}
check().catch(error => { console.error(error); process.exitCode = 1 })
