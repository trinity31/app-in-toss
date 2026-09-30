import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { HOME_BANNER_COLUMNS, HOME_BANNER_TIMEOUT_MS, fetchHomeBanners, validateHomeBanners, navigateHomeBanner } from '../src/lib/homeBanners.js';

const menus = {
  ai_saju: [{ code: 'ai_saju_compatibility', is_active: true, theme_type: 'ai_saju', reading_type: 'ai_saju', title_ko: '궁합풀이' }],
  new_year: ['q4', 'love'].map(code => ({ code: `new_year_2026_${code}`, is_active: true, theme_type: `new_year_2026_${code}`, reading_type: `new_year_2026_${code}`, title_ko: code === 'q4' ? '2026년 4분기 운세' : '2026년 애정운' })),
};
const row = (overrides = {}) => ({
  id: 1, key: 'tarot_deep', is_active: true, display_order: 0,
  surfaces: ['web', 'toss'], icon: '🔮', eyebrow: '심화 타로상담',
  title: '마음에 걸리는 고민 있나요?', description: '고민을 들려주면 복냥이가 카드를 뽑아 깊이 풀이해 드려요. 첫 상담은 무료예요',
  cta: '심화 타로상담 · 무료로 시작', color_start: '#efe4fb', color_end: '#c9a8ef',
  action_type: 'tarot_deep', menu_source: null, menu_code: null, ...overrides,
});
const seed = [row(), ...['new_year_2026_q4', 'new_year_2026_love', 'ai_saju_compatibility'].map((code, index) => row({
  id: index + 2, key: code, display_order: index + 1, action_type: 'menu',
  menu_source: index === 2 ? 'ai_saju' : 'new_year', menu_code: code,
  surfaces: ['web', 'android', 'toss'],
}))];
function mockClient(getData) {
  const calls = [], signals = [];
  return { calls, signals, from(table) {
    calls.push(['from', table]);
    const query = {
      select(...args) { calls.push(['select', table, ...args]); return query; },
      eq(...args) { calls.push(['eq', table, ...args]); return query; },
      contains(...args) { calls.push(['contains', table, ...args]); return query; },
      order(...args) { calls.push(['order', table, ...args]); return query; },
      abortSignal(signal) { signals.push(signal); return getData(table); },
    };
    return query;
  } };
}
const database = banners => table => ({ data: table === 'home_banners' ? banners : menus[table === 'ai_saju_types' ? 'ai_saju' : 'new_year'], error: null });

test('seed preserves four destinations and resolves current DB menu state', () => {
  const slides = validateHomeBanners(seed, menus);
  assert.equal(slides.length, 4);
  assert.deepEqual(slides.map(slide => slide.key), seed.map(item => item.key));
  assert.equal(slides[0].to, '/tarot?mode=deep');
  assert.equal(slides[0].bg, 'linear-gradient(135deg, #efe4fb 0%, #c9a8ef 100%)');
  for (const [index, menu] of [...menus.new_year, ...menus.ai_saju].entries()) {
    assert.deepEqual(slides[index + 1].selectedType, { fortuneType: menu.code, themeType: menu.theme_type, readingType: menu.reading_type, fortuneTypeTitle: menu.title_ko });
  }
  const changedMenus = { ...menus, ai_saju: [{ ...menus.ai_saju[0], theme_type: 'updated-theme', reading_type: 'updated-reading', title_ko: 'DB title' }] };
  assert.equal(validateHomeBanners(seed, changedMenus)[3].selectedType.readingType, 'updated-reading');
  assert.equal(validateHomeBanners(seed, changedMenus)[3].selectedType.fortuneTypeTitle, 'DB title');
});

test('malformed/unsupported rows skip independently, text stays plain, and surfaces filter', () => {
  const invalid = [null, {}, ...[
    { id: 0 }, { id: 9007199254740992 }, { id: '9223372036854775808' },
    { key: '' }, { is_active: false }, { display_order: 1.5 }, { display_order: 2147483648 },
    { surfaces: ['web'] }, { surfaces: ['toss', 'unknown'] }, { surfaces: 'toss' },
    { surfaces: ['android', 'toss'] },
    { color_start: 'red' }, { color_end: '#123456;url(https://bad)' }, { color_start: '#abc' },
    { icon: '' }, { title: '   ' }, { cta: null }, { eyebrow: 'a'.repeat(201) }, { description: 4 },
    { action_type: 'external' }, { action_type: 'menu', menu_source: 'saju', menu_code: 'x' }, { menu_code: 'unexpected' },
  ].map(item => row(item))];
  const plain = row({ title: '<img src=x onerror=alert(1)>', description: '<b>DB text</b>' });
  assert.deepEqual(validateHomeBanners([...invalid, plain], menus).map(slide => slide.title), [plain.title]);
  assert.deepEqual(validateHomeBanners(undefined), []);
  assert.deepEqual(validateHomeBanners(seed, menus, 'unknown'), []);
});

