import test from 'node:test';
import assert from 'node:assert/strict';

import { summarizeRoute } from '../scripts/interactive-baseline.mjs';

const setup = { x: 70, levelLength: 1000 };

test('interactive probe reports progress without claiming route completion', () => {
  const result = summarizeRoute([
    { stageIndex: 0, x: 70, hp: 100, dead: false, checkpoint: { set: false, x: null } },
    { stageIndex: 0, x: 200, hp: 90, dead: false, checkpoint: { set: true, x: 180 } },
  ], setup, 0);

  assert.equal(result.status, 'entrance-progress-observed');
  assert.equal(result.progressPx, 130);
  assert.deepEqual(result.checkpointXs, [180]);
  assert.equal(result.transitionedTo, null);
});

test('interactive probe distinguishes resets and observed stage transitions', () => {
  const result = summarizeRoute([
    { stageIndex: 0, x: 70, hp: 100, dead: false, checkpoint: { set: false, x: null } },
    { stageIndex: 0, x: 500, hp: 10, dead: false, checkpoint: { set: false, x: null } },
    { stageIndex: 0, x: 70, hp: 100, dead: false, checkpoint: { set: false, x: null } },
    { stageIndex: 1, x: 70, hp: 100, dead: false, checkpoint: { set: false, x: null } },
  ], setup, 0);

  assert.equal(result.status, 'stage-transition-observed');
  assert.equal(result.resetCount, 1);
  assert.equal(result.transitionedTo, 1);
});
