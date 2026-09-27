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
    assert.deepEqual(errors, [], 'Route import/render errors')
  } finally {
    await browser.close()
  }
}

checkRoutes().catch(error => {
  console.error(error)
  process.exitCode = 1
})
