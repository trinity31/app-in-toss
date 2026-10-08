// Run against the built preview. Every external request is mocked.
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:4184';
const aiMenu = { code: 'ai_saju_compatibility', title_ko: '궁합풀이', theme_type: 'ai_saju', reading_type: 'ai_saju', is_active: true, display_order: 1, id: 1 };
const yearMenus = ['q4', 'love'].map((code, i) => ({ id: i + 2, code: `new_year_2026_${code}`, title_ko: code === 'q4' ? '2026년 4분기 운세' : '2026년 애정운', theme_type: `new_year_2026_${code}`, reading_type: `new_year_2026_${code}`, is_active: true, display_order: i }));
const row = (id, key, title, action = {}) => ({ id, key, title, is_active: true, display_order: id, surfaces: ['web', 'toss'], icon: '🔮', eyebrow: '추천 풀이', description: 'DB에서 읽은 배너 문구', cta: '바로 보기', color_start: '#efe4fb', color_end: '#c9a8ef', action_type: 'tarot_deep', menu_source: null, menu_code: null, ...action });
const seed = [row(1, 'tarot_deep', '마음에 걸리는 고민 있나요?'), ...yearMenus.map(menu => row(menu.id, menu.code, menu.title_ko, { action_type: 'menu', menu_source: 'new_year', menu_code: menu.code })), row(4, aiMenu.code, aiMenu.title_ko, { action_type: 'menu', menu_source: 'ai_saju', menu_code: aiMenu.code })];

