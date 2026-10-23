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
 test(`${q.id}: one way through (7.353): offer, objectives, a first-return exchange, finish, exactly-once reward`,()=>{
  let state=S.normalize(null);
  const offer=S.view(state,q.id);assert.deepEqual(offer.choices.map(c=>c.id),['short'],'the offer is one line, the knight\'s');
  state=choice(state,q.id,'short');assert.equal(S.row(state,q.id).phase,'active');
  // Back again: the knight asks what is really going on, once, with no buttons.
  state=S.reduce(state,q.id,{type:'visit'}).state;const back=S.view(state,q.id);
  assert.equal(back.choices.length,0);assert.equal(back.lines[0].text,q.firstReturn?q.firstReturn[0][1]:q.question);
  state=S.reduce(state,q.id,{type:'heard'}).state;{const again=S.view(state,q.id).lines;assert.ok(!again||again.length===1,'after the first return, only the step');}
  for(const gone of ['medium','ask:0','accept'])assert.equal(S.reduce(state,q.id,{type:'choice',choice:gone}).error,'unavailable-choice');
  state=tasks(state,q);assert.equal(S.row(state,q.id).phase,'ready');
  const ready=S.view(state,q.id);assert.equal(ready.choices.length,q.resolutions?2:1);
  if(!q.resolutions)assert.equal(ready.choices[0].label,q.thanks||'Continue');   // no thanks (Rowan, 7.359): the knight says nothing
  state=choice(state,q.id,q.resolutions?'finish:keep':'finish');
  const result=S.reduce(state,q.id,{type:'claim'});assert.deepEqual(result.receipt,{id:q.id,value:2,scope:'regional'});
  const reloaded=S.normalize(JSON.parse(JSON.stringify(result.state)));
  assert.equal(S.reduce(reloaded,q.id,{type:'claim'}).receipt,null);
  assert.equal(S.view(reloaded,q.id).text,S.plain(q.longEnding||q.ending));
 });
 test(`${q.id}: an old harsh save keeps its outcome and blocks reward and reopening`,()=>{
  let state=S.normalize({quests:{[q.id]:{phase:'harsh',step:0}}});
  state=S.reduce(state,q.id,{type:'visit'}).state;
  assert.equal(S.view(state,q.id).text,q.afterHarsh);
  assert.equal(S.reduce(state,q.id,{type:'claim'}).receipt,null);
  assert.equal(S.reduce(state,q.id,{type:'choice',choice:'short'}).error,'unavailable-choice');
 });
}
test('every knight line on a side story is unique',()=>{
 const lines=S.records.flatMap(q=>[q.short,q.firstReturn?null:q.question,q.thanks,...(q.firstReturn||[]).filter(([who])=>who==='knight').map(([,t])=>t)]).filter(Boolean);assert.equal(new Set(lines).size,lines.length);
});
test('Rowan goes by his trade until he gives his name (7.359)',()=>{
 let state=S.normalize(null);assert.equal(S.view(state,'gatekeeper').title,'The Gatekeeper');
 state=choice(state,'gatekeeper','short');state=tasks(state,S.byId.gatekeeper);
 const ready=S.view(state,'gatekeeper');assert.equal(ready.lines[1].speaker,'Rowan');
 state=choice(state,'gatekeeper','finish');assert.equal(S.view(state,'gatekeeper').title,'Rowan');
});
test('ability gates, malformed saves and unknown choices do not advance a story',()=>{
 let state=choice(null,'defector','short');
 // (7.375) Silas's first step is the governor's tooth: it needs the blade
 const denied=S.reduce(state,'defector',{type:'task',task:'gear',capabilities:[]});
 assert.equal(denied.error,'requires:weapon');assert.equal(S.row(denied.state,'defector').step,0);
 state=S.reduce(state,'defector',{type:'task',task:'gear',capabilities:all}).state;assert.equal(S.row(state,'defector').step,1);
 assert.equal(S.reduce(state,'defector',{type:'task',task:'bogus',capabilities:all}).changed,false);
 state=S.normalize({quests:{defector:{phase:'harsh',reward:3,claimed:true,step:999},unknown:{}}});
 assert.equal(S.row(state,'defector').reward,0);assert.equal(S.row(state,'defector').claimed,false);assert.equal(state.quests.unknown,undefined);
});
test('the archivist ends one way: no keep-or-burn choice (7.375)',()=>{
 const q=S.byId.archivist;let state=tasks(choice(null,q.id,'short'),q);
 assert.deepEqual(S.view(state,q.id).choices.map(c=>c.id),['finish']);
 state=choice(state,q.id,'finish');assert.equal(S.row(state,q.id).phase,'completed');
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
