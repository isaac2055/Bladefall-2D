/* Standalone precision courses. All new movement is opt-in to stages 41/42 and the stage 44 workshop.
   World y is positive up; player vy is positive down. State lives in G for TAS snapshots. */
(function(root){
'use strict';
const A2=root.BladefallActTwo, F=root.BladefallFractured;
if(!A2||!F)return;
const WIDTH=1800;
const flightTime=stage=>stage===42?6.2:6.7;
const roomWidth=kind=>root.BladefallPrecisionWorkshop?.width(kind)||(kind==='dash-lab'?2040:['gale','gale-tear'].includes(kind)?4400:kind==='portal-gale'?5200:['weight','weight-anvil','relay'].includes(kind)?2800:WIDTH);
const lessons=[
 ['tear','The First Tear','Dash into the violet mouth. Its exit fires you across the gap and restores your dash.'],
 ['ring','Iron in the Air','Purple rings invert gravity on release: press G to right yourself. Gold rings launch you forward.'],
 ['weight','Borrowed Momentum','Strike, ride, then jump while the block glows. Carry its launch across the long gap.'],
 ['anvil','The Returning Blow','Jump, then hold Down to pound the anvil. Its rebound clears the wall.'],
 ['pogo','The Blade Below','Hold Down + Slash above each pearl. A hit rebounds and restores your air jump and dash.'],
 ['uppercut','The Rising Blade','Hold Up + Slash under each lift bell. A hit launches you upward; steer to the next bell.'],
 ['gale','Aether Form','Steer the shard through the bends. Touch the bright refill midway; Jump brakes, Dash exits.'],
 ['gravity','The Other Floor','Flip to the roof, cross the pillar, then flip back to the landing.'],
 ['portal','The Bent Road','Dash through the fixed mouths. Your momentum leaves in a new direction.']
];
const combinations=[
 ['tear-ring','Between Two Catches','Tear → tension ring → ring. Keep moving between the catches.'],
 ['weight-anvil','Iron Answers Iron','Counterweight → hold Down → rebound across the teeth.'],
 ['gale-tear','Thread the Aether','Bank through the aether passage, then dash into the tear.'],
 ['gravity-ring','No Floor Below','Flip over the pillar, right yourself, and hook the waiting iron.'],
 ['relay','The Whole Sentence','Counterweight → anvil → tear → tension ring. One continuous crossing.'],
 ['portal-gale','Through the Eye','A portal launch feeds aether form; steer through the narrow exit.'],
 ['pogo-tear','Steel Through Silk','Pogo pearl → upward slash bell → dash into the tear. Aim each strike in midair.'],
 ['uppercut-ring','The Hanging Edge','Upward slash → pogo → tension ring. Carry the rebound over the teeth into a hook catch.'],
 ['inversion-relay','The Last Weave','Tear → gravity weave → tension ring. Cross the ↑ arch inverted, the ↓ arch upright. No floor between.']
];
const courses={44:root.BladefallPrecisionWorkshop.catalog.map(r=>[r.kind,r.title,r.hint]),41:[['dash-lab','The Dash Foundry','One air dash. Cyan refills. Dash in the blue rail field; jump while gold. Dash through violet.']].concat(lessons,combinations),42:combinations};
function active(){return G&&([41,42,44].includes(G.stageIndex));}
function state(){return active()?G.celeste:null;}
function held(k){return typeof keyDownFor==='function'&&keyDownFor(k);}
function dir(){return {x:(held('right')?1:0)-(held('left')?1:0)||(input.jx||0),y:((BF_TAS_ENABLED?held('up'):BFKeyboard.isDown('ArrowUp'))?1:0)-(held('slam')?1:0)-(input.jz||0)};}
function refill(p){if(lab()){labState().charge=1;labState().airDashes=0;}p.dodgeCdT=0;p.jumps=1;p.airRefill=true;p.slamCd=0;}
// The Standard opening is a contained movement experiment. Its charge, direction and
// device receipts never leak into the legacy lessons or the Fractured course.
function lab(){const a=state();return !!(a&&(a.stage===44||a.stage===41&&a.rooms[a.room]?.kind==='dash-lab'));}
function labState(){const a=state();return a.lab||(a.lab={charge:1,grace:0,refill:false,veins:0,dashes:0,launches:0});}
function labCanDash(){return !lab()||labState().charge>0;}
function labStart(p){
 if(!lab())return;
 const a=labState(),d=dir();let x=Math.abs(d.x)>.3?Math.sign(d.x):0,y=Math.abs(d.y)>.3?Math.sign(d.y):0;if(!x&&!y)x=p.face;
 const len=Math.hypot(x,y);a.dx=x/len;a.dy=y/len;a.speed=Math.max(720,p.vx*a.dx-p.vy*a.dy);a.charge=0;a.recharge=.38;a.dashes++;a.aimUntil=state().clock+.10;a.aimInput={...d};
 p.dodgeTimer=.16;p.dodgeCdT=.10;p.jumpCutOk=false;p.slamming=false;p.airRefill=false;state().slamLatched=true;
 const o=G.obstacles.find(o=>o.ceRoom===state().room&&o.ceShuttle&&(!o.ceLinked||p.floorPlat===o)&&p.x>=o.ceHomeX-160&&p.x<=o.ceToX+80&&p.y+p.h/2>=o.y-30&&p.y+p.h/2<=o.y+280);
 if(o&&!o.labArmed){o.labStart=G.time;o.labArmed=true;if(shared())coopAction('shuttle');}
 a.ride=!!((o&&p.floorPlat===o||p.floorPlat?.ceHoist)&&p.onGround);if(state().rooms[state().room].noDashFlight&&!a.ride){a.airDashes=(a.airDashes||0)+1;}if(!a.ride){p.onGround=false;p.floorPlat=null;}
 root.BladefallPrecisionWorkshop.dash(p,a);
 labVelocity(p);
}
function labVelocity(p){
 const a=labState();
 // Accept a direction chord a few frames after dash; releases do not erase the aim.
 if(state().stage===44&&!a.phase&&!a.ride&&state().clock<a.aimUntil-1e-8){const d=dir();if(Math.hypot(d.x,d.y)>.3&&(Math.abs(d.x)>Math.abs(a.aimInput.x)+.2||Math.abs(d.y)>Math.abs(a.aimInput.y)+.2||d.x*a.aimInput.x<0||d.y*a.aimInput.y<0)){const n=Math.hypot(d.x,d.y);a.dx=d.x/n;a.dy=d.y/n;a.aimInput={...d};}}
 p.vx=a.ride?0:a.dx*a.speed;p.vy=a.ride?0:-a.dy*a.speed;p.jumpCutOk=false;
 if(p.dodgeTimer<=0&&!a.phase){p.vx=a.ride?0:a.dx*280;p.vy=a.ride?0:(a.dy>0?-120:-a.dy*360);a.ride=false;}
 // Timed recharge remains available, but repeated rising dashes cannot sustain flight.
 if(state().rooms[state().room].noDashFlight&&a.dy>=0&&a.airDashes>1){const drag=(a.airDashes-1)*(a.dy>0?420:240);p.vy=p.dodgeTimer>0?Math.min(900,p.vy+drag):Math.max(p.vy,Math.min(160,drag));}
}
function labBefore(dt,p){
 if(!lab()){if(state()?.lab){syncMovementCapabilities(p);state().lab=null;}return;}
 const a=labState();if(state().stage===44){a.recharge=Math.max(0,(a.recharge||0)-dt);if(a.recharge===0)a.charge=1;}p.maxJumps=2;p.airRefill=false;a.grace=Math.max(0,a.grace-dt);
 if(p.onGround&&p.dodgeTimer<=0&&!a.phase){a.charge=1;a.airDashes=0;}
 if(a.phase)p.dodgeTimer=Math.max(p.dodgeTimer,.04);
 for(const o of G.obstacles){if(o.ceRoom!==state().room||!o.ceShuttle)continue;
  const wasX=o.x,t=o.labArmed?Math.max(0,G.time-o.labStart):0;
  const f=!o.labArmed?0:t<.65?t/.65:t<1.15?1:Math.max(0,1-(t-1.15)/1.2);
  o.x=o.ceHomeX+(o.ceToX-o.ceHomeX)*f;o.labCharged=o.labArmed&&t>=.53&&t<=.83;
  if(p.onGround&&p.floorPlat===o){p.x+=o.x-wasX;if(o.labCharged){a.grace=.12;a.lift=(o.ceToX-o.ceHomeX)/.65;}}
  if(o.labArmed&&t>=(o.ceReturnDrop?2.95:2.35))o.labArmed=false;
 }
}
function labLate(p){
 if(!lab())return;const a=labState();
 if(a.grace>0&&!p.onGround&&p.vy< -100){p.vx+=a.lift;p._ballisticT=.65;p.jumpCutOk=false;a.grace=0;a.launches++;}
 for(const o of G.obstacles){
  if(o.ceRoom!==state().room)continue;
  if(o.type==='ceDashRefill'&&!o.ceSpent&&Math.hypot(p.x-o.x,p.y+p.h/2-o.y)<34){o.ceSpent=true;a.refill=true;a.charge=1;p.dodgeCdT=0;}
  if(o.type!=='ceVein')continue;
  const inside=p.x+p.w/2>o.x-o.w/2&&p.x-p.w/2<o.x+o.w/2&&p.y+p.h>o.y&&p.y<o.y+o.h;
  if(inside&&!a.phase){if(p.dodgeTimer<=0){if(state().stage===44){root.BladefallPrecisionWorkshop.contact(p,o);continue;}retry();return;}a.phase=o.ceId||o.ceRoom+':vein';a.ride=false;}
  if(a.phase===(o.ceId||o.ceRoom+':vein')&&!inside){a.phase=null;a.veins++;a.charge=1;p.dodgeCdT=0;p.dodgeTimer=0;p.vx=a.dx*a.speed;p.vy=-a.dy*120;p._ballisticT=.35;root.BladefallPrecisionWorkshop.veinExit(p,o);}
 }
}

function shared(){return active()&&G.coopSession&&typeof coopActive==='function'&&coopActive();}
function mark(id){const a=state();if(a&&id&&!a.used.includes(id)){a.used.push(id);if(shared())coopAction('progress');}}
function progress(){const a=state();return {attempt:a.attempt||0,used:a.used.slice(),ready:!!a.ready};}
function coopSnapshot(){const a=state();return a?{stage:a.stage,room:a.room,epoch:a.coopEpoch||0,complete:a.complete,single:!!a.single,runEnd:a.runEnd,shuttle:lab()?G.obstacles.filter(o=>o.ceRoom===a.room&&o.ceShuttle).map(o=>({armed:!!o.labArmed,start:o.labStart||0,age:G.time-(o.labStart||0)})):null,host:progress(),guest:a.peerProgress||null,armed:G.obstacles.filter(o=>o.ceRoom===a.room&&o.ceWeight&&o.ceArmed).map(o=>o.ceMark)}:null;}
function coopPublish(){netSend({t:'precisionState',state:coopSnapshot()});}
function coopAction(action,id){
 const a=state(),m={t:'precisionAction',stage:a.stage,room:a.room,epoch:a.coopEpoch||0,action,id,shuttleAt:action==='shuttle'?G.time:undefined,progress:progress()};
 if(NET.isHost()){coopTryAdvance();coopPublish();}else netSend(m);
}
function finish(){
 const a=state();a.complete=true;
 if(a.stage===44){root.BladefallPrecisionWorkshop.complete();return;}
 showOvHTML('<div class="card"><h1 class="ovh">'+(a.stage===41?'Celeste Standard':'Fractured Celeste')+'</h1><p class="ovsub">COURSE COMPLETE · '+a.deaths+' retries</p><button class="bigbtn" id="ceReturn">Precision Courses</button></div>');
 mode='celeste-complete';document.getElementById('ceReturn').onclick=menu;
}
function coopTryAdvance(){
 const a=state(),r=a.rooms[a.room],peer=a.peerProgress;
 if(!a.ready||!peer?.ready||!(a.stage===44||r.required.every(id=>a.used.includes(id)&&peer.used.includes(id))))return;
 a.coopEpoch=(a.coopEpoch||0)+1;
 if(a.single||a.room===(a.stage===44?root.BladefallPrecisionWorkshop.lastRoom():a.rooms.length-1))finish();else{const deaths=a.deaths;a.room=a.stage===44?root.BladefallPrecisionWorkshop.nextRoom():a.room+1;a.checkpoint=a.rooms[a.room].x+120;retry(true);a.deaths=deaths;a.peerProgress=null;}
}
function coopReceive(m){
 if(!shared())return;const a=state();
 if(m.t==='precisionAction'){
  if(!NET.isHost()||m.stage!==a.stage||m.room!==a.room||m.epoch!==(a.coopEpoch||0)||a.complete)return;
  if(m.action==='shuttle'&&lab()){const rails=G.obstacles.filter(o=>o.ceRoom===a.room&&o.ceShuttle),o=rails[0];if(o&&!o.labArmed){const start=Number.isFinite(m.shuttleAt)&&Math.abs(G.time-m.shuttleAt)<.3?m.shuttleAt:G.time;for(const rail of rails){rail.labArmed=true;rail.labStart=start+(rail.ceDelay||0);}}}
  if(m.action==='arm'){const o=G.obstacles.find(o=>o.ceRoom===a.room&&o.ceWeight&&o.ceMark===m.id);if(o)o.ceArmed=true;}
  const p=m.progress;
  if(p&&Array.isArray(p.used)&&p.attempt>=(a.peerProgress?.attempt||0))a.peerProgress={attempt:p.attempt,used:p.used.filter(id=>a.rooms[a.room].required.includes(id)),ready:!!p.ready};
  coopTryAdvance();coopPublish();return;
 }
 if(m.t!=='precisionState'||!NET.isGuest())return;const s=m.state;
 if(!s||s.stage!==a.stage||!a.rooms[s.room]||s.epoch<(a.coopEpoch||0))return;
 const first=!a.netInitialized;a.netInitialized=true;
 if(first||s.epoch>(a.coopEpoch||0)||s.room!==a.room){const deaths=a.deaths;a.complete=false;a.room=s.room;a.checkpoint=a.rooms[a.room].x+120;retry(true);a.deaths=deaths;a.coopEpoch=s.epoch;}
 a.peerProgress=s.host;a.single=!!s.single;if(a.stage===44)a.runEnd=s.runEnd??root.BladefallPrecisionWorkshop.playlist(a.room).at(-1);
 if(lab()&&s.shuttle){const rails=G.obstacles.filter(o=>o.ceRoom===a.room&&o.ceShuttle);s.shuttle.forEach((v,i)=>{const o=rails[i];if(o&&v.armed&&o.labNetworkStart!==v.start){if(!o.labArmed||Math.abs((G.time-o.labStart)-v.age)>.15)o.labStart=G.time-v.age;o.labArmed=true;o.labNetworkStart=v.start;}});}
 if(first){a.attempt=Math.max(a.attempt,(s.guest?.attempt||0)+1);coopAction('progress');}
 for(const o of G.obstacles)if(o.ceRoom===a.room&&o.ceWeight&&s.armed.includes(o.ceMark)&&!o.ceReturning)o.ceArmed=true;
 if(s.complete&&!a.complete)finish();
}
function build(stage){
 const hard=stage===42, rooms=[],objects=[],taught={};let cursor=0;
 const add=(r,o)=>{o.ceRoom=r.i;if(stage===44)o.actArt='workshop';objects.push(o);return o;};
 for(const [i,[kind,title,hint]] of courses[stage].entries()){
  const x=cursor,width=roomWidth(kind),r={i,x,width,kind,title,hint,required:[],end:x+width-140};cursor+=width;rooms.push(r);
  const plat=(px,w,y,extra)=>add(r,Pl(x+px,w,y,Object.assign({actArt:'celeste',h:20},extra)));
  const floor=(a,b,y=0)=>plat((a+b)/2,b-a,y,{deep:1,h:800});
  const wall=(px,low,top,w=36)=>add(r,Object.assign(Wl(x+px,top,top-low,w),{w,noCling:1,slickL:1,slickR:1,actArt:'celeste'}));
  const hazard=(px,y,w,h,period=0)=>add(r,{type:'ceHazard',x:x+px,y,w,h,period,duty:hard?.64:.48,phase:0});
  const tear=(ax,ay,bx,by,extra)=>{const id=i+':tear';r.required.push(id);return add(r,Seam(x+ax,ay,x+bx,by,Object.assign({ceMark:id},extra)));};
  const ring=(px,y,tension=false)=>{const id=i+':ring';if(!r.required.includes(id))r.required.push(id);if(tension)r.required.push(i+':tension');return add(r,{type:'actRing',x:x+px,y,w:30,h:30,ceTension:tension,ceGravity:!tension,ceWait:true,ceMark:id});};
  const weight=(px,py,tx,ty)=>{const id=i+':weight';r.required.push(id);const p=plat(px,hard?94:130,py,{ceWeight:true,ceMark:id,ceHomeX:x+px,ceHomeY:py,ceToX:x+tx,ceToY:ty,ceT:0,ceArmed:false});return p;};
  const anvil=(px,y)=>{const id=i+':anvil';r.required.push(id);plat(px,hard?66:94,y,{ceAnvil:true,ceMark:id});};
  const gale=(px,y,refill=false)=>{const id=i+(refill?':gale-refill':':gale');r.required.push(id);return add(r,{type:'ceGale',x:x+px,y,w:54,h:54,ceMark:id,ceRefill:refill});};
  const blade=(px,y,kind)=>{const id=i+':'+kind+'-'+(r.required.filter(k=>k.includes(':'+kind+'-')).length+1);r.required.push(id);add(r,{type:'ceBlade',x:x+px,y,w:hard?30:42,h:30,ceBlade:kind,ceMark:id,ceSpent:false,ceFlash:0,ceTeach:!taught[kind]});taught[kind]=true;};
  const roof=(a,b,y)=>plat((a+b)/2,b-a,y+18,{ceilingOnly:1,h:18});
  const gravity=()=>r.required.push(i+':gravity');
  const portal=(ax,ay,bx,by)=>{r.required.push(i+':portal');add(r,FixedPortal(x+ax,ay,'celeste-'+i,'wallL',{cePortal:1}));add(r,FixedPortal(x+bx,by,'celeste-'+i,'wallR',{cePortal:1}));};
  const flightRoute=(start)=>{
   // Two long bending legs. Each is within one charge; both together are not.
   const low=hard?245:220,high=hard?295:320;
   r.flightStart=start;r.flightEnd=start+3420;
   for(const [dx,bottom]of [[400,true],[740,false],[1080,true],[1420,false],[2040,true],[2380,false],[2720,true],[3060,false]]){
    hazard(start+dx,bottom?-400:high,hard?110:90,bottom?400+low:600);
   }
   gale(start+1740,225,true);
   r.flightPath=[[start+220,285],[start+480,285],[start+600,190],[start+830,190],[start+960,285],[start+1170,285],[start+1300,190],[start+1510,190],[start+1740,203],[start+1880,285],[start+2130,285],[start+2260,190],[start+2470,190],[start+2600,285],[start+2810,285],[start+2940,190],[start+3160,190],[start+3420,180]];
  };
  floor(0,330);floor(width-320,width);
  if(stage===44){root.BladefallPrecisionWorkshop.build(kind,{r,x,add:o=>add(r,o),plat,floor,wall,hazard,tear,ring,weight,anvil,gale,blade,roof,gravity,portal});}
  else if(kind==='dash-lab'){
   plat(680,140,40,{ceShuttle:true,ceHomeX:x+680,ceToX:x+1110,labArmed:false});
   add(r,{type:'ceDashRefill',x:x+450,y:145,w:28,h:28});
   add(r,{type:'ceVein',x:x+1390,y:30,w:220,h:180});
   hazard(1550,-400,50,510);
  }else if(kind==='tear'){
   tear(285,45,1120,160,{ceBoost:820});wall(860,-500,750); 
  }else if(kind==='ring'){
   ring(580,130);ring(900,220,true);ring(1250,190); 
  }else if(kind==='weight'){
   weight(280,0,670,260);wall(2120,-400,220);plat(2310,360,230);r.liftTarget=x+2310; 
  }else if(kind==='anvil'){
   floor(330,550);anvil(480,0);wall(840,-400,220);plat(1110,100,100); 
  }else if(kind==='pogo'){
   blade(430,35,'pogo');blade(780,190,'pogo');blade(1130,390,'pogo');
  }else if(kind==='uppercut'){
   blade(300,85,'uppercut');blade(720,310,'uppercut');blade(1130,580,'uppercut');
  }else if(kind==='pogo-tear'){
   blade(430,35,'pogo');blade(800,300,'uppercut');tear(1100,510,1510,0,{setDown:1});wall(1300,-400,750);
   if(hard)hazard(680,420,100,300);
  }else if(kind==='uppercut-ring'){
   blade(300,85,'uppercut');blade(680,190,'pogo');wall(870,-400,155);ring(1100,290,true);ring(1390,160);
   if(hard)hazard(900,510,140,300);
  }else if(kind==='gale'||kind==='gale-tear'){
   gale(295,65);flightRoute(295);
   if(kind==='gale-tear'){tear(3810,180,width-290,0,{setDown:1});wall(3970,-450,850);}
   else{plat(3890,150,130);}
  }else if(kind==='gravity'||kind==='gravity-ring'){
   gravity();roof(200,kind==='gravity'?1510:1030,360);wall(740,-400,205);
   if(kind==='gravity-ring'){ring(1120,290,true);ring(1390,160);}
  }else if(kind==='portal'||kind==='portal-gale'){
   portal(315,35,1000,235);wall(690,-400,800);
   if(kind==='portal-gale'){gale(1080,230);flightRoute(1080);plat(4680,150,130);}
   else{plat(1060,100,200);add(r,Cry(x+1250,180));}
  }else if(kind==='tear-ring'){
   tear(280,55,850,210);wall(560,-500,750);ring(1110,270,true);ring(1400,160);
   hazard(1250,hard?235:280,65,400,hard?2.1:2.8);
  }else if(kind==='weight-anvil'){
   weight(280,0,620,220);anvil(1880,170);wall(2170,-400,360);r.liftTarget=x+1880;
   hazard(2090,hard?570:650,130,250);
  }else if(kind==='inversion-relay'){
   gravity();tear(280,55,640,220);wall(470,-400,850);
   hazard(840,-400,130,hard?540:510);hazard(1080,hard?335:375,130,500);
   for(const [px,inverted]of [[860,true],[1190,false]]){
    const id=i+':gravity-'+(inverted?'up':'down');r.required.push(id);
    add(r,{type:'ceGravityArch',x:x+px,y:100,w:60,h:230,inverted,ceMark:id});
   }
   ring(1410,250,true);
  }else if(kind==='relay'){
   weight(280,0,510,180);anvil(1710,145);tear(1940,380,2170,200);wall(2050,-400,320);ring(2450,230,true);r.liftTarget=x+1710;
   hazard(2320,-350,80,460);
  }
  // The exit shutter is powered by the room's devices. Its lit symbols show what remains.
  if(stage!==44)add(r,{type:'wall',x:x+width-160,y:900,h:1500,w:24,actBars:1,ceGate:true,noCling:1,actArt:'celeste'});
  if(stage!==44)add(r,{type:'wall',x:x+width-60,y:900,h:1500,w:20,ceBoundary:true,noCling:1,actArt:'celeste'});
  if(hard&&['tear-ring','gravity-ring','relay','uppercut-ring','inversion-relay'].includes(kind)){hazard(width-280,0,64,95,2.3);}
 }
 return {len:cursor,spawnX:120,spawnY:0,portal:null,authoredEcology:true,objects,loot:[],npcs:[],enemies:[],
  ceRooms:rooms,build(){init(stage,rooms);}};
}
const levels={};
function level(s){return levels[s]||(levels[s]=build(s));}
function init(stage,rooms){
 G.celeste={stage,room:0,clock:0,used:[],deaths:0,complete:false,flight:null,liftGrace:0,prevFlip:false,prevX:120,prevY:0,rooms,checkpoint:120};
 G.actTwo={stage,t:0,tolls:[],fallen:[],queue:[]};
 F.setKit(['jump','weapon','dash','double-jump','wall-jump','downward-strike','gravity-flip','chain-hook','portal-single','portal-pair']);
 G.flipUnlocked=false;G.gravityFlipped=false;G.boss=null;G.musterForced=false;
 G.p.weapon=oathbladeWeapon();G.p.stowedWeapon=null;syncWeaponCapabilities(G.p);
 G.p.hasJetpack=false;G.p.fuel=0;
 if(stage===44)root.BladefallPrecisionWorkshop.init();
}
function retry(remote=false){
 const a=state();if(!a||a.complete)return;
 a.lab=null;a.ready=false;a.attempt=(a.attempt||0)+1;
 a.deaths++;a.contacts=0;a.lastContact=null;a.leaseActive=false;a.gravityLeaseT=0;a.anvilHits=0;a.slamLatched=false;a.slamHold=0;a.jumpWindow=0;a.wasHook=null;a.wasSlam=false;a.roomLanded=false;a.clock=0;a.flight=null;a.flightReceipts=[];a.flightEvents=[];a.liftGrace=0;a.used=[];
 const p=G.p;Object.assign(p,{x:a.checkpoint,y:0,vx:0,vy:0,jumps:0,coyote:.12,jumpBuf:0,dashBuf:0,dodgeTimer:0,dodgeCdT:0,
  slamming:false,slamCd:0,pogoSwing:false,upSlashSwing:false,bladeDirection:'side',bladeChordT:0,swingT:0,atkTimer:0,atkCd:0,atkBuf:0,swingHits:[],charging:false,chargeTime:0,actHook:null,seamRide:null,onGround:false,floorPlat:null,_flungT:0,_ballisticT:0,_tpCd:0,jumpCutOk:false});
 G.gravityFlipped=false;a.prevFlip=false;syncMovementCapabilities(p);
 for(const o of G.obstacles){if(o.ceRoom!==a.room)continue;if(o.ceWeight&&(!shared()||remote)){o.x=o.ceHomeX;o.y=o.ceHomeY;o.ceArmed=false;o.ceT=0;o.ceLaunchSpent=false;o.ceTopAge=0;o.ceReturning=false;}if(o.ceShuttle&&(!shared()||remote)){o.x=o.ceHomeX;o.labArmed=false;o.labCharged=false;delete o.labNetworkStart;}if(o.ceGate||o.ceBoundary)o.gone=false;if(o.type==='ceDashRefill')o.ceSpent=false;if(o.type==='seam')o.spent=false;if(o.type==='ceGale'||o.type==='ceBlade'){o.ceSpent=false;o.ceFlash=0;}}
 root.BladefallPrecisionWorkshop.reset();
 a.prevX=p.x;a.prevY=p.y;
 if(shared()&&!remote)coopAction('progress');
}
function update(dt,p){
 const a=state();if(!a||a.complete||p.dead)return;
 a.clock+=dt;labBefore(dt,p);root.BladefallPrecisionWorkshop.before(dt,p);
 const r=a.rooms[a.room];
 a.gravityLeaseT=Math.max(0,(a.gravityLeaseT||0)-dt);
 const field=r.required.includes(r.i+':gravity');
 if(!field&&a.gravityLeaseT===0&&a.leaseActive){G.gravityFlipped=false;a.leaseActive=false;}
 G.flipUnlocked=field||a.gravityLeaseT>0;
 if(G.gravityFlipped!==a.prevFlip){mark(r.i+':gravity');a.prevFlip=G.gravityFlipped;}
 if(a.stage===44){
  // Side limits are physical edges, never an invisible restart trigger.
  if(p.x<r.x+p.w/2){p.x=r.x+p.w/2;p.vx=Math.max(0,p.vx);}
  if(p.x>r.x+r.width-p.w/2){p.x=r.x+r.width-p.w/2;p.vx=Math.min(0,p.vx);}
  if(p.y>(r.ceiling||850)){p.y=r.ceiling||850;p.vy=Math.max(0,p.vy);}
  if(p.y< -160){retry();return;}
 }else if(p.x<r.x-40||p.y< -160||p.y>850){retry();return;}
 a.prevX=p.x;a.prevY=p.y;a.wasSlam=p.slamming;
 a.wasHook=p.actHook&&p.actHook.ring;
 // Jump before arrival may be buffered: a tension catch accepts it for 0.12 seconds.
 if(keyPressedFor('jump'))a.jumpWindow=.12;else a.jumpWindow=Math.max(0,(a.jumpWindow||0)-dt);
 if(a.flight&&keyPressedFor('dash')){p.vx=a.flight.vx;p.vy=-a.flight.vy;a.flight=null;refill(p);}
 a.liftGrace=Math.max(0,a.liftGrace-dt);
 for(const o of G.obstacles){
  if(o.ceRoom!==a.room)continue;
  if(o.ceWeight&&o.ceArmed){
   const px=o.x,py=o.y;const atTop=o.ceT===1;
   if(shared()&&o.ceTopAge>.6)o.ceReturning=true;
   o.ceT=o.ceReturning?Math.max(0,o.ceT-dt):Math.min(1,o.ceT+dt/(G.stageIndex===42?1.05:1.3));
   if(o.ceReturning&&o.ceT===0){o.ceReturning=false;o.ceArmed=false;o.ceLaunchSpent=false;}
   o.ceTopAge=atTop?(o.ceTopAge||0)+dt:0;
   const t=o.ceT; o.x=o.ceHomeX+(o.ceToX-o.ceHomeX)*t;o.y=o.ceHomeY+(o.ceToY-o.ceHomeY)*t;
   if(p.floorPlat===o&&p.onGround){p.x+=o.x-px;p.y+=o.y-py;if(!o.ceReturning&&!o.ceLaunchSpent&&(o.ceT<1||o.ceTopAge<=.18)){const duration=G.stageIndex===42?1.05:1.3;a.liftGrace=.12;a.liftVx=(o.ceToX-o.ceHomeX)/duration;a.liftVy=(o.ceToY-o.ceHomeY)/duration;a.liftId=o.ceMark;}}
  }
  if(o.ceGate)o.gone=(a.stage===44||r.required.every(id=>a.used.includes(id)));
  if(o.ceBoundary)o.gone=!shared()&&!!a.roomLanded;
 }
}
function hitRect(p,o){return p.x+p.w/2>o.x-o.w/2&&p.x-p.w/2<o.x+o.w/2&&p.y+p.h>o.y&&p.y<o.y+o.h;}
function hot(o){const a=state();return !o.period||(a.clock+o.phase)%o.period<o.period*o.duty;}
function late(dt,p){
 const a=state();if(!a||a.complete||p.dead)return;
 const r=a.rooms[a.room];
 labLate(p);if(state().room!==r.i)return;
 root.BladefallPrecisionWorkshop.late(dt,p);
 if(p.seamRide)mark(p.seamRide.o.ceMark);
 if(p.actHook){mark(p.actHook.ring.ceMark);
  const h=p.actHook;if(h.ring.ceTension&&h.state==='hang'&&a.jumpWindow>0){
   mark(r.i+':tension');p.actHook=null;p.vx=510;p.vy=-540;p.jumpCutOk=false;p._ballisticT=.4;a.jumpWindow=0;refill(p);
  }
 }
 if(a.wasHook&&a.wasHook.ceTension&&!p.actHook&&p.vy< -120){mark(r.i+':tension');p.vx=510;p.vy=-540;p.jumpCutOk=false;p._ballisticT=.4;refill(p);}
 if(a.wasHook?.ceGravity&&!p.actHook){
  G.gravityFlipped=!G.gravityFlipped;a.gravityLeaseT=3;a.leaseActive=true;G.flipUnlocked=true;
 }
 if(a.liftGrace>0&&!p.onGround&&p.vy< -100){p.vx+=Math.max(800,Math.min(1000,a.liftVx*3.4));p.vy-=Math.max(300,Math.min(380,a.liftVy*1.5));p.jumpCutOk=false;p._ballisticT=1.6;mark(a.liftId);const lift=G.obstacles.find(o=>o.ceMark===a.liftId&&o.ceWeight);if(lift)lift.ceLaunchSpent=true;a.liftGrace=0;}
 if(r.required.includes(r.i+':portal')&&Math.abs(p.x-a.prevX)>250&&!p.seamRide&&!p.actHook){
  if(!a.used.includes(r.i+':portal')&&r.kind==='portal'){p.vx=820;p.vy=-220;p._ballisticT=.65;p.jumpCutOk=false;refill(p);}
  mark(r.i+':portal');
 }
 for(const o of G.obstacles){
  if(o.ceRoom!==a.room)continue;
  if(o.type==='ceGravityArch'&&hitRect(p,o)&&G.gravityFlipped===o.inverted)mark(o.ceMark);
  if(o.ceAnvil&&a.wasSlam&&Math.abs(p.x-o.x)<o.w/2+8&&a.prevY>=o.y-6&&p.y<=o.y+12){
   p.y=o.y+2;if(o.ceBrakeRebound)p.vx*=.25;p.vy=-1030;p.onGround=false;p.floorPlat=null;p.slamming=false;p.jumpCutOk=false;p._ballisticT=.6;refill(p);mark(o.ceMark);o.ceFlash=.3;a.anvilHits=(a.anvilHits||0)+1;
  }
  if(o.ceFlash>0)o.ceFlash-=dt;
  if(o.type==='ceGale'&&!o.ceSpent&&(!o.ceRefill||a.flight)&&Math.hypot(p.x-o.x,p.y+22-o.y)<42&&(!a.flight||a.flight.source!==o.x)){
   o.ceSpent=true;const duration=o.ceFlightTime||flightTime(a.stage);if(o.ceFlightTime)(a.flightReceipts||(a.flightReceipts=[])).push({x:o.x-r.x,remaining:a.flight?.t??null,capacity:duration,refill:!!o.ceRefill,at:a.clock,room:a.room});if(a.flight){a.flight.t=duration;a.flight.maxT=duration;a.flight.source=o.x;}else a.flight={x:r.flightCourse?o.x:p.x,y:r.flightCourse?o.y-22:p.y,vx:310,vy:0,speed:310,turn:0,trail:[],t:duration,maxT:duration,source:o.x};p.actHook=null;p.seamRide=null;G.gravityFlipped=false;refill(p);mark(o.ceMark);
  }
 }
 if(a.flight){
  const f=a.flight,d=dir(),brake=held('jump');f.speed+=( (brake?150:root.BladefallPrecisionWorkshop.flightSpeed())-f.speed)*(1-Math.exp(-12*dt));const speed=f.speed;
  let target=Math.atan2(d.y,d.x);if(Math.hypot(d.x,d.y)<.2)target=Math.atan2(f.vy,f.vx);
  target=root.BladefallPrecisionWorkshop.flightTarget(f,target,dt);
  let angle=Math.atan2(f.vy,f.vx),delta=Math.atan2(Math.sin(target-angle),Math.cos(target-angle));const desiredTurn=Math.max(-6,Math.min(6,delta*12));f.turn+=(desiredTurn-f.turn)*(1-Math.exp(-16*dt));angle+=f.turn*dt;
  f.vx=Math.cos(angle)*speed;f.vy=Math.sin(angle)*speed;f.x+=f.vx*dt;f.y+=f.vy*dt;f.t-=dt;f.trail.push({x:f.x,y:f.y+22});if(f.trail.length>9)f.trail.shift();
  root.BladefallPrecisionWorkshop.windFlight(dt,f);
  p.x=f.x;p.y=f.y;p.vx=f.vx;p.vy=-f.vy;p.onGround=false;p.floorPlat=null;p.slamming=false;p.jumpCutOk=false;
  if(f.t<=0){(a.flightEvents||(a.flightEvents=[])).push({kind:'expired',x:p.x-r.x,y:p.y,at:a.clock});a.flight=null;refill(p);}
 }
 for(const o of G.obstacles){if(o.ceRoom!==a.room)continue;
  if(o.type==='ceHazard'&&!o.gone&&hot(o)&&hitRect(p,o)){if(a.stage===44){root.BladefallPrecisionWorkshop.contact(p,o);continue;}retry();return;}
  if(a.flight&&o.type==='wall'&&!o.gone&&p.x+p.w/2>o.x-o.w/2&&p.x-p.w/2<o.x+o.w/2&&p.y+p.h>o.y-o.h&&p.y<o.y){if(a.stage===44){root.BladefallPrecisionWorkshop.contact(p,{...o,y:o.y-o.h});continue;}retry();return;}
 }
 if(a.stage===44&&!a.single&&!shared()&&p.x>r.end&&p.onGround&&(a.stage!==44||p.floorPlat?.ceRoom===r.i)&&!G.gravityFlipped&&(a.stage===44||r.required.every(id=>a.used.includes(id)))){
  if(a.room===(a.stage===44?root.BladefallPrecisionWorkshop.lastRoom():a.rooms.length-1))finish();else{const deaths=a.deaths;root.BladefallPrecisionWorkshop.select(root.BladefallPrecisionWorkshop.nextRoom(),false);a.deaths=deaths;}return;
 }
 if(p.x>r.end&&p.onGround&&(a.stage!==44||p.floorPlat?.ceRoom===r.i)&&(a.stage===44||r.required.every(id=>a.used.includes(id)))){a.roomLanded=true;if(shared()&&!a.ready){a.ready=true;coopAction('progress');return;}}
 if(p.x>(a.single||a.room===(a.stage===44?root.BladefallPrecisionWorkshop.lastRoom():a.rooms.length-1)?r.end:r.x+r.width+60)&&p.onGround&&(a.stage!==44||p.floorPlat?.ceRoom===r.i)&&!G.gravityFlipped&&(a.stage===44||r.required.every(id=>a.used.includes(id)))){
  if(shared())return;
  if(a.single||a.room===(a.stage===44?root.BladefallPrecisionWorkshop.lastRoom():a.rooms.length-1))finish();
  else{a.roomLanded=false;a.gravityLeaseT=0;a.leaseActive=false;a.room++;a.checkpoint=a.rooms[a.room].x+120;a.clock=0;a.used=[];if(a.stage===44){a.lab=null;root.BladefallPrecisionWorkshop.reset();}G.gravityFlipped=false;a.prevFlip=false;refill(p);}
 }
}
function swing(p){
 const a=state();if(!a)return;
 for(const o of G.obstacles){
  if(o.ceRoom!==a.room||o.type!=='ceBlade'||o.ceSpent||p.swingHits.includes(o))continue;
  const horizontal=Math.abs(p.x-o.x)<o.w/2+10;
  const down=p.pogoSwing&&o.ceBlade==='pogo'&&p.y>=o.y+o.h/2-10&&p.y<=o.y+o.h/2+56;
  const up=p.upSlashSwing&&o.ceBlade==='uppercut'&&o.y>=p.y+p.h-10&&o.y<=p.y+p.h+64;
  if(!horizontal||(!down&&!up))continue;
  p.swingHits.push(o);o.ceSpent=true;o.ceFlash=.3;mark(o.ceMark);
  bladePogo(p,down?650:760);p.upSlashSwing=false;p._ballisticT=.18;refill(p);
  break; // A strike connects with exactly one target; no stacked-hit launches.
 }
 for(const o of G.obstacles){if(o.ceWeight&&o.ceRoom===a.room&&!o.ceArmed&&Math.abs(p.x-o.x)<130&&Math.abs(p.y-o.y)<90){o.ceArmed=true;if(shared())coopAction('arm',o.ceMark);}}}
for(const stage of [41,42,44])A2.register(stage,{level:()=>level(stage),update,lateUpdate:late,swing,voidFloor:()=>-1000,cameraFloor:()=>70,cameraCeiling:()=>state()?.rooms[state().room].cameraHigh||state()?.rooms[state().room].required.some(id=>/pogo|uppercut/.test(id))?650:100});
function start(stage){if(typeof coopActive==='function'&&coopActive()){if(NET.isHost())coopStartRun('select',stage);else openCoop();}else beginRun(0,null,{hp:1,dmg:1},{startStage:stage,levelSelect:true});}
function menu(){
 if(shared())coopQuitJourney();
 mode='celeste-menu';
 showOvHTML('<div class="card"><h1 class="ovh">Precision Courses</h1><p class="ovsub">Tears, iron, wind, and the returning blade.</p><button class="choice" id="cePrecisionCore"><div class="cname">Precision Core · new physics</div><div class="cdesc">A separate engine built for puzzle platforming: integer pixels, one dash, one screen per room. Nine chapters of rooms that ask a question before they test your hands.</div></button><button class="choice" id="ceCombatRooms"><div class="cname">Part IV · Foes</div><div class="cdesc">Twenty levels in the new physics: pogo, parry, redirect, bait and stun. Enemies become part of the route.</div></button><button class="choice" id="ceStandard"><div class="cname">Celeste Standard</div><div class="cdesc">New dash foundry, nine lessons, then nine combined challenges. A checkpoint after every room.</div></button><button class="choice" id="ceFractured"><div class="cname">Fractured Celeste</div><div class="cdesc">Nine integrated trials, including aerial blade relays. Narrower anvils, faster counterweights, shorter flight, and timed landings.</div></button><button class="choice" id="ceFracturedWorkshop"><div class="cname">Workshop · Base &amp; Fractured</div><div class="cdesc">Ten new candidates and separate banks for approved base and fractured rooms.</div></button><button class="bigbtn ghost" id="ceBack">Back</button></div>');
 document.getElementById('cePrecisionCore').onclick=()=>{location.href='precision.html';};
 document.getElementById('ceCombatRooms').onclick=()=>{location.href='precision.html?combat=1';};
 document.getElementById('ceStandard').onclick=()=>start(41);
 document.getElementById('ceFractured').onclick=()=>start(42);
 
 document.getElementById('ceFracturedWorkshop').onclick=()=>root.BladefallPrecisionWorkshop.menu(true);
 document.getElementById('ceBack').onclick=titleScreen;
}
root.BladefallCeleste=Object.freeze({menu,start,mark,level,active,state,retry,hot,lab,labState,labCanDash,labStart,labVelocity,coopSnapshot,coopReceive,courses,WIDTH,flightTime,roomWidth});
})(typeof window!=='undefined'?window:globalThis);
