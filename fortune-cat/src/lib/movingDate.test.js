import test from 'node:test';
import assert from 'node:assert/strict';
import { appendMovingPeriod, koreanToday, movingPeriodError, isMovingResponse } from './movingDate.js';
const period = { start_date: '2026-10-09', end_date: '2026-10-31' };
test('Korean today rolls over at 15 UTC', () => {
  assert.equal(koreanToday(new Date('2026-10-08T15:00:00Z')), '2026-10-09');
});
test('validates real dates, inclusive 90 days, reversed dates and maximum date', () => {
  const error = p => movingPeriodError(p, '2026-10-09');
  assert.equal(error({start_date:'2026-10-09',end_date:'2027-01-06'}), null);
  assert.match(error({start_date:'2026-10-09',end_date:'2027-01-07'}), /90/);
  assert.ok(error({start_date:'2026-02-30',end_date:'2026-10-09'}));
  assert.ok(error({start_date:'2026-10-10',end_date:'2026-10-09'}));
  assert.ok(error({start_date:'2050-12-31',end_date:'2051-01-01'}));
});
test('moving form fields are sent only for this menu', () => {
  const first = koreanToday();
  const form = new FormData();
  appendMovingPeriod(form, {readingType:'moving_date', moving_period:{start_date:first,end_date:first}});
  assert.equal(form.get('moving_start_date'), first);
  const other = new FormData(); appendMovingPeriod(other,{readingType:'job'});
  assert.equal([...other].length, 0);
  assert.throws(() => appendMovingPeriod(new FormData(),{readingType:'moving_date'}));
});
test('rejects generic readings and range mismatch, accepts preview and no candidates', () => {
  assert.equal(isMovingResponse({thread_id:'old',is_preview:true}, period), false);
  assert.equal(isMovingResponse({thread_id:'new',is_preview:true,moving_date_result:null}, period), true);
  const noCandidates = {thread_id:'',moving_date_result:{status:'no_candidates',period,recommendations:[],excluded_dates:[{date:'2026-10-09'}]}};
  assert.equal(isMovingResponse(noCandidates,period), true);
  assert.equal(isMovingResponse(noCandidates,{...period,end_date:'2026-11-01'}), false);
  assert.equal(isMovingResponse({...noCandidates,thread_id:'payable'},period), false);
  const full = {thread_id:'new',moving_date_result:{...noCandidates.moving_date_result,status:'ok',recommendations:[{date:'2026-10-20'}]}};
  assert.equal(isMovingResponse(full,period),true);
  full.moving_date_result.recommendations[0].date='2026-11-01';
  assert.equal(isMovingResponse(full,period),false);
});
