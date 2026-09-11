import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

await import('../public/bladefall-echoes.js');
const Echoes = globalThis.BladefallEchoes;

test('N11 Echo authority validates and begins empty with bounded capacity', () => {
  assert.deepEqual(Echoes.validate(), {
    ok: true, errors: [], echoes: 12, baseCapacity: 2, maxCapacity: 8,
    maxEquipped: 3, rewardEvents: 12,
  });
  assert.deepEqual(Echoes.createState(), {
    schema: Echoes.SCHEMA, version: Echoes.VERSION, owned: [], equipped: [],
    capacityKnots: [], sources: {}, revision: 0,
  });
  assert.deepEqual(Echoes.profile(), { capacity: 2, used: 0, free: 2, owned: 0, equipped: 0, maxEquipped: 3 });
});

test('every Echo has one unique authored source, weighted cost, and semantic hooks', () => {
  assert.equal(Echoes.ECHO_IDS.length, 12);
  assert.equal(new Set(Echoes.ECHO_IDS.map((id) => Echoes.ECHOES[id].source)).size, 12);
  for (const id of Echoes.ECHO_IDS) {
    const echo = Echoes.ECHOES[id];
    assert.ok(echo.cost >= 1 && echo.cost <= 3);
    assert.ok(echo.hooks.length > 0);
    assert.ok(Echoes.REWARDS[echo.source]);
    assert.ok(echo.hooks.every((hook) => hook.event && hook.operation && Number.isFinite(hook.value)));
  }
});

test('the Brute Echo is usable immediately with the Dash earned in the same victory', () => {
  const bell = Echoes.ECHOES['fault-bell'];
  assert.equal(bell.source, 'boss:brute');
  assert.deepEqual(bell.hooks.map((row) => [row.event, row.operation, row.value]), [
    ['player:dash', 'fault-bell:prime', 1.5],
    ['weapon:melee-hit', 'damage:mul', 1.25],
  ]);
  assert.doesNotMatch(bell.description, /downward|slam/i);
});

test('boss and quest receipts grant once, expand capacity, and wait for a refuge choice', () => {
  let state = Echoes.createState();
  const brute = Echoes.applyRewardEvent(state, { type: 'boss:defeated', boss: 'brute' });
  state = brute.state;
  assert.equal(brute.echo.autoEquipped, false);
  assert.deepEqual(state.equipped, []);
  const marksman = Echoes.applyRewardEvent(state, { type: 'boss:defeated', boss: 'archer' });
  state = marksman.state;
  assert.equal(Echoes.profile(state).capacity, 3);
  assert.deepEqual(state.equipped, []);
  const quest = Echoes.applyRewardEvent(state, { type: 'quest:completed', questId: 'kindling-the-sky' });
  assert.equal(quest.echo.autoEquipped, false);
  assert.equal(quest.state.owned.includes('sky-kindling'), true);
  const duplicate = Echoes.applyRewardEvent(quest.state, { type: 'boss:defeated', boss: 'archer' });
  assert.equal(duplicate.changed, false);
});

test('loadout changes require a refuge and enforce both weighted capacity and three-form limit', () => {
  let state = Echoes.createState();
  for (const id of ['far-thread', 'red-tempo', 'road-knot', 'chain-vow', 'fault-bell'])
    state = Echoes.grantEcho(state, id, 'test', { autoEquip: false }).state;
  assert.equal(Echoes.equip(state, 'far-thread', { atRest: false }).reason, 'rest-required');
  for (const knot of ['one', 'two', 'three']) state = Echoes.grantCapacity(state, knot).state;
  for (const id of ['far-thread', 'red-tempo', 'road-knot']) state = Echoes.equip(state, id, { atRest: true }).state;
  assert.deepEqual(Echoes.profile(state), { capacity: 5, used: 3, free: 2, owned: 5, equipped: 3, maxEquipped: 3 });
  assert.equal(Echoes.equip(state, 'chain-vow', { atRest: true }).reason, 'slot-limit');
  assert.equal(Echoes.unequip(state, 'far-thread', { atRest: false }).reason, 'rest-required');
  state = Echoes.unequip(state, 'far-thread', { atRest: true }).state;
  assert.equal(Echoes.profile(state).used, 2);
});

