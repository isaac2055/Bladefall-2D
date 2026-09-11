import test from 'node:test';
import assert from 'node:assert/strict';

import { summarizeDynamicProbe } from '../scripts/dynamic-baseline.mjs';

test('dynamic portal summary separates mouth activation from transit', () => {
  const setup = { player: { x: 5440, y: 0 } };
  const activated = summarizeDynamicProbe('portal-anchor-transit', [
    { player: { x: 5440 }, portals: [] },
    { player: { x: 5500 }, portals: [{ x: 5440 }] },
  ], setup);
  const transited = summarizeDynamicProbe('portal-anchor-transit', [
    { player: { x: 5440 }, portals: [{ x: 5440 }] },
    { player: { x: 6020 }, portals: [{ x: 5440 }] },
  ], setup);

  assert.equal(activated.status, 'activation-observed-transit-unproven');
  assert.equal(transited.status, 'activation-and-transit-observed');
});

test('speed-gated portal transit remains labeled as state-positioned evidence', () => {
  const result = summarizeDynamicProbe('portal-anchor-speed-gate', [
    { player: { x: 5440 }, portals: [{ x: 5440 }] },
    { player: { x: 6140 }, portals: [{ x: 5440 }] },
  ], { player: { x: 5440, y: 0 } });

  assert.equal(result.status, 'state-positioned-high-speed-transit-observed');
  assert.equal(result.forcedEntrySpeed, 950);
});

test('dynamic summaries require both follower states and both gravity states', () => {
  const follower = summarizeDynamicProbe('follower-command-cycle', [
    { followers: [{ state: 'follow' }], player: {} },
    { followers: [{ state: 'wait' }], player: {} },
  ], {});
  const gravity = summarizeDynamicProbe('gravity-flip-cycle', [
    { gravity: { flipped: false }, player: {} },
    { gravity: { flipped: true }, player: {} },
  ], {});

  assert.equal(follower.status, 'hold-and-follow-observed');
  assert.equal(gravity.status, 'flip-and-righting-observed');
});

test('forced checkpoint summary remains explicit about its synthetic failure', () => {
  const result = summarizeDynamicProbe('checkpoint-forced-rewind', [
    { tMs: 1000, checkpoint: { set: true, x: 2180 }, player: { x: 2200, y: 0 } },
    { tMs: 2200, checkpoint: { set: true, x: 2180 }, player: { x: 2180, y: 40 } },
  ], {});

  assert.equal(result.status, 'checkpoint-and-rewind-observed');
  assert.equal(result.forcedFailureSetup, true);
});
