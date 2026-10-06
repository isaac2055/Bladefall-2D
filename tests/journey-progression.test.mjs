import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const ctx=vm.createContext({});
for(const file of ['bladefall-journey.js','bladefall-blood.js'])vm.runInContext(readFileSync(new URL('../public/'+file,import.meta.url),'utf8'),ctx);
const J=ctx.BladefallJourney,B=ctx.BladefallBlood;
test('four fragments add exactly one visible health point and seals power both weapons through one multiplier',()=>{
 let state=J.create();for(const [id,r] of Object.entries(J.REWARDS).filter(([,r])=>r.vitality===1).slice(0,4))state=J.claim(state,id).state;
 const p=J.profile(state);assert.equal(p.healthBonus,1);assert.equal(p.fragments,0);assert.equal(B.maxMeasures(p),6);
 state=J.claim(state,'boss:brute').state;assert.equal(J.profile(state).powerMultiplier,1+(p.forge+1)*.06);
 assert.equal(J.claim(state,'boss:brute').changed,false);
});
test('each entry has exactly the prior attainable sources, including delayed return-route rewards',()=>{
 for(let stage=0;stage<=14;stage++){
 // 7.234: shops are cut for now, so a preview never includes a workshop reward.
 const state=J.preview(stage);for(const [id,r] of Object.entries(J.REWARDS))assert.equal(state.claimed.includes(id),r.entry<=stage&&!id.startsWith('workshop:'),`${stage}: ${id}`);
 }
 assert.equal(J.preview(2).claimed.includes('boss:brute'),false);
 assert.equal(J.preview(7).claimed.includes('secret:recall-return-brute'),false);
 assert.equal(J.preview(8).claimed.includes('secret:recall-return-brute'),true);
 assert.equal(J.preview(10).claimed.includes('boss:colossus'),false);
});
test('legacy claimed sources migrate once and continue to count after old forge spending',()=>{
 const state=J.migrate(null,{forgeSeals:0,sources:['boss:brute','boss:brute','unknown']});
 assert.equal(J.profile(state).forge,1);assert.equal(J.migrate(state,{sources:['boss:brute']}).claimed.length,1);
 const restored=J.create(JSON.parse(JSON.stringify(state)));assert.equal(J.profile(restored).forge,1);
});
test('preview and campaign records remain independent',()=>{
 const campaign=J.claim(null,'boss:brute').state;const preview=J.preview(10);J.claim(preview,'boss:colossus');assert.equal(campaign.claimed.length,1);assert.equal(preview.claimed.includes('boss:colossus'),false);
});
test('preview gifts are cumulative but cannot include the selected stage reward',()=>{
 assert.equal(J.preview(1).gifts.includes('ward'),false);assert.equal(J.preview(2).gifts.includes('ward'),true);
 assert.equal(J.preview(3).gifts.includes('gale-stitch'),false);assert.equal(J.preview(4).gifts.includes('gale-stitch'),true);
 assert.equal(J.preview(9).gifts.includes('ember-step'),false);assert.equal(J.preview(10).gifts.includes('ember-step'),true);
 const state=J.preview(9);state.attitudes.oren=2;const restored=J.create(JSON.parse(JSON.stringify(state)));assert.equal(restored.attitudes.oren,2);assert.equal(restored.gifts.length,state.gifts.length);
});
test('all runtime roster speakers have distinct three-way responses',()=>{
 vm.runInContext(readFileSync(new URL('../public/bladefall-conversation.js',import.meta.url),'utf8'),ctx);
 for(const name of ['Mara','Vey','Olan','Bram','Orra','Pell','Hale','Oren','Sable','Talla','Edrin','Senn','Veya','Nim','Daro']){
 const rows=ctx.BladefallConversation.voice(name);assert.equal(rows.length,3,name);assert.equal(new Set(rows.map(r=>r[0])).size,3,name);
 }
});

test('Inversion rewards arrive after its own challenges, not on entry',()=>{
 assert.equal(J.preview(12).claimed.includes('workshop:last-inventory'),false,'shops are cut (7.234)');
 for(const id of ['authored:inversion-drop-lock','authored:inversion-last-breath']){
  assert.equal(J.preview(11).claimed.includes(id),false);assert.equal(J.preview(12).claimed.includes(id),true);
  const once=J.claim(J.preview(11),id);assert.equal(once.changed,true);assert.equal(J.claim(once.state,id).changed,false);
 }
});

test('Citadel caches count only after that region and cannot be farmed',()=>{
 for(const id of ['secret:citadel-refuge-loft','secret:citadel-vigil-cache']){
  assert.ok(!J.preview(12).claimed.includes(id));
  assert.ok(J.preview(13).claimed.includes(id));
  const first=J.claim(J.create(),id);assert.equal(first.changed,true);
  assert.equal(J.claim(first.state,id).changed,false);
 }
});

 test('Throne exploration and dialogue rewards are one-time and excluded from its entry loadout',()=>{
 for(const id of ['secret:throne-tide-cache','dialogue:oren-throne-repair']){
 assert.equal(J.preview(13).claimed.includes(id),false);
 assert.equal(J.preview(14).claimed.includes(id),true);
 const first=J.claim(J.preview(13),id);assert.equal(first.changed,true);
 assert.equal(J.claim(first.state,id).changed,false);
 }
 });

test('late abilities enter perfect previews only after their unlock regions',()=>{
 assert.equal(J.preview(9).gifts.includes('oren-dash'),false);
 assert.equal(J.preview(10).gifts.includes('oren-dash'),true);
 assert.equal(J.preview(13).gifts.includes('pure-nail'),false);
 assert.equal(J.preview(14).gifts.includes('pure-nail'),true);
});
