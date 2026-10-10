import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {boundaryReservations} from '../scripts/climb/boundary-reservations.mjs';
const root=new URL('../',import.meta.url),worlds=[];
vm.runInNewContext(fs.readFileSync(new URL('public/bladefall-climb-worlds.js',root),'utf8'),{BladefallClimb:{addWorld:w=>worlds.push(w)}});
const ctx=vm.createContext({});for(const n of ['atlas','passages','geography-build'])vm.runInContext(fs.readFileSync(new URL(`public/bladefall-climb-${n}.js`,root),'utf8'),ctx);
test('reserved boundaries match the actual atlas on all 40 worlds without mutating input',()=>{
 for(const w of worlds){
  const before=JSON.stringify(w),actual=boundaryReservations(w),full=structuredClone(w);
  ctx.BladefallClimbAtlas.prepareWorld(full);ctx.BladefallClimbPassages.prepare(full);
  const built=ctx.BladefallClimbGeographyBuild.prepare([full])[0];
  for(const kind of ['arrival','departure']){
   const id=`cl${w.n}-atlas-${kind==='arrival'?'arrival':'crossroads'}`,s=built.sections.find(s=>s.room===id),d=built.rooms.find(d=>d.id===id);
   assert.deepEqual(actual[kind],s?{room:id,x:s.x,y:s.y,C:d.cols,R:d.rows}:null,`W${w.n} ${kind}`);
  }
  assert.equal(JSON.stringify(w),before);
 }
});
test('candidate translations reuse geometry and move each boundary with its host',()=>{
 const w=worlds.find(w=>w.n===24),a=w.sections[0],z=w.sections.at(-1),base=boundaryReservations(w);
 const moved=boundaryReservations(w,{...a,x:a.x-73,y:a.y+51},{...z,x:z.x+145,y:z.y-99});
 assert.deepEqual(moved.arrival,{...base.arrival,x:base.arrival.x-73,y:base.arrival.y+51});
 assert.deepEqual(moved.departure,{...base.departure,x:base.departure.x+145,y:base.departure.y-99});
});
