import assert from 'node:assert/strict';
import test from 'node:test';

import { SimulationClock } from './simulation.ts';

test('advance emits only complete fixed ticks', () => {
  const clock = new SimulationClock({ tickMs: 50 });

  assert.equal(clock.advance(125), 2);
  assert.equal(clock.tickCount, 2);
  assert.equal(clock.simulationTimeMs, 100);
  assert.equal(clock.accumulatorMs, 25);
});

test('render-frame splitting does not change authoritative tick count', () => {
  const oneFrame = new SimulationClock({ tickMs: 50 });
  const manyFrames = new SimulationClock({ tickMs: 50 });

  oneFrame.advance(160);
  for (const delta of [16, 16, 16, 16, 16, 16, 16, 16, 16, 16]) {
    manyFrames.advance(delta);
  }

  assert.equal(oneFrame.tickCount, 3);
  assert.equal(manyFrames.tickCount, oneFrame.tickCount);
  assert.equal(manyFrames.simulationTimeMs, oneFrame.simulationTimeMs);
  assert.equal(manyFrames.accumulatorMs, oneFrame.accumulatorMs);
});

test('pause freezes authoritative simulation time', () => {
  const clock = new SimulationClock({ tickMs: 50 });
  clock.setPaused(true);

  assert.equal(clock.advance(1000), 0);
  assert.equal(clock.tickCount, 0);
  assert.equal(clock.simulationTimeMs, 0);
});

test('time multiplier scales simulation time without changing fixed tick size', () => {
  const clock = new SimulationClock({ tickMs: 50 });
  clock.setSpeed(5);

  assert.equal(clock.advance(100), 10);
  assert.equal(clock.tickCount, 10);
  assert.equal(clock.simulationTimeMs, 500);
});

test('unsupported time multiplier is rejected', () => {
  const clock = new SimulationClock({ tickMs: 50 });

  assert.throws(() => clock.setSpeed(3), /Unsupported simulation speed/);
});

test('invalid tick duration is rejected', () => {
  assert.throws(() => new SimulationClock({ tickMs: 0 }), /tickMs/);
  assert.throws(() => new SimulationClock({ tickMs: Number.NaN }), /tickMs/);
});

test('negative or non-finite render delta is rejected', () => {
  const clock = new SimulationClock({ tickMs: 50 });

  assert.throws(() => clock.advance(-1), /realDeltaMs/);
  assert.throws(() => clock.advance(Number.POSITIVE_INFINITY), /realDeltaMs/);
});
