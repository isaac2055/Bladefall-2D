// Native horizontal portal launch and bounded correction-window evidence.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {Core,expand,keysToInput} from '../pcore-tape.mjs';
import {snapshot,restore} from '../pcore-search.mjs';
const source=JSON.parse(readFileSync(new URL('../room-bank/fractured/115-bank-f115.json',import.meta.url)));
const g=Core.createGame([source.room]);let launch=null,save=null;
for(const k of expand(source.tape)){Core.step(g,keysToInput(k));assert.equal(g.deaths,0);if(g.events.some(e=>e.type==='portal-pass'&&e.kind==='knight')&&g.p.x===944&&g.p.y>=320&&g.p.y<=325){assert(g.p.vx>=300);launch=snapshot(g);}if(g.coreRun.index>=4){save=g.frame;break;}g.events.length=0;}assert(launch);assert(save);
const deaths=[];for(const key of ['','l','r']){const z=restore(launch);let n=0;for(;n<150&&!z.deaths&&z.coreRun.index<4;n++){Core.step(z,keysToInput(key));if(z.deaths)deaths.push({input:key,after:n+1,cause:z.events.find(e=>e.type==='death')?.cause});z.events.length=0;}assert(z.deaths,'uncorrected fling must not reach safety');}
let probes=0;const windows=[];
for(let wait=0;wait<18;wait++)for(const pre of ['','l'])for(const dash of ['lux','ux','lx']){const z=restore(launch);probes++;for(const[n,k]of [[wait,pre],[8,dash],[120,'l']]){for(let j=0;j<n;j++){Core.step(z,keysToInput(k));z.events.length=0;if(z.deaths||z.coreRun.index>=4)break;}if(z.deaths||z.coreRun.index>=4)break;}if(!z.deaths&&z.coreRun.index>=4)windows.push({wait,pre,dash});}
assert(windows.length>=4&&windows.length<probes/4);assert(windows.every(w=>w.wait<=3&&w.dash!=='lx'),'reverse upwards early enough to clear the wall cap');
export const proof={launch:{frame:launch.frame,vx:launch.p.vx,vy:launch.p.vy},save,uncorrected:deaths,correction:{probes,windows},limits:'Finite correction probes and native simulation, not human difficulty verification.'};
if(process.argv[1]===fileURLToPath(import.meta.url))console.log(JSON.stringify({result:'PASS',...proof}));
