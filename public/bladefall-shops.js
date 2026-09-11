(function installBladefallShops(root) {
  'use strict';

  const SCHEMA = 'bladefall.shop-progress';
  const VERSION = 2;

  const shopRecords = [
    {
      id: 'ethereal-goods', stageIndex: 1, x: 980, name: 'Ethereal Goods',
      keeper: 'The Assessor', accent: '#c7d6b4',
      greeting: 'Forgive the prices. I only inventory what was already yours.',
      stock: [
        { id: 'woods-draught', name: 'Bottled Respite', description: 'Restore two measures of Blood.', price: 28, once: false, grant: { kind: 'heal', amount: 40 } },
        { id: 'woods-lens', name: 'Assessor Lens', description: 'Reveal nearby memories, loot, and false walls. Equip in the Tool Kit.', price: 80, once: true, grant: { kind: 'tool', toolId: 'assessor-lens' } },
      ],
    },
    {
      id: 'bellows-exchange', stageIndex: 3, x: 2150, name: 'Bellows Exchange',
      keeper: 'Aven the Sail-Cutter', accent: '#9fe0ff',
      greeting: 'Nothing here defeats the wind. It only makes your mistakes survivable.',
      stock: [
        { id: 'bellows-wrap', name: 'Windwoven Mantle', description: 'A visible mantle that softens one kind of mistake: blood lost to hazards.', price: 135, once: true, grant: { kind: 'armor', slot: 'chest', rarity: 'uncommon', name: 'Windwoven Mantle' } },
        { id: 'bellows-repair', name: 'Restring and Oil', description: 'Restore all weapon durability or ammunition.', price: 34, once: false, grant: { kind: 'repair' } },
        { id: 'bellows-respite', name: 'Rain Measure', description: 'Restore two measures of Blood.', price: 30, once: false, grant: { kind: 'heal', amount: 40 } },
      ],
    },
    {
      id: 'keepers-counter', stageIndex: 5, x: 320, name: "Keeper's Counter",
      keeper: 'Tovin the Mason', accent: '#c6b0dc',
      greeting: 'The Keep remembers tools longer than names.',
      stock: [
        { id: 'keep-spear', name: 'Gate Measure', description: 'Equip a rare spear.', price: 230, once: true, grant: { kind: 'weapon', arche: 'spear', rarity: 'rare', name: 'Gate Measure' } },
        { id: 'keep-chest', name: 'Second Warden Plate', description: 'Equip a rare chestplate.', price: 245, once: true, grant: { kind: 'armor', slot: 'chest', rarity: 'rare', name: 'Second Warden Plate' } },
        { id: 'keep-repair', name: 'Stone and Rivet', description: 'Restore all weapon durability or ammunition.', price: 45, once: false, grant: { kind: 'repair' } },
        { id: 'keep-coil', name: 'Retrieval Coil', description: 'Draw one nearby loose item safely to your hand.', price: 165, once: true, grant: { kind: 'tool', toolId: 'retrieval-coil' } },
      ],
    },
    {
      id: 'white-exchange', stageIndex: 7, x: 330, name: 'The White Exchange',
      keeper: 'Venn, Stove Factor', accent: '#bcefff',
      greeting: 'Warmth is kept here. Nothing else survives the ledger.',
      stock: [
        { id: 'frost-wand', name: 'Four-Bone Wand', description: 'Equip a rare frost wand.', price: 275, once: true, grant: { kind: 'weapon', arche: 'frostwand', rarity: 'rare', name: 'Four-Bone Wand' } },
        { id: 'frost-legs', name: 'Snow-Crossing Greaves', description: 'Equip rare leggings.', price: 240, once: true, grant: { kind: 'armor', slot: 'legs', rarity: 'rare', name: 'Snow-Crossing Greaves' } },
        { id: 'frost-warmth', name: 'Banked Warmth', description: 'Restore 70 health.', price: 42, once: false, grant: { kind: 'heal', amount: 70 } },
        { id: 'frost-rime', name: 'Rime Ampoule', description: 'Release a freezing pulse around the knight.', price: 220, once: true, grant: { kind: 'tool', toolId: 'rime-ampoule' } },
      ],
    },
    {
      id: 'cinder-ledger', stageIndex: 9, x: 330, name: 'The Cinder Ledger',
      keeper: 'Sera the Courier', accent: '#ffb06a',
      greeting: 'Every ember arrives owing something.',
      stock: [
        { id: 'ember-blade', name: 'Courier Flame', description: 'Equip an epic flameblade.', price: 460, once: true, grant: { kind: 'weapon', arche: 'flameblade', rarity: 'epic', name: 'Courier Flame' } },
        { id: 'ember-chest', name: 'Relay Harness', description: 'Equip an epic chestplate.', price: 430, once: true, grant: { kind: 'armor', slot: 'chest', rarity: 'epic', name: 'Relay Harness' } },
        { id: 'ember-repair', name: 'Cinder Refit', description: 'Restore all weapon durability or ammunition.', price: 55, once: false, grant: { kind: 'repair' } },
        { id: 'ember-capsule', name: 'Cinder Capsule', description: 'Release a short-lived ring of dream-fire.', price: 260, once: true, grant: { kind: 'tool', toolId: 'cinder-capsule' } },
      ],
    },
    {
      id: 'last-inventory', stageIndex: 11, x: 330, name: 'The Last Inventory',
      keeper: 'The Sleepless Clerk', accent: '#d8b7ff',
      greeting: 'Above and below, your effects total the same.',
      stock: [
        { id: 'inverse-rod', name: 'Rod of the Other Floor', description: 'Equip an epic storm rod.', price: 520, once: true, grant: { kind: 'weapon', arche: 'stormrod', rarity: 'epic', name: 'Rod of the Other Floor' } },
        { id: 'inverse-helm', name: 'Sleepless Visor', description: 'Equip an epic helmet.', price: 480, once: true, grant: { kind: 'armor', slot: 'helmet', rarity: 'epic', name: 'Sleepless Visor' } },
        { id: 'inverse-draught', name: 'Level Measure', description: 'Restore 100 health.', price: 60, once: false, grant: { kind: 'heal', amount: 100 } },
        { id: 'inverse-spike', name: 'Grounding Spike', description: 'Ground the knight and discharge nearby threats.', price: 320, once: true, grant: { kind: 'tool', toolId: 'grounding-spike' } },
      ],
    },
  ];

  function clone(value) {
    if (Array.isArray(value)) return value.map(clone);
    if (!value || typeof value !== 'object') return value;
    const output = {};
    for (const [key, item] of Object.entries(value)) output[key] = clone(item);
    return output;
  }

  function deepFreeze(value) {
    if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
    Object.freeze(value);
    for (const item of Object.values(value)) deepFreeze(item);
    return value;
  }

  const shops = deepFreeze(shopRecords.map(clone));
  const shopById = new Map(shops.map((shop) => [shop.id, shop]));
  const shopByStage = new Map(shops.map((shop) => [shop.stageIndex, shop]));

  function createProgress(source) {
    const input = source && typeof source === 'object' && !Array.isArray(source) ? source : {};
    const purchased = {};
    for (const shop of shops) {
      const valid = new Set(shop.stock.filter((item) => item.once).map((item) => item.id));
      purchased[shop.id] = [...new Set((input.purchased && Array.isArray(input.purchased[shop.id])
        ? input.purchased[shop.id] : []).map(String))].filter((id) => valid.has(id));
    }
    const visits = {};
    for (const shop of shops) visits[shop.id] = Math.max(0, Math.floor(Number(input.visits && input.visits[shop.id]) || 0));
    return { schema: SCHEMA, version: VERSION, purchased, visits };
  }

  function migrateProgress(raw) {
    const progress = createProgress(raw);
    const current = !!raw && raw.schema === SCHEMA && raw.version === VERSION;
    return Object.freeze({ progress, receipt: Object.freeze({ changed: !current, from: raw && raw.version || 0, to: VERSION }) });
  }

  function stageShop(stageIndex) {
    const shop = shopByStage.get(Number(stageIndex));
    return shop ? clone(shop) : null;
  }

  function inventory(progress, shopId) {
    const shop = shopById.get(shopId);
    if (!shop) return [];
    const state = createProgress(progress);
    const bought = new Set(state.purchased[shop.id]);
    return shop.stock.map((item) => ({ ...clone(item), available: !item.once || !bought.has(item.id) }));
  }

  function visit(progress, shopId) {
    const state = createProgress(progress);
    if (!shopById.has(shopId)) return Object.freeze({ ok: false, reason: 'unknown-shop', progress: state });
    state.visits[shopId]++;
    return Object.freeze({ ok: true, reason: 'visited', progress: state });
  }

  function purchase(progress, shopId, itemId, gold) {
    const state = createProgress(progress);
    const shop = shopById.get(shopId);
    if (!shop) return Object.freeze({ ok: false, reason: 'unknown-shop', gold: Math.max(0, Math.floor(Number(gold) || 0)), progress: state });
    const item = shop.stock.find((entry) => entry.id === itemId);
    const funds = Math.max(0, Math.floor(Number(gold) || 0));
    if (!item) return Object.freeze({ ok: false, reason: 'unknown-item', gold: funds, progress: state });
    if (item.once && state.purchased[shopId].includes(item.id)) return Object.freeze({ ok: false, reason: 'sold', gold: funds, progress: state });
    if (funds < item.price) return Object.freeze({ ok: false, reason: 'insufficient-gold', gold: funds, progress: state });
    if (item.once) state.purchased[shopId].push(item.id);
    return Object.freeze({ ok: true, reason: 'purchased', gold: funds - item.price, item: clone(item), progress: state });
  }

  function validateCatalog() {
    const errors = [];
    const ids = new Set();
    for (const shop of shops) {
      if (ids.has(shop.id)) errors.push(`duplicate shop ${shop.id}`);
      ids.add(shop.id);
      if (shop.stageIndex < 1) errors.push(`shop ${shop.id} appears before the basics`);
      const stockIds = new Set();
      for (const item of shop.stock) {
        if (stockIds.has(item.id)) errors.push(`duplicate stock ${item.id}`);
        stockIds.add(item.id);
        if (!(item.price > 0) || !item.grant || !item.grant.kind) errors.push(`invalid stock ${item.id}`);
      }
    }
    return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), shops: shops.length, items: shops.reduce((sum, shop) => sum + shop.stock.length, 0) });
  }

  root.BladefallShops = Object.freeze({
    SCHEMA, VERSION, shops, createProgress, migrateProgress, stageShop, inventory, visit, purchase, validateCatalog,
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
