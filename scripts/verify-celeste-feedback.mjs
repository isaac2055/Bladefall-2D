import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
export async function verifyCourseFeedback(page,bootstrapStage,folder){
 const results=[];
 for(const direction of ['down','up'])for(const delay of [-1,0,1,3]){
  await page.evaluate(bootstrapStage,41);
  const hit=await page.evaluate(({direction,delay})=>{
   const a=G.celeste,kind=direction==='down'?'pogo':'uppercut';
   a.room=a.rooms.findIndex(r=>r.kind===kind);a.checkpoint=a.rooms[a.room].x+120;BladefallCeleste.retry();
   const o=G.obstacles.find(o=>o.ceRoom===a.room&&o.ceBlade===kind);
   Object.assign(G.p,{x:o.x,y:kind==='pogo'?o.y+45:0,vy:0,vx:0,onGround:kind==='uppercut'});
   if(delay<0)__BF.tas.stepFrames(-delay,{[direction]:true});
   if(delay>0)__BF.tas.stepFrames(delay,{attack:true});
   __BF.tas.stepFrames(1,{attack:true,[direction]:true});
   return {spent:o.ceSpent,vy:G.p.vy,slamming:G.p.slamming};
  },{direction,delay});
  assert.equal(hit.spent,true,JSON.stringify({direction,delay,hit}));assert.ok(hit.vy< -600);assert.equal(hit.slamming,false);
  results.push({kind:'slash chord',direction,attackBeforeDirectionFrames:delay,pass:true});
 }
 await page.evaluate(bootstrapStage,41);
 const pound=await page.evaluate(()=>{
  const a=G.celeste,t=__BF.tas;a.room=a.rooms.findIndex(r=>r.kind==='anvil');a.checkpoint=a.rooms[a.room].x+120;BladefallCeleste.retry();
  Object.assign(G.p,{x:a.rooms[a.room].x+480,y:140,vy:0,vx:0,onGround:false});
  let maxY=0,starts=0,last=false;
  for(let i=0;i<105;i++){t.stepFrames(1,{down:true});maxY=Math.max(maxY,G.p.y);if(G.p.slamming&&!last)starts++;last=G.p.slamming;}
  const held={hits:a.anvilHits,starts,maxY,latched:a.slamLatched};
  t.stepFrames(1,{});t.stepFrames(12,{jump:true});t.stepFrames(30,{down:true});
  return {held,second:a.anvilHits,retries:a.deaths};
 });
 assert.equal(pound.held.hits,1);assert.equal(pound.held.starts,1);assert.ok(pound.held.maxY>300);assert.equal(pound.second,2);
 results.push({kind:'one anvil rebound per Down hold; release rearms',pass:true});
 for(const room of [1,9]){
  await page.evaluate(bootstrapStage,41);
  const burst=await page.evaluate(room=>{
   const a=G.celeste,t=__BF.tas;a.room=room;a.checkpoint=a.rooms[room].x+120;BladefallCeleste.retry();const base=a.rooms[room].x;
   while(G.p.x<base+240)t.stepFrames(1,{right:true});
   t.stepFrames(1,{right:true,dodge:true});
   let entered=false;
   for(let i=0;i<180;i++){
    t.stepFrames(1,{right:true});if(G.p.seamRide)entered=true;
    if(room===1?entered&&!G.p.seamRide:G.p.x>base+900)return {vx:G.p.vx,vy:G.p.vy,ballistic:G.p._ballisticT};
   }
   throw Error('No portal exit');
  },room);
  assert.ok(burst.vx>750,JSON.stringify(burst));assert.ok(burst.vy< -150);assert.ok(burst.ballistic>.5);
  results.push({kind:room===9?'fixed portal burst':'first tear burst',pass:true});
 }
 await page.evaluate(bootstrapStage,41);
 const flight=await page.evaluate(()=>{
  const a=G.celeste,t=__BF.tas;a.room=a.rooms.findIndex(r=>r.kind==='gale');a.checkpoint=a.rooms[a.room].x+120;BladefallCeleste.retry();G.stageBanner=0;a.deaths=0;const base=a.rooms[a.room].x;
  while(G.p.x<base+235)t.stepFrames(1,{right:true});
  for(let i=0;i<35&&!a.flight;i++)t.stepFrames(1,{right:true,jump:true});
  if(!a.flight)throw Error('No aether pickup');
  const directions=[];let largestTurn=0,last=Math.atan2(a.flight.vy,a.flight.vx),png;
  for(const key of ['up','left','down','right']){
   for(let i=0;i<30;i++){
    t.stepFrames(1,{[key]:true});if(!a.flight)throw Error('Flight ended early');
    const angle=Math.atan2(a.flight.vy,a.flight.vx);largestTurn=Math.max(largestTurn,Math.abs(Math.atan2(Math.sin(angle-last),Math.cos(angle-last))));last=angle;
   }
   directions.push({key,vx:a.flight.vx,vy:a.flight.vy,slam:G.p.slamming});
   if(key==='up'){recalcVP();render();png=mainCanvas.toDataURL('image/png').split(',')[1];}
  }
  t.stepFrames(1,{dodge:true,right:true});
  return {directions,largestTurn,returned:!a.flight,png};
 });
 for(const d of flight.directions){assert.equal(d.slam,false);assert.ok(d.key==='up'?d.vy>250:d.key==='down'?d.vy< -250:d.key==='left'?d.vx< -250:d.vx>250,JSON.stringify(d));}
 assert.ok(flight.largestTurn<=.101);assert.equal(flight.returned,true);
 await writeFile(folder+'/aether-form.png',Buffer.from(flight.png,'base64'));
 results.push({kind:'four-direction curved flight, bounded turn, dash exit',pass:true});
 return results;
}
