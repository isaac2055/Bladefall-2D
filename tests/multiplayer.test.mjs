import test from 'node:test';
import assert from 'node:assert/strict';

await import('../public/bladefall-multiplayer.js');
const Multiplayer = globalThis.BladefallMultiplayer;

test('protocol sequences independent channels and rejects stale volatile packets', () => {
  const host = Multiplayer.createEndpoint({ role: 'host' });
  const guest = Multiplayer.createEndpoint({ role: 'guest' });
  const first = host.encode('snapshot', { x: 10 });
  const second = host.encode('snapshot', { x: 20 });

  assert.equal(guest.receive(second).accepted, true);
  assert.equal(guest.receive(first).reason, 'duplicate');
  assert.equal(host.encode('stageReady', { ready: 1 }).s, 1);
  assert.equal(host.diagnostics().gaps, 0);
  assert.equal(guest.diagnostics().gaps, 1);
});

test('reliable events deduplicate and acknowledge across the next packet', () => {
  const host = Multiplayer.createEndpoint({ role: 'host', reliableRetryMs: 10 });
  const guest = Multiplayer.createEndpoint({ role: 'guest' });
  const death = host.encode('enemyDead', { id: 4 }, { now: 0 });

  assert.equal(guest.receive(death).accepted, true);
  assert.equal(guest.receive(death).reason, 'duplicate');
  const acknowledgement = guest.encode('input', { right: 1 });
  assert.equal(host.receive(acknowledgement).accepted, true);
  assert.equal(host.diagnostics().pendingReliable, 0);
});

test('traveler and remix intents use the reliable event channel', () => {
  assert.equal(Multiplayer.channelFor('travelerIntent'), Multiplayer.CHANNELS.event);
  assert.equal(Multiplayer.channelFor('remixIntent'), Multiplayer.CHANNELS.event);
  const guest = Multiplayer.createEndpoint({ role: 'guest' });
  assert.equal(guest.encode('travelerIntent', { i: 0, action: 'follow' }).r, 1);
});

test('split portal placement converges through reliable full-pair intent', () => {
  const host = Multiplayer.createEndpoint({ role: 'host' });
  const guest = Multiplayer.createEndpoint({ role: 'guest' });
  const floorMouth = { x: 4700, y: 0, nx: 0, ny: 1, surf: 'floor' };
  const wallMouth = { x: 4980, y: 650, nx: 1, ny: 0, surf: 'wall' };

  const hostState = host.encode('portals', { mouths: [floorMouth] }, { now: 10 });
  const guestState = guest.receive(hostState);
  assert.equal(guestState.accepted, true);
  assert.deepEqual(guestState.payload.mouths, [floorMouth]);

  const guestIntent = guest.encode('portalIntent', {
    action: 'place', mouths: [...guestState.payload.mouths, wallMouth],
  }, { now: 20 });
  const hostIntent = host.receive(guestIntent);
  assert.equal(hostIntent.accepted, true);
  assert.equal(guestIntent.r, 1);
  assert.deepEqual(hostIntent.payload.mouths, [floorMouth, wallMouth]);

  const acknowledgement = host.encode('snapshot', { portals: hostIntent.payload.mouths });
  assert.equal(guest.receive(acknowledgement).accepted, true);
  assert.equal(guest.diagnostics().pendingReliable, 0);
});

test('epoch changes discard old packets and reset channel sequences', () => {
  const host = Multiplayer.createEndpoint({ role: 'host' });
  const guest = Multiplayer.createEndpoint({ role: 'guest' });
  const old = host.encode('snapshot', { stage: 0 });
  host.advanceEpoch();
  guest.advanceEpoch();

  assert.equal(guest.receive(old).reason, 'stale-epoch');
  const current = host.encode('snapshot', { stage: 1 });
  assert.equal(current.e, 1);
  assert.equal(current.s, 1);
  assert.equal(guest.receive(current).accepted, true);
});

test('snapshot buffer interpolates delayed motion and caps extrapolation', () => {
  const buffer = Multiplayer.createSnapshotBuffer({ interpolationMs: 100, extrapolationMs: 120 });
  buffer.push({ x: 0, y: 0, vx: 100, vy: 0 }, 1000, 1);
  buffer.push({ x: 10, y: 0, vx: 100, vy: 0 }, 1100, 2);

  assert.equal(buffer.sample(1150).x, 5);
  assert.equal(buffer.sample(1400).x, 22);
});

test('prediction reconciliation nudges small errors and snaps impossible divergence', () => {
  const soft = Multiplayer.reconcileState({ x: 100, y: 0, vx: 50 }, { x: 120, y: 0, vx: 40 });
  assert.equal(soft.corrected, 'soft');
  assert.ok(soft.state.x > 100 && soft.state.x < 120);

  const hard = Multiplayer.reconcileState({ x: 100, y: 0 }, { x: 500, y: 20 });
  assert.equal(hard.corrected, 'hard');
  assert.equal(hard.state.x, 500);
});

test('host validation clamps impossible remote movement but preserves legal movement', () => {
  const legal = Multiplayer.validateRemoteState({ x: 100, y: 0 }, { x: 125, y: 5, vx: 200, vy: 0 }, 50);
  assert.equal(legal.clamped, false);
  assert.equal(legal.state.x, 125);

  const warp = Multiplayer.validateRemoteState({ x: 100, y: 0 }, { x: 1000, y: 0, vx: 9000, vy: 0 }, 16);
  assert.equal(warp.clamped, true);
  assert.ok(warp.state.x < 200);
  assert.equal(warp.state.vx, 920);
});

test('transition barrier requires unanimous readiness and both load acknowledgements', () => {
  const barrier = Multiplayer.createTransitionBarrier();
  barrier.open(3, 7);
  barrier.ready('local');
  assert.equal(barrier.prepare(4, 1234), null);
  barrier.ready('remote');
  const prepared = barrier.prepare(4, 1234, '7-1');
  assert.equal(prepared.phase, 'prepared');
  assert.equal(barrier.beginLoad('7-1'), true);
  barrier.loaded('local', '7-1');
  assert.equal(barrier.canResume(), false);
  barrier.loaded('remote', '7-1');
  assert.equal(barrier.canResume(), true);
  assert.equal(barrier.resume('7-1').phase, 'resumed');
});
