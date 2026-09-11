import test from 'node:test';
import assert from 'node:assert/strict';

await import('../public/bladefall-audio.js');
const Audio = globalThis.BladefallAudio;

test('adaptive mix rises toward combat and ducks beneath important cues', () => {
  const director = Audio.createAudioDirector({ musicVolume: 0.5, sfxVolume: 1 });
  const calm = director.update({ hpFraction: 1, nearbyEnemies: 0 }, 1 / 60);
  for (let tick = 0; tick < 120; tick++) director.update({ hpFraction: 0.3, nearbyEnemies: 5, boss: true }, 1 / 60);
  const combat = director.update({ hpFraction: 0.3, nearbyEnemies: 5, boss: true }, 1 / 60);
  director.cue('hurt');
  const ducked = director.update({ hpFraction: 0.3, nearbyEnemies: 5, boss: true }, 1 / 60);

  assert.ok(combat.intensity > calm.intensity);
  assert.equal(combat.layer, 'climax');
  assert.ok(ducked.musicGain < combat.musicGain);
  assert.ok(ducked.lowpassHz < combat.lowpassHz);
});

test('night mode compresses combat peaks without muting UI or movement', () => {
  const normal = Audio.createAudioDirector({ sfxVolume: 1 });
  const night = Audio.createAudioDirector({ sfxVolume: 1, nightMode: true });
  assert.ok(night.cue('hit').gain < normal.cue('hit').gain);
  assert.equal(night.cue('pickup').gain, normal.cue('pickup').gain);
});

test('spatial pan, captions, and surface profiles are bounded and semantic', () => {
  const director = Audio.createAudioDirector({ captions: true });
  assert.equal(director.spatialPan(-1000, 0, 1000), -0.85);
  assert.equal(director.spatialPan(2000, 0, 1000), 0.85);
  assert.equal(director.cue('enemyDie', { x: 750, cameraX: 0, viewportWidth: 1000 }).caption, 'enemy defeated');
  assert.equal(director.surface('ice').pitch, 1.28);
  assert.equal(director.surface({ id: 'unknown' }), Audio.SURFACES.stone);
});

test('sound disable yields silent music and SFX while retaining diagnostics', () => {
  const director = Audio.createAudioDirector({ soundOn: false, musicVolume: 1, sfxVolume: 1 });
  assert.equal(director.update({ boss: true }, 1).musicGain, 0);
  assert.equal(director.cue('boss').gain, 0);
  assert.equal(director.diagnostics().cueCount, 1);
});
