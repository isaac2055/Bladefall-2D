import assert from 'node:assert/strict';
import {Core,keysToInput} from '../pcore-tape.mjs';
import '../../public/bladefall-workshop-ascend-coop-core.js';
function room(clearEcho){const map=Array.from({length:23},()=>'.'.repeat(40));map[20]='..P.....................................';map[21]='#'.repeat(40);return {id:'echo-save',map,echo:true,exit:'right',coreCheckpoints:[{c:12,r:20,width:40,clearEcho}]};}
for(const enabled of [false,true]){
 const g=Core.createGame([room(enabled)]);Core.step(g,keysToInput('q'));const echo=g.echo;assert(echo);Object.assign(g.p,{x:96,y:157,vx:0,vy:0,onGround:true,state:'normal'});Core.step(g,keysToInput(''));
 assert.equal(g.coreRun.index,0);assert.equal(g.echo,enabled?null:echo);assert.equal(g.ents.includes(echo),!enabled);
 if(enabled){Core.step(g,keysToInput('q'));assert(g.echo,'a new echo can be placed after the save');Core.step(g,keysToInput(''));assert(g.echo,'standing at an already-earned save does not repeatedly clear echoes');}
}
const S=globalThis.BladefallWorkshopAscendCoopCore,s=S.create(room(true));S.step(s,[keysToInput('q'),keysToInput('q')]);const echoes=s.g.players.map(p=>p.echo);assert(echoes.every(Boolean));
Object.assign(s.g.players[1],{x:96,y:157,vx:0,vy:0,onGround:true,state:'normal'});S.step(s);assert.equal(s.g.coreRun.index,0);assert(s.g.players.every(p=>p.echo===null));assert(echoes.every(e=>!s.g.ents.includes(e)));
console.log('PASS: opt-in saves clear owned echo entities once, preserve default behavior and permit a fresh echo; shared saves clear both actors consistently.');
