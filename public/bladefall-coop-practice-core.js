/* Dedicated shared puzzles. The host owns both native knights and all machinery.
   Campaign co-op remains independent; this engine never touches campaign saves. */
(function(root){
'use strict';
const C=()=>root.BladefallPrecisionCore;
const names=['Counterweight Exchange','Portal Relay','Two-Sided Brake','Shield and Blade','Lift and Release','Split Information','Partner Rescue','Tandem Gate'];
const near=(p,x,y,r=24)=>Math.hypot(p.x+4-x,p.y+6-y)<r;
const overlap=(p,b)=>p.x<b.x+b.w&&p.x+p.w>b.x&&p.y<b.y+b.h&&p.y+p.h>b.y;
function mapRoom(index){
 const m=Array.from({length:45},()=>Array(80).fill('.'));
 const rect=(x,y,w,h,ch='#')=>{for(let r=y;r<y+h;r++)for(let c=x;c<x+w;c++)m[r][c]=ch;};
 rect(0,0,80,1);rect(0,1,1,44);rect(79,1,1,44);rect(0,43,80,2);rect(1,42,78,1,'^');
 if(index===0){
  rect(1,41,34,2);rect(35,17,1,26);rect(34,17,1,24,'<');
  rect(46,16,34,2);rect(36,17,1,26,'>');
 }else if(index===1){rect(1,41,52,2);rect(54,17,25,26);}
 else if(index===2){rect(1,36,24,7);rect(55,36,24,7);rect(37,39,10,1);}
 else if(index===3){rect(1,38,78,5);rect(1,34,60,1);}
 else if(index===4){rect(1,41,21,2);rect(55,19,24,24);}
 else if(index===5){rect(1,41,78,2);}
 else if(index===6){rect(1,20,23,1);rect(36,20,8,1);rect(72,20,7,1);}
 else if(index===7){rect(1,40,11,3);rect(14,37,5,1);rect(21,34,5,1);rect(28,31,7,1);rect(55,31,6,1);rect(71,20,8,1);rect(67,1,1,33);rect(64,38,6,1);rect(65,37,2,1,'s');rect(38,27,4,1);}
 m[40][8]='P';
 return {id:'coop-practice-'+index,name:names[index],cols:80,rows:45,map:m.map(r=>r.join('')),exit:'none',movement:'survive-2',aim8:true,dashes:1,lock:['portal','parry'],study:false};
}
function body(id,x,y,w,h){return {id,type:'coop-platform',dev:true,practice:true,solid:true,x,y,w,h};}
function create(index=0,roles=0){
 if(!Number.isInteger(index)||index<0||index>7)throw new Error('Practice room is still being authored');
 const def=mapRoom(index),s={index,roles,frame:0,epoch:0,deaths:0,complete:false,paused:false,prev:[{},{}],events:[],games:[C().createGame([def]),C().createGame([def])],bodies:[],puzzle:{latched:false},lantern:{x:104,y:316,w:10,h:12,held:-1,vx:0,vy:0}};
 const operator=roles%2,rider=1-operator;s.operator=operator;s.rider=rider;
 Object.assign(s.games[operator].p,{x:64,y:317});Object.assign(s.games[rider].p,{x:308,y:301});
 s.bodies=[body('cage',296,312,48,8),body('return',240,312,32,8)];
 if(index===1){Object.assign(s.games[rider].p,{x:288,y:317});s.bodies=[body('partition-a',216,8,8,320),body('partition-b',424,8,8,320),body('return-a',160,328,32,8),body('return-b',360,328,32,8)];s.puzzle.portals=[false,false];s.lantern.x=104;s.lantern.cooldown=0;}
 if(index===2){Object.assign(s.games[operator].p,{x:64,y:277});Object.assign(s.games[rider].p,{x:560,y:277,facing:-1});s.lantern=null;s.puzzle={brake:0,timer:0,latched:false};s.bodies=[body('brake-left',200,8,8,336),body('brake-right',432,8,8,336),body('brake-step-b',392,264,40,8),body('brake-mid',328,240,64,8),body('brake-step-a1',216,272,40,8),body('brake-step-a2',280,248,32,8)];for(const b of s.bodies)if(b.id.startsWith('brake-step')||b.id==='brake-mid')b.solid=false;}
 if(index===3){Object.assign(s.games[operator].p,{x:128,y:293,facing:-1});Object.assign(s.games[rider].p,{x:176,y:293});s.lantern=null;s.bodies=[];s.puzzle={latched:false,shield:false,blocked:0};s.bolts=[];}
 if(index===4){Object.assign(s.games[operator].p,{x:108,y:317});Object.assign(s.games[rider].p,{x:300,y:301});s.lantern=null;s.bodies=[body('launch',280,312,48,8),body('operator-return',136,328,32,8),body('operator-door',184,8,8,336)];s.puzzle={latched:false,charge:0,held:false,released:false};}
 if(index===5){Object.assign(s.games[operator].p,{x:108,y:317});Object.assign(s.games[rider].p,{x:288,y:317});s.lantern=null;s.bodies=[body('clue-grille',216,8,8,336),body('sequence-gate',528,8,8,336)];s.puzzle={latched:false,shutter:false,shutterGrace:0,clue:[2,0,1],entered:[],mistakes:0};}
 if(index===6){Object.assign(s.games[operator].p,{x:108,y:149});Object.assign(s.games[rider].p,{x:304,y:149});s.lantern=null;s.bodies=[body('catch-basket',344,368,64,8)];s.puzzle={latched:false,raised:0,key:false,carrier:-1,portal:false,returned:[]};}
 if(index===7){Object.assign(s.games[operator].p,{x:48,y:309});Object.assign(s.games[rider].p,{x:584,y:149,facing:-1});s.lantern=null;s.bodies=[body('tandem-gate',304,8,32,208)];s.puzzle={latched:false,locks:[false,false],charge:0};}
 syncBodies(s);return s;
}
function syncBodies(s){for(const g of s.games)g.ents=[...g.ents.filter(e=>!e.practice),...s.bodies.map(b=>({...b}))];}
function moveBody(s,b,x,y){
 b.subX=x;b.subY=y;x=Math.round(x);y=Math.round(y);
 const dx=x-b.x,dy=y-b.y;if(!dx&&!dy)return;
 // Carry each rider exactly once. Both native worlds receive the same final body.
 for(const g of s.games){const p=g.p,old=g.ents.find(e=>e.practice&&e.id===b.id);if(!old)continue;
  if(Math.abs(p.y+p.h-b.y)<1&&p.x+p.w>b.x&&p.x<b.x+b.w){
   old.solid=false;C().moveX(g,p,dx,()=>C().kill(g,p,'crush'));C().moveY(g,p,dy,()=>C().kill(g,p,'crush'));old.solid=true;
   p.liftX=dx*60;p.liftY=dy*60;p.liftTimer=10;
  }
 }
 b.x=x;b.y=y;
}
function carryTo(s,b,y,speed){if(s.games.some(g=>Math.abs(g.p.y+g.p.h-b.y)<1&&g.p.x+g.p.w>b.x&&g.p.x<b.x+b.w))b.engaged=true;if(b.engaged)moveBody(s,b,b.x,Math.max(y,(b.subY??b.y)-speed));}
function reset(s){const n=create(s.index,s.roles);n.deaths=s.deaths+1;n.epoch=s.epoch+1;Object.assign(s,n);s.events.push({type:'shared-reset',epoch:s.epoch});}
function step(s,inputs=[{},{}]){
 if(s.paused||s.complete)return;s.frame++;s.events=[];
 const presses=inputs.map((x,i)=>({use:!!x.use&&!s.prev[i].use,reset:!!x.reset&&!s.prev[i].reset,portal:!!x.portal&&!s.prev[i].portal,strike:!!x.strike&&!s.prev[i].strike}));
 if(presses.some(p=>p.reset)){reset(s);s.prev=inputs.map(x=>({...x}));return;}
 const l=s.lantern;
 if(l){
 for(let i=0;i<2;i++)if(presses[i].use){const p=s.games[i].p;
  if(l.held===i){l.held=-1;l.x=p.x+(p.facing>0?12:-14);l.y=p.y;l.vx=p.facing*(s.index===1?180:40);l.vy=s.index===1?-70:-30;}
  else if(l.held<0&&near(p,l.x+5,l.y+6,24)){l.held=i;l.vx=l.vy=0;}
  else if(s.index===0&&near(p,408,115,28)){s.puzzle.latched=true;s.events.push({type:'return-latched'});}
 }
 if(s.index===1)for(let i=0;i<2;i++)if(presses[i].portal){const slot=i===s.operator?0:1;if(near(s.games[i].p,slot?396:188,304,48)){s.puzzle.portals[slot]=!s.puzzle.portals[slot];s.events.push({type:'portal-pair',player:i,slot,active:s.puzzle.portals[slot]});}}
 if(l.cooldown>0)l.cooldown--;
 if(l.held<0){
  l.vy=Math.min(180,l.vy+15);l.x+=l.vx/60;l.y+=l.vy/60;l.vx*=s.index===1?.995:.9;
  // The lower yard is the recovery tray; a missed placement is never lost.
  const floor=s.index===1&&l.x>=432?136:328;if(l.y+12>=floor){l.y=floor-12;l.vy=0;l.vx*=.9;}
  if(s.index===0)l.x=Math.max(16,Math.min(262,l.x));
  else{
   if(!l.cooldown&&s.puzzle.portals[0]&&l.x+10>=192&&l.x<216&&l.y+12>276&&l.y<324){l.x=248;l.y=220;l.vx=100;l.vy=-30;l.cooldown=15;s.events.push({type:'lantern-portal',slot:0});}
   else if(!l.cooldown&&s.puzzle.portals[1]&&l.x+10>=400&&l.x<424&&l.y+12>276&&l.y<324){l.x=480;l.y=96;l.vx=180;l.vy=-30;l.cooldown=15;s.events.push({type:'lantern-portal',slot:1});}
   if(l.x<432){if(l.x+10>216&&l.x<224){l.x=200;l.vx=0;}if(l.x+10>424&&l.x<432){l.x=408;l.vx=0;}}
   l.x=Math.max(16,Math.min(614,l.x));
   if(l.x>=528&&l.x<=580&&l.y+12>=135&&!s.puzzle.latched){s.puzzle.latched=true;s.events.push({type:'relay-received'});}
  }
 }
 }
 if(s.index===0){
  const weighted=l.held<0&&l.x+10>=216&&l.x<=256&&l.y+12>=326;
  s.puzzle.weighted=weighted;s.puzzle.returnWeighted=l.held<0&&l.x+10>=96&&l.x<=136&&l.y+12>=326;
  const cage=s.bodies[0],ret=s.bodies[1];
  moveBody(s,cage,cage.x,Math.max(128,Math.min(312,(cage.subY??cage.y)+(weighted?-1.4:1))));
  if(s.puzzle.latched&&s.puzzle.returnWeighted)carryTo(s,ret,128,1.4);
  if(s.puzzle.latched&&!s.bodies.some(b=>b.id==='bridge'))s.bodies.push(body('bridge',272,128,96,8));
 }
 if(s.index===1&&s.puzzle.latched){
  for(const b of s.bodies)if(b.id.startsWith('partition'))b.solid=false;else if(b.id.startsWith('return-'))carryTo(s,b,128,1.4);
  if(!s.bodies.some(b=>b.id==='bridge'))s.bodies.push(body('bridge',192,128,168,8),body('bridge-b',392,128,40,8));
 }
 if(s.index===2)updateBrake(s,presses);
 if(s.index===3)updateShield(s,inputs,presses);
 if(s.index===4)updateLaunch(s,inputs,presses);
 if(s.index===5)updateClue(s,inputs,presses);
 if(s.index===6)updateRescue(s,inputs,presses);
 if(s.index===7)updateTandem(s);
 syncBodies(s);
 for(let i=0;i<2;i++){
  const g=s.games[i];g.events=[];const launch=s.index===4&&s.puzzle.held&&s.bodies.find(b=>b.id==='launch'),riding=launch&&Math.abs(g.p.y+g.p.h-launch.y)<2&&g.p.x+g.p.w>launch.x&&g.p.x<launch.x+launch.w;C().step(g,(s.index===3&&s.puzzle.shield===i+1||s.index===4&&s.puzzle.held&&i===s.operator||s.index===5&&s.puzzle.shutter&&i===s.operator&&!s.puzzle.latched)?{}:riding?{...inputs[i],jump:false}:inputs[i]);
  for(const e of g.events)s.events.push({...e,player:i});
  if(l&&l.held===i){l.x=g.p.x;l.y=g.p.y-12;}
 }
 if(s.games.some(g=>g.p.state==='dead'||g.deaths)){reset(s);s.prev=inputs.map(x=>({...x}));return;}
 if(s.index===7?s.puzzle.latched&&s.games.every(g=>g.p.onGround&&near(g.p,320,205,24)):s.index===2?s.puzzle.brake===2&&s.games.every(g=>g.p.onGround&&near(g.p,356,229,28)):s.puzzle.latched&&s.games.every(g=>g.p.onGround&&g.p.x>=560&&g.p.y<(s.index===3?304:s.index===4?152:s.index===5?328:s.index===6?160:128))){s.complete=true;s.events.push({type:'room-complete',room:s.index});}
 s.prev=inputs.map(x=>({...x}));
}
function updateTandem(s){
 const q=s.puzzle;q.locks=[[240,248],[456,248]].map(([x,y])=>s.games.some(g=>g.p.onGround&&Math.abs(g.p.y+g.p.h-y)<1&&Math.abs(g.p.x+4-x)<20));
 if(q.latched)return;q.charge=q.locks.every(Boolean)?Math.min(90,q.charge+1):Math.max(0,q.charge-2);
 if(q.charge===90){q.latched=true;s.bodies[0].solid=false;s.bodies.push(body('lock-bridge-a',280,232,24,8),body('lock-bridge-b',336,232,104,8));s.events.push({type:'tandem-open'});}
}
function updateRescue(s,inputs,presses){
 const q=s.puzzle,b=s.bodies[0],op=s.games[s.operator].p;
 if(inputs[s.operator].use&&near(op,112,155,24)){q.raised=Math.min(80,q.raised+1.6);moveBody(s,b,344,368-q.raised);}
 for(let i=0;i<2;i++)if(!q.key&&near(s.games[i].p,364,264,18)){q.key=true;q.carrier=i;s.events.push({type:'rescue-key',player:i});}
 if(presses[s.operator].portal&&near(op,112,155,24)&&q.key&&q.raised>=80){q.portal=true;q.latched=true;s.events.push({type:'rescue-portal'});}
 if(q.portal)for(let i=0;i<2;i++){const g=s.games[i],p=g.p;if(overlap(p,{x:360,y:252,w:24,h:36})){Object.assign(p,{x:584,y:149,vx:0,vy:0,remX:0,remY:0,liftTimer:0,state:'normal',dashes:p.maxDashes});if(!q.returned.includes(i))q.returned.push(i);s.events.push({type:'rescue-return',player:i});}}
}
function updateClue(s,inputs,presses){
 const q=s.puzzle,holding=!!inputs[s.operator].use&&near(s.games[s.operator].p,112,323,24);q.shutterGrace=holding?15:Math.max(0,(q.shutterGrace||0)-1);q.shutter=holding||q.shutterGrace>0;
 if(q.latched)return;
 if(!q.shutter){q.entered=[];return;}
 for(let i=0;i<2;i++)if(presses[i].use){const p=s.games[i].p;const button=[296,376,456].findIndex(x=>near(p,x,323,20));if(button<0)continue;
  if(button===q.clue[q.entered.length]){q.entered.push(button);s.events.push({type:'sequence-note',symbol:button});}
  else{q.entered=[];q.mistakes++;s.events.push({type:'sequence-miss'});}
  if(q.entered.length===3){q.latched=true;for(const b of s.bodies)b.solid=false;s.events.push({type:'shutter-open'});}
 }
}
function updateLaunch(s,inputs,presses){
 const q=s.puzzle,b=s.bodies.find(b=>b.id==='launch'),op=s.games[s.operator].p;
 const held=!!inputs[s.operator].use&&near(op,112,323,24)&&!q.latched;
 if(held){q.charge=Math.min(1,q.charge+.025);q.released=false;moveBody(s,b,280+64*q.charge,312-112*q.charge);}
 else if(q.held){
  q.released=true;for(const g of s.games){const p=g.p;if(Math.abs(p.y+p.h-b.y)<2&&p.x+p.w>b.x&&p.x<b.x+b.w){p.state='normal';p.vx=160;p.vy=-235;p.varJump=12;p.varJumpSpeed=-235;p.autoJump=true;p.liftTimer=0;p.jumpGrace=0;p.onGround=false;s.events.push({type:'lift-release',x:p.x,y:p.y});}}
 }
 else if(q.charge>0){q.charge=Math.max(0,q.charge-.015);moveBody(s,b,280+64*q.charge,312-112*q.charge);}
 q.held=held;
 for(let i=0;i<2;i++)if(presses[i].use&&near(s.games[i].p,520,141,25)){q.latched=true;s.events.push({type:'launch-return'});}
 if(q.latched){s.bodies.find(b=>b.id==='operator-door').solid=false;const r=s.bodies.find(b=>b.id==='operator-return');carryTo(s,r,152,1.6);if(!s.bodies.some(b=>b.id==='bridge'))s.bodies.push(body('bridge',168,152,288,8));}
}
function updateShield(s,inputs,presses){
 s.puzzle.shield=false;
 for(let i=0;i<2;i++){const p=s.games[i].p;
  if(inputs[i].parry&&near(p,132,299,18)&&p.onGround){s.puzzle.shield=i+1;s.puzzle.shieldDir=inputs[i].r?1:inputs[i].l?-1:p.facing;p.vx=0;p.facing=s.puzzle.shieldDir;}
  if(presses[i].strike&&p.x>512&&near(p,516,293,28)&&(inputs[i].l||p.facing<0)){s.puzzle.latched=true;s.bolts=[];s.events.push({type:'tether-cut'});}
 }
 if(s.puzzle.latched)return;
 if(s.frame%4===1)for(const y of [284,296])s.bolts.push({x:24,y,w:6,h:6});
 for(const b of s.bolts){const old=b.x;b.x+=10;
  if(s.puzzle.shield&&s.puzzle.shieldDir<0&&old<=124&&b.x+6>=124){b.gone=true;s.puzzle.blocked++;continue;}
  for(const g of s.games)if(overlap(g.p,b)){C().kill(g,g.p,'bolt');b.gone=true;}
 }
 s.bolts=s.bolts.filter(b=>!b.gone&&b.x<632);
}
function updateBrake(s,presses){
 if(s.puzzle.timer>0)s.puzzle.timer--;
 for(let i=0;i<2;i++)if(presses[i].strike){const p=s.games[i].p;
  if(near(p,160,270,25)&&p.facing>0){s.puzzle.brake=1;s.puzzle.timer=360;s.events.push({type:'brake-open',side:'right'});}
  if(near(p,352,224,25)){s.puzzle.brake=2;s.puzzle.timer=360;s.events.push({type:'brake-open',side:'left'});}
 }
 for(const b of s.bodies){
  const on=b.id==='brake-left'?!(s.puzzle.brake===2&&s.puzzle.timer):b.id==='brake-right'?!(s.puzzle.brake===1&&s.puzzle.timer):b.id==='brake-mid'?s.puzzle.brake>0:b.id==='brake-step-b'?s.puzzle.brake===1&&s.puzzle.timer:s.puzzle.brake===2&&s.puzzle.timer;
  b.solid=!!on;if(b.id==='brake-left'||b.id==='brake-right')b.solid=b.solid&&!s.games.some(g=>overlap(g.p,b));
 }
}
function view(s,player=0){const puzzle={...s.puzzle};if(s.index===5&&!(player===s.operator&&near(s.games[player].p,112,323,32)))delete puzzle.clue;return {index:s.index,name:names[s.index],frame:s.frame,epoch:s.epoch,deaths:s.deaths,complete:s.complete,paused:s.paused,player,roles:s.roles,map:s.games[0].room.def.map,players:s.games.map(g=>({x:g.p.x,y:g.p.y,w:g.p.w,h:g.p.h,vx:g.p.vx,vy:g.p.vy,f:g.p.facing,state:g.p.state,dashes:g.p.dashes})),bodies:s.bodies.map(b=>({...b})),bolts:(s.bolts||[]).map(b=>({...b})),lantern:s.lantern?{...s.lantern}:null,puzzle};}
root.BladefallCoopPracticeCore={names,create,step,reset,view};
})(globalThis);
