import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildAttribution,
  traceSourceDatasets,
  type ProcessingStep,
  type SourceDataset,
} from './provenance.ts';

const source: SourceDataset = {
  datasetId: 'tokushima-max-inundation',
  title: '津波浸水想定（最大浸水深）',
  publisher: '徳島県',
  sourceReference: 'https://opendata.pref.tokushima.lg.jp/dataset/5110.html',
  sourceVersion: '2025-11',
  evidenceClass: 'official_published',
  modified: true,
  requiredNotice: '徳島県公開データを本アプリ向けに加工',
};

const steps: ProcessingStep[] = [
  {
    stepId: 'clip',
    operation: 'clip',
    inputRefs: ['source:tokushima-max-inundation'],
    outputRef: 'artifact:clipped',
    tool: 'fixture-tool',
    toolVersion: '1.0.0',
    parameters: { area: 'mvp' },
  },
  {
    stepId: 'tile',
    operation: 'tile',
    inputRefs: ['artifact:clipped'],
    outputRef: 'artifact:tiles',
    tool: 'fixture-tool',
    toolVersion: '1.0.0',
    parameters: { format: 'vector' },
  },
];

test('attribution includes publisher, title, source reference and modification notice', () => {
  const attribution = buildAttribution([source]);

  assert.match(attribution, /徳島県/);
  assert.match(attribution, /津波浸水想定/);
  assert.match(attribution, /opendata\.pref\.tokushima/);
  assert.match(attribution, /加工/);
});

test('processing DAG traces an artifact back to source datasets', () => {
  assert.deepEqual(traceSourceDatasets('artifact:tiles', [source], steps), [source]);
});

test('unknown artifact has no invented provenance', () => {
  assert.deepEqual(traceSourceDatasets('artifact:missing', [source], steps), []);
});