test('semantic hook resolution respects event qualifiers and aggregates modifiers', () => {
  let state = Echoes.createState();
  for (const id of ['white-hush', 'sky-kindling']) state = Echoes.grantEcho(state, id, 'test', { autoEquip: false }).state;
  for (const knot of ['one', 'two']) state = Echoes.grantCapacity(state, knot).state;
  state = Echoes.equip(state, 'white-hush', { atRest: true }).state;
  state = Echoes.equip(state, 'sky-kindling', { atRest: true }).state;
  assert.deepEqual(Echoes.hookReceipts(state, { type: 'tool:use', action: 'rime' }).map((row) => row.operation), ['rime-radius:add']);
  assert.deepEqual(Echoes.hookReceipts(state, { type: 'tool:use', action: 'cinder' }).map((row) => row.operation), ['cinder-duration:add']);
  assert.equal(Echoes.modifier(state, { type: 'status:ice', element: 'ice' }, 'freeze-duration:mul', 1), 1.3);
});

test('legacy random synergy flags migrate into owned Echoes without exceeding capacity', () => {
  const legacy = { run: { p: { mods: { dashFire: true, pierce: true, thorns: true, unknown: true } } } };
  const migrated = Echoes.migrate(null, legacy);
  assert.deepEqual(migrated.receipt.inherited, ['ember-step', 'far-thread', 'chain-vow']);
  assert.deepEqual(migrated.state.owned, ['ember-step', 'far-thread', 'chain-vow']);
  assert.deepEqual(migrated.state.equipped, ['ember-step']);
  assert.equal(Echoes.profile(migrated.state).used <= Echoes.profile(migrated.state).capacity, true);
});

test('runtime mod projection preserves proven mechanics but unequipping removes them', () => {
  let state = Echoes.createState();
  state = Echoes.grantEcho(state, 'far-thread', 'test').state;
  assert.equal(Echoes.runtimeMods(state).pierce, true);
  state = Echoes.unequip(state, 'far-thread', { atRest: true }).state;
  assert.equal(Echoes.runtimeMods(state).pierce, false);
  assert.equal(Echoes.runtimeMods(state).glass, false);
});

test('runtime wires persistence, rewards, refuge loadouts, HUD, hooks, and removes random synergy rolls', async () => {
  const source = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');
  assert.match(source, /echoes:null/);
  assert.match(source, /BFEchoesModule\.migrate\(meta\.echoes,meta\)/);
  assert.match(source, /grantEchoReward\(\{type:'boss:defeated',boss:e\.type\}\)/);
  assert.match(source, /grantEchoReward\(\{type:'quest:completed',questId:last\.questId\}\)/);
  assert.match(source, /function openEchoLoom\(\)/);
  assert.match(source, /atRest=!!nearCurrentRestSite\(\)/);
  assert.match(source, /resolveEchoEvent\('tool:use'/);
  assert.match(source, /resolveEchoEvent\('portal:transit'/);
  assert.match(source, /resolveEchoEvent\('weapon:hit'/);
  assert.match(source, /id="echoTag"/);
  assert.doesNotMatch(source, /const SYNERGY_POOL=/);
  assert.doesNotMatch(source, /gameChance\('upgrade',0\.30\)/);
});

test('Echo hooks that no longer reach the runtime stay a known, shrinking list',async()=>{
  const source=await readFile(new URL('../public/index.html',import.meta.url),'utf8');
  // Echo hooks reach gameplay three ways: named directly, matched by one of the
  // generic suffix filters in useTool(), or bridged through p.mods.
  const suffixFilters=[...source.matchAll(/\/([a-z-]+:[a-z]+)\$\//g)].map((m)=>m[1]);
  const bridged={ 'weapon:projectile/pierce:add':'pierce','enemy:defeated/attack-haste:seconds':'adren',
    'player:dash/fire-trail:enable':'dashFire' };
  const reaches=(echoId,hook)=>source.includes(`hasEcho('${echoId}')`)
    ||source.includes(`'${hook.operation}'`)
    ||suffixFilters.some((f)=>hook.operation.endsWith(f))
    ||!!bridged[`${hook.event}/${hook.operation}`];

  const dead=[];
  for(const row of Echoes.uiModel({}).rows)
    for(const hook of row.hooks||[])
      if(!reaches(row.id,hook))dead.push(`${row.id}:${hook.event}/${hook.operation}`);

  // Locking the list means a NEW dead hook fails here, and fixing one of these
  // fails here too, so the list can only be edited deliberately downward.
  assert.deepEqual(dead.sort(),[
    'courier-loop:portal:projectile/return-damage:mul',
    'far-thread:portal:projectile/precision:add',
    'road-knot:traveler:helped/recovery:add',
    'sky-kindling:environment:air/fire-prime:seconds',
    'white-hush:status:ice/freeze-duration:mul',
  ]);
  // Every Echo must still deliver at least one effect.
  for(const row of Echoes.uiModel({}).rows){
    const live=(row.hooks||[]).filter((hook)=>reaches(row.id,hook));
    assert.ok(live.length>0,`${row.id} has no working effect at all`);
  }
});
