import test from 'node:test';
import assert from 'node:assert/strict';

await import('../public/bladefall-core.js');
await import('../public/bladefall-storage.js');
await import('../public/bladefall-input.js');
await import('../public/bladefall-content.js');
await import('../public/bladefall-presentation.js');

test('JSON storage preserves keys, tolerates malformed data, and reports failures', () => {
  const values = new Map();
  const storage = {
    getItem: (key) => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
  const store = globalThis.BladefallStorage.createJsonStore(storage);

  assert.deepEqual(store.read('bladefall_v2', { fresh: true }), { fresh: true });
  assert.equal(store.write('bladefall_v2', { stage: 7 }), true);
  assert.deepEqual(store.read('bladefall_v2', {}), { stage: 7 });
  values.set('broken', '{not json');
  assert.deepEqual(store.read('broken', { recovered: true }), { recovered: true });
  assert.equal(store.diagnostics().failures.length, 1);
  assert.equal(store.remove('bladefall_v2'), true);
  assert.equal(values.has('bladefall_v2'), false);
});

test('keyboard boundary preserves held and edge semantics', () => {
  const target = new EventTarget();
  const keyboard = globalThis.BladefallInput.createKeyboardState(target);
  const dispatch = (type, code, repeat = false) => {
    const event = new Event(type);
    Object.defineProperties(event, {
      code: { value: code },
      repeat: { value: repeat },
    });
    target.dispatchEvent(event);
  };

  dispatch('keydown', 'KeyD');
  assert.equal(keyboard.isDown('KeyD'), true);
  assert.equal(keyboard.isPressed('KeyD'), true);
  keyboard.clearPressed();
  assert.equal(keyboard.isDown('KeyD'), true);
  assert.equal(keyboard.isPressed('KeyD'), false);
  dispatch('keydown', 'KeyD', true);
  assert.equal(keyboard.isPressed('KeyD'), false);
  target.dispatchEvent(new Event('blur'));
  assert.equal(keyboard.isDown('KeyD'), false);
  keyboard.detach();
});

test('content registry validates and exposes existing objects by reference', () => {
  const Content = globalThis.BladefallContent;
  const registry = Content.createRegistry();
  const stages = [{ name: 'Frostfell', len: 8850 }];
  const validator = Content.validators.arrayOf(Content.validators.requireFields(['name', 'len']));

  assert.equal(registry.register('stages', stages, validator), stages);
  assert.equal(registry.get('stages'), stages);
  assert.deepEqual(registry.list(), ['stages']);
  assert.deepEqual(registry.summary(), { stages: 1 });
  assert.throws(() => registry.register('stages', []), /already registered/);
  assert.throws(() => registry.register('bad', [{ name: 'Missing length' }], validator), /failed validation/);
});

test('presentation channel publishes typed packets without owning DOM state', () => {
  const bus = globalThis.BladefallCore.createEventBus();
  const channel = globalThis.BladefallPresentation.createChannel(bus);
  const packets = [];
  channel.subscribe('toast', (packet) => packets.push(packet));

  const packet = channel.publish('toast', { message: 'Portal aligned' });
  assert.equal(packet.sequence, 1);
  assert.equal(packet.type, 'toast');
  assert.deepEqual(packets, [packet]);
  assert.deepEqual(channel.stats(), { sequence: 1, counts: { toast: 1 } });
});
