import assert from 'node:assert/strict';
import {Core} from '../pcore-tape.mjs';
import '../../public/bladefall-workshop-ascend-coop-core.js';
const S=globalThis.BladefallWorkshopAscendCoopCore;
function room(settings={}){const map=Array.from({length:23},()=>Array(40).fill('.'));map[21][2]='P';map[22].fill('#');for(let r=6;r<22;r++){map[r][5]='%';map[r][20]='%';}map[21][15]='!';return {id:'shared-portals',cols:40,rows:23,map:map.map(r=>r.join('')),exit:'right',movement:'survive-2',...settings};}
const fixed=S.create(room({portalMode:'fixed',portals:[{color:'blue',c:5,r:10,face:'l'},{color:'orange',c:20,r:10,face:'r'}]})),g=fixed.g;
Object.assign(g.players[0],{x:40,y:80,onGround:false});Object.assign(g.players[1],{x:40,y:84,onGround:false});
const lamp={id:'shared-lantern',type:'lantern',x:40,y:80,ox:40,oy:80,w:8,h:8,vx:10,vy:0,remX:0,remY:0};g.ents.push(lamp);
S.step(fixed);assert(g.players.every(p=>p.x===168&&p.portalCool===4),'both knights traverse the fixed pair');assert.equal(lamp.x,168);assert.equal(g.events.filter(e=>e.type==='portal-pass'&&e.kind==='lantern').length,1,'shared loose body travels once');assert.deepEqual(g.events.filter(e=>e.type==='portal-pass'&&e.kind==='knight').map(e=>e.player),[0,1]);S.step(fixed);assert(g.players.every(p=>p.portalCool===3),'personal portal cooldowns each tick once');
const aimed=S.create(room({portalMode:'two'}));Object.assign(aimed.g.players[0],{x:80,y:157});Object.assign(aimed.g.players[1],{x:120,y:157});S.step(aimed,[{l:true,portal:true},{r:true,portal:true}]);assert(aimed.g.portals.blue);assert(aimed.g.portals.orange);assert.equal(aimed.g.portalNext,'blue');assert.equal(aimed.g.portalShots,2);assert.equal(aimed.g.portals.blue.c,5);assert.equal(aimed.g.portals.orange.c,20);assert.deepEqual(aimed.g.events.filter(e=>e.type==='portal-open').map(e=>e.player),[0,1]);
Object.assign(aimed.g.players[1],{x:120,y:165,vx:0,vy:0});S.step(aimed);assert.equal(aimed.g.portals.blue,null);assert.equal(aimed.g.portals.orange,null);assert.equal(aimed.g.portalHoles.size,0,'second knight crossing a grille closes the shared placed pair');
// A portal with no partner cannot remove solid terrain or teleport either knight.
const unlinked=S.create(room({portalMode:'one',portals:[]}));Object.assign(unlinked.g.players[1],{x:120,y:157});S.step(unlinked,[{}, {r:true,portal:true}]);assert(unlinked.g.portals.blue);assert.equal(unlinked.g.portalHoles.size,0);assert.equal(Core.tileAt(unlinked.g,20,19),Core.SOLID);
console.log('PASS: shared native fixed/placed portals, both knight traversals and cooldowns, one loose-body transfer, two-player alternating shots, partner grille closure and unlinked solid terrain.');
