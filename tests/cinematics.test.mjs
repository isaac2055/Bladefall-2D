import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

await import('../public/bladefall-cinematics.js');
const Cinematics=globalThis.BladefallCinematics;

test('cinematic catalog contains the prologue and both agreed endings',()=>{
  assert.deepEqual(Cinematics.validate(),{ok:true,errors:[],scripts:3,prologueBeats:1,directBeats:6,truthBeats:11,sharedWakeBeats:3});
});

test('the prologue is only the agreed waking text overlay',()=>{
  const prologue=Cinematics.script('prologue');
  assert.deepEqual(prologue.beats,[{
    id:'rise-to-wake',scene:'text-only',
    text:'His vision swims. The Knight rises beneath a sky he does not remember.',duration:5200
  }]);
});

test('both endings remain identical until the decisive interruption',()=>{
  const direct=Cinematics.script('wake-fall').beats;
  const truth=Cinematics.script('wake-armed').beats;
  assert.deepEqual(direct.slice(0,3),truth.slice(0,3));
  assert.equal(direct[3].scene,'overwhelmed');
  assert.equal(truth[3].scene,'flame-focus');
});

test('direct ending kills the knight while the truth route preserves the rusty-axe ambiguity',()=>{
  const direct=Cinematics.script('wake-fall').beats;
  const truth=Cinematics.script('wake-armed').beats;
  assert.ok(direct.some(beat=>beat.id==='knight-killed'));
  assert.ok(truth.some(beat=>beat.id==='ordinary-axe-reveal'&&/ordinary, rusted axe/.test(beat.text)));
  assert.equal(truth.find(beat=>beat.id==='comrade-voice').text,'“He who saved us has awoken.”');
  assert.equal(truth.at(-1).id,'eyes-open');
});

test('ending selection accepts only an eligible story branch',()=>{
  assert.equal(Cinematics.endingId({eligible:false,id:'wake-fall'}),null);
  assert.equal(Cinematics.endingId({eligible:true,id:'wake-fall'}),'wake-fall');
  assert.equal(Cinematics.endingId({eligible:true,id:'wake-armed'}),'wake-armed');
});

test('script callers receive detached copies',()=>{
  const copy=Cinematics.script('wake-armed');copy.beats[0].text='changed';
  assert.notEqual(Cinematics.script('wake-armed').beats[0].text,'changed');
  assert.equal(Object.isFrozen(Cinematics.scripts),true);
});

test('Base start, direct completion, and Deep Line completion are wired to the cinematic authority',async()=>{
  const index=await readFile(new URL('../public/index.html',import.meta.url),'utf8');
  assert.match(index,/if\(tier===0\)playDaturaCinematic\('prologue',startPlay\)/);
  assert.match(index,/if\(G\.ngPlus===0\)playDaturaCinematic\(baseEnding,afterCinematic\)/);
  assert.match(index,/playDaturaCinematic\(BFCinematicsModule\.endingId\(selected\)\|\|'wake-armed',afterEnding\)/);
});
