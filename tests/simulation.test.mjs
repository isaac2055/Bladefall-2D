import test from 'node:test';
import assert from 'node:assert/strict';

await import('../public/bladefall-core.js');
await import('../public/bladefall-simulation.js');
const Simulation = globalThis.BladefallSimulation;

test('same run and stage seeds reproduce every named gameplay stream', () => {
  const first = Simulation.createSimulation({ fixedHz: 60 });
  const second = Simulation.createSimulation({ fixedHz: 60 });
  first.startRun(123456);
  second.startRun(123456);
  assert.equal(first.beginStage(7), second.beginStage(7));

  const a = Array.from({ length: 10 }, () => [first.random('world'), first.random('loot'), first.random('combat')]);
  const b = Array.from({ length: 10 }, () => [second.random('world'), second.random('loot'), second.random('combat')]);
  assert.deepEqual(a, b);
});

test('named streams isolate loot outcomes from cosmetic or AI consumption', () => {
  const baseline = Simulation.createSimulation();
  const noisy = Simulation.createSimulation();
  baseline.startRun(42);
  noisy.startRun(42);
  baseline.beginStage(3);
  noisy.beginStage(3);

  const expected = [baseline.random('loot'), baseline.random('loot')];
  for (let i = 0; i < 100; i++) noisy.random('ai');
  const actual = [noisy.random('loot'), noisy.random('loot')];
  assert.deepEqual(actual, expected);
});

test('shared stage seed overrides different run seeds for co-op generation', () => {
  const host = Simulation.createSimulation();
  const guest = Simulation.createSimulation();
  host.startRun(1);
  guest.startRun(999);
  host.beginStage(5, 0xabcdef01);
  guest.beginStage(5, 0xabcdef01);

  assert.deepEqual(
    Array.from({ length: 20 }, () => host.random('world')),
    Array.from({ length: 20 }, () => guest.random('world')),
  );
});

test('fixed simulation ticks produce a compact replayable input trace', () => {
  const simulation = Simulation.createSimulation({ fixedHz: 60 });
  simulation.startRun(77);
  simulation.beginStage(0);
  const stepped = [];
  for (let i = 0; i < 5; i++) {
    simulation.step({ right: true, attack: i >= 3, x: 0.5 }, (dt, tick) => stepped.push([dt, tick]));
  }

  const trace = simulation.exportTrace();
  assert.equal(trace.ticks, 5);
  assert.equal(trace.frames.length, 2);
  assert.equal(trace.stages.length, 1);
  assert.deepEqual(stepped.map((entry) => entry[1]), [0, 1, 2, 3, 4]);

  const replay = Simulation.createReplay(trace);
  const frames = [];
  while (!replay.done) frames.push(replay.next());
  assert.equal(frames.length, 5);
  assert.equal(frames[0].frame.right, true);
  assert.equal(frames[0].frame.attack, false);
  assert.equal(frames[4].frame.attack, true);
  assert.ok(Math.abs(frames[0].frame.x - 0.5) < 0.01);
});
