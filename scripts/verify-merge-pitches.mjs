// Merge Pitches (7.257): every pitch room finishes on its intended tape with no deaths, and the pitch rooms
// stay out of the Precision Courses (they register only on a pitch page). No browser.
//   node scripts/verify-merge-pitches.mjs
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
const here=dirname(fileURLToPath(import.meta.url));
const require=createRequire(import.meta.url);
const {Rooms,runRoom}=await import('./pcore-tape.mjs');
const file=resolve(here,'../public/bladefall-pcore-pitches.js');
let fail=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)fail++;};

// Off a pitch page the file registers nothing.
const before=Rooms.chapters.length;
require(file);
ok(Rooms.chapters.length===before&&!Rooms.chapters.some(c=>c.part==='pitch'),`without ?pitch the chapter list is untouched (${before})`);

// On a pitch page (the flag stands in for the URL) the pitches append after every numbered level and bonus set.
delete require.cache[file];globalThis.BLADEFALL_PITCHES=true;require(file);
const pitch=Rooms.chapters.filter(c=>c.part==='pitch');
ok(pitch.length===4,`four pitch chapters registered (${pitch.length})`);
ok(Rooms.chapters.every((c,i)=>c.level===undefined||c.level===i+1),'every numbered level keeps its chapter index');
ok(Rooms.chapters.findIndex(c=>c.part==='pitch')===before,'pitch chapters sit after everything else');

for(const ch of pitch)for(const room of ch.rooms){
 const tape=Rooms.tapes[room.id];
 if(!tape){ok(false,`${room.id}: has a tape`);continue;}
 const i=Rooms.all.findIndex(d=>d.id===room.id);
 const r=runRoom(Rooms.all,i,tape,{maxExtra:30});
 ok(r.exited&&r.deaths===0,`${room.id} (${room.name}): finishes on its tape, ${r.deaths} deaths, frame ${r.exitFrame}`);
}
// The road pockets keep the road's ground line: floor on row 18 at both edges, open to the right.
for(const id of ['mp-pocket-mile','mp-pocket-muster']){
 const d=Rooms.all.find(x=>x.id===id),m=d.map;
 ok(m[18][0]==='#'&&m[18][39]==='#'&&m[17][39]==='.'&&m[17][0]==='P',`${id}: walks in and out on the road's ground line`);
}
console.log(fail?`${fail} failed`:'all passed');
process.exit(fail?1:0);
