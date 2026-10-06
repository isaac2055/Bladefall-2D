import {expand,keysToInput} from './rbr-lib.mjs';
import assert from 'node:assert/strict';
import {ctx,Core,worlds,view,PV,st,R,storage} from './climb-passage-fixture.mjs';
import {walkPassage} from './climb-passage-route.mjs';
for(const w of worlds)for(const s of w.sections)st.atlas.solve(s.room);
let seams=0;
for(const w of worlds)for(const room of w.rooms)for(const socket of (room.atlasSockets||[]).filter(s=>!s.preview)){
 PV.climb.startWorld(w.n);Core.enterRoom(view.g,R.all.findIndex(r=>r.id===room.id));view.g.frame=100;st.passageCool=0;
 const left=socket.edge==='left',x=left?-4:view.g.room.w-4,y=socket.floor*8-11;
 Object.assign(view.g.p,{x,y,vx:left?-90:90,vy:0});view.lastInput=left?{l:true}:{r:true};
 assert.equal(PV.holding(),false,`walk seam ${room.id} ${socket.edge}`);
 assert.notEqual(view.g.room.id,room.id);assert.equal(view.g.p.vx,left?-90:90,'momentum preserved');
 assert.ok(!Core.solidAt(view.g,view.g.p.x,view.g.p.y,8,11),`clear landing ${room.id}`);
 assert.equal(view.g.p.maxDashes,1);seams++;
}
console.log(`${seams} walk-through seams carry momentum into clear arrivals; no interaction key or chapter reset.`);
let authored=0;
for(const w of worlds)for(const sec of w.sections){
 const d=w.rooms.find(r=>r.id===sec.room);if(d.connector)continue;
 const g=Core.createGame([d]);g.dropThru=true;g.springUp=true;
 if(d.closeWhilePlayed||['k6-stacks','s9-wheel'].includes(d.origin))for(const [c,r,ch] of d.seam||[])g.room.grid[r*g.room.cols+c]=ch==='#'?1:0;
 let exited=false;for(const k of [...expand(R.tapes[d.id]||[]),...Array(40).fill('')]){Core.step(g,keysToInput(k));if(g.events.some(e=>e.type==='exit')){exited=true;break;}g.events.length=0;}
 assert.ok(exited&&g.deaths===0,`original route ${d.id}`);authored++;
}
console.log(`${authored} original authored sections still pass.`);


for(const w of worlds)for(const def of w.rooms.filter(d=>d.atlasTransit))for(const direction of [1,-1]){
 const {complete,g,target}=walkPassage(Core,def,direction);
 assert.ok(complete,`complete authored route ${def.id} ${direction} ${JSON.stringify(target)}`);assert.equal(g.deaths,0);
 for(let f=0;f<120;f++){Core.step(g,direction===1?{r:true}:{l:true});g.events.length=0;}assert.equal(g.deaths,0);assert.ok(direction===1?g.p.x>=g.room.w-9:g.p.x<=1,`reach exit ${def.id}`);
}
console.log('All 12 borderlands traversed in both directions with one dash, no deaths and any service shutters closed.');

for(const w of worlds)for(const def of w.rooms.filter(d=>d.atlasTransit?.winch)){
 PV.climb.startWorld(w.n);Core.enterRoom(view.g,R.all.findIndex(r=>r.id===def.id));st.passageCool=0;
 const g=view.g,stone=g.ents.find(e=>e.type==='stone');Object.assign(g.p,{x:stone.x-14,y:stone.y-3,facing:1});
 for(let f=0;f<20;f++){view.lastInput={strike:f===0};PV.holding();Core.step(g,view.lastInput);g.events.length=0;}
 assert.ok(g.ents.find(e=>e.type==='stone').lit,`winch ${def.id}`);assert.ok(g.ents.filter(e=>e.type==='gate').every(e=>e.open));
 assert.ok(JSON.parse(storage.get('bladefall.climb.v1')).stakes[def.id].length);
 Core.enterRoom(g,R.all.findIndex(r=>r.id===def.id));st.lit={};view.lastInput={};PV.holding();
 assert.ok(g.ents.filter(e=>e.type==='gate').every(e=>e.open),`shortcut persists ${def.id}`);
}
console.log('All three service winches open their physical gates and survive room reload.');
for(const w of worlds)for(const s of w.sections.filter(s=>s.atlasJunction)){
 const d=w.rooms.find(r=>r.id===s.room);
 for(const other of ctx.BladefallClimb.all(w).filter(o=>o!==s)){
  const od=w.rooms.find(r=>r.id===other.room);
  assert.ok(!(s.x<other.x+(od.cols||40)&&s.x+(d.cols||40)>other.x&&s.y<other.y+(od.rows||23)&&s.y+(d.rows||23)>other.y),`overlapping approach ${s.room} ${other.room}`);
 }
}
console.log('Approach rooms do not overlap existing rooms or optional branches.');

