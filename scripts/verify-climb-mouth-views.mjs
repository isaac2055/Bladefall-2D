import assert from 'node:assert/strict';
import {bootFixture} from './climb-passage-fixture.mjs';
const {ctx,worlds,view,PV,Core,R,st}=bootFixture([],true,true),CL=ctx.BladefallClimb;
for(const w of worlds)for(const section of w.sections)st.atlas.solve(section.room);
// Exercise the production drawWorld hook, recording the destination passed to
// the renderer and its translated camera. Raster appearance is checked in-browser.
let previews=[],contexts=[];
const noop=()=>{};
function makeCanvas(){
 let offset={x:0,y:0},stack=[];
 const state={get offset(){return offset;},stack};contexts.push(state);
 const brush=new Proxy({
  save(){stack.push({...offset});},restore(){offset=stack.pop();},
  setTransform(a,b,c,d,x,y){offset={x,y};},
  translate(x,y){offset.x+=x;offset.y+=y;},
  createLinearGradient:()=>({addColorStop:noop}),
  createRadialGradient:()=>({addColorStop:noop}),state
 },{get:(o,k)=>o[k]||noop});
 return {getContext:()=>brush};
}
const canvas=makeCanvas().getContext('2d');
ctx.document={createElement:()=>makeCanvas()};
ctx.BladefallClimbArt={background:noop,person:noop};
ctx.BladefallClimbPassageArt.background=noop;
const record=(b,g,pal,cam)=>{if(cam)previews.push({id:g.room.id,offset:{...b.state.offset},cam:{...cam}});};
ctx.BladefallPrecisionView.drawStatic=record;
ctx.BladefallPrecisionView.drawOther=record;
let mouths=0;
for(const w of worlds)for(const def of w.rooms)for(const socket of (def.atlasSockets||[]).filter(s=>s.folded)){
 PV.climb.startWorld(w.n);Core.enterRoom(view.g,R.all.findIndex(d=>d.id===def.id));
 const g=view.g,place=CL.place(w,def.id),floor=socket.floor*8;
 view.cam={x:socket.plane-160,y:floor-100};
 st.cam={x:place.x+view.cam.x,y:place.y+view.cam.y};
 const target=R.all.find(d=>d.id===socket.to),peer=target.atlasSockets.find(p=>p.to===def.id);
 let baseline;
 for(const height of [floor-11,floor-75,floor+45]){
  g.p.y=height;previews=[];
  assert.equal(PV.drawWorld(canvas,g,view,PV.palette(w.chapter)),true);
  const preview=previews.find(p=>p.id===target.id);
  assert.ok(preview,`${def.id}: the actual destination remains visible at player height ${height}`);
  assert.equal(preview.offset.x+peer.plane,socket.plane-view.cam.x,'destination mouth aligns horizontally');
  assert.equal(preview.offset.y+peer.floor*8,floor-view.cam.y,'destination floor aligns vertically');
  assert.equal(preview.cam.x+preview.offset.x,0,'terrain culling uses transformed camera x');
  assert.equal(preview.cam.y+preview.offset.y,0,'terrain culling uses transformed camera y');
  if(baseline)assert.deepEqual(preview,baseline,'jumping does not replace or move destination scenery');
  baseline=preview;assert.ok(contexts.every(c=>c.stack.length===0),'canvas transforms are balanced');
 }
 mouths++;
}
assert.equal(mouths,4*ctx.BladefallClimbAtlas.links.length);
console.log(`${4*ctx.BladefallClimbAtlas.links.length} mouths render their actual destinations at three player heights, with matching floors, stable scenery, and correctly translated terrain cameras.`);//');
