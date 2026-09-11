import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

await import('../public/bladefall-progression.js');
await import('../public/bladefall-capabilities.js');
await import('../public/bladefall-weapon-progression.js');

const Capabilities = globalThis.BladefallCapabilities;
const Weapons = globalThis.BladefallWeaponProgression;
const fresh = Capabilities.freshState();
const armed = Capabilities.createState({ acquired: ['jump', 'weapon'] });
const sword = {
  arche: 'sword', name: 'Test Sword', rarity: 'common', dmg: 10, cd: 0.4,
  cls: 'melee', crit: 0.1, temper: 0,
};

test('N09 weapon authority validates and the campaign begins genuinely weaponless', () => {
  assert.deepEqual(Weapons.validate(), { ok: true, errors: [], archetypes: 18, temperTiers: 3 });
  assert.deepEqual(Weapons.profile(fresh, null), {
    memory: false, compatibility: false, weaponless: true, mayEquip: false,
    mayAttack: false, openingWeaponless: true, archetype: null, family: null,
  });
  assert.equal(Weapons.profile(fresh, sword).mayAttack, false);
  assert.equal(Weapons.profile(fresh, sword, { compatibility: true }).mayAttack, true);
});

test('weapon sanitation removes legacy starter leaks but never invents a replacement', () => {
  assert.deepEqual(Weapons.sanitizeWeapon(fresh, sword), {
    changed: true, weapon: null, reason: 'weapon-memory-locked',
  });
  assert.deepEqual(Weapons.sanitizeWeapon(armed, null), {
    changed: false, weapon: null, reason: 'valid-weapon-absent',
  });
  const kept = Weapons.sanitizeWeapon(armed, sword);
  assert.equal(kept.weapon.crit,0,'legacy weapons do not retain invisible critical chance');
  assert.equal(kept.reason, 'weapon-ready');
  assert.equal(kept.weapon.arche, 'sword');
  assert.equal(kept.weapon.bound, true);
});

test('only the authored Black Woods oathblade can grant the first combat memory', () => {
  const item = { acquisitionId: Weapons.FIRST_WEAPON.id, authored: true, archetype: 'sword' };
  assert.deepEqual(Weapons.acquisitionPlan(fresh, item, { zone: 'black-woods' }), {
    allowed: true, reason: 'first-weapon-ready', grantsMemory: true,
  });
  assert.equal(Weapons.acquisitionPlan(fresh, item, { zone: 'outskirts' }).reason, 'wrong-acquisition-zone');
  assert.equal(Weapons.acquisitionPlan(fresh, { ...item, authored: false }, { zone: 'black-woods' }).reason, 'invalid-authored-acquisition');
  assert.equal(Weapons.acquisitionPlan(fresh, { archetype: 'axe' }, { zone: 'black-woods' }).reason, 'weapon-memory-required');
  assert.equal(Weapons.acquisitionPlan(armed, { archetype: 'axe' }, { zone: 'black-woods' }).allowed, true);
});

test('Focus is a separate authored technique and cannot leak from weapon ownership', () => {
  const freshTechniques = Weapons.freshTechniqueState();
  assert.equal(Weapons.hasTechnique(freshTechniques, 'focus'), false);
  assert.equal(Weapons.grantTechnique(freshTechniques, 'focus', { zone: 'black-woods', earned: true }).reason, 'authored-unlock-required');
  assert.equal(Weapons.grantTechnique(freshTechniques, 'focus', { zone: 'brute', earned: false }).reason, 'authored-unlock-required');
  const granted = Weapons.grantTechnique(freshTechniques, 'focus', { zone: 'brute', earned: true, source: 'brute-lesson' });
  assert.equal(granted.ok, true);
  assert.equal(granted.changed, true);
  assert.equal(Weapons.hasTechnique(granted.state, 'focus'), true);
  assert.equal(Weapons.migrateTechniques(granted.state).receipt.changed, false);
});

test('attack eligibility distinguishes a locked memory from an absent equipped weapon', () => {
  assert.deepEqual(Weapons.attackEligibility(fresh, null), {
    allowed: false, reason: 'weapon-memory-locked', feedback: 'YOUR HAND REMEMBERS NO BLADE',
  });
  assert.deepEqual(Weapons.attackEligibility(armed, null), {
    allowed: false, reason: 'weapon-absent', feedback: 'YOU HAVE NO WEAPON',
  });
  assert.equal(Weapons.attackEligibility(armed, sword).allowed, true);
});

