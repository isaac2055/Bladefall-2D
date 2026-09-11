import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile,stat} from 'node:fs/promises';

const root=new URL('../',import.meta.url);
const index=await readFile(new URL('public/index.html',root),'utf8');
const worker=await readFile(new URL('public/sw.js',root),'utf8');
const build=await readFile(new URL('build-deploy.sh',root),'utf8');
const credits=await readFile(new URL('public/audio/ATTRIBUTION.md',root),'utf8');
const assets=['audio/music/sunlight-through-leaves.ogg','audio/music/whispering-woods.ogg','audio/music/heat-of-battle.mp3'];

test('Level 2 and 3 music assets are present, cached, and deployed',async()=>{
  for(const asset of assets){
    assert.ok((await stat(new URL('public/'+asset,root))).size>100000,asset);
    assert.ok(worker.includes(`'./${asset}'`),`${asset} offline cache`);
    assert.ok(build.includes(asset),`${asset} deploy copy`);
  }
});

test('Black Woods and Broken Causeway use their authored exploration tracks',()=>{
  assert.match(index,/1:Object\.freeze\(\{id:'black-woods-sunlight',src:'\.\/audio\/music\/sunlight-through-leaves\.ogg'/);
  assert.match(index,/title:'Sunlight Through Leaves',artist:'Pizza Doggy'/);
  assert.match(index,/2:Object\.freeze\(\{id:'causeway-whispering-woods',src:'\.\/audio\/music\/whispering-woods\.ogg'/);
  assert.match(index,/title:'Whispering Woods',artist:'Pizza Doggy'/);
});

test('Heat of Battle starts only after the Brute awakens',()=>{
  assert.match(index,/boss:Object\.freeze\(\{id:'brute-heat-of-battle',src:'\.\/audio\/music\/heat-of-battle\.mp3'/);
  assert.match(index,/return level\.boss&&G&&G\.boss&&!G\.boss\.dead&&G\.boss\.active\?level\.boss:level/);
  assert.doesNotMatch(index,/G\.boss&&!G\.boss\.dead\?level\.boss:level/);
});

test('music selection executes the exploration-to-Brute transition',()=>{
  const definitions=index.slice(index.indexOf('const LEVEL_MUSIC='),index.indexOf('function syncLevelMusic(requestPlay)'));
  const context=vm.createContext({G:{stageIndex:1,boss:null}});
  vm.runInContext(definitions,context);
  assert.equal(vm.runInContext('currentLevelMusicCue().id',context),'black-woods-sunlight');
  context.G={stageIndex:2,boss:{active:false,dead:false}};
  assert.equal(vm.runInContext('currentLevelMusicCue().id',context),'causeway-whispering-woods');
  context.G.boss.active=true;
  assert.equal(vm.runInContext('currentLevelMusicCue().id',context),'brute-heat-of-battle');
  context.G.boss.dead=true;
  assert.equal(vm.runInContext('currentLevelMusicCue().id',context),'causeway-whispering-woods');
});

test('music survives pause overlays and resumes each authored cue position',()=>{
  const sync=index.slice(index.indexOf('function currentLevelMusicCue()'),index.indexOf('const BFCore=',index.indexOf('function currentLevelMusicCue()')));
  assert.doesNotMatch(sync,/mode==='play'/);
  assert.match(sync,/MUSIC_POSITIONS\[previous\]=music\.currentTime/);
  assert.match(sync,/music\.addEventListener\('loadedmetadata'/);
  assert.match(sync,/music\.dataset\.trackTitle=cue\.title\|\|cue\.id/);
});

test('new supplied music retains source notes',()=>{
  assert.match(credits,/Sunlight Through Leaves.*Whispering Woods.*Cozy Tunes v1\.5\.4 by Pizza Doggy/s);
  assert.match(credits,/Heat of Battle.*supplied directly by the project owner/s);
});
