import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

await import('../public/bladefall-advancement.js');
const Advancement = globalThis.BladefallAdvancement;

test('authored advancement validates and begins without invisible stat power', () => {
  assert.deepEqual(Advancement.validate(), { ok: true, errors: [], rewards: 12, maxVitalityKnots: 5, maxWovenKnots: 2 });
  assert.deepEqual(Advancement.createState(), {
    schema: Advancement.SCHEMA, version: Advancement.VERSION,
    vitalityFragments: 0, vitalityKnots: 0, forgeSeals: 0, resonanceDust: 0,
    wovenKnots: 0, claimedLegacy: false, sources: [], revision: 0,
  });
});

test('four authored fragments bind one bounded vitality knot', () => {
  let state = Advancement.createState();
  state = Advancement.addBundle(state, { vitalityFragments: 3 }, 'secret:first-cache').state;
  assert.equal(state.vitalityFragments, 3);
  state = Advancement.addBundle(state, { vitalityFragments: 2 }, 'quest:road-without-a-name').state;
  assert.equal(state.vitalityKnots, 1);
  assert.equal(state.vitalityFragments, 1);
  assert.equal(Advancement.vitalityBonus(state), 15);
});

test('boss and quest rewards are source-owned and idempotent', () => {
  const first = Advancement.applyRewardEvent(null, { type: 'boss:defeated', boss: 'brute' });
  assert.equal(first.state.forgeSeals, 1);
  const duplicate = Advancement.applyRewardEvent(first.state, { type: 'boss:defeated', boss: 'brute' });
  assert.equal(duplicate.changed, false);
  assert.equal(duplicate.state.forgeSeals, 1);
});

test('legacy random stats become capped visible resources exactly once', () => {
  const claimed = Advancement.claimLegacy(null, { healthShards: 8, forgeMarks: 30, echoDust: 40, claimed: false });
  assert.equal(claimed.state.vitalityKnots, 2);
  assert.equal(claimed.state.forgeSeals, Advancement.MAX_FORGE_SEALS);
  assert.equal(claimed.state.resonanceDust, Advancement.MAX_RESONANCE_DUST);
  assert.equal(claimed.state.claimedLegacy, true);
  assert.equal(Advancement.claimLegacy(claimed.state, { healthShards: 8 }).changed, false);
});

test('forge seals and resonance knots are finite atomic choices', () => {
  let state = Advancement.addBundle(null, { forgeSeals: 2, resonanceDust: 10 }, 'authored:test-cache').state;
  assert.equal(Advancement.spendSeals(state, 3).ok, false);
  state = Advancement.spendSeals(state, 2).state;
  assert.equal(state.forgeSeals, 0);
  state = Advancement.weave(state).state;
  state = Advancement.weave(state).state;
  assert.equal(Advancement.weavePlan(state).reason, 'woven-knot-maxed');
});

test('runtime separates permanent memories from swappable build systems', async () => {
  const source = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');
  assert.match(source, /BFAdvancementModule\.claimLegacy/);
  assert.match(source, /function openAdvancement\(\)/);
  assert.match(source, /Four fragments bind into one Blood Knot/);
  assert.match(source, /third Knot completes a sixth Blood measure/);
  assert.match(source, /Armor banks Ward until it prevents one whole wound/);
  assert.match(source, /Forge Seals authorize lasting equipment work/);
  assert.match(source, /BFAdvancementModule\.spendSeals/);
  assert.match(source, /BFEchoesModule\.grantCapacity\(meta\.echoes,result\.capacityKnot\)/);
  assert.match(source, /change at a refuge/);
});
