import test from 'node:test';
import assert from 'node:assert/strict';

await import('../public/bladefall-progression.js');
await import('../public/bladefall-zones.js');
await import('../public/bladefall-streaming.js');
const Zones = globalThis.BladefallZones;
const Streaming = globalThis.BladefallStreaming;

test('N03 is complete only with the executable streaming controller present', () => {
  assert.equal(globalThis.BladefallProgression.foundationRuns.find((run) => run.id === 'N03').status, 'complete');
  assert.equal(Streaming.SCHEMA, 'bladefall.zone-streamer');
  assert.deepEqual(Streaming.PHASES, ['idle', 'preloading', 'armed', 'committing', 'settling', 'rolling-back']);
});

function harness(overrides = {}) {
  const calls = [];
  let clock = 0;
  let current = 'outskirts';
  const adapter = {
    now: () => ++clock,
    async preload(plan, context) {
      calls.push(['preload', plan.targetZoneId, context.token]);
      return { ready: true, zoneId: plan.targetZoneId, revision: 1 };
    },
    captureSource(plan) {
      calls.push(['capture', plan.sourceZoneId]);
      return { zoneId: current, playerX: 900 };
    },
    commit(plan) {
      calls.push(['commit', plan.targetZoneId]);
      current = plan.targetZoneId;
      return { zoneId: current };
    },
    placeArrival(plan) { calls.push(['place', plan.targetEndpointId]); },
    handoffCamera(plan) { calls.push(['camera', plan.targetZoneId]); },
    releaseSource(plan) { calls.push(['release', plan.sourceZoneId]); },
    rollback(plan, snapshot) {
      calls.push(['rollback', snapshot.zoneId]);
      current = snapshot.zoneId;
    },
    discard(plan, prepared, reason) { calls.push(['discard', prepared.zoneId, reason]); },
    ...overrides,
  };
  const streamer = Streaming.createStreamer({ zones: Zones, adapter });
  return { streamer, adapter, calls, get current() { return current; }, set current(value) { current = value; } };
}

test('N03 streamer preloads, commits, places, hands off, then releases source', async () => {
  const h = harness();
  const warmed = await h.streamer.warm('outskirts-black-woods', 'outskirts', {});
  assert.equal(warmed.phase, 'armed');
  assert.equal(h.current, 'outskirts');
  assert.deepEqual(h.calls, [['preload', 'black-woods', warmed.token]]);

  const crossed = await h.streamer.cross('outskirts-black-woods', 'outskirts', {});
  assert.equal(crossed.ok, true);
  assert.equal(crossed.phase, 'settling');
  assert.equal(h.current, 'black-woods');
  assert.deepEqual(h.calls.slice(1, 5).map((call) => call[0]), ['capture', 'commit', 'place', 'camera']);
  assert.ok(!h.calls.some((call) => call[0] === 'release'));

  h.streamer.tick(0.27);
  assert.equal(h.streamer.diagnostics().phase, 'settling');
  h.streamer.tick(0.02);
  assert.equal(h.streamer.diagnostics().phase, 'idle');
  assert.deepEqual(h.calls.at(-1), ['release', 'outskirts']);
  assert.equal(h.streamer.diagnostics().counters.completed, 1);
});

test('the same controller crosses a seam in both directions', async () => {
  const h = harness();
  await h.streamer.cross('outskirts-black-woods', 'outskirts', {});
  h.streamer.tick(1);
  assert.equal(h.current, 'black-woods');
  await h.streamer.cross('outskirts-black-woods', 'black-woods', {});
  h.streamer.tick(1);
  assert.equal(h.current, 'outskirts');
  assert.equal(h.streamer.diagnostics().counters.completed, 2);
});

test('a warmed target is cached without committing early', async () => {
  const h = harness();
  await h.streamer.warm('outskirts-black-woods', 'outskirts', {});
  assert.equal(h.current, 'outskirts');
  await h.streamer.cancel('stepped-away');
  const second = await h.streamer.warm('outskirts-black-woods', 'outskirts', {});
  assert.equal(second.cached, true);
  assert.equal(h.calls.filter((call) => call[0] === 'preload').length, 1);
  assert.equal(h.streamer.diagnostics().counters.cacheHits, 1);
});

test('a commit error restores the captured source instead of stranding the player', async () => {
  const h = harness({
    commit() { h.calls.push(['commit-failure']); throw new Error('target-build-failed'); },
  });
  const receipt = await h.streamer.cross('outskirts-black-woods', 'outskirts', {});
  assert.equal(receipt.ok, false);
  assert.equal(receipt.reason, 'commit-failed');
  assert.equal(receipt.rolledBack, true);
  assert.equal(h.current, 'outskirts');
  assert.deepEqual(h.calls.at(-1), ['rollback', 'outskirts']);
  assert.equal(h.streamer.diagnostics().phase, 'idle');
  assert.equal(h.streamer.diagnostics().counters.rolledBack, 1);
});

test('canceling an unresolved preload prevents its stale target from committing', async () => {
  let resolvePreload;
  const h = harness({
    preload(plan) {
      h.calls.push(['preload-pending', plan.targetZoneId]);
      return new Promise((resolve) => { resolvePreload = resolve; });
    },
  });
  const warming = h.streamer.warm('outskirts-black-woods', 'outskirts', {});
  await Promise.resolve();
  const cancellation = h.streamer.cancel('left-trigger');
  resolvePreload({ ready: true, zoneId: 'black-woods' });
  const [warmReceipt, cancelReceipt] = await Promise.all([warming, cancellation]);
  assert.equal(warmReceipt.ok, false);
  assert.equal(cancelReceipt.reason, 'canceled');
  assert.equal(h.streamer.diagnostics().phase, 'idle');
  assert.ok(!h.calls.some((call) => call[0] === 'commit'));
});

test('locked seams fail before preloading any target data', async () => {
  const h = harness();
  const receipt = await h.streamer.cross('black-woods-brute', 'black-woods', {});
  assert.equal(receipt.ok, false);
  assert.equal(receipt.reason, 'capability-required');
  assert.deepEqual(receipt.missing, ['weapon']);
  assert.deepEqual(h.calls, []);
});

test('streaming diagnostics remain immutable snapshots', async () => {
  const h = harness();
  await h.streamer.warm('outskirts-black-woods', 'outskirts', {});
  const report = h.streamer.diagnostics();
  assert.equal(Object.isFrozen(report), true);
  assert.equal(Object.isFrozen(report.events), true);
  assert.throws(() => { report.phase = 'idle'; }, TypeError);
});
