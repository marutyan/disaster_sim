import assert from 'node:assert/strict';
import test from 'node:test';

import {
  EVIDENCE_CLASSES,
  RIGHTS_DECISIONS,
  createRunIdentityKey,
  type ScenarioRunIdentity,
} from './types.ts';

test('evidence classes preserve the approved provenance boundary', () => {
  assert.deepEqual(EVIDENCE_CLASSES, [
    'official_published',
    'official_derived',
    'app_derived',
    'app_simulated',
    'illustrative',
  ]);
});

test('rights decisions include UNKNOWN as an explicit state', () => {
  assert.deepEqual(RIGHTS_DECISIONS, ['ALLOW', 'DENY', 'UNKNOWN', 'NOT_APPLICABLE']);
});

test('run identity key changes when engine version changes', () => {
  const base: ScenarioRunIdentity = {
    scenarioId: 'tokushima-mvp',
    scenarioVersion: '1',
    datasetVersions: { intensity: '2026-02' },
    artifactVersions: { city: 'fixture-v1' },
    engineVersion: '0.1.0',
    seed: '42',
    initialConditionsHash: 'initial',
    playerProfileHash: 'player',
    preparednessProfileHash: 'preparedness',
  };

  const changed: ScenarioRunIdentity = { ...base, engineVersion: '0.1.1' };

  assert.notEqual(createRunIdentityKey(base), createRunIdentityKey(changed));
  assert.equal(createRunIdentityKey(base), createRunIdentityKey({ ...base }));
});

test('run identity key is independent of record insertion order', () => {
  const left: ScenarioRunIdentity = {
    scenarioId: 'tokushima-mvp',
    scenarioVersion: '1',
    datasetVersions: { intensity: '2026-02', population: '2026-07' },
    artifactVersions: { city: 'fixture-v1', roads: 'fixture-v1' },
    engineVersion: '0.1.0',
    seed: '42',
    initialConditionsHash: 'initial',
    playerProfileHash: 'player',
    preparednessProfileHash: 'preparedness',
  };
  const right: ScenarioRunIdentity = {
    ...left,
    datasetVersions: { population: '2026-07', intensity: '2026-02' },
    artifactVersions: { roads: 'fixture-v1', city: 'fixture-v1' },
  };

  assert.equal(createRunIdentityKey(left), createRunIdentityKey(right));
});
