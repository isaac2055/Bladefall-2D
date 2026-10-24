// Ride both directions on the five completed-quest shortcuts through their real UI.
import assert from 'node:assert/strict';import {open} from './harness.mjs';
const {page,errors,close}=await open();
try{
 for(const [stage,id]of [[3,'cartographer'],[4,'recruit'],[9,'quota'],[11,'neighbors'],[16,'sailors']]){
  const out=await page.evaluate((stage,id)=>{const Q=__q,M=BladefallMounts;Q.setup(stage,id);G.p.invuln=999;
   let s=G.sessionSideStories;for(const t of BladefallSideStories.byId[id].tasks)s=BladefallSideStories.reduce(s,id,{type:'task',task:t.id,capabilities:BladefallProgression.abilities.map(a=>a.id)}).state;
   s=BladefallSideStories.reduce(s,id,{type:'choice',choice:'finish'}).state;G.sessionSideStories=BladefallSideStories.reduce(s,id,{type:'claim'}).state;BladefallSideStoryWorld.apply();
   M.setTestMode(true);M.install();const rs=M.roosts(),legs=[];
   if(!rs)return {error:'no roosts'};
   for(const r of rs){let o=G.obstacles.find(o=>o.mountRoost===r.id);if(!o)return {error:'missing '+r.id};
    Q.put(o.x,o.y);M.interact(o);const b=document.querySelector('#fieldConversation button');if(!b)return {error:'no ride action'};b.click();
    const destination=G.mountFlight?.land;let frames=0;while(G.mountFlight&&frames<3600){Q.frames(10);frames+=10;}legs.push({arrived:!!destination&&Math.abs(G.p.x-destination.x)<25,at:M.perch(),frames,dead:!!G.p.dead,mode,kind:M.MOUNTS[stage].kind});
   }
   M.setTestMode(false);return {legs,perch:M.perch(),start:rs[0].id};},stage,id);
  assert.ok(!out.error,id+': '+out.error);assert.equal(out.legs.length,2);assert.ok(out.legs.every(l=>l.arrived&&l.frames>0&&l.frames<3600&&!l.dead&&l.mode==='play'),JSON.stringify(out));assert.equal(out.perch,out.start);console.log('ok',id,JSON.stringify(out.legs));
 }
 assert.deepEqual(errors.filter(e=>!/register/.test(e)),[]);console.log('PASS: five shortcut round trips.');
}finally{await close();}
