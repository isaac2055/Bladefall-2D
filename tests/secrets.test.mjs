import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

await import('../public/bladefall-progression.js');
await import('../public/bladefall-secrets.js');
const Secrets = globalThis.BladefallSecrets;

test('secret authority owns seven unique keys and seven distinct verbs', () => {
  assert.equal(Secrets.validate().ok, true);
  assert.equal(Secrets.KEY_IDS.length, 7);
  assert.equal(new Set(Secrets.KEY_IDS.map((id) => Secrets.keySpec(id).verb)).size, 7);
});

test('secret clues do not leak identity before a landmark is sighted', () => {
  let state = Secrets.createState();
  assert.deepEqual(Secrets.markerModel(state, 'black-woods'), [{ id: 'root-key', name: 'Unknown Secret', status: 'unknown', landmarkId: null, hint: null, cue: null }]);
  state = Secrets.sight(state, 'root-key', { landmarkId: 'old-root-seam', cue: 'A bruised knot.' }).state;
  const marker = Secrets.markerModel(state, 'black-woods')[0];
  assert.equal(marker.name, 'Unknown Secret');
  assert.equal(marker.landmarkId, 'old-root-seam');
  assert.match(marker.hint, /root seam/i);
});

test('keys require their exact zone, permanent capabilities, verb, and evidence', () => {
  const state = Secrets.createState();
  assert.equal(Secrets.attempt(state, 'root-key', { zoneId: 'outskirts', capabilities: ['dash'], verb: 'dash-impact', evidence: true }).reason, 'wrong-zone');
  assert.deepEqual(Secrets.attempt(state, 'root-key', { zoneId: 'black-woods', capabilities: [], verb: 'dash-impact', evidence: true }).missing, ['dash']);
  assert.equal(Secrets.attempt(state, 'root-key', { zoneId: 'black-woods', capabilities: ['dash'], verb: 'melee', evidence: true }).reason, 'wrong-verb');
  assert.equal(Secrets.attempt(state, 'root-key', { zoneId: 'black-woods', capabilities: ['dash'], verb: 'dash-impact', evidence: false }).reason, 'evidence-required');
  const recovered = Secrets.attempt(state, 'root-key', { zoneId: 'black-woods', capabilities: ['dash'], verb: 'dash-impact', evidence: true });
  assert.equal(recovered.ok, true);
  assert.deepEqual(recovered.state.recovered, ['root-key']);
});

test('recovery is idempotent and Vault eligibility reports boss and key gates separately', () => {
  let state = Secrets.createState();
  for (const id of Secrets.KEY_IDS) {
    const spec = Secrets.keySpec(id);
    state = Secrets.attempt(state, id, { zoneId: spec.zone, capabilities: spec.requirements, verb: spec.verb, evidence: true }).state;
  }
  const revision = state.revision;
  assert.equal(Secrets.attempt(state, 'root-key', { zoneId: 'black-woods' }).state.revision, revision);
  assert.equal(Secrets.vaultEligibility(state, { kingCleared: false }).reason, 'boss-clear-required');
  assert.equal(Secrets.vaultEligibility(Secrets.createState(), { kingCleared: true }).missing.length, 7);
  assert.equal(Secrets.vaultEligibility(state, { kingCleared: true }).allowed, true);
});

test('legacy stage coins migrate only their corresponding authored key identities', () => {
  const migration = Secrets.migrate(null, { coins: { s0: true, s3: true, s13: true } });
  assert.deepEqual(migration.state.recovered, ['sentinel-key', 'gale-key']);
  assert.deepEqual(migration.receipt.imported, ['sentinel-key', 'gale-key']);
});

test('corrupt keys and marker data are filtered from persistent state', () => {
  const state = Secrets.createState({ schema: Secrets.SCHEMA, version: 99, recovered: ['root-key', 'fake-key'],
    secrets: { 'root-key': { status: 'admin', landmarkId: 3, cue: 'x'.repeat(200) } } });
  assert.deepEqual(state.recovered, ['root-key']);
  assert.equal(state.secrets['root-key'].status, 'recovered');
  assert.equal(state.secrets['root-key'].landmarkId, null);
});

test('runtime persists secret state and uses keys—not coins—for both Vault gates', async () => {
  const source = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');
  assert.match(source, /secrets:null/);
  assert.match(source, /BFSecretsModule\.migrate\(meta\.secrets,meta\)/);
  assert.match(source, /meta\.secrets=BFSecretsModule\.createState\(\)/);
  assert.match(source, /vaultKeys:BFSecretsModule\.vaultKeys\(meta\.secrets\)/);
  assert.match(source, /BFSecretsModule\.vaultEligibility\(meta\.secrets/);
  assert.doesNotMatch(source, /else if\(coinCount\(\)>=COIN_TOTAL\)/);
  assert.match(source, /attemptVaultSecret/);
  assert.match(source, /secretState:\(\)=>/);
});
