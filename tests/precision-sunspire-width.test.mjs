import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {Core,Rooms,runRoom,keysToInput} from '../scripts/rbr-lib.mjs';
test('native King floor waves remain alive beyond the old 320px screen in a wide court',()=>{
 const cols=80,rows=23,map=Array.from({length:rows},()=>'.'.repeat(cols));map[20]='.P'+'.'.repeat(cols-2);map[21]='#'.repeat(cols);
 const room={id:'wide-king-wave',cols,rows,map,dayKing:{c:60,r:20,need:2,beat:[100],wave:0}};
 const g=Core.createGame([room]);for(let i=0;i<45;i++)Core.step(g,keysToInput(i===0?'r':''));
 assert.ok(g.dayKing.waves.length>0);assert.ok(g.dayKing.waves.some(w=>w.x>Core.W&&w.x<g.room.w));
});
test('all six native Sunspire King tapes still defeat their actual boss and exit without death',()=>{
 for(const d of Rooms.all.filter(d=>d.dayKing)){
  const r=runRoom([d],0,Rooms.tapes[d.id],{maxExtra:10});assert.equal(r.exited,true,d.id);assert.equal(r.deaths,0,d.id);assert.equal(r.g.dayKing.yielded,true,d.id);
 }
});

test('native King window telegraphs reach the actual wide and tall court bounds',()=>{
 const ctx={BladefallPrecisionCore:Core};vm.runInNewContext(readFileSync(new URL('../public/bladefall-pcore-dev-rbr-sunspire-view.js',import.meta.url),'utf8'),ctx);
 const cols=84,rows=46,map=Array.from({length:rows},()=>'.'.repeat(cols));map[40]='.P'+'.'.repeat(cols-2);map[41]='#'.repeat(cols);
 const g=Core.createGame([{id:'king-window-bounds',cols,rows,map,dayKing:{c:60,r:40,need:2}}]),calls=[];
 const b={fillRect(x,y,w,h){calls.push({x,y,w,h,color:this.fillStyle});}};
 for(const sun of [{c:2,r:30,dir:'r'},{c:70,r:2,dir:'d'}]){
  calls.length=0;g.dayKing.sunNext=sun;ctx.BladefallPrecisionDeviceViews[0].draw(b,g);
  const dots=calls.filter(x=>x.color==='rgba(255,246,213,.55)');
  assert.ok(dots.length>0);assert.ok(dots.some(x=>sun.dir==='r'?x.x>70*8:x.y>35*8));
  assert.ok(dots.every(x=>x.x<cols*8&&x.y<rows*8));
 }
});
