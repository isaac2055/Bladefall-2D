(function installBladefallWeaponProgression(root) {
  'use strict';

  const SCHEMA = 'bladefall.weapon-progression';
  const VERSION = 1;
  const TECHNIQUE_SCHEMA = 'bladefall.weapon-techniques';
  const TECHNIQUE_VERSION = 1;
  const capabilities = root.BladefallCapabilities;
  if (!capabilities) throw new Error('BladefallWeaponProgression requires BladefallCapabilities');

  const FIRST_WEAPON = Object.freeze({
    id: 'black-woods-oathblade',
    zone: 'black-woods',
    capability: 'weapon',
    archetype: 'sword',
    rarity: 'common',
    name: 'Recovered Oathblade',
  });

  // Techniques are authored progression beats, separate from merely owning a
  // weapon. Focus is deliberately not part of the opening kit: a later combat
  // lesson can grant it without changing the constitutional traversal order.
  const TECHNIQUE_UNLOCKS = Object.freeze({
    focus: Object.freeze({
      id: 'focus',
      name: 'Focus',
      description: 'Hold an attack to prepare the weapon\'s focused technique.',
      zone: 'brute',
    }),
  });

  const techniqueRows = [
    ['sword', 'blade', 'balanced', 'cross-cut', 1.75, 'rend', 'crossSlash', ['cut', 'lever']],
    ['dagger', 'knife', 'rapid', 'five-knives', 1.55, 'bleed', 'knifeFan', ['cut', 'precision']],
    ['spear', 'polearm', 'reach', 'transfix', 1.70, 'pin', 'spearLine', ['pierce', 'reach']],
    ['axe', 'heavy', 'cleave', 'headsman-wheel', 1.90, 'sunder', 'axeSpin', ['cut', 'break']],
    ['great', 'heavy', 'commitment', 'great-rift', 2.00, 'stagger', 'greatRift', ['cut', 'break']],
    ['hammer', 'heavy', 'impact', 'fault-bell', 2.10, 'stagger', 'hammerShock', ['impact', 'break']],
    ['scythe', 'reaper', 'sweep', 'harvest-moon', 1.82, 'reap', 'scytheCrescent', ['cut', 'sweep']],
    ['flameblade', 'elemental-blade', 'burn', 'cinder-cross', 1.72, 'immolate', 'cinderCross', ['cut', 'fire']],
    ['frostbrand', 'elemental-blade', 'control', 'rime-cross', 1.68, 'freeze', 'rimeCross', ['cut', 'ice']],
    ['runeblade', 'elemental-heavy', 'surge', 'rune-rift', 1.85, 'surge', 'runeRift', ['cut', 'arcane']],
    ['voidscythe', 'elemental-reaper', 'siphon', 'hollow-harvest', 1.84, 'siphon', 'voidCrescent', ['cut', 'void']],
    ['bow', 'bow', 'mobile-range', 'arrow-rain', 1.65, 'puncture', 'arrowRain', ['projectile', 'pierce']],
    ['crossbow', 'bow', 'burst-range', 'bolt-burst', 1.82, 'sunder', 'boltBurst', ['projectile', 'pierce']],
    ['knives', 'knife', 'rapid-range', 'knife-fan', 1.52, 'bleed', 'thrownFan', ['projectile', 'cut']],
    ['firestaff', 'focus', 'burn-range', 'flame-bloom', 1.68, 'immolate', 'flameBloom', ['projectile', 'fire']],
    ['frostwand', 'focus', 'control-range', 'frost-star', 1.62, 'freeze', 'frostStar', ['projectile', 'ice']],
    ['stormrod', 'focus', 'chain-range', 'storm-script', 1.64, 'shock', 'lightning', ['projectile', 'storm']],
    ['holyscepter', 'focus', 'crowd-range', 'halo-rise', 1.70, 'float', 'halo', ['projectile', 'holy']],
  ];

  const techniques = Object.freeze(Object.fromEntries(techniqueRows.map((row) => {
    const [archetype, family, role, id, multiplier, effect, animation, tags] = row;
    return [archetype, Object.freeze({
      archetype, family, role,
      critical: Object.freeze({ id, multiplier, effect, animation }),
      interactionTags: Object.freeze([...tags]),
    })];
  })));
  const ARCHETYPES = Object.freeze(Object.keys(techniques));
  const passiveRows = [
    ['sword','Measured Edge','Critical chance +3%.',{critAdd:.03}],
    ['dagger','Quick Hands','Attack speed +8%.',{attackSpeedMul:1.08}],
    ['spear','Long Measure','Melee reach +12%.',{reachMul:1.12}],
    ['axe','Splitting Weight','Weapon damage +8%.',{damageMul:1.08}],
    ['great','Committed Arc','Damage +10%; attack speed -6%.',{damageMul:1.10,attackSpeedMul:.94}],
    ['hammer','Bell Impact','Knockback +20%.',{knockbackMul:1.20}],
    ['scythe','Harvest Thread','Lifesteal +2%.',{lifestealAdd:.02}],
    ['flameblade','Cinder Temper','Weapon damage +5%.',{damageMul:1.05}],
    ['frostbrand','Rime Precision','Critical chance +4%.',{critAdd:.04}],
    ['runeblade','Runic Pressure','Weapon damage +6%.',{damageMul:1.06}],
    ['voidscythe','Hollow Draw','Lifesteal +2.5%.',{lifestealAdd:.025}],
    ['bow','Full Draw','Projectile speed +8%.',{projectileSpeedMul:1.08}],
    ['crossbow','Driving Bolt','Knockback +15%.',{knockbackMul:1.15}],
    ['knives','Open Palm','Attack speed +10%.',{attackSpeedMul:1.10}],
    ['firestaff','Fed Flame','Weapon damage +5%.',{damageMul:1.05}],
    ['frostwand','Cold Rhythm','Attack speed +6%.',{attackSpeedMul:1.06}],
    ['stormrod','Straight Current','Projectile speed +12%.',{projectileSpeedMul:1.12}],
    ['holyscepter','Merciful Return','Lifesteal +1.5%.',{lifestealAdd:.015}],
  ];
  const PASSIVES = Object.freeze(Object.fromEntries(passiveRows.map(([archetype,name,description,modifiers])=>[archetype,Object.freeze({archetype,name,description,modifiers:Object.freeze({...modifiers})})])));
  const TEMPER_COSTS = Object.freeze([70, 160, 320]);

  function clone(value) {
    if (Array.isArray(value)) return value.map(clone);
    if (!value || typeof value !== 'object') return value;
    const output = {};
    for (const [key, item] of Object.entries(value)) output[key] = clone(item);
    return output;
  }

  function freshTechniqueState() {
    return Object.freeze({
      schema: TECHNIQUE_SCHEMA,
      version: TECHNIQUE_VERSION,
      owned: Object.freeze([]),
      history: Object.freeze([]),
      revision: 0,
    });
  }

  function createTechniqueState(raw) {
    const source = raw && typeof raw === 'object' ? raw : {};
    const owned = [...new Set(Array.isArray(source.owned) ? source.owned : [])]
      .filter((id) => !!TECHNIQUE_UNLOCKS[id]);
    const history = (Array.isArray(source.history) ? source.history : [])
      .filter((entry) => entry && TECHNIQUE_UNLOCKS[entry.id])
      .slice(-24)
      .map((entry) => Object.freeze({
        id: entry.id,
        source: String(entry.source || 'authored'),
        zone: String(entry.zone || TECHNIQUE_UNLOCKS[entry.id].zone),
      }));
    return Object.freeze({
      schema: TECHNIQUE_SCHEMA,
      version: TECHNIQUE_VERSION,
      owned: Object.freeze(owned),
      history: Object.freeze(history),
      revision: Math.max(0, Math.floor(Number(source.revision) || 0)),
    });
  }

  function migrateTechniques(raw) {
    const state = createTechniqueState(raw);
    const from = raw && raw.schema === TECHNIQUE_SCHEMA
      ? Math.max(0, Math.floor(Number(raw.version) || 0)) : 0;
    return Object.freeze({
      state,
      receipt: Object.freeze({
        from,
        to: TECHNIQUE_VERSION,
        changed: !raw || JSON.stringify(raw) !== JSON.stringify(state),
      }),
    });
  }

  function hasTechnique(raw, id) {
    return createTechniqueState(raw).owned.includes(id);
  }

  function grantTechnique(raw, id, context) {
    const state = createTechniqueState(raw);
    const definition = TECHNIQUE_UNLOCKS[id];
    const ctx = context && typeof context === 'object' ? context : {};
    if (!definition) return Object.freeze({ ok: false, changed: false, reason: 'unknown-technique', state });
    if (state.owned.includes(id)) return Object.freeze({ ok: true, changed: false, reason: 'already-owned', state });
    if (ctx.zone !== definition.zone || ctx.earned !== true)
      return Object.freeze({ ok: false, changed: false, reason: 'authored-unlock-required', state });
    const next = createTechniqueState({
      ...state,
      owned: [...state.owned, id],
      history: [...state.history, { id, source: ctx.source || 'authored', zone: ctx.zone }],
      revision: state.revision + 1,
    });
    return Object.freeze({ ok: true, changed: true, reason: 'granted', state: next });
  }

  function profile(rawCapabilities, weapon, context) {
    const ctx = context && typeof context === 'object' ? context : {};
    const compatibility = ctx.compatibility === true;
    const memory = capabilities.has(rawCapabilities, 'weapon');
    const validWeapon = !!weapon && typeof weapon === 'object' && !!techniques[weapon.arche];
    return Object.freeze({
      memory,
      compatibility,
      weaponless: !validWeapon,
      mayEquip: memory || compatibility,
      mayAttack: (memory || compatibility) && validWeapon,
      openingWeaponless: !memory && !compatibility,
      archetype: validWeapon ? weapon.arche : null,
      family: validWeapon ? techniques[weapon.arche].family : null,
    });
  }

  function normalizeWeapon(weapon) {
    if (!weapon || typeof weapon !== 'object' || !techniques[weapon.arche]) return null;
    const output = clone(weapon);
    output.weaponSchema = SCHEMA;
    output.weaponVersion = VERSION;
    output.bound = true;
    output.temper = Math.max(0, Math.min(3, Math.floor(Number(output.temper) || 0)));
    output.baseDmg = Math.max(0.1, Number(output.baseDmg) || Number(output.dmg) || 1);
    output.dmg = Number((output.baseDmg * (1 + output.temper * 0.1)).toFixed(1));
    // Legacy weapons carried an implicit 10% roll. Criticals now require a
    // future explicit source; migration therefore retires unowned crit values.
    output.crit = output.critUnlocked===true
      ?Math.max(0,Math.min(0.75,Number(output.crit)||0)):0;
    return output;
  }

  function sanitizeWeapon(rawCapabilities, weapon, context) {
    const state = profile(rawCapabilities, weapon, context);
    const normalized = normalizeWeapon(weapon);
    if (!state.mayEquip) return Object.freeze({ changed: weapon != null, weapon: null, reason: 'weapon-memory-locked' });
    if (!normalized) return Object.freeze({ changed: weapon != null, weapon: null, reason: 'valid-weapon-absent' });
    return Object.freeze({ changed: JSON.stringify(normalized) !== JSON.stringify(weapon), weapon: normalized, reason: 'weapon-ready' });
  }

  function acquisitionPlan(rawCapabilities, item, context) {
    const source = item && typeof item === 'object' ? item : {};
    const ctx = context && typeof context === 'object' ? context : {};
    const memory = capabilities.has(rawCapabilities, 'weapon');
    if (source.acquisitionId === FIRST_WEAPON.id) {
      if (ctx.zone !== FIRST_WEAPON.zone) return Object.freeze({ allowed: false, reason: 'wrong-acquisition-zone', grantsMemory: false });
      if (source.authored !== true || source.archetype !== FIRST_WEAPON.archetype)
        return Object.freeze({ allowed: false, reason: 'invalid-authored-acquisition', grantsMemory: false });
      return Object.freeze({ allowed: true, reason: memory ? 'memory-already-earned' : 'first-weapon-ready', grantsMemory: !memory });
    }
    return Object.freeze({
      allowed: memory || ctx.compatibility === true,
      reason: memory || ctx.compatibility === true ? 'equipment-ready' : 'weapon-memory-required',
      grantsMemory: false,
    });
  }

  function attackEligibility(rawCapabilities, weapon, context) {
    const state = profile(rawCapabilities, weapon, context);
    if (!state.memory && !state.compatibility) return Object.freeze({ allowed: false, reason: 'weapon-memory-locked', feedback: 'YOUR HAND REMEMBERS NO BLADE' });
    if (!state.mayAttack) return Object.freeze({ allowed: false, reason: 'weapon-absent', feedback: 'YOU HAVE NO WEAPON' });
    return Object.freeze({ allowed: true, reason: 'armed', feedback: '' });
  }

  function technique(weaponOrArchetype) {
    const id = typeof weaponOrArchetype === 'string' ? weaponOrArchetype : weaponOrArchetype && weaponOrArchetype.arche;
    return techniques[id] || null;
  }

  function passive(weaponOrArchetype) {
    const id=typeof weaponOrArchetype==='string'?weaponOrArchetype:weaponOrArchetype&&weaponOrArchetype.arche;
    return PASSIVES[id]||null;
  }

  function attackEvent(weapon, options) {
    const normalized = normalizeWeapon(weapon);
    const identity = technique(normalized);
    if (!normalized || !identity) return null;
    const ctx = options && typeof options === 'object' ? options : {};
    return Object.freeze({
      type: ctx.critical ? 'weapon:critical' : 'weapon:attack',
      archetype: normalized.arche,
      family: identity.family,
      role: identity.role,
      element: normalized.el || null,
      charged: ctx.charged === true,
      critical: ctx.critical === true,
      technique: ctx.critical ? identity.critical.id : null,
      interactionTags: identity.interactionTags,
    });
  }

  function upgradePlan(weapon) {
    const normalized = normalizeWeapon(weapon);
    if (!normalized) return Object.freeze({ allowed: false, reason: 'weapon-absent', cost: 0, nextTemper: null });
    if (normalized.temper >= 3) return Object.freeze({ allowed: false, reason: 'temper-maxed', cost: 0, nextTemper: null });
    return Object.freeze({
      allowed: true,
      reason: 'temper-ready',
      cost: TEMPER_COSTS[normalized.temper],
      nextTemper: normalized.temper + 1,
      damageBefore: normalized.dmg,
      damageAfter: Number((normalized.baseDmg * (1 + (normalized.temper + 1) * 0.1)).toFixed(1)),
    });
  }

  function applyTemper(weapon) {
    const plan = upgradePlan(weapon);
    if (!plan.allowed) return Object.freeze({ ok: false, reason: plan.reason, weapon: normalizeWeapon(weapon), plan });
    const output = normalizeWeapon(weapon);
    output.temper = plan.nextTemper;
    output.dmg = plan.damageAfter;
    return Object.freeze({ ok: true, reason: 'tempered', weapon: output, plan });
  }

  function transferProgress(fromWeapon, toWeapon) {
    const source = normalizeWeapon(fromWeapon);
    const target = normalizeWeapon(toWeapon);
    if (!target) return null;
    if (!source || source.arche !== target.arche) return target;
    target.temper = source.temper;
    target.crit = source.crit;
    target.dmg = Number((target.baseDmg * (1 + target.temper * 0.1)).toFixed(1));
    return target;
  }

  function createController() {
    let counters = { blockedAttacks: 0, acquisitions: 0, equips: 0, upgrades: 0, criticals: 0 };
    let last = null;
    // Private state participates in opt-in TAS branching.
    root.BladefallHarness?.register("weapon-progression:createController", () => ({ counters, last }),
      state => ({ counters, last } = state));
    function recordBlocked(result) {
      counters.blockedAttacks++;
      last = Object.freeze({ type: 'attack-blocked', reason: result && result.reason || 'unknown' });
    }
    function recordAcquisition(id) { counters.acquisitions++; last = Object.freeze({ type: 'acquisition', id: String(id || '') }); }
    function recordEquip(archetype) { counters.equips++; last = Object.freeze({ type: 'equip', archetype: String(archetype || '') }); }
    function recordUpgrade(archetype, temper) { counters.upgrades++; last = Object.freeze({ type: 'upgrade', archetype: String(archetype || ''), temper: Number(temper) || 0 }); }
    function recordCritical(archetype) { counters.criticals++; last = Object.freeze({ type: 'critical', archetype: String(archetype || '') }); }
    function diagnostics() { return Object.freeze({ ...counters, last }); }
    return Object.freeze({ recordBlocked, recordAcquisition, recordEquip, recordUpgrade, recordCritical, diagnostics });
  }

  function validate() {
    const errors = [];
    const fresh = capabilities.freshState();
    const armed = capabilities.createState({ acquired: ['jump', 'weapon'] });
    if (!profile(fresh, null).openingWeaponless || profile(fresh, { arche: 'sword' }).mayAttack)
      errors.push('fresh campaign must remain genuinely weaponless');
    if (!profile(armed, { arche: 'sword' }).mayAttack) errors.push('weapon memory plus a valid weapon must permit combat');
    if (ARCHETYPES.length !== techniqueRows.length) errors.push('every archetype must have one explicit technique');
    if (Object.keys(PASSIVES).length !== ARCHETYPES.length) errors.push('every archetype must have one innate passive');
    for (const id of ARCHETYPES) {
      const row = techniques[id];
      if (!row.critical.id || !row.critical.animation || !row.critical.effect || row.interactionTags.length < 2)
        errors.push(`incomplete critical technique ${id}`);
    }
    const acquisition = acquisitionPlan(fresh, { acquisitionId: FIRST_WEAPON.id, authored: true, archetype: 'sword' }, { zone: 'black-woods' });
    if (!acquisition.allowed || !acquisition.grantsMemory) errors.push('authored Black Woods blade must grant the first combat memory');
    if (acquisitionPlan(fresh, {}, { zone: 'outskirts' }).allowed) errors.push('generic equipment bypassed the combat memory');
    return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), archetypes: ARCHETYPES.length, temperTiers: TEMPER_COSTS.length });
  }

  root.BladefallWeaponProgression = Object.freeze({
    SCHEMA,
    VERSION,
    TECHNIQUE_SCHEMA,
    TECHNIQUE_VERSION,
    TECHNIQUE_UNLOCKS,
    FIRST_WEAPON,
    ARCHETYPES,
    techniques,
    PASSIVES,
    TEMPER_COSTS,
    freshTechniqueState,
    createTechniqueState,
    migrateTechniques,
    hasTechnique,
    grantTechnique,
    profile,
    normalizeWeapon,
    sanitizeWeapon,
    acquisitionPlan,
    attackEligibility,
    technique,
    passive,
    attackEvent,
    upgradePlan,
    applyTemper,
    transferProgress,
    createController,
    validate,
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
