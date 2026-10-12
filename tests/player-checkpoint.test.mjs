import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
function fn(name){const start=source.indexOf('function '+name+'(');assert.ok(start>=0);const brace=source.indexOf('{',start);let depth=0;for(let i=brace;i<source.length;i++){if(source[i]==='{')depth++;if(source[i]==='}'&&--depth===0)return source.slice(start,i+1);}throw Error(name);}
function setup(){
 const floor={type:'plat',x:100,w:400,y:0};
 const G={stageIndex:9,time:1,checkpointCharge:0,p:{x:100,y:0,w:26,onGround:true},obstacles:[floor,{type:'check',x:20}],coopSession:false};
 const meta={run:{},hardcore:false};const saves=[];
 const ctx=vm.createContext({G,meta,FLAG_MAX:3,mode:'play',getFloor:()=>({y:0,o:floor}),toast(){},hudUpdate(){},persist(){},
  captureBossCheckpoint:()=>null,activateRuntimeCheckpoint(id,position){G.p.ckX=position.x;G.p.ckY=position.y;saves.push({id,position,charge:G.checkpointCharge});return{checkpoint:{id,position}};}});
 for(const name of ['Check','removeAuthoredCheckpointFlags','restorePlayerCheckpointFlag','earnCheckpointCharge','placeEarnedCheckpoint'])vm.runInContext(fn(name),ctx);
 return {G,meta,floor,saves,run:code=>vm.runInContext(code,ctx)};
}
test('kills bank flags up to three; each successful placement spends one (7.319)',()=>{
 const t=setup();assert.equal(t.run('placeEarnedCheckpoint()'),false);
 t.run('earnCheckpointCharge();earnCheckpointCharge();earnCheckpointCharge();earnCheckpointCharge();');assert.equal(t.G.checkpointCharge,3);
 assert.equal(t.run('placeEarnedCheckpoint()'),true);assert.equal(t.G.checkpointCharge,2);assert.equal(t.saves[0].charge,2);
 t.G.time++;assert.equal(t.run('placeEarnedCheckpoint()'),true);t.G.time++;assert.equal(t.run('placeEarnedCheckpoint()'),true);
 assert.equal(t.G.checkpointCharge,0);assert.equal(t.run('placeEarnedCheckpoint()'),false);assert.equal(t.saves.length,3);
 t.G.p.x=200;t.G.time++;t.run('earnCheckpointCharge();placeEarnedCheckpoint();');
 assert.equal(t.G.obstacles.filter(o=>o.type==='check').length,1);assert.equal(t.G.p.ckX,200);
});
test('unsafe placement preserves the earned charge',()=>{
 for(const field of ['move','crumble','brittle','heatCycle','gate','gone','fake']){
  const t=setup();t.run('earnCheckpointCharge()');t.floor[field]=true;
  assert.equal(t.run('placeEarnedCheckpoint()'),false,field);assert.equal(t.G.checkpointCharge,1);
 }
 const t=setup();t.run('earnCheckpointCharge()');t.G.p.onGround=false;
 assert.equal(t.run('placeEarnedCheckpoint()'),false);assert.equal(t.G.checkpointCharge,1);
});
test('authored flags disappear but other saving objects remain; a placed flag restores',()=>{
 const t=setup();t.G.obstacles.push({type:'restSite',id:'rest'});t.run('removeAuthoredCheckpointFlags()');
 assert.equal(t.G.obstacles.some(o=>o.type==='check'),false);assert.ok(t.G.obstacles.some(o=>o.type==='restSite'));
 t.G.placedCheckpoint={stage:9,x:120,y:0};t.run('restorePlayerCheckpointFlag();restorePlayerCheckpointFlag();');
 assert.equal(t.G.obstacles.filter(o=>o.playerCheckpoint).length,1);
 t.G.stageIndex=10;t.G.obstacles=[];t.run('restorePlayerCheckpointFlag()');assert.equal(t.G.obstacles.length,0);
});
test('earning a charge does not overwrite the saved recovery position',()=>{
 const t=setup();t.meta.run.previewCheckpoint={position:{x:25,y:40}};t.run('earnCheckpointCharge()');
 assert.equal(t.meta.run.checkpointCharge,1);assert.equal(t.meta.run.previewCheckpoint.position.x,25);assert.equal(t.saves.length,0);
});


test('boss snapshot preserves health, phase, timers and shared arena references across save JSON',()=>{
 const bed={type:'plat',x:100,y:0,w:400},boss={hp:43,maxHp:100,phase:2,forgeAct:2,colossusForge:true,target:bed};bed.boss=boss;
 const G={stageIndex:10,time:22,levelLength:2000,p:{x:100,y:0},boss,obstacles:[bed],enemies:[boss],npcs:[],projectiles:[{owner:boss}],colossusPours:[{warn:1}],checkpointCharge:0};
 const ctx=vm.createContext({G,VW:1280,GROUND_Y:576,BFCamera:{reset(){}},buildZonePersistenceManifest:()=>[],colossusActCheckpoint:0,getFloor:()=>({o:G.obstacles[0]}),restorePlayerCheckpointFlag(){}});
 vm.runInContext(fn('captureBossCheckpoint')+fn('restoreBossCheckpoint'),ctx);
 G.placedCheckpoint={stage:10,x:100,y:0,encounter:JSON.parse(JSON.stringify(vm.runInContext('captureBossCheckpoint()',ctx)))};
 boss.hp=2;boss.phase=3;bed.y=400;G.time=90;
 assert.equal(vm.runInContext('restoreBossCheckpoint({position:{x:100,y:0}})',ctx),true);
 assert.equal(G.boss.hp,43);assert.equal(G.boss.phase,2);assert.equal(G.time,22);
 assert.equal(G.boss.target,G.obstacles[0]);assert.equal(G.obstacles[0].boss,G.boss);assert.equal(G.projectiles[0].owner,G.boss);
 assert.equal(G.enemies[0],G.boss);assert.equal(G.colossusPours[0].warn,1);
 G.boss.hp=5;assert.equal(vm.runInContext('restoreBossCheckpoint({position:{x:900,y:0}})',ctx),false);assert.equal(G.boss.hp,5);
 vm.runInContext('restoreBossCheckpoint({position:{x:100,y:0}})',ctx);assert.equal(G.boss.hp,43,'snapshot remains immutable across retries');
});
