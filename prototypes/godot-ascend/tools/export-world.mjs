import {reference} from './reference.mjs';
// Export the authored world and browser reference traces, never approximated geometry.
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const ctx=reference();
const world=ctx.BladefallClimb.world(1),Core=ctx.BladefallPrecisionCore;
const payload={sources:ctx.__loadedSources,playerDefaults:Core.createGame([world.rooms[0]]).p,source:'public/bladefall-climb-worlds.js',world,constants:Core.K};
const destination=path.join(root,'prototypes/godot-ascend/data/world1.json'),text=JSON.stringify(payload,null,2)+'\n';
if(process.argv.includes('--check')){if(fs.readFileSync(destination,'utf8')!==text)throw Error('World data is stale: regenerate export-world.mjs');console.log('Export matches original browser sources');process.exit(0);}
fs.writeFileSync(destination,text);

console.log(world.name,world.sections.length,'main sections',world.rooms.length,'rooms');
for(const d of world.rooms){const r=Core.parseRoom(d,0);console.log(d.id,JSON.stringify({cols:r.cols,rows:r.rows,lock:d.lock,entities:[...new Set(r.entities.map(e=>e.type))],tape:!!world.tapes[d.id],flags:Object.keys(d).filter(k=>!['id','map','name','hint','palette','origin'].includes(k))}));}
