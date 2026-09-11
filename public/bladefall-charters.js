(function installBladefallCharters(root) {
  'use strict';

  const SCHEMA_ID = 'bladefall.level-charter';
  const SCHEMA_VERSION = 1;
  const PHASES = Object.freeze(['P', 'G', 'C', 'V']);
  const ROUTES = Object.freeze(['fresh', 'revisit', 'optional', 'speedrun']);
  const DYNAMIC_PATTERN = /portal|moving|wind|airflow|thermal|updraft|water|cistern|lava|gravity|minecart|collapsing|pendulum|rotor|current|furnace/i;
  const HAZARD_TYPES = new Set(['spikes', 'trap', 'fluid', 'pit', 'rotor', 'pendulum', 'gravityWell']);
  const CRITICAL_TYPES = new Set([
    'door', 'plate', 'lever', 'lportal', 'runeEmitter', 'runeReceiver',
    'spellSiphon', 'forgeCoolant', 'echoSigil', 'vault', 'secretdoor',
  ]);
  const SUPPORT_TYPES = new Set(['shop', 'traveler', 'escort']);

  function clone(value) {
    if (Array.isArray(value)) return value.map(clone);
    if (!value || typeof value !== 'object') return value;
    const output = {};
    for (const [key, item] of Object.entries(value)) output[key] = clone(item);
    return output;
  }

  function freeze(value) {
    if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
    Object.freeze(value);
    for (const item of Object.values(value)) freeze(item);
    return value;
  }

  function phase(id, status, evidence) {
    const requirements = {
      P: ['assembled runtime capture', 'room map', 'fresh/revisit/optional/speedrun route intent', 'dynamic evidence plan'],
      G: ['room-owned geometry', 'supported fixtures', 'contained fluids', 'safe entrance and recovery'],
      C: ['authored people and place', 'story/quest/shop continuity', 'revisit state'],
      V: ['route receipts', 'failure/reset/success recordings', 'visual review', 'single-player review'],
    };
    return { id, status: status || 'pending', requirements: requirements[id].slice(), evidence: (evidence || []).slice() };
  }

  function createCharter(blueprint) {
    if (!blueprint) return null;
    const dynamicSystems = blueprint.systems.filter((system) => DYNAMIC_PATTERN.test(system));
    const planning = blueprint.charter && blueprint.charter.planningComplete;
    const geometryComplete = blueprint.charter && blueprint.charter.geometryComplete;
    const contentComplete = blueprint.charter && blueprint.charter.contentComplete;
    const planningEvidence = planning ? [
      'assembled runtime capture', 'room map',
      'fresh/revisit/optional/speedrun route intent', 'dynamic evidence plan',
    ] : [];
    return freeze({
      schema: SCHEMA_ID,
      version: SCHEMA_VERSION,
      id: blueprint.id,
      index: blueprint.index,
      name: blueprint.stage.name,
      source: blueprint.source,
      promise: blueprint.signature,
      signature: blueprint.signature,
      primaryMechanic: blueprint.systems[0] || null,
      portalVerb: blueprint.portalVerb || blueprint.portalTrial || null,
      pacing: blueprint.charter ? {
        firstRunMinutes: blueprint.charter.firstRunMinutes.slice(),
        speedrunMinutes: blueprint.charter.speedrunMinutes.slice(),
      } : null,
      planningReceipt: blueprint.charter ? blueprint.charter.evidence : null,
      systems: blueprint.systems.slice(),
      rooms: blueprint.acts.map((name, index) => ({
        id: `act-${String(index + 1).padStart(2, '0')}`,
        name,
        owner: `${blueprint.id}:${String(index + 1).padStart(2, '0')}`,
        status: geometryComplete ? 'assembled' : 'planned',
        bounds: blueprint.charter && blueprint.charter.roomSpans
          ? { start: blueprint.charter.roomSpans[index][0], end: blueprint.charter.roomSpans[index][1] }
          : null,
        focalX: blueprint.charter && blueprint.charter.roomFocals
          ? blueprint.charter.roomFocals[index] : null,
      })),
      constraints: {
        noGenericGameplayGeometry: true,
        explicitCriticalOwnership: true,
        supportedFixtures: true,
        containedFluids: true,
        safeEntranceRadius: 260,
        safeExitRadius: 160,
      },
      routes: ROUTES.map((id) => ({ id, status: 'planned', receipt: null })),
      dynamicEvidence: dynamicSystems.map((system) => ({
        system,
        required: ['setup', 'failure', 'recovery', 'success'],
        receipts: [],
      })),
      phases: PHASES.map((id) => {
        const complete = id === 'P' ? planning : id === 'G' ? geometryComplete : id === 'C' ? contentComplete : false;
        const evidence = id === 'P' ? planningEvidence : id === 'G' && geometryComplete
          ? ['room-owned geometry', 'supported fixtures', 'contained fluids', 'safe entrance and recovery']
          : id === 'C' && contentComplete
            ? ['authored people and place', 'story/quest/shop continuity', 'revisit state'] : [];
        return phase(id, complete ? 'complete' : 'pending', evidence);
      }),
    });
  }

  function catalog(blueprints) {
    return (blueprints || []).map(createCharter);
  }

  function issue(severity, code, path, message, data) {
    return Object.assign({ severity, code, path, message }, data || {});
  }

  function validateCharter(input) {
    const errors = [], warnings = [];
    const add = (severity, code, path, message) =>
      (severity === 'error' ? errors : warnings).push(issue(severity, code, path, message));
    if (!input || typeof input !== 'object') {
      add('error', 'charter.type', '$', 'Level charter must be an object.');
      return { ok: false, errors, warnings };
    }
    if (input.schema !== SCHEMA_ID) add('error', 'charter.schema', 'schema', `Expected ${SCHEMA_ID}.`);
    if (input.version !== SCHEMA_VERSION) add('error', 'charter.version', 'version', `Expected charter version ${SCHEMA_VERSION}.`);
    if (!input.id || !input.name || !input.promise) add('error', 'charter.identity', '$', 'Charter identity and promise are required.');
    if (!Array.isArray(input.rooms) || input.rooms.length < 3) add('error', 'charter.rooms', 'rooms', 'At least three owned rooms are required.');
    if (new Set((input.rooms || []).map((room) => room.owner)).size !== (input.rooms || []).length) {
      add('error', 'charter.room-owner.duplicate', 'rooms', 'Every room must have a unique owner.');
    }
    const routes = new Set((input.routes || []).map((route) => route.id));
    for (const route of ROUTES) if (!routes.has(route)) add('error', 'charter.route.missing', 'routes', `Missing ${route} route.`);
    const phases = new Set((input.phases || []).map((item) => item.id));
    for (const id of PHASES) if (!phases.has(id)) add('error', 'charter.phase.missing', 'phases', `Missing ${id} phase gate.`);
    return { ok: errors.length === 0, errors, warnings };
  }

  function bounds(record) {
    const width = Math.max(0, Number(record.w) || 0);
    return { left: Number(record.x) - width / 2, right: Number(record.x) + width / 2 };
  }

  function supported(record, platforms) {
    const x = Number(record.x), y = Number(record.y) || 0;
    return platforms.some((platform) => {
      const span = bounds(platform);
      return x >= span.left - 8 && x <= span.right + 8 && Math.abs((Number(platform.y) || 0) - y) <= 28;
    });
  }

  function auditGeometry(manifest, charter) {
    const errors = [], warnings = [], collections = ['objects', 'enemies', 'pickups', 'travelers'];
    const add = (severity, code, path, message, data) =>
      (severity === 'error' ? errors : warnings).push(issue(severity, code, path, message, data));
    if (!manifest || !charter) {
      add('error', 'audit.input', '$', 'An assembled manifest and charter are required.');
      return { ok: false, errors, warnings, counts: {} };
    }
    const roomOwners = new Set(charter.rooms.map((room) => room.owner));
    const platforms = (manifest.objects || []).filter((record) => record.type === 'plat' && !record.fake && !record.gone);
    let owned = 0, total = 0, critical = 0, containedFluids = 0;
    for (const collection of collections) {
      for (let index = 0; index < (manifest[collection] || []).length; index++) {
        const record = manifest[collection][index], path = `${collection}[${index}]`;
        total++;
        if (!record.authoringOwner || !record.authoringRoom) {
          add('error', 'geometry.owner.missing', path, 'Assembled entity lacks authoring owner or room.');
        } else {
          owned++;
          if (!roomOwners.has(record.authoringRoom)) add('error', 'geometry.room.unknown', path, `Unknown room owner ${record.authoringRoom}.`);
        }
        if (!Number.isFinite(record.x) || !Number.isFinite(record.y)) add('error', 'geometry.position', path, 'Coordinates must be finite.');
        if (record.x < -200 || record.x > manifest.meta.length + 500) add('warning', 'geometry.bounds', path, 'Entity extends beyond review bounds.');
        if (record.campaignComposition || record.run8Showcase) add('error', 'geometry.generic-gameplay', path, 'Generic passes may not add gameplay geometry.');
        if (CRITICAL_TYPES.has(record.type) || record.authoringCritical) critical++;
        if (record.type === 'fluid') {
          if (record.contained === true && record.basinId) containedFluids++;
          else add('error', 'fluid.containment', path, 'Fluid requires an authored basinId and contained=true.');
        }
        if ((collection === 'travelers' || SUPPORT_TYPES.has(record.type)) && !supported(record, platforms)) {
          add('error', 'fixture.support', path, 'Fixture or traveler has no stable supporting platform.');
        }
      }
    }
    const safeRadius = charter.constraints.safeEntranceRadius;
    for (const object of manifest.objects || []) {
      if (HAZARD_TYPES.has(object.type) && Math.abs(object.x - manifest.start.x) < safeRadius) {
        add('error', 'entrance.hazard', object.id, 'Hazard intrudes into the entrance safety radius.');
      }
    }
    for (const enemy of manifest.enemies || []) {
      if (Math.abs(enemy.x - manifest.start.x) < safeRadius) add('error', 'entrance.enemy', enemy.id, 'Enemy intrudes into the entrance safety radius.');
    }
    const counts = { total, owned, critical, fluids: (manifest.objects || []).filter((item) => item.type === 'fluid').length, containedFluids };
    return { ok: errors.length === 0, errors, warnings, counts, ownershipCoverage: total ? owned / total : 1 };
  }

  function evidencePlan(charter) {
    if (!charter) return null;
    return {
      charterId: charter.id,
      stills: ['entrance', ...charter.rooms.map((room) => room.id), 'exit'],
      routes: charter.routes.map((route) => route.id),
      dynamics: charter.dynamicEvidence.map((entry) => ({ system: entry.system, receipts: entry.required.slice() })),
      review: ['geometry ownership', 'visual coherence', 'readability', 'failure recovery', 'single-player playability'],
    };
  }

  function phaseGate(charter, phaseId, receipt) {
    const phaseRecord = charter && charter.phases.find((item) => item.id === phaseId);
    const evidence = receipt && Array.isArray(receipt.evidence) ? receipt.evidence : [];
    const missing = phaseRecord ? phaseRecord.requirements.filter((requirement) => !evidence.includes(requirement)) : [];
    return { ok: !!phaseRecord && missing.length === 0, phase: phaseId, missing };
  }

  root.BladefallCharters = Object.freeze({
    schema: Object.freeze({ id: SCHEMA_ID, version: SCHEMA_VERSION }),
    phases: PHASES,
    routes: ROUTES,
    createCharter,
    catalog,
    validateCharter,
    auditGeometry,
    evidencePlan,
    phaseGate,
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
