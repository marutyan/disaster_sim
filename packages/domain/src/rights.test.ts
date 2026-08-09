import assert from 'node:assert/strict';
import test from 'node:test';

import { evaluateRights, type RightsPolicy } from './rights.ts';

const basePolicy: RightsPolicy = {
  fetch: 'ALLOW',
  localStore: 'ALLOW',
  transform: 'ALLOW',
  createDerivative: 'ALLOW',
  cacheClientSide: 'ALLOW',
  cacheServerSide: 'ALLOW',
  redistributeOriginal: 'ALLOW',
  redistributeDerivative: 'ALLOW',
  publicDisplay: 'ALLOW',
  commercialUse: 'ALLOW',
};

test('ALLOW-only required actions pass the production Rights Gate', () => {
  assert.deepEqual(evaluateRights(basePolicy, ['transform', 'publicDisplay']), {
    allowed: true,
    blocking: [],
  });
});

test('UNKNOWN blocks production use', () => {
  const policy: RightsPolicy = { ...basePolicy, transform: 'UNKNOWN' };

  assert.deepEqual(evaluateRights(policy, ['transform', 'publicDisplay']), {
    allowed: false,
    blocking: [{ action: 'transform', decision: 'UNKNOWN' }],
  });
});

test('DENY blocks production use', () => {
  const policy: RightsPolicy = { ...basePolicy, redistributeDerivative: 'DENY' };

  assert.deepEqual(evaluateRights(policy, ['redistributeDerivative']), {
    allowed: false,
    blocking: [{ action: 'redistributeDerivative', decision: 'DENY' }],
  });
});

test('NOT_APPLICABLE is not accepted for an action the artifact actually requires', () => {
  const policy: RightsPolicy = { ...basePolicy, cacheClientSide: 'NOT_APPLICABLE' };

  assert.equal(evaluateRights(policy, ['cacheClientSide']).allowed, false);
});
