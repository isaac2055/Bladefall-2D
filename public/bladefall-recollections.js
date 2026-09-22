(function installBladefallRecollections(root) {
  'use strict';

  const SCHEMA = 'bladefall.sealed-recollections';
  const VERSION = 1;
  const ROWS = [
    ['outskirts', 0, 'The Road Before'], ['black-woods', 1, 'The Lying Wood'],
    ['brute', 2, 'The Broken Standard'], ['updrafts', 3, 'The Needlewind'],
    ['hollow-marksman', 4, 'The Deadeye'], ['ruined-keep', 5, 'The First Keep'],
    ['warden', 6, 'The Gaoler'], ['frostfell', 7, 'The White Expanse'],
    ['frost-sorcerer', 8, 'The Cold Hand'], ['emberdeep', 9, 'The Buried Forge'],
    ['ember-colossus', 10, 'The Furnace General'], ['inversion', 11, 'The Upside-Down Road'],
    ['void-tyrant', 12, 'The Hollow Crown'], ['abyss-king', 13, 'The Last Enemy'],
    ['deep-line', 15, 'The Line Beneath'],   // the Gilded Vault was cut 2026-09-20
  ];
  const RECORDS = Object.freeze(ROWS.map(([id, stageIndex, title]) => Object.freeze({ id, stageIndex, title })));
  const BY_ID = new Map(RECORDS.map((row) => [row.id, row]));

  function safe(value) { return value && typeof value === 'object' && !Array.isArray(value) ? value : {}; }
  function valid(values) { return [...new Set((Array.isArray(values) ? values : []).map(String))].filter((id) => BY_ID.has(id)); }
  function createState(raw) {
    const source = safe(raw);
    return { schema: SCHEMA, version: VERSION, found: valid(source.found), keyFound: source.keyFound === true,
      revision: Math.max(0, Math.floor(Number(source.revision) || 0)) };
  }
  function migrate(raw) {
    const state = createState(raw), recognized = raw && raw.schema === SCHEMA;
    return Object.freeze({ state, receipt: Object.freeze({ changed: !recognized || JSON.stringify(raw) !== JSON.stringify(state), from: raw && raw.version || 0, to: VERSION }) });
  }
  function discover(raw, id) {
    const state = createState(raw), key = String(id || ''), record = BY_ID.get(key);
    if (!record) return Object.freeze({ ok: false, changed: false, reason: 'unknown-recollection', state });
    if (state.found.includes(key)) return Object.freeze({ ok: true, changed: false, reason: 'already-found', state, record });
    state.found.push(key); state.found.sort((a, b) => BY_ID.get(a).stageIndex - BY_ID.get(b).stageIndex); state.revision++;
    return Object.freeze({ ok: true, changed: true, reason: 'sealed-recollection-found', state, record });
  }
  function grantKey(raw) { const state = createState(raw); if (state.keyFound) return Object.freeze({ ok: true, changed: false, state }); state.keyFound = true; state.revision++; return Object.freeze({ ok: true, changed: true, state }); }
  function status(raw, id) { const state = createState(raw); return !state.found.includes(id) ? 'missing' : state.keyFound ? 'playable' : 'sealed'; }
  function uiModel(raw) {
    const state = createState(raw);
    return Object.freeze({ found: state.found.length, total: RECORDS.length, keyFound: state.keyFound,
      rows: Object.freeze(RECORDS.map((record) => Object.freeze({ ...record, status: status(state, record.id) }))) });
  }
  function validate() {
    const errors = [];
    if (RECORDS.length !== 15) errors.push('archive must mirror all fifteen reachable campaign regions');
    if (new Set(RECORDS.map((row) => row.id)).size !== RECORDS.length) errors.push('recollection ids must be unique');
    if (new Set(RECORDS.map((row) => row.stageIndex)).size !== RECORDS.length) errors.push('recollection stages must be unique');
    return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), recollections: RECORDS.length });
  }

  root.BladefallRecollections = Object.freeze({ SCHEMA, VERSION, RECORDS, createState, migrate, discover, grantKey, status, uiModel, validate });
})(typeof globalThis !== 'undefined' ? globalThis : window);
