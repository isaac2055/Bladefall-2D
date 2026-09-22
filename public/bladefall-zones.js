(function installBladefallZones(root) {
  'use strict';

  const progression = root.BladefallProgression;
  if (!progression) throw new Error('BladefallZones requires BladefallProgression');

  const SCHEMA = 'bladefall.stream-zone';
  const VERSION = 1;
  const CELL_WIDTH = 1024;
  const ZONE_BOTTOM = -400;
  const ZONE_TOP = 4200;
  const TRIGGER_DEPTH = 96;
  const ARRIVAL_NEAR = 180;
  const ARRIVAL_FAR = 300;
  const PRELOAD_DISTANCE = 1400;

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

  function rect(x1, y1, x2, y2) {
    return { x1: Math.min(x1, x2), y1: Math.min(y1, y2), x2: Math.max(x1, x2), y2: Math.max(y1, y2) };
  }

  function center(area) {
    return { x: (area.x1 + area.x2) / 2, y: (area.y1 + area.y2) / 2 };
  }

  function contains(bounds, area) {
    return area.x1 >= bounds.x1 && area.x2 <= bounds.x2 && area.y1 >= bounds.y1 && area.y2 <= bounds.y2;
  }

  function overlaps(a, b) {
    return a.x1 < b.x2 && a.x2 > b.x1 && a.y1 < b.y2 && a.y2 > b.y1;
  }

  function distance(a, b) {
    const ac = center(a);
    const bc = center(b);
    return Math.hypot(ac.x - bc.x, ac.y - bc.y);
  }

  function boundsFor(zoneId) {
    const zone = progression.zone(zoneId);
    return rect(0, ZONE_BOTTOM, zone.budget.targetLength, ZONE_TOP);
  }

  function endpointGeometry(zoneId, side, offset) {
    const bounds = boundsFor(zoneId);
    const along = Math.max(0.12, Math.min(0.88, Number(offset) || 0.5));
    const x = bounds.x1 + (bounds.x2 - bounds.x1) * along;
    const y = bounds.y1 + (bounds.y2 - bounds.y1) * along;
    if (side === 'west') return {
      trigger: rect(bounds.x1, -80, bounds.x1 + TRIGGER_DEPTH, 160),
      safeArrival: rect(bounds.x1 + ARRIVAL_NEAR, -60, bounds.x1 + ARRIVAL_FAR, 140),
      inward: { x: 1, y: 0 },
      preload: rect(bounds.x1, ZONE_BOTTOM, Math.min(bounds.x2, bounds.x1 + PRELOAD_DISTANCE), ZONE_TOP),
    };
    if (side === 'east') return {
      trigger: rect(bounds.x2 - TRIGGER_DEPTH, -80, bounds.x2, 160),
      safeArrival: rect(bounds.x2 - ARRIVAL_FAR, -60, bounds.x2 - ARRIVAL_NEAR, 140),
      inward: { x: -1, y: 0 },
      preload: rect(Math.max(bounds.x1, bounds.x2 - PRELOAD_DISTANCE), ZONE_BOTTOM, bounds.x2, ZONE_TOP),
    };
    if (side === 'north') return {
      trigger: rect(x - 120, bounds.y2 - TRIGGER_DEPTH, x + 120, bounds.y2),
      safeArrival: rect(x - 100, bounds.y2 - ARRIVAL_FAR, x + 100, bounds.y2 - ARRIVAL_NEAR),
      inward: { x: 0, y: -1 },
      preload: rect(Math.max(bounds.x1, x - PRELOAD_DISTANCE), Math.max(bounds.y1, bounds.y2 - PRELOAD_DISTANCE), Math.min(bounds.x2, x + PRELOAD_DISTANCE), bounds.y2),
    };
    if (side === 'south') return {
      trigger: rect(x - 120, bounds.y1, x + 120, bounds.y1 + TRIGGER_DEPTH),
      safeArrival: rect(x - 100, bounds.y1 + ARRIVAL_NEAR, x + 100, bounds.y1 + ARRIVAL_FAR),
      inward: { x: 0, y: 1 },
      preload: rect(Math.max(bounds.x1, x - PRELOAD_DISTANCE), bounds.y1, Math.min(bounds.x2, x + PRELOAD_DISTANCE), Math.min(bounds.y2, bounds.y1 + PRELOAD_DISTANCE)),
    };
    throw new Error(`Unknown connector side: ${side}`);
  }

  function makeEndpoint(connectorId, zoneId, side, activation, offset) {
    const geometry = endpointGeometry(zoneId, side, offset);
    return {
      id: `${connectorId}:${zoneId}`,
      connectorId,
      zoneId,
      side,
      activation,
      trigger: geometry.trigger,
      safeArrival: geometry.safeArrival,
      inward: geometry.inward,
      preloadRegion: geometry.preload,
      spawn: { ...center(geometry.safeArrival), facing: geometry.inward.x || 1 },
      cameraHandoff: { focus: center(geometry.safeArrival), settleSeconds: 0.28, preserveLookAhead: true },
      retriggerLock: { releaseDistance: 128, releaseSeconds: 0.35 },
    };
  }

  const seamSpecs = [
    ['outskirts-black-woods', 'outskirts', 'east', 'walk', 0.5, 'black-woods', 'west', 'walk', 0.5],
    ['black-woods-brute', 'black-woods', 'east', 'walk', 0.5, 'brute', 'west', 'walk', 0.5],
    ['black-woods-updrafts', 'black-woods', 'north', 'climb', 0.28, 'updrafts', 'south', 'climb', 0.35],
    ['updrafts-marksman', 'updrafts', 'east', 'walk', 0.5, 'hollow-marksman', 'west', 'walk', 0.5],
    ['marksman-keep', 'hollow-marksman', 'east', 'interact', 0.5, 'ruined-keep', 'west', 'interact', 0.5],
    ['outskirts-warden', 'outskirts', 'west', 'climb', 0.5, 'warden', 'east', 'climb', 0.5],
    ['warden-frostfell', 'warden', 'south', 'climb', 0.55, 'frostfell', 'north', 'climb', 0.45],
    ['brute-sorcerer', 'brute', 'north', 'climb', 0.78, 'frost-sorcerer', 'south', 'climb', 0.3],
    ['frostfell-sorcerer', 'frostfell', 'east', 'walk', 0.5, 'frost-sorcerer', 'west', 'walk', 0.5],
    ['sorcerer-emberdeep', 'frost-sorcerer', 'east', 'interact', 0.5, 'emberdeep', 'west', 'interact', 0.5],
    ['emberdeep-colossus', 'emberdeep', 'east', 'command', 0.5, 'ember-colossus', 'west', 'walk', 0.5],
    // The Foundry leaves through its own floor. The drawn map puts the Inversion
    // directly BENEATH the Foundry, so the fissure is a south edge at the works'
    // east end and the Inversion is entered from its north.
    ['colossus-inversion', 'ember-colossus', 'south', 'plunge', 0.88, 'inversion', 'north', 'emerge', 0.12],
    // The Inversion is walked right to left, so its onward gate is its WEST edge and
    // the Citadel is entered from the east.
    ['inversion-tyrant', 'inversion', 'west', 'walk', 0.5, 'void-tyrant', 'east', 'walk', 0.5],
    // The Citadel is walked right to left as well: the Throne Gate is its west edge.
    ['tyrant-king', 'void-tyrant', 'west', 'interact', 0.5, 'abyss-king', 'west', 'interact', 0.5],
    // The King's hall lets out onto the rail head, and the rail surfaces under the
    // Ruined Keep's east side — the truth route ends beneath the regions it began in.
    ['king-deep-line', 'abyss-king', 'east', 'ride', 0.5, 'deep-line', 'west', 'ride', 0.5],
    ['deep-line-keep', 'deep-line', 'east', 'ride', 0.5, 'ruined-keep', 'east', 'ride', 0.5],
  ];

  const seams = seamSpecs.map(([id, zoneA, sideA, activationA, offsetA, zoneB, sideB, activationB, offsetB]) => {
    const contract = progression.connector(id);
    if (!contract) throw new Error(`Unknown progression connector: ${id}`);
    return {
      schema: 'bladefall.physical-seam', version: 1, id,
      form: contract.form,
      physical: true,
      transitionPortal: false,
      endpoints: [
        makeEndpoint(id, zoneA, sideA, activationA, offsetA),
        makeEndpoint(id, zoneB, sideB, activationB, offsetB),
      ],
      gate: {
        capabilities: [...contract.requirements],
        bossClear: contract.bossClear || null,
        requiredKeys: contract.requiredKeys || null,
        initiallySealed: !!contract.initiallySealed,
        opensFrom: contract.opensFrom || null,
      },
      returnGuarantee: {
        strategy: contract.initiallySealed ? 'open-permanently-then-same-seam' : 'same-seam',
        capabilityIsPermanent: true,
        consumesResource: false,
        oneWayDrop: false,
      },
      streaming: {
        preloadDistance: PRELOAD_DISTANCE,
        retainSourceSeconds: 1.25,
        commitAt: 'arrival-ready',
        rollbackOnFailure: true,
      },
    };
  });

  const endpointById = new Map();
  const seamById = new Map();
  for (const seam of seams) {
    seamById.set(seam.id, seam);
    for (const endpoint of seam.endpoints) endpointById.set(endpoint.id, endpoint);
  }

  const zones = progression.zones.map((source) => {
    const bounds = boundsFor(source.id);
    const entrances = seams.flatMap((seam) => seam.endpoints.filter((endpoint) => endpoint.zoneId === source.id).map((endpoint) => endpoint.id));
    const cells = [];
    for (let x = bounds.x1, index = 0; x < bounds.x2; x += CELL_WIDTH, index++) {
      cells.push({ id: `${source.id}:cell-${index}`, index, bounds: rect(x, bounds.y1, Math.min(bounds.x2, x + CELL_WIDTH), bounds.y2) });
    }
    return {
      schema: SCHEMA,
      version: VERSION,
      id: source.id,
      stageIndex: source.stageIndex,
      name: source.name,
      role: source.role,
      worldPosition: clone(source.position),
      localBounds: bounds,
      streamCells: cells,
      entrances,
      persistenceNamespace: `zone:${source.id}`,
      authoring: {
        targetLength: source.budget.targetLength,
        firstVisitMinutes: source.budget.firstVisitMinutes,
        practicedMinutes: source.budget.practicedMinutes,
        geometryStatus: source.id === 'outskirts' || source.id === 'black-woods' || source.id === 'brute'
          ? 'authored' : 'shell-until-dedicated-level-runs',
      },
    };
  });

  const zoneById = new Map(zones.map((zone) => [zone.id, zone]));

  function normalizeState(source) {
    const input = source && typeof source === 'object' ? source : {};
    return {
      capabilities: new Set(Array.isArray(input.capabilities) ? input.capabilities : []),
      clearedZones: new Set(Array.isArray(input.clearedZones) ? input.clearedZones : []),
      vaultKeys: new Set(Array.isArray(input.vaultKeys) ? input.vaultKeys : []),
      openedConnectors: new Set(Array.isArray(input.openedConnectors) ? input.openedConnectors : []),
    };
  }

  function otherEndpoint(seam, zoneId) {
    return seam.endpoints.find((endpoint) => endpoint.zoneId !== zoneId) || null;
  }

  function eligibility(connectorId, fromZoneId, sourceState) {
    const seam = seamById.get(connectorId);
    if (!seam) return Object.freeze({ allowed: false, reason: 'unknown-connector' });
    const source = seam.endpoints.find((endpoint) => endpoint.zoneId === fromZoneId);
    if (!source) return Object.freeze({ allowed: false, reason: 'wrong-source-zone' });
    const state = normalizeState(sourceState);
    const missing = seam.gate.capabilities.filter((id) => !state.capabilities.has(id));
    if (missing.length) return Object.freeze({ allowed: false, reason: 'capability-required', missing: Object.freeze(missing) });
    /*   A SEAM YOU HAVE ALREADY CROSSED IS A ROAD YOU HAVE WON.
       Owner: "even though I have all three ship parts, when I go back through the deep
       line, it says 'the threshold does not know this road is won' when trying to return
       to abyss king level from ruined keep."
         He had won it. `king-deep-line` is gated on clearing 'abyss-king', and the only
       writer of that fact is recordWorldClear(), which refuses whenever
       G.worldProgressEligible is false — Level Select, NG+, a test run — and which also
       refuses a world node that was never marked `visited`, a state any warp or resumed
       save can produce. So the evidence of the kill can be missing from a save belonging
       to a player who plainly did the killing.
         `openedConnectors` cannot lie the same way: it is written by the crossing itself.
       You reach the Deep Line's west end only by leaving the Throne through this seam,
       and physicalSeamSpec refuses to open that while the King still stands. Having
       crossed it once is therefore strictly stronger proof than the flag it replaces. */
    if (seam.gate.bossClear && !state.clearedZones.has(seam.gate.bossClear)
        && !state.openedConnectors.has(seam.id)) {
      return Object.freeze({ allowed: false, reason: 'boss-clear-required', boss: seam.gate.bossClear });
    }
    if (seam.gate.requiredKeys === 'all') {
      const missingKeys = progression.keys.map((key) => key.id).filter((id) => !state.vaultKeys.has(id));
      if (missingKeys.length) return Object.freeze({ allowed: false, reason: 'vault-keys-required', missing: Object.freeze(missingKeys) });
    }
    if (seam.gate.initiallySealed && !state.openedConnectors.has(seam.id) && fromZoneId !== seam.gate.opensFrom) {
      return Object.freeze({ allowed: false, reason: 'sealed-from-this-side', opensFrom: seam.gate.opensFrom });
    }
    return Object.freeze({ allowed: true, reason: 'ready' });
  }

  function planTransition(connectorId, fromZoneId, sourceState) {
    const check = eligibility(connectorId, fromZoneId, sourceState);
    if (!check.allowed) return Object.freeze({ ok: false, ...check });
    const seam = seamById.get(connectorId);
    const source = seam.endpoints.find((endpoint) => endpoint.zoneId === fromZoneId);
    const target = otherEndpoint(seam, fromZoneId);
    return deepFreeze({
      ok: true,
      connectorId,
      sourceZoneId: fromZoneId,
      targetZoneId: target.zoneId,
      sourceEndpointId: source.id,
      targetEndpointId: target.id,
      activation: source.activation,
      preload: { zoneId: target.zoneId, region: clone(target.preloadRegion), distance: seam.streaming.preloadDistance },
      arrival: {
        spawn: clone(target.spawn),
        safeRegion: clone(target.safeArrival),
        inward: clone(target.inward),
        cameraHandoff: clone(target.cameraHandoff),
        retriggerLock: clone(target.retriggerLock),
      },
      retention: { sourceZoneId: fromZoneId, seconds: seam.streaming.retainSourceSeconds },
      commitAt: seam.streaming.commitAt,
      rollbackOnFailure: seam.streaming.rollbackOnFailure,
      opensConnector: seam.gate.initiallySealed ? seam.id : null,
    });
  }

  function validateZone(zone) {
    const errors = [];
    if (!zone || zone.schema !== SCHEMA || zone.version !== VERSION) errors.push('invalid-zone-schema');
    if (!zoneById.has(zone?.id)) errors.push('unknown-zone');
    if (!zone?.localBounds || zone.localBounds.x2 <= zone.localBounds.x1 || zone.localBounds.y2 <= zone.localBounds.y1) errors.push('invalid-local-bounds');
    if (!Array.isArray(zone?.streamCells) || !zone.streamCells.length) errors.push('zone-requires-stream-cells');
    if (!Array.isArray(zone?.entrances)) errors.push('zone-requires-entrances');
    for (const id of zone?.entrances || []) {
      const endpoint = endpointById.get(id);
      if (!endpoint || endpoint.zoneId !== zone.id) errors.push(`invalid-entrance:${id}`);
      else {
        if (!contains(zone.localBounds, endpoint.trigger)) errors.push(`trigger-out-of-bounds:${id}`);
        if (!contains(zone.localBounds, endpoint.safeArrival)) errors.push(`arrival-out-of-bounds:${id}`);
        if (overlaps(endpoint.trigger, endpoint.safeArrival)) errors.push(`arrival-overlaps-trigger:${id}`);
        if (distance(endpoint.trigger, endpoint.safeArrival) < 120) errors.push(`arrival-too-close:${id}`);
      }
    }
    return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors) });
  }

  function validateCatalog() {
    const errors = [];
    if (zones.length !== progression.zones.length || seams.length !== progression.connectors.length) errors.push('catalog-must-cover-constitution');
    if (zoneById.size !== zones.length || seamById.size !== seams.length || endpointById.size !== seams.length * 2) errors.push('catalog-ids-must-be-unique');
    for (const zone of zones) for (const error of validateZone(zone).errors) errors.push(`${zone.id}:${error}`);
    for (const seam of seams) {
      const expected = progression.connector(seam.id);
      if (!expected) errors.push(`${seam.id}:missing-constitution-connector`);
      if (seam.endpoints.length !== 2 || new Set(seam.endpoints.map((endpoint) => endpoint.zoneId)).size !== 2) errors.push(`${seam.id}:requires-two-distinct-endpoints`);
      if (!seam.physical || seam.transitionPortal || /portal/i.test(seam.form)) errors.push(`${seam.id}:level-transition-cannot-be-a-portal`);
      if (seam.returnGuarantee.consumesResource || seam.returnGuarantee.oneWayDrop) errors.push(`${seam.id}:return-path-not-guaranteed`);
      if (seam.streaming.commitAt !== 'arrival-ready' || !seam.streaming.rollbackOnFailure) errors.push(`${seam.id}:unsafe-stream-commit`);
      if (expected && JSON.stringify(expected.requirements) !== JSON.stringify(seam.gate.capabilities)) errors.push(`${seam.id}:capability-gate-drift`);
    }
    return Object.freeze({
      ok: errors.length === 0,
      errors: Object.freeze(errors),
      zones: zones.length,
      seams: seams.length,
      endpoints: endpointById.size,
      streamCells: zones.reduce((total, zone) => total + zone.streamCells.length, 0),
    });
  }

  root.BladefallZones = Object.freeze({
    SCHEMA, VERSION,
    constants: Object.freeze({ CELL_WIDTH, PRELOAD_DISTANCE, TRIGGER_DEPTH }),
    zones: deepFreeze(zones.map(clone)),
    seams: deepFreeze(seams.map(clone)),
    zone: (id) => zoneById.get(id) || null,
    seam: (id) => seamById.get(id) || null,
    endpoint: (id) => endpointById.get(id) || null,
    eligibility,
    planTransition,
    validateZone,
    validateCatalog,
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
