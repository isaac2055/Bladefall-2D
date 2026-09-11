import test from 'node:test';
import assert from 'node:assert/strict';

await import('../public/bladefall-quests.js');
const Quests=globalThis.BladefallQuests;

test('quest catalog is multi-stage, ordered, and uses existing-world verbs',()=>{
  assert.deepEqual(Quests.validateCatalog(),{ok:true,errors:[],quests:6,objectives:17});
  assert.equal(Quests.journal(Quests.createProgress()).every(q=>q.status==='hidden'),true);
});

test('quest starts are gated by permanent progression while active quests remain stable',()=>{
  const quest=Quests.quests.find(row=>row.id==='couriers-proof');
  assert.equal(Quests.eligible(quest,{capabilities:['jump','weapon']}).ok,false);
  let state=Quests.createProgress();
  let result=Quests.record(state,{type:'traveler-helped',target:'sera'},{capabilities:['jump','weapon']});
  assert.equal(result.changed,true); // history is still remembered for revisits
  assert.equal(result.changes.length,0);
  result=Quests.record(result.progress,{type:'inspect',target:'unrelated'},{capabilities:['portal-pair']});
  assert.equal(result.changes[0].type,'started');
});

test('Mara arc starts from helping her and rejects out-of-order evidence',()=>{
  let state=Quests.createProgress();
  let result=Quests.record(state,{type:'traveler-helped',target:'mara',stage:'outskirts'});
  assert.equal(result.changes[0].type,'started');state=result.progress;
  result=Quests.record(state,{type:'inspect',target:'two-wardens',stage:'ruined-keep'});
  assert.equal(result.changed,false);
  result=Quests.record(state,{type:'inspect',target:'third-note',stage:'updrafts'});state=result.progress;
  assert.equal(Quests.journal(state).find(q=>q.id==='road-without-a-name').objective.target,'two-wardens');
});

test('quest completes only after an explicit return and reward claims once',()=>{
  let state=Quests.createProgress();
  for(const event of [
    {type:'traveler-helped',target:'mara',stage:'outskirts'},
    {type:'inspect',target:'third-note',stage:'updrafts'},
    {type:'inspect',target:'two-wardens',stage:'ruined-keep'},
    {type:'talk',target:'mara',stage:'outskirts'},
  ])state=Quests.record(state,event).progress;
  assert.equal(Quests.journal(state).find(q=>q.id==='road-without-a-name').status,'completed');
  const first=Quests.claim(state);assert.equal(first.rewards[0].gold,180);
  const second=Quests.claim(first.progress);assert.equal(second.changed,false);assert.deepEqual(second.rewards,[]);
});

test('air reaction and returned projectile are distinct objective verbs',()=>{
  let state=Quests.createProgress();
  state=Quests.record(state,{type:'traveler-helped',target:'ilyra'}).progress;
  state=Quests.record(state,{type:'traveler-helped',target:'nim',stage:'frostfell'}).progress;
  assert.equal(Quests.record(state,{type:'return-projectile',target:'enemy'}).changed,false);
  assert.equal(Quests.record(state,{type:'air-reaction',target:'fire'}).changed,true);

  let courier=Quests.createProgress();
  courier=Quests.record(courier,{type:'traveler-helped',target:'sera'}).progress;
  assert.equal(Quests.record(courier,{type:'return-projectile',target:'enemy'}).changed,true);
});

test('Assessor visit starts the inventory but the same visit cannot also turn it in',()=>{
  let state=Quests.createProgress();
  let result=Quests.record(state,{type:'shop-visit',target:'ethereal-goods',stage:'black-woods'});
  assert.equal(result.changes.length,1);assert.equal(result.changes[0].type,'started');state=result.progress;
  for(const [target,stage] of [['counterweight','brute'],['cold-rhythm','frost-sorcerer'],['returned-ember','ember-colossus']])state=Quests.record(state,{type:'inspect',target,stage}).progress;
  assert.equal(Quests.journal(state).find(q=>q.id==='inventory-of-effects').objective.target,'ethereal-goods');
  state=Quests.record(state,{type:'shop-visit',target:'ethereal-goods',stage:'black-woods'}).progress;
  assert.equal(Quests.journal(state).find(q=>q.id==='inventory-of-effects').status,'completed');
});

