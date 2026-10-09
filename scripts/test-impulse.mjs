import assert from 'node:assert/strict';
import {Core,keysToInput} from './pcore-tape.mjs';
const D=globalThis.BladefallPrecisionImpulse;
const tests=[];const test=(name,fn)=>tests.push([name,fn]);
function fixture({wall=false,noSeed=false}={}){const m=Array.from({length:23},(_,r)=>Array.from({length:40},(_,c)=>r===22||c===0||c===39?'#':'.'));m[20][3]='P';if(wall)for(let r=8;r<20;r++)m[r][14]='#';return{id:'impulse-test',map:m.map(r=>r.join('')),...(!noSeed?{impulseSeeds:[{id:'A',c:12,r:14}]}:{})};}
function g(opts){return Core.createGame([fixture(opts)]);}
const seed=q=>D.seeds(q)[0];const count=(q,t)=>q.events.filter(e=>e.type===t).length;
function ticks(q,n,k=''){for(let i=0;i<n;i++)Core.step(q,keysToInput(k));}
function place(q,x,y){Object.assign(q.p,{x,y,vx:0,vy:0,remX:0,remY:0,onGround:false,wasGround:false,jumpGrace:0,state:'normal'});}
function prime(q){place(q,80,111);ticks(q,1,'s');assert.equal(seed(q).state,'windup');return q;}
function ready(q){prime(q);ticks(q,D.IK.windup);assert.equal(seed(q).state,'charged');return q;}
function topCut(q){const e=seed(q);place(q,e.x,e.y-20);q.p.dashes=0;q.p.stamina=7;ticks(q,1,'ds');}

test('opt-in only; malformed or embedded starts fail clearly',()=>{assert.equal(D.seeds(g({noSeed:true})).length,0);const d=fixture();d.impulseSeeds[0].r=22;assert.throws(()=>Core.createGame([d]),/solid/);d.impulseSeeds=[{c:3,r:5,id:'A'},{c:4,r:5,id:'A'}];assert.throws(()=>Core.createGame([d]),/Invalid/);});
test('idle touch and a whiff pay no movement reward',()=>{const q=g();place(q,96,112);q.p.dashes=0;ticks(q,1);assert.equal(seed(q).state,'idle');assert.equal(q.p.dashes,0);place(q,40,80);ticks(q,1,'s');assert.equal(count(q,'impulse-prime'),0);assert.equal(count(q,'impulse-burst'),0);});
test('prime moves a seed exactly 24px with a separate visible windup',()=>{const q=g();prime(q);assert.equal(seed(q).x,96);assert.equal(count(q,'impulse-burst'),0);ticks(q,17);assert.equal(seed(q).state,'windup');ticks(q,1);assert.equal(seed(q).x,120);assert.equal(seed(q).state,'charged');assert.equal(count(q,'impulse-ready'),1);});
test('solid terrain stops the nudge without tunneling',()=>{const q=ready(g({wall:true}));assert.equal(seed(q).x,104);assert.equal(Core.solidAt(q,seed(q).x,seed(q).y,8,8),false);});
test('a wall between blade and seed blocks remote cuts',()=>{const q=g();q.room.grid[14*40+11]=Core.SOLID;place(q,80,111);ticks(q,1,'s');assert.equal(count(q,'impulse-prime'),0);});
test('one swing cannot prime and burst even if readiness arrives during its blade window',()=>{const q=prime(g());seed(q).timer=1;ticks(q,1,'s');assert.equal(seed(q).state,'charged');assert.equal(count(q,'impulse-burst'),0);});
test('top burst is radial, preserves spent resources, and ignores passive contact',()=>{const q=ready(g());place(q,seed(q).x,seed(q).y);ticks(q,1);assert.equal(seed(q).state,'charged');topCut(q);assert.equal(count(q,'impulse-burst'),1);assert.equal(q.p.vx,0);assert.equal(q.p.vy,-300);assert.equal(q.p.dashes,0);assert.equal(q.p.stamina,7);assert.equal(q.p.coast,true);});
test('different strike positions produce different outgoing trajectories',()=>{const a=ready(g());place(a,seed(a).x+16,seed(a).y-4);a.p.facing=-1;ticks(a,1,'ls');assert.ok(a.p.vx>290);assert.ok(a.p.vy<0);const b=ready(g());place(b,seed(b).x-16,seed(b).y-4);ticks(b,1,'rs');assert.ok(b.p.vx<-290);assert.ok(b.p.vy<0);for(const q of[a,b])assert.ok(Math.abs(Math.hypot(q.p.vx,q.p.vy)-300)<1e-8);});
test('broad charged window then expiry never bursts automatically',()=>{for(const age of[1,40,90,148]){const q=ready(g());ticks(q,age);topCut(q);assert.equal(count(q,'impulse-burst'),1);}const q=ready(g());ticks(q,150);assert.equal(seed(q).state,'idle');assert.equal(count(q,'impulse-expire'),1);assert.equal(count(q,'impulse-burst'),0);});
test('cooldown keeps the prepared position and requires a new prime',()=>{const q=ready(g());topCut(q);const x=seed(q).x,y=seed(q).y;ticks(q,47);assert.equal(seed(q).state,'idle');assert.equal(seed(q).x,x);assert.equal(seed(q).y,y);assert.equal(count(q,'impulse-reset'),1);});
test('burst releases a held hook and consumes stored platform lift',()=>{const q=ready(g()),e=seed(q);place(q,e.x,e.y-20);const ring={x:e.x,y:e.y-44};q.p.hook={ring,len:24};q.p.state='hook';q.p.liftTimer=10;q.p.liftX=200;q.p.liftY=-100;ticks(q,1,'dsg');assert.equal(count(q,'impulse-burst'),1);assert.equal(q.p.hook,null);assert.equal(q.p.lastRing,ring);assert.equal(q.p.liftTimer,0);assert.equal(q.p.liftX,0);assert.equal(q.p.state,'normal');});
test('gravity mirrors a moving seed and reset restores its initial state',()=>{const q=g();place(q,96,134);ticks(q,1,'us');assert.equal(seed(q).state,'windup');const y=seed(q).y;globalThis.BladefallPrecisionGravity.mirror(q);assert.equal(seed(q).y,184-y-8);assert.equal(seed(q).vy,80);ticks(q,18);assert.equal(seed(q).y,184-y-8+24);Core.resetRoom(q);assert.equal(seed(q).state,'idle');assert.equal(seed(q).x,96);assert.equal(seed(q).y,112);});
let failures=0;for(const[name,fn]of tests){try{fn();console.log('PASS '+name);}catch(e){failures++;console.error('FAIL '+name+'\n'+e.stack);}}if(failures)process.exitCode=1;else console.log('All '+tests.length+' impulse contracts passed.');
