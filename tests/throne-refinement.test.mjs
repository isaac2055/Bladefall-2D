import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
function fn(name){const start=source.indexOf('function '+name+'('),brace=source.indexOf('{',start);let depth=0;for(let i=brace;i<source.length;i++){if(source[i]==='{')depth++;if(source[i]==='}'&&!--depth)return source.slice(start,i+1);}throw Error(name);}
test('portal button cancels a live clone trial without changing boss progress',()=>{
 const G={p:{_restMouth:{}},cratePortals:[{},{}],boss:{echoFight:true,portalHijack:{},echoFractures:2},echoTrial:{active:true},obstacles:[{type:'echoSigil',lit:true}]};
 const c=vm.createContext({G,v4Region:()=>true,BFPortalProgression:{recordClear(){}}});
 vm.runInContext(fn('clearPlacedPortals')+fn('placePortal'),c);vm.runInContext('placePortal()',c);
 assert.equal(G.cratePortals.length,0);assert.equal(G.echoTrial,null);assert.equal(G.boss.echoFractures,2);assert.equal(G.p._restMouth,null);assert.equal(G.obstacles[0].lit,false);
 // An ordinary pair can also reset in midair without asking for an anchor/surface.
 G.cratePortals=[{},{}];vm.runInContext('placePortal()',c);assert.equal(G.cratePortals.length,0);
});
test('Keep arrival rolls from the tunnel and finishes on foot at the intended landing',()=>{
 const G={p:{},time:0};let recoveries=0;
 const c=vm.createContext({G,recoverEmberCompanion:()=>recoveries++});vm.runInContext(fn('beginRailArrival')+fn('updateRailTransition'),c);
 vm.runInContext("beginRailArrival({connectorId:'deep-line-keep',targetZoneId:'ruined-keep'})",c);
 assert.equal(G.p.x,17580);vm.runInContext('updateRailTransition(.8)',c);assert.ok(G.p.x<17580&&G.p.x>17470);
 vm.runInContext('updateRailTransition(.9)',c);assert.equal(G.p.x,17400);assert.equal(G.p.y,0);assert.equal(G.p.onGround,true);assert.equal(G.railTransition,null);assert.equal(recoveries,1);
});
test('boarding reaches the cart before departing and triggers the seam only at the end',()=>{
 const G={p:{},time:0,railTransition:{t:0,fromX:18280,cartX:18300,y:0}};let crossings=0;
 const c=vm.createContext({G,updatePhysicalWorldSeams:()=>crossings++});vm.runInContext(fn('updateRailTransition'),c);
 vm.runInContext('updateRailTransition(.5)',c);assert.equal(G.p.x,18300);assert.equal(crossings,0);
 vm.runInContext('updateRailTransition(1.2)',c);assert.equal(G.p.x,18540);assert.equal(G.railTransition.ready,true);assert.equal(crossings,1);
});
test('collected relics are no longer invisible interaction targets',()=>{
 const c=vm.createContext({G:null});vm.runInContext(fn('outskirtsAuthoredInteractable'),c);
 assert.equal(vm.runInContext("outskirtsAuthoredInteractable({type:'storyRelic',found:true})",c),false);
 assert.equal(vm.runInContext("outskirtsAuthoredInteractable({type:'storyRelic',found:false})",c),true);
});
