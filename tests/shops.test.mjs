import test from 'node:test';
import assert from 'node:assert/strict';

await import('../public/bladefall-shops.js');
const Shops = globalThis.BladefallShops;

test('regional catalog begins after the movement tutorial and is internally valid', () => {
  assert.deepEqual(Shops.validateCatalog(), { ok: true, errors: [], shops: 6, items: 21 });
  assert.equal(Shops.stageShop(0), null);
  assert.equal(Shops.stageShop(1).name, 'Ethereal Goods');
  assert.equal(Shops.stageShop(1).stock.find((item) => item.id === 'woods-draught').name, 'Bottled Respite');
  assert.ok(Shops.shops.every((shop) => shop.stageIndex >= 1));
});

test('regional shops introduce one distinct persistent tool apiece', () => {
  const tools = Shops.shops.flatMap((shop) => shop.stock.filter((item) => item.grant.kind === 'tool'));
  assert.equal(tools.length, 5);
  assert.equal(new Set(tools.map((item) => item.grant.toolId)).size, 5);
  assert.ok(tools.every((item) => item.once));
});

test('fixed stock is deterministic and detached from the immutable catalog', () => {
  const state = Shops.createProgress();
  const first = Shops.inventory(state, 'ethereal-goods');
  const again = Shops.inventory(state, 'ethereal-goods');
  assert.deepEqual(first, again);
  first[0].name = 'tampered';
  assert.equal(Shops.inventory(state, 'ethereal-goods')[0].name, 'Bottled Respite');
  assert.equal(Object.isFrozen(Shops.shops), true);
});

test('one-time gear persists as sold and cannot charge twice', () => {
  const state = Shops.createProgress();
  const bought = Shops.purchase(state, 'ethereal-goods', 'woods-lens', 200);
  assert.equal(bought.ok, true);
  assert.equal(bought.gold, 120);
  assert.equal(Shops.inventory(bought.progress, 'ethereal-goods').find((item) => item.id === 'woods-lens').available, false);
  const duplicate = Shops.purchase(bought.progress, 'ethereal-goods', 'woods-lens', bought.gold);
  assert.equal(duplicate.reason, 'sold');
  assert.equal(duplicate.gold, 120);
});

test('restorative services remain available on revisits', () => {
  let state = Shops.createProgress();
  const first = Shops.purchase(state, 'ethereal-goods', 'woods-draught', 100);
  assert.equal(first.ok, true);
  const second = Shops.purchase(first.progress, 'ethereal-goods', 'woods-draught', first.gold);
  assert.equal(second.ok, true);
  assert.equal(second.gold, 44);
  assert.equal(Shops.inventory(second.progress, 'ethereal-goods').find((item) => item.id === 'woods-draught').available, true);
});

test('bad ids and insufficient funds never mutate progress', () => {
  const state = Shops.createProgress();
  assert.equal(Shops.purchase(state, 'missing', 'woods-lens', 999).reason, 'unknown-shop');
  assert.equal(Shops.purchase(state, 'ethereal-goods', 'missing', 999).reason, 'unknown-item');
  const poor = Shops.purchase(state, 'ethereal-goods', 'woods-lens', 10);
  assert.equal(poor.reason, 'insufficient-gold');
  assert.deepEqual(poor.progress, state);
});

test('migration filters unknown historical stock without losing valid purchases', () => {
  const migrated = Shops.migrateProgress({
    schema: Shops.SCHEMA, version: 0,
    purchased: { 'ethereal-goods': ['woods-lens', 'removed-item'] },
    visits: { 'ethereal-goods': 2.9 },
  });
  assert.equal(migrated.receipt.changed, true);
  assert.deepEqual(migrated.progress.purchased['ethereal-goods'], ['woods-lens']);
  assert.equal(migrated.progress.visits['ethereal-goods'], 2);
});