async function main() {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    const errors = [], queries = [];
    let rows = seed, fail = false, hold = false, held, heldRows;
    let ai = [aiMenu, ...Array.from({ length: 9 }, (_, i) => ({ ...aiMenu, id: i + 10, code: `test_${i}`, title_ko: `메뉴 ${i}` }))], year = yearMenus;
    page.on('pageerror', error => errors.push(error.name + ': ' + error.message));
    await page.route('**/*', async route => {
      const url = new URL(route.request().url());
      if (url.origin === baseUrl) return route.continue();
      const table = url.pathname.split('/').at(-1);
      if (table === 'home_banners') {
        queries.push(url.searchParams);
        if (hold) { held = route; heldRows = rows; hold = false; return; }
        if (fail) return route.fulfill({ status: 503, json: { message: 'Mock DB unavailable' } });
        // Apply the server-side filtering the production SELECT requests.
        return route.fulfill({ json: rows.filter(item => item.is_active && item.surfaces.includes('toss')) });
      }
      if (table === 'ai_saju_types' || table === 'new_year_fortune_types') {
        const data = table === 'ai_saju_types' ? ai : year;
        return route.fulfill({ json: url.searchParams.get('is_active') === 'eq.true' ? data.filter(item => item.is_active) : data });
      }
      return route.fulfill({ json: [] });
    });
    const slides = () => page.locator('.home-hero-scroller > button');
    const waitCount = count => page.waitForFunction(count => document.querySelectorAll('.home-hero-scroller > button').length === count, count);
    const foreground = () => page.evaluate(() => window.dispatchEvent(new Event('focus')));
    const waitHeld = async () => {
      const deadline = Date.now() + 5000;
      while (!held && Date.now() < deadline) await page.waitForTimeout(10);
      assert.ok(held, 'Banner refresh request should arrive within 5 seconds');
    };
    const assertReset = async () => {
      assert.equal(await page.locator('.home-hero-scroller').evaluate(el => el.scrollLeft), 0);
      assert.equal(await page.getByLabel('1번째 배너 보기').getAttribute('aria-current'), 'true');
    };
    await page.goto(baseUrl + '/', { waitUntil: 'networkidle' });
    await waitCount(4);
    assert.equal(queries[0].get('is_active'), 'eq.true');
    assert.equal(queries[0].get('surfaces'), 'cs.{toss}');
    assert.equal(queries[0].get('order'), 'display_order.asc,id.asc');
    // A focus refresh during a menu press must not collapse the off-screen hero.
    await page.evaluate(() => window.scrollTo(0, 500));
    const target = page.locator('.tap-card').nth(6);
    const box = await target.boundingBox();
    const scrollBefore = await page.evaluate(() => scrollY);
    const heroHeight = await page.locator('.home-hero-scroller').evaluate(el => el.offsetHeight);
    hold = true;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await foreground();
    await waitHeld();
    await page.waitForTimeout(50);
    assert.equal(await page.evaluate(() => scrollY), scrollBefore, 'Refresh must not move document scroll');
    assert.equal(await page.locator('.home-hero-scroller').evaluate(el => el.offsetHeight), heroHeight);
    const pressedBox = await target.boundingBox();
    assert.ok(Math.abs(pressedBox.y - box.y) < 3, 'Menu target stays put apart from its pressed scale');
    await page.mouse.up();
    await page.waitForURL('**/newyear');
    assert.equal(await page.evaluate(() => window.history.state.usr.selectedType.fortuneType), 'test_5');
    await held.fulfill({ json: heldRows }).catch(() => {});
    held = undefined;
    await page.goBack();
    await waitCount(4);
    console.log('PASS scrolled menu: focus refresh keeps scroll/target stable and first press navigates');

    await page.getByLabel('4번째 배너 보기').click();
    await page.waitForFunction(() => document.querySelector('.home-hero-scroller').scrollLeft > 1000);
    await page.waitForFunction(() => document.querySelector('[aria-label="4번째 배너 보기"]')?.getAttribute('aria-current') === 'true');
    assert.equal(await page.getByLabel('4번째 배너 보기').getAttribute('aria-current'), 'true');
    // Reduced motion disables autoplay and dot scrolling animations.
    const position = await page.locator('.home-hero-scroller').evaluate(el => el.scrollLeft);
    await page.waitForTimeout(4600);
    assert.equal(await page.locator('.home-hero-scroller').evaluate(el => el.scrollLeft), position);
    rows = seed.map(item => item.id === 4 ? { ...item, title: 'DB 수정으로 바뀐 제목', description: '<b>그대로 표시되는 텍스트</b>', cta: '새 CTA', color_start: '#123456', display_order: -1 } : item);
    await foreground();
    await page.getByRole('group', { name: /DB 수정으로 바뀐 제목/ }).waitFor();
    assert.ok((await slides().first().innerText()).includes('DB 수정으로 바뀐 제목'));
    assert.ok((await slides().first().innerText()).includes('<b>그대로 표시되는 텍스트</b>'));
    assert.equal(await slides().first().locator('b').count(), 0);
    assert.ok((await slides().first().evaluate(el => el.style.background)).includes('rgb(18, 52, 86)'));
    await assertReset();
    console.log('PASS same built app: DB edit/colors/plain text/reorder, reduced motion, reset');

    await slides().first().click();
    await page.waitForURL('**/newyear');
    assert.deepEqual(await page.evaluate(() => window.history.state.usr.selectedType), { fortuneType: aiMenu.code, themeType: aiMenu.theme_type, readingType: aiMenu.reading_type, fortuneTypeTitle: aiMenu.title_ko });
    await page.goBack();
    await waitCount(4);
    await page.getByLabel('2번째 배너 보기').click();
    await slides().nth(1).click();
    await page.waitForURL('**/tarot?mode=deep');
    await page.goBack();
    await waitCount(4);
    console.log('PASS actual routes: DB selectedType /newyear, exact /tarot?mode=deep, home re-entry');

    rows = [seed[0]];
    await foreground();
    await waitCount(1);
    await assertReset();
    rows = [];
    await foreground();
    await waitCount(0);
    assert.equal(await page.getByRole('heading', { level: 1, name: '복냥사주·타로' }).count(), 1);
    assert.equal(await page.getByLabel('공유', { exact: true }).count(), 0);
    rows = seed;
    await foreground();
    await waitCount(4);
    console.log('PASS n→1→0→n, no empty hero/share, retained page heading');

    ai = [{ ...aiMenu, is_active: false }];
    rows = [...seed, row(5, 'bad', '지원하지 않는 배너', { action_type: 'external' }), row(6, 'missing', '없는 메뉴', { action_type: 'menu', menu_source: 'new_year', menu_code: 'missing' })];
    await foreground();
    await waitCount(3);
    assert.equal(await page.getByRole('tab', { name: 'AI 사주분석' }).count(), 1);
    console.log('PASS inactive/missing/unsupported rows hide independently, catalog remains available');

    ai = [aiMenu];
    rows = seed;
    fail = true;
    await foreground();
    await waitCount(0);
    await page.waitForTimeout(200);
    assert.equal(await slides().count(), 0);
    assert.equal(await page.getByRole('tab', { name: 'AI 사주분석' }).count(), 1);
    fail = false;
    await foreground();
    await waitCount(4);
    console.log('PASS failure hides hero with no fallback and preserves home menu');

    hold = true;
    rows = [row(10, 'old', '오래된 응답')];
    await foreground();
    await waitHeld();
    assert.equal(await slides().count(), 4, 'Keep the current hero during refresh');
    rows = [row(11, 'latest', '최신 응답')];
    await foreground();
    await waitCount(1);
    assert.ok((await slides().first().innerText()).includes('최신 응답'));
    await held.fulfill({ json: heldRows }).catch(() => {});
    await page.waitForTimeout(100);
    assert.ok((await slides().first().innerText()).includes('최신 응답'));
    console.log('PASS refresh retains layout and late response cannot overwrite latest');
    assert.deepEqual(errors, [], 'Browser render/navigation errors');
    console.log('PASS no browser page errors; every external call mocked');
  } finally {
    await browser.close();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
