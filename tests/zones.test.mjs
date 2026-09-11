import test from 'node:test';
import assert from 'node:assert/strict';

await import('../public/bladefall-progression.js');
await import('../public/bladefall-zones.js');
const Progression = globalThis.BladefallProgression;
const Zones = globalThis.BladefallZones;

test('N02 catalog covers every zone and physical connector', () => {
  assert.deepEqual(Zones.validateCatalog(), {
    ok: true, errors: [], zones: 16, seams: 16, endpoints: 32, streamCells: 269,
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

test('the seven-socket door reports boss and key requirements separately', () => {
  const keys = Progression.keys.map((key) => key.id);
  assert.equal(Zones.eligibility('king-vault', 'abyss-king', { vaultKeys: keys }).reason, 'boss-clear-required');
  const oneMissing = Zones.eligibility('king-vault', 'abyss-king', {
    clearedZones: ['abyss-king'], vaultKeys: keys.slice(1),
  });
  assert.equal(oneMissing.reason, 'vault-keys-required');
  assert.deepEqual(oneMissing.missing, [keys[0]]);
  assert.equal(Zones.eligibility('king-vault', 'abyss-king', {
    clearedZones: ['abyss-king'], vaultKeys: keys,
  }).allowed, true);
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
