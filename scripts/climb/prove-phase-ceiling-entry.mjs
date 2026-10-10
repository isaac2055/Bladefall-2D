// Native entry + original puzzle route; deliberately never resets authored state.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import '../room-bank/register.mjs';
import {Core,CL,createSeamGame,EXTRA_TAPES,runTape} from './seam-tools.mjs';
import {connectorOffsetDrop} from './bank-connectors.mjs';
import {entranceDrop} from './bank-ceiling-entry.mjs';
import {keysToInput} from '../rbr-lib.mjs';
const proofs=[];
for(const [n,world]of [[31,33],[32,40]]){
 const rec=JSON.parse(readFileSync(new URL(`../room-bank/fractured/${n}-bank-f${n}.json`,import.meta.url),'utf8'));
 const closed={...rec.room,id:`cl${world}-bank-f${n}`,campaignImport:{source:rec.room.id}};
 const arrival=entranceDrop(closed,28);assert(arrival);
 const road=connectorOffsetDrop('right',28,closed.palette,24),roadTape=EXTRA_TAPES[road.id],roadRun=runTape(road,roadTape);
 assert(roadRun.exit&&!roadRun.deaths);
 const placement={x:Math.floor((roadRun.snap.x+4)/Core.TILE)-28,y:road.rows};
 const entryTape=[[65,''],[32,'r'],[10,'']],g=createSeamGame([arrival],{room:0});
 CL.carry(Core,g,roadRun.snap,{x:0,y:0},{x:placement.x*8,y:placement.y*8});
 const restored=Core.parseRoom(closed),entryEvents=[];let didClose=false,entryFrames=0,closedAt=null;
 for(const[n,key]of entryTape)for(let f=0;f<n;f++){
  Core.step(g,keysToInput(key));entryFrames++;entryEvents.push(...g.events.map(e=>({frame:entryFrames,type:e.type})));
  assert(!g.events.some(e=>['death','exit','phase','stone-lit','gate-open'].includes(e.type)),`${closed.id}: entry changes puzzle or dies`);
  if(!didClose&&g.p.onGround&&Math.abs(g.p.x-g.room.spawn.x)<=10&&Math.abs(g.p.y-g.room.spawn.y)<=2){
   for(const[c,r]of arrival.seam){const i=r*g.room.cols+c;g.room.grid[i]=restored.grid[i];g.room.portalable[i]=restored.portalable[i];}
   g.room.rev=(g.room.rev||0)+1;didClose=true;closedAt={frame:entryFrames,x:g.p.x,y:g.p.y};
  }
  g.events.length=0;
 }
 assert(didClose);assert.equal(g.phase,0);assert.equal(g.p.x,g.room.spawn.x);assert.equal(g.p.y,g.room.spawn.y);assert.equal(g.p.vx,0);assert.equal(g.p.vy,0);
 const atFire={x:g.p.x,y:g.p.y,phase:g.phase,onGround:g.p.onGround,dashes:g.p.dashes};
 const routeEvents=[];let frames=0,exit=null;
 route:for(const[n,key]of rec.tape)for(let f=0;f<n;f++){
  Core.step(g,keysToInput(key));frames++;routeEvents.push(...g.events.map(e=>({frame:frames,type:e.type})));
  assert(!g.events.some(e=>e.type==='death'),`${closed.id}: canonical route death at ${frames}`);
  const e=g.events.find(e=>e.type==='exit');if(e){assert(!e.side);exit={frame:frames,x:g.p.x,y:g.p.y};break route;}
  g.events.length=0;
 }
 assert(exit,`${closed.id}: canonical route did not finish`);
 const proof={id:closed.id,road,roadTape,roadExit:roadRun.snap,arrival,placement,entryTape,entryEvents,closedAt,atFire,canonicalTape:rec.tape,routeEvents,exit,deaths:0};
 const file=new URL(`./.cache/world${world}-f${n}-ceiling-entry-proof.json`,import.meta.url);writeFileSync(file,JSON.stringify(proof,null,2)+'\n');
 proofs.push({id:closed.id,atFire,closedAt,exit,proof:file.pathname});
}
console.log(JSON.stringify(proofs,null,2));
