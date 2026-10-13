// Inspect private input recordings retrieved by export-feedback.mjs --online.
// No browser, uploads or public leaderboard writes. Recorded strings are data.
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {Core,expand,keysToInput} from '../pcore-tape.mjs';
const rows=JSON.parse(readFileSync(new URL('./.cache/recordings.json',import.meta.url))),id=process.argv[2];
if(!id){for(const r of rows)console.log(JSON.stringify({id:r.id,at:r.recordedAt,room:r.room,name:r.name,seconds:r.frames/60,assisted:r.assisted,outcome:r.outcome}));process.exit(0);}
const record=rows.find(r=>r.id===id);if(!record)throw Error('Recording not found');
const context=vm.createContext({});vm.runInContext(readFileSync(new URL('../../public/bladefall-route-recording.js',import.meta.url),'utf8'),context);const R=context.BladefallRouteRecording;
const initial=R.unpack(record.scene),g=Core.createGame([initial.room.def]);
function restore(scene){const spikeSafe=g.spikeSafe;for(const k of Object.keys(g))delete g[k];Object.assign(g,scene,{defs:[],rooms:[],spikeSafe,events:[]});g.defs[g.roomIndex]=g.room.def;g.rooms[g.roomIndex]=g.room;}
restore(initial);const poses=new Map(record.poses.map(p=>[p[0],p])),events={};let mismatches=0,frame=0;
for(const marker of record.markers.filter(m=>m.frame===0))restore(R.unpack(marker.scene));
for(const k of expand(record.tape)){Core.step(g,keysToInput(k));frame++;for(const e of g.events)events[e.type]=(events[e.type]||0)+1;
 const p=poses.get(frame);if(p&&(Math.abs(g.p.x-p[1])>.02||Math.abs(g.p.y-p[2])>.02)){if(mismatches++<5)console.log(JSON.stringify({frame,expected:p.slice(1,3),actual:[g.p.x,g.p.y]}));}
 for(const marker of record.markers.filter(m=>m.frame===frame))restore(R.unpack(marker.scene));g.events.length=0;
}
console.log(JSON.stringify({id:record.id,room:record.room,build:record.build,frames:frame,sampledPositionMismatches:mismatches,exited:g.exited,deaths:g.deaths,markers:record.markers.map(({frame,kind})=>({frame,kind})),events},null,2));
if(mismatches)process.exitCode=1;
