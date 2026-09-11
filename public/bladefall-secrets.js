(function installBladefallSecrets(root) {
  'use strict';

  const SCHEMA = 'bladefall.secret-progress';
  const VERSION = 1;
  const progression = root.BladefallProgression;
  if (!progression) throw new Error('BladefallSecrets requires BladefallProgression');

  const DETAILS = Object.freeze({
    'sentinel-key': detail('Sentinel Key', 'sentinel-vigil', 'defeat-sentinel', 'A weapon-marked vigil waits where the first road began.'),
    'root-key': detail('Root Key', 'breakable-root-wall', 'dash-impact', 'One old root seam is bruised as if it remembers speed.'),
    'gale-key': detail('Gale Key', 'crosswind-portal-vault', 'portal-crosswind', 'A split draught points toward a chamber with no door.'),
    'keep-key': detail('Belfry Key', 'masked-belfry', 'wall-ascent', 'The keep bell rings above the route the eye accepts.'),
    'rime-key': detail('Rime Key', 'elemental-seam', 'elemental-thaw', 'A frozen seam answers heat, not force.'),
    'cinder-key': detail('Cinder Key', 'returned-projectile-seal', 'return-projectile', 'The furnace seal bears an impact mark on its hidden face.'),
    'zenith-key': detail('Zenith Key', 'ceiling-sanctum', 'gravity-sanctum', 'A socket is carved where only the second floor can see it.'),
  });
  const KEY_IDS = Object.freeze(progression.keys.map((key) => key.id));
  const STATUS = Object.freeze(['unknown', 'sighted', 'opened', 'recovered']);
  const LEGACY_COIN_STAGE = Object.freeze({
    'sentinel-key': 0, 'root-key': 1, 'gale-key': 3, 'keep-key': 5,
    'rime-key': 7, 'cinder-key': 9, 'zenith-key': 11,
  });

  function detail(name, secret, verb, hint) { return Object.freeze({ name, secret, verb, hint }); }
  function clone(value) {
    if (Array.isArray(value)) return value.map(clone);
    if (!value || typeof value !== 'object') return value;
    const output = {}; for (const [key, item] of Object.entries(value)) output[key] = clone(item); return output;
  }
  function keySpec(id) {
    const constitutional = progression.vaultKey(id);
    const detailRow = DETAILS[id];
    return constitutional && detailRow ? Object.freeze({ ...clone(constitutional), ...detailRow }) : null;
  }
  function createState(raw) {
    const input = raw && raw.schema === SCHEMA && !Array.isArray(raw) ? raw : {};
    const recovered = [...new Set((Array.isArray(input.recovered) ? input.recovered : []).filter((id) => KEY_IDS.includes(id)))];
    const secrets = {};
    for (const id of KEY_IDS) {
      const row = input.secrets && input.secrets[id];
      let status = STATUS.includes(row && row.status) ? row.status : 'unknown';
      if (recovered.includes(id)) status = 'recovered';
      secrets[id] = { status, landmarkId: typeof row?.landmarkId === 'string' ? row.landmarkId : null,
        cue: typeof row?.cue === 'string' ? row.cue.slice(0, 120) : null };
    }
    return { schema: SCHEMA, version: VERSION, revision: Math.max(0, Math.floor(Number(input.revision) || 0)), recovered, secrets };
  }
  function migrate(raw, legacy) {
    const state = createState(raw);
    const from = raw && raw.schema === SCHEMA ? Number(raw.version) || 0 : 0;
    const imported = [];
    if (!raw || raw.schema !== SCHEMA) {
      const coins = legacy && legacy.coins && typeof legacy.coins === 'object' ? legacy.coins : {};
      for (const id of KEY_IDS) if (coins[`s${LEGACY_COIN_STAGE[id]}`]) {
        state.recovered.push(id); state.secrets[id].status = 'recovered'; imported.push(id);
      }
      if (imported.length) state.revision++;
    }
    return Object.freeze({ state, receipt: Object.freeze({ from, to: VERSION,
      changed: JSON.stringify(raw || null) !== JSON.stringify(state), imported: Object.freeze(imported) }) });
  }
  function edit(raw, keyId, operation) {
    const state = createState(raw); const row = state.secrets[keyId];
    if (!row || operation(state, row) === false) return Object.freeze({ changed: false, state });
    state.revision++; return Object.freeze({ changed: true, state });
  }
  function sight(raw, keyId, marker) {
    return edit(raw, keyId, (state, row) => {
      if (row.status !== 'unknown') return false;
      row.status = 'sighted'; row.landmarkId = marker && String(marker.landmarkId || '') || null;
      row.cue = marker && String(marker.cue || '').slice(0, 120) || null;
    });
  }
  function requirementsMissing(spec, capabilities) {
    const owned = new Set(Array.isArray(capabilities) ? capabilities : []);
    return spec.requirements.filter((id) => !owned.has(id));
  }
  function attempt(raw, keyId, context) {
    const spec = keySpec(keyId); const ctx = context || {};
    const state = createState(raw);
    if (!spec) return Object.freeze({ ok: false, reason: 'unknown-key', state });
    if (state.recovered.includes(keyId)) return Object.freeze({ ok: true, reason: 'already-recovered', state, key: spec });
    if (ctx.zoneId !== spec.zone) return Object.freeze({ ok: false, reason: 'wrong-zone', state, key: spec });
    const missing = requirementsMissing(spec, ctx.capabilities);
    if (missing.length) return Object.freeze({ ok: false, reason: 'capability-required', missing: Object.freeze(missing), state, key: spec });
    if (ctx.verb !== spec.verb) return Object.freeze({ ok: false, reason: 'wrong-verb', expected: spec.verb, state, key: spec });
    if (!ctx.evidence) return Object.freeze({ ok: false, reason: 'evidence-required', state, key: spec });
    const result = edit(state, keyId, (next, row) => {
      row.status = 'recovered'; if (!next.recovered.includes(keyId)) next.recovered.push(keyId);
    });
    return Object.freeze({ ok: true, reason: 'recovered', changed: result.changed, state: result.state, key: spec });
  }
  function vaultKeys(raw) { return createState(raw).recovered; }
  function vaultEligibility(raw, context) {
    const recovered = new Set(vaultKeys(raw));
    const missing = KEY_IDS.filter((id) => !recovered.has(id));
    if (!(context && context.kingCleared)) return Object.freeze({ allowed: false, reason: 'boss-clear-required', missing: Object.freeze(missing) });
    if (missing.length) return Object.freeze({ allowed: false, reason: 'vault-keys-required', missing: Object.freeze(missing) });
    return Object.freeze({ allowed: true, reason: 'ready', missing: Object.freeze([]) });
  }
  function markerModel(raw, zoneId) {
    const state = createState(raw); const rows = [];
    for (const id of KEY_IDS) {
      const spec = keySpec(id); if (spec.zone !== zoneId) continue;
      const progress = state.secrets[id];
      rows.push(Object.freeze({ id, name: progress.status === 'recovered' ? spec.name : 'Unknown Secret',
        status: progress.status, landmarkId: progress.status === 'unknown' ? null : progress.landmarkId,
        hint: progress.status === 'unknown' ? null : spec.hint, cue: progress.status === 'unknown' ? null : progress.cue }));
    }
    return Object.freeze(rows);
  }
  function validate() {
    const errors = [];
    if (KEY_IDS.length !== 7 || new Set(KEY_IDS).size !== 7) errors.push('seven-unique-keys-required');
    for (const id of KEY_IDS) {
      const spec = keySpec(id);
      if (!spec || !spec.zone || !spec.secret || !spec.verb || !spec.requirements.length) errors.push(`${id}:incomplete-secret`);
    }
    return Object.freeze({ ok: !errors.length, errors: Object.freeze(errors), keys: KEY_IDS.length });
  }
  function createSecretSystem() {
    let sightings = 0, attempts = 0, recoveries = 0, blocked = 0, last = null;
    // Private state participates in opt-in TAS branching.
    root.BladefallHarness?.register("secrets:createSecretSystem", () => ({ sightings, attempts, recoveries, blocked, last }),
      state => ({ sightings, attempts, recoveries, blocked, last } = state));
    function record(type, receipt) { if (type === 'sighted') sightings++; else if (type === 'attempt') attempts++;
      if (receipt && receipt.ok && receipt.reason === 'recovered') recoveries++; else if (type === 'attempt' && receipt && !receipt.ok) blocked++;
      last = { type, key: receipt && receipt.key && receipt.key.id || null, reason: receipt && receipt.reason || null }; }
    function diagnostics() { return Object.freeze({ sightings, attempts, recoveries, blocked, last }); }
    return Object.freeze({ record, diagnostics });
  }

  root.BladefallSecrets = Object.freeze({ SCHEMA, VERSION, KEY_IDS, STATUS, DETAILS,
    keySpec, createState, migrate, sight, attempt, vaultKeys, vaultEligibility,
    markerModel, validate, createSecretSystem });
})(typeof window !== 'undefined' ? window : globalThis);