test('missing, inactive or incomplete destinations never leave clickable menu banners', () => {
  assert.deepEqual(validateHomeBanners(seed, {}).map(slide => slide.key), ['tarot_deep']);
  const inactive = { ai_saju: menus.ai_saju.map(item => ({ ...item, is_active: false })), new_year: menus.new_year.map(item => ({ ...item, is_active: false })) };
  assert.deepEqual(validateHomeBanners(seed, inactive).map(slide => slide.key), ['tarot_deep']);
  assert.equal(validateHomeBanners([seed[3]], { ai_saju: [{ ...menus.ai_saju[0], reading_type: null }] }).length, 0);
  assert.equal(validateHomeBanners([row({ action_type: 'menu', menu_source: 'new_year', menu_code: 'missing' })], menus).length, 0);
  assert.deepEqual(validateHomeBanners(seed, { ai_saju: {}, new_year: null }).map(slide => slide.key), ['tarot_deep']);
});

test('sort uses display_order then full bigint id and unique keys', () => {
  const rows = [row({ id: '9223372036854775807', key: 'last' }), row({ id: '9007199254740993', key: 'middle' }), row({ id: 2, key: 'first' }), row({ id: 7, key: 'priority', display_order: -1 })];
  assert.deepEqual(validateHomeBanners(rows).map(slide => slide.key), ['priority', 'first', 'middle', 'last']);
  assert.equal(validateHomeBanners([rows[0], rows[0]]).length, 1);
});

test('SELECT is explicitly active toss-only and ordered, active menus are separate from catalog', async () => {
  const client = mockClient(database(seed));
  assert.equal((await fetchHomeBanners(client)).length, 4);
  assert.ok(client.calls.some(call => call[0] === 'select' && call[1] === 'home_banners' && call[2] === HOME_BANNER_COLUMNS));
  assert.deepEqual(client.calls.filter(call => call[0] === 'eq'), ['home_banners', 'ai_saju_types', 'new_year_fortune_types'].map(table => ['eq', table, 'is_active', true]));
  assert.deepEqual(client.calls.filter(call => call[0] === 'contains'), [['contains', 'home_banners', 'surfaces', ['toss']]]);
  assert.deepEqual(client.calls.filter(call => call[0] === 'order'), [['order', 'home_banners', 'display_order', { ascending: true }], ['order', 'home_banners', 'id', { ascending: true }]]);
  assert.equal(new Set(client.signals).size, 1);
});

