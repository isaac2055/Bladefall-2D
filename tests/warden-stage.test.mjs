import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';

const source = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');
const start = source.indexOf('const WARDEN_LEVEL=');
const end = source.indexOf('/* ================================================================\n   THE INVERSION (stage 12)', start);
const stage = source.slice(start, end);

test('The Warden is a reverse six-room authored descent', () => {
  assert.match(stage, /\{len:15000,portal:null,authoredEcology:true,spawnX:14480,spawnY:710,bossX:1500/);
  for (const landmark of ['eastern-crown','blind-gallery','hush-engine','turning-cells','red-court','sentence-well']) {
    assert.match(stage, new RegExp(`'${landmark}'`));
  }
  assert.equal((stage.match(/roomLandmark:1/g)||[]).length, 6);
  assert.equal((stage.match(/wardenRole:/g)||[]).length, 6);
  assert.match(source, /6:WARDEN_LEVEL/);
  assert.match(stage, /build\(\)\{[\s\S]*G\.p\.face=-1/);
});

test('the Hush Engine is bounded and owns exactly two hazardous rotors', () => {
  assert.equal((stage.match(/wardenHushField:1/g)||[]).length, 1);
  assert.equal((stage.match(/wardenRotor:1/g)||[]).length, 2);
  assert.match(stage, /type:'lowg'.*w:2050/s);
});

test('the Warden requires an opposed personal-pair crossing across three phases', () => {
  assert.match(source, /const crossedSides=\(result\.entry\.x-G\.boss\.x\)\*\(result\.exit\.x-G\.boss\.x\)<0/);
  assert.match(source, /G\.boss\.wardenPhase<3\|\|crossedHeight>=170/);
  assert.match(source, /function updateWardenPortalFight/);
  assert.match(source, /hp>\.66\?1:hp>\.33\?2:3/);
  assert.match(source, /wardenSentenceCd/);
  assert.doesNotMatch(source.slice(source.indexOf("} else if(e.type==='warden'){", source.indexOf('function bossArena')), source.indexOf('function resolveMarksmanTarget')), /CROSS THE SHIELD/);
});

test('Turning Cells contain three hazards, two portal faces, and no flat through-floor', () => {
  assert.equal((stage.match(/wardenCellRotor:1/g)||[]).length,3);
  assert.equal((stage.match(/wardenCellSlate:/g)||[]).length,2);
  assert.doesNotMatch(stage,/WardenBeat\(Gr\(5100,7700\)/);
});

test('the Warden commits ordinary guards and attacks one portal mouth at a time', () => {
  assert.match(source,/function updateWardenEnemy/);
  assert.match(source,/e\.wardenState='portalBreakWind'/);
  assert.match(source,/filter\(m=>m\.side!==side\)/);
});

test('victory grants Counter, opens the mine road, and never creates a portal or key', () => {
  assert.match(source, /grantPermanentCapability\('counter','warden-broken-guard'\)/);
  assert.match(source, /if\(o\.wardenMineGate\)o\.gone=true/);
  assert.match(source, /\(e\.type==='warden'&&G\.stageIndex===6\)\)G\.portal=null/);
  assert.match(source, /&&!\(e\.type==='warden'&&G\.stageIndex===6\)\)\{/);
  assert.match(source, /counter:'KeyS'/);
  assert.match(source, /function tryPlayerCounter/);
});

test('the Sentence Well cannot lock a death return and its final court moves', () => {
  assert.match(stage,/Check\(2760,0\).*warden-three-phase-flank/s);
  assert.match(stage,/open-sentence-threshold.*wardenArenaThreshold:1/s);
  assert.doesNotMatch(stage,/wardenArenaBarrier/);
  assert.equal((source.match(/wardenTurningCourt:1/g)||[]).length,5);
  assert.match(source,/function setWardenTurningCourt\(active\)/);
  assert.match(source,/THE TURNING SENTENCE/);
});

test('phase three replaces the portal-mouth punishment with a redirectable chained rush', () => {
  assert.match(source,/e\.wardenState='sentenceWind'/);
  assert.match(source,/e\.wardenState='sentenceRush'/);
  assert.match(source,/e\.wardenSentenceChain=3/);
  assert.match(source,/const returned=portalTransit\(e,dt\)/);
  assert.match(source,/e\.hitFlash=\.65/);
  assert.doesNotMatch(source,/SENTENCE BROKEN/);
  assert.doesNotMatch(source,/for\(const mouth of G\.cratePortals\)G\.aoes\.push/);
});

test('the physical seams preserve both the Outskirts return and Frostfell road', () => {
  assert.match(source, /connector:'outskirts-warden'.*targetStage:0/s);
  assert.match(source, /connector:'warden-frostfell'.*targetStage:7.*requires:'counter'/s);
  assert.match(source, /connector:'warden-frostfell'.*targetStage:6/s);
});

test('Warden exploration and boss music are packaged', async () => {
  assert.match(source, /id:'warden-whispering-woods'.*whispering-woods\.ogg/s);
  assert.match(source, /id:'warden-element'.*element\.mp3/s);
  assert.ok((await stat(new URL('../public/audio/music/whispering-woods.ogg', import.meta.url))).size>0);
  assert.ok((await stat(new URL('../public/audio/music/element.mp3', import.meta.url))).size>0);
});
