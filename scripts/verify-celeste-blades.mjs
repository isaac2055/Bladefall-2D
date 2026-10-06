import assert from 'node:assert/strict';
// These are explicit isolated collision fixtures. Full-course proofs use only
// recorded controls from the real entrance in verify-celeste.mjs.
export async function verifyBladeMechanics(page,bootstrapStage){
 const results=[];
 for(const [kind,keys,shouldHit]of [
  ['pogo',{down:true,attack:true},true],['pogo',{attack:true},false],
  ['pogo',{up:true,attack:true},false],['pogo',{down:true},false],
  ['uppercut',{up:true,attack:true},true],['uppercut',{attack:true},false],
  ['uppercut',{down:true,attack:true},false]
 ]){
  await page.evaluate(bootstrapStage,41);
  const r=await page.evaluate(({kind,keys})=>{
   const a=G.celeste;a.room=a.rooms.findIndex(r=>r.kind===kind);a.checkpoint=a.rooms[a.room].x+120;BladefallCeleste.retry();
   const o=G.obstacles.find(o=>o.ceRoom===a.room&&o.ceBlade===kind),p=G.p;
   Object.assign(p,{x:o.x,y:kind==='pogo'?o.y+45:0,onGround:kind==='uppercut',vy:0,vx:0,jumps:2,dodgeCdT:.5});
   __BF.tas.stepFrames(1,keys);
   return {spent:o.ceSpent,used:a.used.slice(),vy:p.vy,slamming:p.slamming,jumps:p.jumps,dash:p.dodgeCdT,attack:p.bladeDirection};
  },{kind,keys});
  assert.equal(r.spent,shouldHit,JSON.stringify({kind,keys,r}));
  if(shouldHit){assert.ok(r.vy< -600);assert.equal(r.jumps,1);assert.equal(r.dash,0);assert.equal(r.slamming,false);}
  if(keys.down&&!keys.attack){assert.equal(r.slamming,false);assert.ok(r.vy>0);}
  results.push({kind,keys,pass:true});
 }
 // A brief Down tap is harmless; a sustained airborne hold commits the pound.
 await page.evaluate(bootstrapStage,41);
 const pound=await page.evaluate(()=>{
  const t=__BF.tas,p=G.p;G.celeste.room=G.celeste.rooms.findIndex(r=>r.kind==='anvil');G.celeste.checkpoint=G.celeste.rooms[G.celeste.room].x+120;BladefallCeleste.retry();
  Object.assign(p,{y:150,vy:0,onGround:false});
  t.stepFrames(5,{down:true});const tap=p.slamming;
  t.stepFrames(1,{});const released=G.celeste.slamHold;
  t.stepFrames(11,{down:true});return {tap,released,held:p.slamming,vy:p.vy};
 });
 assert.equal(pound.tap,false);assert.equal(pound.released,0);assert.equal(pound.held,true);assert.ok(pound.vy>500);
 results.push({kind:'hold-to-pound, tap and release rejection',pass:true});
 // All five counterweights grant travel velocity briefly after arrival, then expire.
 // Start at each checkpoint, then only controls ride, wait, and jump.
 for(const [stage,room]of [[41,3],[41,11],[41,14],[42,1],[42,4]]){
  await page.evaluate(bootstrapStage,stage);
  const lift=await page.evaluate(room=>{
   const a=G.celeste;a.room=room;a.checkpoint=a.rooms[room].x+120;BladefallCeleste.retry();
   const t=__BF.tas,p=G.p,o=G.obstacles.find(o=>o.ceRoom===room&&o.ceWeight);
   while(p.x<a.rooms[room].x+265)t.stepFrames(1,{right:true});
   t.stepFrames(1,{attack:true});while(o.ceT<1)t.stepFrames(1,{});t.saveState('lift-arrival');t.stepFrames(4,{});
   const top=o.ceT===1&&p.floorPlat===o&&p.onGround;
   const unearned=a.used.includes(o.ceMark),gate=G.obstacles.find(o=>o.ceRoom===room&&o.ceGate).gone;
   t.stepFrames(1,{right:true,jump:true});
   const boost={vx:p.vx,vy:p.vy,spent:o.ceLaunchSpent,earned:a.used.includes(o.ceMark)};
   t.restoreState('lift-arrival');t.stepFrames(40,{});t.stepFrames(1,{right:true,jump:true});
   const expired={vy:G.p.vy,earned:G.celeste.used.includes(o.ceMark)};
   t.stepFrames(1,{checkpoint:true});const resetObject=G.obstacles.find(z=>z.ceMark===o.ceMark&&z.ceWeight);
   return {top,unearned,gate:!!gate,boost,expired,reset:!resetObject.ceLaunchSpent&&resetObject.ceT===0};
  },room);
  assert.equal(lift.top,true);assert.equal(lift.unearned,false);assert.equal(lift.gate,false);
  assert.ok(lift.boost.vx>140);assert.ok(lift.boost.vy< -590);assert.equal(lift.boost.earned,true);assert.equal(lift.boost.spent,true);assert.equal(lift.reset,true);
  assert.equal(lift.expired.earned,false);assert.ok(lift.expired.vy> -500);
  results.push({kind:'brief endpoint momentum',stage,room,pass:true});
 }
 // A miss grants nothing, and a spent target cannot be farmed for extra height.
 await page.evaluate(bootstrapStage,41);
 const reset=await page.evaluate(()=>{
  const t=__BF.tas,a=G.celeste;a.room=a.rooms.findIndex(r=>r.kind==='pogo');a.checkpoint=a.rooms[a.room].x+120;BladefallCeleste.retry();
  let o=G.obstacles.find(o=>o.ceRoom===a.room&&o.ceBlade==='pogo');
  Object.assign(G.p,{x:o.x+90,y:o.y+45,onGround:false,vy:0,jumps:2,dodgeCdT:.5});
  t.stepFrames(1,{down:true,attack:true});const miss={vy:G.p.vy,jumps:G.p.jumps,spent:o.ceSpent,dash:G.p.dodgeCdT};
  t.stepFrames(1,{checkpoint:true});t.stepFrames(1,{});
  Object.assign(G.p,{x:o.x,y:o.y+45,onGround:false,vy:0,jumps:2,dodgeCdT:.5});
  t.stepFrames(1,{down:true,attack:true});
  const saved=t.saveState('blade-hit');t.stepFrames(20,{right:true});const branch=t.saveState('blade-branch');
  t.restoreState('blade-hit');const restored=t.saveState('blade-restored')===saved;
  t.stepFrames(20,{right:true});const identical=t.saveState('blade-replayed')===branch;
  o=G.obstacles.find(o=>o.ceRoom===a.room&&o.ceBlade==='pogo');
  Object.assign(G.p,{x:o.x,y:o.y+45,onGround:false,vy:0});
  t.stepFrames(1,{down:true,attack:true});const repeat={vy:G.p.vy,used:G.celeste.used.length};
  const blood=G.p.blood;t.stepFrames(1,{checkpoint:true});
  return {miss,restored,identical,repeat,retry:{spent:o.ceSpent,used:G.celeste.used.length,flight:G.celeste.flight,pogo:G.p.pogoSwing,up:G.p.upSlashSwing,atkCd:G.p.atkCd,bloodUnchanged:G.p.blood===blood}};
 });
 assert.equal(reset.miss.spent,false);assert.equal(reset.miss.jumps,2);assert.ok(reset.miss.dash>0);assert.ok(reset.miss.vy>=0);
 assert.equal(reset.restored,true);assert.equal(reset.identical,true);assert.ok(reset.repeat.vy>=0);assert.equal(reset.repeat.used,1);
 assert.deepEqual(reset.retry,{spent:false,used:0,flight:null,pogo:false,up:false,atkCd:0,bloodUnchanged:true});
 results.push({kind:'miss, single use, exact snapshot replay, retry',pass:true});
 // Exercise the original enemy interaction with the actual Pure Nail gift,
 // outside either course, and verify the new upward attack also lofts a body.
 for(const direction of ['down','up']){
  await page.evaluate(bootstrapStage,3);
  const r=await page.evaluate(direction=>{
   grantJourneyGift('pure-nail');applyPureNail(G.p);
   G.enemies=[];const e=spawnEnemy('grunt',G.p.x);e.y=100;e.hp=e.maxHp=1000;e.vy=0;
   Object.assign(G.p,{y:direction==='down'?e.y+e.h+22:e.y-G.p.h-20,vy:0,onGround:false,atkCd:0,dodgeCdT:.5,jumps:2});
   __BF.tas.stepFrames(1,{[direction]:true,attack:true});
   return {gift:hasGift('pure-nail'),enemyHp:e.hp,enemyVy:e.vy,playerVy:G.p.vy,slamming:G.p.slamming,jumps:G.p.jumps,dash:G.p.dodgeCdT};
  },direction);
  assert.equal(r.gift,true);assert.ok(r.enemyHp<1000,JSON.stringify(r));
  if(direction==='down'){assert.equal(r.playerVy,-560);assert.equal(r.slamming,false);assert.equal(r.jumps,1);assert.equal(r.dash,0);}
  else assert.ok(r.enemyVy< -500,JSON.stringify(r));
  results.push({kind:'Pure Nail enemy '+direction,pass:true});
 }
 return results;
}
