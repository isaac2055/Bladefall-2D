// Room by Room (7.259) authoring library: loads the Precision Core with the Room by Room registry and every
// region file present (public/bladefall-rbr-NN-*.js), then re-exports the tape runner and the route search.
//   import {Rooms,RBR,runRoom,sideRun,search,beam,polish,ACT,toward} from './rbr-lib.mjs';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
import {readdirSync} from 'node:fs';
globalThis.BLADEFALL_RBR=true;
const here=dirname(fileURLToPath(import.meta.url)),require=createRequire(import.meta.url);
const T=await import('./pcore-tape.mjs');
const pub=resolve(here,'../public');
require(resolve(pub,'bladefall-rbr.js'));
for(const f of readdirSync(pub).sort())if(/^bladefall-rbr-\d\d-.*\.js$/.test(f)&&!/-view\.js$/.test(f)){
 try{require(resolve(pub,f));}catch(e){console.warn('rbr-lib: skipped '+f+': '+e.message);}
}
export const {Core,Rooms,runRoom,expand,keysToInput,picture}=T;
export const RBR=globalThis.BladefallRoomByRoom;
const S=await import('./pcore-search.mjs');
export const {search,beam,polish,compress,ACT,toward,gameAt,run,snapshot,restore}=S;
export const roomIndex=id=>Rooms.all.findIndex(d=>d.id===id);
export const roomDef=id=>Rooms.all.find(d=>d.id===id);
/* Run a tape and report how it left: {exited, side, deaths, frame, g, events}. */
export function sideRun(id,tape,extra=30){
 const g=Core.createGame(Rooms.all,{room:roomIndex(id)});const ev=[];let out=null,deaths=0,frame=-1;
 const frames=expand(tape);
 for(let i=0;i<frames.length+extra;i++){Core.step(g,keysToInput(frames[i]||''));
  for(const e of g.events){ev.push({...e,i});if(e.type==='death')deaths++;if(e.type==='exit'&&!out){out=e;frame=i;}}g.events.length=0;if(out)break;}
 return {exited:!!out,side:!!(out&&out.side),deaths,frame,g,events:ev};
}
/* Draw a room with a run's positions (every `every` frames) as digits 0–9. */
export function trace(id,tape,every=10){
 const g=Core.createGame(Rooms.all,{room:roomIndex(id)});const pts=[];
 for(const [i,k] of expand(tape).entries()){Core.step(g,keysToInput(k));g.events.length=0;if(i%every===0)pts.push({x:g.p.x,y:g.p.y});}
 const d=roomDef(id),cols=d.cols||40;const rows=d.map.map(r=>r.padEnd(cols,'.').split(''));
 pts.forEach((pt,n)=>{const c=Math.floor((pt.x+4)/8),r=Math.floor((pt.y+6)/8);if(rows[r]&&rows[r][c]!==undefined)rows[r][c]=String(n%10);});
 return rows.map(r=>r.join('')).join('\n');
}
