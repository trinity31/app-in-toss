// Exercise the built app with synthetic API responses; no payments or DB writes.
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fixture = require('./fixtures/moving_date_v2.json');
const origin = process.env.MOVING_TEST_ORIGIN || 'http://127.0.0.1:4186';
(async () => {
  const browser = await chromium.launch();
  try {
    for (const mode of ['full', 'empty', 'preview', 'old']) {
      const page = await browser.newPage({ viewport: { width: 320, height: 844 } });
      const errors = [];
      let requests = 0;
      page.on('pageerror', error => errors.push(error.message));
      await page.route('**/*', async route => {
        const request = route.request(), url = new URL(request.url());
        if (url.origin === origin) return route.continue();
        if (url.pathname.endsWith('/ai_saju_types')) return route.fulfill({ json: [{ code: 'ai_saju_moving_date', title_ko: '이사하기 좋은 날', theme_type: 'ai_saju', reading_type: 'moving_date', is_active: true, display_order: 1, id: 1 }] });
        if (url.pathname === '/deep-reading/start') {
          requests++;
          const body = request.postData();
          for (const text of ['moving_start_date', '2026-10-10', 'moving_end_date', '2026-10-31', 'moving_date']) assert.ok(body.includes(text));
          assert.ok(!body.includes('partner'));
          const response = { thread_id: 'synthetic-moving-thread', reading: '이사 기간 분석', follow_up_questions: [], moving_date_result: fixture, is_preview: false };
          if (mode === 'empty') Object.assign(response, { thread_id: null, moving_date_result: { ...fixture, status: 'no_candidates', recommendations: [] } });
          if (mode === 'preview') Object.assign(response, { is_preview: true, moving_date_result: null });
          if (mode === 'old') delete response.moving_date_result;
          return route.fulfill({ json: response });
        }
        return route.fulfill({ json: [] });
      });
      await page.goto(origin);
      await page.getByText('이사하기 좋은 날', { exact: true }).click();
      for (const [placeholder, value] of [['이름 또는 닉네임', '테스트'], ['1995', '1990'], ['09', '01'], ['12', '01']]) await page.getByPlaceholder(placeholder, { exact: true }).fill(value);
      await page.getByRole('button', { name: '여성', exact: true }).click();
      await page.getByRole('button', { name: '다음', exact: true }).click();
      await page.getByLabel('시작일', { exact: true }).fill('2026-10-10');
      await page.getByLabel('종료일', { exact: true }).fill('2026-10-31');
      await page.getByRole('button', { name: '사주 풀이 받기', exact: true }).click();
      const marker = mode === 'full' ? '추천 이사일' : mode === 'empty' ? '이 기간에는 추천할 수 있는 날짜가 없어요.' : mode === 'old' ? '생성하는데 실패했습니다' : '이사 기간 분석';
      await page.getByText(marker, { exact: mode !== 'old' }).first().waitFor();
      assert.equal(requests, 1);
      if (mode === 'full') {
        for (const item of fixture.recommendations) assert.equal(await page.locator(`time[datetime="${item.date}"]`).count(), 1);
        for (const item of fixture.excluded_dates) assert.ok((await page.locator('#root').innerText()).includes(item.date));
        assert.ok(!(await page.locator('.moving-results').innerText()).match(/천덕|월덕|건제/));
      }
      if (mode === 'preview') assert.equal(await page.locator('.moving-results').count(), 0);
      if (mode === 'empty') assert.ok(await page.getByLabel('시작일', { exact: true }).isVisible());
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false, `${mode}: horizontal overflow`);
      assert.deepEqual(errors, []);
      console.log(`PASS ${mode}: actual app flow, API period, 320px layout`);
      await page.close();
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
