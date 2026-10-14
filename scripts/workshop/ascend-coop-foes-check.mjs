import assert from 'node:assert/strict';
import {Core} from '../pcore-tape.mjs';
import '../../public/bladefall-workshop-ascend-coop-core.js';
const S=globalThis.BladefallWorkshopAscendCoopCore,F=globalThis.BladefallPrecisionFoes;
function create(foes=[]){const map=Array.from({length:23},()=>Array(40).fill('.'));map[21][2]='P';map[22].fill('#');const s=S.create({id:'shared-foes',cols:40,rows:23,map:map.map(r=>r.join('')),exit:'right',movement:'survive-2',foes});s.g.awake=true;return s;}
const moving=create([{kind:'moth',x:20,y:10,path:[10,0],period:120}]);S.step(moving);assert.equal(moving.g.fclock,1);assert.equal(moving.g.foes[0].t,1);assert.equal(moving.g.foes[0].x,161);
// A guest alone in the ram's sight must trigger its telegraph.
const ram=create([{kind:'ram',x:10,y:21,dir:1}]);Object.assign(ram.g.players[0],{x:10});Object.assign(ram.g.players[1],{x:120});S.step(ram);assert.equal(ram.g.foes[0].state,'tell');assert.equal(ram.g.foes[0].timer,F.FK.ramTell);
// Either seat can save the other: damage waits until both defenses resolve.
for(const defender of [0,1]){
 const s=create(),g=s.g;g.foes=[];
 for(const p of g.players)Object.assign(p,{x:80,y:100,state:'normal',parryTimer:0});
 g.players[defender].parryTimer=5;
 const bolt={x:81,y:101,w:6,h:6,vx:100,vy:0,alive:true,friendly:false};g.bolts=[bolt];
 for(let i=0;i<2;i++){g.p=g.players[i];g.coopActor=i;F.afterPlayer(g,{});assert(g.players.every(p=>p.state!=='dead'));}
 F.afterPlayers(g);assert(bolt.friendly);assert(g.players.every(p=>p.state!=='dead'));
}
const integrated=create([{kind:'moth',x:30,y:10}]);integrated.g.bolts=[{x:integrated.g.p.x,y:integrated.g.p.y,w:6,h:6,vx:0,vy:0,alive:true,friendly:false}];S.step(integrated,[{}, {parry:true}]);assert(integrated.g.bolts[0].friendly);assert(integrated.g.players.every(p=>p.state!=='dead'));
const lethal=create();lethal.g.foes=[];for(const p of lethal.g.players)Object.assign(p,{x:80,y:100,state:'normal'});lethal.g.bolts=[{x:81,y:101,w:6,h:6,vx:100,vy:0,alive:true,friendly:false}];F.afterPlayers(lethal.g);assert(lethal.g.players.every(p=>p.state==='dead'));assert.deepEqual(lethal.g.events.filter(e=>e.type==='death').map(e=>e.player),[0,1]);
// A recovering solid waits for the guest to leave its body, too.
const shell=create([{kind:'shell',x:10,y:21}]),f=shell.g.foes[0];Object.assign(f,{state:'flip',timer:100,pending:true});Object.assign(shell.g.players[1],{x:f.x,y:f.y,state:'normal'});F.before(shell.g,{});assert(f.pending);assert(!f.proxy.solid);shell.g.players[1].x=140;F.before(shell.g,{});assert(f.proxy.solid);
// Solo damage still resolves in the original after hook.
const solo=Core.createGame([moving.g.room.def]);solo.awake=true;solo.foes=[];solo.bolts=[{x:solo.p.x,y:solo.p.y,w:6,h:6,alive:true,friendly:false}];F.after(solo,{});assert.equal(solo.p.state,'dead');
console.log('PASS: shared foe clock, guest ram detection, either-seat partner parry, attributed damage, guest-safe solid recovery and unchanged solo damage order.');
