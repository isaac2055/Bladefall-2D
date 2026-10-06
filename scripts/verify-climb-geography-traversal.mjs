import assert from 'node:assert/strict';
import fs from 'node:fs';import vm from 'node:vm';import {bootFixture} from './climb-passage-fixture.mjs';
const {ctx,worlds,Core}=bootFixture();
for(const f of ['geography','geography-build'])vm.runInContext(fs.readFileSync(new URL('../public/bladefall-climb-'+f+'.js',import.meta.url),'utf8'),ctx);
const built=ctx.BladefallClimbGeographyBuild.build(worlds);
export function followTerrain(Core,def,reverse=false){
 const g=Core.createGame([def]),all=def.atlasTerrain.path,path=reverse?[...all].reverse():all;
 g.dropThru=true;
 const points=path.slice(8,-8),start=points[0];g.p.x=start.c*8;g.p.y=start.r*8-g.p.h;g.room.spawn={x:g.p.x,y:g.p.y};
 let at=0,hold=0,lastJump=-100,lastDash=-100,aim=0,aimDir=0;
 for(let frame=0;frame<path.length*20+3000;frame++){
  const p=g.p,feet=p.y+p.h;
  let best=at,distance=Infinity;
  for(let i=at;i<Math.min(points.length,at+24);i++){const q=points[i],d=Math.abs(q.c*8-p.x)+Math.abs(q.r*8-feet)*1.5;if(d<distance){distance=d;best=i;}}
  if(distance<20)at=Math.max(at,best);
  const end=points.at(-1);if(Math.abs(p.x-end.c*8)<10&&Math.abs(feet-end.r*8)<14&&at>points.length-20)return {frames:frame,deaths:g.deaths};
  const target=points[Math.min(points.length-1,at+4)],dx=target.c*8-p.x,dy=feet-target.r*8;
  const input={l:dx<-2,r:dx>2};
  if(p.onGround&&frame-lastJump>22&&(dy>2||Core.solidAt(g,p.x+(dx<0?-3:9),p.y,2,11))){hold=19;lastJump=frame;}
  input.jump=hold-->0;
  if(p.onGround&&dy<-3&&Math.abs(dx)<25&&frame-lastJump>22){input.d=true;input.jump=true;lastJump=frame;}
  if(!aim&&!p.onGround&&p.vy>0&&(dy>4||Core.solidAt(g,p.x+(dx<0?-4:10),p.y,2,11))&&p.dashes>0&&frame-lastDash>25){input.dash=true;aim=14;aimDir=!def.atlasJunction&&Math.abs(dx)>28?Math.sign(dx):0;lastDash=frame;}
  if(aim>0){aim--;input.u=true;input.l=aimDir<0;input.r=aimDir>0;}
  Core.step(g,input);g.events.length=0;
  assert.equal(g.deaths,0,`death ${def.id} ${reverse}`);
 }
 throw new Error(`Stalled ${def.id} ${reverse?'reverse':'forward'} at ${at}/${points.length}: player ${g.p.x},${g.p.y+g.p.h}; target ${JSON.stringify(points[at+4])}`);
}
let frames=0;
for(const {def} of built.passages){
 for(const reverse of [false,true]){const result=followTerrain(Core,def,reverse);frames+=result.frames;}
 console.log(def.id,'both directions');
}
console.log(`All ${built.passages.length} physical corridors walked both directions with normal Core input, one dash, zero deaths (${frames} frames).`);
let roads=0;
for(const w of built.worlds)for(const def of w.rooms.filter(d=>d.atlasJunction))for(const road of def.atlasRoads){
 const path=[];
 for(let i=1;i<road.points.length;i++){const a=road.points[i-1],b=road.points[i],n=Math.max(Math.abs(a.c-b.c),Math.abs(a.r-b.r));for(let j=0;j<n;j++)path.push({c:Math.round(a.c+(b.c-a.c)*j/n),r:Math.round(a.r+(b.r-a.r)*j/n)});}
 path.push(road.points.at(-1));path.unshift(...Array(8).fill(path[0]));path.push(...Array(8).fill(path.at(-1)));
 const test={...def,id:def.id+'-'+road.edge+'-'+road.floor,atlasTerrain:{path}};
 for(const reverse of [false,true])followTerrain(Core,test,reverse);
 roads++;
}
console.log(`${roads} rebuilt junction roads also walked both directions from/to the hearth.`);
