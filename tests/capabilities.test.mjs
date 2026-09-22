import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

await import('../public/bladefall-progression.js');
await import('../public/bladefall-capabilities.js');
const Capabilities = globalThis.BladefallCapabilities;

test('N06 authority covers the constitution and starts with jump alone', () => {
  assert.deepEqual(Capabilities.validate(), { ok: true, errors: [], abilities: 12, starting: ['jump'] });
  const fresh = Capabilities.freshState();
  assert.deepEqual(fresh.acquired, ['jump']);
  assert.equal(fresh.grants.jump.source, 'awakening');
  assert.equal(Capabilities.next(fresh).id, 'weapon');
});

test('capabilities require sequence, authored zone, and explicit evidence', () => {
  const fresh = Capabilities.freshState();
  assert.equal(Capabilities.grant(fresh, 'dash', { zone: 'brute', earned: true }).reason, 'sequence-locked');
  assert.equal(Capabilities.grant(fresh, 'weapon', { zone: 'outskirts', earned: true }).reason, 'wrong-zone');
  assert.equal(Capabilities.grant(fresh, 'weapon', { zone: 'black-woods' }).reason, 'missing-authored-evidence');
  const result = Capabilities.grant(fresh, 'weapon', { zone: 'black-woods', earned: true, source: 'found-blade' });
  assert.equal(result.ok, true);
  assert.equal(result.changed, true);
  assert.deepEqual(result.state.acquired, ['jump', 'weapon']);
  assert.deepEqual(result.state.grants.weapon, { zone: 'black-woods', source: 'found-blade', sequence: 2 });
  assert.deepEqual(fresh.acquired, ['jump']);
});

test('acquired capabilities are permanent and grants are idempotent', () => {
  const weapon = Capabilities.grant(Capabilities.freshState(), 'weapon', {
    zone: 'black-woods', earned: true, source: 'found-blade',
  }).state;
  const again = Capabilities.grant(weapon, 'weapon', { zone: 'black-woods', earned: true });
  assert.equal(again.ok, true);
  assert.equal(again.changed, false);
  assert.equal(again.reason, 'already-acquired');
  assert.deepEqual(again.state.acquired, ['jump', 'weapon']);
});

test('capability gates distinguish missing and unknown requirements', () => {
  const fresh = Capabilities.freshState();
  assert.deepEqual(Capabilities.gate(fresh, ['jump']), { allowed: true, missing: [], unknown: [] });
  assert.deepEqual(Capabilities.gate(fresh, ['dash', 'bogus']), {
    allowed: false, missing: ['dash'], unknown: ['bogus'],
  });
});

test('legacy migration infers only the earned prefix from world evidence', () => {
  const migrated = Capabilities.migrate(null, {
    world: { current: 'brute', visited: ['outskirts', 'black-woods', 'brute'], cleared: ['outskirts', 'black-woods'] },
    bestStage: 0,
  });
  assert.deepEqual(migrated.state.acquired, ['jump', 'weapon', 'dash']);
  assert.equal(migrated.receipt.source, 'legacy-world-evidence');
  assert.equal(migrated.receipt.inferredThrough, 'dash');
  assert.ok(migrated.state.history.every((row, index) => index === 0 || row.source === 'legacy-world-evidence'));
});

test('a brand-new legacy save cannot inherit the old all-abilities spawn', () => {
  const migrated = Capabilities.migrate(null, {
    world: { current: 'outskirts', visited: ['outskirts'], cleared: [] }, bestStage: 0, reach: { 0: 0 },
  });
  assert.deepEqual(migrated.state.acquired, ['jump']);
  assert.equal(Capabilities.has(migrated.state, 'weapon'), false);
  assert.equal(Capabilities.has(migrated.state, 'gravity-flip'), false);
});

test('normalization repairs holes and discards unknown or executable save data', () => {
  const state = Capabilities.createState({
    acquired: ['jump', 'portal-single', 'future-power'],
    grants: { jump: { source: () => 'bad' }, 'portal-single': { source: 'kept' }, 'future-power': { source: 'bad' } },
    history: [{ id: 'portal-single', source: 'kept' }, { id: 'future-power', source: 'bad' }],
    revision: -8,
  });
  assert.deepEqual(state.acquired, ['jump', 'weapon', 'dash', 'portal-single']);
  assert.equal(state.grants.jump.source, 'awakening');
  assert.equal(state.grants['portal-single'].source, 'kept');
  assert.equal(state.grants['future-power'], undefined);
  assert.equal(state.revision, 0);
});

test('UI model exposes the earned set, one next destination, and locked remainder', () => {
  const model = Capabilities.uiModel(Capabilities.freshState());
  assert.equal(model.acquired, 1);
  assert.equal(model.total, 12);
  assert.equal(model.next.id, 'weapon');
  assert.deepEqual(model.rows.slice(0, 3).map((row) => row.status), ['acquired', 'next', 'locked']);
  assert.ok(Object.isFrozen(model));
  assert.ok(Object.isFrozen(model.rows));
});

test('runtime wires migration, HUD, authored grants, and a campaign-only reset', async () => {
  const source = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');
  assert.match(source, /BFCapabilitiesModule\.migrate\(meta\.capabilities,meta\)/);
  assert.match(source, /function grantPermanentCapability\(id,source,options\)/);
  assert.match(source, /if\(!\(options&&options\.quiet\)\)toast\(/);
  assert.match(source, /function resetCampaignForNewGame\(\)/);
  assert.match(source, /meta\.capabilities=BFCapabilitiesModule\.freshState\(\)/);
  assert.match(source, /Leaderboards, settings, achievements and earned cosmetic skins remain/);
  assert.match(source, /id="abilityTag"/);
  assert.match(source, /id="abilitiesBtn"/);
});
