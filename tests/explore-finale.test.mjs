import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../public/bladefall-explore-finale.js',import.meta.url),'utf8');
function load({host='bladefall2d.pages.dev',saved={},cleared=[],records=[],archives=[]}={}){
 const implementations={},buttons={},G={stageIndex:45,ngPlus:0,p:{},actTwo:{won:true}},meta={exploreFinale:structuredClone(saved),world:{cleared}},window={location:{hostname:host,protocol:'https:'},BladefallActTwo:{register(i,a){implementations[i]=a;}},BladefallActTwoArt:{register(){}},BladefallFractured:{},BladefallPlaytest:{state:()=>({data:{player:'me',records,archives}})}};
 const ctx=vm.createContext({window,G,meta,BFWorldModule:{stageId:i=>'world-'+i},mode:'play',persist(){},showGameUI(){},showOvHTML(html){ctx.html=html;},document:{getElementById(id){return buttons[id]||(buttons[id]={classList:{remove(){}}});}},titleScreen(){}});
 vm.runInContext(source,ctx);return {api:window.BladefallExploreFinale,G,meta,ctx,buttons,implementations};
}
test('online finales require all forty actual world completions; local preview remains available',()=>{
 const t=load();assert.equal(t.api.MAIN.length,40);assert.equal(t.api.visible(),false);
 t.meta.exploreFinale.cleared=Array.from(t.api.MAIN).slice(0,-1);assert.equal(t.api.visible(),false);
 t.meta.exploreFinale.cleared.push(40);assert.equal(t.api.visible(),true);
 for(const host of ['localhost','127.0.0.1','[::1]'])assert.equal(load({host}).api.visible(),true);
 assert.equal(load({host:'notlocalhost.example'}).api.visible(),false);
});
test('historical clears and own saved world times migrate the unlock, never stranger records',()=>{
 const stages=Array.from(load().api.MAIN);
 assert.equal(load({cleared:stages.map(i=>'world-'+i)}).api.visible(),true);
 const records=stages.map(world=>({world,mode:'explore',player:'me'}));assert.equal(load({records}).api.visible(),true);
 assert.equal(load({records:records.map(r=>({...r,player:'stranger'}))}).api.visible(),false);
 assert.equal(load({archives:[{season:'playtest-2026-10-v1',records}]}).api.visible(),true,'a course season reset does not relock Explore finales');
 assert.equal(load({archives:[{records:records.map(r=>({...r,player:'stranger'}))}]}).api.visible(),false);
 assert.equal(load({records:records.map(r=>({...r,eligible:false}))}).api.visible(),false);
});
test('test-mode, wrong-stage, co-op and NG+ clears cannot silently unlock solo finale rows',()=>{
 const t=load();t.G.stageIndex=0;assert.equal(t.api.noteClear(1),false);
 for(const [where,key] of [[t.meta,'testMode'],[t.G,'usedTestMode'],[t.G,'coopSession'],[t.G,'ngPlus']]){where[key]=true;assert.equal(t.api.noteClear(0),false);where[key]=false;}
 assert.equal(t.api.noteClear(0),true);assert.deepEqual(Array.from(t.meta.exploreFinale.cleared),[0]);
});
test('Kill, Merge and Forget persist separate real power changes; choices require a won Echo fight',()=>{
 for(const [choice,power] of [['kill',1.15],['merge',3],['forget',.7]]){
  const t=load();t.G.actTwo.won=false;assert.equal(t.api.choose(choice),false);t.G.actTwo.won=true;
  assert.equal(t.api.choose(choice),true);assert.equal(t.meta.exploreFinale.choice,choice);assert.equal(t.meta.exploreFinale.echoDefeated,true);assert.equal(t.api.power(),power);
  const reloaded=load({saved:JSON.parse(JSON.stringify(t.meta.exploreFinale))});assert.equal(reloaded.api.power(),power);
  reloaded.G.stageIndex=41;assert.equal(reloaded.api.power(),1,'standalone precision physics untouched');
  reloaded.G.stageIndex=43;reloaded.G.vesperEncounter=true;assert.equal(reloaded.api.power(),1,'the secret first encounter has no carried choice boost');
 }
});
test('the Final Echo is a playable registered stage; each ending records an actual completed Explore game',()=>{
 for(const choice of ['kill','merge','forget']){
  const t=load({saved:{choice}});assert.equal(typeof t.implementations[45].updateFoe,'function');
  t.meta.run={stageIndex:43};t.api.ending();assert.equal(t.meta.gameBeaten,true);assert.equal(t.meta.exploreFinale.vesperDefeated,true);assert.equal(t.meta.run,null);assert.match(t.ctx.html,/EXPLORE COMPLETE/);
 }
});


