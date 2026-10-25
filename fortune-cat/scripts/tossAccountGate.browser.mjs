// Offline rendered coverage. Set PLAYWRIGHT_MODULE if Playwright is installed outside this app.
import assert from 'node:assert/strict'
import { cp, mkdir, mkdtemp, realpath, rm, symlink, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createServer } from 'vite'
import react from '@vitejs/plugin-react'

const app = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const output = process.env.GATE_TEST_OUTPUT || await mkdtemp(path.join(os.tmpdir(), 'catbot-intro-'))
await mkdir(output, { recursive: true })
const root = await realpath(await mkdtemp(path.join(os.tmpdir(), 'catbot-intro-fixture-')))
const playwright = await import(process.env.PLAYWRIGHT_MODULE ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href : 'playwright')
let server
let checks = 0
try {
  for (const file of ['src/components/TossAccountGate.jsx', 'src/components/TossAccountGate.module.css', 'src/index.css', 'src/assets/images/hero.png', 'src/lib/tossAccount.js', 'src/lib/entryErrors.js']) {
    await mkdir(path.dirname(path.join(root, file)), { recursive: true })
    await cp(path.join(app, file), path.join(root, file))
  }
  await symlink(path.join(app, 'node_modules'), path.join(root, 'node_modules'))
  await writeFile(path.join(root, 'index.html'), '<div id="root"></div><script type="module" src="/fixture.jsx"></script>')
  await writeFile(path.join(root, 'insets.js'), 'export const useSafeAreaInsets = () => ({ bottom: 34 })')
  await writeFile(path.join(root, 'session.js'), `
import { createTossAccountHeaders } from './src/lib/tossAccount.js'
const scenario = new URLSearchParams(location.search).get('scenario')
window.__stats = { native: 0, sdk: 0, proof: 0, exchange: 0 }
window.__allow = false
const account = createTossAccountHeaders({
  baseUrl: 'https://offline.invalid', integrationTimeoutMs: 50,
  checkIntegrated: () => { window.__stats.native++; if (scenario === 'unsupported') return undefined; if (scenario === 'native-error') throw new Error('mock'); if (scenario === 'native-timeout') return new Promise(() => {}); if (scenario === 'pending') return new Promise(resolve => { window.__resolveNative = () => resolve(true) }); return ['returning','expiry','invalid-link','missing-link'].includes(scenario) },
  appLogin: async () => { window.__stats.sdk++; if (['stale', 'repeat'].includes(scenario)) await new Promise(resolve => { window.__resolveLogin = resolve }); if (scenario === 'cancel' && !window.__allow) throw new Error('mock'); return { authorizationCode: 'mock-code', referrer: 'DEFAULT' } },
  createAnonymousKeyAuthCode: async () => { window.__stats.proof++; return {code:'mock-proof', expiresIn:300} },
  fetcher: async () => { window.__stats.exchange++; if (scenario === 'network' && !window.__allow) throw new Error('mock'); return { ok:true, json:async () => ({ legacyLinked:scenario === 'missing-link' && !window.__allow ? undefined : scenario !== 'invalid-link' || window.__allow, userKey:'123', accessToken:'mock-access', expiresIn:scenario === 'expiry' && window.__stats.exchange === 1 ? 61 : 3600 }) } },
})
window.__clear = () => account.clear()
export const getTossSession = account.getSession
export const subscribeTossAccount = account.subscribe
export const restoreTossAccount = account.restore
export const loginTossAccount = () => account()
if (scenario === 'memory') await account()
`)
  await writeFile(path.join(root, 'fixture.jsx'), `
import React from 'react'
import {createRoot} from 'react-dom/client'
import TossAccountGate from './src/components/TossAccountGate.jsx'
import './src/index.css'
const nav = new URLSearchParams(location.search).has('nav')
createRoot(document.getElementById('root')).render(<React.StrictMode><TossAccountGate hasBottomNavigation={nav}><main data-testid="protected">내 풀이 보관함</main></TossAccountGate>{nav && <nav data-testid="tabs" style={{position:'fixed',bottom:0,height:98,width:'100%',background:'white'}}>하단 메뉴</nav>}</React.StrictMode>)
`)
  server = await createServer({ root, configFile: false, plugins: [react()], optimizeDeps: { entries: ['index.html'] }, resolve: { alias: [
    { find: '../lib/tossSession', replacement: path.join(root, 'session.js') },
    { find: '../hooks/useSafeAreaInsets', replacement: path.join(root, 'insets.js') },
  ] }, server: { host: '127.0.0.1', port: 0 } })
  await server.listen()
  const origin = `http://127.0.0.1:${server.httpServer.address().port}`
  for (const engine of ['chromium', 'webkit']) {
    const browser = await playwright[engine].launch({ headless: true, ...(engine === 'webkit' && process.env.WEBKIT_EXECUTABLE ? { executablePath: process.env.WEBKIT_EXECUTABLE } : {}) })
    try {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
      const errors = []
      page.on('pageerror', error => errors.push(error.message))
      await page.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort())
      const go = scenario => page.goto(`${origin}/?scenario=${scenario}`)
      const start = () => page.getByRole('button', { name: '시작하기', exact: true })
      const protectedView = () => page.getByTestId('protected')
      for (const scenario of ['first', 'native-error', 'native-timeout', 'unsupported']) {
        await go(scenario)
        await start().waitFor()
        assert.match(await page.getByRole('heading').innerText(), /복냥이와 나를/)
        assert.deepEqual(await page.evaluate(() => window.__stats), { native: 1, sdk: 0, proof: 0, exchange: 0 })
        assert.equal(await protectedView().count(), 0)
        await start().click()
        await protectedView().waitFor()
        assert.deepEqual(await page.evaluate(() => window.__stats), { native: 1, sdk: 1, proof: 1, exchange: 1 })
        checks++
      }
      for (const scenario of ['returning', 'memory']) {
        await go(scenario); await protectedView().waitFor()
        assert.equal(await start().count(), 0)
        assert.equal(await page.evaluate(() => window.__stats.sdk), 1)
        await page.evaluate(() => window.__clear())
        await start().waitFor()
        assert.equal(await page.evaluate(() => window.__stats.sdk), 1)
        await start().click(); await protectedView().waitFor()
        assert.equal(await page.evaluate(() => window.__stats.sdk), 2)
        checks++
      }
      for (const scenario of ['cancel', 'network', 'invalid-link', 'missing-link']) {
        await go(scenario); await start().waitFor()
        if (!['invalid-link', 'missing-link'].includes(scenario)) await start().click()
        if (!['invalid-link', 'missing-link'].includes(scenario)) await page.getByRole('alert').waitFor()
        assert.equal(await protectedView().count(), 0)
        await page.evaluate(() => { window.__allow = true })
        await start().click(); await protectedView().waitFor(); checks++
      }
      await go('pending'); await page.waitForFunction(() => window.__resolveNative)
      assert.equal(await start().count(), 0)
      const spinner = page.getByRole('status').locator('span')
      assert.equal(await spinner.evaluate(el => getComputedStyle(el).animationName !== 'none'), true)
      await page.screenshot({ path: path.join(output, `${engine}-loading.png`) })
      await page.emulateMedia({ reducedMotion: 'reduce' })
      assert.equal(await spinner.evaluate(el => getComputedStyle(el).animationName), 'none')
      await page.emulateMedia({ reducedMotion: 'no-preference' })
      await page.evaluate(() => window.__resolveNative()); await protectedView().waitFor(); checks++
      await go('expiry'); await protectedView().waitFor()
      await page.waitForFunction(() => window.__stats.exchange === 2); await protectedView().waitFor(); checks++
      await go('repeat'); await start().waitFor()
      await start().evaluate(el => { el.click(); el.click() })
      await page.waitForFunction(() => window.__resolveLogin)
      assert.equal(await page.evaluate(() => window.__stats.sdk), 1)
      await page.evaluate(() => window.__resolveLogin()); await protectedView().waitFor()
      assert.deepEqual(await page.evaluate(() => window.__stats), { native: 1, sdk: 1, proof: 1, exchange: 1 }); checks++
      await go('stale'); await start().waitFor(); await start().click()
      await page.waitForFunction(() => window.__resolveLogin)
      await page.evaluate(() => { window.__clear(); window.__resolveLogin() })
      await start().waitFor(); assert.equal(await protectedView().count(), 0)
      assert.equal(await page.evaluate(() => window.__stats.exchange), 0); checks++
      for (const size of [{ width: 320, height: 568 }, { width: 390, height: 844 }, { width: 768, height: 1024 }, { width: 1440, height: 900 }, { width: 320, height: 420 }]) {
        await page.setViewportSize(size)
        for (const nav of [false, true]) {
          await page.goto(`${origin}/?scenario=first${nav ? '&nav' : ''}`); await start().waitFor()
          await page.waitForFunction(() => document.querySelector('img')?.complete)
          if (size.height === 420) await page.evaluate(() => { document.documentElement.style.fontSize = '200%' })
          assert.equal(await page.locator('img').evaluate(el => el.complete && el.naturalWidth > 0), true)
          await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
          const layout = await start().evaluate(el => ({ width: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth, height: el.getBoundingClientRect().height, bottom: el.getBoundingClientRect().bottom, tabs: document.querySelector('[data-testid="tabs"]')?.getBoundingClientRect().top }))
          assert(layout.scrollWidth <= layout.width)
          assert(layout.height >= 56)
          if (nav) assert(layout.bottom < layout.tabs, JSON.stringify({ engine, size, layout }))
          await page.keyboard.press(engine === 'webkit' ? 'Alt+Tab' : 'Tab')
          assert.equal(await start().evaluate(el => el === document.activeElement), true)
          assert.equal(await start().evaluate(el => getComputedStyle(el).outlineStyle), 'solid')
          if (size.width <= 390) await page.screenshot({ path: path.join(output, `${engine}-${size.width}x${size.height}-${nav ? 'library' : 'reading'}.png`), fullPage: true })
          assert.deepEqual(await page.evaluate(() => window.__stats), { native: 1, sdk: 0, proof: 0, exchange: 0 })
          checks++
        }
      }
      assert.deepEqual(errors, [])
      await page.close()
    } finally { await browser.close() }
  }
  console.log(JSON.stringify({ checks, browsers: ['chromium', 'webkit'], outbound: 'loopback-only', output }))
} finally {
  await server?.close()
  await rm(root, { recursive: true, force: true })
}
