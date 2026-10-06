import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {bootFixture} from './climb-passage-fixture.mjs';
const f=bootFixture([],true,true),source=fs.readFileSync(new URL('../public/bladefall-climb-view.js',import.meta.url),'utf8');
const scope={st:f.st,TILE:8,R:()=>f.R,C:()=>f.Core,CL:()=>f.ctx.BladefallClimb,defOf:id=>f.R.all.find(d=>d.id===id)};vm.createContext(scope);
vm.runInContext(source.slice(source.indexOf('function routePath('),source.indexOf('function drawWalkers(')),scope);
let n=0;
for(const w of f.worlds)for(let i=0;i<w.sections.length;i++){
 const sec=w.sections[i],d=f.R.all.find(d=>d.id===sec.room);if(!d.atlasTerrain)continue;
 const path=scope.routePath(d);assert.ok(path.length>0);
 const npc={world:w.n,sec,k:i,dest:w.sections[i+1].room,who:'test',i:path.length-2,x:0,y:0};
 f.st.world=f.worlds.find(other=>other.n!==w.n);scope.stepWalk(npc);
 assert.equal(npc.sec.room,w.sections[i+1].room,'walker retains its own regional route');n++;
}
console.log(`${n} internal passages provide continuous NPC route paths; walkers retain their world after the player crosses a regional boundary.`);
