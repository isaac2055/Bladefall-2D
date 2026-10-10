// Exact local atlas footprints for the physical campaign compiler. The sandbox
// uses the same runtime builders without registering worlds or touching globals.
import fs from 'node:fs';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const sandbox=vm.createContext({});
for(const name of ['atlas','passages','geography-build']){
 const path=fileURLToPath(new URL(`../../public/bladefall-climb-${name}.js`,import.meta.url));
 vm.runInContext(fs.readFileSync(path,'utf8'),sandbox,{filename:path});
}
const cache=new Map(),clone=x=>JSON.parse(JSON.stringify(x));
function endpoint(w,section){
 if(!section)throw new Error('Boundary reservation needs a first and last section');
 const def=w.rooms.find(d=>d.id===section.room);
 if(!def)throw new Error(`Missing boundary room ${section.room}`);
 return {section,def};
}
export function boundaryReservations(w,first=w.sections[0],last=w.sections.at(-1)){
 const a=endpoint(w,first),z=endpoint(w,last);
 const gates=w.rooms.filter(d=>d.atlasGate);
 // Position-independent geometry is cached: candidate translations must not
 // rerun the map builders during the compiler's entrance search.
 const key=JSON.stringify([w.n,w.palette,a.def,z.def,gates]);
 let relative=cache.get(key);
 if(!relative){
  const defs=[a.def,...(z.def.id===a.def.id?[]:[z.def]),...gates.filter(d=>d.id!==a.def.id&&d.id!==z.def.id)];
  const firstAt={...a.section,x:0,y:0},lastAt={...z.section,x:1000,y:1000};
  const model={n:w.n,name:w.name,palette:w.palette,rooms:clone(defs),sections:clone(a.def.id===z.def.id?[firstAt]:[firstAt,lastAt]),quests:[],secrets:[],tapes:{}};
  sandbox.BladefallClimbAtlas.prepareWorld(model);
  sandbox.BladefallClimbPassages.prepare(model);
  const built=sandbox.BladefallClimbGeographyBuild.prepare([model])[0];
  relative={arrival:null,departure:null};
  for(const section of built.sections){
   const def=built.rooms.find(d=>d.id===section.room);
   if(!def.atlasJunction)continue;
   const kind=def.id.endsWith('-atlas-arrival')?'arrival':'departure';
   const origin=kind==='arrival'||a.def.id===z.def.id?firstAt:lastAt;
   relative[kind]={room:def.id,x:section.x-origin.x,y:section.y-origin.y,C:def.cols||40,R:def.rows||23};
  }
  cache.set(key,relative);
 }
 const translated=(rect,section)=>rect?{...rect,x:rect.x+section.x,y:rect.y+section.y}:null;
 return {arrival:translated(relative.arrival,first),departure:translated(relative.departure,last)};
}
