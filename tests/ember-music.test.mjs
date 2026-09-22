// Emberdeep and the Foundry must never fall through to the legacy score, and every
// cue they name must be a file that actually exists on disk.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile, readdir } from 'node:fs/promises';

const index = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');
const onDisk = new Set(await readdir(new URL('../public/audio/music/', import.meta.url)));

const block = index.slice(index.indexOf('const LEVEL_MUSIC='), index.indexOf('function currentLevelMusicCue('));
const { LEVEL_MUSIC: MUSIC, DEFAULT_LEVEL_MUSIC: DEFAULT } =
  vm.runInNewContext(block + ';({LEVEL_MUSIC,DEFAULT_LEVEL_MUSIC})', { Object });

const cues = entry => [entry].concat(entry.boss ? [entry.boss] : []).concat(entry.duel ? [entry.duel] : []);

test('every scored stage names a track that exists', () => {
  for(const [stage, entry] of Object.entries(MUSIC))
    for(const cue of cues(entry)){
      const file = cue.src.replace('./audio/music/', '');
      assert.ok(onDisk.has(file), `stage ${stage} names ${file}, which is not in public/audio/music/`);
      assert.notEqual(cue.src, DEFAULT.src, `stage ${stage} must not point at the legacy score`);
    }
});

test('Emberdeep and the Foundry are scored, not left on the legacy fallback', () => {
  for(const stage of [9, 10]) assert.ok(MUSIC[stage], `stage ${stage} has a music entry`);
  assert.ok(MUSIC[10].boss, 'the Colossus has its own cue, so the score does not announce it early');
  // Distinct exploration cues: two adjacent new regions should not share a loop.
  assert.notEqual(MUSIC[9].src, MUSIC[10].src);
  assert.notEqual(MUSIC[9].id, MUSIC[10].id);
});

test('every cue id is unique, so position memory cannot collide', () => {
  const ids = Object.values(MUSIC).flatMap(cues).map(c => c.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('the score is complete: every playable stage has its own cue', () => {
  // 14 is the cut Gilded Vault slot, so it is the one stage left on the legacy fallback.
  for(const stage of [...Array(14).keys(), 15]) assert.ok(MUSIC[stage], `stage ${stage} has a music entry`);
  const all = Object.values(MUSIC).flatMap(cues);
  assert.deepEqual(all.filter(c => c.interim).map(c => c.id), [], 'no placeholder cues remain');
  // One reprise is deliberate: the Right Hand brings the Tyrant's own theme into the
  // Throne hall, because recognising him is the encounter. Nothing else may share.
  const shared = all.map(c => c.src).filter((s, i, a) => a.indexOf(s) !== i);
  assert.deepEqual(shared, ['./audio/music/iron-oath-of-the-night-attack.mp3']);
  assert.equal(MUSIC[13].duel.src, MUSIC[12].boss.src, 'the Right Hand reprises the Tyrant');
  assert.notEqual(MUSIC[13].duel.id, MUSIC[12].boss.id, 'but keeps its own id, so it starts fresh');
  // The files are loudness-matched; any trim stays inside the range the score has used.
  for(const c of all) if(c.gain !== undefined) assert.ok(c.gain >= .85 && c.gain <= 1.1, `${c.id} gain ${c.gain}`);
});

test('every boss stage owns a boss cue, and only the King skips his intro on repeat', () => {
  for(const stage of [2, 4, 6, 8, 10, 12, 13]) assert.ok(MUSIC[stage].boss, `stage ${stage} boss cue`);
  const looped = Object.values(MUSIC).flatMap(cues).filter(c => c.loopFrom);
  assert.deepEqual(looped.map(c => c.id), ['king-crown-of-ashes']);
  assert.ok(looped[0].loopFrom > 9 && looped[0].loopFrom < 11, 'loops from the orchestral entrance');
  const sync = index.slice(index.indexOf('function syncLevelMusic('), index.indexOf('const BFCore='));
  assert.match(sync, /music\.loop=!\(cue\.loopFrom>0\)/);
  assert.match(sync, /music\.currentTime=now\.loopFrom/);
});

test('the Throne hall gives its second boss a cue of his own', () => {
  const pick = index.slice(index.indexOf('function currentLevelMusicCue('), index.indexOf('function syncLevelMusic('));
  assert.match(pick, /level\.duel&&G&&\(G\.enemies\|\|\[\]\)\.some\(e=>e&&e\.throneRole==='right-hand'&&!e\.dead&&e\.active\)/);
});

test('the Muster Engine hands Frostfell its own second cue, not a borrowed one', () => {
  const muster = index.slice(index.indexOf('const FROST_MUSTER_MUSIC='), index.indexOf('function currentLevelMusicCue('));
  assert.match(muster, /id:'frostfell-muster-garrison'/);
  const file = /src:'\.\/audio\/music\/([^']+)'/.exec(muster)[1];
  assert.ok(onDisk.has(file), `the Muster cue names ${file}, which is not in public/audio/music/`);
  assert.notEqual(file, 'clockwork.mp3', 'the supplied placeholder was replaced');
  assert.notEqual(file, MUSIC[7].src.replace('./audio/music/', ''), 'and it is not the ordinary Frostfell loop');
});
