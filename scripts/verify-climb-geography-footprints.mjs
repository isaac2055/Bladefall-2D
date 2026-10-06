import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {bootFixture} from './climb-passage-fixture.mjs';
const {ctx,worlds}=bootFixture();
for(const f of ['geography','geography-build'])vm.runInContext(fs.readFileSync(new URL('../public/bladefall-climb-'+f+'.js',import.meta.url),'utf8'),ctx);
const original=JSON.stringify(worlds),built=ctx.BladefallClimbGeographyBuild.build(worlds),occupied=new Map();
assert.equal(JSON.stringify(worlds),original,'building must leave the source registry unchanged');
let cells=0;
for(const {def:d,section:s} of built.passages)for(let y=0;y<d.rows;y++)for(const [a,z] of d.atlasTerrain.spans[y]){
 assert.equal(built.geo.query({x:s.x+a,y:s.y+y,w:z-a,h:1}).length,0,`${d.id} overlaps authored terrain at ${s.x+a},${s.y+y}`);
 for(let x=a;x<z;x++){
  const key=(s.x+x)+','+(s.y+y);assert.ok(!occupied.has(key),`${d.id} overlaps ${occupied.get(key)} at ${key}`);occupied.set(key,d.id);cells++;
 }
}
for(const {def:d,section:s} of built.passages)for(let r=0;r<d.rows;r++)for(let c=0;c<d.cols;c++){
 if(d.map[r][c]==='#'||d.atlasTerrain.spans[r].some(([a,z])=>c>=a&&c<z))continue;
 assert.ok(d.atlasSockets.some(port=>Math.abs(c*8-port.plane)<=24&&r>=port.floor-5&&r<=port.floor),`${d.id} has invisible traversable terrain at ${c},${r}`);
}
for(const w of built.worlds){
 const old=worlds.find(x=>x.n===w.n),defs=new Map(old.rooms.map(d=>[d.id,d]));
 for(const d of w.rooms)if(!d.atlasJunction&&!d.atlasTransit)assert.deepEqual(d.map,defs.get(d.id).map,`authored geometry ${d.id}`);
 const place=(world,id)=>ctx.BladefallClimb.place(world,id);
 for(const q of [...w.quests,...w.secrets]){
  const host=q.from||q.host;if(!host)continue;
  const a=place(old,host),b=place(w,host);
  for(const section of q.sections){const before=place(old,section.room),after=place(w,section.room);assert.equal(after.x-b.x,before.x-a.x,`branch x ${section.room}`);assert.equal(after.y-b.y,before.y-a.y,`branch y ${section.room}`);}
  if(q.returnTo&&old.sections.some(s=>s.room===q.returnTo)){const before=place(old,q.returnTo),after=place(w,q.returnTo);assert.equal(after.x-b.x,before.x-a.x,`return x ${q.id}`);assert.equal(after.y-b.y,before.y-a.y,`return y ${q.id}`);}
 }
}
console.log(`${cells} physical passage tiles have exclusive ownership; no passage overlaps authored terrain or another passage. Original challenge maps, all optional branches, and their return destinations retain their geometry.`);
