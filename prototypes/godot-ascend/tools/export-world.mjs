import {reference} from './reference.mjs';
import vm from 'node:vm';
// Export the authored world and browser reference traces, never approximated geometry.
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const ctx=reference();
const number=Number(process.argv.find(a=>/^--world=/.test(a))?.split('=')[1]||1);
const world=ctx.BladefallClimb.world(number),Core=ctx.BladefallPrecisionCore;
const payload={sources:ctx.__loadedSources,playerDefaults:Core.createGame([world.rooms[0]]).p,source:'public/bladefall-climb-worlds.js',world,constants:Core.K};
if(number===2){
 vm.runInContext(fs.readFileSync(path.join(root,'public/bladefall-climb-errands.js'),'utf8'),ctx);
 const quest=ctx.BladefallClimbErrands.QUESTS.refuge;
 const actions={l:'l',r:'r',u:'u',d:'d',jump:'j',dash:'x',grab:'g',strike:'s',parry:'p',portal:'q'};
 payload.quest={...quest,perches:quest.steps[0].perches.map(([id,fraction])=>{
  const def=world.rooms.find(d=>d.id===id),g=Core.createGame([def]),points=[];
  for(const [n,k] of world.tapes[id])for(let i=0;i<n;i++){
   const raw={};for(const [key,ch]of Object.entries(actions))raw[key]=k.includes(ch);
   Core.step(g,raw);points.push({x:g.p.x+4,y:g.p.y+5});
   if(g.events.some(e=>e.type==='exit'))i=n;g.events.length=0;
  }
  return {room:id,...points[Math.min(points.length-1,Math.max(0,Math.round(fraction*(points.length-1))))]};
 })};
}
const destination=path.join(root,`prototypes/godot-ascend/data/world${number}.json`),text=JSON.stringify(payload,null,2)+'\n';
if(process.argv.includes('--check')){if(fs.readFileSync(destination,'utf8')!==text)throw Error('World data is stale: regenerate export-world.mjs');console.log('Export matches original browser sources');process.exit(0);}
fs.writeFileSync(destination,text);

console.log(world.name,world.sections.length,'main sections',world.rooms.length,'rooms');
for(const d of world.rooms){const r=Core.parseRoom(d,0);console.log(d.id,JSON.stringify({cols:r.cols,rows:r.rows,lock:d.lock,entities:[...new Set(r.entities.map(e=>e.type))],tape:!!world.tapes[d.id],flags:Object.keys(d).filter(k=>!['id','map','name','hint','palette','origin'].includes(k))}));}
