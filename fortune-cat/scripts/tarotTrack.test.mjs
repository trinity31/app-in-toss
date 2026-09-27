import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'

// Execute the hook with injected React/context/analytics dependencies, without network SDKs.
const source = readFileSync(new URL('../src/hooks/useTarotTrack.js', import.meta.url), 'utf8')
  .replace(/^import .*\n/gm, '').replace('export function', 'function')

test('isolated test consultations emit no analytics; existing tracking remains intact', () => {
  let sandbox = false
  const calls = []
  const hook = runInNewContext(`${source}\nuseTarotTrack`, {
    useCallback: callback => callback, useRef: value => ({ current: value }),
    useAnonymousKey: () => ({ anonymousKey: 'test-anonymous' }), useSession: () => ({ sessionId: 'test-session' }),
    logEvent: (...args) => calls.push(['firebase', ...args]),
    trackServerEvent: (...args) => calls.push(['server', ...args]), isSandbox: () => sandbox,
  })
  hook(true)('tarot_purchase_completed', { revenue: 100 })
  assert.equal(calls.length, 0)
  hook()('tarot_purchase_completed', { revenue: 100 })
  assert.deepEqual(calls.map(call => call[0]), ['firebase', 'server'])
  assert.equal(calls[0][2].revenue, 100)
  assert.equal(calls[0][2].product, 'tarot')
  calls.length = 0
  sandbox = true
  hook(true)('tarot_purchase_completed', { revenue: 100 })
  assert.equal(calls.length, 0)
  hook()('tarot_viewed')
  assert.deepEqual(calls.map(call => call[0]), ['firebase'])
})
