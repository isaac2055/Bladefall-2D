import test from 'node:test';
import assert from 'node:assert/strict';

await import('../public/bladefall-zone-state.js');
const State = globalThis.BladefallZoneState;
const zones = ['outskirts', 'black-woods'];
const manifest = [
  { id: 'enemy-1', kind: 'grunt', collection: 'enemies', policy: 'rest-reset', defaultPresent: true, defaultState: { dead: false } },
  { id: 'sentinel', kind: 'sentinel', collection: 'enemies', policy: 'permanent', defaultPresent: true, defaultState: { dead: false } },
  { id: 'coin-1', kind: 'coin', collection: 'pickups', policy: 'permanent', defaultPresent: true, defaultState: { taken: false } },
  { id: 'gate-1', kind: 'door', collection: 'objects', policy: 'permanent', defaultPresent: true, defaultState: { opened: false } },
  { id: 'dust-1', kind: 'dust', collection: 'objects', policy: 'session', defaultPresent: true, defaultState: {} },
];

test('N04 is backed by the executable persistent-zone schema', async () => {
  await import('../public/bladefall-progression.js');
  assert.equal(globalThis.BladefallProgression.foundationRuns.find((run) => run.id === 'N04').status, 'complete');
  assert.equal(State.SCHEMA, 'bladefall.persistent-zone-state');
});

test('fresh zone state is compact and migration filters unknown zones', () => {
  const migrated = State.migrate({
    schema: State.SCHEMA, version: 0, zones: { outskirts: { visits: 2 }, nowhere: { visits: 7 } },
  }, zones);
  assert.deepEqual(Object.keys(migrated.state.zones), ['outskirts']);
  assert.equal(migrated.state.zones.outskirts.visits, 2);
  assert.equal(migrated.receipt.to, 1);
  assert.equal(State.validate(migrated.state, zones).ok, true);
});

test('entering and discovering the same cell are idempotent where appropriate', () => {
  let state = State.createState();
  state = State.enter(state, 'outskirts', 'road:outskirts');
  state = State.discoverCell(state, 'outskirts', 'outskirts:cell-0');
  const revision = state.revision;
  state = State.discoverCell(state, 'outskirts', 'outskirts:cell-0');
  assert.equal(state.revision, revision);
  assert.equal(state.zones.outskirts.visits, 1);
  assert.deepEqual(state.zones.outskirts.discoveredCells, ['outskirts:cell-0']);
});

test('capture stores only semantic deltas and hydration returns actionable patches', () => {
  const snapshot = { entities: [
    { id: 'enemy-1', present: false, state: { dead: true } },
    { id: 'sentinel', present: true, state: { dead: false } },
    { id: 'coin-1', present: false, state: { taken: true } },
    { id: 'gate-1', present: true, state: { opened: true } },
    { id: 'dust-1', present: false, state: {} },
  ] };
  const result = State.capture(State.createState(), 'outskirts', manifest, snapshot);
  assert.equal(result.receipt.mutations, 3);
  assert.equal(result.receipt.compactEntities, 3);
  assert.equal(result.state.zones.outskirts.entities.sentinel, undefined);
  assert.equal(result.state.zones.outskirts.entities['dust-1'], undefined);

  const hydration = State.hydrate(result.state, 'outskirts', manifest);
  assert.deepEqual(hydration.actions.map((action) => [action.id, action.remove, action.patch]), [
    ['enemy-1', true, {}],
    ['coin-1', true, {}],
    ['gate-1', false, { opened: true }],
  ]);
});

test('recapturing unchanged deltas does not inflate revisions or event history', () => {
  const snapshot = { entities: manifest.map((item) => ({
    id: item.id,
    present: item.id !== 'coin-1',
    state: item.id === 'coin-1' ? { taken: true } : item.defaultState,
  })) };
  const first = State.capture(State.createState(), 'outskirts', manifest, snapshot).state;
  const second = State.capture(first, 'outskirts', manifest, snapshot).state;
  assert.equal(second.revision, first.revision);
  assert.equal(second.zones.outskirts.events.length, first.zones.outskirts.events.length);
});

test('rest restores ordinary enemies but not permanent secrets or unique pickups', () => {
  let state = State.capture(State.createState(), 'outskirts', manifest, { entities: [
    { id: 'enemy-1', present: false, state: { dead: true } },
    { id: 'sentinel', present: false, state: { dead: true } },
    { id: 'coin-1', present: false, state: { taken: true } },
    { id: 'gate-1', present: true, state: { opened: false } },
  ] }).state;
  const reset = State.resetOnRest(state, 'outskirts');
  state = reset.state;
  assert.equal(reset.restored, 1);
  assert.equal(state.zones.outskirts.entities['enemy-1'], undefined);
  assert.equal(state.zones.outskirts.entities.sentinel.present, false);
  assert.equal(state.zones.outskirts.entities['coin-1'].present, false);
});

test('circuits, secrets, encounters, and shortcuts preserve semantic state', () => {
  let state = State.createState();
  state = State.setCircuit(state, 'outskirts', 'road-lift', { solved: true, phase: 2 });
  state = State.discoverSecret(state, 'outskirts', 'cracked-wall', { discovered: true, opened: true });
  state = State.setEncounter(state, 'outskirts', 'sentinel-vigil', { cleared: true });
  state = State.openShortcut(state, 'outskirts', 'frostfell-sorcerer');
  const view = State.hydrate(state, 'outskirts', []);
  assert.deepEqual(view.circuits['road-lift'], { solved: true, phase: 2 });
  assert.deepEqual(view.secrets['cracked-wall'], { discovered: true, opened: true });
  assert.deepEqual(view.encounters['sentinel-vigil'], { cleared: true });
  assert.deepEqual(view.openedShortcuts, ['frostfell-sorcerer']);
  assert.deepEqual(State.openedConnectors(state), ['frostfell-sorcerer']);
});

test('corrupt and executable values cannot enter persistent state', () => {
  const state = State.setCircuit(State.createState(), 'outskirts', 'unsafe', {
    finite: 3, bad: Infinity, callback: () => 'no', nested: { ok: true },
  });
  assert.deepEqual(state.zones.outskirts.circuits.unsafe, { finite: 3, nested: { ok: true } });
});
