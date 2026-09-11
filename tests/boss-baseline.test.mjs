import test from 'node:test';
import assert from 'node:assert/strict';

import { summarizeBossProbe } from '../scripts/boss-baseline.mjs';

const definition = { type: 'brute' };
const setup = { checkpointInjection: null };

test('boss summary separates forced phase response from victory evidence', () => {
  const result = summarizeBossProbe([
    { tMs: 0, mode: 'play', player: { hp: 100, maxHp: 100 }, boss: { phase: 1, phase2Started: false, phase3Started: false, hpFraction: 1 }, activity: { projectiles: 0, aoes: 0 } },
    { tMs: 2000, mode: 'play', player: { hp: 100, maxHp: 100 }, boss: { phase: 2, phase2Started: false, phase3Started: false, hpFraction: 0.48 }, activity: { projectiles: 0, aoes: 1 } },
    { tMs: 5200, mode: 'play', player: { hp: 100, maxHp: 100 }, boss: { phase: 1, phase2Started: false, phase3Started: false, hpFraction: 1 }, activity: { projectiles: 0, aoes: 0 } },
  ], setup, definition);

  assert.equal(result.status, 'phase-and-synthetic-restart-observed');
  assert.equal(result.phase2Observed, true);
  assert.equal(result.syntheticDeathRestartObserved, true);
  assert.equal(result.victoryObserved, false);
});

test('Abyss King restart requires return to the disclosed checkpoint', () => {
  const kingSetup = { checkpointInjection: { x: 9000, y: 0 } };
  const result = summarizeBossProbe([
    { tMs: 2000, mode: 'play', player: { x: 9600, hp: 100, maxHp: 100 }, boss: { phase: 2, phase2Started: true, phase3Started: false, hpFraction: 0.48 }, activity: { projectiles: 1, aoes: 0 } },
    { tMs: 5200, mode: 'play', player: { x: 9000, hp: 100, maxHp: 100 }, checkpoint: { set: true }, boss: { phase: 1, phase2Started: false, phase3Started: false, hpFraction: 1 }, activity: { projectiles: 0, aoes: 0 } },
  ], kingSetup, { type: 'king' });

  assert.equal(result.checkpointReturnObserved, true);
  assert.equal(result.status, 'phase-and-synthetic-restart-observed');
});
