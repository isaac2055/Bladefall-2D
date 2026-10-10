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
