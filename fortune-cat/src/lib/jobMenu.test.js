import test from 'node:test';
import assert from 'node:assert/strict';
import { JOB_MENU, withJobMenu } from './jobMenu.js';

test('the normal menu appends job with the API routing contract', () => {
  const original = [{ code: 'ai_saju_total', display_order: 11 }];
  const rows = withJobMenu(original);
  assert.equal(rows[1].reading_type, 'job');
  assert.equal(rows[1].theme_type, 'ai_saju');
  assert.equal(rows[1].display_order, 12);
  assert.equal(original.length, 1);
});
test('an existing job menu is preserved without duplication', () => {
  const rows = [{ ...JOB_MENU, id: 123 }];
  assert.equal(withJobMenu(rows), rows);
});
