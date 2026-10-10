// Quiet replacements retain the old footprint and every branch/arrival opening.
// No room-bank data or compiler is changed by this scoped authoring script.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {Core,gridOf,runTape,spawnOf} from './seam-tools.mjs';
import {keysToInput} from '../rbr-lib.mjs';
const source=JSON.parse(readFileSync(new URL('./source-worlds-7.303.json',import.meta.url)));
const IDS=['cl21-fo21-torn','cl22-fw22-oath3','cl23-fc23-middle'];
const rows=[];
function append(tape,key){if(tape.at(-1)?.[1]===key)tape.at(-1)[0]++;else tape.push([1,key]);}
for(const id of IDS){
 const w=source.find(w=>w.rooms.some(d=>d.id===id)),old=w.rooms.find(d=>d.id===id),g=gridOf(old),C=old.cols||40,R=old.rows||23,sp=spawnOf(old);
 // Keep the complete outer boundary. A former boss gate is now an open door.
 for(let r=0;r<R;r++)for(let c=0;c<C;c++)if(r>0&&r<R-1&&c>0&&c<C-1)g[r][c]='.';else if(g[r][c]==='G')g[r][c]='.';
 const floor=c=>w.n===21?(c<8?18:c<14?16:c<20?14:c<26?12:c<32?10:c<35?8:7):w.n===22?(c<11?18:c<20?15:c<28?12:9):18;
 for(let c=1;c<C-1;c++)for(let r=floor(c);r<R-1;r++)g[r][c]='#';
 for(const [c,r]of old.seam||[])g[r][c]=old.map[r][c];
 g[sp.r][sp.c]='P';
 const def={id,name:'The Quiet Passage',origin:old.origin,exit:old.exit||'right',cols:C,rows:R,map:g.map(r=>r.join('')),palette:old.palette,connector:true,retiredChallenge:true,seam:old.seam||[],doors:old.doors||[],returns:old.returns||[],people:old.people||[],closeWhilePlayed:old.closeWhilePlayed};
 const q=Core.createGame([def],{room:0}),tape=[];let exited=false,deaths=0,jumpHold=0;
 // Ordinary run and jump only: jump where the short stair blocks forward motion.
 for(let f=0;f<450&&!exited;f++){
  const p=q.p,step=Core.solidAt(q,p.x+p.w+1,p.y+2,4,p.h-3);if(p.onGround&&step&&!q.prev.jump)jumpHold=14;const key=jumpHold-->0?'rj':'r';append(tape,key);Core.step(q,keysToInput(key));for(const e of q.events){if(e.type==='death')deaths++;if(e.type==='exit')exited=true;}q.events.length=0;
 }
 if(!exited||deaths)console.log(JSON.stringify({id,exited,deaths,p:q.p,tape,map:def.map},null,2));assert.ok(exited&&!deaths,id+' ordinary route');const checked=runTape(def,tape,{extra:0});assert.ok(checked.exit&&!checked.deaths);
 const branches=[];
 for(const door of def.doors){
  const b=Core.createGame([def],{room:0}),route=[],cx=(door.cols[0]+door.cols.at(-1)+1)*4;let reached=false;
  for(let f=0;f<350;f++){
   const p=b.p,dx=cx-(p.x+p.w/2),key=Math.abs(dx)<=2?'':dx<0?'l':'r';append(route,key);Core.step(b,keysToInput(key));assert.ok(!b.events.some(e=>e.type==='death'),id+' branch approach');b.events.length=0;
   if(Math.abs(dx)<=2&&p.onGround){reached=true;break;}
  }
  assert.ok(reached,id+' branch beam');for(let r=0;r<=Math.floor(b.p.y/8);r++)for(const c of door.cols)assert.notEqual(g[r][c],'#',id+' unobstructed native lift beam');
  branches.push({to:door.to,approach:route,at:{x:b.p.x,y:b.p.y},note:'Native ceiling-door lift has a clear full-height shaft from this stance. Hold Up to enter using existing climb-view lift.'});
 }
 for(let r=0;r<R;r++)for(let c=0;c<C;c++)if(r===0||r===R-1||c===0||c===C-1)assert.equal(g[r][c],old.map[r][c]==='G'?'.':old.map[r][c],id+' boundary');
 assert.deepEqual(def.seam,old.seam);assert.deepEqual(def.doors,old.doors||[]);assert.deepEqual(def.returns,old.returns||[]);
 rows.push({world:w.n,id,def,tape,proof:{frames:tape.reduce((n,a)=>n+a[0],0),deaths:0,exit:true,inputs:['run','jump'],branches,unchanged:['dimensions','spawn','outer-boundary openings','seam','doors','returns'],removed:w.n===21?['tear lines','crumbles','spikes']:w.n===22?['root crown','lashes','resin wind','boss gate','spikes']:['brute','combat gate','falling weights','interior post']}});
 console.log(id,rows.at(-1).proof.frames+' frames',branches.length+' branch approaches');
 writeFileSync(new URL('./retired-passages-7.306.json',import.meta.url),JSON.stringify({version:'7.306.0',source:'source-worlds-7.303.json',rooms:rows},null,2)+'\n');
}
