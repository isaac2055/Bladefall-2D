import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
function load(){const c={};vm.createContext(c);for(const f of ['bladefall-quest-round2-stories.js','bladefall-side-stories.js'])vm.runInContext(fs.readFileSync(new URL('../public/'+f,import.meta.url),'utf8'),c);return c;}
const ids=['cartographer','recruit','quota','neighbors','sailors'];
for(const id of ids){
 test(id+': three distinct physical tasks and one-way dialogue',()=>{const c=load(),S=c.BladefallSideStories,q=S.byId[id];assert.equal(q.tasks.length,3);assert.equal(new Set(q.tasks.map(t=>t.id)).size,3);assert.equal(q.revision,2);let s=S.reduce(null,id,{type:'choice',choice:'short'}).state;
  for(const t of q.tasks){assert.equal(S.view(s,id).choices.length,0);s=S.reduce(s,id,{type:'task',task:t.id,capabilities:q.tasks.map(t=>t.capability).filter(Boolean)}).state;}
  assert.equal(S.row(s,id).phase,'ready');assert.equal(S.view(s,id).choices.length,1);s=S.reduce(s,id,{type:'choice',choice:'finish'}).state;const first=S.reduce(s,id,{type:'claim'});assert.ok(first.receipt);assert.equal(S.reduce(first.state,id,{type:'claim'}).receipt,null);
 });
 test(id+': old unfinished marker progress restarts, collected rewards survive',()=>{const S=load().BladefallSideStories;const active=S.normalize({quests:{[id]:{phase:'active',step:1}}});assert.equal(S.row(active,id).step,0);assert.equal(S.row(active,id).revision,2);const saved=S.normalize({quests:{[id]:{phase:'completed',claimed:true}}});assert.equal(S.row(saved,id).phase,'completed');assert.equal(S.row(saved,id).claimed,true);});
}
test('approved quest pairs stay in base regions and preserve the Outskirts',()=>{const c=load(),S=c.BladefallSideStories;assert.equal(S.records.length,20);assert.equal(S.byId.gatekeeper.tasks.length,3);assert.deepEqual(Object.values(c.BladefallQuestRound2Stories.stories).map(q=>q.world),[4,5,10,12,16]);assert.ok(ids.every(id=>!S.byId[id].resolutions));});
