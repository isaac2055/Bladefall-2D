import assert from 'node:assert/strict';
import {Core,keysToInput} from '../pcore-tape.mjs';
import '../../public/bladefall-pcore-dev-core-checkpoints-view.js';
const map=Array.from({length:40},()=>'.'.repeat(40));map[10]='..........P.............................';map[11]='#'.repeat(40);map[28]='#'.repeat(40);
const g=Core.createGame([{id:'upright-anchor',cols:40,rows:40,map,coreCheckpoints:[{c:10,r:10,width:40}],exit:'right'}]);
const G=globalThis.BladefallPrecisionGravity;
G.mirror(g);Object.assign(g.p,{x:80,y:77,vx:0,vy:0,onGround:true,state:'normal',respawnTimer:0});
Core.step(g,keysToInput(''));assert(g.p.onGround);assert.equal(g.coreRun.index,-1,'inverted surface at the same simulation coordinates is not the authored save');
G.mirror(g);Object.assign(g.p,{x:80,y:77,vx:0,vy:0,onGround:true});Core.step(g,keysToInput(''));assert.equal(g.coreRun.index,0);
G.mirror(g);Core.kill(g,g.p,'test');for(let f=0;f<100&&g.flipped;f++)Core.step(g,keysToInput(''));
assert(!g.flipped);assert.equal(g.coreRun.index,0);assert.equal(g.p.x,80);assert.equal(g.p.y,77);
// Compose the checkpoint drawing with the native view's outer inversion.
let sy=-1,ty=320;const stack=[],rects=[];
const ctx={save(){stack.push([sy,ty]);},restore(){[sy,ty]=stack.pop();},translate(x,y){ty+=sy*y;},scale(x,y){sy*=y;},fillRect(x,y,w,h){rects.push([x,sy*y+ty,w,sy*h]);},fillText(){}};
G.mirror(g);globalThis.BladefallPrecisionDeviceViews.find(d=>d.name==='core-checkpoints').draw(ctx,g);
assert.deepEqual(rects[0],[77,85,14,3],'upright checkpoint art stays attached to the authored platform');assert.equal(stack.length,0);
console.log('PASS: inverted geometry cannot claim upright Core saves; death restores earned upright anchor; checkpoint art stays in screen-space position.');
