(function installBladefallEchoes(root) {
  'use strict';

  const SCHEMA = 'bladefall.echo-loadout';
  const VERSION = 1;
  const BASE_CAPACITY = 2;
  const MAX_CAPACITY = 8;
  const MAX_EQUIPPED = 3;

  const echoRows = [
    ['fault-bell', 'Fault Bell', 2, '#d59a68', 'The first direct blade strike after a dash lands with the Brute’s broken weight.', 'boss:brute',
      [['player:dash', 'fault-bell:prime', 1.5], ['weapon:melee-hit', 'damage:mul', 1.25]]],
    ['far-thread', 'Far Thread', 1, '#e4d9a7', 'Projectiles keep one more body in the line of their thought.', 'boss:archer',
      [['weapon:projectile', 'pierce:add', 1], ['portal:projectile', 'precision:add', 0.15]]],
    ['red-tempo', 'Red Tempo', 1, '#d8b7ff', 'A defeated foe lends three seconds of its remaining urgency.', 'boss:warden',
      [['enemy:defeated', 'attack-haste:seconds', 3]]],
    ['white-hush', 'White Hush', 2, '#8fd8ff', 'Cold tools and frost techniques hold their answer longer.', 'boss:sorcerer',
      [['tool:use', 'rime-radius:add', 25, 'rime'], ['status:ice', 'freeze-duration:mul', 1.3]]],
    ['ember-step', 'Ember Step', 2, '#ff9a5a', 'A dash leaves a brief, honest line of dream-fire.', 'boss:colossus',
      [['player:dash', 'fire-trail:enable', 1], ['tool:use', 'cinder-radius:add', 30, 'cinder']]],
    ['hollow-edge', 'Hollow Edge', 3, '#c47bff', 'Damage rises, Blood capacity falls, and wounded lesser foes can be ended.', 'boss:tyrant',
      [['stats:combat', 'power:mul', 1.25], ['stats:combat', 'max-health:mul', 0.85], ['weapon:hit', 'execute-threshold', 0.16]]],
    ['crown-afterimage', 'Crown Afterimage', 3, '#f1d6ff', 'Personal portal transit leaves one delayed defensive echo.', 'boss:king',
      [['portal:transit', 'afterimage:enable', 1, 'personal']]],
    ['road-knot', 'Road Knot', 1, '#e4d9a7', 'Known ground carries the knight a little more cleanly.', 'quest:road-without-a-name',
      [['stats:movement', 'speed:mul', 1.06], ['traveler:helped', 'recovery:add', 0.08]]],
    ['sky-kindling', 'Sky Kindling', 2, '#9fe0ff', 'Fire carried into air remains primed for longer.', 'quest:kindling-the-sky',
      [['tool:use', 'cinder-duration:add', 1.5, 'cinder'], ['environment:air', 'fire-prime:seconds', 2]]],
    ['courier-loop', 'Courier Loop', 2, '#7fe8ff', 'Retrieval instruments may draw a second loose object.', 'quest:couriers-proof',
      [['tool:use', 'retrieve-count:add', 1, 'retrieve'], ['portal:projectile', 'return-damage:mul', 1.2]]],
    ['chain-vow', 'Chain Vow', 1, '#d59a68', 'Contact damage returns a restrained share to its source.', 'quest:release-the-causeway',
      [['player:hurt', 'contact-reflect:mul', 0.35]]],
    ['gale-stitch', 'Gale Stitch', 1, '#9fe0ff', 'Windborne thrust spends less of the Aerie Pack’s gathered breath.', 'secret:needlewind-mastery',
      [['player:jetpack', 'fuel-use:mul', 0.72], ['environment:air', 'control:mul', 1.08]]],
  ];

  const ECHOES = Object.freeze(Object.fromEntries(echoRows.map((row) => {
    const [id, name, cost, color, description, source, hooks] = row;
    return [id, Object.freeze({
      id, name, cost, color, description, source,
      hooks: Object.freeze(hooks.map(([event, operation, value, qualifier]) => Object.freeze({ event, operation, value, qualifier: qualifier || null }))),
    })];
  })));
  const ECHO_IDS = Object.freeze(Object.keys(ECHOES));

  const REWARDS = Object.freeze({
    'boss:brute': Object.freeze({ echoId: 'fault-bell' }),
    'boss:archer': Object.freeze({ echoId: 'far-thread', capacityKnot: 'watch-thread' }),
    'boss:warden': Object.freeze({ echoId: 'red-tempo', capacityKnot: 'gaol-knot' }),
    'boss:sorcerer': Object.freeze({ echoId: 'white-hush', capacityKnot: 'rime-knot' }),
    'boss:colossus': Object.freeze({ echoId: 'ember-step', capacityKnot: 'cinder-knot' }),
    'boss:tyrant': Object.freeze({ echoId: 'hollow-edge', capacityKnot: 'paradox-knot' }),
    'boss:king': Object.freeze({ echoId: 'crown-afterimage', capacityKnot: 'crown-knot' }),
    'quest:road-without-a-name': Object.freeze({ echoId: 'road-knot' }),
    'quest:kindling-the-sky': Object.freeze({ echoId: 'sky-kindling' }),
    'quest:couriers-proof': Object.freeze({ echoId: 'courier-loop' }),
    'secret:needlewind-mastery': Object.freeze({ echoId: 'gale-stitch' }),
    'quest:release-the-causeway': Object.freeze({ echoId: 'chain-vow' }),
  });
  const LEGACY_MODS = Object.freeze({
    dashFire: 'ember-step', execute: 'hollow-edge',
    pierce: 'far-thread', adren: 'red-tempo', thorns: 'chain-vow',
    glass: 'hollow-edge',
  });

  function clone(value) {
    if (Array.isArray(value)) return value.map(clone);
    if (!value || typeof value !== 'object') return value;
    const output = {};
    for (const [key, item] of Object.entries(value)) output[key] = clone(item);
    return output;
  }

  function safeRecord(value) { return value && typeof value === 'object' && !Array.isArray(value) ? value : {}; }
  function validIds(values) { return [...new Set((Array.isArray(values) ? values : []).map(String))].filter((id) => ECHOES[id]); }
  function usedCapacity(state) { return state.equipped.reduce((sum, id) => sum + ECHOES[id].cost, 0); }

  function createState(raw) {
    const source = safeRecord(raw);
    const owned = validIds(source.owned);
    const knots = [...new Set((Array.isArray(source.capacityKnots) ? source.capacityKnots : []).map(String))]
      .filter((id) => /^[a-z][a-z0-9-]{1,47}$/.test(id)).slice(0, MAX_CAPACITY - BASE_CAPACITY);
    const capacity = Math.min(MAX_CAPACITY, BASE_CAPACITY + knots.length);
    const requested = validIds(source.equipped).filter((id) => owned.includes(id));
    const equipped = [];
    let used = 0;
    for (const id of requested) {
      const cost = ECHOES[id].cost;
      if (equipped.length >= MAX_EQUIPPED || used + cost > capacity) continue;
      equipped.push(id); used += cost;
    }
    const sources = {};
    for (const id of owned) {
      const row = safeRecord(safeRecord(source.sources)[id]);
      sources[id] = { source: typeof row.source === 'string' && row.source ? row.source.slice(0, 64) : 'migration' };
    }
    return {
      schema: SCHEMA, version: VERSION, owned, equipped, capacityKnots: knots, sources,
      revision: Math.max(0, Math.floor(Number(source.revision) || 0)),
    };
  }

  function legacyOwned(legacy) {
    const source = safeRecord(legacy), run = safeRecord(source.run), player = safeRecord(run.p), mods = safeRecord(player.mods);
    const ids = [];
    for (const [key, id] of Object.entries(LEGACY_MODS)) if (mods[key]) ids.push(id);
    return validIds(ids);
  }

  function migrate(raw, legacy) {
    const recognized = raw && raw.schema === SCHEMA;
    const source = recognized ? clone(raw) : {};
    const inherited = legacyOwned(legacy);
    if (!recognized && inherited.length) {
      source.owned = inherited;
      source.equipped = [];
      let used = 0;
      for (const id of inherited) if (used + ECHOES[id].cost <= BASE_CAPACITY && source.equipped.length < MAX_EQUIPPED) {
        source.equipped.push(id); used += ECHOES[id].cost;
      }
      source.sources = Object.fromEntries(inherited.map((id) => [id, { source: 'legacy-level-up' }]));
    }
    const state = createState(source);
    return Object.freeze({ state, receipt: Object.freeze({
      changed: !recognized || JSON.stringify(raw) !== JSON.stringify(state),
      from: raw && raw.version || 0, to: VERSION, inherited: Object.freeze(inherited),
    }) });
  }

  function profile(raw) {
    const state = createState(raw), used = usedCapacity(state);
    return Object.freeze({ capacity: Math.min(MAX_CAPACITY, BASE_CAPACITY + state.capacityKnots.length), used,
      free: Math.max(0, Math.min(MAX_CAPACITY, BASE_CAPACITY + state.capacityKnots.length) - used),
      owned: state.owned.length, equipped: state.equipped.length, maxEquipped: MAX_EQUIPPED });
  }

  function grantEcho(raw, echoId, source, options) {
    const state = createState(raw), id = String(echoId || ''), echo = ECHOES[id];
    if (!echo) return Object.freeze({ ok: false, changed: false, reason: 'unknown-echo', state });
    if (state.owned.includes(id)) return Object.freeze({ ok: true, changed: false, reason: 'already-owned', state, echo, autoEquipped: false });
    state.owned.push(id);state.sources[id] = { source: String(source || echo.source).slice(0, 64) };
    const capacity = profile(state), auto = !(options && options.autoEquip === false) &&
      state.equipped.length < MAX_EQUIPPED && capacity.used + echo.cost <= capacity.capacity;
    if (auto) state.equipped.push(id);
    state.revision++;
    return Object.freeze({ ok: true, changed: true, reason: 'echo-acquired', state, echo, autoEquipped: auto });
  }

  function grantCapacity(raw, knotId) {
    const state = createState(raw), id = String(knotId || '');
    if (!/^[a-z][a-z0-9-]{1,47}$/.test(id)) return Object.freeze({ ok: false, changed: false, reason: 'invalid-capacity-knot', state });
    if (state.capacityKnots.includes(id)) return Object.freeze({ ok: true, changed: false, reason: 'already-granted', state, capacity: profile(state).capacity });
    if (profile(state).capacity >= MAX_CAPACITY) return Object.freeze({ ok: false, changed: false, reason: 'capacity-maxed', state, capacity: MAX_CAPACITY });
    state.capacityKnots.push(id);state.revision++;
    return Object.freeze({ ok: true, changed: true, reason: 'capacity-expanded', state, capacity: profile(state).capacity });
  }

  function rewardKey(event) {
    const packet = safeRecord(event);
    if (packet.type === 'boss:defeated') return `boss:${String(packet.boss || '')}`;
    if (packet.type === 'quest:completed') return `quest:${String(packet.questId || '')}`;
    return '';
  }

  function applyRewardEvent(raw, event) {
    let state = createState(raw);
    const key = rewardKey(event), reward = REWARDS[key];
    if (!reward) return Object.freeze({ ok: false, changed: false, reason: 'no-echo-reward', state, reward: null });
    const receipts = [];
    if (reward.capacityKnot) {
      const capacity = grantCapacity(state, reward.capacityKnot);state = capacity.state;receipts.push(capacity);
    }
    // Rewards enter the collection without silently rewriting the current
    // build. The player deliberately weaves them at a refuge.
    const echo = grantEcho(state, reward.echoId, key, { autoEquip: false });state = echo.state;receipts.push(echo);
    return Object.freeze({ ok: true, changed: receipts.some((row) => row.changed), reason: 'reward-applied', state,
      reward: Object.freeze({ ...reward }), echo, receipts: Object.freeze(receipts) });
  }

  function equip(raw, echoId, context) {
    const state = createState(raw), id = String(echoId || ''), ctx = safeRecord(context);
    if (ctx.atRest !== true) return Object.freeze({ ok: false, changed: false, reason: 'rest-required', state });
    if (!state.owned.includes(id)) return Object.freeze({ ok: false, changed: false, reason: 'echo-not-owned', state });
    if (state.equipped.includes(id)) return Object.freeze({ ok: true, changed: false, reason: 'already-equipped', state });
    if (state.equipped.length >= MAX_EQUIPPED) return Object.freeze({ ok: false, changed: false, reason: 'slot-limit', state });
    const echo = ECHOES[id], p = profile(state);
    if (echo.cost > p.free) return Object.freeze({ ok: false, changed: false, reason: 'capacity-exceeded', state, needed: echo.cost, free: p.free });
    state.equipped.push(id);state.revision++;
    return Object.freeze({ ok: true, changed: true, reason: 'equipped', state, echo });
  }

  function unequip(raw, echoId, context) {
    const state = createState(raw), id = String(echoId || ''), ctx = safeRecord(context);
    if (ctx.atRest !== true) return Object.freeze({ ok: false, changed: false, reason: 'rest-required', state });
    if (!state.equipped.includes(id)) return Object.freeze({ ok: true, changed: false, reason: 'already-unequipped', state });
    state.equipped = state.equipped.filter((entry) => entry !== id);state.revision++;
    return Object.freeze({ ok: true, changed: true, reason: 'unequipped', state, echo: ECHOES[id] });
  }

  function hookReceipts(raw, event) {
    const state = createState(raw), packet = safeRecord(event), type = String(packet.type || '');
    const receipts = [];
    for (const id of state.equipped) for (const hook of ECHOES[id].hooks) {
      if (hook.event !== type) continue;
      if (hook.qualifier && hook.qualifier !== packet.action && hook.qualifier !== packet.kind && hook.qualifier !== packet.element) continue;
      receipts.push(Object.freeze({ echoId: id, echo: ECHOES[id].name, event: type,
        operation: hook.operation, value: hook.value, qualifier: hook.qualifier }));
    }
    return Object.freeze(receipts);
  }

  function modifier(raw, event, operation, fallback) {
    const rows = hookReceipts(raw, typeof event === 'string' ? { type: event } : event).filter((row) => row.operation === operation);
    if (!rows.length) return fallback;
    if (operation.endsWith(':mul')) return rows.reduce((value, row) => value * row.value, fallback == null ? 1 : fallback);
    if (operation.endsWith(':add') || operation.endsWith(':seconds')) return rows.reduce((value, row) => value + row.value, fallback || 0);
    if (operation.endsWith(':enable') || operation === 'execute-threshold') return rows.at(-1).value;
    return rows.at(-1).value;
  }

  function runtimeMods(raw) {
    const state = createState(raw), equipped = new Set(state.equipped);
    return Object.freeze({
      dashFire: equipped.has('ember-step'), execute: equipped.has('hollow-edge'),
      volatile: false, pierce: equipped.has('far-thread'),
      adren: equipped.has('red-tempo'), thorns: equipped.has('chain-vow'),
      shockwave: false, glass: false,
    });
  }

  function uiModel(raw) {
    const state = createState(raw), p = profile(state), equipped = new Set(state.equipped), owned = new Set(state.owned);
    return Object.freeze({ ...p, rows: Object.freeze(ECHO_IDS.map((id) => Object.freeze({
      ...clone(ECHOES[id]), status: equipped.has(id) ? 'equipped' : owned.has(id) ? 'owned' : 'unknown',
    }))) });
  }

  function createController() {
    let counters = { acquisitions: 0, capacityExpansions: 0, equips: 0, unequips: 0, hooks: 0, blocked: 0 };
    let last = null;
    // Private state participates in opt-in TAS branching.
    root.BladefallHarness?.register("echoes:createController", () => ({ counters, last }),
      state => ({ counters, last } = state));
    function record(type, detail) {
      if (type === 'acquired') counters.acquisitions++;
      else if (type === 'capacity') counters.capacityExpansions++;
      else if (type === 'equipped') counters.equips++;
      else if (type === 'unequipped') counters.unequips++;
      else if (type === 'hook') counters.hooks++;
      else counters.blocked++;
      last = Object.freeze({ type, detail: detail == null ? null : String(detail) });
    }
    function diagnostics() { return Object.freeze({ ...counters, last }); }
    return Object.freeze({ record, diagnostics });
  }

  function validate() {
    const errors = [], sources = new Set(), operations = new Set();
    if (ECHO_IDS.length !== 12) errors.push('echo catalog must contain twelve foundation echoes');
    for (const id of ECHO_IDS) {
      const echo = ECHOES[id];
      if (!(echo.cost >= 1 && echo.cost <= 3) || !echo.hooks.length) errors.push(`${id}:invalid-cost-or-hooks`);
      if (sources.has(echo.source) || !REWARDS[echo.source]) errors.push(`${id}:invalid-or-duplicate-source`);
      sources.add(echo.source);
      for (const hook of echo.hooks) operations.add(hook.operation);
    }
    if (operations.size < ECHO_IDS.length) errors.push('echo hooks lack systemic variety');
    let state = createState();state = grantEcho(state, 'fault-bell', 'test').state;
    if (!state.equipped.includes('fault-bell') || profile(state).free !== 0) errors.push('first fitting echo must auto-equip');
    if (equip(grantEcho(state, 'far-thread', 'test').state, 'far-thread', { atRest: true }).reason !== 'capacity-exceeded') errors.push('capacity limit is not enforced');
    if (unequip(state, 'fault-bell', { atRest: false }).reason !== 'rest-required') errors.push('loadout changes must require rest');
    return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), echoes: ECHO_IDS.length,
      baseCapacity: BASE_CAPACITY, maxCapacity: MAX_CAPACITY, maxEquipped: MAX_EQUIPPED, rewardEvents: Object.keys(REWARDS).length });
  }

  root.BladefallEchoes = Object.freeze({
    SCHEMA, VERSION, BASE_CAPACITY, MAX_CAPACITY, MAX_EQUIPPED, ECHO_IDS, ECHOES,
    REWARDS, LEGACY_MODS, createState, migrate, profile, grantEcho, grantCapacity,
    applyRewardEvent, equip, unequip, hookReceipts, modifier, runtimeMods, uiModel,
    createController, validate,
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
