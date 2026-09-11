import test from 'node:test';
import assert from 'node:assert/strict';

await import('../public/bladefall-reactions.js');
await import('../public/bladefall-interactions.js');
const Interactions = globalThis.BladefallInteractions;

test('air channels expose distinct fire, frost, and storm reactions', () => {
  const wind = { type: 'wind', x: 100, y: 0, w: 240, h: 180 };
  assert.equal(Interactions.reactionFor('fire', wind).id, 'firestream');
  assert.equal(Interactions.reactionFor('ice', wind).id, 'froststream');
  assert.equal(Interactions.reactionFor('storm', wind).id, 'stormstream');
  assert.equal(Interactions.reactionFor('void', wind), null);
  assert.equal(Interactions.reactionFor('fire', { type: 'plat' }), null);
});

test('rectangular and portal-routed airflow share one containment contract', () => {
  const actor = { x: 20, y: 20, w: 20, h: 40 };
  assert.equal(Interactions.insideChannel(actor, {
    type: 'updraft', x: 20, y: 0, w: 80, h: 160,
  }), true);
  assert.equal(Interactions.insideChannel({ x: 130, y: 20, size: 4 }, {
    type: 'portalFlow', x: 0, y: 20, nx: 1, ny: 0, length: 180, w: 60,
  }, { centered: true }), true);
  assert.equal(Interactions.insideChannel({ x: 130, y: 90, size: 4 }, {
    type: 'portalFlow', x: 0, y: 20, nx: 1, ny: 0, length: 180, w: 60,
  }, { centered: true }), false);
});

test('priming a projected portal stream stores truth on its source field', () => {
  const source = { type: 'wind', x: 0, y: 0, w: 100, h: 200 };
  const projected = {
    type: 'portalFlow', x: 500, y: 100, nx: 1, ny: 0, length: 260, w: 80, source,
  };
  const result = Interactions.primeField(projected, 'fire', { owner: 'player' });
  assert.equal(result.fresh, true);
  assert.equal(source._bfReaction.id, 'firestream');
  assert.equal(Interactions.activeReaction(projected), source._bfReaction);
  assert.equal(Interactions.visualState(projected).color, '#ff7a3a');
});

test('actor sampling aggregates reaction effects without double-counting a projected source', () => {
  const source = { type: 'wind', x: 0, y: 0, w: 100, h: 200 };
  const projected = {
    type: 'portalFlow', x: 0, y: 0, nx: 1, ny: 0, length: 200, w: 100, source,
  };
  Interactions.primeField(source, 'storm', { owner: 'player' });
  const sample = Interactions.sampleActor(
    { x: 30, y: 20, w: 20, h: 40 },
    [source, projected],
  );
  assert.equal(sample.reactions.length, 1);
  assert.equal(sample.shockDps, 9);
});

test('interaction controller activates only player-owned elemental projectiles and expires fields', () => {
  const events = [];
  const system = Interactions.createInteractionSystem({
    events: { emit: (name, payload) => events.push({ name, payload }) },
  });
  const wind = { type: 'wind', x: 0, y: 0, w: 180, h: 180 };
  const enemyShot = { owner: 'enemy', el: 'fire', x: 0, y: 60, size: 6 };
  assert.equal(system.projectile(enemyShot, [wind]).length, 0);

  const playerShot = { owner: 'player', el: 'ice', x: 0, y: 60, size: 6 };
  const first = system.projectile(playerShot, [wind]);
  const refresh = system.projectile(playerShot, [wind]);
  assert.equal(first[0].fresh, true);
  assert.equal(refresh[0].fresh, false);
  assert.equal(events.length, 1);
  assert.equal(system.diagnostics().byReaction.froststream, 1);

  for (let index = 0; index < 32; index++) system.update([wind], 0.1);
  assert.equal(Interactions.activeReaction(wind), null);
});
