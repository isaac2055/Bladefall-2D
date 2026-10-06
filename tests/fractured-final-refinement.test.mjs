import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const read = n => readFileSync(new URL('../public/bladefall-fractured-'+n+'.js', import.meta.url), 'utf8');
function fn(src, name){
 const start=src.indexOf('function '+name+'('); assert.ok(start>=0,name);
 const brace=src.indexOf('{',start); let d=0;
 for(let i=brace;i<src.length;i++){if(src[i]==='{')d++;else if(src[i]==='}'&&!--d)return src.slice(start,i+1);}
 throw Error(name);
}
function load(n){const c=vm.createContext({window:{BladefallActTwo:{register(){},kit:{}},BladefallFractured:{registerEcho(){}}}});vm.runInContext(read(n),c);return Object.values(c.window).find(o=>o.constants).constants;}
for(const [region,boss] of [['inversion','Keel'],['tyrant','Tearer'],['king','Crown'],['cliffs','Head'],['shores','Guard'],['colony','Ringer'],['path','Keeper'],['palace','King']]){
 test(region+': dead player cannot advance attacks or score a pending hit',()=>{
  const e={t:2,hp:1,hpWas:9999,portalGate:'melee'}, A={marks:0};
  const c=vm.createContext({e,A,p:{dead:true}});vm.runInContext(fn(read(region),'update'+boss)+`;update${boss}(A,e,p,.1)`,c);
  assert.equal(e.t,2);assert.equal(A.marks,0);assert.equal(e.hp,1);
 });
}
test('Cliffs: the last collar strike keeps the released head down',()=>{
 const K=load('cliffs'), A={phase:2,freed:false},e={st:'taut',t:0,x:100,y:90,w:80,h:70},p={x:100,y:160,slamming:true,fcSlamFrom:1000};
 const c=vm.createContext({...K,A,e,p,mark(a,b){a.freed=true;b.st='down';}});
 vm.runInContext(fn(read('cliffs'),'updateHead')+';updateHead(A,e,p,.016)',c);
 assert.equal(A.freed,true);assert.equal(e.st,'down');assert.equal(p.jumpCutOk,false);
});
test('Palace: only the actual light exit is removed, independent of surface and array order',()=>{
 const K=load('palace');
 for(const surf of ['floor','wall'])for(const reversed of [false,true]){
  const entrance={surf:'floor',x:100},exit={surf,x:200},G={cratePortals:reversed?[exit,entrance]:[entrance,exit]},e={x:0,y:0,h:100,lightExit:exit};
  const c=vm.createContext({...K,G,e,p:{x:500},kit:{burst(){}},A:{}});
  vm.runInContext(fn(read('palace'),'blink')+';blink(A,e,p,true)',c);
  assert.deepEqual(G.cratePortals,[entrance]);
 }
});
test('Palace: timed blinks preserve both mouths',()=>{
 const a={},b={},G={cratePortals:[a,b]},e={x:0,y:0,h:100,lightExit:b};
 const c=vm.createContext({...load('palace'),G,e,p:{x:500},kit:{burst(){}},A:{}});
 vm.runInContext(fn(read('palace'),'blink')+';blink(A,e,p,false)',c);
 assert.deepEqual(G.cratePortals,[a,b]);
});
for(const [region,action] of [['colony','tap'],['path','windlass'],['palace','light']])test(region+': dead player cannot advance local mechanisms',()=>{
 const A={rays:[],turns:1,tapped:false},p={dead:true,slamming:true,onGround:true,floorPlat:{fcoTap:true,fpWindlass:true}};
 const c=vm.createContext({A,p});vm.runInContext(fn(read(region),action)+`;${action}(A,p,.1)`,c);
 assert.equal(A.turns,1);assert.equal(A.tapped,false);
});
test('Path: the overlook beam remains finite and crosses all three rings without an explicit phase',()=>{
 const K=load('path'),c=vm.createContext({...K});vm.runInContext(fn(read('path'),'poolX'),c);
 const positions=Array.from({length:481},(_,i)=>c.poolX(K.OVERLOOK_BEAM,i/100));
 assert.ok(positions.every(Number.isFinite));
 for(const [x] of K.OVERLOOK.rings)assert.ok(positions.some(px=>Math.abs(px-x)<70));
});
for(const [region,action,floor,flag] of [['cliffs','windlass','fcWindlass','hook'],['colony','tap','fcoTap','tapped'],['path','windlass','fpWindlass','opened']]){
 test(region+': long slam from a previously used height still activates on landing',()=>{
  const K=load(region),A={slamSeen:1000,slamT:0,turns:0,slipT:0,t:1,queue:[]},p={x:K.GATE?.windlass.x||0,slamming:true,slamFromY:1000,onGround:false};
  const c=vm.createContext({...K,A,p,ZONE:'fixture',STAGE:39,kit:{latch(){},burst(){}},F:{grant(){},clear(){}},setBars(){},gateLit(){return true;}});
  vm.runInContext(fn(read(region),action),c);
  for(let i=0;i<60;i++)c[action](A,p,1/60);
  p.slamming=false;p.onGround=true;p.floorPlat={[floor]:true};c[action](A,p,1/60);
  if(region==='path')assert.equal(A.turns,1);else assert.equal(A[flag],true);
 });
}
test('Path: a second slam from exactly the same launch height advances another turn',()=>{
 const K=load('path'),A={turns:0,slipT:0,t:1,queue:[]},p={x:K.GATE.windlass.x,slamFromY:1000,slamming:true,onGround:false};
 const c=vm.createContext({...K,A,p,ZONE:'fixture',STAGE:39,kit:{latch(){},burst(){}},F:{clear(){}},setBars(){},gateLit(){return true;}});
 vm.runInContext(fn(read('path'),'windlass'),c);
 for(let strike=0;strike<2;strike++){
  p.slamming=true;p.onGround=false;for(let i=0;i<60;i++)c.windlass(A,p,1/60);
  p.slamming=false;p.onGround=true;p.floorPlat={fpWindlass:true};c.windlass(A,p,1/60);
 }
 assert.equal(A.turns,2);
});
for(const [region,update,actorFlag] of [['palace','updateKing','yielded'],['colony','updateRinger','silenced'],['shores','updateGuard','broken'],['king','updateCrown','crowned']]){
 test(region+': final real hit handler remains defeated through the following update',()=>{
  const K=load(region),A={phase:2,marks:1,fight:true,queue:[],flares:[],breakers:[],chained:[{free:false}],tollT:0,king:null},e={x:8500,y:0,w:60,h:100,st:'kneel',t:0,hp:9990,hpWas:9999,portalGate:'melee',face:-1,turnT:0,cool:1,blinkT:0,exposedT:1},p={x:8450,y:0};
  const G={projectiles:[],cratePortals:[{},{}]},meta={soundOn:false};let clears=0;
  const c=vm.createContext({...K,A,e,p,G,meta,STAGE:40,ZONE:'fixture',kit:{burst(){},latch(){}},F:{clear(){clears++;}},setBars(){},clearMarks(){},persist(){},clearPlacedPortals(){G.cratePortals=[];}});
  vm.runInContext(fn(read(region),'struck')+'\n'+fn(read(region),update),c);
  c[update](A,e,p,.016);c[update](A,e,p,.016);
  assert.equal(A[actorFlag],true);assert.equal(e.st,'down');assert.equal(A.fight,false);assert.equal(clears,1);assert.equal(A.queue.length,1);
  if(region==='palace'){assert.equal(meta.actThreeDone,true);assert.equal(G.cratePortals.length,0);}
  if(region==='colony')assert.equal(A.chained[0].free,true);
 });
}
