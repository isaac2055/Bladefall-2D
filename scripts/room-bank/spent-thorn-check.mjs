// Targeted contract checks for the opt-in departure-thorn device. No campaign changes.
import assert from 'node:assert/strict';
import {Core,runRoom} from '../pcore-tape.mjs';
const device=globalThis.BladefallPrecisionDevices.find(d=>d.name==='spent-thorn');
const ST=globalThis.BladefallPrecisionSpentThorn;
function room(defs,cols=40,rows=23){const map=Array.from({length:rows},()=>'.'.repeat(cols).split(''));map[rows-2][2]='P';map[rows-1].fill('#');return{id:'spent-thorn-fixture',name:'Fixture',cols,rows,exit:'right',map:map.map(r=>r.join('')),spentThorns:defs};}
const spec={id:'test',c:10,r:12,w:4,h:2,face:'up',arm:18};
function test(face='up'){const g=Core.createGame([room([{...spec,face}])]),e=ST.all(g)[0];return{g,e};}
function pose(g,x,y){Object.assign(g.p,{x,y,w:8,h:11,state:'normal'});}
function tick(g,next){device.before(g);if(next)next();device.after(g);}
for(const face of ['up','down','left','right']){
 const{g,e}=test(face),at=face==='up'?[e.x+8,e.y-11]:face==='down'?[e.x+8,e.y+e.h]:face==='left'?[e.x-8,e.y+2]:[e.x+e.w,e.y+2];
 pose(g,...at);tick(g);assert.equal(e.state,'contact');for(let i=0;i<120;i++)tick(g);assert.equal(e.state,'contact');assert.equal(g.p.state,'normal');
 tick(g,()=>pose(g,240,40));assert.equal(e.state,'arming');assert.equal(e.remaining,18);for(let i=0;i<17;i++)tick(g);assert.equal(e.state,'arming');tick(g);assert.equal(e.state,'armed');assert.equal(e.solid,true);
 tick(g,()=>pose(g,...at));assert.equal(g.p.state,'dead');assert.equal(g.events.at(-1).cause,'spent-thorn');Core.resetRoom(g);assert.equal(ST.all(g)[0].state,'dormant');
}
// Unmarked faces do not spend the selected face; recontact never cancels the warning.
{const{g,e}=test();pose(g,e.x-8,e.y+1);tick(g);assert.equal(e.state,'dormant');pose(g,e.x+8,e.y-11);tick(g);tick(g,()=>pose(g,240,40));tick(g,()=>pose(g,e.x+8,e.y-11));for(let i=0;i<17;i++)tick(g);assert.equal(g.p.state,'dead');}
// Actual player movement spends a floor, arms it, and dies on landing. Room reset clears the state.
{const d=room([{c:1,r:21,w:12,h:1,face:'up'}]);d.map[21]='.'.repeat(40);d.map[20]='..P'+'.'.repeat(37);const a=runRoom([d],0,[[6,''],[12,'j'],[75,'']]);assert(a.events.some(e=>e.type==='spent-thorn-touch'));assert(a.events.some(e=>e.type==='spent-thorn-arm'));assert(a.events.some(e=>e.type==='death'&&e.cause==='spent-thorn'));assert.equal(ST.all(a.g)[0].state,'contact');}
// Larger room dimensions, deterministic snapshots, and private gravity-face reflection.
{const g=Core.createGame([room([{c:52,r:30,w:4,h:2,face:'up'}],64,40)]),e=ST.all(g)[0];assert.equal(e.y,240);e.state='arming';e.remaining=9;const clone=structuredClone(e);assert.deepEqual(clone,e);e.y=g.room.h-e.y-e.h;device.mirror(g);assert.equal(e.face,'down');assert.deepEqual(ST.strip(e),[416,80,32,3]);device.mirror(g);assert.equal(e.face,'up');}
{const g=Core.createGame([{id:'no-opt-in',name:'Old room',map:room([]).map}]);device.before(g);device.after(g);assert.equal(ST.all(g).length,0);assert.equal(g.spentThornBefore,undefined);}
// Departing on the last warning frame is safe: the newly armed strip must not hit an old position.
{const{g,e}=test();pose(g,e.x+8,e.y-11);tick(g);tick(g,()=>pose(g,240,40));for(let i=0;i<17;i++)tick(g);pose(g,e.x+8,e.y-11);tick(g,()=>pose(g,240,40));assert.equal(e.state,'armed');assert.equal(g.p.state,'normal');}
console.log('Spent-thorn: four faces, indefinite first hold, warning/recontact, lethal retained solid, reset, actual jump, dimensions, mirror and opt-in checks passed.');
// Segmented opt-in: only covered patches spend; the untouched continuation remains usable.
for(const face of ['up','down','left','right']){
 const g=Core.createGame([room([{...spec,face,segment:4,w:4,h:4}])]),e=ST.all(g)[0];
 const at=face==='up'?[e.x,e.y-11]:face==='down'?[e.x,e.y+e.h]:face==='left'?[e.x-8,e.y]:[e.x+e.w,e.y];
 pose(g,...at);tick(g);const used=e.segments.filter(s=>s.state==='contact');assert.equal(used.length,face==='up'||face==='down'?2:3);
 for(let i=0;i<60;i++)tick(g);assert(used.every(s=>s.state==='contact'));
 tick(g,()=>pose(g,240,40));for(let i=0;i<18;i++)tick(g);assert(used.every(s=>s.state==='armed'));assert(e.segments.some(s=>s.state==='dormant'));
 const fresh=face==='up'?[e.x+20,e.y-11]:face==='down'?[e.x+20,e.y+e.h]:face==='left'?[e.x-8,e.y+20]:[e.x+e.w,e.y+20];
 // A discontinuous arrival must not sweep the intervening spent patches.
 device.before(g);pose(g,...fresh);g.events.push({type:'portal-pass',kind:'knight'});device.after(g);assert.equal(g.p.state,'normal');
 pose(g,...at);tick(g);assert.equal(g.p.state,'dead');Core.resetRoom(g);assert(ST.all(g)[0].segments.every(s=>s.state==='dormant'));
}
// Sliding along one face starts independent timers, instead of spending its whole length.
{const g=Core.createGame([room([{...spec,segment:4}])]),e=ST.all(g)[0];pose(g,e.x,e.y-11);tick(g);tick(g,()=>pose(g,e.x+4,e.y-11));assert.equal(e.segments[0].state,'arming');assert.equal(e.segments[1].state,'contact');assert.equal(e.segments[2].state,'contact');assert.equal(e.segments[3].state,'dormant');}
// Vertical patch offsets reflect with gravity while preserving their individual spent states.
{const g=Core.createGame([room([{...spec,face:'left',h:4,segment:4}])]),e=ST.all(g)[0];e.segments[0].state='armed';e.y=g.room.h-e.y-e.h;device.mirror(g);assert.equal(e.segments[0].start,28);assert.equal(ST.faces(e)[0].y,e.y+28);device.mirror(g);assert.equal(e.segments[0].start,0);}
console.log('Segmented spent-thorn: independent patches, preserved neighbours, sliding departure, teleport, reset, and vertical gravity reflection passed.');
