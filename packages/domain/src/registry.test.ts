import assert from 'node:assert/strict';
import test from 'node:test';

import { validateDatasetRegistration, type DatasetRegistration } from './registry.ts';

const allowed: DatasetRegistration = {
  datasetId: 'tokushima-max-inundation',
  title: '津波浸水想定（最大浸水深）',
  publisher: '徳島県',
  productionRequiredActions: ['fetch', 'localStore', 'transform', 'createDerivative', 'publicDisplay'],
  rights: {
    fetch: 'ALLOW',
    localStore: 'ALLOW',
    transform: 'ALLOW',
    createDerivative: 'ALLOW',
    cacheClientSide: 'UNKNOWN',
    cacheServerSide: 'ALLOW',
    redistributeOriginal: 'UNKNOWN',
    redistributeDerivative: 'ALLOW',
    publicDisplay: 'ALLOW',
    commercialUse: 'ALLOW',
  },
};

test('dataset is production usable when every required action is ALLOW', () => {
  assert.deepEqual(validateDatasetRegistration(allowed), {
    productionUsable: true,
    blocking: [],
  });
});

test('non-required UNKNOWN rights do not invent permission but do not block this artifact', () => {
  assert.equal(validateDatasetRegistration(allowed).productionUsable, true);
  assert.equal(allowed.rights.cacheClientSide, 'UNKNOWN');
});

test('BY-ND-like derivative restriction blocks an artifact that requires derivatives', () => {
  const blocked: DatasetRegistration = {
    ...allowed,
    datasetId: 'tokushima-arrival-30cm',
    rights: { ...allowed.rights, createDerivative: 'DENY' },
  };

  assert.deepEqual(validateDatasetRegistration(blocked), {
    productionUsable: false,
    blocking: [{ action: 'createDerivative', decision: 'DENY' }],
  });
});
