import test from 'node:test';
import assert from 'node:assert/strict';

await import('../public/bladefall-campaign.js');
await import('../public/bladefall-charters.js');

const Campaign = globalThis.BladefallCampaign;
const Charters = globalThis.BladefallCharters;

function assembled(charter, overrides = {}) {
  const owner = charter.rooms[0].owner;
  return Object.assign({
    meta: { length: 1600 },
    start: { x: 70, y: 0 },
    exit: { type: 'portal', x: 1500, y: 0 },
    objects: [
      { id: 'ground', type: 'plat', x: 800, y: 0, w: 1600, authoringOwner: 'custom-level', authoringRoom: owner },
    ],
    enemies: [], pickups: [], travelers: [],
  }, overrides);
}

test('all 16 blueprints produce complete immutable charter stubs', () => {
  const catalog = Charters.catalog(Campaign.blueprints);
  assert.equal(catalog.length, 16);
  for (const charter of catalog) {
    assert.equal(Charters.validateCharter(charter).ok, true, charter.id);
    assert.deepEqual(charter.routes.map((route) => route.id), ['fresh', 'revisit', 'optional', 'speedrun']);
    assert.deepEqual(charter.phases.map((phase) => phase.id), ['P', 'G', 'C', 'V']);
    assert.equal(Object.isFrozen(charter), true);
    assert.equal(Object.isFrozen(charter.rooms), true);
  }
  assert.equal(catalog[0].phases[0].status, 'complete');
  assert.equal(catalog[0].phases[1].status, 'complete');
  assert.equal(catalog[0].phases[2].status, 'complete');
  assert.equal(catalog[0].phases[3].status, 'pending');
  assert.ok(catalog[0].rooms.every((room) => room.status === 'assembled'));
  assert.deepEqual(catalog[0].rooms[2].bounds, { start: 4700, end: 7000 });
  assert.equal(catalog[0].rooms[5].focalX, 12700);
  assert.equal(catalog[0].planningReceipt, 'docs/charters/01-outskirts/charter.md');
  assert.deepEqual(catalog[0].pacing, { firstRunMinutes: [25, 32], speedrunMinutes: [5, 8] });
  assert.equal(catalog[1].phases[0].status, 'complete');
  assert.equal(catalog[1].phases[1].status, 'complete');
  assert.equal(catalog[1].phases[2].status, 'complete');
  assert.ok(catalog[1].rooms.every((room) => room.status === 'assembled'));
  assert.deepEqual(catalog[1].rooms[2].bounds, { start: 4200, end: 6700 });
  assert.equal(catalog[1].rooms[3].focalX, 8200);
  assert.equal(catalog[2].phases[0].status, 'complete');
  assert.equal(catalog[2].phases[1].status, 'complete');
  assert.equal(catalog[2].phases[2].status, 'complete');
  assert.ok(catalog[2].rooms.every((room) => room.status === 'assembled'));
  assert.deepEqual(catalog[2].rooms[2].bounds, { start: 5600, end: 8200 });
  assert.equal(catalog[2].rooms[4].focalX, 12150);
  assert.equal(catalog[3].phases[0].status, 'complete');
  assert.equal(catalog[3].phases[1].status, 'complete');
  assert.equal(catalog[3].phases[2].status, 'complete');
  assert.deepEqual(catalog[3].rooms[2].bounds, { start: 3100, end: 5700 });
  assert.equal(catalog[3].rooms[2].focalX, 4380);
  assert.equal(catalog[3].rooms[6].focalX, 15900);
  assert.equal(catalog[4].phases[0].status, 'complete');
  assert.equal(catalog[4].phases[1].status, 'complete');
  assert.equal(catalog[4].phases[2].status, 'complete');
  assert.ok(catalog[4].rooms.every((room) => room.status === 'assembled'));
  assert.deepEqual(catalog[4].rooms[2].bounds, { start: 5600, end: 9000 });
  assert.equal(catalog[4].rooms[3].focalX, 10400);
  assert.equal(catalog[5].phases[0].status, 'complete');
  assert.equal(catalog[5].phases[1].status, 'complete');
  assert.equal(catalog[5].phases[2].status, 'complete');
  assert.ok(catalog[5].rooms.every((room) => room.status === 'assembled'));
  assert.deepEqual(catalog[5].rooms[2].bounds, { start: 4800, end: 8200 });
  assert.equal(catalog[5].rooms[5].focalX, 16400);
  assert.equal(catalog[6].phases[0].status, 'complete');
  assert.equal(catalog[6].phases[1].status, 'complete');
  assert.equal(catalog[6].phases[2].status, 'complete');
  assert.ok(catalog[6].rooms.every((room) => room.status === 'assembled'));
  assert.deepEqual(catalog[6].rooms[2].bounds, { start: 5100, end: 7700 });
  assert.equal(catalog[6].rooms[5].focalX, 13800);
  assert.ok(catalog.slice(7).every((charter) => charter.phases[0].status === 'pending'
    && charter.phases[1].status === 'pending'&&charter.phases[2].status === 'pending'));
});

