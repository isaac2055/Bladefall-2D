// The Gilded Vault was cut on 2026-09-20; its campaign stage slot is kept inert so
// that no stageIndex after it moves, but it is not a zone, a site or a recollection.
import test from 'node:test';
import assert from 'node:assert/strict';

await import('../public/bladefall-progression.js');
await import('../public/bladefall-zones.js');
await import('../public/bladefall-recovery.js');
const Recovery = globalThis.BladefallRecovery;

test('N05 recovery catalog gives every zone a deliberate site and useful station network', () => {
  assert.equal(globalThis.BladefallProgression.foundationRuns.find((run) => run.id === 'N05').status, 'complete');
  assert.deepEqual(Recovery.validateCatalog(), { ok: true, errors: [], sites: 15, stations: 9 });
  assert.equal(Recovery.siteForZone('outskirts').id, 'march-camp');
  assert.equal(Recovery.siteForZone('brute').fastTravel, false);
  assert.equal(Recovery.siteForZone('deep-line').fastTravel, true);
});

test('checkpoints are named, zone-aware, and idempotent', () => {
  const first = Recovery.activateCheckpoint(null, {
    id: 'outskirts:road-2', zoneId: 'outskirts', kind: 'checkpoint', position: { x: 2400, y: 80 },
  });
  assert.equal(first.changed, true);
  assert.deepEqual(first.state.activeCheckpoint.position, { x: 2400, y: 80 });
  const second = Recovery.activateCheckpoint(first.state, first.state.activeCheckpoint);
  assert.equal(second.changed, false);
  assert.equal(second.state.revision, first.state.revision);
});

test('death returns to a current-zone checkpoint without resetting persistent encounters', () => {
  const checkpoint = Recovery.activateCheckpoint(null, {
    id: 'woods:fork', zoneId: 'black-woods', kind: 'checkpoint', position: { x: 3100, y: 0 },
  }).state;
  const death = Recovery.recordDeath(checkpoint, 'black-woods', { x: 70, y: 0 });
  assert.equal(death.state.deaths, 1);
  assert.equal(death.plan.checkpointId, 'woods:fork');
  assert.equal(death.plan.preservePermanentState, true);
  assert.equal(death.plan.preserveRestResetDefeats, true);

  const foreign = Recovery.recordDeath(checkpoint, 'updrafts', { x: 180, y: 20 });
  assert.equal(foreign.plan.checkpointId, 'updrafts:entrance');
  assert.deepEqual(foreign.plan.position, { x: 180, y: 20 });
});

test('rest discovers its site, heals, and deliberately schedules visited enemy resets', () => {
  const receipt = Recovery.rest(null, 'march-camp', ['outskirts', 'black-woods', 'outskirts', 'unknown']);
  assert.equal(receipt.reason, 'rested');
  assert.equal(receipt.state.lastRestSiteId, 'march-camp');
  assert.equal(receipt.state.rests, 1);
  assert.equal(receipt.state.activeCheckpoint.kind, 'rest');
  assert.deepEqual(receipt.resetZoneIds, ['outskirts', 'black-woods']);
  assert.equal(receipt.site.enemyReset, 'rest-reset-only');
});

test('fast travel requires discovered stations, a safe source station, and never resets enemies', () => {
  let state = Recovery.activateSite(null, 'march-camp').state;
  assert.equal(Recovery.fastTravelEligibility(state, 'ethereal-shelter', {
    atSiteId: 'march-camp', campaign: true,
  }).reason, 'destination-undiscovered');
  state = Recovery.activateSite(state, 'ethereal-shelter').state;
  assert.equal(Recovery.fastTravelEligibility(state, 'ethereal-shelter', {
    atSiteId: 'march-camp', campaign: true, threatNearby: true,
  }).reason, 'area-unsafe');
  assert.equal(Recovery.fastTravelEligibility(state, 'ethereal-shelter', {
    atSiteId: 'march-camp', campaign: true,
  }).allowed, true);
  const journey = Recovery.planFastTravel(state, 'ethereal-shelter', {
    atSiteId: 'march-camp', campaign: true,
  });
  assert.equal(journey.ok, true);
  assert.equal(journey.zoneId, 'black-woods');
  assert.equal(journey.checkpoint.siteId, 'ethereal-shelter');
  assert.equal(journey.resetsEnemies, false);
});

test('non-station rests cannot be used as teleport destinations', () => {
  let state = Recovery.activateSite(null, 'march-camp').state;
  state = Recovery.activateSite(state, 'causeway-vigil').state;
  assert.equal(Recovery.fastTravelEligibility(state, 'causeway-vigil', {
    atSiteId: 'march-camp', campaign: true,
  }).reason, 'destination-has-no-station');
});

test('fog-of-war derives visited cells and frontier from persistent world evidence', () => {
  const recovery = Recovery.activateSite(null, 'march-camp').state;
  const zoneState = { zones: {
    outskirts: { visits: 2, discoveredCells: ['outskirts:cell-0', 'outskirts:cell-1'] },
  } };
  const map = Recovery.mapModel(recovery, zoneState, 'outskirts');
  assert.equal(map.nodes.find((node) => node.id === 'outskirts').status, 'current');
  assert.equal(map.nodes.find((node) => node.id === 'outskirts').discoveredCells, 2);
  assert.equal(map.nodes.find((node) => node.id === 'black-woods').status, 'frontier');
  assert.equal(map.nodes.find((node) => node.id === 'warden').status, 'frontier');
  assert.equal(map.nodes.find((node) => node.id === 'deep-line').status, 'hidden');
  assert.equal(map.routes.find((route) => route.id === 'outskirts-black-woods').status, 'frontier');
});

test('recovery migration removes unknown sites and repairs invalid checkpoints', () => {
  const migration = Recovery.migrate({
    schema: Recovery.SCHEMA, version: 0,
    activatedSites: { 'march-camp': { visits: 2 }, nowhere: { visits: 99 } },
    activeCheckpoint: { id: 'bad', zoneId: 'nowhere', position: { x: Infinity } },
    lastRestSiteId: 'nowhere',
  });
  assert.deepEqual(Object.keys(migration.state.activatedSites), ['march-camp']);
  assert.equal(migration.state.activeCheckpoint, null);
  assert.equal(migration.state.lastRestSiteId, null);
  assert.equal(Recovery.validateState(migration.state).ok, true);
});