test('Vesper requires this won Echo and choice transition; old Merge alone gives no advantage',()=>{
 for(const [choice,power,ward] of [['kill',1.15,.25],['merge',3,1],['forget',.7,.25]]){
  const t=load({saved:{choice}});Object.assign(t.ctx,{loadStage(stage){t.G.stageIndex=stage;t.G.actTwo={};},restoreBlood(){},activateRuntimeCheckpoint(){},snapOf(){return {};},saveRunAtStage(){},showOverlay(){},hudUpdate(){}});
  t.G.stageIndex=43;assert.equal(t.api.power(),1);assert.equal(t.api.vesperWard(),.01);assert.equal(t.api.vesperMerged(),false);
  t.G.stageIndex=45;t.G.actTwo={won:true};t.api.choose(choice);t.buttons['finale-0'].onclick();
  assert.equal(t.G.stageIndex,43);assert.equal(t.G.vesperFromEcho,true);assert.equal(t.api.power(),power);assert.equal(t.api.vesperWard(),ward);assert.equal(t.api.vesperMerged(),choice==='merge');
 }
 const t=load({saved:{choice:'merge'}});Object.assign(t.ctx,{loadStage(stage){t.G.stageIndex=stage;},restoreBlood(){},activateRuntimeCheckpoint(){},snapOf(){return {};},saveRunAtStage(){},showOverlay(){},hudUpdate(){}});
 t.api.travel(43,false);assert.equal(t.G.vesperFromEcho,false,'won state alone without a new choice is insufficient');assert.equal(t.api.vesperWard(),.01);
});

function combat(){
 const t=load(),{G,ctx,implementations}=t;Object.assign(G,{stageIndex:45,enemies:[],obstacles:[],p:{x:1000,y:0,w:26,h:44,face:1,blood:10,invuln:0,dodgeTimer:0},levelLength:2200});
 Object.assign(ctx,{GrAt:()=>({}),Pl:()=>({}),restoreBlood(p,n){p.blood=n===Infinity?10:Math.min(10,p.blood+n);},spawnEnemy(type,x){const e={type,x};G.enemies.push(e);return e;},hurtPlayer(dmg,dir,real,measures){G.p.blood-=measures;G.p.invuln=.5;},tryPlayerCounter:()=>false});
 Object.assign(ctx.window.BladefallFractured,{setKit(){},checkpoints(){}});ctx.window.BladefallCloakedMan={constants:{KIT:{}}};
 const impl=implementations[45];impl.level().build();impl.update(1/60,G.p);return {...t,impl};
}
test('Echo takes one quarter blade damage and every live body can deal three Blood',()=>{
 const {api,G,impl}=combat();const hp=G.actTwo.hp;G.actTwo.foe.hp-=40;impl.updateFoe(G.actTwo.foe,G.p,0);assert.equal(G.actTwo.hp,hp-10);
 assert.equal(api.restoreFlagEcho(),true);assert.equal(G.enemies.length,2);const clone=G.enemies[1];assert.equal(clone.echoClone,true);assert.equal(G.actTwo.foe,G.enemies[0]);
 clone.hp-=40;impl.updateFoe(clone,G.p,0);assert.equal(G.actTwo.hp,hp-20,'a blade striking the clone damages the same boss');
 for(const e of G.enemies){G.p.blood=10;G.p.invuln=0;Object.assign(e,{x:G.p.x,st:'dash',dir:1,t:0});impl.updateFoe(e,G.p,0);assert.equal(G.p.blood,7);}
 G.actTwo.phase=1;G.actTwo.hp=1;clone.hp-=8;impl.updateFoe(clone,G.p,0);assert.equal(G.actTwo.won,true);assert.ok(G.enemies.every(e=>!e.active&&e.portalGate==='echo-yielded'));
});
test('flag restoration preserves Echo state aliases and adds one real attacker per saved return',()=>{
 const t=combat(),{G,ctx}=t;const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
 function fn(name){const at=html.indexOf('function '+name+'('),brace=html.indexOf('{',at);let d=0;for(let i=brace;i<html.length;i++){if(html[i]==='{')d++;else if(html[i]==='}'&&--d===0)return html.slice(at,i+1);}throw Error(name);}
 Object.assign(ctx,{VW:1280,GROUND_Y:576,BFCamera:{reset(){}},buildZonePersistenceManifest:()=>[],getFloor:()=>({o:{}}),restorePlayerCheckpointFlag(){}});
 vm.runInContext(fn('captureBossCheckpoint')+fn('restoreBossCheckpoint'),ctx);G.actTwo.hp=100;G.actTwo.phase=1;
 G.placedCheckpoint={stage:45,x:1000,y:0,encounter:JSON.parse(JSON.stringify(vm.runInContext('captureBossCheckpoint()',ctx)))};
 for(let retry=0;retry<2;retry++){
  G.actTwo.hp=20;G.enemies=[];assert.equal(vm.runInContext('restoreBossCheckpoint({position:{x:1000,y:0}})',ctx),true);
  assert.equal(G.actTwo.hp,100);assert.equal(G.actTwo.phase,1);assert.equal(G.actTwo.foe,G.enemies[0]);assert.equal(G.boss,G.actTwo.bar);assert.equal(G.enemies.length,2);assert.equal(G.actTwo.flagReturns,1);
 }
});
