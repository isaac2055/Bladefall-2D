(function installBladefallProgression(root) {
  'use strict';

  const SCHEMA = 'bladefall.progression-constitution';
  const VERSION = 1;
  const MODE = 'single-player';

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

  const zoneRecords = [
    ['outskirts', 0, 'The Outskirts', 0, 0, 'arrival', 13800, 28, 7],
    ['black-woods', 1, 'Black Woods', 1, 0, 'settlement', 12400, 30, 7],
    ['brute', 2, 'Broken Causeway', 2, 0, 'boss', 14000, 30, 7],
    ['updrafts', 3, 'Updraft Canyons', 0, 1, 'wilds', 17000, 36, 9],
    ['hollow-marksman', 4, 'Marksman Road', 1, 1, 'boss', 15000, 32, 8],
    ['ruined-keep', 5, 'Ruined Keep', 2, 1, 'settlement', 18000, 38, 9],
    ['warden', 6, 'The Gaol', -1, -1, 'boss', 15000, 32, 8],
    ['frostfell', 7, 'Frostfell', -1, -2, 'settlement', 18000, 38, 9],
    ['frost-sorcerer', 8, 'White Court', 2, 3, 'boss', 16000, 35, 8],
    ['emberdeep', 9, 'Emberdeep', 3, 3, 'settlement', 18000, 40, 9],
    ['ember-colossus', 10, 'The Foundry', 4, 3, 'boss', 16000, 35, 8],
    ['inversion', 11, 'The Inversion', 4, 4, 'threshold', 19000, 42, 10],
    ['void-tyrant', 12, 'Paradox Citadel', 5, 4, 'boss', 17000, 38, 9],
    ['abyss-king', 13, 'The Drowned Throne', 6, 4, 'final-boss', 18000, 42, 10],
    ['gilded-vault', 14, 'The Gilded Vault', 7, 4, 'optional-mastery', 20000, 45, 11],
    ['deep-line', 15, 'The Deep Line', 8, 4, 'truth-route', 21000, 48, 12],
  ];

  const zones = zoneRecords.map(([id, stageIndex, name, column, row, role, targetLength, firstVisitMinutes, practicedMinutes]) => ({
    id, stageIndex, name, position: { column, row }, role,
    budget: { targetLength, firstVisitMinutes, practicedMinutes },
  }));

  const abilityRecords = [
    ['jump', 'outskirts', 'movement', 1],
    ['weapon', 'black-woods', 'combat', 2],
    ['dash', 'brute', 'movement', 3],
    ['portal-single', 'updrafts', 'portal', 4],
    ['portal-pair', 'hollow-marksman', 'portal', 5],
    ['wall-jump', 'ruined-keep', 'movement', 6],
    ['counter', 'warden', 'combat', 7],
    ['double-jump', 'frostfell', 'movement', 8],
    ['attunement', 'frost-sorcerer', 'tool', 9],
    ['companion-command', 'emberdeep', 'companion', 10],
    ['downward-strike', 'ember-colossus', 'combat-movement', 11],
    ['gravity-flip', 'inversion', 'movement', 12],
  ];

  const abilities = abilityRecords.map(([id, unlockZone, family, order]) => ({
    id, unlockZone, family, order, permanent: true, traversalCritical: true,
  }));

  function connector(id, a, b, form, requirements, extra) {
    return {
      id, endpoints: [a, b], form, requirements: [...requirements],
      physical: true, bidirectional: true, returnable: true,
      ...(extra || {}),
    };
  }

  const connectors = [
    connector('outskirts-black-woods', 'outskirts', 'black-woods', 'open-road', []),
    connector('black-woods-brute', 'black-woods', 'brute', 'root-tunnel', ['weapon']),
    connector('black-woods-updrafts', 'black-woods', 'updrafts', 'cliff-chimney', ['dash']),
    connector('updrafts-marksman', 'updrafts', 'hollow-marksman', 'canyon-path', ['portal-single']),
    connector('marksman-keep', 'hollow-marksman', 'ruined-keep', 'watch-gate', ['portal-pair']),
    connector('outskirts-warden', 'outskirts', 'warden', 'western-breach', ['wall-jump']),
    connector('warden-frostfell', 'warden', 'frostfell', 'mine-descent', ['counter']),
    connector('brute-sorcerer', 'brute', 'frost-sorcerer', 'high-shaft', ['wall-jump', 'double-jump']),
    connector('frostfell-sorcerer', 'frostfell', 'frost-sorcerer', 'frozen-aqueduct', ['double-jump'], {
      shortcut: true, opensFrom: 'frost-sorcerer', initiallySealed: true,
    }),
    connector('sorcerer-emberdeep', 'frost-sorcerer', 'emberdeep', 'court-door', ['attunement']),
    connector('emberdeep-colossus', 'emberdeep', 'ember-colossus', 'furnace-conduit', ['companion-command']),
    connector('colossus-inversion', 'ember-colossus', 'inversion', 'broken-gun-deck', ['downward-strike']),
    connector('inversion-tyrant', 'inversion', 'void-tyrant', 'void-fissure', ['gravity-flip']),
    connector('tyrant-king', 'void-tyrant', 'abyss-king', 'throne-gate', [], { bossClear: 'void-tyrant' }),
    connector('king-vault', 'abyss-king', 'gilded-vault', 'seven-socket-door', [], {
      bossClear: 'abyss-king', requiredKeys: 'all',
    }),
    connector('vault-deep-line', 'gilded-vault', 'deep-line', 'rail-tunnel', [], { bossClear: 'gilded-vault' }),
  ];

  const keys = [
    { id: 'sentinel-key', zone: 'outskirts', secret: 'sentinel-vigil', requirements: ['weapon'], returnVisit: true },
    { id: 'root-key', zone: 'black-woods', secret: 'breakable-root-wall', requirements: ['dash'], returnVisit: true },
    { id: 'gale-key', zone: 'updrafts', secret: 'crosswind-portal-vault', requirements: ['portal-pair'], returnVisit: true },
    { id: 'keep-key', zone: 'ruined-keep', secret: 'masked-belfry', requirements: ['wall-jump'], returnVisit: false },
    { id: 'rime-key', zone: 'frostfell', secret: 'elemental-seam', requirements: ['attunement'], returnVisit: true },
    { id: 'cinder-key', zone: 'emberdeep', secret: 'returned-projectile-seal', requirements: ['counter', 'attunement'], returnVisit: false },
    { id: 'zenith-key', zone: 'inversion', secret: 'ceiling-sanctum', requirements: ['gravity-flip'], returnVisit: false },
  ];

  const intendedItinerary = [
    'outskirts', 'black-woods', 'brute', 'black-woods', 'updrafts', 'hollow-marksman',
    'ruined-keep', 'hollow-marksman', 'updrafts', 'black-woods', 'outskirts', 'warden',
    'frostfell', 'warden', 'outskirts', 'black-woods', 'brute', 'frost-sorcerer',
    'emberdeep', 'ember-colossus', 'inversion', 'void-tyrant', 'abyss-king',
  ];

  const invariants = [
    'single-player-is-the-only-foundation-acceptance-mode',
    'every-zone-exit-is-a-physical-bidirectional-world-connection',
    'portals-are-puzzle-tools-and-never-level-transition-devices',
    'critical-path-traversal-uses-permanent-capabilities-not-consumables',
    'every-required-return-route-remains-recoverable',
    'secrets-telegraph-their-later-capability-before-they-become-reachable',
    'echoes-tools-charms-and-equipment-may-expand-solutions-but-never-gate-the-critical-path',
    'gilded-vault-requires-the-abyss-king-clear-and-all-seven-vault-keys',
    'deep-line-follows-the-gilded-vault-and-is-the-only-truth-ending-route',
    'authored-geometry-must-pass-visual-playability-and-return-path-review',
  ];

  const foundationRuns = [
    ['N01', 'World and progression constitution', 'complete'],
    ['N02', 'Streamable zone schema and physical connector contract', 'complete'],
    ['N03', 'Bidirectional loading, camera handoff, and preload', 'complete'],
    ['N04', 'Persistent zone state, revisits, shortcuts, secrets, and entities', 'complete'],
    ['N05', 'Checkpoints, death, rest, respawn, fast travel, and map', 'complete'],
    ['N06', 'Permanent capability authority, new game, UI, and migration', 'complete'],
    ['N07', 'Progressive controller and movement tuning', 'complete'],
    ['N08', 'Fixed, single, and twin portal progression', 'complete'],
    ['N09', 'Weaponless play, weapons, upgrades, and Crites', 'complete'],
    ['N10', 'Armor, tools, salvage, materials, and shops', 'complete'],
    ['N11', 'Echo capacity, equip flow, semantic hooks, limits, and UI', 'complete'],
    ['N12', 'Unified world reaction matrix', 'complete'],
    ['N13', 'Enemy ecology, hazards, drops, and encounter persistence', 'complete'],
    ['N14', 'Breakable walls, secret grammar, Vault Keys, markers, and rewards', 'complete'],
    ['N15', 'Ability-aware bosses, quests, completion, and leaderboards', 'complete'],
    ['N16', 'Foundation vertical slice, diagnostics, performance, accessibility, and migration audit', 'complete'],
  ].map(([id, name, status]) => ({ id, name, status }));

  const levelRunTemplate = [
    'survey-and-charter', 'geometry-and-traversal', 'encounters-and-systems',
    'quests-secrets-and-narrative', 'boss-or-climax-and-rewards', 'visual-qa-balance-and-regression',
  ];

  const reusePolicy = {
    reuse: ['fixed-step-runtime', 'renderer', 'camera', 'input-remapping', 'portal-physics', 'environment-simulation', 'enemy-archetype-primitives', 'save-migration', 'accessibility-controls'],
    adapt: ['campaign-stage-loader', 'world-map', 'checkpoints', 'quests', 'shops', 'Echoes', 'Crites', 'boss-state-machines', 'completion-metrics'],
    replace: ['linear-level-unlock-authority', 'completion-portal-travel', 'all-abilities-at-spawn', 'single-use-level-state', 'random-environment-placement-as-level-design'],
  };

  const zoneById = new Map(zones.map((zone) => [zone.id, zone]));
  const abilityById = new Map(abilities.map((ability) => [ability.id, ability]));
  const connectorById = new Map(connectors.map((item) => [item.id, item]));
  const keyById = new Map(keys.map((key) => [key.id, key]));

  function capabilitiesThrough(zoneId) {
    const zone = zoneById.get(zoneId);
    if (!zone) return [];
    return abilities.filter((ability) => zoneById.get(ability.unlockZone).stageIndex <= zone.stageIndex).map((ability) => ability.id);
  }

  function connectionBetween(a, b) {
    return connectors.find((item) => item.endpoints.includes(a) && item.endpoints.includes(b)) || null;
  }

  function validate() {
    const errors = [];
    const unique = (values) => new Set(values).size === values.length;
    if (MODE !== 'single-player') errors.push('foundation mode must be single-player');
    if (zones.length !== 16 || !unique(zones.map((zone) => zone.id)) || !unique(zones.map((zone) => zone.stageIndex))) errors.push('zones must uniquely cover all 16 stages');
    if (abilities.length !== 12 || !unique(abilities.map((ability) => ability.id)) || !unique(abilities.map((ability) => ability.order))) errors.push('abilities must have a unique 12-step progression');
    if (keys.length !== 7 || !unique(keys.map((key) => key.id))) errors.push('the Vault requires seven unique keys');
    if (foundationRuns.length !== 16 || foundationRuns.some((run) => run.status !== 'complete')) errors.push('foundation ledger must have N01 through N16 complete');

    for (const ability of abilities) if (!zoneById.has(ability.unlockZone)) errors.push(`ability ${ability.id} has an unknown unlock zone`);
    for (const key of keys) {
      if (!zoneById.has(key.zone)) errors.push(`key ${key.id} has an unknown zone`);
      for (const requirement of key.requirements) if (!abilityById.has(requirement)) errors.push(`key ${key.id} requires unknown ability ${requirement}`);
    }
    for (const item of connectors) {
      if (item.endpoints.length !== 2 || item.endpoints.some((id) => !zoneById.has(id))) errors.push(`connector ${item.id} has an unknown endpoint`);
      if (!item.physical || !item.bidirectional || !item.returnable) errors.push(`connector ${item.id} violates physical returnability`);
      if (/portal/i.test(item.form)) errors.push(`connector ${item.id} uses a transition portal`);
      for (const requirement of item.requirements) if (!abilityById.has(requirement)) errors.push(`connector ${item.id} requires unknown ability ${requirement}`);
    }

    const reached = new Set(['outskirts']);
    for (let pass = 0; pass < zones.length; pass++) for (const item of connectors) {
      if (reached.has(item.endpoints[0])) reached.add(item.endpoints[1]);
      if (reached.has(item.endpoints[1])) reached.add(item.endpoints[0]);
    }
    if (reached.size !== zones.length) errors.push('physical world graph is disconnected');

    const acquired = new Set();
    for (let index = 0; index < intendedItinerary.length; index++) {
      const zoneId = intendedItinerary[index];
      for (const ability of abilities.filter((item) => item.unlockZone === zoneId)) acquired.add(ability.id);
      if (index === 0) continue;
      const previous = intendedItinerary[index - 1];
      const route = connectionBetween(previous, zoneId);
      if (!route) errors.push(`intended itinerary lacks a connector from ${previous} to ${zoneId}`);
      else for (const requirement of route.requirements) if (!acquired.has(requirement)) errors.push(`itinerary reaches ${route.id} before ${requirement}`);
    }
    const vaultRoute = connectorById.get('king-vault');
    if (vaultRoute?.bossClear !== 'abyss-king' || vaultRoute?.requiredKeys !== 'all') errors.push('Vault door must require the final boss and every key');
    if (!connectionBetween('gilded-vault', 'deep-line')) errors.push('Deep Line must physically follow the Vault');
    for (const zone of zones) if (zone.budget.targetLength < 12000 || zone.budget.firstVisitMinutes < 25) errors.push(`zone ${zone.id} is below the authored scale floor`);

    return Object.freeze({
      ok: errors.length === 0,
      errors: Object.freeze(errors),
      zones: zones.length,
      connectors: connectors.length,
      abilities: abilities.length,
      vaultKeys: keys.length,
      foundationRuns: foundationRuns.length,
    });
  }

  root.BladefallProgression = Object.freeze({
    SCHEMA, VERSION, MODE,
    zones: deepFreeze(zones.map(clone)),
    abilities: deepFreeze(abilities.map(clone)),
    connectors: deepFreeze(connectors.map(clone)),
    keys: deepFreeze(keys.map(clone)),
    intendedItinerary: deepFreeze([...intendedItinerary]),
    invariants: deepFreeze([...invariants]),
    foundationRuns: deepFreeze(foundationRuns.map(clone)),
    levelRunTemplate: deepFreeze([...levelRunTemplate]),
    reusePolicy: deepFreeze(clone(reusePolicy)),
    zone: (id) => zoneById.get(id) || null,
    ability: (id) => abilityById.get(id) || null,
    connector: (id) => connectorById.get(id) || null,
    vaultKey: (id) => keyById.get(id) || null,
    capabilitiesThrough,
    connectionBetween,
    validate,
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
