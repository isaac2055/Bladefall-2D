import test from 'node:test';
import assert from 'node:assert/strict';

await import('../public/bladefall-core.js');
const Core = globalThis.BladefallCore;

test('core installs a versioned, immutable public API', () => {
  assert.equal(Core.API_VERSION, 1);
  assert.equal(Object.isFrozen(Core), true);
});

test('seeded RNG reproduces sequences and stays within requested ranges', () => {
  const first = Core.createRng('frostfell:ng1');
  const second = Core.createRng('frostfell:ng1');
  const a = Array.from({ length: 8 }, () => first.next());
  const b = Array.from({ length: 8 }, () => second.next());

  assert.deepEqual(a, b);
  assert.ok(a.every((value) => value >= 0 && value < 1));
  assert.ok(Array.from({ length: 50 }, () => first.int(3, 7)).every((value) => value >= 3 && value <= 7));
});

test('event bus supports subscriptions, one-shot events, and removal', () => {
  const bus = Core.createEventBus();
  const received = [];
  const off = bus.on('stage:load', (value) => received.push(`on:${value}`));
  bus.once('stage:load', (value) => received.push(`once:${value}`));

  assert.equal(bus.emit('stage:load', 1), 2);
  assert.equal(bus.emit('stage:load', 2), 1);
  off();
  assert.equal(bus.emit('stage:load', 3), 0);
  assert.deepEqual(received, ['on:1', 'once:1', 'on:2']);
});

test('fixed stepper produces stable ticks and caps catch-up work', () => {
  const ticks = [];
  const stepper = Core.createFixedStepper({
    hz: 60,
    maxSteps: 3,
    maxFrame: 1,
    onStep: (dt, tick) => ticks.push([dt, tick]),
  });

  const normal = stepper.advance(1 / 30);
  assert.equal(normal.steps, 2);
  assert.equal(normal.tick, 2);
  assert.deepEqual(ticks.map((entry) => entry[1]), [0, 1]);

  const overloaded = stepper.advance(0.5);
  assert.equal(overloaded.steps, 3);
  assert.ok(overloaded.droppedSeconds > 0);
  assert.ok(overloaded.alpha >= 0 && overloaded.alpha <= 1);
});

test('metrics retain bounded rolling samples and report useful percentiles', () => {
  const metrics = Core.createMetrics(30);
  for (let i = 1; i <= 40; i++) metrics.record('update', i);
  metrics.record('update', -1);

  const update = metrics.snapshot().update;
  assert.equal(update.samples, 30);
  assert.equal(update.max, 40);
  assert.equal(update.avg, 25.5);
  assert.ok(update.p95 >= 38);
});
