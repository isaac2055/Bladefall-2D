(function installBladefallAuthoring(root) {
  'use strict';

  const SCHEMA_ID = 'bladefall.level';
  const SCHEMA_VERSION = 1;
  const COLLECTIONS = Object.freeze(['objects', 'enemies', 'pickups', 'travelers']);
  const CONTROLLER_TYPES = new Set([
    'lever', 'plate', 'runeEmitter', 'runeReceiver', 'spellSiphon',
    'forgeCoolant', 'echoSigil', 'railSwitch', 'storyGate',
  ]);
  const TARGET_TYPES = new Set(['door', 'runeReceiver', 'vault']);
  const HAZARD_TYPES = new Set([
    'spikes', 'trap', 'furnaceJet', 'wallSpikes', 'fluid', 'pit', 'rotor',
    'pendulum', 'gravityWell',
  ]);
  const REQUIRED_TYPES = new Set([
    'coin', 'check', 'lever', 'plate', 'runeEmitter', 'runeReceiver',
    'spellSiphon', 'forgeCoolant', 'echoSigil', 'vault',
  ]);
  const RUNTIME_ONLY = new Set([
    'active', 'dead', 'gone', 'taken', 'opened', 'flash', 'flashT', 'hitFlash',
    'timer', 'cool', 'cooldown', 'shootT', 'atkTimer', 'bob', 'vy', 'vx',
    'onGround', 'floorPlat', 'envVx', 'hurtKb', 'lunge', 'down', 'pressed',
  ]);

  const schema = Object.freeze({
    id: SCHEMA_ID,
    version: SCHEMA_VERSION,
    collections: COLLECTIONS,
    required: Object.freeze({
      root: Object.freeze(['schema', 'version', 'id', 'meta', 'start', 'exit']),
      meta: Object.freeze(['name', 'theme', 'length']),
      entity: Object.freeze(['id', 'type', 'x', 'y']),
    }),
  });

  function isObject(value) {
    return !!value && typeof value === 'object' && !Array.isArray(value);
  }

  function clone(value) {
    if (Array.isArray(value)) return value.map(clone);
    if (!isObject(value)) return value;
    const output = {};
    for (const [key, item] of Object.entries(value)) output[key] = clone(item);
    return output;
  }

  function serializable(value, depth) {
    if (depth > 5 || value == null) return value == null ? null : undefined;
    if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
    if (typeof value === 'string' || typeof value === 'boolean') return value;
    if (typeof value === 'function') return undefined;
    if (Array.isArray(value)) {
      return value.map((item) => serializable(item, depth + 1))
        .filter((item) => item !== undefined);
    }
    if (!isObject(value)) return undefined;
    const output = {};
    for (const key of Object.keys(value).sort()) {
      if (RUNTIME_ONLY.has(key) || key[0] === '_') continue;
      const item = serializable(value[key], depth + 1);
      if (item !== undefined) output[key] = item;
    }
    return output;
  }

  function slug(value) {
    return String(value || 'untitled')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'untitled';
  }

  function number(value, fallback) {
    const result = Number(value);
    return Number.isFinite(result) ? result : fallback;
  }

  function normalizeEntity(record, prefix, index) {
    const output = isObject(record) ? clone(record) : {};
    output.id = String(output.id || `${prefix}-${String(index + 1).padStart(3, '0')}`);
    output.type = String(output.type || output.t || output.kind || 'unknown');
    output.x = number(output.x, 0);
    output.y = number(output.y, 0);
    delete output.t;
    return output;
  }

  function migrateManifest(input) {
    const source = isObject(input) ? clone(input) : {};
    if (source.schema === SCHEMA_ID && number(source.version, 0) === SCHEMA_VERSION) return source;
    const legacy = source.stage || source.meta || {};
    return {
      schema: SCHEMA_ID,
      version: SCHEMA_VERSION,
      id: source.id || slug(legacy.name || source.name),
      meta: {
        name: legacy.name || source.name || 'Untitled',
        theme: legacy.theme || source.theme || 'plains',
        length: number(legacy.length != null ? legacy.length : legacy.len, 1200),
        stageIndex: number(legacy.stageIndex, 0),
        source: 'migrated',
      },
      start: clone(source.start || { x: 70, y: 0 }),
      exit: clone(source.exit || source.portal || { type: 'portal', x: number(legacy.length || legacy.len, 1200), y: 0 }),
      objects: clone(source.objects || []),
      enemies: clone(source.enemies || source.actors || []),
      pickups: clone(source.pickups || source.loot || []),
      travelers: clone(source.travelers || source.npcs || []),
      annotations: clone(source.annotations || {}),
    };
  }

  function normalizeManifest(input) {
    const source = migrateManifest(input);
    const meta = isObject(source.meta) ? source.meta : {};
    const length = Math.max(1, number(meta.length != null ? meta.length : meta.len, 1200));
    const output = {
      schema: SCHEMA_ID,
      version: SCHEMA_VERSION,
      id: String(source.id || slug(meta.name)),
      meta: Object.assign({}, clone(meta), {
        name: String(meta.name || 'Untitled'),
        theme: String(meta.theme || 'plains'),
        length,
      }),
      start: Object.assign({ x: 70, y: 0 }, clone(source.start || {})),
      exit: Object.assign({ type: 'portal', x: length, y: 0 }, clone(source.exit || {})),
      objects: [],
      enemies: [],
      pickups: [],
      travelers: [],
      annotations: isObject(source.annotations) ? clone(source.annotations) : {},
    };
    output.start.x = number(output.start.x, 70);
    output.start.y = number(output.start.y, 0);
    output.exit.x = number(output.exit.x, length);
    output.exit.y = number(output.exit.y, 0);
    for (const collection of COLLECTIONS) {
      output[collection] = (Array.isArray(source[collection]) ? source[collection] : [])
        .map((record, index) => normalizeEntity(record, collection.slice(0, -1), index));
    }
    return output;
  }

  function makeIssue(severity, code, path, message, data) {
    return Object.assign({ severity, code, path, message }, data || {});
  }

  function validateManifest(input) {
    const manifest = normalizeManifest(input);
    const errors = [];
    const warnings = [];
    const add = (severity, code, path, message, data) => {
      (severity === 'error' ? errors : warnings).push(makeIssue(severity, code, path, message, data));
    };

    if (!isObject(input)) add('error', 'manifest.type', '$', 'Level manifest must be an object.');
    if (input && input.schema && input.schema !== SCHEMA_ID) {
      add('error', 'manifest.schema', 'schema', `Expected schema "${SCHEMA_ID}".`);
    }
    if (input && input.version != null && number(input.version, -1) > SCHEMA_VERSION) {
      add('error', 'manifest.version.future', 'version', `Schema version ${input.version} is newer than this runtime.`);
    }
    if (!manifest.id) add('error', 'manifest.id', 'id', 'Level id is required.');
    if (!manifest.meta.name.trim()) add('error', 'meta.name', 'meta.name', 'Level name is required.');
    if (!Number.isFinite(manifest.meta.length) || manifest.meta.length <= 0) {
      add('error', 'meta.length', 'meta.length', 'Level length must be positive.');
    }

    const ids = new Map();
    for (const collection of COLLECTIONS) {
      const records = manifest[collection];
      for (let index = 0; index < records.length; index++) {
        const record = records[index];
        const path = `${collection}[${index}]`;
        if (!record.id) add('error', 'entity.id', `${path}.id`, 'Entity id is required.');
        if (ids.has(record.id)) {
          add('error', 'entity.id.duplicate', `${path}.id`, `Duplicate id "${record.id}".`, { related: ids.get(record.id) });
        } else ids.set(record.id, path);
        if (!record.type || record.type === 'unknown') {
          add('error', 'entity.type', `${path}.type`, 'Entity type is required.');
        }
        if (!Number.isFinite(record.x) || !Number.isFinite(record.y)) {
          add('error', 'entity.position', path, 'Entity coordinates must be finite.');
        }
        if (record.x < -1000 || record.x > manifest.meta.length + 1000) {
          add('warning', 'entity.out-of-bounds', `${path}.x`, 'Entity sits outside the authored level bounds.');
        }
        if (record.w != null && number(record.w, 0) <= 0) {
          add('error', 'entity.width', `${path}.w`, 'Entity width must be positive.');
        }
        if (record.h != null && number(record.h, 0) < 0) {
          add('error', 'entity.height', `${path}.h`, 'Entity height cannot be negative.');
        }
      }
    }

    const circuits = new Map();
    for (const object of manifest.objects) {
      const key = object.requiresCircuit != null ? object.requiresCircuit
        : object.circuit != null ? object.circuit : object.circuitId != null ? object.circuitId
        : CONTROLLER_TYPES.has(object.type) ? object.idRef || object.target || object.group : null;
      if (key == null) continue;
      if (!circuits.has(String(key))) circuits.set(String(key), { controllers: [], targets: [] });
      const bucket = circuits.get(String(key));
      if (CONTROLLER_TYPES.has(object.type) && object.requiresCircuit == null) bucket.controllers.push(object.id);
      if (TARGET_TYPES.has(object.type) || object.requiresCircuit != null) bucket.targets.push(object.id);
    }
    for (const [id, circuit] of circuits) {
      if (!circuit.controllers.length) {
        add('warning', 'circuit.controller.missing', `circuits.${id}`, `Circuit "${id}" has targets but no controller.`);
      }
      if (!circuit.targets.length) {
        add('warning', 'circuit.target.missing', `circuits.${id}`, `Circuit "${id}" has controllers but no target.`);
      }
    }

    const checkpoints = manifest.objects.filter((object) => object.type === 'check');
    if (manifest.meta.length > 2600 && !checkpoints.length) {
      add('warning', 'recovery.checkpoint.missing', 'objects', 'Long level has no authored checkpoint.');
    }
    if (manifest.exit.x < manifest.start.x) {
      add('warning', 'flow.reverse', 'exit.x', 'Exit is behind the player start.');
    }

    return {
      ok: errors.length === 0,
      manifest,
      errors,
      warnings,
      counts: {
        objects: manifest.objects.length,
        enemies: manifest.enemies.length,
        pickups: manifest.pickups.length,
        travelers: manifest.travelers.length,
        circuits: circuits.size,
      },
    };
  }

  function platformNode(object, index) {
    if (object.type !== 'plat' || object.fake || object.ceiling || object.invisible && !object.revealed) return null;
    const width = Math.max(1, number(object.w, 0));
    return {
      id: index,
      objectId: object.id,
      x: object.x,
      y: object.y,
      left: object.x - width / 2,
      right: object.x + width / 2,
      width,
    };
  }

  function gap(a, b) {
    if (a.right < b.left) return b.left - a.right;
    if (b.right < a.left) return a.left - b.right;
    return 0;
  }

  function buildTraversalGraph(input, options) {
    const manifest = normalizeManifest(input);
    const settings = Object.assign({
      stepHeight: 30,
      stepGap: 42,
      jumpHeight: 280,
      jumpDistance: 350,
      maxDrop: 650,
    }, options || {});
    const nodes = [];
    for (const object of manifest.objects) {
      const node = platformNode(object, nodes.length);
      if (node) nodes.push(node);
    }
    const edges = nodes.map(() => []);
    for (const from of nodes) {
      for (const to of nodes) {
        if (from === to) continue;
        const dx = gap(from, to);
        const rise = to.y - from.y;
        let type = null;
        if (dx <= settings.stepGap && Math.abs(rise) <= settings.stepHeight) type = 'walk';
        else if (dx <= settings.jumpDistance && rise <= settings.jumpHeight && rise >= -settings.maxDrop) {
          type = rise < -settings.stepHeight && dx <= settings.stepGap ? 'drop' : 'jump';
        }
        if (type) edges[from.id].push({ from: from.id, to: to.id, type, cost: Math.hypot(to.x - from.x, rise) });
      }
    }
    return { manifest, nodes, edges, settings };
  }

  function nearestNode(graph, point, maxY) {
    let best = null;
    let score = Infinity;
    for (const node of graph.nodes) {
      const dx = point.x < node.left ? node.left - point.x : point.x > node.right ? point.x - node.right : 0;
      const dy = Math.abs(point.y - node.y);
      if (maxY != null && dy > maxY) continue;
      const next = dx * 2 + dy;
      if (next < score) {
        score = next;
        best = node;
      }
    }
    return best;
  }

  function reachableNodes(graph, start) {
    const origin = nearestNode(graph, start, 180);
    const visited = new Set();
    if (!origin) return visited;
    const queue = [origin.id];
    visited.add(origin.id);
    while (queue.length) {
      const id = queue.shift();
      for (const edge of graph.edges[id]) {
        if (visited.has(edge.to)) continue;
        visited.add(edge.to);
        queue.push(edge.to);
      }
    }
    return visited;
  }

  function analyzeSoftlocks(input, options) {
    const graph = buildTraversalGraph(input, options);
    const manifest = graph.manifest;
    const reachable = reachableNodes(graph, manifest.start);
    const risks = [];
    const proofs = [];
    const unknowns = [];
    const exitNode = nearestNode(graph, manifest.exit, 220);
    const dynamic = manifest.objects.filter((object) =>
      object.type === 'lportal' || object.portalTruth || object.type === 'door' || object.move || object.crumble
      || object.type === 'updraft' || object.type === 'lowg' || object.type === 'spring');

    if (!graph.nodes.length) {
      risks.push(makeIssue('warning', 'softlock.no-surfaces', 'objects', 'No static traversal surfaces were found.', { confidence: 'high' }));
    } else if (!exitNode) {
      risks.push(makeIssue('warning', 'softlock.exit.unsupported', 'exit', 'Exit has no nearby static support.', { confidence: 'high' }));
    } else if (!reachable.has(exitNode.id)) {
      const issue = makeIssue('warning', 'softlock.exit.unproven', 'exit',
        'Static traversal graph cannot prove a route from start to exit.', {
          confidence: dynamic.length ? 'low' : 'high',
          dynamicDependencies: dynamic.map((item) => item.id),
        });
      (dynamic.length ? unknowns : risks).push(issue);
    } else {
      proofs.push({ code: 'route.start-to-exit', message: 'Static traversal route reaches the exit.', node: exitNode.id });
    }

    for (const collection of ['pickups', 'travelers']) {
      for (const record of manifest[collection]) {
        const node = nearestNode(graph, record, collection === 'travelers' ? 220 : 360);
        if (!node || !reachable.has(node.id)) {
          risks.push(makeIssue('warning', `softlock.${collection}.unreachable`, `${collection}.${record.id}`,
            `${collection === 'travelers' ? 'Traveler' : 'Pickup'} is not reachable in the static traversal graph.`, {
              confidence: dynamic.length ? 'low' : 'medium',
            }));
        }
      }
    }

    for (const object of manifest.objects.filter((item) => REQUIRED_TYPES.has(item.type))) {
      const node = nearestNode(graph, object, 360);
      if (!node || !reachable.has(node.id)) {
        unknowns.push(makeIssue('warning', 'softlock.required.unproven', `objects.${object.id}`,
          `Required ${object.type} is outside the proven static route.`, {
            confidence: dynamic.length ? 'low' : 'medium',
          }));
      }
    }

    return {
      safe: risks.every((risk) => risk.confidence !== 'high'),
      graph: { nodes: graph.nodes.length, edges: graph.edges.reduce((sum, list) => sum + list.length, 0), reachable: reachable.size },
      proofs,
      risks,
      unknowns,
    };
  }

  function encounterRole(enemy) {
    if (enemy.boss) return 'boss';
    if (enemy.aiRole) return enemy.aiRole;
    if (enemy.ranged) return 'artillery';
    if (enemy.kind === 'fly') return 'diver';
    return 'pursuer';
  }

  function threatValue(enemy) {
    if (enemy.boss) return 8;
    const role = encounterRole(enemy);
    const base = role === 'artillery' ? 2.2 : role === 'controller' ? 2 : role === 'diver' ? 1.7 : 1.35;
    return base * (enemy.elite ? 1.65 : 1);
  }

  function composeEncounters(input, options) {
    const manifest = normalizeManifest(input);
    const settings = Object.assign({ joinGap: 760, padding: 260 }, options || {});
    const enemies = manifest.enemies.slice().sort((a, b) => a.x - b.x || a.id.localeCompare(b.id));
    const groups = [];
    for (const enemy of enemies) {
      let group = groups[groups.length - 1];
      if (!group || enemy.x - group.lastX > settings.joinGap) {
        group = { index: groups.length, enemies: [], firstX: enemy.x, lastX: enemy.x };
        groups.push(group);
      }
      group.enemies.push(enemy);
      group.lastX = enemy.x;
    }
    return groups.map((group) => {
      const left = Math.max(0, group.firstX - settings.padding);
      const right = Math.min(manifest.meta.length, group.lastX + settings.padding);
      const hazards = manifest.objects.filter((item) => HAZARD_TYPES.has(item.type) && item.x >= left && item.x <= right);
      const rewards = manifest.pickups.filter((item) => item.x >= left && item.x <= right);
      const checkpoints = manifest.objects.filter((item) => item.type === 'check' && item.x >= left && item.x <= right);
      const roles = {};
      for (const enemy of group.enemies) {
        const role = encounterRole(enemy);
        roles[role] = (roles[role] || 0) + 1;
      }
      const pressure = +group.enemies.reduce((sum, enemy) => sum + threatValue(enemy), 0).toFixed(2);
      const issues = [];
      if (group.enemies.length > 7) issues.push('crowded');
      if ((roles.artillery || 0) > 2) issues.push('ranged-overload');
      if (pressure > 10 && !checkpoints.length) issues.push('recovery-gap');
      if (hazards.length > 3 && pressure > 6) issues.push('hazard-overload');
      return {
        id: `encounter-${String(group.index + 1).padStart(2, '0')}`,
        bounds: { left, right },
        enemyIds: group.enemies.map((enemy) => enemy.id),
        roles,
        pressure,
        hazards: hazards.map((item) => item.id),
        rewards: rewards.map((item) => item.id),
        checkpoints: checkpoints.map((item) => item.id),
        issues,
      };
    });
  }

  function analyzeManifest(input, options) {
    const validation = validateManifest(input);
    const softlocks = analyzeSoftlocks(validation.manifest, options && options.traversal);
    const encounters = composeEncounters(validation.manifest, options && options.encounters);
    const encounterWarnings = encounters.flatMap((encounter) => encounter.issues.map((code) =>
      makeIssue('warning', `encounter.${code}`, `encounters.${encounter.id}`,
        `Encounter "${encounter.id}" triggered ${code.replace(/-/g, ' ')}.`, { encounter: encounter.id })));
    return {
      ok: validation.ok && softlocks.safe,
      manifest: validation.manifest,
      validation,
      softlocks,
      encounters,
      summary: {
        errors: validation.errors.length,
        warnings: validation.warnings.length + softlocks.risks.length + softlocks.unknowns.length + encounterWarnings.length,
        encounters: encounters.length,
        maxPressure: encounters.reduce((max, encounter) => Math.max(max, encounter.pressure), 0),
        provenReachability: softlocks.graph.nodes ? softlocks.graph.reachable / softlocks.graph.nodes : 0,
      },
      encounterWarnings,
    };
  }

  function importManifest(text) {
    try {
      const raw = typeof text === 'string' ? JSON.parse(text) : text;
      const report = validateManifest(raw);
      return { ok: report.ok, manifest: report.manifest, report };
    } catch (error) {
      const issue = makeIssue('error', 'import.json', '$', error && error.message ? error.message : 'Invalid JSON.');
      return {
        ok: false,
        manifest: null,
        report: { ok: false, errors: [issue], warnings: [], counts: {} },
      };
    }
  }

  function exportManifest(input, pretty) {
    return JSON.stringify(normalizeManifest(input), null, pretty === false ? 0 : 2);
  }

  function compileManifest(input) {
    const report = validateManifest(input);
    if (!report.ok) {
      const error = new Error(`Cannot compile invalid level manifest (${report.errors.length} errors).`);
      error.report = report;
      throw error;
    }
    const manifest = report.manifest;
    return {
      stage: clone(manifest.meta),
      start: clone(manifest.start),
      exit: clone(manifest.exit),
      objects: manifest.objects.map(clone),
      enemies: manifest.enemies.map(clone),
      pickups: manifest.pickups.map(clone),
      travelers: manifest.travelers.map(clone),
    };
  }

  function createEditor(input) {
    let current = normalizeManifest(input || {});
    const undoStack = [];
    const redoStack = [];

    function commit(next) {
      undoStack.push(current);
      current = normalizeManifest(next);
      redoStack.length = 0;
      return snapshot();
    }

    function snapshot() {
      return clone(current);
    }

    function insert(collection, value) {
      if (!COLLECTIONS.includes(collection)) throw new Error(`Unknown collection "${collection}"`);
      const next = snapshot();
      next[collection].push(normalizeEntity(value, collection.slice(0, -1), next[collection].length));
      return commit(next);
    }

    function update(collection, id, patch) {
      if (!COLLECTIONS.includes(collection)) throw new Error(`Unknown collection "${collection}"`);
      const next = snapshot();
      const index = next[collection].findIndex((item) => item.id === id);
      if (index < 0) throw new Error(`Unknown ${collection} id "${id}"`);
      next[collection][index] = Object.assign({}, next[collection][index], clone(patch || {}), { id });
      return commit(next);
    }

    function remove(collection, id) {
      if (!COLLECTIONS.includes(collection)) throw new Error(`Unknown collection "${collection}"`);
      const next = snapshot();
      const index = next[collection].findIndex((item) => item.id === id);
      if (index < 0) throw new Error(`Unknown ${collection} id "${id}"`);
      next[collection].splice(index, 1);
      return commit(next);
    }

    function setMeta(patch) {
      const next = snapshot();
      next.meta = Object.assign({}, next.meta, clone(patch || {}));
      return commit(next);
    }

    function undo() {
      if (!undoStack.length) return snapshot();
      redoStack.push(current);
      current = undoStack.pop();
      return snapshot();
    }

    function redo() {
      if (!redoStack.length) return snapshot();
      undoStack.push(current);
      current = redoStack.pop();
      return snapshot();
    }

    return Object.freeze({
      snapshot,
      insert,
      update,
      remove,
      setMeta,
      undo,
      redo,
      validate: () => validateManifest(current),
      analyze: (options) => analyzeManifest(current, options),
      export: (pretty) => exportManifest(current, pretty),
      history: () => ({ undo: undoStack.length, redo: redoStack.length }),
    });
  }

  function captureRuntime(runtime) {
    const state = runtime && runtime.state ? runtime.state : runtime;
    const definition = runtime && runtime.stageDefinition ? runtime.stageDefinition : {};
    if (!state) return normalizeManifest({});
    const stageIndex = number(state.stageIndex, number(definition.stageIndex, 0));
    const name = definition.name || `Stage ${stageIndex + 1}`;
    const objects = (state.obstacles || []).map((record, index) => {
      const raw = serializable(record, 0);
      const semanticId = raw.id;
      delete raw.id;
      const item = normalizeEntity(raw, 'object', index);
      if (semanticId != null) {
        if (CONTROLLER_TYPES.has(item.type) && item.circuit == null) item.circuit = String(semanticId);
        else item.sourceId = String(semanticId);
      }
      return item;
    });
    const enemies = (state.enemies || []).map((record, index) => {
      const raw = serializable(record, 0);
      delete raw.id;
      delete raw.aiId;
      const item = normalizeEntity(raw, 'enemy', index);
      item.type = record.type || item.type;
      item.archetype = record.type || item.archetype;
      item.role = record.aiRole || item.role;
      return item;
    });
    const pickups = (state.pickups || []).map((record, index) => {
      const raw = serializable(record, 0);
      delete raw.id;
      const item = normalizeEntity(raw, 'pickup', index);
      item.type = record.weapon ? 'weapon' : record.armor ? 'armor' : record.fakeLoot ? 'decoy' : 'pickup';
      return item;
    });
    const travelers = (state.npcs || []).map((record, index) => {
      const raw = serializable(record, 0);
      delete raw.id;
      const item = normalizeEntity(raw, 'traveler', index);
      item.type = record.kind || 'traveler';
      return item;
    });
    const exit = state.portal
      ? { type: 'portal', x: number(state.portal.x, state.levelLength), y: number(state.portal.y, 0) }
      : state.boss
        ? { type: 'boss-clear', x: number(state.boss.x, state.levelLength), y: number(state.boss.y, 0), target: state.boss.type }
        : { type: 'scripted', x: number(state.levelLength, definition.len), y: 0 };
    return normalizeManifest({
      schema: SCHEMA_ID,
      version: SCHEMA_VERSION,
      id: `stage-${String(stageIndex + 1).padStart(2, '0')}-${slug(name)}`,
      meta: {
        name,
        theme: definition.theme || 'plains',
        length: number(state.levelLength, number(definition.len, 1200)),
        stageIndex,
        stageType: definition.type || 'normal',
        boss: definition.boss || null,
        secret: !!definition.secret,
        source: 'runtime-capture',
      },
      start: state.p ? { x: number(state.p.ckSet ? state.p.ckX : 70, 70), y: number(state.p.ckSet ? state.p.ckY : 0, 0) } : { x: 70, y: 0 },
      exit,
      objects,
      enemies,
      pickups,
      travelers,
      annotations: {
        capturedAtTick: number(state.tick, 0),
        portalPairs: (state.cratePortals || []).length,
        killGoal: number(state.killGoal, enemies.length),
        campaignBlueprint: serializable(state.campaignBlueprint || null, 0),
        campaignComposition: serializable(state.campaignComposition || null, 0),
        campaignMigration: serializable(state.campaignMigration || null, 0),
      },
    });
  }

  function createAuthoring(options) {
    const settings = options || {};
    const events = settings.events || null;
    let lastManifest = null;
    let lastReport = null;
    let imports = 0;
    let captures = 0;
    // Private state participates in opt-in TAS branching.
    root.BladefallHarness?.register("authoring:createAuthoring", () => ({ lastManifest, lastReport, imports, captures }),
      state => ({ lastManifest, lastReport, imports, captures } = state));

    function capture(runtime) {
      lastManifest = captureRuntime(runtime);
      lastReport = analyzeManifest(lastManifest);
      captures++;
      if (events && typeof events.emit === 'function') {
        events.emit('authoring:capture', {
          id: lastManifest.id,
          errors: lastReport.summary.errors,
          warnings: lastReport.summary.warnings,
        });
      }
      return clone(lastManifest);
    }

    function importDraft(text) {
      imports++;
      const result = importManifest(text);
      if (result.ok) {
        lastManifest = result.manifest;
        lastReport = analyzeManifest(result.manifest);
      }
      if (events && typeof events.emit === 'function') {
        events.emit('authoring:import', { ok: result.ok, errors: result.report.errors.length });
      }
      return result;
    }

    function analyze(input, analyzeOptions) {
      lastReport = analyzeManifest(input || lastManifest || {}, analyzeOptions);
      return lastReport;
    }

    function diagnostics() {
      return {
        schema: `${SCHEMA_ID}@${SCHEMA_VERSION}`,
        captures,
        imports,
        manifest: lastManifest ? {
          id: lastManifest.id,
          stageIndex: lastManifest.meta.stageIndex,
          objects: lastManifest.objects.length,
          enemies: lastManifest.enemies.length,
          pickups: lastManifest.pickups.length,
          travelers: lastManifest.travelers.length,
        } : null,
        analysis: lastReport ? clone(lastReport.summary) : null,
      };
    }

    return Object.freeze({
      capture,
      importDraft,
      analyze,
      current: () => lastManifest ? clone(lastManifest) : null,
      export: (pretty) => exportManifest(lastManifest || {}, pretty),
      createEditor: (input) => createEditor(input || lastManifest || {}),
      diagnostics,
    });
  }

  root.BladefallAuthoring = Object.freeze({
    schema,
    normalizeManifest,
    migrateManifest,
    validateManifest,
    buildTraversalGraph,
    analyzeSoftlocks,
    composeEncounters,
    analyzeManifest,
    importManifest,
    exportManifest,
    compileManifest,
    createEditor,
    captureRuntime,
    createAuthoring,
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
