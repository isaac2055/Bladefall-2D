// Sunspire authoring checks. Finite timing probes, not exhaustive bypass or human difficulty proof.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {Core,expand,keysToInput} from '../pcore-tape.mjs';
import {snapshot,restore} from '../pcore-search.mjs';
const source=JSON.parse(readFileSync(new URL('../room-bank/fractured/115-bank-f115.json',import.meta.url)));
const g=Core.createGame([source.room]);let launch=null,save=null;
for(const k of expand(source.tape)){
 Core.step(g,keysToInput(k));assert.equal(g.deaths,0,'first section survives rebuilt authoring geometry');
 if(!launch&&g.events.some(e=>e.type==='portal-pass'&&e.kind==='knight')){assert(g.p.vy<=-300,'carry the high fall through the first portal');launch=snapshot(g);}
 if(g.coreRun.index>=0){save=g.frame;break;}g.events.length=0;
}
assert(launch);assert(save);
const idle=[];
for(const key of ['','l','r']){const z=restore(launch);let n=0;for(;n<120&&!z.deaths&&z.coreRun.index<0;n++){Core.step(z,keysToInput(key));z.events.length=0;}assert(z.deaths,'uncorrected launch must die: '+key);idle.push({input:key,deathAfter:n});}
const windows=[];let probes=0;
for(let wait=0;wait<17;wait++)for(const pre of ['','r'])for(const dash of ['rx','rux']){
 const z=restore(launch);probes++;for(const[n,k]of [[wait,pre],[8,dash],[100,'r']]){for(let j=0;j<n;j++){Core.step(z,keysToInput(k));z.events.length=0;if(z.deaths||z.coreRun.index>=0)break;}if(z.deaths||z.coreRun.index>=0)break;}
 if(!z.deaths&&z.coreRun.index>=0)windows.push({wait,pre,dash});
}
assert(windows.length>=3,'allow several adjacent launch correction frames');assert(windows.length<probes/4,'launch correction must be timed');assert(windows.every(w=>w.dash==='rux'),'horizontal dash alone does not clear the capped wall');
// Give a low-speed portal exit the same favorable position and retained dash.
let lowSpeedProbes=0,lowSpeedPasses=0;
for(let wait=0;wait<25;wait++)for(const pre of ['','r'])for(const dash of ['rx','rux','ux']){
 const z=restore(launch);z.p.vy=-170;lowSpeedProbes++;
 for(const[n,k]of [[wait,pre],[8,dash],[120,'r']]){for(let j=0;j<n;j++){Core.step(z,keysToInput(k));z.events.length=0;if(z.deaths||z.coreRun.index>=0)break;}if(z.deaths||z.coreRun.index>=0)break;}
 if(!z.deaths&&z.coreRun.index>=0)lowSpeedPasses++;
}
assert.equal(lowSpeedPasses,0,'the same correction from a minimum-speed exit cannot clear the high cap');
export const proof={firstSave:save,firstPortal:{frame:launch.frame,vy:launch.p.vy},uncorrected:idle,correction:{probes,windows},minimumSpeedFixture:{probes:lowSpeedProbes,passes:lowSpeedPasses},limits:'First-section finite probes; the other Sunspire checks cover the subsequent transfers.'};
if(process.argv[1]===fileURLToPath(import.meta.url))console.log(JSON.stringify({result:'PASS',...proof}));
