// THE GILDED VAULT IS CUT (2026-09-20, owner). The road past the King is the Deep
// Line, and the Deep Line surfaces at the Ruined Keep's east side.
import test from 'node:test';
import assert from 'node:assert/strict';

await import('../public/bladefall-progression.js');
await import('../public/bladefall-zones.js');
const Progression = globalThis.BladefallProgression;
const Zones = globalThis.BladefallZones;

test('N02 catalog covers every zone and physical connector', () => {
  assert.deepEqual(Zones.validateCatalog(), {
    ok: true, errors: [], zones: 15, seams: 16, endpoints: 32, streamCells: 243,
  });
  assert.equal(Progression.foundationRuns.find((run) => run.id === 'N02').status, 'complete');
  assert.ok(Zones.seams.every((seam) => seam.physical && !seam.transitionPortal));
});

test('dedicated Outskirts, Black Woods, and Broken Causeway runs replace their shell geometry',()=>{
  assert.equal(Zones.zone('outskirts').authoring.geometryStatus,'authored');
  assert.equal(Zones.zone('black-woods').authoring.geometryStatus,'authored');
  assert.equal(Zones.zone('brute').authoring.geometryStatus,'authored');
});

test('stream cells continuously cover each authored shell', () => {
  for (const zone of Zones.zones) {
    assert.equal(zone.streamCells[0].bounds.x1, zone.localBounds.x1);
    assert.equal(zone.streamCells.at(-1).bounds.x2, zone.localBounds.x2);
    for (let index = 1; index < zone.streamCells.length; index++) {
      assert.equal(zone.streamCells[index - 1].bounds.x2, zone.streamCells[index].bounds.x1);
    }
    assert.ok(zone.entrances.length >= 1);
  }
});

test('a road transition has reciprocal safe arrival and rollback data', () => {
  const east = Zones.planTransition('outskirts-black-woods', 'outskirts', {});
  assert.equal(east.ok, true);
  assert.equal(east.targetZoneId, 'black-woods');
  assert.equal(east.activation, 'walk');
  assert.equal(east.commitAt, 'arrival-ready');
  assert.equal(east.rollbackOnFailure, true);
  assert.equal(east.arrival.inward.x, 1);
  assert.ok(east.arrival.spawn.x > Zones.endpoint(east.targetEndpointId).trigger.x2);

  const west = Zones.planTransition('outskirts-black-woods', 'black-woods', {});
  assert.equal(west.targetZoneId, 'outskirts');
  assert.equal(west.arrival.inward.x, -1);
});

test('capability gates are explicit and never consume the capability', () => {
  assert.deepEqual(Zones.eligibility('black-woods-brute', 'black-woods', {}), {
    allowed: false, reason: 'capability-required', missing: ['weapon'],
  });
  assert.equal(Zones.eligibility('black-woods-brute', 'black-woods', { capabilities: ['weapon'] }).allowed, true);
  assert.ok(Zones.seams.every((seam) => seam.returnGuarantee.capabilityIsPermanent));
  assert.ok(Zones.seams.every((seam) => !seam.returnGuarantee.consumesResource));
});

test('the late aqueduct opens from White Court and stays bidirectional', () => {
  const state = { capabilities: ['double-jump'] };
  assert.equal(Zones.eligibility('frostfell-sorcerer', 'frostfell', state).reason, 'sealed-from-this-side');
  const opening = Zones.planTransition('frostfell-sorcerer', 'frost-sorcerer', state);
  assert.equal(opening.ok, true);
  assert.equal(opening.opensConnector, 'frostfell-sorcerer');
  assert.equal(Zones.eligibility('frostfell-sorcerer', 'frostfell', {
    ...state, openedConnectors: ['frostfell-sorcerer'],
  }).allowed, true);
});

test('the road past the King is the Deep Line, and it surfaces at the Keep', () => {
  assert.equal(Zones.eligibility('king-deep-line', 'abyss-king', {}).reason, 'boss-clear-required');
  assert.equal(Zones.eligibility('king-deep-line', 'abyss-king', { clearedZones: ['abyss-king'] }).allowed, true);
  const back = Zones.seam('deep-line-keep');
  assert.ok(back, 'the line has a far end');
  assert.ok(back.endpoints.some((e) => e.zoneId === 'ruined-keep'), 'and it is the Ruined Keep');
});

test('connector forms produce varied physical traversal verbs', () => {
  const verbs = new Set(Zones.seams.flatMap((seam) => seam.endpoints.map((endpoint) => endpoint.activation)));
  for (const verb of ['walk', 'climb', 'interact', 'command', 'plunge', 'ride']) assert.ok(verbs.has(verb));
});

test('zone validation rejects arrival geometry outside its local shell', () => {
  const source = Zones.zone('outskirts');
  const invalid = { ...source, localBounds: { ...source.localBounds, x2: 50 } };
  const report = Zones.validateZone(invalid);
  assert.equal(report.ok, false);
  assert.ok(report.errors.some((error) => error.startsWith('trigger-out-of-bounds')));
});

test('a seam you have already crossed is a road you have won', () => {
  /* Owner: "even though I have all three ship parts, when I go back through the deep
     line, it says 'the threshold does not know this road is won' when trying to return
     to abyss king level from ruined keep."
       `king-deep-line` is gated on clearing 'abyss-king', and the only writer of that
     fact is recordWorldClear(), which refuses whenever G.worldProgressEligible is false
     — Level Select, NG+, a test run — and which also refuses a world node never marked
     `visited`. So the flag can be missing from the save of a player who plainly did the
     killing. openedConnectors is written by the crossing itself and cannot drift. */
  const base = { capabilities: [], clearedZones: [], openedConnectors: [], vaultKeys: [] };
  const cold = Zones.planTransition('king-deep-line', 'deep-line', base);
  assert.equal(cold.ok, false, 'with neither proof the Throne stays shut');
  assert.equal(cold.reason, 'boss-clear-required');
  const byClear = Zones.planTransition('king-deep-line', 'deep-line',
    { ...base, clearedZones: ['abyss-king'] });
  assert.equal(byClear.ok, true, 'a recorded world clear still opens it');
  const byCrossing = Zones.planTransition('king-deep-line', 'deep-line',
    { ...base, openedConnectors: ['king-deep-line'] });
  assert.equal(byCrossing.ok, true, 'and so does having ridden it once');
});
