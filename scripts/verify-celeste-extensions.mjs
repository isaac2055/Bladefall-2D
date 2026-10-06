import assert from 'node:assert/strict';
// Counterfactual trials below are explicitly isolated fixtures, not course-clear proofs.
export async function verifyCourseExtensions(page,bootstrapStage,routes){
 const report={layouts:[],coldLifts:[],missingRefills:[],rings:[]};
 for(const stage of [41,42]){
  await page.evaluate(bootstrapStage,stage);
  const layout=await page.evaluate(()=>{
   const a=G.celeste;
   return {stage:a.stage,length:G.levelLength,rooms:a.rooms.map(r=>{
    const objects=G.obstacles.filter(o=>o.ceRoom===r.i);
    return {kind:r.kind,width:r.width,flight:objects.filter(o=>o.type==='ceGale').map(o=>({refill:!!o.ceRefill,id:o.ceMark})),
     timed:objects.filter(o=>o.type==='ceHazard'&&o.period).length,rings:objects.filter(o=>o.type==='actRing').length,
     bladeLabels:objects.filter(o=>o.ceTeach).map(o=>o.ceBlade)};
   })};
  });
  const labels=layout.rooms.flatMap(r=>r.bladeLabels).sort();assert.deepEqual(labels,['pogo','uppercut']);
  for(const r of layout.rooms){
   if(r.flight.length){assert.ok(r.width>=4400);assert.equal(r.flight.length,2);assert.equal(r.flight.filter(f=>f.refill).length,1);}
   if(r.timed)assert.ok(r.rings>0,JSON.stringify(r));
   if(['gale-tear','pogo-tear','tear'].includes(r.kind))assert.equal(r.timed,0);
  }
  report.layouts.push(layout);
 }
 for(const [stage,room]of [[41,3],[41,11],[41,14],[42,1],[42,4]]){
  await page.evaluate(bootstrapStage,stage);
  const range=await page.evaluate(room=>{
   const a=G.celeste,t=__BF.tas;a.room=room;a.checkpoint=a.rooms[room].x+120;BladefallCeleste.retry();
   const r=a.rooms[room],lift=G.obstacles.find(o=>o.ceRoom===room&&o.ceWeight);
   const target=G.obstacles.find(o=>o.ceRoom===room&&o.type==='plat'&&!o.deep&&!o.ceWeight&&o.x>lift.ceToX+500);
   while(G.p.x<r.x+265)t.stepFrames(1,{right:true});t.stepFrames(1,{attack:true});t.stepFrames(160,{});
   // Give the unboosted attempt the most favourable edge takeoff and running speed.
   Object.assign(G.p,{x:lift.x+lift.w/2-1,vx:212,vy:0,onGround:true,floorPlat:lift});
   t.saveState('cold-lift');let farthest=G.p.x,highReach=G.p.x,attempts=0,reached=false;
   for(const air of [12,24,36,48,60,72])for(const dash of [-1,0,10,20,30,40,50,60]){
    t.restoreState('cold-lift');const retries=G.celeste.deaths;attempts++;
    for(let i=0;i<150;i++){
     t.stepFrames(1,{right:true,jump:i<8||(i>=air&&i<air+18),dodge:dash>=0&&(i===dash||i===dash+46||i===dash+92)});
     if(G.celeste.deaths!==retries)break;
     farthest=Math.max(farthest,G.p.x);
     if(G.p.y>=target.y)highReach=Math.max(highReach,G.p.x+G.p.w/2);
     if(G.p.floorPlat&&G.p.floorPlat.x===target.x){reached=true;break;}
    }
   }
   return {stage:G.stageIndex,room,attempts,reached,targetEdge:target.x-target.w/2-r.x,farthest:farthest-r.x,highReach:highReach-r.x,gap:target.x-target.w/2-(lift.x+lift.w/2)};
  },room);
  report.coldLifts.push(range);
 }
 console.log('Unboosted lift trials:',JSON.stringify(report.coldLifts));
 for(const range of report.coldLifts){assert.ok(range.gap>1000,JSON.stringify(range));assert.equal(range.reached,false,JSON.stringify(range));assert.ok(range.highReach<range.targetEdge,JSON.stringify(range));}
 // Replay up to each flight room from the real entrance, save its exact entry,
 // then consume only the refill in a separate counterfactual branch. Failure must
 // occur before the exit shutter, rather than merely finding that shutter locked.
 for(const route of routes)for(const target of route.rooms.filter(r=>['gale','gale-tear','portal-gale'].includes(r.kind))){
  await page.evaluate(bootstrapStage,route.stage);
  const result=await page.evaluate(({rooms,target})=>{
   const t=__BF.tas;for(const room of rooms){if(room.room===target.room)break;for(const k of room.tape)t.stepFrames(1,k);}
   const a=G.celeste,r=a.rooms[a.room],start=a.deaths;
   const refill=G.obstacles.find(o=>o.ceRoom===a.room&&o.ceRefill);refill.ceSpent=true;
   let lostAt=null;
   for(const k of target.tape){const x=G.p.x-r.x;t.stepFrames(1,k);if(a.deaths!==start){lostAt=x;break;}}
   return {stage:a.stage,room:r.i,kind:r.kind,lostAt,exit:r.width-160,land:r.width-320};
  },{rooms:route.rooms,target});
  assert.notEqual(result.lostAt,null,JSON.stringify(result));assert.ok(result.lostAt<result.land-100,JSON.stringify(result));report.missingRefills.push(result);
 }
 for(const release of ['jump','down']){
  await page.evaluate(bootstrapStage,41);
  const ring=await page.evaluate(release=>{
   const a=G.celeste,t=__BF.tas;a.room=a.rooms.findIndex(r=>r.kind==='ring');a.checkpoint=a.rooms[a.room].x+120;BladefallCeleste.retry();
   while(G.p.x<a.rooms[a.room].x+230)t.stepFrames(1,{right:true});t.stepFrames(1,{hook:true});
   for(let i=0;i<90&&G.p.actHook?.state!=='hang';i++)t.stepFrames(1,{});
   const caught=G.p.actHook?.ring.ceGravity;
   t.stepFrames(300,{});const waits=G.p.actHook?.state==='hang'&&!G.gravityFlipped;
   t.stepFrames(1,{[release]:true});const inverted=G.gravityFlipped&&G.flipUnlocked&&a.gravityLeaseT>2.9&&!G.p.actHook;
   t.stepFrames(1,{flip:true});const corrected=!G.gravityFlipped;
   t.stepFrames(1,{hook:true});for(let i=0;i<90&&G.p.actHook?.state!=='hang';i++)t.stepFrames(1,{});
   t.stepFrames(210,{});const expired=a.gravityLeaseT===0&&!G.flipUnlocked&&!G.gravityFlipped;
   t.stepFrames(1,{checkpoint:true});const reset=a.gravityLeaseT===0&&!a.leaseActive&&!G.gravityFlipped;
   return {caught,waits,inverted,corrected,expired,reset};
  },release);
  for(const [k,v]of Object.entries(ring))assert.equal(v,true,release+': '+k);report.rings.push({release,...ring});
 }
 // Gold rings remain safe waiting points in front of timed gates.
 await page.evaluate(bootstrapStage,42);
 const waiting=await page.evaluate(tape=>{
  const t=__BF.tas;for(const keys of tape){t.stepFrames(1,keys);if(G.p.actHook?.state==='hang')break;}
  const a=G.celeste,start=a.deaths,id=G.p.actHook?.ring.ceMark,gold=G.p.actHook?.ring.ceTension;
  t.stepFrames(360,{});return {gold,held:G.p.actHook?.ring.ceMark===id,deaths:a.deaths-start,flipped:G.gravityFlipped};
 },routes.find(r=>r.stage===42).rooms[0].tape);
 assert.deepEqual(waiting,{gold:true,held:true,deaths:0,flipped:false});report.rings.push({goldWait:waiting});
 return report;
}
