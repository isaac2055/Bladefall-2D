import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

await import('../public/bladefall-ecology.js');
const Ecology = globalThis.BladefallEcology;

test('ecology authority covers every ordinary species and boss family', () => {
  const ids = [...Object.keys(Ecology.SPECIES), ...Ecology.BOSSES];
  const validation = Ecology.validate(ids);
  assert.equal(validation.ok, true);
  assert.equal(validation.ordinary, 26);   // + slagwright and cinderling, the ember Muster uniques
  assert.equal(validation.bosses, 7);
  assert.equal(Ecology.profile('stormmote').habitats.includes('updraft'), true);
});

test('ordinary enemies rest-reset while bosses and unique encounters stay cleared', () => {
  assert.equal(Ecology.persistencePolicy({ type: 'grunt' }), 'rest-reset');
  assert.equal(Ecology.persistencePolicy({ type: 'grunt', unique: true }), 'permanent');
  assert.equal(Ecology.persistencePolicy({ type: 'tyrant' }), 'permanent');
});

test('hazards soften ordinary enemies, recover pits, and never solve bosses', () => {
  assert.deepEqual(Ecology.hazardPolicy({ type: 'grunt' }, 'spikes'), Ecology.HAZARDS.spikes);
  assert.equal(Ecology.hazardPolicy({ type: 'grunt' }, 'pit').response, 'recover-safe-ground');
  assert.equal(Ecology.hazardPolicy({ type: 'brute', boss: true }, 'fluid').response, 'boss-recover');
});

test('material yields and gear chances are bounded and species-owned', () => {
  assert.deepEqual(Ecology.materialPlan('emberling', { roll: 0, elite: false }).bundle, { prism: 1 });
  assert.deepEqual(Ecology.materialPlan('sporecaster', { roll: 0.9, elite: false }).bundle, {});
  assert.deepEqual(Ecology.materialPlan('voidbat', { roll: 0.9, elite: true }).bundle, { essence: 2 });
  assert.equal(Ecology.gearChance('grunt', 0, false), 0.16);
  assert.equal(Ecology.gearChance('grunt', 12, true), 1);
});

test('encounter pressure reports unreadable mixtures without changing composition', () => {
  const calm = Ecology.encounterBudget(['grunt', 'flyer'], 3);
  assert.equal(calm.readable, true);
  const crowded = Ecology.encounterBudget(['bloodeye', 'crawler', 'sporecaster'], 4);
  assert.equal(crowded.readable, false);
  assert.deepEqual(crowded.roles, { controller: 1, charger: 1, artillery: 1 });
});

test('ecology diagnostics count lifecycle, hazard, and material receipts', () => {
  const system = Ecology.createEcologySystem();
  system.recordSpawn('grunt');
  system.recordHazard('pit', true);
  system.recordKill('grunt', 'iron');
  assert.deepEqual(system.diagnostics(), {
    spawned: 1, killed: 1, materialDrops: 1, hazardContacts: 1, pitRecoveries: 1,
    bySpecies: { grunt: 1 }, byMaterial: { iron: 1 },
    last: { type: 'kill', species: 'grunt', material: 'iron' },
  });
});

test('runtime delegates spawning, persistence, hazards, drops, and diagnostics to ecology', async () => {
  const source = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');
  assert.match(source, /const BFEcology=BFEcologyModule\.createEcologySystem/);
  assert.match(source, /BFEcologyModule\.persistencePolicy\(record\)/);
  assert.match(source, /BFEcologyModule\.profile\(e\.type\)/);
  assert.match(source, /BFEcologyModule\.hazardPolicy\(e,'spikes'\)/);
  assert.match(source, /BFEcologyModule\.hazardPolicy\(e,'fluid'\)/);
  assert.match(source, /BFEcology\.recordHazard\('pit',true\)/);
  assert.match(source, /BFEcologyModule\.materialPlan\(e\.type/);
  assert.match(source, /BFEcologyModule\.gearChance\(e\.type/);
  assert.match(source, /ecologyState:\(\)=>/);
});
