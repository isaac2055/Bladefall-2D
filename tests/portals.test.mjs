import test from 'node:test';
import assert from 'node:assert/strict';

await import('../public/bladefall-portals.js');
const Portals = globalThis.BladefallPortals;

const floor = (x, y = 0, extra = {}) => ({ x, y, nx: 0, ny: 1, ...extra });
const wallRight = (x, y = 100, extra = {}) => ({ x, y, nx: 1, ny: 0, ...extra });

test('mouth frames provide normalized normal and tangent axes', () => {
  const frame = Portals.mouthFrame({ x: 20, y: 30, nx: 4, ny: 0 });
  assert.deepEqual(
    { x: frame.x, y: frame.y, nx: frame.nx, ny: frame.ny, tx: frame.tx, ty: frame.ty },
    { x: 20, y: 30, nx: 1, ny: 0, tx: -0, ty: 1 },
  );
});

test('compatibility transport preserves speed and launches actors along the exit normal', () => {
  const a = floor(0);
  const b = wallRight(200);
  const actor = { x: 0, y: 0, h: 40, vx: 0, vy: 600 };
  const result = Portals.attemptTransit(actor, [[a, b]], { dt: 1 / 60 });
  assert.equal(result.transited, true);
  assert.equal(actor.x, 236);
  assert.equal(actor.y, 100);
  assert.equal(actor.vx, 600);
  assert.ok(Math.abs(actor.vy) < 1e-12);
  assert.equal(actor._portalEntry, a);
  assert.equal(actor._portalExit, b);
});

test('frame transform preserves tangential velocity and projectile coordinate convention', () => {
  const a = floor(0);
  const b = wallRight(200);
  const pair = { a, b, mode: 'frame' };
  const projectile = { x: 0, y: 20, vx: 100, vy: -500 };
  const inputSpeed = Math.hypot(projectile.vx, projectile.vy);
  const result = Portals.attemptTransit(projectile, [pair], { centered: true, dt: 1 / 60 });
  assert.equal(result.transited, true);
  assert.ok(projectile.vx > 0);
  assert.ok(projectile.vy < 0);
  assert.ok(Math.abs(Math.hypot(projectile.vx, projectile.vy) - inputSpeed) < 1e-10);
});

test('one-way, payload, speed gate, cooldown, and rest-mouth rules remain explicit', () => {
  const a = floor(0, 0, { minSpeed: 500 });
  const b = wallRight(200, 100, { payload: 'escort' });
  const rejectedPayload = { x: 0, y: 0, h: 40, vx: 0, vy: 600 };
  const payload = Portals.attemptTransit(rejectedPayload, [[a, b, '#a', '#b', true]], {
    dt: 1 / 60,
    eligible: (_, __, exit) => exit.payload === 'escort' ? { ok: false, reason: 'payload' } : true,
  });
  assert.equal(payload.reason, 'payload');
  assert.equal(rejectedPayload._restMouth, a);

  const slow = { x: 0, y: 0, h: 40, vx: 0, vy: 300 };
  const speed = Portals.attemptTransit(slow, [[a, wallRight(200)]], { dt: 1 / 60 });
  assert.equal(speed.reason, 'speed');
  assert.equal(speed.minimum, 500);

  const reverse = { x: 200, y: 80, h: 40, vx: -600, vy: 0 };
  assert.equal(Portals.attemptTransit(reverse, [[a, b, '#a', '#b', true]], { dt: 1 / 60 }), null);
});

test('portal-aware perception chooses the shorter open route and its entrance waypoint', () => {
  const route = Portals.routePerception(
    { x: 0, y: 0 },
    { x: 1000, y: 0 },
    [[floor(100), floor(900)]],
  );
  assert.equal(route.viaPortal, true);
  assert.equal(route.distance, 200);
  assert.deepEqual(route.waypoint, { x: 100, y: 0 });

  const direct = Portals.routePerception({ x: 0, y: 0 }, { x: 50, y: 0 }, [[floor(100), floor(900)]]);
  assert.equal(direct.viaPortal, false);
});

test('updrafts and wind can be projected through oriented portal exits', () => {
  const a = floor(100);
  const b = wallRight(900, 200);
  const projected = Portals.projectedFields([[a, b]], [
    { type: 'updraft', x: 100, y: 0, w: 100, h: 400 },
    { type: 'wind', x: 5000, y: 0, w: 100, h: 100, forceX: 200 },
  ]);
  assert.equal(projected.length, 1);
  assert.equal(projected[0].type, 'portalFlow');
  assert.equal(projected[0].x, 900);
  assert.equal(projected[0].nx, 1);
  assert.equal(projected[0].ny, 0);
});

test('system diagnostics and semantic events classify successful and rejected transit', () => {
  const packets = [];
  const system = Portals.createPortalSystem({ events: { emit: (type, payload) => packets.push([type, payload]) } });
  const a = floor(0);
  const b = wallRight(200);
  system.attempt({ x: 0, y: 0, h: 40, vx: 0, vy: 600 }, [[a, b]], { kind: 'player' });
  system.attempt({ x: 0, y: 0, h: 40, vx: 0, vy: 10 }, [[{ ...a, minSpeed: 500 }, b]], { kind: 'crate' });
  const diagnostics = system.diagnostics();
  assert.equal(diagnostics.transits, 1);
  assert.equal(diagnostics.rejected, 1);
  assert.equal(diagnostics.byKind.player, 1);
  assert.deepEqual(packets.map((packet) => packet[0]), ['portal:transit', 'portal:rejected']);
});
