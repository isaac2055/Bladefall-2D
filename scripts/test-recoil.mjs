// Focused entity contract; authored room tapes separately prove normal-spawn routes.
import assert from 'node:assert/strict';
import{Core,keysToInput}from'./pcore-tape.mjs';
const R=globalThis.BladefallPrecisionRecoil;
function room(extra={}){const m=Array.from({length:23},()=>Array(40).fill('.'));m[22].fill('#');m[14][12]='P';return{id:'recoil-contract',map:m.map(r=>r.join('')),recoilPlatforms:[{id:'A',c:10,r:15,w:6}],...extra};}
const tick=(g,k,n=1)=>{for(let i=0;i<n;i++)Core.step(g,keysToInput(k));};
let g=Core.createGame([room()]),e=R.platforms(g)[0];tick(g,'',40);assert.equal(e.charge,0,'standing alone does not cause an automatic spring');
tick(g,'d',30);assert.equal(e.charge,24);assert.equal(g.p.y+g.p.h,e.y);tick(g,'d',40);assert.equal(e.charge,24,'full load holds until chosen release');
tick(g,'',8);assert.equal(e.state,'release');tick(g,'j');assert(g.p.vy<=-220);assert(g.events.some(x=>x.type==='recoil-jump'));assert(g.p.liftY>=Core.K.liftYCap);
let shallow=Core.createGame([room()]);tick(shallow,'d',8);tick(shallow,'');const speed=R.platforms(shallow)[0].releaseV;assert(speed>50&&speed<80,'partial compression stores a lower return speed');tick(shallow,'j');assert(shallow.p.vy>-190&&shallow.p.vy<-150);
// Removing loose cargo releases the support; ordinary cargo motion is provided by Core.moveSolid.
g=Core.createGame([room()]);e=R.platforms(g)[0];const lan={type:'lantern',id:'contract-lantern',x:112,y:112,w:8,h:8,vx:0,vy:0,remX:0,remY:0,held:false};g.ents.push(lan);tick(g,'',30);assert.equal(e.charge,24);assert.equal(lan.y+8,e.y);g.p.x=104;g.p.y=e.y-11;g.p.vy=0;tick(g,'g');assert.equal(g.p.carrying,lan);tick(g,'',3);assert.equal(e.state,'release');
// A grounded living actor is another real weight; removing it releases without a new player verb.
g=Core.createGame([room({combat:{enemies:[{kind:'guard',x:112,y:104,delay:999}]}})]);e=R.platforms(g)[0];tick(g,'',30);assert.equal(e.charge,24);g.combat.enemies[0].dead=true;tick(g,'');assert.equal(e.state,'release');
// Mirroring preserves the world-space mechanism rather than teleporting its private travel endpoint.
g=Core.createGame([room()]);tick(g,'d',15);e=R.platforms(g)[0];const before=[e.y,e.oy,e.charge];globalThis.BladefallPrecisionGravity.mirror(g);assert.equal(e.axis,-1);assert.equal(e.y,184-before[0]-8);globalThis.BladefallPrecisionGravity.mirror(g);assert.deepEqual([e.y,e.oy,e.charge],before);Core.resetRoom(g);e=R.platforms(g)[0];assert.equal(e.charge,0);assert.equal(e.y,120);assert.equal(e.axis,1);
// The last physical step has the same velocity as the rest of a partial recoil.
const smooth=Core.createGame([room()]);tick(smooth,'d',15);tick(smooth,'');const lift=smooth.p.liftY;while(R.platforms(smooth)[0].state==='release')tick(smooth,'');assert(Math.abs(smooth.p.liftY-lift)<1e-8,'final remainder does not flatten stored lift');
assert.equal(R.platforms(Core.createGame([room({recoilPlatforms:[]})])).length,0);
console.log('recoil: manual hold/release, partial energy, ordinary lift, cargo weight/pickup, Combat weight, mirrored state, reset and opt-in passed');
