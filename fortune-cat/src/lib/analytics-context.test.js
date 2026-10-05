import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readUserType, nextUserType } from './analytics-context.js'

test('unknown includes first visits and blocked storage', () => {
  assert.equal(readUserType(undefined), 'unknown')
  assert.equal(readUserType({ getItem() { throw new Error('blocked') } }), 'unknown')
  assert.equal(readUserType({ getItem() { return 'bad' } }), 'unknown')
})

test('development/sandbox and recognized internal traffic remain internal', () => {
  assert.equal(readUserType(undefined, true), 'internal')
  assert.equal(nextUserType('internal', 'external'), 'internal')
  assert.equal(nextUserType('external', 'internal'), 'internal')
  assert.equal(nextUserType('external', 'bad'), 'unknown')
})
