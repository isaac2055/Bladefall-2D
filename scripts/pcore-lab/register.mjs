// Precision Core lab preload (7.280): registers the lab's teaching rooms (scripts/pcore-lab/rooms.mjs) and their
// proven tapes (lab.tapes.json) as a bonus chapter, so the ordinary tools can find and run them by id:
//   node --import ./scripts/pcore-lab/register.mjs scripts/rbr-find.mjs lab-zip-1
// Nothing in the game loads this.
import {readFileSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
const here=dirname(fileURLToPath(import.meta.url));
const {Rooms}=await import('../pcore-tape.mjs');
const {rooms}=await import('./rooms.mjs');
const tf=resolve(here,'lab.tapes.json');
const tapes=existsSync(tf)?JSON.parse(readFileSync(tf,'utf8')):{};
Rooms.addPart({part:'lab',title:'Lab',chapters:[{id:'pcore-lab',name:'Lab',bonus:true,rooms:rooms.map(r=>({lock:['strike','parry','portal'],...r}))}],tapes});
