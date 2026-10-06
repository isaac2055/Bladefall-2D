import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
const hurt=html.slice(html.indexOf('function hurtPlayer('),html.indexOf('/* Elemental status effects'));
function fixture(){
 const p={x:800,y:200,hp:5,blood:5,bloodGuard:0,invuln:0,dodgeTimer:0,ckSet:true,ckX:100,ckY:0};
 const G={p,stageIndex:11,shake:0,runStats:{taken:0}};let resets=0,deaths=0;
 const context=vm.createContext({G,meta:{},GROUND_Y:576,resolveEchoEvent(){},defenseR:()=>.22,vitalityKnotCount:()=>0,syncBloodMirror(p){p.hp=p.blood;},addText(){},hasGift:()=>false,buzz(){},coopRespawnAtPartner:()=>false,clearPlacedPortals(){resets++;},recoverEmberCompanion(){},restoreBossCheckpoint(){},coopDownPlayer:()=>false,die(){deaths++;}});
 vm.runInContext(readFileSync(new URL('../public/bladefall-blood.js',import.meta.url),'utf8'),context);context.BFBloodModule=context.BladefallBlood;
 vm.runInContext(hurt,context);
 return {p,G,context,hit:(dmg,real=false,measures)=>context.hurtPlayer(dmg,1,real,measures),resets:()=>resets,deaths:()=>deaths};
}
test('positive-damage hazards wound in place and preserve the room/portals',()=>{
 for(const damage of [8,14,18,22,40]){const f=fixture();f.hit(damage);assert.equal(f.p.blood,4);assert.equal(f.p.x,800);assert.equal(f.p.y,200);assert.equal(f.resets(),0);assert.ok(f.p.invuln>0);f.hit(damage);assert.equal(f.p.blood,4);}
});
test('oblivion resets even during dash/invulnerability or with Ward nearly charged',()=>{
 const f=fixture();f.p.invuln=1;f.p.dodgeTimer=.2;f.p.bloodGuard=.99;f.hit(0);assert.equal(f.p.x,100);assert.equal(f.p.y,0);assert.equal(f.p.blood,4);assert.equal(f.resets(),1);assert.equal(f.p.dodgeTimer,0);
});
test('hazards can still kill; enemy damage is unchanged',()=>{
 const f=fixture();f.p.blood=1;f.hit(18);assert.equal(f.deaths(),1);assert.equal(f.resets(),0);
 const enemy=fixture();enemy.hit(18,true);assert.equal(enemy.p.blood,4);assert.equal(enemy.p.x,800);
});
test('test mode ignores hazards but still recovers from oblivion',()=>{
 const f=fixture();f.context.meta.testMode=true;f.hit(18);assert.equal(f.p.blood,5);assert.equal(f.p.x,800);f.hit(0);assert.equal(f.p.x,100);assert.equal(f.p.blood,5);
});

test('serpentine wounds cost three bars, respect Ward, and never relocate',()=>{
 const f=fixture();f.hit(20,false,3);assert.equal(f.p.blood,2);assert.equal(f.p.x,800);assert.equal(f.resets(),0);
 const ward=fixture();ward.p.bloodGuard=.9;ward.hit(20,false,3);assert.equal(ward.p.blood,5);assert.equal(ward.resets(),0);
 const fatal=fixture();fatal.p.blood=3;fatal.hit(20,false,3);assert.equal(fatal.deaths(),1);
});
