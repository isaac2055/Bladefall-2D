import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';

const root=new URL('../',import.meta.url);
const index=await readFile(new URL('public/index.html',root),'utf8');
const worker=await readFile(new URL('public/sw.js',root),'utf8');
const build=await readFile(new URL('build-deploy.sh',root),'utf8');

const assets=[
  'audio/music/strange-worlds.ogg',
  'audio/sfx/level1/dirt-chain-run-1.ogg','audio/sfx/level1/dirt-chain-run-2.ogg','audio/sfx/level1/dirt-chain-run-3.ogg',
  'audio/sfx/level1/dirt-chain-jump.ogg','audio/sfx/level1/dirt-chain-land.ogg',
  'audio/sfx/level1/stone-chain-run-1.ogg','audio/sfx/level1/stone-chain-run-2.ogg','audio/sfx/level1/stone-chain-run-3.ogg',
  'audio/sfx/level1/stone-chain-jump.ogg','audio/sfx/level1/stone-chain-land.ogg',
  'audio/sfx/level1/sword-attack-1.ogg','audio/sfx/level1/sword-attack-2.ogg','audio/sfx/level1/sword-attack-3.ogg',
  'audio/sfx/level1/sword-impact-1.ogg','audio/sfx/level1/sword-impact-2.ogg','audio/sfx/level1/sword-impact-3.ogg',
  'audio/sfx/level1/pickup-lock.ogg'
];

test('the curated Level 1 audio palette is present, non-empty, cached, and deployed',async()=>{
  for(const asset of assets){
    assert.ok((await stat(new URL('public/'+asset,root))).size>1000,asset+' should contain audio');
    assert.ok(worker.includes(`'./${asset}'`),asset+' should be offline-cached');
    assert.ok(build.includes(asset),asset+' should be copied into the deploy mirror');
  }
});

test('Level 1 routes terrain, traversal, pickups, and return-visit steel through the sample bank',()=>{
  assert.match(index,/const LEVEL1_SAMPLE_BANK=Object\.freeze/);
  assert.match(index,/function updateLevel1Footsteps\(p,dt\)/);
  assert.match(index,/p\.floorPlat\.deep\?'dirt':'stone'/);
  assert.match(index,/playLevel1Sample\(terrain\+'Jump'/);
  assert.match(index,/playLevel1Sample\(terrain\+'Land'/);
  assert.match(index,/playLevel1Sample\('pickup'/);
  assert.match(index,/playLevel1Sample\('swordSwing'/);
  assert.match(index,/playLevel1Sample\('swordImpact'/);
  assert.match(index,/if\(speed<270\)return/);
  assert.match(index,/speed>=360\)playLevel1Sample\(terrain\+'Land'/);
  assert.match(index,/gain:speed>=620\?\.24:\.12/);
  assert.doesNotMatch(index,/terrain\+'Land',x,\{cue:'land',gain:\.72/);
});

test('audio credits preserve both supplied pack sources',async()=>{
  const credits=await readFile(new URL('public/audio/ATTRIBUTION.md',root),'utf8');
  assert.match(credits,/Strange Worlds.*Cozy Tunes v1\.5\.4 by Pizza Doggy/s);
  assert.match(credits,/Free Fantasy SFX Pack by TomMusic/);
});
