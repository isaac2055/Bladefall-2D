import test from 'node:test';
import assert from 'node:assert/strict';

await import('../public/bladefall-environment.js');
const Environment = globalThis.BladefallEnvironment;

test('legacy sine movers retain their authored timing while orbit motion is available', () => {
  const spec = { dx: 120, dy: 40, period: 4, phase: 0.5 };
  const at = Environment.oscillator(spec, 1.25, { x: 300, y: 20 });
  const wave = Math.sin(1.25 * Math.PI * 2 / 4 + 0.5);
  assert.ok(Math.abs(at.x - (300 + wave * 120)) < 1e-10);
  assert.ok(Math.abs(at.y - (20 + wave * 40)) < 1e-10);

  const orbit = Environment.oscillator({ mode: 'orbit', rx: 100, ry: 50, period: 4 }, 0, { x: 10, y: 20 });
  assert.deepEqual({ x: orbit.x, y: orbit.y }, { x: 110, y: 20 });
});

test('surface material selection centralizes ice, brittle, slate, and ordinary drag', () => {
  assert.equal(Environment.materialOf({ ice: true }).id, 'ice');
  assert.equal(Environment.materialOf({ ice: true }, true).id, 'stone');
  assert.equal(Environment.materialOf({ crumble: true }).id, 'brittle');
  assert.equal(Environment.materialOf({ slate: true }).id, 'slate');
  assert.equal(Environment.materialOf(null).crateDrag, 0.86);
});

test('shared force sampling combines low gravity, wind, updraft, and radial attraction', () => {
  const actor = { x: 0, y: 20, w: 20, h: 40 };
  const fields = [
    { type: 'lowg', x: 0, y: 40, r: 100 },
    { type: 'updraft', x: 0, y: 0, w: 80, h: 200 },
    { type: 'wind', x: 0, y: 0, w: 80, h: 200, forceX: 300, forceY: 50 },
    { type: 'gravityWell', x: 80, y: 40, r: 200, strength: 1000 },
  ];
  const sample = Environment.sampleFields(actor, fields, {});
  assert.equal(sample.gravityScale, 0.35);
  assert.equal(sample.updraft, true);
  assert.ok(sample.ax > 300);
  assert.ok(sample.ay <= -50);
  assert.deepEqual(sample.active, ['lowg', 'updraft', 'wind', 'gravity-well']);

  const flipped = Environment.sampleFields(actor, fields, { gravityFlipped: true });
  assert.equal(flipped.updraft, false);
});

test('primed airflow changes shared wind force and updraft lift deterministically', () => {
  const actor = { x: 0, y: 20, w: 20, h: 40 };
  const wind = {
    type: 'wind', x: 0, y: 0, w: 80, h: 200, forceX: 300,
    _bfReaction: { time: 2, forceMultiplier: 1.18 },
  };
  const updraft = {
    type: 'updraft', x: 0, y: 0, w: 80, h: 200,
    _bfReaction: { time: 2, forceMultiplier: 0.78 },
  };
  const sample = Environment.sampleFields(actor, [wind, updraft], {});
  assert.equal(sample.ax, 354);
  assert.equal(sample.liftScale, 0.78);
  assert.equal(Environment.reactionForceMultiplier(wind), 1.18);
});

test('authored reaction-gated airflow remains dormant until its named element is active', () => {
  const actor = { x: 100, y: 20, w: 24, h: 44 };
  const field = { type: 'updraft', x: 100, y: 0, w: 100, h: 300, requiresReaction: 'fire' };
  assert.equal(Environment.sampleFields(actor, [field]).updraft, false);
  field._bfReaction = { element: 'ice', time: 2, forceMultiplier: .8 };
  assert.equal(Environment.sampleFields(actor, [field]).updraft, false);
  field._bfReaction = { element: 'fire', time: 2, forceMultiplier: 1.18 };
  const active = Environment.sampleFields(actor, [field]);
  assert.equal(active.updraft, true);
  assert.equal(active.liftScale, 1.18);
});

