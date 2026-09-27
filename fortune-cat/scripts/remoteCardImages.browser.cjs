const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')
const base = 'http://127.0.0.1:5190'
;(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, headless: true })
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
    let failed = true
    const images = []
    await page.route('**/*', route => {
      const url = new URL(route.request().url())
      if (url.pathname === '/test-images') return route.fulfill({ contentType: 'text/html', body: `<div id="root"></div><script type="module">
import RefreshRuntime from '/@react-refresh'; RefreshRuntime.injectIntoGlobalHook(window); window.$RefreshReg$ = () => {}; window.$RefreshSig$ = () => type => type; window.__vite_plugin_react_preamble_installed__ = true;
await import('/src/index.css');
const React = (await import('/node_modules/.vite/deps/react.js')).default;
const {createRoot} = (await import('/node_modules/.vite/deps/react-dom_client.js')).default;
const {default: Card} = await import('/src/components/TarotCardArt.jsx');
const {getCardImageUrl} = await import('/src/assets/images/cards/index.js');
const root = createRoot(document.getElementById('root'));
window.showCard = id => root.render(React.createElement(Card, {image:getCardImageUrl(id), nameEn:'card-'+id, size:'sm'}));
window.showCard(22);</script>` })
      if (url.hostname === 'www.fortunecat.art') {
        images.push(url.href)
        if (failed) return route.fulfill({ status: 503, body: '' })
        return route.fulfill({ contentType: 'image/webp', body: fs.readFileSync(path.join(__dirname, '../src/assets/images/cards', path.basename(url.pathname))) })
      }
      if (url.origin !== base) return route.abort()
      return route.continue()
    })
    await page.goto(base + '/test-images')
    await page.getByText('이미지 오류').waitFor()
    assert.ok(await page.getByRole('button', { name: '다시 불러오기' }).evaluate(button => button.getBoundingClientRect().bottom <= button.parentElement.getBoundingClientRect().bottom), 'Retry must fit small card')
    failed = false
    await page.getByRole('button', { name: '다시 불러오기' }).click()
    await page.waitForFunction(() => document.querySelector('img')?.naturalWidth > 0)
    assert.ok(images.some(url => url.endsWith('22.webp?retry=1')))
    await page.evaluate(() => window.showCard(77))
    await page.waitForFunction(() => document.querySelector('img')?.alt === 'card-77' && document.querySelector('img').naturalWidth > 0)
    await page.evaluate(() => window.showCard(78))
    await page.getByRole('img', { name: '카드 이미지 사용 불가' }).waitFor()
    assert.ok(!images.some(url => url.includes('/78.webp')))
    console.log('Remote image failure/retry, correct-card reload and invalid ID passed')
  } finally { await browser.close() }
})().catch(error => { console.error(error); process.exitCode = 1 })
