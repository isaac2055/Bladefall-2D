(function installBladefallZoneState(root) {
  'use strict';

  const SCHEMA = 'bladefall.persistent-zone-state';
  const VERSION = 1;
  const POLICIES = Object.freeze(['static', 'session', 'rest-reset', 'permanent']);
  const COLLECTIONS = Object.freeze(['objects', 'enemies', 'pickups', 'npcs']);
  const MAX_EVENT_LOG = 48;

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

  function plainObject(value) {
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  }

  function uniqueStrings(values) {
    return [...new Set((Array.isArray(values) ? values : []).map(String).filter(Boolean))];
  }

  function safeScalar(value) {
    if (value === null || typeof value === 'boolean' || typeof value === 'string') return value;
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    return undefined;
  }

  function safeState(value, depth) {
    if ((depth || 0) > 3) return {};
    if (value === undefined || typeof value === 'function' || typeof value === 'symbol' ||
      typeof value === 'bigint' || (typeof value === 'number' && !Number.isFinite(value))) return undefined;
    const scalar = safeScalar(value);
    if (scalar !== undefined) return scalar;
    if (Array.isArray(value)) return value.slice(0, 64).map((item) => safeState(item, (depth || 0) + 1));
    const output = {};
    for (const [key, item] of Object.entries(plainObject(value)).slice(0, 64)) {
      const safe = safeState(item, (depth || 0) + 1);
      if (safe !== undefined) output[String(key)] = safe;
    }
    return output;
  }

  function same(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
  }

  function emptyZone() {
    return {
      revision: 0,
      visits: 0,
      lastEntrance: null,
      discoveredCells: [],
      entities: {},
      circuits: {},
      openedShortcuts: [],
      secrets: {},
      encounters: {},
      events: [],
    };
  }

  function normalizeEntity(raw) {
    const input = plainObject(raw);
    const policy = POLICIES.includes(input.policy) ? input.policy : 'permanent';
    const collection = COLLECTIONS.includes(input.collection) ? input.collection : 'objects';
    return {
      kind: String(input.kind || 'unknown'),
      collection,
      policy,
      present: input.present !== false,
      state: safeState(input.state),
      revision: Math.max(0, Math.floor(Number(input.revision) || 0)),
    };
  }

  function normalizeZone(raw) {
    const input = plainObject(raw);
    const zone = emptyZone();
    zone.revision = Math.max(0, Math.floor(Number(input.revision) || 0));
    zone.visits = Math.max(0, Math.floor(Number(input.visits) || 0));
    zone.lastEntrance = input.lastEntrance == null ? null : String(input.lastEntrance);
    zone.discoveredCells = uniqueStrings(input.discoveredCells);
    zone.openedShortcuts = uniqueStrings(input.openedShortcuts);
    for (const [id, value] of Object.entries(plainObject(input.entities))) zone.entities[id] = normalizeEntity(value);
    for (const [id, value] of Object.entries(plainObject(input.circuits))) zone.circuits[id] = safeState(value);
    for (const [id, value] of Object.entries(plainObject(input.secrets))) zone.secrets[id] = safeState(value);
    for (const [id, value] of Object.entries(plainObject(input.encounters))) zone.encounters[id] = safeState(value);
    zone.events = (Array.isArray(input.events) ? input.events : []).slice(-MAX_EVENT_LOG).map((item) => safeState(item));
    return zone;
  }

  function createState(raw, validZoneIds) {
    const input = raw && raw.schema === SCHEMA ? raw : {};
    const valid = validZoneIds ? new Set(validZoneIds.map(String)) : null;
    const zones = {};
    for (const [id, value] of Object.entries(plainObject(input.zones))) {
      if (!valid || valid.has(id)) zones[id] = normalizeZone(value);
    }
    return {
      schema: SCHEMA,
      version: VERSION,
      revision: Math.max(0, Math.floor(Number(input.revision) || 0)),
      zones,
    };
  }

  function migration(raw, validZoneIds) {
    const state = createState(raw, validZoneIds);
    return Object.freeze({
      state,
      receipt: Object.freeze({
        from: raw && raw.schema === SCHEMA ? Math.max(0, Math.floor(Number(raw.version) || 0)) : 0,
        to: VERSION,
        changed: JSON.stringify(raw || null) !== JSON.stringify(state),
        source: raw && raw.schema === SCHEMA ? 'zone-state' : 'new',
      }),
    });
  }

  function edit(raw, zoneId, operation) {
    const state = createState(raw);
    const id = String(zoneId || '');
    const zone = normalizeZone(state.zones[id]);
    const changed = operation(zone) !== false;
    if (changed) {
      zone.revision++;
      state.revision++;
    }
    state.zones[id] = zone;
    return state;
  }

  function log(zone, type, detail) {
    zone.events.push(safeState({ revision: zone.revision + 1, type, ...(detail || {}) }));
    if (zone.events.length > MAX_EVENT_LOG) zone.events.splice(0, zone.events.length - MAX_EVENT_LOG);
  }

  function enter(raw, zoneId, endpointId) {
    return edit(raw, zoneId, (zone) => {
      zone.visits++;
      zone.lastEntrance = endpointId == null ? null : String(endpointId);
      log(zone, 'entered', { endpointId: zone.lastEntrance, visit: zone.visits });
    });
  }

  function discoverCell(raw, zoneId, cellId) {
    return edit(raw, zoneId, (zone) => {
      const id = String(cellId || '');
      if (!id || zone.discoveredCells.includes(id)) return false;
      zone.discoveredCells.push(id);
      log(zone, 'cell-discovered', { cellId: id });
    });
  }

  function openShortcut(raw, zoneId, connectorId) {
    return edit(raw, zoneId, (zone) => {
      const id = String(connectorId || '');
      if (!id || zone.openedShortcuts.includes(id)) return false;
      zone.openedShortcuts.push(id);
      log(zone, 'shortcut-opened', { connectorId: id });
    });
  }

  function discoverSecret(raw, zoneId, secretId, stateValue) {
    return edit(raw, zoneId, (zone) => {
      const id = String(secretId || '');
      if (!id) return false;
      const next = safeState(stateValue == null ? { discovered: true } : stateValue);
      if (same(zone.secrets[id], next)) return false;
      zone.secrets[id] = next;
      log(zone, 'secret-changed', { secretId: id });
    });
  }

  function setCircuit(raw, zoneId, circuitId, stateValue) {
    return edit(raw, zoneId, (zone) => {
      const id = String(circuitId || '');
      if (!id) return false;
      const next = safeState(stateValue);
      if (same(zone.circuits[id], next)) return false;
      zone.circuits[id] = next;
      log(zone, 'circuit-changed', { circuitId: id });
    });
  }

  function setEncounter(raw, zoneId, encounterId, stateValue) {
    return edit(raw, zoneId, (zone) => {
      const id = String(encounterId || '');
      if (!id) return false;
      const next = safeState(stateValue);
      if (same(zone.encounters[id], next)) return false;
      zone.encounters[id] = next;
      log(zone, 'encounter-changed', { encounterId: id });
    });
  }

  function manifestById(manifest) {
    const output = new Map();
    for (const item of Array.isArray(manifest) ? manifest : []) {
      const id = String(item?.id || '');
      if (!id || output.has(id)) continue;
      output.set(id, {
        id,
        kind: String(item.kind || 'unknown'),
        collection: COLLECTIONS.includes(item.collection) ? item.collection : 'objects',
        policy: POLICIES.includes(item.policy) ? item.policy : 'permanent',
        defaultPresent: item.defaultPresent !== false,
        defaultState: safeState(item.defaultState),
      });
    }
    return output;
  }

  function capture(raw, zoneId, manifest, snapshot) {
    const definitions = manifestById(manifest);
    const live = new Map();
    for (const item of Array.isArray(snapshot?.entities) ? snapshot.entities : []) {
      const id = String(item?.id || '');
      if (definitions.has(id)) live.set(id, item);
    }
    let mutations = 0;
    const state = edit(raw, zoneId, (zone) => {
      for (const [id, definition] of definitions) {
        if (definition.policy === 'static' || definition.policy === 'session') continue;
        const item = live.get(id);
        const present = item ? item.present !== false : false;
        const entityState = item ? safeState(item.state) : {};
        const unchanged = present === definition.defaultPresent && same(entityState, definition.defaultState);
        if (unchanged) {
          if (zone.entities[id]) { delete zone.entities[id]; mutations++; }
          continue;
        }
        const existing = zone.entities[id];
        const semanticMatch = existing && existing.kind === definition.kind &&
          existing.collection === definition.collection && existing.policy === definition.policy &&
          existing.present === present && same(existing.state, entityState);
        const next = {
          kind: definition.kind,
          collection: definition.collection,
          policy: definition.policy,
          present,
          state: entityState,
          revision: (existing?.revision || 0) + 1,
        };
        if (!semanticMatch) {
          zone.entities[id] = next;
          mutations++;
        }
      }
      for (const item of Array.isArray(snapshot?.circuits) ? snapshot.circuits : []) {
        const id = String(item?.id || '');
        if (!id) continue;
        const next = safeState(item.state);
        if (!same(zone.circuits[id], next)) { zone.circuits[id] = next; mutations++; }
      }
      for (const id of uniqueStrings(snapshot?.openedShortcuts)) if (!zone.openedShortcuts.includes(id)) {
        zone.openedShortcuts.push(id); mutations++;
      }
      for (const item of Array.isArray(snapshot?.secrets) ? snapshot.secrets : []) {
        const id = String(item?.id || '');
        if (!id) continue;
        const next = safeState(item.state);
        if (!same(zone.secrets[id], next)) { zone.secrets[id] = next; mutations++; }
      }
      for (const item of Array.isArray(snapshot?.encounters) ? snapshot.encounters : []) {
        const id = String(item?.id || '');
        if (!id) continue;
        const next = safeState(item.state);
        if (!same(zone.encounters[id], next)) { zone.encounters[id] = next; mutations++; }
      }
      if (!mutations) return false;
      log(zone, 'captured', { mutations });
    });
    return Object.freeze({ state, receipt: Object.freeze({ zoneId: String(zoneId), mutations, compactEntities: Object.keys(state.zones[String(zoneId)]?.entities || {}).length }) });
  }

  function hydrate(raw, zoneId, manifest) {
    const state = createState(raw);
    const zone = normalizeZone(state.zones[String(zoneId)]);
    const definitions = manifestById(manifest);
    const actions = [];
    for (const [id, saved] of Object.entries(zone.entities)) {
      const definition = definitions.get(id);
      if (!definition || definition.policy !== saved.policy || saved.policy === 'session' || saved.policy === 'static') continue;
      actions.push(deepFreeze({
        id,
        collection: definition.collection,
        remove: saved.present === false,
        patch: saved.present === false ? {} : clone(saved.state),
      }));
    }
    return deepFreeze({
      zoneId: String(zoneId),
      visits: zone.visits,
      lastEntrance: zone.lastEntrance,
      actions,
      circuits: clone(zone.circuits),
      openedShortcuts: [...zone.openedShortcuts],
      secrets: clone(zone.secrets),
      encounters: clone(zone.encounters),
      discoveredCells: [...zone.discoveredCells],
    });
  }

  function resetOnRest(raw, zoneId) {
    let restored = 0;
    const state = edit(raw, zoneId, (zone) => {
      for (const [id, entity] of Object.entries(zone.entities)) if (entity.policy === 'rest-reset') {
        delete zone.entities[id];
        restored++;
      }
      if (!restored) return false;
      log(zone, 'rest-reset', { restored });
    });
    return Object.freeze({ state, restored });
  }

  function openedConnectors(raw) {
    const state = createState(raw);
    return uniqueStrings(Object.values(state.zones).flatMap((zone) => zone.openedShortcuts));
  }

  function validate(raw, validZoneIds) {
    const errors = [];
    const state = createState(raw, validZoneIds);
    const valid = validZoneIds ? new Set(validZoneIds.map(String)) : null;
    if (state.schema !== SCHEMA || state.version !== VERSION) errors.push('invalid-root-schema');
    for (const [zoneId, zone] of Object.entries(state.zones)) {
      if (valid && !valid.has(zoneId)) errors.push(`unknown-zone:${zoneId}`);
      for (const [id, entity] of Object.entries(zone.entities)) {
        if (!id) errors.push(`${zoneId}:empty-entity-id`);
        if (!POLICIES.includes(entity.policy)) errors.push(`${zoneId}:${id}:invalid-policy`);
        if (!COLLECTIONS.includes(entity.collection)) errors.push(`${zoneId}:${id}:invalid-collection`);
      }
    }
    return Object.freeze({
      ok: errors.length === 0,
      errors: Object.freeze(errors),
      zones: Object.keys(state.zones).length,
      entityDeltas: Object.values(state.zones).reduce((total, zone) => total + Object.keys(zone.entities).length, 0),
      revision: state.revision,
    });
  }

  root.BladefallZoneState = Object.freeze({
    SCHEMA, VERSION, POLICIES, COLLECTIONS,
    createState,
    migrate: migration,
    enter,
    discoverCell,
    openShortcut,
    discoverSecret,
    setCircuit,
    setEncounter,
    capture,
    hydrate,
    resetOnRest,
    openedConnectors,
    validate,
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
