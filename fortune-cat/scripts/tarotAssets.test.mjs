import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'

const root = new URL('../', import.meta.url)
const read = path => readFile(new URL(path, root), 'utf8')
const index = await read('src/assets/images/cards/index.js')
// Replace only asset imports so the actual lookup and prefetch run in Node.
const executable = index.replace(/import (card\d+) from '\.\/(\d+\.webp)';/g, 'const $1 = "$2";')
const lookup = await import(`data:text/javascript;base64,${Buffer.from(executable).toString('base64')}`)

test('all 78 IDs resolve exactly, invalid IDs are unavailable', () => {
  for (let id = 0; id < 78; id++) assert.equal(lookup.getCardImageUrl(id), `${String(id).padStart(2, '0')}.webp`)
  for (const id of [-1, 78, 999, '22', null, undefined, 1.5, NaN]) assert.equal(lookup.getCardImageUrl(id), null)
})

test('daily prefetch requests only 00..21', () => {
  const fetched = []
  globalThis.window = {}
  globalThis.Image = class { set src(value) { fetched.push(value) } }
  try { lookup.prefetchAllCardImages() } finally { delete globalThis.window; delete globalThis.Image }
  assert.deepEqual(fetched, Array.from({ length: 22 }, (_, id) => `${String(id).padStart(2, '0')}.webp`))
})

test('manifest covers 56 minor identities and verifies every shipped asset hash', async () => {
  const manifest = JSON.parse(await read('src/assets/images/cards/manifest.json'))
  assert.equal(manifest.deck, 'tarot78-v1')
  assert.equal(manifest.conversion.quality, 90)
  assert.equal(manifest.source_manifest_sha256, '40a7147cc7cf127af64f35dcfe1b96da5733f8f09425250210a36b3f6280c864')
  assert.deepEqual(manifest.minors.map(card => card.card_id), Array.from({ length: 56 }, (_, i) => i + 22))
  for (const [suit, start] of [['wands', 22], ['cups', 36], ['swords', 50], ['pentacles', 64]]) {
    const rows = manifest.minors.filter(card => card.suit === suit)
    assert.equal(rows.length, 14)
    assert.equal(rows[0].card_id, start)
    assert.deepEqual(rows.map(card => card.rank), ['ace', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'page', 'knight', 'queen', 'king'])
  }
  for (const card of [...manifest.majors, ...manifest.minors]) {
    const bytes = await readFile(new URL(`src/assets/images/cards/${card.asset}`, root))
    assert.equal(createHash('sha256').update(bytes).digest('hex'), card.asset_sha256)
    assert.equal(bytes.toString('ascii', 0, 4), 'RIFF')
    assert.equal(bytes.toString('ascii', 8, 12), 'WEBP')
    if (card.card_id >= 22) assert.deepEqual(card.dimensions, [1024, 1536])
  }
})

test('daily fetch and storage remain major-only and unknown image has explicit UI', async () => {
  assert.match(await read('src/lib/supabase.js'), /\.gte\('id', 0\)\s*\.lte\('id', 21\)/)
  assert.match(await read('src/hooks/useTodayDrawStorage.js'), /card_id < 0 \|\| card_id > 21/)
  assert.match(await read('src/components/TarotCardArt.jsx'), /image === null/)
  assert.match(await read('src/components/TarotCardArt.jsx'), /카드 이미지 사용 불가/)
})
