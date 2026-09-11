import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

await import('../public/bladefall-reactions.js');
const Reactions = globalThis.BladefallReactions;

test('reaction authority exposes versioned bounded vocabulary', () => {
  assert.equal(Reactions.VERSION, 1);
  assert.deepEqual(Reactions.ELEMENTS, ['physical', 'fire', 'ice', 'poison', 'arcane', 'void', 'storm', 'holy']);
  assert.equal(Object.isFrozen(Reactions.FLUID.water), true);
});

test('enemy receipts preserve elemental balance and typed status operations', () => {
  const result = Reactions.resolve(
    { element: 'fire', delivery: 'weapon', owner: 'player', power: 20 },
    { kind: 'enemy', element: 'ice', boss: true },
  );
  assert.equal(result.ok, true);
  assert.equal(result.receipt.id, 'enemy-ignite');
  assert.equal(result.receipt.damageMultiplier, 1.5);
  assert.equal(result.receipt.bossDurationMultiplier, 0.5);
  assert.deepEqual(Reactions.operation(result.receipt, 'status'), {
    op: 'status', status: 'burn', duration: 2.5, scale: 0.22,
  });
});

test('air, fluid, surface, destructible, and mechanism families resolve explicitly', () => {
  const cases = [
    ['fire', { kind: 'air' }, 'firestream'],
    ['storm', { kind: 'fluid', material: 'water' }, 'conductive-surge'],
    ['fire', { kind: 'surface', material: 'ice' }, 'ice-thaw'],
    ['physical', { kind: 'destructible', material: 'cracked' }, 'cracked-break'],
    ['storm', { kind: 'mechanism', material: 'conductive' }, 'mechanism-conduct'],
  ];
  for (const [element, target, id] of cases) {
    const result = Reactions.resolve({ element, delivery: 'tool', owner: 'player' }, target);
    assert.equal(result.ok, true);
    assert.equal(result.receipt.id, id);
    assert.equal(result.receipt.target.kind, target.kind);
  }
});

test('unknown combinations and immunities never invent emergent reactions', () => {
  assert.equal(Reactions.resolve({ element: 'void' }, { kind: 'air' }).reason, 'no-explicit-reaction');
  assert.equal(Reactions.resolve({ element: 'fire' }, { kind: 'fluid', material: 'water', immune: true }).reason, 'immune');
  assert.equal(Reactions.resolve({ element: 'banana' }, { kind: 'enemy' }).reason, 'invalid-input');
});

test('reaction controller records semantic receipts and blocked reasons', () => {
  const events = [];
  const system = Reactions.createReactionSystem({ events: { emit: (name, payload) => events.push({ name, payload }) } });
  system.react({ element: 'ice', delivery: 'projectile', owner: 'player' }, { kind: 'fluid', material: 'lava' });
  system.react({ element: 'void', delivery: 'projectile', owner: 'player' }, { kind: 'air' });
  const diagnostics = system.diagnostics();
  assert.equal(diagnostics.attempts, 2);
  assert.equal(diagnostics.resolved, 1);
  assert.equal(diagnostics.blocked, 1);
  assert.equal(diagnostics.byReaction['obsidian-cool'], 1);
  assert.equal(diagnostics.byTarget.fluid, 1);
  assert.equal(diagnostics.blockedByReason['no-explicit-reaction'], 1);
  assert.equal(events[0].name, 'reaction:resolved');
});

test('projectiles use the same wet-fire receipt as water volumes', () => {
  const fluid = Reactions.resolve({ element: 'fire', delivery: 'projectile' }, { kind: 'fluid', material: 'water' });
  const wetProjectile = Reactions.resolve({ element: 'fire', delivery: 'field' }, { kind: 'projectile', material: 'wet' });
  assert.equal(fluid.receipt.id, 'steam');
  assert.equal(wetProjectile.receipt.id, 'steam');
});

test('bounded reaction states refresh idempotently and expire deterministically', () => {
  const target = {};
  const result = Reactions.resolve({ element: 'storm' }, { kind: 'fluid', material: 'water' });
  assert.equal(Reactions.applyState(target, result.receipt).fresh, true);
  assert.equal(Reactions.applyState(target, result.receipt).fresh, false);
  assert.equal(Reactions.activeState(target).id, 'conductive-surge');
  for (let index = 0; index < 29; index++) Reactions.stepState(target, 0.1);
  assert.equal(Reactions.activeState(target), null);
});

test('runtime wires combat, tools, fluids, surfaces, diagnostics, and load order to one authority', async () => {
  const source = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');
  assert.ok(source.indexOf('bladefall-reactions.js') < source.indexOf('bladefall-interactions.js'));
  assert.match(source, /const BFReactions=BFReactionsModule\.createReactionSystem/);
  assert.match(source, /BFReactions\.react\([\s\S]*kind:'enemy'/);
  assert.match(source, /kind:'fluid',material:volume\.kind/);
  assert.match(source, /kind:'surface',material:'brittle'/);
  assert.match(source, /a\.el\|\|'physical'/);
  assert.match(source, /reactionState:\(\)=>BFReactions\.diagnostics\(\)/);
});
