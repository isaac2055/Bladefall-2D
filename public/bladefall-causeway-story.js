/* Silas's governor belongs to the maintenance works, with the residents' authored bodies retained. */
(function(root){
'use strict';
// (7.375) Silas's steps moved to bladefall-quest-errands.js; this file keeps only his layout.
const taken=()=>!!root.BladefallQuestErrands;
const active=()=>!taken()&&typeof G!=='undefined'&&G?.stageIndex===2&&G.sideStoryScene?.id==='defector';
function layout(q){return q.id==='defector'?{x:10730,y:130,dir:1}:null;}
function install(q,scene){
 if(q.id!=='defector'||taken())return;
 G.obstacles=G.obstacles.filter(o=>o.sideStory!=='defector'||!['step','task','scene'].includes(o.sideStoryRole));
 const add=o=>G.obstacles.push({sideStory:'defector',...o});
 for(const [i,t]of q.tasks.entries()){
  const pos=[[10790,130],[11240,235],[10820,130]][i];
  add({type:'sideStoryProp',sideStoryRole:'task',task:t.id,index:i,x:pos[0],y:pos[1],w:42,h:50,title:t.label,accent:q.accent});
 }
 add({type:'wall',sideStoryRole:'patrolFence',x:10843,y:175,w:46,h:45,noCling:true});
 // Draw the workshop behind Silas, never over his newly authored body.
 G.obstacles.unshift({sideStory:'defector',type:'sideStoryProp',sideStoryRole:'scene',x:10730,y:130,w:160,h:90});
 // 7.233: no pancaked duplicates. The level's own 11240/195 archery step already stands where
 // his second step was, and his walk extends the court row at 130 instead of lying on top of it.
 const court=G.obstacles.find(o=>o.zoneEntityId==='court-causeway-approach-0');
 if(court){const l=court.x-court.w/2,r=10910;court.x=(l+r)/2;court.w=r-l;}
 else add({type:'plat',sideStoryRole:'step',x:10780,y:130,w:260,h:14});
 G.obstacles.push({type:'plat',earlyPlatform:true,earlyCarrier:true,earlyQuest:'defector',earlyId:'silas-lift',x:10880,y:130,homeX:10880,homeY:130,toX:11080,toY:205,w:120,h:14,duration:1.1});
 scene.escort={destination:10865,y:130,finished:BladefallSideStories.row(BladefallSideStoryWorld.state(),'defector').phase==='completed'};
 scene.performance={phase:'offered',step:0,t:20,clock:0};
 const reward=G.obstacles.find(o=>o.sideStory==='defector'&&o.sideStoryRole==='reward');if(reward){reward.x=10885;reward.y=130;}
 const actor=G.obstacles.find(o=>o.sideStory==='defector'&&o.sideStoryRole==='actor');if(actor)actor.baseX=actor.x=10730;
}
function requirement(o,r){
 if(o.sideStory!=='defector'||taken())return null;
 if(o.task==='brake'&&Math.abs(G.p.x-o.x)>85)return 'The maintenance brake is beside the patrol walk. Use its handle beside the lift.';
 if(o.task==='gate'&&r.step<2)return 'Stop the governor above the maintenance lift first.';
 return null;
}
function update(dt){
 if(!active())return;
 const scene=G.sideStoryScene,r=BladefallSideStories.row(BladefallSideStoryWorld.state(),'defector'),a=scene.performance;
 if(!a)return;a.clock+=dt;a.t+=dt;if(a.phase!==r.phase||a.step!==r.step){a.phase=r.phase;a.step=r.step;a.t=0;}
 const fence=G.obstacles.find(o=>o.sideStoryRole==='patrolFence');if(fence)fence.gone=r.step>=3;
 const n=G.obstacles.find(o=>o.sideStory==='defector'&&o.sideStoryRole==='actor');
 if(n){n.openingWalking=r.phase==='completed'&&!scene.escort.finished;n.governorStopped=r.step>=2||['completed','harsh'].includes(r.phase);}
}
function draw(c,o,q,r,scene){
 if(taken()||q.id!=='defector'||['actor','reward'].includes(o.sideStoryRole)||o.type==='plat')return false;
 const x=o.x,y=GROUND_Y-o.y,t=scene.performance?.clock||0;
 c.save();c.translate(x,y);
 if(o.sideStoryRole==='scene'){
  c.fillStyle='#33352f';c.fillRect(-72,-56,142,56);c.fillStyle='#73684a';c.fillRect(-70,-58,140,4);
  c.fillStyle='#9a865b';c.fillRect(114,-22,54,6);c.fillRect(118,-16,5,16);c.fillRect(160,-16,5,16);
  c.strokeStyle='#78694a';c.lineWidth=3;c.beginPath();c.moveTo(0,-6);c.lineTo(90,-6);c.stroke();
 }else if(o.task==='brake'){
  c.fillStyle='#777968';c.fillRect(-18,-18,36,18);c.save();c.translate(0,-19);c.rotate(r.step>0?.65:-.6);c.fillStyle='#d9bd79';c.fillRect(-3,-26,6,28);c.restore();
 }else if(o.task==='gear'){
  const stop=r.step>=2,angle=stop?0:t*2;c.save();c.translate(0,-8);c.rotate(angle);
  c.fillStyle=stop?'#665d4b':'#d0a85f';for(let i=0;i<8;i++){c.rotate(Math.PI/4);c.fillRect(-5,-28,10,18);}
  c.beginPath();c.arc(0,0,20,0,Math.PI*2);c.fill();c.fillStyle='#292c2d';c.fillRect(-5,-5,10,10);c.restore();
  c.strokeStyle='#655d48';c.lineWidth=4;c.beginPath();c.moveTo(0,20);c.lineTo(0,125);c.lineTo(-510,125);c.stroke();
  if(stop){c.fillStyle='#d0a85f';c.fillRect(-28,31,9,6);c.fillRect(22,36,12,5);}
  // The one word it takes (owner 7.234): holding the bow at the gear, say which key brings the sword.
  if(r.phase==='active'&&r.step===1&&G.p.weapon?.arche==='bow'&&Math.abs(G.p.x-x)<320){
   c.font='bold 12px system-ui';c.textAlign='center';const label=keyLabel(kbCode('swap'))+' · sword';
   c.fillStyle='#0d0f0ecc';c.fillRect(-34,-62,68,18);c.fillStyle='#ece0bc';c.fillText(label,0,-49);
  }
 }else if(o.task==='gate'){
  const f=r.step>=3?Math.min(1,(scene.performance?.t||0)/1.2):0;
  c.fillStyle='#a38a5b';c.fillRect(-2,-55,4,55);c.save();c.translate(0,-45);c.rotate(-f*Math.PI/2);c.fillStyle='#766f61';c.fillRect(0,0,46,5);for(let i=8;i<46;i+=13)c.fillRect(i,0,3,40*(1-f));c.restore();
 }
 if(o.sideStoryRole==='task'&&r.phase==='active'&&o.index===r.step&&Math.abs(G.p.x-x)<130&&Math.abs(G.p.y-o.y)<110){c.font='13px system-ui';c.textAlign='center';c.fillStyle='#f2dfb7';c.fillText(o.task==='gear'?'STRIKE THE GOVERNOR':o.title,0,-72);}
 c.restore();return true;
}
root.BladefallCausewayStory=Object.freeze({layout,install,requirement,update,draw});
})(globalThis);