test('dynamic systems require setup, failure, recovery, and success receipts', () => {
  const charter = Charters.createCharter(Campaign.blueprint(3));
  assert.ok(charter.dynamicEvidence.some((entry) => entry.system === 'authored-thermals'));
  assert.ok(charter.dynamicEvidence.some((entry) => entry.system === 'contained-rain-cistern'));
  assert.ok(charter.dynamicEvidence.some((entry) => entry.system === 'three-wind-gates'));
  assert.deepEqual(charter.dynamicEvidence[0].required, ['setup', 'failure', 'recovery', 'success']);
  const plan = Charters.evidencePlan(charter);
  assert.ok(plan.stills.includes('entrance'));
  assert.ok(plan.stills.includes('exit'));
  assert.deepEqual(plan.routes, ['fresh', 'revisit', 'optional', 'speedrun']);
});

test('geometry audit rejects unknown owners, generic additions, and uncontained fluids', () => {
  const charter = Charters.createCharter(Campaign.blueprint(3));
  const report = Charters.auditGeometry(assembled(charter, {
    meta: { length: 1600 },
    start: { x: 70, y: 0 },
    objects: [
      { id: 'ground', type: 'plat', x: 800, y: 0, w: 1600, authoringOwner: 'custom-level', authoringRoom: charter.rooms[0].owner },
      { id: 'puddle', type: 'fluid', x: 700, y: 0, w: 300, h: 30, campaignComposition: 'current-updraft' },
    ],
  }), charter);
  assert.equal(report.ok, false);
  assert.ok(report.errors.some((entry) => entry.code === 'geometry.owner.missing'));
  assert.ok(report.errors.some((entry) => entry.code === 'geometry.generic-gameplay'));
  assert.ok(report.errors.some((entry) => entry.code === 'fluid.containment'));
});

test('geometry audit accepts explicitly owned bounded fluids and supported travelers', () => {
  const charter = Charters.createCharter(Campaign.blueprint(9));
  const owner = charter.rooms[1].owner;
  const report = Charters.auditGeometry(assembled(charter, {
    meta: { length: 1600 },
    start: { x: 70, y: 0 },
    objects: [
      { id: 'ground', type: 'plat', x: 800, y: 0, w: 1600, authoringOwner: 'procedural-stage-generator', authoringRoom: owner },
      { id: 'basin', type: 'fluid', x: 900, y: 0, w: 300, h: 80, contained: true, basinId: 'relay-basin', authoringOwner: 'elemental-act-remaster', authoringRoom: owner },
    ],
    travelers: [
      { id: 'sera', type: 'escort', x: 500, y: 0, authoringOwner: 'people-and-place', authoringRoom: owner },
    ],
  }), charter);
  assert.equal(report.ok, true);
  assert.equal(report.ownershipCoverage, 1);
  assert.equal(report.counts.containedFluids, 1);
});

test('phase gates cannot close without every named receipt', () => {
  const charter = Charters.createCharter(Campaign.blueprint(0));
  const requirements = charter.phases[0].requirements;
  assert.equal(Charters.phaseGate(charter, 'P', { evidence: requirements.slice(0, -1) }).ok, false);
  assert.equal(Charters.phaseGate(charter, 'P', { evidence: requirements }).ok, true);
});
