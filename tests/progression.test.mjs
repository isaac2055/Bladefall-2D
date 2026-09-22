// THE GILDED VAULT IS CUT (2026-09-20, owner). The road past the King is the Deep
// Line, and the Deep Line surfaces at the Ruined Keep's east side.
import test from 'node:test';
import assert from 'node:assert/strict';

await import('../public/bladefall-progression.js');
const Progression = globalThis.BladefallProgression;

test('N01 constitution is internally valid and single-player authoritative', () => {
  assert.deepEqual(Progression.validate(), {
    ok: true, errors: [], zones: 15, connectors: 16, abilities: 12, vaultKeys: 7, foundationRuns: 16,
  });
  assert.equal(Progression.MODE, 'single-player');
  assert.deepEqual(Progression.foundationRuns.slice(0, 11).map((run) => [run.id, run.status]), [
    ['N01', 'complete'], ['N02', 'complete'], ['N03', 'complete'], ['N04', 'complete'], ['N05', 'complete'], ['N06', 'complete'], ['N07', 'complete'], ['N08', 'complete'],
    ['N09', 'complete'],
    ['N10', 'complete'],
    ['N11', 'complete'],
  ]);
  assert.ok(Progression.foundationRuns.every((run) => run.status === 'complete'));
});

test('world is one connected physical and bidirectional graph without transition portals', () => {
  assert.ok(Progression.connectors.every((item) => item.physical && item.bidirectional && item.returnable));
  assert.ok(Progression.connectors.every((item) => !/portal/i.test(item.form)));
  assert.equal(Progression.connectionBetween('outskirts', 'black-woods').form, 'open-road');
  assert.equal(Progression.connectionBetween('black-woods', 'updrafts').form, 'cliff-chimney');
  assert.equal(Progression.connectionBetween('brute', 'frost-sorcerer').form, 'high-shaft');
});

test('permanent progression starts nearly empty and expands in the authored order', () => {
  assert.deepEqual(Progression.capabilitiesThrough('outskirts'), ['jump']);
  assert.deepEqual(Progression.capabilitiesThrough('black-woods'), ['jump', 'weapon']);
  assert.deepEqual(Progression.capabilitiesThrough('hollow-marksman'), [
    'jump', 'weapon', 'dash', 'portal-single', 'portal-pair',
  ]);
  assert.equal(Progression.abilities.at(-1).id, 'gravity-flip');
  assert.ok(Progression.abilities.every((ability) => ability.permanent && ability.traversalCritical));
});

test('the Deep Line is the post-King road and it comes out under the Keep', () => {
  const door = Progression.connector('king-deep-line');
  assert.equal(door.form, 'rail-tunnel');
  assert.equal(door.bossClear, 'abyss-king');
  assert.ok(Progression.connectionBetween('abyss-king', 'deep-line'), 'the King lets out onto the line');
  assert.equal(Progression.connectionBetween('deep-line', 'ruined-keep').form, 'rail-tunnel');
  assert.ok(!Progression.zone('gilded-vault'), 'and the Vault is not a zone any more');
});

test('secret keys deliberately reward later-ability return visits', () => {
  const returns = Progression.keys.filter((key) => key.returnVisit);
  assert.ok(returns.length >= 4);
  assert.deepEqual(Progression.vaultKey('sentinel-key').requirements, ['weapon']);
  assert.deepEqual(Progression.vaultKey('root-key').requirements, ['dash']);
  assert.deepEqual(Progression.vaultKey('gale-key').requirements, ['portal-pair']);
  assert.ok(Progression.invariants.includes('secrets-telegraph-their-later-capability-before-they-become-reachable'));
});

test('levels have explicit long-form authoring budgets and six-pass quality gates', () => {
  assert.ok(Progression.zones.every((zone) => zone.budget.targetLength >= 12000));
  assert.ok(Progression.zones.every((zone) => zone.budget.firstVisitMinutes >= 25));
  assert.equal(Progression.levelRunTemplate.length, 6);
  assert.ok(Progression.reusePolicy.replace.includes('random-environment-placement-as-level-design'));
});
