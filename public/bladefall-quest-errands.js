/* Explore side stories that send you somewhere and have you do something (7.375, Isaac: "go press up on these
   three places, and that's it ... they are right next to the quest giver"). Three stories so far, each step a
   different thing to do, out in the region rather than on a staircase beside the giver:
     Elsie (Black Woods): follow the lantern moths east until they tire; carry the lantern home without taking a
       hit; split Hale's fallen log with your new blade.
     Silas (Causeway): strike the governor's bright tooth as it comes round; walk him to the sunlight (he moves
       only while you move, and the old patrol arms still swing); hang his winding key on the toll tower.
     The Archivist (Ruined Keep), any order: break into the bricked-up reading room; climb the outer wall to the
       steward's account; gather the bell-ringer's pages off the belfry ledges before the wind takes them back.
   Steps finish by doing them (BladefallSideStoryWorld.completeTask), never by Up at a marker. The giver's
   conversation, the journal and the shortcut ride (bladefall-explore-mounts.js) are unchanged. */
(function(root){
'use strict';
const W=()=>root.BladefallSideStoryWorld,S=()=>root.BladefallSideStories;
const STORIES={
 refuge:{stage:1,steps:{
  moths:{kind:'chase',perches:[[1250,0],[2000,0],[2750,0],[3020,70],[3640,40],[4340,0],[5320,0]]},
  lantern:{kind:'carry',home:[5320,0],to:[820,0],item:'lantern'},
  log:{kind:'chop',at:[2290,0],hits:3,needs:'weapon',by:'Hale'}}},
 defector:{stage:2,steps:{
  gear:{kind:'tooth',at:[11240,235]},
  lead:{kind:'lead',path:[[10730,130],[10600,130],[10480,0],[9480,0]],arms:[10180,9820]},
  key:{kind:'carry',from:'actor',to:[9300,325],item:'key'}}},
 archivist:{stage:5,anyOrder:true,steps:{
  reading:{kind:'chop',at:[3370,360],hits:4,needs:'weapon',reveals:'volume'},
  wall:{kind:'find',at:[15680,900],item:'volume'},
  pages:{kind:'gather',at:[[11920,180],[12020,240],[12220,300],[12420,360],[12630,260]],seconds:22}}},
};
const story=()=>typeof G!=='undefined'&&G?.sideStoryScene&&STORIES[G.sideStoryScene.id]&&STORIES[G.sideStoryScene.id].stage===G.stageIndex?STORIES[G.sideStoryScene.id]:null;
const handles=id=>!!STORIES[id];
const near=(a,x,y,rx,ry)=>Math.abs(a.x-x)<rx&&Math.abs(a.y-y)<ry;
const kept=()=>{try{return meta.sideStoryErrands||(meta.sideStoryErrands={});}catch(e){return {};}};
function caps(){return ['weapon','wall-jump'].filter(id=>typeof hasCapability==='function'&&hasCapability(id));}
function row(){return S().row(W().state(),G.sideStoryScene.id);}
function prop(extra){return {type:'sideStoryProp',sideStory:G.sideStoryScene.id,sideStoryRole:'errand',w:30,h:30,...extra};}
/* ---------------------------------------------------------------- install: the props for every step */
function install(q,scene){
 const def=STORIES[q.id];if(!def||def.stage!==G.stageIndex)return;
 // No staircase or Up markers: those were the old steps.
 G.obstacles=G.obstacles.filter(o=>o.sideStory!==q.id||!['step','task','routeBackdrop','carried'].includes(o.sideStoryRole));
 // The region can be set up again mid-run (a respawn, a door): how far the moths have flown and what you carry
 // stay with the run (G), not with the scene.
 const memo=G._errands||(G._errands={});const m=memo[q.id]||(memo[q.id]={perch:0,held:null});
 scene.errand={hurtSeen:G.p.blood,swing:0,pages:null,found:new Set(kept()[q.id]?.found||[]),memo:m};
 for(const [i,t] of q.tasks.entries()){const s=def.steps[t.id];if(!s)continue;
  if(s.kind==='chase')G.obstacles.push(prop({errand:'moths',task:t.id,index:i,x:s.perches[m.perch][0],y:s.perches[m.perch][1],perch:m.perch,from:null,fly:1}));
  // the drop point first: in co-op the host checks a partner's finished step against the first prop of that step
  if(s.kind==='carry')G.obstacles.push(prop({errand:'drop',task:t.id,index:i,x:s.to[0],y:s.to[1],item:s.item}));
  if(s.kind==='carry')G.obstacles.push(prop({errand:s.item,task:t.id,index:i,x:-999,y:0,held:m.held===s.item}));
  if(s.kind==='chop')G.obstacles.push(prop({errand:s.reveals?'masonry':'log',task:t.id,index:i,x:s.at[0],y:s.at[1],hits:0,need:s.hits,w:60,h:50}));
  if(s.kind==='chop'&&s.reveals)G.obstacles.push(prop({errand:'volume',task:t.id,index:i,x:s.at[0]+4,y:s.at[1],hidden:true}));
  if(s.kind==='find')G.obstacles.push(prop({errand:'volume',task:t.id,index:i,x:s.at[0],y:s.at[1]}));
  if(s.kind==='gather')s.at.forEach(([x,y],n)=>G.obstacles.push(prop({errand:'page',task:t.id,index:i,n,x,y,home:[x,y]})));
  if(s.kind==='tooth')G.obstacles.push(prop({errand:'gear',task:t.id,index:i,x:s.at[0],y:s.at[1],w:60,h:60}));
  if(s.kind==='lead')s.arms.forEach((x,n)=>G.obstacles.push(prop({errand:'arm',task:t.id,index:i,x,y:0,n,w:40,h:140})));
 }
 if(q.id==='defector'){
  // The maintenance lift up to the governor's shelf, as before.
  G.obstacles.push({type:'plat',earlyPlatform:true,earlyCarrier:true,earlyQuest:'defector',earlyId:'silas-lift',x:10880,y:130,homeX:10880,homeY:130,toX:11080,toY:205,w:120,h:14,duration:1.1});
  const lead=def.steps.lead,r=S().row(W().state(),q.id),there=r.step>=2||r.phase==='completed';
  scene.escort={destination:lead.path.at(-1)[0],y:0,finished:there,leg:1,silas:true};
  const actor=G.obstacles.find(o=>o.sideStory===q.id&&o.sideStoryRole==='actor');
  if(actor&&there){actor.baseX=actor.x=lead.path.at(-1)[0];actor.baseY=actor.y=0;}
 }
 sync();
}
/* Which props show, from the saved step. */
function sync(){
 const def=story();if(!def)return;const q=S().byId[G.sideStoryScene.id],r=row(),scene=G.sideStoryScene,e=scene.errand;
 const at=id=>def.anyOrder?(r.phase==='active'&&!e.found.has(id)):r.phase==='active'&&q.tasks[r.step]?.id===id;
 const done=id=>def.anyOrder?e.found.has(id)||r.phase==='ready'||r.phase==='completed':q.tasks.findIndex(t=>t.id===id)<r.step||r.phase==='ready'||r.phase==='completed';
 for(const o of G.obstacles.filter(o=>o.sideStory===q.id&&o.sideStoryRole==='errand')){
  const now=at(o.task),finished=done(o.task);
  if(o.errand==='moths')o.gone=!now;
  if(o.errand==='lantern'||o.errand==='key')o.gone=!now;
  if(o.errand==='drop')o.gone=!(now||finished);o.lit=finished;
  if(o.errand==='log'||o.errand==='masonry'){o.broken=finished;o.gone=!(now||finished);if(finished)o.hits=o.need;}
  if(o.errand==='volume')o.gone=!now||o.hidden;
  if(o.errand==='page')o.gone=!now||o.got;
  if(o.errand==='gear')o.stopped=finished;
  if(o.errand==='arm')o.gone=!now&&!finished;o.still=finished;
 }
}
function finish(taskId){
 const def=story(),q=S().byId[G.sideStoryScene.id],scene=G.sideStoryScene;
 if(def.anyOrder){
  scene.errand.found.add(taskId);const k=kept();k[q.id]={found:[...scene.errand.found]};try{persist();}catch(e){}
  // Steps are counted, not ordered: the next unfinished step in the list is ticked off for each find.
  const r=row();const next=q.tasks[r.step];if(next)W().completeTask(q.id,next.id);
 }else W().completeTask(q.id,taskId);
 sync();
}
function say(o,text,color){if(typeof addText==='function')addText(o.x,GROUND_Y-o.y-70,text,color||'#f2dfb7',false);}
/* ---------------------------------------------------------------- update: doing the steps */
function update(dt){
 const def=story();if(!def||typeof mode==='undefined'||mode!=='play')return;
 const scene=G.sideStoryScene,e=scene.errand;if(!e)return;
 const q=S().byId[scene.id],r=row(),p=G.p;
 // A hit (or a fall) is noticed once; carried things go back where they came from.
 const hurt=p.blood<e.hurtSeen||p.hurtFlash>0&&!e.flash;e.flash=p.hurtFlash>0;e.hurtSeen=p.blood;
 const swing=p.swingT>0&&!p.pogoSwing&&!p.upSlashSwing,newSwing=swing&&!e.swing;e.swing=swing;
 if(r.phase!=='active')return;
 for(const o of G.obstacles.filter(o=>o.sideStory===q.id&&o.sideStoryRole==='errand'&&!o.gone)){
  const s=def.steps[o.task];
  if(o.errand==='moths'){
   if(o.from){o.fly=Math.min(1,o.fly+dt/0.9);const [x0,y0]=o.from,[x1,y1]=s.perches[o.perch];o.x=x0+(x1-x0)*o.fly;o.y=y0+(y1-y0)*o.fly+Math.sin(o.fly*Math.PI)*90;if(o.fly>=1)o.from=null;continue;}
   const last=o.perch===s.perches.length-1;
   if(last&&near(p,o.x,o.y,40,50)){say(o,'CAUGHT · CARRY IT HOME','#c4ecd0');finish(o.task);const l=G.obstacles.find(x=>x.sideStory===q.id&&x.errand==='lantern');if(l){l.held=true;e.memo.held='lantern';}continue;}
   if(!last&&near(p,o.x,o.y,160,150)){o.from=[o.x,o.y];o.perch++;o.fly=0;e.memo.perch=o.perch;}
  }
  if(o.errand==='lantern'||o.errand==='key'){
   if(!o.held){
    const home=s.home||(()=>{const a=G.obstacles.find(x=>x.sideStory===q.id&&x.sideStoryRole==='actor');return a?[a.x,a.y]:[o.x,o.y];})();
    if(o.x===-999){o.x=home[0];o.y=home[1];}
    if(near(p,o.x,o.y,40,50)){o.held=true;e.memo.held=o.errand;say(o,o.errand==='key'?'THE WINDING KEY':'THE LANTERN','#ffd781');}
    continue;
   }
   o.x=p.x-16*(p.face||1);o.y=p.y+30;
   if(hurt){const home=s.home||null;o.held=false;e.memo.held=null;
    if(o.errand==='lantern'){o.x=home[0];o.y=home[1];say(p,'THE MOTHS TAKE IT BACK','#c4ecd0');}
    else{const a=G.obstacles.find(x=>x.sideStory===q.id&&x.sideStoryRole==='actor');o.x=a.x;o.y=a.y;say(p,'SILAS CATCHES THE KEY','#d59a68');}
    continue;}
   const [tx,ty]=s.to;if(near(p,tx,ty,60,50)){o.held=false;e.memo.held=null;o.x=tx;o.y=ty;finish(o.task);say(o,o.errand==='key'?'HUNG ON THE HOOK':'HOME','#ffd781');}
  }
  if(o.errand==='log'||o.errand==='masonry'){
   if(newSwing&&near(p,o.x,o.y+20,70,70)){
    if(s.needs&&!caps().includes(s.needs)){say(o,'YOU NEED A BLADE','#e6e0d4');continue;}
    o.hits++;o.shake=.2;if(typeof SFX!=='undefined'&&meta.soundOn)try{SFX.hit(o.x);}catch(x){}
    if(o.hits>=o.need){o.broken=true;
     if(s.reveals){const v=G.obstacles.find(x=>x.sideStory===q.id&&x.errand==='volume'&&x.task===o.task);if(v){v.hidden=false;v.gone=false;}say(o,'THE READING ROOM','#bca4db');}
     else{finish(o.task);say(o,'HALE: “That’ll do. Board’s yours.”','#d8c48f');}}
   }
   if(o.shake>0)o.shake-=dt;
  }
  if(o.errand==='volume'&&!o.hidden&&near(p,o.x,o.y,40,50)){o.gone=true;finish(o.task);say(o,'A VOLUME · '+(3-[...e.found].length)+' TO GO','#bca4db');}
  if(o.errand==='page'){
   if(!o.got&&near(p,o.x,o.y,36,46)){o.got=true;o.gone=true;if(!e.pages)e.pages={t:s.seconds,task:o.task};say(o,'A PAGE','#e6e0d4');
    const left=G.obstacles.filter(x=>x.sideStory===q.id&&x.errand==='page'&&!x.got).length;
    if(!left){e.pages=null;finish(o.task);say(o,'THE BELL-RINGER’S ACCOUNT','#bca4db');}}
  }
  if(o.errand==='gear'){
   o.t=(o.t||0)+dt;const open=o.t%2.4<.75;o.open=open;
   if(newSwing&&near(p,o.x,o.y,75,70)){
    if(!caps().includes('weapon'))say(o,'YOU NEED A BLADE','#e6e0d4');
    else if(open){finish(o.task);say(o,'THE GOVERNOR STOPS','#d59a68');}
    else{say(o,'CLANG · WAIT FOR THE BRIGHT TOOTH','#e6e0d4');o.shake=.2;}
   }
   if(o.shake>0)o.shake-=dt;
  }
  if(o.errand==='arm')o.t=(o.t||0)+dt;
 }
 if(e.pages){e.pages.t-=dt;if(e.pages.t<=0){e.pages=null;
  for(const o of G.obstacles.filter(o=>o.sideStory===q.id&&o.errand==='page')){o.got=false;o.gone=false;[o.x,o.y]=o.home;}
  say(p,'THE WIND TAKES THEM BACK','#e6e0d4');}}
 if(scene.id==='defector'&&q.tasks[r.step]?.id==='lead')lead(dt,def.steps.lead,scene);
}
/* Silas copies you: he walks while you walk (and are near), stops when you stop. A patrol arm that comes down on
   him knocks him back to where he last stood clear. */
function lead(dt,s,scene){
 const a=G.obstacles.find(o=>o.sideStory==='defector'&&o.sideStoryRole==='actor');if(!a)return;const p=G.p,esc=scene.escort;
 const moving=Math.abs(p.vx)>40&&Math.abs(p.x-a.x)<380&&Math.abs(p.y-a.y)<220;
 a.openingWalking=moving;
 if(moving){
  const [tx,ty]=s.path[esc.leg],dx=tx-a.x,step=Math.min(Math.abs(dx),dt*70);a.x+=Math.sign(dx)*step;
  if(ty!==a.y){const [px]=s.path[esc.leg-1];const f=Math.min(1,Math.abs(a.x-px)/Math.max(1,Math.abs(tx-px)));a.y=s.path[esc.leg-1][1]+(ty-s.path[esc.leg-1][1])*f;}
  if(Math.abs(tx-a.x)<1){a.x=tx;a.y=ty;if(esc.leg<s.path.length-1)esc.leg++;else{esc.finished=true;a.openingWalking=false;finish('lead');say(a,'SILAS: “Warm.”','#d59a68');}}
  a.baseX=a.x;a.baseY=a.y;
 }
 for(const arm of G.obstacles.filter(o=>o.errand==='arm'&&o.sideStory==='defector')){
  const down=((arm.t||0)%3.2)>2.1;arm.down=down;
  if(down&&Math.abs(a.x-arm.x)<26){
   const back=arm.x+Math.sign(s.path[0][0]-s.path.at(-1)[0])*130;   // the clear side behind him
   a.x=a.baseX=back;say(a,'KNOCKED BACK','#e6e0d4');
  }
 }
}
/* ---------------------------------------------------------------- drawing */
const R=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
function draw(c,o,q,r){
 if(o.sideStoryRole!=='errand'||!handles(q.id))return false;
 if(o.gone&&!(o.errand==='drop'&&o.lit)&&!o.broken)return true;
 const t=(typeof G!=='undefined'&&G.time)||0;c.save();c.translate(Math.round(o.x),Math.round(GROUND_Y-o.y));
 if(o.shake>0)c.translate(Math.sin(t*90)*2,0);
 if(o.errand==='moths'){
  const flap=Math.sin(t*20);R(c,-6,-34,12,14,'#f1d991');R(c,-3,-38,6,4,'#6b5a3e');c.globalAlpha=.25;c.fillStyle='#ffe9a8';c.beginPath();c.arc(0,-28,22,0,7);c.fill();c.globalAlpha=1;
  for(let i=0;i<6;i++){const a=t*2+i;const mx=Math.cos(a)*16,my=-40+Math.sin(a*1.3)*10;R(c,mx-3,my,3,2+flap,'#c4ecd0');R(c,mx,my,3,2-flap,'#c4ecd0');}
 }else if(o.errand==='lantern'){
  R(c,-5,-14,10,12,'#f1d991');R(c,-3,-17,6,3,'#6b5a3e');c.globalAlpha=.2;c.fillStyle='#ffe9a8';c.beginPath();c.arc(0,-8,18,0,7);c.fill();
 }else if(o.errand==='key'){
  R(c,-2,-18,4,12,'#d0a85f');R(c,-6,-22,12,4,'#d0a85f');R(c,-6,-26,4,4,'#d0a85f');R(c,2,-26,4,4,'#d0a85f');
 }else if(o.errand==='drop'){
  if(o.item==='lantern'){R(c,-1,-60,2,24,'#6b5a3e');if(o.lit){R(c,-5,-36,10,12,'#f1d991');}}
  else{R(c,-2,-30,4,30,'#7c6c55');R(c,-8,-30,16,3,'#7c6c55');if(o.lit){R(c,-2,-27,4,10,'#d0a85f');}}
  if(!o.lit&&Math.abs(G.p.x-o.x)<260){c.font='12px system-ui';c.textAlign='center';c.fillStyle='#e6e0d4';c.fillText(o.item==='lantern'?'Elsie’s kitchen':'The toll tower hook',0,-72);}
 }else if(o.errand==='log'){
  if(!o.broken){R(c,-30,-16,60,16,'#6b4f37');R(c,-30,-16,60,3,'#8a6a4a');for(let i=0;i<o.hits;i++)R(c,-20+i*18,-16,2,16,'#2d2219');}
  else{R(c,-28,-6,56,6,'#a88a62');R(c,-24,-12,48,6,'#a88a62');}
 }else if(o.errand==='masonry'){
  if(!o.broken){R(c,-28,-50,56,50,'#6d6876');for(let row=0;row<5;row++){R(c,-28,-50+row*10,56,1,'#4e4a57');for(let b=(row%2)*9;b<56;b+=18)R(c,-28+b,-50+row*10,1,10,'#4e4a57');}R(c,-28,-50,56,2,'#8a8594');for(let i=0;i<o.hits;i++){c.strokeStyle='#2a2730';c.lineWidth=2;c.beginPath();c.moveTo(-20+i*12,-50);c.lineTo(-10+i*12,-25);c.lineTo(-18+i*12,0);c.stroke();}}
  else{R(c,-30,-8,14,8,'#6d6876');R(c,14,-6,16,6,'#6d6876');}
 }else if(o.errand==='volume'){
  R(c,-9,-14,18,13,'#7c5a9a');R(c,-9,-14,18,2,'#bca4db');R(c,7,-14,2,13,'#e6dcc4');
  if(Math.abs(G.p.x-o.x)<240){c.font='12px system-ui';c.textAlign='center';c.fillStyle='#e6e0d4';c.fillText('An account',0,-30);}
 }else if(o.errand==='page'){
  c.rotate(Math.sin(t*3+o.n)*.3);R(c,-6,-16,12,14,'#e6dcc4');R(c,-4,-13,8,1,'#8d8274');R(c,-4,-10,8,1,'#8d8274');
 }else if(o.errand==='gear'){
  const stop=o.stopped,ang=stop?0:(o.t||0)*(Math.PI*2/2.4);c.translate(0,-30);c.rotate(ang);
  for(let i=0;i<8;i++){c.rotate(Math.PI/4);R(c,-5,-28,10,18,i===7&&!stop?(o.open?'#fff1b8':'#b9894a'):stop?'#665d4b':'#d0a85f');}
  c.fillStyle=stop?'#665d4b':'#d0a85f';c.beginPath();c.arc(0,0,20,0,7);c.fill();R(c,-5,-5,10,10,'#292c2d');
 }else if(o.errand==='arm'){
  const k=(o.t||0)%3.2,down=!o.still&&k>2.1,lift=o.still?1:down?0:Math.min(1,k<1.9?1:1-(k-1.9)/.2);
  R(c,-3,-150,6,20,'#4c4a42');c.save();c.translate(0,-130);c.rotate(-lift*1.2);R(c,-4,0,8,120,down?'#d26a4a':'#7b7464');c.restore();
  if(!o.still&&Math.abs(G.p.x-o.x)<420){c.font='11px system-ui';c.textAlign='center';c.fillStyle='#e6e0d4';c.fillText('patrol arm',0,-158);}
 }
 c.restore();
 // what to do, near the thing
 const p=G.p,s=story()?.steps[o.task];
 if(r.phase==='active'&&Math.abs(p.x-o.x)<200&&Math.abs(p.y-o.y)<170){
  const tip={moths:'Follow the moths',log:'Strike the log',masonry:'Break through',gear:'Strike the bright tooth',lantern:o.held?'':'Take the lantern',key:o.held?'':'Take the key'}[o.errand];
  if(tip){c.font='13px system-ui';c.textAlign='center';c.fillStyle='#f2dfb7';c.fillText(tip,o.x,GROUND_Y-o.y-90);}
 }
 const e=G.sideStoryScene?.errand;
 if(o.errand==='page'&&e?.pages&&!o.got){c.font='bold 13px system-ui';c.textAlign='center';c.fillStyle='#e6dcc4';c.fillText(Math.ceil(e.pages.t)+'s',o.x,GROUND_Y-o.y-30);}
 return true;
}
root.BladefallQuestErrands=Object.freeze({STORIES,handles,install,update,draw,sync});
})(typeof globalThis!=='undefined'?globalThis:window);
