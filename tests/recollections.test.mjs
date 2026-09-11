import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
await import('../public/bladefall-recollections.js');
const Recollections=globalThis.BladefallRecollections;

test('archive mirrors the campaign and keeps discoveries sealed before the Waking Key',()=>{
  let state=Recollections.createState();
  state=Recollections.discover(state,'outskirts').state;
  assert.equal(Recollections.status(state,'outskirts'),'sealed');
  assert.equal(Recollections.status(state,'black-woods'),'missing');
  state=Recollections.grantKey(state).state;
  assert.equal(Recollections.status(state,'outskirts'),'playable');
  assert.equal(Recollections.uiModel(state).rows.length,16);
  assert.equal(Recollections.validate().ok,true);
});

test('discoveries are idempotent and ordered by campaign stage',()=>{
  let state=Recollections.createState();
  state=Recollections.discover(state,'hollow-marksman').state;
  state=Recollections.discover(state,'black-woods').state;
  const duplicate=Recollections.discover(state,'black-woods');
  assert.equal(duplicate.changed,false);
  assert.deepEqual(duplicate.state.found,['black-woods','hollow-marksman']);
});

test('the Waking Key opens isolated playable legacy roads without touching campaign storage',async()=>{
  const player=await readFile(new URL('../public/recollection-player.html',import.meta.url),'utf8');
  const runtime=await readFile(new URL('../public/index.html.pre-multiplayer.bak',import.meta.url),'utf8');
  assert.match(player,/archive\.keyFound===true/);
  assert.match(player,/archive\.found\.includes\(ZONES\[stage\]\)/);
  assert.match(player,/Object\.defineProperty\(window,'localStorage'/);
  assert.match(player,/G\.leaderboardEligible=false;G\.recollectionMode=true/);
  assert.match(player,/hp:1\.35,dmg:1\.20/);
  assert.match(runtime,/const VERSION='6\.5\.0'/);
});
