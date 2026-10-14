import assert from 'node:assert/strict';
import {Core} from '../pcore-tape.mjs';
import '../../public/bladefall-workshop-ascend-coop-core.js';
const S=globalThis.BladefallWorkshopAscendCoopCore;
function create(track='-',sw=false){const map=Array.from({length:23},()=>Array(40).fill('.'));map[21][2]='P';map[22].fill(track);for(let c=10;c<14;c++)map[21][c]='C';if(sw)map[21][14]='k';const s=S.create({id:'shared-rail',cols:40,rows:23,map:map.map(r=>r.join('')),exit:'right',movement:'survive-2'});Object.assign(s.g.players[0],{x:82,y:157,dashes:0});Object.assign(s.g.players[1],{x:98,y:157,dashes:0});return s;}
const cart=s=>s.g.ents.find(e=>e.type==='cart');
const guest=create();for(let f=0;f<30;f++)S.step(guest,[{}, {r:true}]);assert(cart(guest).x>100,'guest steering moves the shared cart');assert(guest.g.players.every(p=>p.y+p.h===cart(guest).y&&p.dashes===0),'both riders stay seated without a dash refill');
const speed=cart(guest).vx;S.step(guest,[{}, {jump:true,r:true}]);assert(guest.g.players[1].vy<0);assert(guest.g.players[1].y+11<cart(guest).y);assert(guest.g.players[1].vx>=speed,'guest keeps cart speed on jumping out');assert.equal(guest.g.players[0].y+11,cart(guest).y);
const together=create(),one=create();S.step(together,[{r:true},{r:true}]);S.step(one,[{r:true},{}]);assert.equal(cart(together).vx,cart(one).vx,'aligned inputs do not double acceleration');const cancel=create();S.step(cancel,[{l:true},{r:true}]);assert.equal(cart(cancel).vx,0,'opposing seated leans cancel');
const noDash=create();for(const p of noDash.g.players)p.dashes=1;S.step(noDash,[{dash:true,r:true},{dash:true,r:true}]);assert(noDash.g.players.every(p=>p.state!=='dash'&&p.dashes===1),'neither rider can start a grounded cart dash');
const boost=create(')');S.step(boost);assert.equal(cart(boost).vx,300);assert.equal(cart(boost).x,85,'boost moves cart only once');assert(boost.g.players.every(p=>p.y+p.h===cart(boost).y));
const switched=create('-',true),switchCart=cart(switched);switchCart.x=81;switchCart.vx=20;for(const p of switched.g.players)p.x++;S.step(switched,[{}, {r:true}]);assert(switchCart.hopped,'guest lean selects the high line');assert(switchCart.vy<0);assert(switched.g.players.every(p=>p.y+p.h===switchCart.y),'switch hop carries both riders');
const lost=create(),lostCart=cart(lost);lostCart.lost=2;lostCart.gone=true;lostCart.solid=false;lostCart.x=200;S.step(lost);assert.equal(lostCart.lost,1);S.step(lost);assert.equal(lostCart.lost,0);assert.equal(lostCart.x,lostCart.ox);assert(!lostCart.gone);
console.log('PASS: shared carts steered by either rider, combined/cancelled lean, independent jump-out, no seated dash/refill exploit, once-per-frame boost/home and two-rider switch hop.');
