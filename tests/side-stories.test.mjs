import test from 'node:test';
import assert from 'node:assert/strict';
await import('../public/bladefall-side-stories.js');
const S=globalThis.BladefallSideStories;
const all=['weapon','dash','portal-single','portal-pair','wall-jump','downward-strike','gravity-flip','echo','chain-hook'];
function choice(state,id,c){const result=S.reduce(state,id,{type:'choice',choice:c});assert.equal(result.error,undefined);return result.state;}
function tasks(state,q){for(const t of q.tasks){const result=S.reduce(state,q.id,{type:'task',task:t.id,capabilities:all});assert.equal(result.changed,true);state=result.state;}return state;}
test('one story in each of the 20 active main-game regions; no cut or Fractured regions',()=>{
 assert.deepEqual(S.records.map(q=>q.stage),[0,1,2,3,4,5,6,7,8,9,10,11,12,13,15,16,17,18,19,20]);
 assert.equal(new Set(S.records.map(q=>q.id)).size,20);
 for(const q of S.records){assert.equal(q.forks.length,2);assert.ok(q.tasks.length);assert.ok(q.after&&q.afterHarsh);}
});
for(const q of S.records){
 for(const route of ['short','medium'])test(`${q.id}: ${route}, sequential objectives, return, exactly-once equal reward`,()=>{
  let state=S.normalize(null);
  if(route==='medium'){state=choice(state,q.id,'medium');state=choice(state,q.id,'ask:1');state=choice(state,q.id,'accept');}
  else state=choice(state,q.id,'short');
  state=choice(state,q.id,'leave');
  assert.equal(S.reduce(state,q.id,{type:'choice',choice:'finish'}).error,'unavailable-choice');
  state=tasks(state,q);assert.equal(S.row(state,q.id).phase,'ready');
  state=choice(state,q.id,q.resolutions?'finish:keep':'finish');
  const result=S.reduce(state,q.id,{type:'claim'});assert.deepEqual(result.receipt,{id:q.id,value:2,scope:'regional'});
  const reloaded=S.normalize(JSON.parse(JSON.stringify(result.state)));
  assert.equal(S.reduce(reloaded,q.id,{type:'claim'}).receipt,null);
  assert.equal(S.row(reloaded,q.id).route,route);
  assert.equal(S.view(reloaded,q.id).text,route==='medium'?q.longEnding:q.ending);
 });
 test(`${q.id}: harsh persists, keeps completed physical steps, blocks reward and reopening`,()=>{
  let state=S.normalize(null);
  if(q.harshAt==='ready'){state=choice(state,q.id,'short');state=tasks(state,q);}
  state=choice(state,q.id,'harsh');const step=S.row(state,q.id).step;
  state=S.reduce(JSON.parse(JSON.stringify(state)),q.id,{type:'visit'}).state;
  assert.equal(S.view(state,q.id).text,q.afterHarsh);
  assert.equal(S.reduce(state,q.id,{type:'claim'}).receipt,null);
  assert.equal(S.reduce(state,q.id,{type:'choice',choice:'short'}).error,'unavailable-choice');
  assert.equal(S.row(state,q.id).step,step);
 });
}
test('ability gates, malformed saves and unknown choices do not advance a story',()=>{
 let state=choice(null,'defector','short');
 state=S.reduce(state,'defector',{type:'task',task:'brake',capabilities:all}).state;
 const denied=S.reduce(state,'defector',{type:'task',task:'gear',capabilities:[]});
 assert.equal(denied.error,'requires:weapon');assert.equal(S.row(denied.state,'defector').step,1);
 assert.equal(S.reduce(state,'defector',{type:'task',task:'bogus',capabilities:all}).changed,false);
 state=S.normalize({quests:{defector:{phase:'harsh',reward:3,claimed:true,step:999},unknown:{}}});
 assert.equal(S.row(state,'defector').reward,0);assert.equal(S.row(state,'defector').claimed,false);assert.equal(state.quests.unknown,undefined);
});
test('archive burning retains anger without conflating it with the insulting branch',()=>{
 const q=S.byId.archivist;let state=tasks(choice(null,q.id,'short'),q);
 state=choice(state,q.id,'finish:burn');assert.equal(S.view(state,q.id).text,q.burnLine);
 assert.equal(S.reduce(state,q.id,{type:'claim'}).receipt.value,2);
});

test('the recruit remembers an actual rescue without inventing one on another route',()=>{
 let state=choice(null,'recruit','short');
 assert.equal(S.reduce(state,'recruit',{type:'rescue'}).changed,false);
 state=S.reduce(state,'recruit',{type:'task',task:'helmet',capabilities:all}).state;
 const unrescued=JSON.parse(JSON.stringify(state));
 state=S.reduce(state,'recruit',{type:'rescue'}).state;
 assert.equal(S.normalize(JSON.parse(JSON.stringify(state))).quests.recruit.rescued,true);
 assert.equal(S.normalize(unrescued).quests.recruit.rescued,false);
});


test('opening refresh preserves previously recovered bell and lantern across save migration',()=>{
 for(const id of ['gatekeeper','refuge']){
  const prior={schema:'bladefall.side-stories',version:1,quests:{[id]:{phase:'active',step:1,route:'short',node:'active'}}};
  const migrated=S.normalize(prior);assert.equal(migrated.version,2);assert.equal(migrated.quests[id].step,2);
  assert.deepEqual(S.normalize(migrated),migrated,'migration only runs once');
  prior.quests[id].phase='completed';prior.quests[id].claimed=true;
  const finished=S.normalize(prior).quests[id];assert.equal(finished.step,S.byId[id].tasks.length);assert.equal(finished.claimed,true);
 }
});