test('authored canyon currents distinguish gradual, weak-entry, and turbulent rules',()=>{
  const gradual={type:'updraft',x:0,y:0,w:80,h:240,gradualLift:true};
  const actor={x:0,y:20,w:20,h:40,vy:0};
  const first=Environment.sampleFields(actor,[gradual],{}),later=Environment.sampleFields(actor,[gradual],{});
  assert.ok(first.liftScale<later.liftScale&&later.liftScale<1);
  actor.x=200;Environment.sampleFields(actor,[gradual],{});assert.equal(actor._windDwell,0);
  const weak={type:'updraft',x:0,y:0,w:80,h:240,weakFromHeight:180};
  Object.assign(actor,{x:0,y:20,vy:20});assert.equal(Environment.sampleFields(actor,[weak],{}).updraft,false);
  actor.vy=240;assert.equal(Environment.sampleFields(actor,[weak],{}).updraft,true);
  const turbulent={type:'wind',x:0,y:0,w:80,h:240,forceX:100,turbulent:true};
  const a=Environment.sampleFields(actor,[turbulent],{time:0}),b=Environment.sampleFields(actor,[turbulent],{time:1});
  assert.notEqual(a.ax,b.ax);assert.notEqual(a.ay,b.ay);
});

test('pendulum and rotor states are deterministic and expose actor collision geometry', () => {
  const pendulum = { type: 'pendulum', x: 0, y: 200, length: 100, amplitude: 0.5, period: 4, headR: 15 };
  const state = Environment.pendulumState(pendulum, 0);
  Object.assign(pendulum, { headX: state.x, headY: state.y });
  assert.equal(state.x, 0);
  assert.equal(state.y, 100);
  assert.equal(Environment.mechanismHitsActor(pendulum, { x: 0, y: 80, w: 20, h: 40 }), true);

  const rotor = { type: 'rotor', x: 0, y: 50, length: 100, speed: 1, thickness: 5 };
  Object.assign(rotor, Environment.rotorState(rotor, 0));
  assert.equal(rotor.x1, -100);
  assert.equal(rotor.x2, 100);
  assert.equal(Environment.mechanismHitsActor(rotor, { x: 60, y: 30, w: 20, h: 40 }), true);
});

test('verlet rope keeps both pins fixed and converges segment lengths', () => {
  const rope = Environment.createRope({ x: 0, y: 200, length: 180, segments: 9, iterations: 10 });
  const pins = { start: { x: 0, y: 200 }, end: { x: 80, y: 40 } };
  for (let index = 0; index < 20; index++) Environment.stepRope(rope, 1 / 60, pins, 560);
  assert.deepEqual(
    { x: rope.points[0].x, y: rope.points[0].y },
    pins.start,
  );
  assert.deepEqual(
    { x: rope.points.at(-1).x, y: rope.points.at(-1).y },
    pins.end,
  );
  const longestError = Math.max(...rope.points.slice(1).map((point, index) => {
    const previous = rope.points[index];
    return Math.abs(Math.hypot(point.x - previous.x, point.y - previous.y) - rope.segmentLength);
  }));
  assert.ok(longestError < 1.1);
});

test('environment controller updates movers, suspension ropes, and diagnostics together', () => {
  const controller = Environment.createEnvironment();
  const platform = {
    type: 'plat', x: 10, y: 20, x0: 10, y0: 20,
    move: { dx: 0, dy: 50, period: 2 },
    suspended: true, suspensionClearance: 170,
  };
  controller.beginFrame();
  controller.updateMechanism(platform, 0.5, 1 / 60);
  assert.equal(platform.y, 70);
  assert.ok(platform.ropeState.points.length > 2);
  assert.equal(controller.diagnostics().mechanisms, 1);
  assert.equal(controller.diagnostics().ropePoints, platform.ropeState.points.length);
});
