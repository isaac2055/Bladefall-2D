// Deterministic tape runner for the Precision Core. Used by verification and while authoring rooms.
// A tape is a list of [frames, keys]; keys are letters: l r u d (move/aim), j (jump), x (dash),
// g (grab), s (strike), p (parry), q (portal). A held key presses on its first frame; repeat a press by leaving a gap.
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
const require=createRequire(import.meta.url);
const here=dirname(fileURLToPath(import.meta.url));
require(resolve(here,'../public/bladefall-pcore.js'));
require(resolve(here,'../public/bladefall-pcore-foes.js'));
require(resolve(here,'../public/bladefall-pcore-portals.js'));
require(resolve(here,'../public/bladefall-pcore-rooms.js'));
require(resolve(here,'../public/bladefall-pcore-tapes.js'));
require(resolve(here,'../public/bladefall-pcore-combat.js'));
require(resolve(here,'../public/bladefall-pcore-combat-rooms.js'));
require(resolve(here,'../public/bladefall-pcore-combat-tapes.js'));
// 7.254+: device modules (bladefall-pcore-dev-*.js, not their -view drawers) and the later parts
// (bladefall-pcore-part-NNN-*.js, in level order). The page lists the same files as script tags.
require(resolve(here,'../public/bladefall-pcore-parts.js'));
{const {readdirSync}=require('node:fs');const pub=resolve(here,'../public'),files=readdirSync(pub).sort();
 for(const f of files)if(/^bladefall-pcore-dev-.*\.js$/.test(f)&&!/-view\.js$/.test(f))require(resolve(pub,f));
 // A part file that fails to load (for instance mid-edit) is reported and skipped, so other parts still run.
 for(const f of files)if(/^bladefall-pcore-part-\d{3}.*\.js$/.test(f)){try{require(resolve(pub,f));}catch(e){console.warn('pcore-tape: skipped '+f+': '+e.message);}}}
export const Core=globalThis.BladefallPrecisionCore;
export const Rooms=globalThis.BladefallPrecisionRooms;

export function keysToInput(k){return {l:k.includes('l'),r:k.includes('r'),u:k.includes('u'),d:k.includes('d'),jump:k.includes('j'),dash:k.includes('x'),grab:k.includes('g'),strike:k.includes('s'),parry:k.includes('p'),portal:k.includes('q')};}
export function expand(tape){const out=[];for(const [n,k]of tape)for(let i=0;i<n;i++)out.push(k||'');return out;}

/* Runs a tape in one room. Returns the outcome and a trace sampled every frame. */
export function runRoom(defs,index,tape,{trace=false,maxExtra=0}={}){
 const g=Core.createGame(defs,{room:index});
 const frames=expand(tape);const log=[];const events=[];let exited=false,exitFrame=-1,deaths=0;
 for(let i=0;i<frames.length+maxExtra;i++){
  Core.step(g,keysToInput(frames[i]||''));
  for(const e of g.events){events.push({...e,i});if(e.type==='death')deaths++;if(e.type==='exit'&&!exited){exited=true;exitFrame=i;}}
  g.events.length=0;
  if(trace)log.push({i,x:g.p.x,y:g.p.y,vx:+g.p.vx.toFixed(1),vy:+g.p.vy.toFixed(1),st:g.p.state,d:g.p.dashes,gr:g.p.onGround?1:0,ph:g.phase,st2:+g.p.stamina.toFixed(1)});
  if(exited)break;
 }
 return {exited,exitFrame,deaths,g,log,events};
}

/* Room text with the knight drawn at a trace position — for reading a run while authoring. */
export function picture(def,points){
 const rows=def.map.map(r=>r.padEnd(Core.COLS,'.').split(''));
 for(const [n,pt]of points.entries()){const c=Math.floor((pt.x+4)/8),r=Math.floor((pt.y+6)/8);if(rows[r]&&rows[r][c]!==undefined)rows[r][c]=String(n%10);}
 return rows.map(r=>r.join('')).join('\n');
}

if(process.argv[1]===fileURLToPath(import.meta.url)){
 const [,,id,json,every='6']=process.argv;
 const defs=Rooms.all;const index=defs.findIndex(d=>d.id===id);
 if(index<0){console.error('unknown room',id,defs.map(d=>d.id).join(' '));process.exit(1);}
 const tape=json?JSON.parse(json):(Rooms.tapes[id]||[]);
 const r=runRoom(defs,index,tape,{trace:true,maxExtra:60});
 const step=+every;
 for(const t of r.log)if(t.i%step===0||t.st==='dead')console.log(JSON.stringify(t));
 console.log(r.events.filter(e=>!['land'].includes(e.type)).map(e=>e.i+':'+e.type).join(' '));
 console.log('exited',r.exited,'frame',r.exitFrame,'deaths',r.deaths);
 console.log(picture(defs[index],r.log.filter(t=>t.i%12===0)));
}
