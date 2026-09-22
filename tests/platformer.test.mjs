import test from 'node:test';
import assert from 'node:assert/strict';

await import('../public/bladefall-platformer.js');
const Platformer = globalThis.BladefallPlatformer;

test('precision profile preserves tuned acceleration, braking, turning, and ice responses', () => {
  const dt = 1 / 60;
  const accelerating = Platformer.horizontalVelocity({
    current: 0, target: 200, input: 1, grounded: true, dt,
  });
  assert.equal(accelerating.response, 'ground-accel');
  // v4 feel: one frame of ground acceleration is target * groundAccel / 60.
  assert.ok(Math.abs(accelerating.velocity - 200 * 22 / 60) < 1e-9);

  const turning = Platformer.horizontalVelocity({
    current: 120, target: -200, input: -1, grounded: true, dt,
  });
  assert.equal(turning.response, 'ground-turn');
  assert.ok(turning.velocity < 0);

  const ice = Platformer.horizontalVelocity({
    current: 200, target: 0, input: 0, grounded: true, ice: true, dt,
  });
  assert.equal(ice.response, 'ice-coast');
  assert.ok(ice.velocity > 199);
});

test('smooth slopes expose the same height plus normalized tangent and normal', () => {
  const slope = { slope: true, x: 100, w: 200, slopeY0: 0, slopeY1: 100 };
  const middle = Platformer.sampleSlope(slope, 100);
  assert.equal(middle.y, 50);
  assert.equal(middle.grade, 0.75);
  assert.ok(Math.abs(Math.hypot(middle.tangent.x, middle.tangent.y) - 1) < 1e-12);
  assert.ok(Math.abs(middle.tangent.x * middle.normal.x + middle.tangent.y * middle.normal.y) < 1e-12);
  assert.equal(Platformer.sampleSlope(slope, 0).grade, 0);
  assert.equal(Platformer.sampleSlope(slope, 200).grade, 0);
});

test('moving platforms carry both axes and donate bounded departure momentum', () => {
  const carried = Platformer.carryByPlatform(
    { x: 50, y: 80 },
    { dxf: 3, dyf: -2 },
    1 / 60,
  );
  assert.deepEqual(carried, { x: 53, y: 78, dx: 3, dy: -2, vx: 180, vy: -120 });
  assert.ok(Math.abs(Platformer.departureVelocity(carried.vx) - 99) < 1e-10);
  assert.equal(Platformer.departureVelocity(1000), 240);
  assert.equal(Platformer.departureVelocity(-1000), -240);
});

test('horizontal sweep catches the first thin wall crossed at portal speeds', () => {
  const actor = { x: 0, y: 10, w: 20, h: 40 };
  const walls = [
    { id: 'far', x: 140, y: 100, w: 10, h: 100 },
    { id: 'near', x: 60, y: 100, w: 8, h: 100 },
  ];
  const right = Platformer.sweepHorizontal(actor, 0, 200, walls);
  assert.equal(right.hit.id, 'near');
  assert.equal(right.x, 46);
  assert.equal(right.wallDir, 1);

  const left = Platformer.sweepHorizontal(actor, 200, 0, walls);
  assert.equal(left.hit.id, 'far');
  assert.equal(left.x, 155);
  assert.equal(left.wallDir, -1);
});

test('adjacent wall probe keeps a flush contact alive without trapping departure', () => {
  const wall = { x: 60, y: 100, w: 20, h: 100 };
  const actor = { x: 40, y: 10, w: 20, h: 40 };
  assert.equal(Platformer.adjacentWall(actor, [wall]).wallDir, 1);
  actor.x = 38;
  assert.equal(Platformer.adjacentWall(actor, [wall]), null);
});

test('adjacent wall contact survives small vertical seams between authored wall pieces', () => {
  const wall = { x: 60, y: 100, w: 20, h: 100 };
  const actor = { x: 40, y: 96, w: 20, h: 40 };
  assert.equal(Platformer.adjacentWall(actor, [wall], 8, 12).wallDir, 1);
  actor.y = 112;
  assert.equal(Platformer.adjacentWall(actor, [wall], 8, 12), null);
});

test('contact probes and controller diagnostics describe traversal without owning gameplay', () => {
  const controller = Platformer.createController();
  const actor = { x: 10, y: 30, w: 20, h: 40, vx: 0, vy: 20, onGround: false, onWall: false, floorPlat: null };
  const probes = Platformer.probeContacts(actor, {
    gravity: 1,
    floorAt: () => ({ y: 0, o: { type: 'plat' } }),
    ceilingAt: () => ({ y: 200, o: { type: 'plat' } }),
    walls: [{ x: 50, y: 100, w: 20, h: 100 }],
  });
  assert.equal(probes.groundDistance, 30);
  assert.equal(probes.wallRightDistance, 20);
  assert.equal(controller.observe(actor, {}, probes).state, 'falling');

  actor.onGround = true;
  actor.vy = 0;
  actor.floorPlat = { type: 'plat', move: {} };
  const landed = controller.observe(actor, {}, probes);
  assert.equal(landed.state, 'grounded-mover');
  assert.equal(landed.landings, 1);
  assert.equal(controller.diagnostics(), landed);
});
