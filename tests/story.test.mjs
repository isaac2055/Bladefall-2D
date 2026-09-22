import test from 'node:test';
import assert from 'node:assert/strict';

await import('../public/bladefall-story.js');
const Story = globalThis.BladefallStory;

test('story bible carries redundant clues, the command chain, and both agreed endings', () => {
  assert.deepEqual(Story.validateStory(), {
    ok: true, errors: [], memories: 9, clocks: 3, residents: 11, bosses: 7, facts: 5, endings: 2,
  });
  assert.ok(Story.facts.every((fact) => new Set(fact.clues).size >= 3));
  assert.deepEqual(Story.clocks.map((clock) => clock.time), ['3:40', '3:41', '3:44']);
  assert.equal(Story.endings.find((ending) => ending.id === 'wake-fall').beats.at(-2), 'knight-killed');
  assert.ok(Story.endings.find((ending) => ending.id === 'wake-armed').beats.includes('ordinary-axe-reveal'));
});

test('memories remain undiagnostic before becoming suspicious and patterned', () => {
  let state = Story.createProgress();
  for (const id of ['first-draught', 'red-clasp']) {
    state = Story.findMemory(state, id).progress;
    state = Story.readMemory(state, id).progress;
  }
  assert.equal(Story.revelation(state).stage, 'undiagnostic');
  state = Story.findMemory(state, 'wristguard-bearer').progress;
  state = Story.readMemory(state, 'wristguard-bearer').progress;
  assert.equal(Story.revelation(state).stage, 'undiagnostic');
  state = Story.findMemory(state, 'watch-command-token').progress;
  state = Story.readMemory(state, 'watch-command-token').progress;
  assert.equal(Story.revelation(state).stage, 'suspicion');
  state = Story.findMemory(state, 'empty-scabbard').progress;
  state = Story.readMemory(state, 'empty-scabbard').progress;
  assert.equal(Story.revelation(state).stage, 'suspicion');
  state = Story.findMemory(state, 'four-bone-dice').progress;
  state = Story.readMemory(state, 'four-bone-dice').progress;
  assert.equal(Story.revelation(state).stage, 'pattern');
});

test('the Void Tyrant confirms the interpretation only when clue and fight agree', () => {
  let state = Story.createProgress();
  state = Story.findMemory(state, 'right-hand-seal').progress;
  state = Story.readMemory(state, 'right-hand-seal').progress;
  assert.equal(Story.revelation(state).tyrantConfirmed, false);
  state = Story.markBossEcho(state, 'tyrant').progress;
  assert.equal(Story.revelation(state).tyrantConfirmed, true);
  assert.equal(Story.revelation(state).stage, 'confirmed');
});

test('clock and searcher encounters deduplicate persistent discoveries', () => {
  let state = Story.createProgress();
  state = Story.visitClock(state, 'pulse-one').progress;
  state = Story.visitClock(state, 'pulse-one').progress;
  state = Story.markSearcherSign(state, 'warm-ash').progress;
  assert.deepEqual(state.clockVisits, ['pulse-one']);
  assert.deepEqual(state.searcherSigns, ['warm-ash']);
  assert.equal(Story.visitClock(state, 'not-a-clock').ok, false);
});

test('named refuge residents persist independently from story clues', () => {
  let state = Story.createProgress();
  state = Story.meetResident(state, 'woods-clockkeeper').progress;
  state = Story.meetResident(state, 'woods-clockkeeper').progress;
  state = Story.meetResident(state, 'woods-resinworker').progress;
  assert.deepEqual(state.residentVisits, ['woods-clockkeeper', 'woods-resinworker']);
  assert.deepEqual(state.clockVisits, []);
  assert.equal(Story.meetResident(state, 'unknown-resident').ok, false);
  assert.deepEqual(Story.stageBrief('outskirts').residents.map((resident) => resident.name), ['Vey', 'Olan']);
  assert.equal(Story.stageBrief('black-woods').residents.length, 3);
  assert.deepEqual(Story.stageBrief('brute').residents.map((resident) => resident.name), ['Oren', 'Sable']);
  assert.deepEqual(Story.stageBrief('updrafts').residents.map((resident) => resident.name), ['Talla', 'Edrin']);
  assert.deepEqual(Story.stageBrief('hollow-marksman').residents.map((resident) => resident.name), ['Mara', 'Senn']);
});

test('ending selection requires the King and respects the Deep Line route', () => {
  let state = Story.createProgress();
  assert.equal(Story.endingState(state, { flags: { deepLineCleared: true } }).eligible, false);
  state = Story.markBossEcho(state, 'king').progress;
  assert.equal(Story.endingState(state, { flags: { deepLineCleared: false } }).id, 'wake-fall');
  assert.equal(Story.endingState(state, { flags: { deepLineCleared: true } }).id, 'wake-armed');
  const seen = Story.markEndingSeen(state, { flags: { deepLineCleared: true } });
  assert.equal(seen.progress.endingSeen, 'wake-armed');
});

test('stage briefs never make poison a player-wielded element', () => {
  const frost = Story.stageBrief('frostfell');
  const ember = Story.stageBrief('emberdeep');
  assert.equal(frost.symptom.symptom, 'cold-sweat');
  assert.equal(ember.symptom.symptom, 'fever-rise');
  assert.equal(frost.flowersIgnoreBiome, true);
  assert.equal(ember.poisonPlayerElement, false);
});

test('legacy boss progress migrates without inventing optional memories', () => {
  const result = Story.migrateProgress(null, {
    kingKills: 1,
    bossTypeKills: { brute: 2, tyrant: 1, king: 1 },
  });
  assert.equal(result.progress.kingCleared, true);
  assert.deepEqual(result.progress.bossEchoes, ['brute', 'tyrant', 'king']);
  assert.deepEqual(result.progress.memoriesFound, []);
});
