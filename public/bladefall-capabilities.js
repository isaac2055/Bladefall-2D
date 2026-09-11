(function installBladefallCapabilities(root) {
  'use strict';

  const SCHEMA = 'bladefall.capability-progress';
  const VERSION = 1;
  const progression = root.BladefallProgression;
  if (!progression) throw new Error('BladefallCapabilities requires BladefallProgression');

  const abilities = progression.abilities.slice().sort((a, b) => a.order - b.order);
  const abilityById = new Map(abilities.map((ability) => [ability.id, ability]));
  const zoneOrder = new Map(progression.zones.map((zone) => [zone.id, zone.stageIndex]));
  const START_ABILITY = abilities[0].id;

  function clone(value) {
    if (Array.isArray(value)) return value.map(clone);
    if (!value || typeof value !== 'object') return value;
    const output = {};
    for (const [key, item] of Object.entries(value)) output[key] = clone(item);
    return output;
  }

  function deepFreeze(value) {
    if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
    Object.freeze(value);
    for (const item of Object.values(value)) deepFreeze(item);
    return value;
  }

  function safeRecord(value) {
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  }

  function validAbilityIds(values) {
    const requested = new Set((Array.isArray(values) ? values : []).map(String));
    let highest = 1;
    for (const ability of abilities) if (requested.has(ability.id)) highest = Math.max(highest, ability.order);
    return abilities.filter((ability) => ability.order <= highest).map((ability) => ability.id);
  }

  function normalizedGrants(input, acquired) {
    const rows = safeRecord(input);
    const grants = {};
    for (const id of acquired) {
      const ability = abilityById.get(id);
      const row = safeRecord(rows[id]);
      grants[id] = {
        zone: ability.unlockZone,
        source: typeof row.source === 'string' && row.source ? row.source.slice(0, 48)
          : id === START_ABILITY ? 'awakening' : 'migration',
        sequence: ability.order,
      };
    }
    return grants;
  }

  function createState(source) {
    const input = safeRecord(source);
    const acquired = validAbilityIds(input.acquired);
    const history = [];
    const seen = new Set();
    for (const row of Array.isArray(input.history) ? input.history : []) {
      if (!row || typeof row !== 'object') continue;
      const id = String(row.id || '');
      if (!abilityById.has(id) || !acquired.includes(id) || seen.has(id)) continue;
      seen.add(id);
      history.push({
        id,
        zone: abilityById.get(id).unlockZone,
        source: typeof row.source === 'string' && row.source ? row.source.slice(0, 48) : 'migration',
      });
    }
    for (const id of acquired) if (!seen.has(id)) {
      history.push({ id, zone: abilityById.get(id).unlockZone, source: id === START_ABILITY ? 'awakening' : 'migration' });
    }
    history.sort((a, b) => abilityById.get(a.id).order - abilityById.get(b.id).order);
    return {
      schema: SCHEMA,
      version: VERSION,
      acquired,
      grants: normalizedGrants(input.grants, acquired),
      history,
      revision: Math.max(0, Math.floor(Number(input.revision) || 0)),
    };
  }

  function freshState() {
    return createState({
      acquired: [START_ABILITY],
      grants: { [START_ABILITY]: { source: 'awakening' } },
      history: [{ id: START_ABILITY, source: 'awakening' }],
    });
  }

  function legacyFurthestZone(legacy) {
    const input = safeRecord(legacy);
    const world = safeRecord(input.world);
    const evidence = new Set();
    for (const id of Array.isArray(world.visited) ? world.visited : []) if (zoneOrder.has(id)) evidence.add(id);
    for (const id of Array.isArray(world.cleared) ? world.cleared : []) if (zoneOrder.has(id)) evidence.add(id);
    if (zoneOrder.has(world.current)) evidence.add(world.current);
    const baseReach = safeRecord(input.reach)[0];
    const run = safeRecord(input.run);
    const legacyStage = Math.max(
      0,
      Number(input.bestStage) || 0,
      Number(baseReach) || 0,
      Number(run.ngPlus || 0) === 0 ? Number(run.stageIndex) || 0 : 0,
    );
    for (const zone of progression.zones) if (zone.stageIndex <= legacyStage) evidence.add(zone.id);
    let furthest = progression.zone('outskirts');
    for (const id of evidence) if (zoneOrder.get(id) > furthest.stageIndex) furthest = progression.zone(id);
    return furthest;
  }

  function migrate(raw, legacy) {
    const recognized = raw && raw.schema === SCHEMA;
    let state;
    let source;
    if (recognized) {
      state = createState(raw);
      source = 'capability-progress';
    } else {
      const furthest = legacyFurthestZone(legacy);
      const inferred = progression.capabilitiesThrough(furthest.id);
      state = createState({
        acquired: inferred,
        history: inferred.map((id) => ({ id, source: id === START_ABILITY ? 'awakening' : 'legacy-world-evidence' })),
        grants: Object.fromEntries(inferred.map((id) => [id, { source: id === START_ABILITY ? 'awakening' : 'legacy-world-evidence' }])),
      });
      source = 'legacy-world-evidence';
    }
    const before = recognized ? JSON.stringify(raw) : '';
    return Object.freeze({
      state,
      receipt: Object.freeze({
        from: recognized ? Math.max(0, Math.floor(Number(raw.version) || 0)) : 0,
        to: VERSION,
        changed: before !== JSON.stringify(state),
        source,
        inferredThrough: source === 'legacy-world-evidence' ? state.acquired.at(-1) : null,
      }),
    });
  }

  function has(raw, abilityId) {
    return createState(raw).acquired.includes(String(abilityId || ''));
  }

  function gate(raw, requirements) {
    const state = createState(raw);
    const needed = [...new Set((Array.isArray(requirements) ? requirements : []).map(String))];
    const unknown = needed.filter((id) => !abilityById.has(id));
    const missing = needed.filter((id) => abilityById.has(id) && !state.acquired.includes(id));
    return Object.freeze({
      allowed: unknown.length === 0 && missing.length === 0,
      missing: Object.freeze(missing),
      unknown: Object.freeze(unknown),
    });
  }

  function next(raw) {
    const state = createState(raw);
    return abilities.find((ability) => !state.acquired.includes(ability.id)) || null;
  }

  function grant(raw, abilityId, context) {
    const state = createState(raw);
    const ability = abilityById.get(String(abilityId || ''));
    const ctx = safeRecord(context);
    if (!ability) return Object.freeze({ ok: false, changed: false, reason: 'unknown-capability', state });
    if (state.acquired.includes(ability.id)) return Object.freeze({ ok: true, changed: false, reason: 'already-acquired', ability, state });
    const expected = next(state);
    if (!expected || expected.id !== ability.id)
      return Object.freeze({ ok: false, changed: false, reason: 'sequence-locked', expected, ability, state });
    if (ctx.zone !== ability.unlockZone)
      return Object.freeze({ ok: false, changed: false, reason: 'wrong-zone', expectedZone: ability.unlockZone, ability, state });
    if (ctx.earned !== true)
      return Object.freeze({ ok: false, changed: false, reason: 'missing-authored-evidence', ability, state });
    const source = typeof ctx.source === 'string' && ctx.source ? ctx.source.slice(0, 48) : 'authored-acquisition';
    state.acquired.push(ability.id);
    state.grants[ability.id] = { zone: ability.unlockZone, source, sequence: ability.order };
    state.history.push({ id: ability.id, zone: ability.unlockZone, source });
    state.revision++;
    return Object.freeze({ ok: true, changed: true, reason: 'acquired', ability, state });
  }

  function uiModel(raw) {
    const state = createState(raw);
    const nextAbility = next(state);
    return deepFreeze({
      acquired: state.acquired.length,
      total: abilities.length,
      next: nextAbility ? clone(nextAbility) : null,
      rows: abilities.map((ability) => ({
        ...clone(ability),
        status: state.acquired.includes(ability.id) ? 'acquired' : nextAbility && nextAbility.id === ability.id ? 'next' : 'locked',
      })),
    });
  }

  function validate() {
    const errors = [];
    if (abilities.length !== 12) errors.push('capability authority must cover all twelve constitutional abilities');
    if (abilities[0]?.id !== 'jump' || abilities[0]?.order !== 1) errors.push('jump must be the sole starting capability');
    for (let index = 0; index < abilities.length; index++) {
      const ability = abilities[index];
      if (ability.order !== index + 1) errors.push(`${ability.id}:non-contiguous-order`);
      if (!ability.permanent) errors.push(`${ability.id}:not-permanent`);
      if (!progression.zone(ability.unlockZone)) errors.push(`${ability.id}:unknown-zone`);
    }
    return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), abilities: abilities.length, starting: Object.freeze([START_ABILITY]) });
  }

  root.BladefallCapabilities = Object.freeze({
    SCHEMA,
    VERSION,
    START_ABILITY,
    abilities: deepFreeze(abilities.map(clone)),
    freshState,
    createState,
    migrate,
    has,
    gate,
    next,
    grant,
    uiModel,
    validate,
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