test('dialogue and contact follow current quest state',()=>{
  let state=Quests.createProgress();
  state=Quests.record(state,{type:'traveler-helped',target:'mara'}).progress;
  assert.equal(Quests.dialogue(state,'mara').state,'active');
  state=Quests.record(state,{type:'inspect',target:'third-note',stage:'updrafts'}).progress;
  state=Quests.record(state,{type:'inspect',target:'two-wardens',stage:'ruined-keep'}).progress;
  assert.equal(Quests.contact(state,'mara').objective.type,'talk');
  assert.equal(Quests.dialogue(state,'mara').state,'turn-in');
});

test('migration filters unknown quest rows and bounds steps',()=>{
  const migration=Quests.migrateProgress({schema:Quests.SCHEMA,version:0,quests:{
    'road-without-a-name':{started:true,step:99},removed:{started:true,step:1},
  }});
  const row=migration.progress.quests['road-without-a-name'];
  assert.equal(row.completed,true);assert.equal(row.step,3);assert.equal(row.claimed,false);
  assert.equal(Object.hasOwn(migration.progress.quests,'removed'),false);
});

test('traveler help history deduplicates for persistent revisits',()=>{
  let state=Quests.createProgress();
  state=Quests.record(state,{type:'traveler-helped',target:'bram',stage:'black-woods'}).progress;
  state=Quests.record(state,{type:'traveler-helped',target:'bram',stage:'black-woods'}).progress;
  assert.equal(Quests.hasEvent(state,'traveler-helped','bram','black-woods'),true);
  assert.equal(state.history.filter(value=>value.includes('bram')).length,1);
});

test('Release the Causeway starts through Oren and persists a local repair sequence',()=>{
  let state=Quests.createProgress();
  assert.equal(Quests.dialogue(state,'oren').state,'available');
  assert.equal(Quests.contact(state,'oren').objective.type,'talk');
  for(const event of [
    {type:'talk',target:'oren',stage:'brute'},
    {type:'inspect',target:'causeway-catch-yard',stage:'brute'},
    {type:'inspect',target:'causeway-catch-rise',stage:'brute'},
  ])state=Quests.record(state,event).progress;
  assert.equal(Quests.dialogue(state,'oren').state,'complete');
  assert.equal(Quests.contact(state,'oren'),null);
  assert.equal(Quests.journal(state).find(q=>q.id==='release-the-causeway').status,'completed');
  assert.equal(Quests.claim(state).rewards.find(reward=>reward.questId==='release-the-causeway').gold,160);
});

test('The Open Watch starts at Daro but deliberately waits for a later return',()=>{
  let state=Quests.createProgress();
  assert.equal(Quests.dialogue(state,'daro',{capabilities:['jump','weapon','dash','portal-single']}).state,'available');
  state=Quests.record(state,{type:'talk',target:'daro',stage:'hollow-marksman'},
    {capabilities:['jump','weapon','dash','portal-single']}).progress;
  assert.equal(Quests.journal(state).find(q=>q.id==='the-open-watch').objective.target,'watch-command-token');
  state=Quests.record(state,{type:'inspect',target:'watch-command-token',stage:'hollow-marksman'}).progress;
  assert.equal(Quests.dialogue(state,'daro').state,'turn-in');
  state=Quests.record(state,{type:'talk',target:'daro',stage:'hollow-marksman'}).progress;
  assert.equal(Quests.journal(state).find(q=>q.id==='the-open-watch').status,'completed');
  assert.equal(Quests.claim(state).rewards.find(reward=>reward.questId==='the-open-watch').gold,180);
});


test('existing Causeway saves awaiting Oren now finish after their two catches',()=>{
  const state=Quests.createProgress({quests:{'release-the-causeway':{started:true,step:2,completed:false,claimed:false}}});
  assert.equal(state.quests['release-the-causeway'].completed,true);
  const claim=Quests.claim(state);
  assert.equal(claim.rewards.find(row=>row.questId==='release-the-causeway').gold,160);
  assert.equal(Quests.claim(claim.progress).changed,false);
});
