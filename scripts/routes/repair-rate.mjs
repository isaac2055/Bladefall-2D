// How often Find a route repairs a broken route (7.340). Takes a spread of Precision Core rooms with routes, drops
// one wall tile where the knight was a given fraction of the way through, and asks the solver for a new route.
//   node scripts/routes/repair-rate.mjs [rooms=30] [fraction=0.4] [budget=600000]
import {createRequire} from 'node:module';
import {Rooms} from '../pcore-tape.mjs';
createRequire(import.meta.url)('../../public/bladefall-route-solver.js');
const RS=globalThis.BladefallRouteSolver,N=+(process.argv[2]||30),FR=+(process.argv[3]||0.4),budget=+(process.argv[4]||600000);
const rooms=Rooms.all.filter(r=>Rooms.tapes[r.id]),pick=Array.from({length:N},(_,i)=>rooms[Math.floor(i*rooms.length/N)]);
let fixed=0,tried=0,ms=0;
for(const room of pick){const tape=Rooms.tapes[room.id],full=RS.play(room,tape,{sample:1});
 const [x,y]=full.path[Math.floor(full.path.length*FR)],c=Math.floor((x+4)/8),r=Math.floor((y+5)/8);if(room.map[r]?.[c]!=='.')continue;
 const edited={...room,map:room.map.map((row,i)=>i===r?row.slice(0,c)+'#'+row.slice(c+1):row)};if(RS.play(edited,tape).ok)continue;
 tried++;const t0=Date.now(),res=RS.solve(edited,{tape,path:RS.play(room,tape).path,budget});const t=Date.now()-t0;ms+=t;if(res.ok)fixed++;
 console.log(`${room.id.padEnd(10)} ${(room.name||'').padEnd(26)} ${res.ok?'repaired':'not found'} in ${(t/1000).toFixed(1)} s`);
}
console.log(`repaired ${fixed} of ${tried} broken routes (${Math.round(100*fixed/Math.max(1,tried))}%), ${(ms/1000/Math.max(1,tried)).toFixed(1)} s each on average`);
