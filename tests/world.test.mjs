// THE GILDED VAULT IS CUT (2026-09-20, owner). The road past the King is the Deep
// Line, and the Deep Line surfaces at the Ruined Keep's east side.
import test from 'node:test';
import assert from 'node:assert/strict';

await import('../public/bladefall-world.js');
const World = globalThis.BladefallWorld;

test('world graph covers every stage and preserves the mandatory late gate', () => {
  assert.deepEqual(World.validateGraph(), {
    ok: true, errors: [], nodes: 15, routes: 16, endingRoutes: 2,
  });
  assert.equal(new Set(World.nodes.map((node) => node.stageIndex)).size, 15);
  assert.equal(World.stageId(14), null, 'stage 14 is the cut slot and is not a place');
  assert.equal(World.stageId(15), 'deep-line');
  assert.equal(World.stageId(15), 'deep-line');
});

test('ability-gated branches become world routes without appearing early',()=>{
  const cleared=World.clear(World.createProgress(),'outskirts').progress;
  assert.deepEqual(World.outgoing(cleared).map(route=>route.id),['outskirts-black-woods']);
  assert.deepEqual(World.outgoing(cleared,{capabilities:['wall-jump']}).map(route=>route.id),
    ['outskirts-black-woods','outskirts-warden']);
  const entered=World.enter(cleared,'warden',{capabilities:['wall-jump']});
  assert.equal(entered.ok,true);
  assert.equal(entered.progress.entryRoute,'outskirts-warden');
  const returned=World.enter(entered.progress,'outskirts');
  assert.equal(returned.ok,true);
  assert.equal(returned.progress.entryRoute,'outskirts-warden');
});

test('a fresh world unlocks forward movement only after the current node clears', () => {
  const fresh = World.createProgress();
  assert.deepEqual(fresh.visited, ['outskirts']);
  assert.deepEqual(World.outgoing(fresh), []);
  assert.equal(World.enter(fresh, 'black-woods').reason, 'route-locked');

  const cleared = World.clear(fresh, 'outskirts').progress;
  assert.deepEqual(World.outgoing(cleared).map((route) => route.to), ['black-woods']);
  const entered = World.enter(cleared, 'black-woods');
  assert.equal(entered.ok, true);
  assert.equal(entered.progress.current, 'black-woods');
  assert.ok(entered.progress.anchors.includes('black-woods'));
});

test('anchor travel permits backtracking but cannot discover a forward node', () => {
  let state = World.createProgress();
  state = World.clear(state).progress;
  state = World.enter(state, 'black-woods').progress;
  assert.equal(World.enter(state, 'ruined-keep', { fastTravel: true }).reason, 'anchor-locked');
  const returned = World.enter(state, 'outskirts', { fastTravel: true });
  assert.equal(returned.ok, true);
  assert.equal(returned.progress.current, 'outskirts');
  assert.equal(returned.progress.entryRoute, 'anchor-travel');
  assert.equal(World.createProgress(returned.progress).entryRoute, 'anchor-travel');
  assert.deepEqual(World.fastTravelTargets(returned.progress).map((node) => node.id), ['outskirts', 'black-woods']);
});

test('the truth route continues beyond the King into the Vault and Deep Line', () => {
  let state = World.createProgress({
    current: 'abyss-king',
    visited: World.nodes.filter((node) => node.stageIndex <= 13).map((node) => node.id),
    cleared: World.nodes.filter((node) => node.stageIndex < 13).map((node) => node.id),
  });
  assert.deepEqual(World.outgoing(state), []);
  state = World.clear(state).progress;
  assert.deepEqual(World.outgoing(state).map((route) => route.to), ['deep-line']);
  state = World.clear(state).progress;
  state = World.enter(state, 'deep-line').progress;
  state = World.clear(state).progress;
  assert.equal(World.ending(state), 'wake-armed');
  // The line does not dead-end any more: it surfaces at the Ruined Keep, so the last
  // place on the truth route leads back into the world the knight started in.
  assert.deepEqual(World.outgoing(state).map((route) => route.to), ['ruined-keep']);
});

test('map projection distinguishes explored, frontier, and hidden places', () => {
  let state = World.createProgress();
  state = World.clear(state).progress;
  const map = World.mapModel(state);
  assert.equal(map.nodes.find((node) => node.id === 'outskirts').status, 'current');
  assert.equal(map.nodes.find((node) => node.id === 'black-woods').status, 'frontier');
  assert.equal(map.nodes.find((node) => node.id === 'ruined-keep').status, 'hidden');
  assert.equal(map.routes.find((route) => route.id === 'outskirts-black-woods').status, 'available');
});

test('travel eligibility requires a visited anchor and a safe campaign context', () => {
  const state = World.createProgress({
    current: 'black-woods',
    visited: ['outskirts', 'black-woods'],
    cleared: ['outskirts'],
    anchors: ['outskirts', 'black-woods'],
  });
  const ready = { campaign: true, atAnchor: true, playerReady: true };
  assert.deepEqual(World.travelEligibility(state, 'outskirts', ready), { allowed: true, reason: 'ready' });
  assert.equal(World.travelEligibility(state, 'ruined-keep', ready).reason, 'anchor-locked');
  assert.equal(World.travelEligibility(state, 'outskirts', { ...ready, threatNearby: true }).reason, 'area-unsafe');
  assert.equal(World.travelEligibility(state, 'outskirts', { ...ready, atAnchor: false }).reason, 'return-to-anchor');
  assert.equal(World.travelEligibility(state, 'outskirts', { ...ready, coop: true }).reason, 'partner-linked');
});

test('legacy linear progress migrates without granting unseen anchors', () => {
  const migration = World.migrateProgress(null, {
    bestStage: 6,
    reach: { 0: 7 },
    run: { ngPlus: 0, stageIndex: 5 },
  });
  assert.equal(migration.receipt.source, 'legacy-campaign');
  assert.equal(migration.progress.current, 'frostfell');
  assert.ok(migration.progress.visited.includes('frostfell'));
  assert.ok(migration.progress.cleared.includes('warden'));
  assert.ok(!migration.progress.visited.includes('emberdeep'));
  assert.ok(!migration.progress.anchors.includes('emberdeep'));
});

test('existing Vault and Deep Line clears preserve alternate-ending truth', () => {
  const migration = World.migrateProgress(null, {
    bestStage: 13,
    vaultCleared: true,
    secretCleared: true,
  });
  assert.equal(migration.progress.flags.vaultCleared, true);
  assert.equal(migration.progress.flags.deepLineCleared, true);
  assert.equal(World.ending(migration.progress), 'wake-armed');
});
