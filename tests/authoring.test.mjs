import test from 'node:test';
import assert from 'node:assert/strict';

await import('../public/bladefall-authoring.js');

const Authoring = globalThis.BladefallAuthoring;

function level(overrides = {}) {
  return Object.assign({
    schema: 'bladefall.level',
    version: 1,
    id: 'test-level',
    meta: { name: 'Test Level', theme: 'ruins', length: 1600 },
    start: { x: 70, y: 0 },
    exit: { type: 'portal', x: 1470, y: 0 },
    objects: [
      { id: 'ground-a', type: 'plat', x: 250, y: 0, w: 500, h: 20 },
      { id: 'ground-b', type: 'plat', x: 760, y: 0, w: 480, h: 20 },
      { id: 'ground-c', type: 'plat', x: 1280, y: 0, w: 560, h: 20 },
      { id: 'checkpoint', type: 'check', x: 800, y: 0 },
    ],
    enemies: [],
    pickups: [],
    travelers: [],
  }, overrides);
}

test('schema migrates legacy level data and assigns stable collection ids', () => {
  const manifest = Authoring.normalizeManifest({
    name: 'Old Keep',
    len: 900,
    theme: 'ruins',
    objects: [{ type: 'plat', x: 300, y: 0, w: 600 }],
    enemies: [{ t: 'grunt', x: 500, y: 0 }],
    portal: { x: 850, y: 0 },
  });

  assert.equal(manifest.schema, 'bladefall.level');
  assert.equal(manifest.version, 1);
  assert.equal(manifest.meta.name, 'Old Keep');
  assert.equal(manifest.objects[0].id, 'object-001');
  assert.equal(manifest.enemies[0].type, 'grunt');
  assert.equal(manifest.exit.x, 850);
});

test('validator catches malformed geometry and duplicate ids without mutating input', () => {
  const source = level({
    objects: [
      { id: 'same', type: 'plat', x: 200, y: 0, w: 0 },
      { id: 'same', type: 'door', x: 400, y: 0, w: 20 },
    ],
  });
  const before = JSON.stringify(source);
  const report = Authoring.validateManifest(source);

  assert.equal(report.ok, false);
  assert.ok(report.errors.some((issue) => issue.code === 'entity.id.duplicate'));
  assert.ok(report.errors.some((issue) => issue.code === 'entity.width'));
  assert.equal(JSON.stringify(source), before);
});

test('circuit validation reports controllers or targets that have no partner', () => {
  const report = Authoring.validateManifest(level({
    objects: [
      { id: 'ground', type: 'plat', x: 800, y: 0, w: 1600 },
      { id: 'plate', type: 'plate', x: 500, y: 0, circuit: 'seal-a' },
      { id: 'orphan-door', type: 'door', x: 1000, y: 80, w: 30, h: 160, circuit: 'seal-b' },
    ],
  }));

  assert.equal(report.ok, true);
  assert.ok(report.warnings.some((issue) => issue.code === 'circuit.target.missing'));
  assert.ok(report.warnings.some((issue) => issue.code === 'circuit.controller.missing'));
});

test('softlock analysis proves a connected route and flags a disconnected exit', () => {
  const connected = Authoring.analyzeSoftlocks(level());
  assert.equal(connected.safe, true);
  assert.ok(connected.proofs.some((proof) => proof.code === 'route.start-to-exit'));

  const disconnected = level({
    exit: { type: 'portal', x: 1450, y: 500 },
    objects: [
      { id: 'start', type: 'plat', x: 250, y: 0, w: 500 },
      { id: 'island', type: 'plat', x: 1450, y: 500, w: 200 },
    ],
  });
  const report = Authoring.analyzeSoftlocks(disconnected);
  assert.equal(report.safe, false);
  assert.ok(report.risks.some((risk) => risk.code === 'softlock.exit.unproven'));
});

test('dynamic traversal dependencies keep an unproven route explicit instead of producing a false proof', () => {
  const report = Authoring.analyzeSoftlocks(level({
    exit: { type: 'portal', x: 1450, y: 500 },
    objects: [
      { id: 'start', type: 'plat', x: 250, y: 0, w: 500 },
      { id: 'lift', type: 'plat', x: 900, y: 220, w: 120, move: { dy: 220, period: 3 } },
      { id: 'island', type: 'plat', x: 1450, y: 500, w: 200 },
    ],
  }));

  assert.equal(report.safe, true);
  assert.ok(report.unknowns.some((risk) => risk.code === 'softlock.exit.unproven'));
  assert.deepEqual(report.unknowns[0].dynamicDependencies, ['lift']);

  const portalReport = Authoring.analyzeSoftlocks(level({
    exit: { type: 'portal', x: 1450, y: 500 },
    objects: [
      { id: 'start', type: 'plat', x: 250, y: 0, w: 500 },
      { id: 'honest-mouth', type: 'wall', x: 700, y: 520, h: 420, w: 26, slate: 1, portalTruth: 1 },
      { id: 'island', type: 'plat', x: 1450, y: 500, w: 200 },
    ],
  }));
  assert.equal(portalReport.safe, true);
  assert.deepEqual(portalReport.unknowns[0].dynamicDependencies, ['honest-mouth']);
});