test('tempering is bounded, deterministic, and survives same-archetype reforging', () => {
  let weapon = Weapons.normalizeWeapon(sword);
  assert.deepEqual(Weapons.upgradePlan(weapon), {
    allowed: true, reason: 'temper-ready', cost: 70, nextTemper: 1,
    damageBefore: 10, damageAfter: 11,
  });
  weapon = Weapons.applyTemper(weapon).weapon;
  weapon = Weapons.applyTemper(weapon).weapon;
  weapon.critUnlocked=true;weapon.crit = 0.25;
  const rare = Weapons.transferProgress(weapon, { ...sword, rarity: 'rare', dmg: 17, baseDmg: 17 });
  assert.equal(rare.temper, 2);
  assert.equal(rare.dmg, 20.4);
  assert.equal(rare.crit, 0.25);
  weapon = Weapons.applyTemper(weapon).weapon;
  assert.equal(Weapons.upgradePlan(weapon).reason, 'temper-maxed');
});

test('every weapon archetype has a distinct explicit critical technique contract', () => {
  assert.equal(Weapons.ARCHETYPES.length, 18);
  const ids = new Set(), animations = new Set();
  for (const archetype of Weapons.ARCHETYPES) {
    const row = Weapons.technique(archetype);
    assert.equal(row.archetype, archetype);
    assert.ok(row.critical.animation);
    assert.ok(row.critical.effect);
    assert.equal(row.interactionTags.length >= 2, true);
    ids.add(row.critical.id);
    animations.add(row.critical.animation);
  }
  assert.equal(ids.size, 18);
  assert.equal(animations.size, 18);
});

test('every weapon archetype carries a visible innate passive identity', () => {
  assert.equal(Object.keys(Weapons.PASSIVES).length, Weapons.ARCHETYPES.length);
  for (const archetype of Weapons.ARCHETYPES) {
    const passive = Weapons.passive(archetype);
    assert.equal(passive.archetype, archetype);
    assert.ok(passive.name);
    assert.ok(passive.description);
    assert.ok(Object.keys(passive.modifiers).length > 0);
  }
});

test('semantic attack receipts expose family, charge, critical, element, and interaction tags', () => {
  assert.deepEqual(Weapons.attackEvent({ ...sword, arche: 'flameblade', el: 'fire' }, { charged: true }), {
    type: 'weapon:attack', archetype: 'flameblade', family: 'elemental-blade', role: 'burn',
    element: 'fire', charged: true, critical: false, technique: null,
    interactionTags: ['cut', 'fire'],
  });
  const critical = Weapons.attackEvent(sword, { critical: true });
  assert.equal(critical.type, 'weapon:critical');
  assert.equal(critical.technique, 'cross-cut');
});

test('weapon diagnostics distinguish blocked input, acquisition, equip, upgrade, and critical', () => {
  const controller = Weapons.createController();
  controller.recordBlocked(Weapons.attackEligibility(fresh, null));
  controller.recordAcquisition('black-woods-oathblade');
  controller.recordEquip('sword');
  controller.recordUpgrade('sword', 1);
  controller.recordCritical('sword');
  assert.deepEqual(controller.diagnostics(), {
    blockedAttacks: 1, acquisitions: 1, equips: 1, upgrades: 1, criticals: 1,
    last: { type: 'critical', archetype: 'sword' },
  });
});

test('runtime wires weaponless state, authored acquisition, safe persistence, UI, upgrades, and Crites', async () => {
  const source = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');
  assert.match(source, /weapon:null,gear:freshGear\(\)/);
  assert.doesNotMatch(source, /p\.weapon=makeWeapon\('fists'/);
  assert.match(source, /kind:'firstWeapon'/);
  assert.match(source, /acquisitionId:BFWeaponProgressionModule\.FIRST_WEAPON\.id/);
  assert.match(source, /BFInventoryModule\.collect\(meta\.inventory,pk\.weapon,BFWeaponProgressionModule\.FIRST_WEAPON\.id\)/);
  assert.match(source, /BFInventoryOathbladeMigrationChanged/);
  assert.match(source, /saveRunAtStage\(G\.stageIndex,G\.checkpointLoadout\)/);
  assert.match(source, /if\(atkRaw&&!weaponGate\.allowed\)/);
  assert.match(source, /attackBtn\.classList\.toggle\('ability-locked',!armed\)/);
  assert.match(source, /BFWeaponProgressionModule\.applyTemper\(p\.weapon\)/);
  assert.match(source, /BFWeaponProgressionModule\.transferProgress/);
  assert.match(source, /BFWeaponProgressionModule\.technique\(w\)/);
  assert.match(source, /function weaponPassiveMod/);
  assert.match(source, /charged=chargeMod>1&&hasWeaponTechnique\('focus'\)/);
  assert.match(source, /BFRuntime\.events\.emit\(semantic\.type,semantic\)/);
  for (const archetype of Weapons.ARCHETYPES) {
    const animation = Weapons.technique(archetype).critical.animation;
    assert.equal(source.includes(`fx.kind==='${animation}'`), true, `missing rendered critical animation ${animation}`);
  }
});