test('same client reflects DB-only edit, reorder, add, hide, delete and empty without fallback', async () => {
  let rows = seed;
  const client = mockClient(table => database(rows)(table));
  assert.equal((await fetchHomeBanners(client)).length, 4);
  rows = seed.map(item => item.id === 4 ? { ...item, title: 'Edited DB title', cta: 'Changed CTA', color_start: '#123456', display_order: -2 } : item);
  const slides = await fetchHomeBanners(client);
  assert.equal(slides[0].title, 'Edited DB title');
  assert.equal(slides[0].cta, 'Changed CTA');
  assert.match(slides[0].bg, /#123456/);
  rows = [...rows, row({ id: 5, key: 'added' })];
  assert.equal((await fetchHomeBanners(client)).length, 5);
  rows = rows.map(item => ({ ...item, is_active: item.id === 5 }));
  assert.deepEqual((await fetchHomeBanners(client)).map(slide => slide.key), ['added']);
  rows = [];
  assert.deepEqual(await fetchHomeBanners(client), []);
});

test('errors, exceptions, abort and a bounded timeout hide banners; menu failures skip affected rows', async () => {
  assert.deepEqual(await fetchHomeBanners(mockClient(() => ({ data: seed, error: { message: 'Denied' } }))), []);
  assert.deepEqual(await fetchHomeBanners({ from() { throw Error('Offline'); } }), []);
  const hanging = mockClient(() => new Promise(() => {}));
  assert.equal(HOME_BANNER_TIMEOUT_MS, 15000);
  assert.deepEqual(await fetchHomeBanners(hanging, { timeoutMs: 5 }), []);
  assert.ok(hanging.signals.every(signal => signal.aborted));
  const abortController = new AbortController();
  const pending = fetchHomeBanners(hanging, { signal: abortController.signal });
  abortController.abort();
  assert.deepEqual(await pending, []);
  assert.deepEqual(await fetchHomeBanners(hanging, { signal: abortController.signal }), []);
  const menuFailure = mockClient(table => table === 'ai_saju_types' ? { error: 'Denied', data: menus.ai_saju } : database(seed)(table));
  assert.deepEqual((await fetchHomeBanners(menuFailure)).map(slide => slide.key), seed.slice(0, 3).map(item => item.key));
});

test('each click emits existing telemetry once with exact deep query or DB navigation state', () => {
  for (const slide of validateHomeBanners(seed, menus)) {
    const clicks = [], tarot = [], navigation = [];
    navigateHomeBanner(slide, { navigate: (...args) => navigation.push(args), trackClick: (...args) => clicks.push(args), trackTarot: (...args) => tarot.push(args) });
    assert.deepEqual(clicks, [['hero_banner_click', { menu: slide.key }, slide.eyebrow]]);
    if (slide.key === 'tarot_deep') {
      assert.deepEqual(tarot, [['tarot_deep_entry_click', { from: 'home_banner' }]]);
      assert.deepEqual(navigation, [['/tarot?mode=deep']]);
    } else {
      assert.deepEqual(tarot, []);
      assert.deepEqual(navigation, [['/newyear', { state: { selectedType: slide.selectedType } }]]);
    }
  }
});

const hookSource = readFileSync(new URL('../src/hooks/useHomeBanners.js', import.meta.url), 'utf8')
  .replace(/^import .*\n/gm, '').replace('export function', 'function');
function eventTarget() {
  const events = new Map();
  return { visibilityState: 'visible', events,
    addEventListener: (name, fn) => events.set(name, fn), removeEventListener: name => events.delete(name),
    emit: (name, event = {}) => events.get(name)?.(event),
  };
}
const flush = () => new Promise(resolve => setImmediate(resolve));

test('mount, re-entry and foreground clear stale campaigns and guard late/unmounted requests', async () => {
  let state, cleanup, dependencies;
  const requests = [], doc = eventTarget(), win = eventTarget();
  const hook = runInNewContext(`${hookSource}\nuseHomeBanners`, {
    useState: () => [[], next => { state = next; }],
    useEffect: (effect, deps) => { dependencies = deps; cleanup = effect(); },
    AbortController, document: doc, window: win,
    fetchHomeBanners: (client, { signal }) => new Promise(resolve => requests.push({ client, signal, resolve })),
  });
  const client = {};
  hook(client, 'entry-1');
  assert.deepEqual(Array.from(state), []);
  assert.equal(requests.length, 1);
  assert.deepEqual(Array.from(dependencies), [client, 'entry-1']);
  requests[0].resolve(['old']);
  await flush();
  assert.deepEqual(state, ['old']);
  doc.emit('visibilitychange');
  assert.deepEqual(Array.from(state), []);
  win.emit('focus');
  assert.equal(requests[1].signal.aborted, true);
  requests[2].resolve(['latest']);
  await flush();
  requests[1].resolve(['late old request']);
  await flush();
  assert.deepEqual(state, ['latest']);
  doc.visibilityState = 'hidden';
  doc.emit('visibilitychange');
  win.emit('focus');
  assert.equal(requests.length, 3);
  win.emit('pageshow', { persisted: false });
  assert.equal(requests.length, 3);
  doc.visibilityState = 'visible';
  win.emit('pageshow', { persisted: true });
  assert.deepEqual(Array.from(state), []);
  cleanup();
  assert.equal(requests[3].signal.aborted, true);
  assert.equal(doc.events.size + win.events.size, 0);
  requests[3].resolve(['unmounted']);
  await flush();
  assert.deepEqual(Array.from(state), []);
  hook(client, 'entry-2');
  assert.equal(requests.length, 5);
  assert.deepEqual(Array.from(dependencies), [client, 'entry-2']);
  requests[4].resolve([]);
  await flush();
  assert.deepEqual(state, []);
  cleanup();
});