test('encounter composer groups spatial threats and reports unreadable pressure', () => {
  const enemies = [];
  for (let index = 0; index < 8; index++) {
    enemies.push({
      id: `caster-${index}`,
      type: 'sporecaster',
      x: 600 + index * 30,
      y: 0,
      ranged: true,
      aiRole: 'artillery',
    });
  }
  enemies.push({ id: 'hound', type: 'rifthound', x: 1580, y: 0, aiRole: 'charger' });
  const encounters = Authoring.composeEncounters(level({ enemies }));

  assert.equal(encounters.length, 2);
  assert.ok(encounters[0].issues.includes('crowded'));
  assert.ok(encounters[0].issues.includes('ranged-overload'));
  assert.equal(encounters[1].roles.charger, 1);
});

test('import, export, and compile form a non-executing data pipeline', () => {
  const text = Authoring.exportManifest(level());
  const imported = Authoring.importManifest(text);
  const compiled = Authoring.compileManifest(imported.manifest);

  assert.equal(imported.ok, true);
  assert.equal(compiled.stage.name, 'Test Level');
  assert.equal(compiled.objects.length, 4);
  assert.notEqual(compiled.objects, imported.manifest.objects);

  const invalid = Authoring.importManifest('{bad json');
  assert.equal(invalid.ok, false);
  assert.equal(invalid.report.errors[0].code, 'import.json');
});

test('editor transactions support insert, update, remove, undo, and redo', () => {
  const editor = Authoring.createEditor(level());
  editor.insert('enemies', { id: 'grunt-a', type: 'grunt', x: 500, y: 0 });
  editor.update('enemies', 'grunt-a', { x: 620 });
  editor.insert('pickups', { id: 'reward-a', type: 'weapon', x: 720, y: 10 });
  editor.remove('pickups', 'reward-a');

  assert.equal(editor.snapshot().enemies[0].x, 620);
  assert.equal(editor.snapshot().pickups.length, 0);
  editor.undo();
  assert.equal(editor.snapshot().pickups.length, 1);
  editor.redo();
  assert.equal(editor.snapshot().pickups.length, 0);
  assert.equal(editor.validate().ok, true);
  assert.deepEqual(editor.history(), { undo: 4, redo: 0 });
});

test('runtime capture strips volatile state and preserves semantic circuit references', () => {
  const manifest = Authoring.captureRuntime({
    stageDefinition: { name: 'Captured Keep', theme: 'ruins', type: 'normal' },
    state: {
      stageIndex: 5,
      levelLength: 1800,
      p: { ckSet: false },
      portal: { x: 1720, t: 0 },
      obstacles: [
        { type: 'plat', x: 500, y: 0, w: 1000, active: true },
        { type: 'plate', x: 700, y: 0, id: 'gate-a', pressed: true },
        { type: 'door', x: 1000, y: 140, w: 30, h: 280, circuit: 'gate-a' },
      ],
      enemies: [{ type: 'grunt', x: 800, y: 0, aiId: 9, aiRole: 'pursuer', dead: false }],
      pickups: [{ x: 900, y: 10, weapon: { name: 'Sword' }, bob: 2 }],
      npcs: [{ x: 1200, y: 0, kind: 'escort', state: 'idle' }],
      killGoal: 1,
      cratePortals: [],
    },
  });

  assert.equal(manifest.id, 'stage-06-captured-keep');
  assert.equal(manifest.objects[1].id, 'object-002');
  assert.equal(manifest.objects[1].circuit, 'gate-a');
  assert.equal('pressed' in manifest.objects[1], false);
  assert.equal('dead' in manifest.enemies[0], false);
  assert.equal(manifest.pickups[0].type, 'weapon');
  assert.equal(manifest.travelers[0].type, 'escort');
});

test('authoring controller records captures, imports, diagnostics, and semantic events', () => {
  const emitted = [];
  const controller = Authoring.createAuthoring({
    events: { emit: (type, payload) => emitted.push({ type, payload }) },
  });
  controller.capture({
    stageDefinition: { name: 'Tiny', theme: 'plains' },
    state: {
      stageIndex: 0,
      levelLength: 900,
      p: {},
      portal: { x: 850 },
      obstacles: [{ type: 'plat', x: 450, y: 0, w: 900 }],
      enemies: [],
      pickups: [],
      npcs: [],
    },
  });
  const imported = controller.importDraft(controller.export());

  assert.equal(imported.ok, true);
  assert.deepEqual(controller.diagnostics(), {
    schema: 'bladefall.level@1',
    captures: 1,
    imports: 1,
    manifest: {
      id: 'stage-01-tiny',
      stageIndex: 0,
      objects: 1,
      enemies: 0,
      pickups: 0,
      travelers: 0,
    },
    analysis: {
      errors: 0,
      warnings: 0,
      encounters: 0,
      maxPressure: 0,
      provenReachability: 1,
    },
  });
  assert.deepEqual(emitted.map((item) => item.type), ['authoring:capture', 'authoring:import']);
});
