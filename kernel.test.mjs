import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as K from './kernel.mjs';

test('empty ballots return zero total and no winner', () => {
  const result = K.tallyQuorum([], 10);
  assert.deepEqual(result, { ok: true, met: false, total: 0, winner: null, tally: {} });
});

test('duplicate voter collapses to last vote', () => {
  const result = K.tallyQuorum([
    { voter: 'a', weight: 5, choice: 'yes' },
    { voter: 'b', weight: 5, choice: 'no' },
    { voter: 'a', weight: 5, choice: 'no' },
  ], 10);
  assert.equal(result.ok, true);
  assert.equal(result.total, 10);
  assert.equal(result.winner, 'no');
  assert.deepEqual(result.tally, { no: 10 });
});

test('non-finite and negative weights are discarded', () => {
  const result = K.tallyQuorum([
    { voter: 'a', weight: -5, choice: 'yes' },
    { voter: 'b', weight: NaN, choice: 'yes' },
    { voter: 'c', weight: Infinity, choice: 'yes' },
    { voter: 'd', weight: 5, choice: 'no' },
  ], 5);
  assert.equal(result.total, 5);
  assert.deepEqual(result.tally, { no: 5 });
  assert.equal(result.winner, 'no');
  assert.equal(result.met, true);
});

test('exact threshold boundary counts as met', () => {
  const result = K.tallyQuorum([{ voter: 'a', weight: 10, choice: 'yes' }], 10);
  assert.equal(result.met, true);
  assert.equal(result.total, 10);
});

test('total just under threshold is not met', () => {
  const result = K.tallyQuorum([{ voter: 'a', weight: 10, choice: 'yes' }], 10.0001);
  assert.equal(result.met, false);
});

test('malformed top-level input returns ok:false without throwing', () => {
  assert.equal(K.tallyQuorum('not-an-array', 10).ok, false);
  assert.equal(K.tallyQuorum([], -1).ok, false);
});

test('NaN threshold is rejected even though it is not less than zero', () => {
  // NaN is typeof 'number' and NaN < 0 is false — only the !Number.isFinite
  // clause catches it. Isolates that clause from the others in the || chain.
  const result = K.tallyQuorum([], NaN);
  assert.equal(result.ok, false);
});

test('zero threshold is a valid non-negative value, not rejected', () => {
  const result = K.tallyQuorum([], 0);
  assert.equal(result.ok, true);
  assert.equal(result.met, true);
});

test('null entry in the array is skipped without throwing', () => {
  const result = K.tallyQuorum([
    null,
    { voter: 'a', weight: 5, choice: 'yes' },
  ], 5);
  assert.equal(result.ok, true);
  assert.equal(result.total, 5);
  assert.deepEqual(result.tally, { yes: 5 });
});

test('voter of exactly null is discarded', () => {
  const result = K.tallyQuorum([
    { voter: null, weight: 5, choice: 'yes' },
    { voter: 'a', weight: 3, choice: 'no' },
  ], 5);
  assert.equal(result.total, 3);
  assert.deepEqual(result.tally, { no: 3 });
});

test('choice of exactly null is discarded', () => {
  const result = K.tallyQuorum([
    { voter: 'a', weight: 5, choice: null },
    { voter: 'b', weight: 3, choice: 'no' },
  ], 5);
  assert.equal(result.total, 3);
  assert.deepEqual(result.tally, { no: 3 });
});

test('zero weight is valid and counted, not discarded', () => {
  const result = K.tallyQuorum([{ voter: 'a', weight: 0, choice: 'yes' }], 0);
  assert.equal(result.ok, true);
  assert.deepEqual(result.tally, { yes: 0 });
  assert.equal(result.total, 0);
  assert.equal(result.winner, 'yes');
  assert.equal(result.met, true);
});

test('tie in weight keeps the first-seen choice as winner', () => {
  const result = K.tallyQuorum([
    { voter: 'a', weight: 5, choice: 'yes' },
    { voter: 'b', weight: 5, choice: 'no' },
  ], 5);
  assert.equal(result.winner, 'yes');
  assert.deepEqual(result.tally, { yes: 5, no: 5 });
});
