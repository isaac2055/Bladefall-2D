import {reference} from './reference.mjs';
import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..'),project=path.join(root,'prototypes/godot-ascend');
const ctx=reference();
const w=ctx.BladefallClimb.world(1),C=ctx.BladefallPrecisionCore;
const tests=[];
const actions={l:'l',r:'r',u:'u',d:'d',jump:'j',dash:'x',grab:'g',strike:'s',parry:'p',portal:'q'};
function trace(def,tape,label=def.id){
 const g=C.createGame([def]),frames=[];
 for(const [n,k] of tape)for(let i=0;i<n;i++){
  if(g.exited)break;
  const raw={};for(const [key,ch] of Object.entries(actions))raw[key]=(k||'').includes(ch);
  C.step(g,raw);const state={};for(const [key,value] of Object.entries(g.p))if(['number','boolean','string'].includes(typeof value))state[key]=value;
  frames.push({raw,state,freeze:g.freeze,exited:g.exited,deaths:g.deaths,entities:JSON.parse(JSON.stringify(g.ents)),carrying:g.p.carrying?.id??null});g.events.length=0;
 }
 const parsed=C.parseRoom(def,0);tests.push({id:def.id,label,frames,parsed:{...parsed,grid:[...parsed.grid],portalable:[...parsed.portalable],grill:[...parsed.grill]}});
}
for(const def of w.rooms){const tape=w.tapes[def.id];if(tape)trace(def,tape);}
// Varied input probes cover hazards, a lost jump, retries, opposing directions and grab release.
let seed=0xb1ade;
const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32;};
for(const def of w.rooms){const tape=[];for(let i=0;i<40;i++){let k='';for(const ch of ['l','r','u','d','j','x','g','s'])if(random()<0.25)k+=ch;tape.push([5+Math.floor(random()*11),k]);}trace(def,tape,def.id+' / varied inputs');}
fs.mkdirSync(path.join(root,'.cache/godot'),{recursive:true});const file=path.join(root,'.cache/godot/reference.json');fs.writeFileSync(file,JSON.stringify(tests));
const engine=process.env.GODOT||path.join(root,'.cache/godot/Godot.app/Contents/MacOS/Godot');
const result=spawnSync(engine,['--headless','--path',project,'--script','res://tests/parity.gd','--',file],{encoding:'utf8',timeout:30000});process.stdout.write(result.stdout||'');process.stderr.write(result.stderr||'');process.exit(result.status??1);
