import assert from 'node:assert/strict';
import test from 'node:test';

import { DeterministicRng } from './prng.ts';

test('same seed produces the same random sequence', () => {
  const left = new DeterministicRng('tokushima-mvp:42');
  const right = new DeterministicRng('tokushima-mvp:42');

  const leftValues = Array.from({ length: 8 }, () => left.nextFloat());
  const rightValues = Array.from({ length: 8 }, () => right.nextFloat());

  assert.deepEqual(leftValues, rightValues);
});

test('different seeds produce different random sequences', () => {
  const left = new DeterministicRng('seed-a');
  const right = new DeterministicRng('seed-b');

  const leftValues = Array.from({ length: 4 }, () => left.nextUint32());
  const rightValues = Array.from({ length: 4 }, () => right.nextUint32());

  assert.notDeepEqual(leftValues, rightValues);
});

test('nextFloat always returns a value in [0, 1)', () => {
  const rng = new DeterministicRng('range-check');

  for (let index = 0; index < 1000; index += 1) {
    const value = rng.nextFloat();
    assert.ok(value >= 0);
    assert.ok(value < 1);
  }
});
