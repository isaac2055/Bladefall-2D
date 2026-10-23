// The shared two-knight simulation in node (bladefall-workshop-ascend-coop-core.js over the real engine).
import {createRequire} from 'node:module';
import {Core} from '../pcore-tape.mjs';
const require=createRequire(import.meta.url);
require('../../public/bladefall-workshop-ascend-coop-core.js');
export const Shared=globalThis.BladefallWorkshopAscendCoopCore;
export {Core};
const KEYS=['l','r','u','d','jump','dash','grab','strike','parry','portal'];
export const input=k=>Object.fromEntries(KEYS.map(n=>[n,typeof k==='string'?({l:'l',r:'r',u:'u',d:'d',jump:'j',dash:'x',grab:'g',strike:'s',parry:'p',portal:'q'})[n]&&k.includes(({l:'l',r:'r',u:'u',d:'d',jump:'j',dash:'x',grab:'g',strike:'s',parry:'p',portal:'q'})[n]):false]));
/* Play two tapes (arrays of key strings per frame) together; returns what happened. */
export function play(def,tapes,{extra=120}={}){
 const s=Shared.create(def),n=Math.max(tapes[0].length,tapes[1].length)+extra,log=[];let deaths=0;
 for(let i=0;i<n&&!s.complete;i++){s.g.events.length=0;Shared.step(s,[input(tapes[0][i]||''),input(tapes[1][i]||'')]);for(const e of s.g.events)if(e.type==='death')deaths++;log.push(s.actors.map(a=>[Math.round(a.p.x),Math.round(a.p.y),a.p.state,a.exited?1:0]));}
 return {complete:s.complete,deaths,frames:log.length,log,s};
}
