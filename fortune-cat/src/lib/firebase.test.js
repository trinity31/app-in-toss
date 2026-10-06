// Run with node --experimental-vm-modules --test src/lib/firebase.test.js.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import vm from 'node:vm'

async function loadFirebase(baseUrl, development = false) {
  const calls = []
  const sdk = name => (...args) => { calls.push([name, ...args]); return {} }
  const context = vm.createContext({ console, URL, window: { localStorage: { getItem: () => null, setItem() {} } } })
  const modules = new Map()
  async function load(specifier) {
    if (modules.has(specifier)) return modules.get(specifier)
    let module
    if (specifier === 'firebase/app') {
      module = new vm.SyntheticModule(['initializeApp', 'getApps'], function () {
        this.setExport('initializeApp', sdk('initializeApp'))
        this.setExport('getApps', () => [])
      }, { context })
    } else if (specifier === 'firebase/analytics') {
      const exports = ['getAnalytics', 'logEvent', 'setUserId', 'setUserProperties', 'setDefaultEventParameters']
      module = new vm.SyntheticModule(exports, function () {
        for (const name of exports) this.setExport(name, sdk(name))
      }, { context })
    } else if (specifier === '@apps-in-toss/web-framework') {
      module = new vm.SyntheticModule(['getOperationalEnvironment'], function () {
        this.setExport('getOperationalEnvironment', () => 'toss')
      }, { context })
    } else {
      const file = specifier === 'entry' ? 'firebase.js' : `${specifier.slice(2)}.js`
      module = new vm.SourceTextModule(await readFile(new URL(file, import.meta.url), 'utf8'), {
        context,
        initializeImportMeta(meta) { meta.env = { VITE_API_BASE_URL: baseUrl, DEV: development } },
      })
    }
    modules.set(specifier, module)
    await module.link(load)
    return module
  }
  const entry = await load('entry')
  await entry.evaluate()
  return { firebase: entry.namespace, calls }
}

for (const development of [true, false]) {
  for (const url of ['http://localhost:8000', 'http://192.168.1.9', 'http://[::1]:8000', undefined, 'invalid']) {
    test(`local/missing backend ${url} makes zero GA calls (development=${development})`, async () => {
      const { firebase, calls } = await loadFirebase(url, development)
      firebase.logEvent('saju_create', { saju_code: 'daily' })
      firebase.setAnalyticsUserType('external')
      firebase.setUserId('anonymous')
      firebase.setUserProperties({ example: 'value' })
      assert.equal(firebase.analyticsEnabled, false)
      assert.deepEqual(calls.map(call => call[0]), ['initializeApp'])
    })
  }
  test(`public backend initializes and sends authoritative GA metadata (development=${development})`, async () => {
    const { firebase, calls } = await loadFirebase('https://api.example.com', development)
    firebase.logEvent('saju_create', { app_platform: 'wrong', user_type: 'wrong' })
    assert.equal(firebase.analyticsEnabled, true)
    assert.equal(calls.filter(call => call[0] === 'getAnalytics').length, 1)
    assert.deepEqual(JSON.parse(JSON.stringify(calls.find(call => call[0] === 'logEvent').at(-1))), {
      app_platform: 'toss', user_type: development ? 'internal' : 'unknown',
    })
  })
}