for(const w of worlds)for(const d of w.rooms.filter(d=>d.atlasTransit)){
 const g=Core.createGame([d]);g.springUp=true;g.dropThru=true;
 assert.ok(R.tapes[d.id]?.length);
 for(const k of expand(R.tapes[d.id]))Core.step(g,keysToInput(k));
 assert.equal(g.deaths,0);assert.ok(Math.abs(g.p.x-g.room.spawn.x)>g.room.w*.75,`recorded demonstration ${d.id}`);
}
console.log('All twelve shipped demonstrations traverse their complete passage.');

// Reach every junction outlet using the same jump/dash physics as ordinary play.
let terraces=0;
for(const w of worlds)for(const def of w.rooms.filter(d=>d.atlasJunction))for(const socket of def.atlasSockets||[]){
 const g=Core.createGame([def]);g.dropThru=true;g.springUp=true;
 const road=def.atlasRoads.find(r=>r.edge===socket.edge&&r.floor===socket.floor);
 const steps=road.points.map(p=>({x:p.c*8+4,y:p.r*8}));
 let i=0,hold=0,aim=0,lastJump=-100;
 for(let f=0;f<3600&&i<steps.length;f++){
  const t=steps[i],p=g.p,dx=t.x-(p.x+4);
  if(Math.abs(dx)<9&&p.y+p.h<=t.y+2&&p.onGround){i++;continue;}
  const inp={l:dx<-3,r:dx>3};
  if(p.onGround&&f-lastJump>24&&p.y+p.h>t.y+2){hold=19;lastJump=f;}
  inp.jump=hold-->0;
  if(!aim&&!p.onGround&&p.vy>0&&p.y+p.h>t.y+1&&Math.abs(dx)<55&&p.dashes>0){inp.dash=true;aim=14;}
  if(aim>0){aim--;inp.u=true;inp.l=false;inp.r=false;}
  Core.step(g,inp);g.events.length=0;
 }
 assert.equal(i,steps.length,`reachable terrace ${def.id} ${socket.link||'main'}: ${JSON.stringify(g.p)}`);assert.equal(g.deaths,0);terraces++;
}
console.log(`${terraces} junction outlets reachable from their fire with ordinary movement.`);

// Preserve jumping elevation, vertical velocity, and the live game object across seams.
const jumpWorld=worlds[0],jumpDef=jumpWorld.rooms.find(d=>d.atlasSockets?.some(s=>s.kind==='passage'));
PV.climb.startWorld(1);Core.enterRoom(view.g,R.all.findIndex(r=>r.id===jumpDef.id));st.passageCool=0;
const jumpSocket=jumpDef.atlasSockets.find(s=>s.kind==='passage'),sameGame=view.g,leftJump=jumpSocket.edge==='left';
Object.assign(sameGame.p,{x:leftJump?-4:sameGame.room.w-4,y:jumpSocket.floor*8-22,vx:leftJump?-90:90,vy:-80});view.lastInput=leftJump?{l:true}:{r:true};
PV.holding();assert.equal(view.g,sameGame);assert.equal(view.g.p.vy,-80);
const arrival=view.g.room.def.atlasSockets.find(s=>s.edge===(leftJump?'right':'left'));
assert.equal(view.g.p.y,arrival.floor*8-22);
const savedAtlas=ctx.BladefallClimbAtlas.create(worlds,JSON.parse(JSON.stringify(st.atlas.snapshot())));
assert.equal(savedAtlas.state.checkpoint.entry,leftJump?'right':'left');

