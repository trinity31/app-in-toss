import test from 'node:test';
import assert from 'node:assert/strict';
import { jobPreferencesError, jobKeywordRequest, appendJobPreferences } from './jobInterests.js';
import { createDeepReadingRequest } from './deepReadingAuth.js';

test('requires selected keywords or a bounded interest', () => {
  assert.ok(jobPreferencesError({ keyword_ids: [], interest: ' ' }));
  assert.equal(jobPreferencesError({ keyword_ids: ['curiosity'], interest: '' }), null);
  assert.equal(jobPreferencesError({ keyword_ids: [], interest: 'AI 앱 개발' }), null);
  assert.ok(jobPreferencesError({ keyword_ids: [], interest: 'x'.repeat(301) }));
});
test('lookup uses the same calendar and half-hour fields as generation', () => {
  const body = jobKeywordRequest({ name: 'Test', gender: 'female', birthdate: {
    year: '1979', month: '4', day: '2', period: 'pm', hour12: '2', minuteRange: '30-59',
    birthdayType: 'lunar', isLeapMonth: true,
  } });
  assert.equal(body.datetime, '1979-04-02');
  assert.equal(body.hour, '2');
  assert.equal(body.minute, '30');
  assert.equal(body.am_pm, 'PM');
  assert.equal(body.is_leap_month, true);
  assert.equal(jobKeywordRequest({ birthdate: { year: '1979', month: '4', day: '2' } }).hour, undefined);
});
test('only job requests append interests and reject missing choices', () => {
  const form = new FormData();
  appendJobPreferences(form, { readingType: 'health' });
  assert.equal(form.has('job_preferences'), false);
  assert.throws(() => appendJobPreferences(form, { readingType: 'job' }));
  const preferences = { keyword_ids: [], interest: 'AI 앱 개발' };
  appendJobPreferences(form, { readingType: 'job', job_preferences: preferences });
  assert.deepEqual(JSON.parse(form.get('job_preferences')), preferences);
});

test('keyword lookup uses the established account and strips forged ownership', async () => {
  const request = createDeepReadingRequest({ baseUrl: 'https://backend.test',
    session: () => ({ userId: 'legacy', token: 'signed' }), fetcher: async (url, options) => {
      assert.equal(url, 'https://backend.test/deep-reading/job/keywords');
      assert.equal(options.headers.get('X-Toss-Anon-Token'), 'signed');
      assert.equal(JSON.parse(options.body).user_anonymous_id, 'legacy');
      return { ok: true, status: 200 };
    } });
  await request('/deep-reading/job/keywords', { method: 'POST',
    body: JSON.stringify({ user_anonymous_id: 'forged' }) });
});
