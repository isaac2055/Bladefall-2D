(function installBladefallRecovery(root) {
  'use strict';

  const progression = root.BladefallProgression;
  const zones = root.BladefallZones;
  if (!progression || !zones) throw new Error('BladefallRecovery requires progression and zone contracts');

  const SCHEMA = 'bladefall.recovery-navigation';
  const VERSION = 1;
  const MAX_EVENTS = 64;

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

  function finite(value, fallback) {
    return Number.isFinite(Number(value)) ? Number(value) : fallback;
  }

  function point(value, fallback) {
    const input = value && typeof value === 'object' ? value : {};
    return { x: finite(input.x, fallback?.x || 70), y: finite(input.y, fallback?.y || 0) };
  }

  const siteRecords = [
    ['march-camp', 'outskirts', 'Outskirts Camp', 0.03, true],
    ['ethereal-shelter', 'black-woods', 'Ethereal Shelter', 0.10, true],
    ['causeway-vigil', 'brute', 'Causeway Vigil', 0.76, false],
    ['bellows-rest', 'updrafts', 'Bellows Rest', 0.10, true],
    ['fletcher-bench', 'hollow-marksman', 'Fletcher’s Bench', 0.42, false],
    ['keep-hearth', 'ruined-keep', 'Keep Hearth', 0.36, true],
    ['gaol-vigil', 'warden', 'Gaol Vigil', 0.68, false],
    ['frost-refuge', 'frostfell', 'Frost Refuge', 0.28, true],
    ['white-antechamber', 'frost-sorcerer', 'White Antechamber', 0.70, false],
    ['furnace-shelter', 'emberdeep', 'Furnace Shelter', 0.34, true],
    ['foundry-threshold', 'ember-colossus', 'Foundry Threshold', 0.72, false],
    ['inversion-plinth', 'inversion', 'Inversion Plinth', 0.40, true],
    ['paradox-vigil', 'void-tyrant', 'Paradox Vigil', 0.74, false],
    ['throne-watch', 'abyss-king', 'Throne Watch', 0.26, true],
    ['vault-foyer', 'gilded-vault', 'Vault Foyer', 0.12, true],
    ['line-terminus', 'deep-line', 'Line Terminus', 0.08, true],
  ];

  const sites = siteRecords.map(([id, zoneId, name, ratio, fastTravel]) => {
    const zone = zones.zone(zoneId);
    return {
      id, zoneId, name, fastTravel,
      position: { x: Math.round(zone.localBounds.x2 * ratio), y: 0 },
      heal: 'full',
      enemyReset: 'rest-reset-only',
      mapRevealCells: 2,
    };
  });
  const siteById = new Map(sites.map((site) => [site.id, site]));
  const siteByZone = new Map(sites.map((site) => [site.zoneId, site]));

  function normalizeCheckpoint(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const zoneId = String(raw.zoneId || '');
    if (!zones.zone(zoneId)) return null;
    return {
      id: String(raw.id || `${zoneId}:entrance`),
      zoneId,
      kind: raw.kind === 'rest' ? 'rest' : raw.kind === 'checkpoint' ? 'checkpoint' : 'entrance',
      position: point(raw.position),
      siteId: siteById.has(raw.siteId) ? raw.siteId : null,
      activatedRevision: Math.max(0, Math.floor(finite(raw.activatedRevision, 0))),
    };
  }

  function createState(raw) {
    const input = raw && raw.schema === SCHEMA ? raw : {};
    const activatedSites = {};
    for (const [id, value] of Object.entries(input.activatedSites && typeof input.activatedSites === 'object' ? input.activatedSites : {})) {
      if (!siteById.has(id)) continue;
      activatedSites[id] = {
        visits: Math.max(1, Math.floor(finite(value?.visits, 1))),
        firstRevision: Math.max(0, Math.floor(finite(value?.firstRevision, 0))),
      };
    }
    return {
      schema: SCHEMA,
      version: VERSION,
      revision: Math.max(0, Math.floor(finite(input.revision, 0))),
      activeCheckpoint: normalizeCheckpoint(input.activeCheckpoint),
      lastRestSiteId: siteById.has(input.lastRestSiteId) ? input.lastRestSiteId : null,
      activatedSites,
      deaths: Math.max(0, Math.floor(finite(input.deaths, 0))),
      rests: Math.max(0, Math.floor(finite(input.rests, 0))),
      fastTravels: Math.max(0, Math.floor(finite(input.fastTravels, 0))),
      events: (Array.isArray(input.events) ? input.events : []).slice(-MAX_EVENTS).map(clone),
    };
  }

  function migrate(raw) {
    const state = createState(raw);
    return Object.freeze({
      state,
      receipt: Object.freeze({
        from: raw && raw.schema === SCHEMA ? Math.max(0, Math.floor(finite(raw.version, 0))) : 0,
        to: VERSION,
        changed: JSON.stringify(raw || null) !== JSON.stringify(state),
        source: raw && raw.schema === SCHEMA ? 'recovery' : 'new',
      }),
    });
  }

  function event(state, type, detail) {
    state.events.push({ revision: state.revision, type, ...(detail || {}) });
    if (state.events.length > MAX_EVENTS) state.events.splice(0, state.events.length - MAX_EVENTS);
  }

  function activateCheckpoint(raw, checkpoint) {
    const state = createState(raw);
    const normalized = normalizeCheckpoint({ ...checkpoint, activatedRevision: state.revision + 1 });
    if (!normalized) return Object.freeze({ state, changed: false, reason: 'invalid-checkpoint' });
    const current = state.activeCheckpoint;
    if (current && current.id === normalized.id && current.zoneId === normalized.zoneId &&
      current.position.x === normalized.position.x && current.position.y === normalized.position.y) {
      return Object.freeze({ state, changed: false, reason: 'already-active' });
    }
    state.revision++;
    normalized.activatedRevision = state.revision;
    state.activeCheckpoint = normalized;
    event(state, 'checkpoint-activated', { checkpointId: normalized.id, zoneId: normalized.zoneId, kind: normalized.kind });
    return Object.freeze({ state, changed: true, reason: 'activated', checkpoint: deepFreeze(clone(normalized)) });
  }

  function activateSite(raw, siteId) {
    let state = createState(raw);
    const site = siteById.get(String(siteId));
    if (!site) return Object.freeze({ state, changed: false, reason: 'unknown-site' });
    const previous = state.activatedSites[site.id];
    state.revision++;
    state.activatedSites[site.id] = {
      visits: (previous?.visits || 0) + 1,
      firstRevision: previous?.firstRevision || state.revision,
    };
    event(state, previous ? 'site-revisited' : 'site-discovered', { siteId: site.id, zoneId: site.zoneId });
    const checkpoint = activateCheckpoint(state, {
      id: `${site.id}:rest`, zoneId: site.zoneId, kind: 'rest', position: site.position, siteId: site.id,
    });
    state = checkpoint.state;
    return Object.freeze({ state, changed: true, reason: previous ? 'revisited' : 'discovered', site: deepFreeze(clone(site)) });
  }

  function rest(raw, siteId, visitedZoneIds) {
    const activation = activateSite(raw, siteId);
    if (!activation.changed) return Object.freeze({ ...activation, resetZoneIds: Object.freeze([]) });
    const state = createState(activation.state);
    state.revision++;
    state.rests++;
    state.lastRestSiteId = String(siteId);
    event(state, 'rested', { siteId: String(siteId), rest: state.rests });
    const resetZoneIds = [...new Set((Array.isArray(visitedZoneIds) ? visitedZoneIds : []).map(String).filter((id) => zones.zone(id)))];
    return Object.freeze({ state, changed: true, reason: 'rested', site: activation.site, resetZoneIds: Object.freeze(resetZoneIds) });
  }

  function recordDeath(raw, currentZoneId, fallbackPosition) {
    const state = createState(raw);
    state.revision++;
    state.deaths++;
    let checkpoint = state.activeCheckpoint;
    if (!checkpoint || checkpoint.zoneId !== currentZoneId) checkpoint = {
      id: `${currentZoneId}:entrance`, zoneId: currentZoneId, kind: 'entrance',
      position: point(fallbackPosition), siteId: null, activatedRevision: state.revision,
    };
    event(state, 'death', { zoneId: currentZoneId, checkpointId: checkpoint.id, death: state.deaths });
    return Object.freeze({
      state,
      plan: deepFreeze({
        zoneId: checkpoint.zoneId,
        checkpointId: checkpoint.id,
        position: clone(checkpoint.position),
        heal: 'full',
        preservePermanentState: true,
        preserveRestResetDefeats: true,
        clearTransientCombat: true,
      }),
    });
  }

  function fastTravelEligibility(raw, targetSiteId, context) {
    const state = createState(raw);
    const target = siteById.get(String(targetSiteId));
    const ctx = context && typeof context === 'object' ? context : {};
    if (!target) return Object.freeze({ allowed: false, reason: 'unknown-site' });
    if (!target.fastTravel) return Object.freeze({ allowed: false, reason: 'destination-has-no-station' });
    if (!state.activatedSites[target.id]) return Object.freeze({ allowed: false, reason: 'destination-undiscovered' });
    const source = siteById.get(String(ctx.atSiteId || ''));
    if (!source || !source.fastTravel || !state.activatedSites[source.id]) return Object.freeze({ allowed: false, reason: 'stand-at-station' });
    if (source.id === target.id) return Object.freeze({ allowed: false, reason: 'current-station' });
    if (ctx.campaign === false) return Object.freeze({ allowed: false, reason: 'campaign-only' });
    if (ctx.transitionActive) return Object.freeze({ allowed: false, reason: 'transition-active' });
    if (ctx.playerReady === false) return Object.freeze({ allowed: false, reason: 'player-unready' });
    if (ctx.bossActive || ctx.threatNearby) return Object.freeze({ allowed: false, reason: 'area-unsafe' });
    return Object.freeze({ allowed: true, reason: 'ready', sourceSiteId: source.id, targetSiteId: target.id });
  }

  function planFastTravel(raw, targetSiteId, context) {
    const eligibility = fastTravelEligibility(raw, targetSiteId, context);
    if (!eligibility.allowed) return Object.freeze({ ok: false, ...eligibility });
    const state = createState(raw);
    const target = siteById.get(targetSiteId);
    state.revision++;
    state.fastTravels++;
    state.activeCheckpoint = normalizeCheckpoint({
      id: `${target.id}:rest`, zoneId: target.zoneId, kind: 'rest', position: target.position, siteId: target.id,
      activatedRevision: state.revision,
    });
    event(state, 'fast-travel', { from: eligibility.sourceSiteId, to: target.id, journey: state.fastTravels });
    return Object.freeze({
      ok: true,
      state,
      sourceSiteId: eligibility.sourceSiteId,
      targetSiteId: target.id,
      zoneId: target.zoneId,
      position: deepFreeze(clone(target.position)),
      checkpoint: deepFreeze(clone(state.activeCheckpoint)),
      resetsEnemies: false,
    });
  }

  function mapModel(raw, zoneState, currentZoneId) {
    const state = createState(raw);
    const persistent = zoneState && typeof zoneState === 'object' && zoneState.zones ? zoneState.zones : {};
    const visited = new Set(Object.entries(persistent).filter(([, zone]) => Number(zone.visits) > 0).map(([id]) => id));
    for (const siteId of Object.keys(state.activatedSites)) visited.add(siteById.get(siteId).zoneId);
    if (currentZoneId) visited.add(currentZoneId);
    const frontier = new Set();
    for (const seam of zones.seams) {
      const [a, b] = seam.endpoints.map((endpoint) => endpoint.zoneId);
      if (visited.has(a) && !visited.has(b)) frontier.add(b);
      if (visited.has(b) && !visited.has(a)) frontier.add(a);
    }
    const nodeModels = progression.zones.map((zone) => {
      const status = zone.id === currentZoneId ? 'current' : visited.has(zone.id) ? 'visited' : frontier.has(zone.id) ? 'frontier' : 'hidden';
      const site = siteByZone.get(zone.id);
      const savedZone = persistent[zone.id] || {};
      return deepFreeze({
        id: zone.id,
        name: status === 'hidden' ? 'Unknown' : zone.name,
        status,
        position: clone(zone.position),
        discoveredCells: Array.isArray(savedZone.discoveredCells) ? savedZone.discoveredCells.length : 0,
        totalCells: zones.zone(zone.id).streamCells.length,
        restSite: site && state.activatedSites[site.id] ? { id: site.id, name: site.name, fastTravel: site.fastTravel } : null,
      });
    });
    const routeModels = zones.seams.map((seam) => {
      const [a, b] = seam.endpoints.map((endpoint) => endpoint.zoneId);
      return deepFreeze({
        id: seam.id, from: a, to: b,
        status: visited.has(a) && visited.has(b) ? 'traversed' :
          (visited.has(a) && frontier.has(b)) || (visited.has(b) && frontier.has(a)) ? 'frontier' : 'hidden',
      });
    });
    return deepFreeze({ current: currentZoneId || null, nodes: nodeModels, routes: routeModels });
  }

  function validateCatalog() {
    const errors = [];
    if (sites.length !== progression.zones.length || siteById.size !== sites.length || siteByZone.size !== sites.length) errors.push('every-zone-requires-one-unique-rest-site');
    for (const site of sites) {
      const zone = zones.zone(site.zoneId);
      if (!zone) errors.push(`${site.id}:unknown-zone`);
      else if (site.position.x < zone.localBounds.x1 || site.position.x > zone.localBounds.x2 || site.position.y < zone.localBounds.y1 || site.position.y > zone.localBounds.y2) errors.push(`${site.id}:outside-zone`);
      if (site.enemyReset !== 'rest-reset-only') errors.push(`${site.id}:unsafe-reset-policy`);
    }
    if (sites.filter((site) => site.fastTravel).length < 8) errors.push('world-needs-a-useful-station-network');
    return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), sites: sites.length, stations: sites.filter((site) => site.fastTravel).length });
  }

  function validateState(raw) {
    const state = createState(raw);
    const errors = [];
    if (state.activeCheckpoint && !zones.zone(state.activeCheckpoint.zoneId)) errors.push('checkpoint-zone-invalid');
    if (state.lastRestSiteId && !state.activatedSites[state.lastRestSiteId]) errors.push('last-rest-site-not-activated');
    return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), activatedSites: Object.keys(state.activatedSites).length, deaths: state.deaths, rests: state.rests, fastTravels: state.fastTravels });
  }

  root.BladefallRecovery = Object.freeze({
    SCHEMA, VERSION,
    sites: deepFreeze(sites.map(clone)),
    site: (id) => siteById.get(id) || null,
    siteForZone: (zoneId) => siteByZone.get(zoneId) || null,
    createState,
    migrate,
    activateCheckpoint,
    activateSite,
    rest,
    recordDeath,
    fastTravelEligibility,
    planFastTravel,
    mapModel,
    validateCatalog,
    validateState,
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
