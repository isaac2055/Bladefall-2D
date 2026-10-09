// Bounded checks: match ordinary-crystal timing, enforce approach, recharge, reset and mirror.
import assert from 'node:assert/strict';
import '../../public/bladefall-pcore.js';
import '../../public/bladefall-pcore-dev-vector-refill.js';
import '../../public/bladefall-pcore-dev-gravity.js';
const Core=globalThis.BladefallPrecisionCore,VR=globalThis.BladefallPrecisionVectorRefill;
function fixture({dir='down',normal=false,once=false}={}){
 const map=Array.from({length:23},(_,r)=>Array.from({length:40},(_,c)=>r>=22||c===0||c===39?'#':'.'));
 map[5][10]='P';if(normal)map[10][10]='o';
 return {id:'vector-refill-check',name:'Directional refill fixture',map:map.map(r=>r.join('')),...(!normal?{vectorRefills:[{c:10,r:10,dir,once}]}:{})};
}
const gem=g=>g.ents.find(e=>e.type==='refill'||e.type==='vectorRefill');
const eventCount=(g,type)=>g.events.filter(e=>e.type===type).length;
function ticks(g,n,inp={}){for(let i=0;i<n;i++)Core.step(g,inp);}
function prepared(def){const g=Core.createGame([def]);g.p.dashes=0;return g;}
{
 const ordinary=prepared(fixture({normal:true})),directional=prepared(fixture());
 for(let f=0;f<210;f++){
  Core.step(ordinary,{});Core.step(directional,{});
  assert.equal(Core.digest(directional),Core.digest(ordinary),'legal directional approach matches ordinary-crystal motion/timing');
  assert.equal(directional.freeze,ordinary.freeze);assert.equal(directional.p.stamina,ordinary.p.stamina);
  assert.equal(gem(directional).timer,gem(ordinary).timer,'normal recharge duration and freeze pause');
 }
 assert.equal(eventCount(directional,'vector-refill'),1);assert.equal(eventCount(directional,'refill'),1);
 assert.equal(eventCount(directional,'refill-back'),1);assert.equal(gem(directional).timer,0);
}
{
 const g=prepared(fixture({dir:'up'}));ticks(g,30);
 assert.equal(eventCount(g,'vector-refill'),0,'falling through an up crystal is refused');assert.equal(gem(g).timer,0);assert.equal(g.p.dashes,0);
 Object.assign(g.p,{x:80,y:85,vy:-105,vx:0,remX:0,remY:0,onGround:false});Core.step(g,{});
 assert.equal(eventCount(g,'vector-refill'),1,'the same crystal accepts a later rising approach');assert.equal(g.p.dashes,1);
 assert.equal(g.freeze,2);assert.equal(gem(g).timer,Core.K.refillRespawnFrames);
}
{
 for(const [dir,vx,vy]of [['up',0,-70],['down',0,70],['left',-70,0],['right',70,0]]){
  const g=prepared(fixture({dir}));Object.assign(g.p,{x:80,y:80,vx,vy,onGround:false});Core.step(g,{});
  assert.equal(eventCount(g,'vector-refill'),1,dir+' accepts ordinary motion without dashing');
 }
 const up={dx:0,dy:-1};
 assert.equal(VR.accepts(up,{vx:240,vy:0}),false,'perpendicular approach is refused');
 assert.equal(VR.accepts(up,{vx:0,vy:-4}),false,'minimum excludes almost-still motion');
 assert.equal(VR.accepts(up,{vx:120,vy:-5}),true,'diagonal approach uses the marked component');
}
{
 const full=Core.createGame([fixture()]);ticks(full,30);
 assert.equal(eventCount(full,'vector-refill'),0,'a full-resource knight does not waste the crystal');
 const tired=Core.createGame([fixture()]);tired.p.stamina=Core.K.climbTired-1;ticks(tired,25);
 assert.equal(eventCount(tired,'vector-refill'),1,'ordinary tired-stamina rule is retained');assert.equal(tired.p.stamina,Core.K.climbMaxStamina);
 const once=prepared(fixture({once:true}));ticks(once,210);assert.equal(gem(once).spent,true);assert.equal(eventCount(once,'refill-back'),0);
 Core.resetRoom(once);assert.equal(gem(once).spent,false);assert.equal(gem(once).timer,0);
}
{
 const g=prepared(fixture({dir:'up'}));const original={y:gem(g).y,dy:gem(g).dy};
 globalThis.BladefallPrecisionGravity.mirror(g);assert.equal(gem(g).y,184-original.y-8);assert.equal(gem(g).dy,1);
 globalThis.BladefallPrecisionGravity.mirror(g);assert.equal(gem(g).y,original.y);assert.equal(gem(g).dy,original.dy);
 const def=fixture();delete def.vectorRefills;assert.equal(Core.createGame([def]).ents.some(e=>e.type==='vectorRefill'),false,'opt in only');
}
console.log('PASS: exact ordinary-crystal timing/refill/recharge on legal approach; four directions; wrong/perpendicular/still rejection and retry; no dash-state requirement; full/tired resources; once/reset; gravity; opt-in.');
