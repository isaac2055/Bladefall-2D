// Focused mechanic smoke: geometry, safe jams, gravity, reset, and first-frame beam obstruction.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const root=new URL('../../',import.meta.url),context=vm.createContext({console});
// Deliberately load beam first, as alphabetical device discovery does.
for(const name of ['bladefall-pcore.js','bladefall-pcore-dev-beam.js','bladefall-pcore-dev-hinge.js','bladefall-pcore-dev-gravity.js']){
 vm.runInContext(readFileSync(new URL('public/'+name,root),'utf8'),context,{filename:name});
}
const Core=context.BladefallPrecisionCore,H=context.BladefallPrecisionHinge,G=context.BladefallPrecisionGravity;
const dev=context.BladefallPrecisionDevices.find(d=>d.name==='hinge');
function room(extra={},put=[]){
 const map=Array.from({length:23},(_,r)=>(r===0||r>=21?'#'.repeat(40):'#'+'.'.repeat(38)+'#').split(''));
 map[20][3]='P';for(const [c,r,ch] of put)map[r][c]=ch;
 return {id:'hinge-check',map:map.map(r=>r.join('')),hingeArms:[{id:'A',c:12,r:10,length:5,dir:'right'}],...extra};
}
function arm(g){return H.arms(g)[0];}
function strike(g){
 const e=arm(g),p=g.p;
 Object.assign(p,{x:e.pivotX-16,y:e.pivotY-11,state:'normal',onGround:false,strikeTimer:5,strikeDir:{x:1,y:0}});
 p.strikeHit.clear();dev.after(g);
}
const g=Core.createGame([room()]);
Object.assign(g.p,{dashes:0,vx:40,vy:-20});
for(const dir of ['down','left','up','right']){strike(g);assert.equal(arm(g).dir,dir);}
assert.equal(g.events.filter(e=>e.type==='hinge-turn').length,4);
assert.equal(g.p.dashes,0);assert.equal(g.p.vx,40);assert.equal(g.p.vy,-20);
dev.after(g);assert.equal(arm(g).turns,4,'the same extended strike cannot turn twice');
assert.ok(Core.solidAt(g,100,82,1,1),'arm participates in ordinary solid collision');
Core.resetRoom(g);assert.equal(arm(g).dir,'right');assert.equal(arm(g).turns,0);
const rock=Core.createGame([room({},[[12,13,'#']])]);strike(rock);
assert.equal(arm(rock).dir,'right');assert.equal(arm(rock).jamReason,'rock');
const body=Core.createGame([room()]);const e=arm(body);
Object.assign(body.p,{x:e.pivotX,y:e.pivotY+8,state:'normal',strikeTimer:5,strikeDir:{x:0,y:-1}});
dev.after(body);assert.equal(e.dir,'right');assert.equal(e.jamReason,'knight');assert.equal(body.deaths,0);
const lantern=Core.createGame([room({},[[12,13,'l']])]);strike(lantern);assert.equal(arm(lantern).jamReason,'lantern');
const other=Core.createGame([room({hingeArms:[{id:'A',c:12,r:10,length:5,dir:'right'},{id:'B',c:10,r:13,length:5,dir:'right'}]})]);
strike(other);assert.equal(arm(other).jamReason,'arm');
assert.throws(()=>Core.createGame([room({},[[14,10,'#']])]),/starts overlapping rock/);
assert.throws(()=>Core.createGame([room({hingeArms:[{id:'A',c:12,r:10,length:1,dir:'right'}]})]),/invalid hinge/);
const inverted=Core.createGame([room()]);G.mirror(inverted);assert.equal(inverted.flipped,true);
assert.equal(arm(inverted).pivotY,96);strike(inverted);assert.equal(arm(inverted).dir,'up','screen-clockwise becomes sim-up after mirroring');
G.mirror(inverted);assert.equal(arm(inverted).dir,'down');assert.equal(arm(inverted).pivotY,80);
Core.resetRoom(inverted);assert.equal(inverted.flipped,false);assert.equal(arm(inverted).dir,'right');
const beam=Core.createGame([room({beams:[{c:14,r:1,dir:'d'}],beamsHarmless:true},[[14,15,'c']])]);
assert.equal(!!beam.ents.find(e=>e.type==='stone').lit,false,'initial beam trace is blocked before it can light a stone');
strike(beam);context.BladefallPrecisionBeam.trace(beam);
assert.equal(beam.ents.find(e=>e.type==='stone').lit,true,'turning the arm opens the actual light path');
console.log('Hinged arms: turn/dedup, collision, safe jams, reset, gravity, and initial beam ordering PASS.');
