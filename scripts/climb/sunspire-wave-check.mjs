// Bounded native ordinary-entry probes for Sunspire's wall-portal wavedash.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {Core,expand,keysToInput} from '../pcore-tape.mjs';
import {snapshot,restore} from '../pcore-search.mjs';
const s=JSON.parse(readFileSync(new URL('../room-bank/fractured/115-bank-f115.json',import.meta.url)));
const g=Core.createGame([s.room]);let base=null,wave=null,transfer=null,airDash=-99;
for(const k of expand(s.tape)){
 const grounded=g.p.onGround;Core.step(g,keysToInput(k));assert.equal(g.deaths,0);
 for(const e of g.events){
  if(e.type==='portal-open'&&g.portals?.blue?.c===80&&g.portals?.orange?.c===52&&!base)base=snapshot(g);
  if(e.type==='dash'&&!grounded&&e.dx>0&&e.dy>0)airDash=g.frame;
  if(e.type==='hyper'&&g.frame-airDash<=12&&g.p.x>380&&g.p.x<416){assert.equal(g.p.dashes,1);wave={frame:g.frame,x:g.p.x,y:g.p.y};}
  if(e.type==='portal-pass'&&e.kind==='knight'&&g.p.x>620&&g.p.x<650){assert(wave);assert(g.p.vx<=-250);assert.equal(g.p.dashes,1);transfer={frame:g.frame,vx:g.p.vx,vy:g.p.vy};}
 }
 g.events.length=0;if(g.coreRun.index>=1)break;
}
assert(base);assert(wave);assert(transfer);assert.equal(g.coreRun.index,1);
let probes=0,entries=0,corrections=0;const passes=[];
for(let run=0;run<=24;run+=4)for(const jump of [0,4,8,12])for(const delay of [0,6,12])for(const dash of ['','rx','rdx','rux']){const z=restore(base);let entry=false,invalid=false;probes++;outer:for(const[n,k]of [[run,'r'],[jump,'rj'],[delay,'r'],[8,dash||'r'],[60,'r']])for(let j=0;j<n;j++){z.events=[];Core.step(z,keysToInput(k));if(z.deaths||z.events.some(e=>['hyper','super'].includes(e.type))){invalid=true;break outer;}if(z.events.some(e=>e.type==='portal-pass')){entry=true;break outer;}}if(!entry||invalid)continue;entries++;const launch=snapshot(z);for(const wait of [0,4,8,12,16,20])for(const aim of ['','lux','lx','ux']){const g=restore(launch);corrections++;for(const[n,k]of [[wait,'l'],[8,aim||'l'],[100,'l']]){for(let j=0;j<n;j++){Core.step(g,keysToInput(k));g.events=[];if(g.deaths||g.p.onGround&&g.p.x<600&&g.p.y<=845)break;}if(g.deaths||g.p.onGround&&g.p.x<600&&g.p.y<=845)break;}if(!g.deaths&&g.p.onGround&&g.p.x<600&&g.p.y<=845)passes.push({run,jump,delay,dash,wait,aim,x:g.p.x,y:g.p.y,entry:{vx:z.p.vx,vy:z.p.vy,d:z.p.dashes}});}}
assert.equal(passes.length,0,'ordinary approaches must not reach any safe landing beyond the portal');
export const proof={wavedash:wave,transfer,ordinaryApproaches:probes,portalEntries:entries,corrections,bypasses:passes.length,limits:'Finite native probes from the proven shooting approach; no exhaustive bypass or human difficulty claim.'};
if(process.argv[1]===fileURLToPath(import.meta.url))console.log(JSON.stringify({result:'PASS',...proof}));
