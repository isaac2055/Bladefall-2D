(function installBladefallWorld(root) {
  'use strict';

  const SCHEMA = 'bladefall.world-progress';
  const VERSION = 2;
  const START_NODE = 'outskirts';
  const FINAL_NODE = 'abyss-king';
  const TRUTH_NODE = 'deep-line';
  const progression = root.BladefallProgression || null;
  const zoneContract = root.BladefallZones || null;

  const nodeRecords = [
    ['outskirts', 0, 'The Outskirts', 0, 0, 'road', true],
    ['black-woods', 1, 'Black Woods', 1, 1, 'settlement', true],
    ['brute', 2, 'Broken Causeway', 2, 2, 'boss', false],
    ['updrafts', 3, 'Updraft Canyons', 3, 3, 'wilds', true],
    ['hollow-marksman', 4, 'Marksman Road', 4, 4, 'boss', false],
    ['ruined-keep', 5, 'Ruined Keep', 5, 5, 'settlement', true],
    ['warden', 6, 'The Gaol', 6, 6, 'boss', false],
    ['frostfell', 7, 'Frostfell', 7, 7, 'settlement', true],
    ['frost-sorcerer', 8, 'White Court', 8, 8, 'boss', false],
    ['emberdeep', 9, 'Emberdeep', 9, 9, 'settlement', true],
    ['ember-colossus', 10, 'The Foundry', 10, 10, 'boss', false],
    ['inversion', 11, 'The Inversion', 11, 11, 'threshold', true],
    ['void-tyrant', 12, 'Paradox Citadel', 12, 12, 'boss', true],
    ['abyss-king', 13, 'The Drowned Throne', 13, 13, 'final-boss', false],
    ['gilded-vault', 14, 'The Gilded Vault', 14, 14, 'optional', true],
    ['deep-line', 15, 'The Deep Line', 15, 15, 'truth-route', true],
  ];

  const nodes = nodeRecords.map(([id, stageIndex, name, column, depth, kind, anchor]) => {
    const planned = progression?.zone(id);
    return {
      id, stageIndex, name,
      column: planned?.position.column ?? column,
      depth: planned?.position.row ?? depth,
      kind, anchor,
    };
  });

  const routeRecords = [
    ['outskirts-black-woods', 'outskirts', 'black-woods', 'spine', []],
    ['black-woods-brute', 'black-woods', 'brute', 'spine', ['weapon']],
    ['black-woods-updrafts', 'black-woods', 'updrafts', 'branch', ['dash']],
    ['updrafts-marksman', 'updrafts', 'hollow-marksman', 'branch', ['portal-single']],
    ['marksman-keep', 'hollow-marksman', 'ruined-keep', 'branch', ['portal-pair']],
    ['outskirts-warden', 'outskirts', 'warden', 'branch', ['wall-jump']],
    ['warden-frostfell', 'warden', 'frostfell', 'branch', ['counter']],
    ['brute-sorcerer', 'brute', 'frost-sorcerer', 'spine', ['wall-jump', 'double-jump']],
    ['frostfell-sorcerer', 'frostfell', 'frost-sorcerer', 'shortcut', ['double-jump']],
    ['sorcerer-emberdeep', 'frost-sorcerer', 'emberdeep', 'spine', ['attunement']],
    ['emberdeep-colossus', 'emberdeep', 'ember-colossus', 'spine', ['companion-command']],
    ['colossus-inversion', 'ember-colossus', 'inversion', 'spine', ['downward-strike']],
    ['inversion-tyrant', 'inversion', 'void-tyrant', 'spine', ['gravity-flip']],
    ['tyrant-king', 'void-tyrant', 'abyss-king', 'main-ending', []],
    ['king-vault', 'abyss-king', 'gilded-vault', 'truth-branch', []],
    ['vault-deep-line', 'gilded-vault', 'deep-line', 'truth-branch', []],
  ];

  const routes = routeRecords.map(([id, from, to, kind, capabilities]) => ({
    id, from, to, kind, requiresCleared: [from], capabilities: [...capabilities], returnable: true,
  }));

  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const nodeByStage = new Map(nodes.map((node) => [node.stageIndex, node]));

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

  function validIds(values) {
    const output = [];
    const seen = new Set();
    for (const value of Array.isArray(values) ? values : []) {
      const id = String(value || '');
      if (!nodeById.has(id) || seen.has(id)) continue;
      seen.add(id);
      output.push(id);
    }
    return output;
  }

  function normalizeFlags(flags) {
    const input = flags && typeof flags === 'object' && !Array.isArray(flags) ? flags : {};
    return {
      vaultCleared: !!input.vaultCleared,
      deepLineCleared: !!input.deepLineCleared,
    };
  }

  function createProgress(source) {
    const input = source && typeof source === 'object' && !Array.isArray(source) ? source : {};
    const current = nodeById.has(input.current) ? input.current : START_NODE;
    const visited = validIds(input.visited);
    if (!visited.includes(current)) visited.push(current);
    if (!visited.includes(START_NODE)) visited.unshift(START_NODE);
    const cleared = validIds(input.cleared).filter((id) => visited.includes(id));
    const anchors = validIds(input.anchors).filter((id) => visited.includes(id) && nodeById.get(id).anchor);
    if (current === START_NODE && !anchors.includes(START_NODE)) anchors.push(START_NODE);
    return {
      schema: SCHEMA,
      version: VERSION,
      current,
      previous: nodeById.has(input.previous) ? input.previous : null,
      entryRoute: input.entryRoute === 'anchor-travel' || routes.some((route) => route.id === input.entryRoute)
        ? input.entryRoute : null,
      visited,
      cleared,
      anchors,
      memories: [...new Set((Array.isArray(input.memories) ? input.memories : []).map(String))],
      quests: input.quests && typeof input.quests === 'object' && !Array.isArray(input.quests)
        ? clone(input.quests) : {},
      flags: normalizeFlags(input.flags),
    };
  }

  function legacyProgress(legacy) {
    const source = legacy && typeof legacy === 'object' ? legacy : {};
    const baseReach = source.reach && typeof source.reach === 'object' ? Number(source.reach[0]) : 0;
    const runStage = source.run && Number(source.run.ngPlus || 0) === 0 ? Number(source.run.stageIndex) : 0;
    const furthest = Math.max(0, Math.min(13, Math.floor(Math.max(
      Number(source.bestStage) || 0, Number(baseReach) || 0, Number(runStage) || 0
    ))));
    const visited = nodes.filter((node) => node.stageIndex <= furthest && node.stageIndex <= 13).map((node) => node.id);
    const cleared = nodes.filter((node) => node.stageIndex < furthest && node.stageIndex <= 13).map((node) => node.id);
    let current = nodeByStage.get(furthest).id;
    if (source.vaultCleared) {
      for (const id of ['void-tyrant', 'gilded-vault']) if (!visited.includes(id)) visited.push(id);
      if (!cleared.includes('gilded-vault')) cleared.push('gilded-vault');
    }
    if (source.secretCleared) {
      for (const id of ['void-tyrant', 'gilded-vault', 'deep-line']) if (!visited.includes(id)) visited.push(id);
      for (const id of ['gilded-vault', 'deep-line']) if (!cleared.includes(id)) cleared.push(id);
      current = 'deep-line';
    }
    return createProgress({
      current,
      visited,
      cleared,
      anchors: visited.filter((id) => nodeById.get(id).anchor),
      flags: { vaultCleared: !!source.vaultCleared, deepLineCleared: !!source.secretCleared },
    });
  }

  function migrateProgress(raw, legacy) {
    const current = raw && raw.schema === SCHEMA ? createProgress(raw) : legacyProgress(legacy);
    const before = raw && typeof raw === 'object' ? JSON.stringify(raw) : '';
    return Object.freeze({
      progress: current,
      receipt: Object.freeze({
        from: raw && raw.schema === SCHEMA ? Number(raw.version) || 0 : 0,
        to: VERSION,
        changed: before !== JSON.stringify(current),
        source: raw && raw.schema === SCHEMA ? 'world-progress' : 'legacy-campaign',
      }),
    });
  }

  function requirementsMet(progress, route, context) {
    const cleared = new Set(progress.cleared);
    const owned = new Set(Array.isArray(context && context.capabilities) ? context.capabilities : []);
    return route.requiresCleared.every((id) => cleared.has(id))&&route.capabilities.every((id)=>owned.has(id));
  }

  function outgoing(progress, context) {
    const state = createProgress(progress);
    return routes.filter((route) => route.from === state.current && requirementsMet(state, route, context));
  }

  function fastTravelTargets(progress) {
    const state = createProgress(progress);
    return state.anchors.map((id) => nodeById.get(id));
  }

  function mapModel(progress, context) {
    const state = createProgress(progress);
    const visited = new Set(state.visited);
    const cleared = new Set(state.cleared);
    const availableRoutes = new Set(routes
      .filter((route) => visited.has(route.from) && requirementsMet(state, route, context))
      .map((route) => route.id));
    const frontier = new Set(routes
      .filter((route) => availableRoutes.has(route.id) && !visited.has(route.to))
      .map((route) => route.to));
    return Object.freeze({
      current: state.current,
      nodes: Object.freeze(nodes.map((node) => Object.freeze({
        ...node,
        status: node.id === state.current ? 'current'
          : cleared.has(node.id) ? 'cleared'
            : visited.has(node.id) ? 'visited'
              : frontier.has(node.id) ? 'frontier' : 'hidden',
        label: visited.has(node.id) || frontier.has(node.id) ? node.name : 'Unknown',
      }))),
      routes: Object.freeze(routes.map((route) => Object.freeze({
        ...route,
        status: visited.has(route.from) && visited.has(route.to) ? 'traversed'
          : availableRoutes.has(route.id) ? 'available'
            : visited.has(route.from) ? 'locked' : 'hidden',
      }))),
    });
  }

  function travelEligibility(progress, targetId, context) {
    const state = createProgress(progress);
    const target = nodeById.get(targetId);
    const current = nodeById.get(state.current);
    const ctx = context && typeof context === 'object' ? context : {};
    if (!target) return Object.freeze({ allowed: false, reason: 'unknown-node' });
    if (target.id === state.current) return Object.freeze({ allowed: false, reason: 'current-location' });
    if (!target.anchor || !state.anchors.includes(target.id)) return Object.freeze({ allowed: false, reason: 'anchor-locked' });
    if (!ctx.campaign) return Object.freeze({ allowed: false, reason: 'campaign-only' });
    if (ctx.coop) return Object.freeze({ allowed: false, reason: 'partner-linked' });
    if (ctx.battle || ctx.bossRush) return Object.freeze({ allowed: false, reason: 'mode-locked' });
    if (ctx.stageAdvancing) return Object.freeze({ allowed: false, reason: 'transition-active' });
    if (ctx.playerReady === false) return Object.freeze({ allowed: false, reason: 'player-unready' });
    if (ctx.bossActive || ctx.threatNearby) return Object.freeze({ allowed: false, reason: 'area-unsafe' });
    if (!clearedCurrent(state) && (!current.anchor || !ctx.atAnchor)) return Object.freeze({ allowed: false, reason: 'return-to-anchor' });
    return Object.freeze({ allowed: true, reason: 'ready' });
  }

  function clearedCurrent(progress) {
    return progress.cleared.includes(progress.current);
  }

  function enter(progress, targetId, options) {
    const state = createProgress(progress);
    const target = nodeById.get(targetId);
    if (!target) return Object.freeze({ ok: false, reason: 'unknown-node', progress: state });
    const travel = !!(options && options.fastTravel);
    let route = null;
    if (target.id === state.current) return Object.freeze({ ok: true, reason: 'already-here', progress: state });
    if (travel) {
      if (!state.anchors.includes(target.id)) return Object.freeze({ ok: false, reason: 'anchor-locked', progress: state });
    } else if (!state.visited.includes(target.id)) {
      route = routes.find((item) => item.from === state.current && item.to === target.id && requirementsMet(state, item, options));
      if (!route) return Object.freeze({ ok: false, reason: 'route-locked', progress: state });
    } else {
      route = routes.find((item) => item.from === state.current && item.to === target.id ||
        item.to === state.current && item.from === target.id) || null;
    }
    state.previous = state.current;
    state.current = target.id;
    state.entryRoute = route ? route.id : travel ? 'anchor-travel' : null;
    if (!state.visited.includes(target.id)) state.visited.push(target.id);
    if (target.anchor && !state.anchors.includes(target.id)) state.anchors.push(target.id);
    return Object.freeze({ ok: true, reason: travel ? 'fast-travel' : 'route', progress: state });
  }

  function clear(progress, nodeId) {
    const state = createProgress(progress);
    const id = nodeId || state.current;
    if (!nodeById.has(id) || !state.visited.includes(id)) {
      return Object.freeze({ ok: false, reason: 'node-unvisited', progress: state });
    }
    if (!state.cleared.includes(id)) state.cleared.push(id);
    if (id === 'gilded-vault') state.flags.vaultCleared = true;
    if (id === TRUTH_NODE) {
      state.flags.vaultCleared = true;
      state.flags.deepLineCleared = true;
    }
    return Object.freeze({ ok: true, reason: 'cleared', progress: state });
  }

  function stageId(stageIndex) {
    return nodeByStage.get(Number(stageIndex))?.id || null;
  }

  function ending(progress) {
    const state = createProgress(progress);
    return state.flags.deepLineCleared ? 'wake-armed' : 'wake-fall';
  }

  function validateGraph() {
    const errors = [];
    if (nodes.length !== 16) errors.push('world graph must cover all 16 stages');
    if (nodeById.size !== nodes.length || nodeByStage.size !== nodes.length) errors.push('world nodes must have unique ids and stage indices');
    const routeIds = new Set();
    for (const route of routes) {
      if (routeIds.has(route.id)) errors.push(`duplicate route ${route.id}`);
      routeIds.add(route.id);
      if (!nodeById.has(route.from) || !nodeById.has(route.to)) errors.push(`route ${route.id} has an unknown endpoint`);
    }
    if (!routes.some((route) => route.from === FINAL_NODE && route.to === 'gilded-vault')) errors.push('truth branch must begin after the Abyss King');
    if (!routes.some((route) => route.from === 'gilded-vault' && route.to === TRUTH_NODE)) errors.push('Deep Line must follow the Gilded Vault');
    const beforeKing = new Set([START_NODE]);
    for (let pass = 0; pass < nodes.length; pass++) for (const route of routes) {
      if (beforeKing.has(route.from) && route.from !== FINAL_NODE) beforeKing.add(route.to);
    }
    if (!beforeKing.has(FINAL_NODE) || !beforeKing.has('void-tyrant')) errors.push('main descent does not reach the final command gate');
    if (beforeKing.has('gilded-vault') || beforeKing.has(TRUTH_NODE)) errors.push('truth route can be entered before the Abyss King');
    return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), nodes: nodes.length, routes: routes.length, endingRoutes: 2 });
  }

  root.BladefallWorld = Object.freeze({
    SCHEMA,
    VERSION,
    START_NODE,
    FINAL_NODE,
    TRUTH_NODE,
    constitution: progression ? Object.freeze({
      schema: progression.SCHEMA,
      version: progression.VERSION,
      mode: progression.MODE,
      runtimeAdapter: 'physical-streaming-n03-persistence-n04-recovery-n05-capabilities-n06-movement-n07-portals-n08-weapons-n09-equipment-n10-echoes-n11',
    }) : null,
    plannedConnectors: progression?.connectors || Object.freeze([]),
    zoneContract: zoneContract ? Object.freeze({
      schema: zoneContract.SCHEMA,
      version: zoneContract.VERSION,
      zones: zoneContract.zones.length,
      seams: zoneContract.seams.length,
      runtimeLoader: 'bladefall.zone-streamer@1',
      persistence: 'bladefall.persistent-zone-state@1',
      recovery: 'bladefall.recovery-navigation@1',
    }) : null,
    nodes: deepFreeze(nodes.map(clone)),
    routes: deepFreeze(routes.map(clone)),
    createProgress,
    migrateProgress,
    outgoing,
    fastTravelTargets,
    mapModel,
    travelEligibility,
    enter,
    clear,
    stageId,
    ending,
    validateGraph,
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
