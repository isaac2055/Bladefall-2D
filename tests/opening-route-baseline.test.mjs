import test from 'node:test';
import assert from 'node:assert/strict';

import { summarizeOpeningRoute } from '../scripts/opening-route-baseline.mjs';

const stage = { index: 0 };
const setup = { x: 70, levelLength: 1000 };

function sample(tMs, x, stageIndex = 0, checkpoint = null) {
  return {
    tMs,
    stageIndex,
    player: { x, y: 0 },
    checkpoint: checkpoint || { set: false, x: null },
    routeSensors: { portalsPlaced: 0, boss: null },
  };
}

test('opening route summary reports partial progress without human signoff', () => {
  const result = summarizeOpeningRoute([
    sample(0, 70),
    sample(2000, 400, 0, { set: true, x: 300 }),
  ], setup, stage);

  assert.equal(result.status, 'extended-route-partial-progress');
  assert.equal(result.maxX, 400);
  assert.deepEqual(result.checkpointXs, [300]);
  assert.equal(result.humanPlayabilitySignoff, false);
});

test('opening route summary recognizes a real stage transition', () => {
  const result = summarizeOpeningRoute([
    sample(0, 70),
    sample(5000, 950),
    sample(5200, 70, 1),
  ], setup, stage);

  assert.equal(result.status, 'stage-transition-observed');
  assert.equal(result.transitionedToStage, 1);
});

test('opening route summary counts reset-shaped position drops', () => {
  const result = summarizeOpeningRoute([
    sample(0, 70), sample(1000, 750), sample(1200, 70),
    sample(2200, 760), sample(2400, 70),
    sample(3400, 770), sample(3600, 70),
  ], setup, stage);

  assert.equal(result.status, 'extended-route-repeated-resets');
  assert.equal(result.resetCount, 3);
});