for(const w of worlds){
 PV.climb.startWorld(w.n);Core.enterRoom(view.g,R.all.findIndex(r=>r.id===w.atlasEnd));const g=view.g;g.springUp=true;g.dropThru=true;let exited=false;
 for(const k of expand(R.tapes[w.atlasEnd])){Core.step(g,keysToInput(k));if(g.events.some(e=>e.type==='exit')){exited=true;break;}g.events.length=0;}
 assert.ok(exited,w.atlasEnd);PV.exit(view);g.events.length=0;assert.equal(g.room.id,w.sections.at(-1).room);PV.holding();assert.ok(!Core.solidAt(g,g.p.x,g.p.y,g.p.w,g.p.h),`clear terminal arrival ${w.n}`);for(let i=0;i<100;i++)Core.step(g,{});assert.equal(g.deaths,0,`safe end ${w.n}`);
 const main=g.room.def.atlasMain;g.frame+=100;st.enteredAt=0;st.passageCool=0;
 if(main.edge==='down')Object.assign(g.p,{x:main.cols[0]*8,y:g.room.h-g.p.h,vy:20});
 else{Object.assign(g.p,{x:main.edge==='left'?-4:g.room.w-4,y:main.floor*8-g.p.h,vx:main.edge==='left'?-90:90});view.lastInput=main.edge==='left'?{l:true}:{r:true};}
 PV.holding();assert.equal(g.room.id,w.atlasEnd,`return from terminal ${w.n}`);
 for(let f=0;f<18;f++){view.lastInput={};PV.holding();Core.step(g,{});for(const e of g.events)if(e.type==='exit')PV.exit(view);g.events.length=0;}
 assert.equal(g.room.id,w.atlasEnd,`return must not bounce back into junction ${w.n}`);
 if(w.n>1){Core.enterRoom(g,R.all.findIndex(r=>r.id===w.atlasStart));const mouth=g.room.def.atlasMouth;g.frame+=100;st.enteredAt=0;st.passageCool=0;Object.assign(g.p,{x:mouth.edge==='left'?-4:g.room.w-4,y:mouth.floor*8-g.p.h,vx:mouth.edge==='left'?-90:90});view.lastInput=mouth.edge==='left'?{l:true}:{r:true};PV.holding();assert.equal(g.room.id,w.sections[0].room,`return to arrival ${w.n}`);}
}
console.log('All nine final authored routes enter safe junctions and return; all eight arrival mouths support return travel.');

// Presentation hooks must not write simulation state or produce invalid geometry.
let depth=0,draws=0;
const numeric=(...a)=>{for(const n of a)assert.ok(Number.isFinite(n),`drawing coordinate ${n}`);draws++;};
const paint=new Proxy({save(){depth++;},restore(){assert.ok(depth>0);depth--;},createLinearGradient(...a){numeric(...a);return {addColorStop(){}};},fillRect:numeric,strokeRect:numeric,moveTo:numeric,lineTo:numeric,bezierCurveTo:numeric,arc:numeric,translate:numeric,rotate:numeric,beginPath(){},closePath(){},fill(){},stroke(){},fillText(){}},{set(o,k,v){if(k==='globalAlpha')assert.ok(v>=0&&v<=1);o[k]=v;return true;}});
function freeze(o,seen=new Set()){if(!o||typeof o!=='object'||seen.has(o)||ArrayBuffer.isView(o))return;seen.add(o);for(const v of Object.values(o))freeze(v,seen);Object.freeze(o);}
for(const w of worlds)for(const def of w.rooms.filter(d=>d.atlasTransit||d.atlasJunction)){
 const g=Core.createGame([def]);freeze(g);const art=ctx.BladefallClimbPassageArt;
 art.terrain(paint,g);art.details(paint,g);
 if(def.atlasTransit)for(const x of [-100,0,320,640,960])art.background(paint,g,{x,y:120},320,184);
 assert.equal(depth,0);
}
assert.ok(draws>10000);
console.log('Passage rendering: finite geometry, balanced canvas state, frozen simulation.');

export {ctx,Core,worlds,view,PV,st,R};
