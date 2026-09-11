import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

await import('../public/bladefall-equipment-economy.js');
const Economy = globalThis.BladefallEquipmentEconomy;

test('N10 equipment economy validates and fresh state is empty', () => {
  assert.deepEqual(Economy.validate(), { ok: true, errors: [], materials: 4, tools: 5, armorSlots: 3, disciplines: 3, reinforceTiers: 3, toolRanks: 2 });
  assert.deepEqual(Economy.createState(), {
    schema: Economy.SCHEMA, version: Economy.VERSION,
    materials: { iron: 0, weave: 0, prism: 0, essence: 0 },
    ownedTools: [], equippedTool: null, toolRanks: {}, charges: {}, salvageCount: 0, revision: 0,
  });
});

test('migration filters unknown tools and clamps material and charge corruption', () => {
  const migrated = Economy.migrate({
    schema: Economy.SCHEMA, version: 0,
    materials: { iron: 3.9, weave: -8, prism: '6', impossible: 99 },
    ownedTools: ['assessor-lens', 'unknown', 'assessor-lens'], equippedTool: 'unknown',
    charges: { 'assessor-lens': 99 }, salvageCount: -2,
  });
  assert.equal(migrated.receipt.changed, true);
  assert.deepEqual(migrated.state.materials, { iron: 3, weave: 0, prism: 6, essence: 0 });
  assert.deepEqual(migrated.state.ownedTools, ['assessor-lens']);
  assert.deepEqual(migrated.state.toolRanks, { 'assessor-lens': 0 });
  assert.equal(migrated.state.equippedTool, null);
  assert.equal(migrated.state.charges['assessor-lens'], 5);
});

test('salvage has deterministic rarity and equipment-family yields', () => {
  const armor = Economy.salvageQuote({ slot: 'chest', rarity: 'rare' });
  const weapon = Economy.salvageQuote({ arche: 'flameblade', el: 'fire', rarity: 'epic' });
  assert.deepEqual(armor.materials, { iron: 6, weave: 4, prism: 1, essence: 0 });
  assert.deepEqual(weapon.materials, { iron: 9, weave: 3, prism: 3, essence: 0 });
  const result = Economy.salvage(Economy.createState(), { slot: 'legs', rarity: 'legendary' });
  assert.equal(result.state.salvageCount, 1);
  assert.equal(result.state.materials.essence, 1);
});

test('resource spending is atomic and reports exact deficits', () => {
  let state = Economy.credit(Economy.createState(), { iron: 5, weave: 2 }, 'reward').state;
  const cost = { gold: 40, materials: { iron: 4, weave: 2 } };
  const poor = Economy.spend(state, 30, cost);
  assert.equal(poor.ok, false);
  assert.equal(poor.plan.missingGold, 10);
  assert.deepEqual(poor.state.materials, state.materials);
  const paid = Economy.spend(state, 50, cost);
  assert.equal(paid.ok, true);
  assert.equal(paid.gold, 10);
  assert.deepEqual(paid.state.materials, { iron: 1, weave: 0, prism: 0, essence: 0 });
});

test('armor reinforcement is bounded and survives same-slot ascension', () => {
  let armor = Economy.normalizeArmor({ slot: 'helmet', rarity: 'common', defense: 10, affixes: [] });
  armor = Economy.applyReinforce(armor).armor;
  armor = Economy.applyReinforce(armor).armor;
  assert.equal(armor.reinforce, 2);
  assert.equal(armor.defense, 11.6);
  const rare = Economy.transferArmorProgress(armor, { slot: 'helmet', rarity: 'rare', defense: 20, affixes: [] });
  assert.equal(rare.reinforce, 2);
  assert.equal(rare.defense, 23.2);
  armor = Economy.applyReinforce(armor).armor;
  assert.equal(Economy.reinforcePlan(armor).reason, 'reinforce-maxed');
});

test('armor disciplines expose readable two- and three-piece passives', () => {
  const piece = (slot, discipline) => Economy.normalizeArmor({ slot, discipline, rarity: 'common', defense: 10, affixes: [] });
  const two = Economy.disciplineProfile({ helmet: piece('helmet', 'wayfarer'), chest: piece('chest', 'wayfarer'), legs: piece('legs', 'reaver') });
  assert.equal(two.wayfarer.two, true);
  assert.equal(two.wayfarer.three, false);
  const three = Economy.disciplineProfile({ helmet: piece('helmet', 'bulwark'), chest: piece('chest', 'bulwark'), legs: piece('legs', 'bulwark') });
  assert.equal(three.bulwark.three, true);
});

test('tools have unique semantic actions, finite charges, equipment, and rest refill', () => {
  assert.equal(new Set(Economy.TOOL_IDS.map((id) => Economy.TOOLS[id].action)).size, 5);
  let state = Economy.createState();
  state = Economy.acquireTool(state, 'assessor-lens').state;
  state = Economy.acquireTool(state, 'retrieval-coil').state;
  state = Economy.equipTool(state, 'retrieval-coil').state;
  const used = Economy.consumeTool(state);
  assert.deepEqual(used.event, { type: 'tool:use', toolId: 'retrieval-coil', action: 'retrieve', tags: ['pull', 'metal'], rank: 0, potency: 1 });
  assert.equal(used.charges, 3);
  let empty = used.state;
  for (let i = 0; i < 3; i++) empty = Economy.consumeTool(empty).state;
  assert.equal(Economy.toolUsePlan(empty).reason, 'tool-empty');
  assert.equal(Economy.createState(empty).charges['retrieval-coil'], 0);
  assert.equal(Economy.refillTool(empty).state.charges['retrieval-coil'], 4);
});

test('tool calibration is finite and increases both potency and refuge charges', () => {
  let state = Economy.acquireTool(Economy.createState(), 'cinder-capsule').state;
  state = Economy.applyCalibration(state, 'cinder-capsule').state;
  assert.equal(state.toolRanks['cinder-capsule'], 1);
  assert.equal(Economy.toolMaxCharges(state, 'cinder-capsule'), 4);
  assert.equal(Economy.toolUsePlan(state).event.potency, 1.2);
  state = Economy.applyCalibration(state, 'cinder-capsule').state;
  assert.equal(Economy.calibrationPlan(state, 'cinder-capsule').reason, 'calibration-maxed');
});

test('runtime wires persistence, merchants, salvage, forge reinforcement, tools, and HUD', async () => {
  const source = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');
  assert.match(source, /equipment:null/);
  assert.match(source, /BFEquipmentEconomyModule\.migrate\(meta\.equipment\)/);
  assert.match(source, /salvageGroundItem/);
  assert.match(source, /BFEquipmentEconomyModule\.applyReinforce/);
  assert.match(source, /BFEquipmentEconomyModule\.disciplineProfile/);
  assert.match(source, /BFEquipmentEconomyModule\.applyCalibration/);
  assert.match(source, /BFEquipmentEconomyModule\.transferArmorProgress/);
  assert.match(source, /function openToolKit\(\)/);
  assert.match(source, /if\(keyPressedFor\('tool'\)\|\|input\.toolEdge\)useEquippedTool\(\)/);
  assert.match(source, /BFRuntime\.events\.emit\(used\.event\.type/);
  const dialogue = await readFile(new URL('../public/bladefall-dialogue.js', import.meta.url), 'utf8');
  assert.match(dialogue, /Blood restored; tools refilled/);
  assert.match(source, /id="toolTag"/);
});
