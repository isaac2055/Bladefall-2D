import assert from 'node:assert/strict';import {bootFixture} from './climb-passage-fixture.mjs';
const f=bootFixture([],false,true),{worlds,view,PV,Core,R,storage}=f;
const enter=(w,d)=>{PV.climb.startWorld(w.n);Core.enterRoom(view.g,R.all.findIndex(r=>r.id===d.id));view.lastInput={};PV.holding();};
const tick=input=>{view.lastInput=input;PV.holding();Core.step(view.g,input);view.g.events.length=0;};
let winches=0,lifts=0;
for(const w of worlds)for(const d of w.rooms.filter(d=>d.atlasTerrain&&(d.atlasTransit.winch||d.atlasTransit.lift))){
 enter(w,d);const g=view.g,spec=d.atlasTransit.lift;
 if(d.atlasTransit.winch){
  const stone=g.ents.find(e=>e.type==='stone');assert.ok(stone,`winch ${d.id}`);
  if(spec){Object.assign(g.p,{x:spec.x+spec.w/2-4,y:spec.bottom-g.p.h,vx:0,vy:0,state:'normal',onGround:true});for(let i=0;i<10;i++)tick({});assert.equal(g.ents.find(e=>e.type==='climb-lift').state,'idle','unlit winch holds lift');}
  Object.assign(g.p,{x:stone.x-14,y:stone.y+8-g.p.h,vx:0,vy:0,state:'normal',onGround:true,facing:1});tick({strike:true});for(let i=0;i<12;i++)tick({});
  assert.equal(stone.lit,true,`strike opens ${d.id}`);
  assert.ok(JSON.parse(storage.get('bladefall.climb.v1')).stakes[d.id].length,'winch saved');
  if(d.atlasTransit.gateC!=null)assert.ok(g.ents.filter(e=>e.type==='gate').every(e=>e.open),'shutter opens');
  winches++;
 }
 if(spec){
  Object.assign(g.p,{x:spec.x+spec.w/2-4,y:spec.bottom-g.p.h,vx:0,vy:0,state:'normal',onGround:true});
  let arrived=false,previous=g.p.y;
  for(let i=0;i<Math.ceil((spec.bottom-spec.top)/1.25)+120;i++){
   tick({});assert.equal(g.deaths,0,`lift ride ${d.id}`);assert.ok(Math.abs(g.p.y-previous)<=3,'continuous ride');previous=g.p.y;
   if(g.ents.find(e=>e.type==='climb-lift').state==='wait'){assert.equal(g.p.y+g.p.h,spec.top);arrived=true;break;}
  }
  assert.ok(arrived,`lift reaches top ${d.id}`);lifts++;
 }
}
const restored=bootFixture([...storage],true,true);
for(const w of restored.worlds)for(const d of w.rooms.filter(d=>d.atlasTerrain&&d.atlasTransit.winch)){
 restored.PV.climb.startWorld(w.n);restored.Core.enterRoom(restored.view.g,restored.R.all.findIndex(r=>r.id===d.id));restored.view.lastInput={};restored.PV.holding();
 assert.ok(restored.view.g.ents.filter(e=>e.type==='stone').every(e=>e.lit),`reload ${d.id}`);
 assert.ok(restored.view.g.ents.filter(e=>e.type==='gate').every(e=>e.open),`reload gate ${d.id}`);
}
console.log(`${winches} service winches struck and persisted across reload; ${lifts} counterweights carried the knight continuously to their upper docks without deaths.`);
