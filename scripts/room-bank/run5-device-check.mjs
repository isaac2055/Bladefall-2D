// Use the same rail/pool interaction in a normal room and beyond both old viewport edges.
import assert from 'node:assert/strict';
import {Core,keysToInput} from '../pcore-tape.mjs';
function canvas(cols,rows){const a=Array.from({length:rows},()=>Array(cols).fill('.'));return {a,put:(c,r,s)=>[...s].forEach((x,i)=>a[r][c+i]=x),map:()=>a.map(x=>x.join(''))};}
for(const [cols,rows,dx,dy]of [[40,23,0,0],[80,46,40,20]]){
 const m=canvas(cols,rows),put=(c,r,s)=>m.put(c+dx,r+dy,s);
 put(8,11,'#####');put(10,10,'Pn');
 for(let r=10;r<=12;r++)put(14,r,'wwwwwwww');put(14,13,'########');
 const g=Core.createGame([{id:'pool-'+cols,cols,rows,map:m.map(),thaw:36}],{room:0});
 assert.equal(g.water.pools.length,1);assert.equal(g.water.pools[0].cells.length,24);
 assert.equal(globalThis.BladefallPrecisionWater.inWater(g,(14+dx)*8+4,(10+dy)*8+4),true);
 Core.step(g,keysToInput('s'));
 assert.ok(g.events.some(e=>e.type==='condenser'),'blade reaches the condenser');
 assert.equal(Core.tileAt(g,14+dx,10+dy),Core.SOLID,'remote pool freezes in the correct cells');
 for(let i=0;i<45;i++)Core.step(g,keysToInput(''));
 assert.equal(Core.tileAt(g,14+dx,10+dy),Core.EMPTY,'same pool thaws');
 g.p.x=(15+dx)*8;g.p.y=(10+dy)*8;g.p.vx=g.p.vy=0;
 Core.step(g,keysToInput(''));
 assert.equal(g.p.swimming,true,'water forces operate at the actual coordinates');
 const n=canvas(cols,rows),set=(c,r,s)=>n.put(c+dx,r+dy,s);
 set(8,13,'----------)---------------------');set(10,12,'CCC');set(11,11,'P');
 const rail=Core.createGame([{id:'rail-'+cols,cols,rows,map:n.map()}],{room:0}),cart=rail.ents.find(e=>e.type==='cart');
 for(let i=0;i<65;i++)Core.step(rail,keysToInput('r'));
 assert.ok(cart.x>(18+dx)*8,'cart rolls across parsed rails and a boost strip');
 assert.ok(!cart.gone&&!cart.lost,'cart below the old screen bottom remains in the room');
 assert.equal(cart.y,(12+dy)*8,'far rail supports the moving cart');
}
console.log('PASS: condenser/freeze/thaw/swim and cart/rail/boost interactions in normal and wide/tall rooms.');
