import assert from 'node:assert/strict';
import {bootFixture} from './climb-passage-fixture.mjs';
const {ctx,worlds,view,PV,Core,R,st}=bootFixture([],true,true),CL=ctx.BladefallClimb;
for(const w of worlds)for(const s of w.sections)st.atlas.solve(s.room);
let seams=0;
for(const w of worlds)for(const def of w.rooms)for(const port of (def.atlasSockets||[]).filter(p=>p.folded)){
 PV.climb.startWorld(w.n);Core.enterRoom(view.g,R.all.findIndex(d=>d.id===def.id));view.lastInput={};PV.holding();
 const g=view.g,p=g.p,sign=port.edge==='left'?-1:1;
 Object.assign(p,{x:port.plane-p.w/2+sign,y:port.floor*8-p.h,state:'dash',dashTimer:12,dashAim:false,dashDir:{x:sign,y:0},vx:sign*240,vy:0,dashes:0});
 view.lastInput=sign<0?{l:true}:{r:true};PV.holding();
 assert.equal(g.room.id,port.to);assert.equal(g.p.state,'dash');assert.equal(g.p.dashTimer,12);assert.equal(g.p.vx,sign*240);assert.equal(g.p.dashes,0,'no dash refill');assert.equal(g.p.dashDir.x,sign);
 assert.ok(!Core.solidAt(g,g.p.x,g.p.y,g.p.w,g.p.h));seams++;
}
const passages=R.all.filter(d=>d.atlasFold);assert.equal(passages.length,ctx.BladefallClimbAtlas.links.length);assert.equal(seams,4*ctx.BladefallClimbAtlas.links.length);
for(const def of passages){
 assert.ok(def.atlasTerrain.path.length<=49,'connection cannot grow into a long walk');
 assert.ok(!def.atlasTransit.lift&&!def.atlasTransit.winch,'no service wait in short passage');
 assert.equal(new Set(def.atlasSockets.map(p=>p.edge)).size,2,'save entry directions are unambiguous');
 const pl=CL.geography.rooms.get(def.id),p=def.atlasTerrain.path[20],svg=ctx.BladefallClimbGeography.mapSvg(CL.geography,{},null,{}, {x:(pl.x+p.c)*8,y:(pl.y+p.r)*8});
 const dot=svg.match(/<circle cx="([^"]+)" cy="([^"]+)"/);assert.ok(dot);const x=+dot[1]/1.65,y=+dot[2],b=CL.geography.bounds;assert.ok(x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h,'passage marker remains on overview');
}
console.log(`${4*ctx.BladefallClimbAtlas.links.length} folded seams preserve an in-progress dash; all ${ctx.BladefallClimbAtlas.links.length} passages are short, have distinct saved entrances, and keep the player marker on the map.`);
