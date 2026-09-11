(function installBladefallEcology(root) {
  'use strict';

  const VERSION = 1;
  const SPECIES = Object.freeze({
    grunt: row('skirmisher', 'ground', ['road', 'ruin', 'settlement'], 1, 'iron'),
    flyer: row('harrier', 'air', ['forest', 'cavern', 'open-air'], 1, 'weave'),
    emberling: row('skirmisher', 'ground', ['volcano', 'furnace'], 1.15, 'prism', 'fire'),
    crawler: row('charger', 'air', ['deep-line', 'cavern'], 1.8, 'essence'),
    voidbat: row('harrier', 'air', ['void', 'deep-line'], 1.55, 'essence', 'void'),
    bloodeye: row('controller', 'air', ['void', 'deep-line'], 2.2, 'essence'),
    frostpike: row('charger', 'ground', ['frost', 'settlement'], 1.6, 'iron', 'ice'),
    frostsinger: row('artillery', 'ground', ['frost', 'settlement'], 1.8, 'prism', 'ice'),
    rimehulk: row('guardian', 'ground', ['frost', 'settlement'], 2.4, 'iron', 'ice'),
    frostling: row('skirmisher', 'ground', ['frost', 'ice'], 1.15, 'prism', 'ice'),
    toxling: row('skirmisher', 'ground', ['forest', 'sludge'], 1.15, 'weave', 'poison'),
    shadeling: row('ambusher', 'ground', ['ruin', 'void'], 1.25, 'essence', 'void'),
    sparkling: row('harrier', 'air', ['storm', 'open-air'], 1.2, 'prism', 'storm'),
    rifthound: row('charger', 'ground', ['ice', 'mover', 'portal'], 1.55, 'essence', 'void'),
    sporecaster: row('artillery', 'ground', ['wall', 'forest', 'vertical'], 1.7, 'weave', 'poison'),
    stormmote: row('controller', 'air', ['wind', 'updraft', 'low-gravity'], 1.65, 'prism', 'storm'),
    gargoyle: row('artillery', 'air', ['rail', 'deep-line', 'high-perch'], 1.8, 'iron'),
  });
  const BOSSES = Object.freeze(['brute', 'warden', 'archer', 'sorcerer', 'colossus', 'tyrant', 'king']);
  const HAZARDS = Object.freeze({
    spikes: Object.freeze({ id: 'spikes', damageScale: 0.35, maxHpFractionPerHit: 0.015, healthFloor: 0.25, canKill: false }),
    fluid: Object.freeze({ id: 'fluid', damageScale: 0.35, maxHpFractionPerSecond: 0.35, healthFloor: 0.25, canKill: false }),
    pit: Object.freeze({ id: 'pit', response: 'recover-safe-ground', healthFloor: 0.25, canKill: false }),
    air: Object.freeze({ id: 'air', response: 'full-force', canKill: false }),
    portal: Object.freeze({ id: 'portal', response: 'player-pair-only', canKill: false }),
  });
  const MATERIALS = Object.freeze(['iron', 'weave', 'prism', 'essence']);

  function row(role, locomotion, habitats, pressure, material, element) {
    return Object.freeze({ role, locomotion, habitats: Object.freeze(habitats), pressure,
      persistence: 'rest-reset', material, element: element || null });
  }
  function profile(type) { return SPECIES[type] || null; }
  function isBoss(type) { return BOSSES.includes(String(type || '')); }
  function persistencePolicy(enemy) {
    if (!enemy) return 'rest-reset';
    return enemy.unique || enemy.boss || isBoss(enemy.type) ? 'permanent' : 'rest-reset';
  }
  function hazardPolicy(enemy, hazardType) {
    if (!enemy || enemy.boss || isBoss(enemy.type)) return Object.freeze({ id: hazardType, response: 'boss-recover', canKill: false });
    return HAZARDS[hazardType] || null;
  }
  function gearChance(type, stageIndex, elite) {
    if (elite) return 1;
    const species = profile(type);
    const pressureBonus = species ? Math.max(0, species.pressure - 1) * 0.006 : 0;
    return Math.min(0.34, 0.16 + Math.max(0, Number(stageIndex) || 0) * 0.01 + pressureBonus);
  }
  function materialPlan(type, options) {
    const species = profile(type);
    if (!species) return Object.freeze({ granted: false, bundle: Object.freeze({}), material: null });
    const settings = options || {};
    const chance = settings.elite ? 1 : Math.min(0.28, 0.10 + species.pressure * 0.025);
    const granted = Number(settings.roll) < chance;
    const amount = granted ? (settings.elite ? 2 : 1) : 0;
    return Object.freeze({ granted, material: species.material, chance,
      bundle: Object.freeze(amount ? { [species.material]: amount } : {}) });
  }
  function encounterBudget(types, limit) {
    const rows = (types || []).map(profile).filter(Boolean);
    const pressure = rows.reduce((sum, species) => sum + species.pressure, 0);
    const roles = rows.reduce((counts, species) => {
      counts[species.role] = (counts[species.role] || 0) + 1; return counts;
    }, {});
    const cap = Number(limit) || 6;
    return Object.freeze({ pressure, cap, readable: pressure <= cap,
      roles: Object.freeze(roles), species: rows.length });
  }
  function validate(archetypeIds) {
    const errors = [];
    for (const [id, species] of Object.entries(SPECIES)) {
      if (!species.role || !species.locomotion || !species.habitats.length) errors.push(`${id}:incomplete-profile`);
      if (!MATERIALS.includes(species.material)) errors.push(`${id}:unknown-material`);
      if (!(species.pressure > 0)) errors.push(`${id}:invalid-pressure`);
    }
    const ids = new Set((archetypeIds || []).map(String));
    for (const id of [...Object.keys(SPECIES), ...BOSSES]) if (ids.size && !ids.has(id)) errors.push(`${id}:missing-archetype`);
    return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors),
      ordinary: Object.keys(SPECIES).length, bosses: BOSSES.length });
  }
  function createEcologySystem() {
    let spawned = 0, killed = 0, materialDrops = 0, hazardContacts = 0, pitRecoveries = 0;
    let bySpecies = {}, byMaterial = {};
    let last = null;
    // Private state participates in opt-in TAS branching.
    root.BladefallHarness?.register("ecology:createEcologySystem", () => ({ spawned, killed, materialDrops, hazardContacts, pitRecoveries, bySpecies, byMaterial, last }),
      state => ({ spawned, killed, materialDrops, hazardContacts, pitRecoveries, bySpecies, byMaterial, last } = state));
    function recordSpawn(type) { spawned++; bySpecies[type] = (bySpecies[type] || 0) + 1; last = { type: 'spawn', species: type }; }
    function recordKill(type, material) { killed++; if (material) { materialDrops++; byMaterial[material] = (byMaterial[material] || 0) + 1; }
      last = { type: 'kill', species: type, material: material || null }; }
    function recordHazard(type, recovered) { hazardContacts++; if (type === 'pit' && recovered) pitRecoveries++;
      last = { type: 'hazard', hazard: type, recovered: !!recovered }; }
    function diagnostics() { return Object.freeze({ spawned, killed, materialDrops, hazardContacts, pitRecoveries,
      bySpecies: Object.freeze({ ...bySpecies }), byMaterial: Object.freeze({ ...byMaterial }), last }); }
    return Object.freeze({ recordSpawn, recordKill, recordHazard, diagnostics });
  }

  root.BladefallEcology = Object.freeze({ VERSION, SPECIES, BOSSES, HAZARDS, MATERIALS,
    profile, isBoss, persistencePolicy, hazardPolicy, gearChance, materialPlan,
    encounterBudget, validate, createEcologySystem });
})(typeof window !== 'undefined' ? window : globalThis);
