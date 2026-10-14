import assert from 'node:assert/strict';
import {Core} from '../pcore-tape.mjs';
import '../../public/bladefall-workshop-ascend-coop-core.js';
const S=globalThis.BladefallWorkshopAscendCoopCore,G=globalThis.BladefallPrecisionGravity;
function room(cols=40,rows=23){const map=Array.from({length:rows},()=>Array(cols).fill('.'));map[rows-2][2]='P';map[rows-1].fill('#');map[12][10]='Q';return {id:'shared-inversion',cols,rows,map:map.map(r=>r.join('')),exit:'right',movement:'survive-2'};}
const large=S.create(room(24,30)),g=large.g,original=g.room;g.players[1].y=80;g.players[0].vy=30;g.players[1].vy=-20;
const ys=g.players.map(p=>p.y);G.mirror(g);assert(g.flipped);assert.deepEqual(g.players.map(p=>p.y),ys.map(y=>240-y-11));assert.deepEqual(g.players.map(p=>p.vy),[-30,20]);assert.equal(Core.tileAt(g,0,0),Core.SOLID);assert.equal(Core.tileAt(g,0,29),Core.EMPTY);assert.equal(g.ents.find(e=>e.type==='prism').y,136);G.mirror(g);assert.equal(g.room,original);assert.deepEqual(g.players.map(p=>p.y),ys);
function dash(p,x,y){Object.assign(p,{x,y,state:'dash',dashAim:false,dashTimer:6,dashDir:{x:1,y:0},vx:240,vy:0,onGround:false});}
const moving=S.create({...room(),decks:[{c:5,r:10,w:3,to:[0,-4],period:120}]});const deck=moving.g.ents.find(e=>e.type==='deck');G.mirror(moving.g);assert.equal(deck.dy,32,'vertical deck travel mirrors with the room');G.mirror(moving.g);assert.equal(deck.dy,-32);
const partner=S.create(room());dash(partner.g.players[1],80,96);S.step(partner);assert(partner.g.flipped);assert(partner.g.events.some(e=>e.type==='gravity'&&e.player===1),'second knight flips the shared room');
const both=S.create(room());for(const p of both.g.players)dash(p,80,96);S.step(both);assert(both.g.flipped);assert.equal(both.g.events.filter(e=>e.type==='gravity').length,1,'two knights in the same prism do not immediately flip it back');
const prism=both.g.ents.find(e=>e.type==='prism');for(const p of both.g.players)Object.assign(p,{x:16,state:'normal',vx:0,vy:0});S.step(both);assert(prism.armed);dash(both.g.players[1],prism.x,prism.y);S.step(both);assert(!both.g.flipped,'prism rearms after both players leave');
Core.kill(partner.g,partner.g.players[1],'test');for(let f=0;f<100&&!partner.epoch;f++)S.step(partner);assert.equal(partner.epoch,1);assert(!partner.g.flipped);assert(!partner.g.room.mirrored);assert(partner.g.players.every(p=>p.y===partner.g.room.spawn.y),'joint retry restores both upright spawns');
const invalid=room();invalid.map[10]='w'+invalid.map[10].slice(1);assert.throws(()=>S.create(invalid),/gravity prisms with water/);
console.log('PASS: shared prism flips both knights, one activation per occupied pass, partner-triggered rearm, joint upright retry, custom room dimensions and native water incompatibility guard.');
