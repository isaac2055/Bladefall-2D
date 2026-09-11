import test from 'node:test';
import assert from 'node:assert/strict';

await import('../public/bladefall-camera.js');
const Camera = globalThis.BladefallCamera;

test('camera look-ahead follows motion while remaining inside stage bounds', () => {
  const camera = Camera.createCameraController();
  let state;
  for (let tick = 0; tick < 120; tick++) {
    state = camera.update({
      player: { x: 1200, y: 0, vx: 300, face: 1 },
      viewportWidth: 1000,
      levelLength: 3000,
    }, 1 / 60);
  }
  assert.ok(state.lookAhead > 80);
  assert.ok(state.x >= 0 && state.x <= 2000);
  assert.equal(state.framing, 'player');
});

test('co-op and nearby boss framing keep shared actors in one composition', () => {
  const camera = Camera.createCameraController();
  const state = camera.update({
    player: { x: 1000, y: 0, face: 1 },
    partner: { x: 1400, y: 100 },
    boss: { x: 1600, y: 200 },
    viewportWidth: 1000,
    levelLength: 4000,
  }, 1);
  assert.equal(state.framing, 'coop-boss');
  assert.ok(state.focusX > 1200 && state.focusX < 1600);
});

test('vertical framing follows the highest relevant actor', () => {
  const camera = Camera.createCameraController();
  const state = camera.update({
    player: { x: 500, y: 700, face: 1 },
    viewportWidth: 1000,
    levelLength: 2000,
    verticalThreshold: 420,
  }, 1);
  assert.ok(state.y > 200);
  assert.equal(state.desiredY, 280);
});

test('reduced motion removes look-ahead and shake while preserving framing', () => {
  const camera = Camera.createCameraController({ reducedMotion: true, screenShake: 1 });
  const state = camera.update({
    player: { x: 1000, y: 0, vx: 500, face: 1 },
    viewportWidth: 1000,
    levelLength: 3000,
  }, 1);
  assert.equal(state.lookAhead, 0);
  assert.deepEqual(camera.shakeOffset(2, 20), { x: 0, y: 0 });
  assert.equal(state.framing, 'player');
});

test('enabling reduced motion clears an existing look-ahead immediately', () => {
  const camera = Camera.createCameraController();
  for (let tick = 0; tick < 60; tick++) camera.update({
    player: { x: 900, y: 0, vx: 500, face: 1 },
    viewportWidth: 1000,
    levelLength: 5000,
  }, 1 / 60);
  assert.ok(camera.diagnostics().lookAhead > 80);
  camera.applySettings({ reducedMotion: true });
  assert.equal(camera.diagnostics().lookAhead, 0);
});

test('shake is deterministic and respects intensity scaling', () => {
  const camera = Camera.createCameraController({ screenShake: 0.5 });
  assert.deepEqual(camera.shakeOffset(1.25, 12), camera.shakeOffset(1.25, 12));
  const half = camera.shakeOffset(1.25, 12);
  camera.applySettings({ screenShake: 1 });
  const full = camera.shakeOffset(1.25, 12);
  assert.ok(Math.abs(full.x) > Math.abs(half.x));
});
