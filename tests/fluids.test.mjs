import test from 'node:test';
import assert from 'node:assert/strict';

await import('../public/bladefall-portals.js');
await import('../public/bladefall-reactions.js');
await import('../public/bladefall-fluids.js');
const Fluids = globalThis.BladefallFluids;
const Reactions = globalThis.BladefallReactions;

test('bounded surface columns evolve deterministically and remain finite', () => {
  const a = Fluids.createVolume({ x: 0, y: 0, w: 240, h: 100, cellSize: 24 });
  const b = Fluids.createVolume({ x: 0, y: 0, w: 240, h: 100, cellSize: 24 });
  Fluids.impulse(a, 0, -220, 1);
  Fluids.impulse(b, 0, -220, 1);
  for (let tick = 0; tick < 120; tick++) {
    Fluids.stepVolume(a, 1 / 60);
    Fluids.stepVolume(b, 1 / 60);
  }
  assert.deepEqual(a.columns, b.columns);
  assert.ok(a.columns.every((column) => Number.isFinite(column.offset) && Math.abs(column.offset) <= 35));
});

test('surface impulses spread into neighboring columns without changing volume bounds', () => {
  const volume = Fluids.createVolume({ x: 100, y: -20, w: 300, h: 120 });
  const original = { x: volume.x, y: volume.y, w: volume.w, h: volume.h };
  Fluids.impulse(volume, 100, 180, 0);
  for (let tick = 0; tick < 20; tick++) Fluids.stepVolume(volume, 1 / 60);
  const center = Math.floor(volume.columns.length / 2);
  assert.notEqual(volume.columns[center].offset, 0);
  assert.notEqual(volume.columns[center - 1].offset, 0);
  assert.deepEqual({ x: volume.x, y: volume.y, w: volume.w, h: volume.h }, original);
});

test('actor submersion uses feet coordinates while projectiles use centered coordinates', () => {
  const volume = Fluids.createVolume({ x: 0, y: 0, w: 200, h: 20 });
  assert.equal(Fluids.submersion({ x: 0, y: 0, w: 20, h: 40 }, volume), 0.5);
  assert.equal(Fluids.submersion({ x: 0, y: 20, size: 5 }, volume, { centered: true }), 0.5);
  assert.equal(Fluids.submersion({ x: 150, y: 0, w: 20, h: 40 }, volume), 0);
});

test('fluid samples combine buoyancy, current, resistance, and material damage', () => {
  const water = Fluids.createVolume({ x: 0, y: 0, w: 200, h: 80, currentX: 70 });
  const sample = Fluids.sample({ x: 0, y: 0, w: 20, h: 40 }, [water], [], {});
  assert.equal(sample.submersion, 1);
  assert.ok(sample.forceX > 0);
  assert.ok(sample.forceY > 1400);
  assert.ok(sample.drag > 0);
  assert.equal(sample.damagePerSecond, 0);

  const lava = Fluids.createVolume({ x: 0, y: 0, w: 200, h: 80, kind: 'lava' });
  assert.ok(Fluids.sample({ x: 0, y: 0, w: 20, h: 40 }, [lava], [], {}).damagePerSecond > 0);
});

test('submerged portal entrances emit oriented one-way fluid jets', () => {
  const volume = Fluids.createVolume({ x: 0, y: 0, w: 200, h: 80, kind: 'water' });
  const entrance = { x: 0, y: 20, nx: 0, ny: 1 };
  const exit = { x: 500, y: 120, nx: 1, ny: 0 };
  const jets = Fluids.portalJets([volume], [[entrance, exit, '#a', '#b', true]]);
  assert.equal(jets.length, 1);
  assert.equal(jets[0].x, 500);
  assert.equal(jets[0].y, 120);
  assert.equal(jets[0].nx, 1);
  assert.equal(jets[0].ny, 0);
});

test('portal jets apply directional force only inside their finite corridor', () => {
  const jet = {
    type: 'fluidJet', kind: 'water', x: 0, y: 50, nx: 1, ny: 0,
    length: 200, w: 60, strength: 600, damage: 0,
  };
  const inside = Fluids.jetSample({ x: 100, y: 30, w: 20, h: 40 }, [jet], {});
  assert.ok(inside.forceX > 0);
  assert.equal(inside.forceY, 0);
  assert.equal(inside.active.length, 1);
  assert.equal(Fluids.jetSample({ x: 100, y: 140, w: 20, h: 40 }, [jet], {}).active.length, 0);
});

test('fluid controller owns update, adaptive render samples, impulses, and diagnostics', () => {
  const controller = Fluids.createFluidSystem();
  const volume = { type: 'fluid', kind: 'sludge', x: 0, y: 0, w: 300, h: 80 };
  controller.update([volume], [], 1 / 60);
  const high = controller.renderPoints(volume, 'high');
  const low = controller.renderPoints(volume, 'low');
  assert.ok(high.length > low.length);
  controller.sample({ x: 0, y: 0, w: 20, h: 40 });
  assert.equal(controller.impulse(0, 20, 100), true);
  assert.deepEqual(controller.diagnostics().kinds, { sludge: 1 });
  assert.equal(controller.diagnostics().samples, 1);
  assert.equal(controller.diagnostics().impulses, 1);
});

test('portal jets transport bounded source reaction state without creating a second state', () => {
  const controller = Fluids.createFluidSystem();
  const water = Fluids.createVolume({ x: 0, y: 0, w: 200, h: 80, kind: 'water' });
  const receipt = Reactions.resolve({ element: 'storm' }, { kind: 'fluid', material: 'water' }).receipt;
  Reactions.applyState(water, receipt);
  controller.update([water], [[
    { x: 0, y: 20, nx: 0, ny: 1 },
    { x: 500, y: 120, nx: 1, ny: 0 },
    '#a', '#b', true,
  ]], 0.1);
  const routed = controller.sample({ x: 540, y: 100, w: 20, h: 40 });
  assert.equal(routed.reaction.id, 'conductive-surge');
  assert.equal(routed.damagePerSecond, 9);
  assert.ok(Math.abs(Reactions.activeState(water).time - 2.7) < 1e-9);
});
