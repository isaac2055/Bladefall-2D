import assert from 'node:assert/strict';
import {Core} from '../pcore-tape.mjs';
import '../../public/bladefall-workshop-ascend-coop-core.js';
const S=globalThis.BladefallWorkshopAscendCoopCore,C=globalThis.BladefallPrecisionCombat;
function create(enemies=[]){const map=Array.from({length:23},()=>Array(40).fill('.'));map[21][2]='P';map[22].fill('#');const s=S.create({id:'shared-combat',cols:40,rows:23,map:map.map(r=>r.join('')),exit:'right',movement:'survive-2',combat:{enemies}});s.g.awake=true;s.g.combat.awake=true;return s;}
const target=create([{kind:'guard',x:100,y:160}]);Object.assign(target.g.players[0],{x:10});Object.assign(target.g.players[1],{x:120});target.g.combat.enemies[0].cooldown=0;S.step(target);assert.equal(target.g.combat.enemies[0].state,'tell');assert.equal(target.g.combat.enemies[0].face,1);assert.equal(target.g.combat.enemies[0].t,C.K.guardTell);
for(const defender of [0,1]){
 const s=create([{kind:'guard',x:70,y:100,face:1}]),g=s.g,e=g.combat.enemies[0];Object.assign(e,{state:'attack',t:8});for(const p of g.players)Object.assign(p,{x:85,y:100,state:'normal',parryTimer:0});g.players[defender].parryTimer=5;C.afterPlayers(g);assert(g.players.every(p=>p.state!=='dead'));assert.equal(e.state,'recover');assert.equal(g.combat.parries,1);assert.equal(g.p,g.players[0]);
}
function bolt(g,x=81,y=101){const b={id:1,x,y,w:4,h:4,vx:86,vy:0,remX:0,remY:0,life:300,reflected:false};g.combat.shots.push(b);return b;}
for(const defender of [0,1]){
 const {g}=create();for(const p of g.players)Object.assign(p,{x:80,y:100,state:'normal',parryTimer:0});g.players[defender].parryTimer=5;const b=bolt(g);C.afterPlayers(g);assert(b.reflected);assert.equal(b.life,299);assert(g.players.every(p=>p.state!=='dead'));assert.equal(g.combat.parries,1);
}
const integrated=create();const protectedBolt=bolt(integrated.g,integrated.g.players[0].x+1,integrated.g.players[0].y+1);S.step(integrated,[{}, {parry:true}]);assert(protectedBolt.reflected,'guest input reaches shared projectile defense through the native frame');assert(integrated.g.players.every(p=>p.state!=='dead'));
const moving=create();const b=bolt(moving.g,180,100);S.step(moving);assert.equal(b.life,299);assert.equal(b.x,181,'projectile advances only once');
const damage=create([{kind:'guard',x:70,y:100,face:1}]);damage.g.combat.enemies[0].state='attack';for(const p of damage.g.players)Object.assign(p,{x:85,y:100,state:'normal'});C.afterPlayers(damage.g);assert(damage.g.players.every(p=>p.state==='dead'));assert.deepEqual(damage.g.events.filter(e=>e.type==='death').map(e=>e.player),[0,1]);
// Guest blade uses the guest's strike box and hit history.
const guest=create([{kind:'guard',x:95,y:100,face:1}]);Object.assign(guest.g.players[1],{x:85,y:100,strikeTimer:5,strikeDir:{x:1,y:0},strikeHit:new Set()});const hp=guest.g.combat.enemies[0].hp;C.afterPlayers(guest.g);assert(guest.g.combat.enemies[0].hp<hp);assert(guest.g.players[1].strikeHit.has('enemy:0'));assert.equal(guest.g.players[0].strikeHit.size,0);
console.log('PASS: shared combat guest targeting and blade, either-seat melee/projectile defense, attributed damage, once-per-frame shots and host binding restoration.');
