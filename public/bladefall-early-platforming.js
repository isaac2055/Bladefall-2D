/* The opening road's movement vocabulary. Session-only geometry; no later abilities.
   Carrier paths are repeatable world-time cycles. Launch/strike receipts belong to each knight. */
(function(root){
'use strict';
const ROOMS={
 // 7.233 (owner): no crossing in the Outskirts — the knight is only learning to jump there.
 // The Black Woods teach the up-strike alone: one blade over a short pit, then three in a row
 // over a long one (pits authored in LEVELS[1]). Down-blades belong to later regions.
 1:{name:'The resin latches',start:4400,end:6820,spawn:[4400,0],carriers:[],landings:[],blades:[[4600,115,'up',600],[6290,115,'up',600],[6460,115,'up',600],[6630,110,'up',600]],teach:'blade-0'},
 // The counterweight lift is introduced here, over a real void (authored in LEVELS[2]); no walkway under it.
 2:{name:'The freight crossing',finishY:260,start:8330,end:9230,spawn:[8420,65],carriers:[[8520,65,8790,200,140,.7]],landings:[],blades:[]},
 21:{name:'The broken cradle road',start:3870,end:5030,cut:[4050,4930],spawn:[3930,0],carriers:[[4010,0,4220,90,76,.65],[4530,90,4700,150,68,.65]],landings:[[4510,90,64]],blades:[]},
 22:{name:'The blade canopy',start:3810,end:4870,cut:[3950,4700],spawn:[3860,0],carriers:[],landings:[[4750,110,92]],blades:[[4020,120,'up',650],[4150,130,'down',650],[4330,210,'up',680],[4510,200,'down',650]]},
 25:{name:'The counterweight relay',start:6480,end:7750,cut:[6600,7410],spawn:[6500,0],carriers:[[6560,0,6800,120,86,.7],[7100,170,7250,270,72,.65]],landings:[[7080,170,66],[7520,220,200]],blades:[]}
};
const active=()=>typeof G!=='undefined'&&!!G&&!!ROOMS[G.stageIndex];
function plate(x,y,w,extra={}){return {type:'plat',x,y,w,h:14,earlyPlatform:true,...extra};}
function install(){
 // Dress the actual first-road footholds without adding a later ability or changing a collider.
 if(G.stageIndex===0){for(const o of G.obstacles.slice())if(o.type==='plat'&&o.y>0&&o.w<=260&&o.x<6900&&!o.returnHook&&!o.optional)G.obstacles.push({type:'earlyDressing',earlyPlatform:true,x:o.x,y:o.y,w:o.w,h:55,source:o});}
 if(!active())return;
 const r=ROOMS[G.stageIndex],hard=G.stageIndex>20;
 // Clip support to the crossing rather than masking it with an invisible receipt gate.
 const next=[];
 if(r.cut)for(const o of G.obstacles){
  if(o.sideStory||o.type!=='plat'||o.ceiling||o.gate||o.x+o.w/2<=r.cut[0]||o.x-o.w/2>=r.cut[1]){next.push(o);continue;}
  const left=o.x-o.w/2,right=o.x+o.w/2;
  if(left<r.cut[0])next.push({...o,x:(left+r.cut[0])/2,w:r.cut[0]-left});
  if(right>r.cut[1])next.push({...o,x:(right+r.cut[1])/2,w:right-r.cut[1]});
 }
 if(r.cut)G.obstacles=next;
 r.carriers.forEach(([x,y,tx,ty,w,duration],i)=>G.obstacles.push(plate(x,y,w,{earlyCarrier:true,earlyId:'carrier-'+i,homeX:x,homeY:y,toX:tx,toY:ty,duration,phase:0,cycle:0})));
 r.landings.forEach(([x,y,w])=>G.obstacles.push(plate(x,y,w)));
 r.blades.forEach(([x,y,direction,speed],i)=>G.obstacles.push({type:'earlyBlade',earlyPlatform:true,earlyId:'blade-'+i,x,y,w:hard?30:48,h:24,direction,speed}));
 // 7.233 (owner): no return walkway under a crossing (it "completely negates the risk"), no
 // sign and no local retry — a fall is a fall, recovered from the knight's own flag.
 // Old canopy enemies cannot stand on removed scaffolding. Keep their encounters on the supported road beyond it.
 if(r.cut&&[22].includes(G.stageIndex)){let n=0;for(const e of G.enemies||[]){if(e.boss||e.x<r.cut[0]||e.x>r.cut[1])continue;const x=r.end+300+n++*150,dx=x-e.x,flying=e.type==='flyer'||e.type==='canopywing',y=flying?260:0;Object.assign(e,{x,spawnX:x,safeX:x,y,safeY:y,baseY:y,recallHomeY:y,patrolMin:(e.patrolMin??e.x-100)+dx,patrolMax:(e.patrolMax??e.x+100)+dx});}}
 G.earlyPlatforming={room:r,hard,used:{},clock:0,armed:false,grace:0,retries:0,completed:false};
}
function openReturn(){if(!active()||G.stageIndex>2)return;const id='early-return-'+G.stageIndex;if(typeof coopActive==='function'&&coopActive()&&NET.isGuest()){netSend({t:'earlyReturn',stage:G.stageIndex,x:G.p.x,y:G.p.y});return;}if(markPersistentCircuitOpen(id,'maintenance-return'))persist();}
function receive(m){if(m.t!=='earlyReturn'||!active()||G.stageIndex>2||m.stage!==G.stageIndex||!NET.isHost())return;const r=ROOMS[G.stageIndex],g=NET.ghost;if(!g||g.stage!==G.stageIndex||Math.abs(g.x-m.x)>260||Math.abs(g.y-m.y)>160||m.x<r.end-20||m.x>r.end+600||m.y<(r.finishY||0)-4)return;openReturn();}
function motion(o,time){
 const rest=.65,top=.18,back=1.2,period=rest+o.duration+top+back;
 const clock=((time%period)+period)%period,cycle=Math.floor(time/period);
 let f=0,charged=false;
 if(clock>=rest&&clock<rest+o.duration){f=(clock-rest)/o.duration;charged=clock>=rest+o.duration-.12;}
 else if(clock>=rest+o.duration&&clock<rest+o.duration+top){f=1;charged=true;}
 else if(clock>=rest+o.duration+top)f=1-(clock-rest-o.duration-top)/back;
 return {x:o.homeX+(o.toX-o.homeX)*f,y:o.homeY+(o.toY-o.homeY)*f,charged,cycle};
}
function tick(dt){if(!active()||!G.earlyPlatforming)return;const a=G.earlyPlatforming;a.clock+=dt;if(a.clockError){const n=Math.sign(a.clockError)*Math.min(Math.abs(a.clockError),dt*.2);a.clock+=n;a.clockError-=n;}}
function syncClock(clock){if(!active()||!G.earlyPlatforming||!Number.isFinite(clock))return;const a=G.earlyPlatforming;if(!a.clockSynced){a.clock=clock;a.clockSynced=true;}else a.clockError=clock-a.clock;}
function before(dt,p){
 if(!active()||!G.earlyPlatforming||p.dead)return;
 const a=G.earlyPlatforming,r=a.room;
 a.grace=Math.max(0,a.grace-dt);
 if(p.x>=r.start&&p.x<r.end)a.armed=true;
 for(const o of G.obstacles){
  if(!o.earlyCarrier)continue;
  const locked=o.earlyQuest&&BladefallSideStories.row(BladefallSideStoryWorld.state(),o.earlyQuest).step===0;
  if(p.onGround&&Math.abs(p.y-o.y)<6&&Math.abs(p.x-o.x)<o.w/2-8)p.floorPlat=o;
  let m=locked?{x:o.homeX,y:o.homeY,charged:false,cycle:0}:motion(o,a.clock);
  // The freight lift answers a knight waiting on its far landing (7.233): it rises to the top
  // and holds there, so the mandatory westward return is a drop onto it, not a timing trick.
  // It only helps someone already across; the eastbound launch is untouched.
  if(!o.earlyQuest&&G.stageIndex===2){
   if(p.onGround&&p.floorPlat?.freightLanding)a.calling=true;
   else if(p.onGround&&p.floorPlat!==o)a.calling=false;
   o.callBlend=Math.max(0,Math.min(1,(o.callBlend||0)+(a.calling&&p.floorPlat!==o?dt/.8:-dt/1.4)));
   if(o.callBlend>0){const k=o.callBlend*o.callBlend*(3-2*o.callBlend);m={x:m.x+(o.toX-m.x)*k,y:m.y+(o.toY-m.y)*k,charged:false,cycle:m.cycle};}
  }
  const dx=m.x-o.x,dy=m.y-o.y;o.x=m.x;o.y=m.y;o.charged=m.charged;o.cycle=m.cycle;
  if(p.onGround&&p.floorPlat===o){
   p.x+=dx;p.y+=dy;
   if(m.charged&&a.used[o.earlyId]!==m.cycle){a.grace=.12;a.carrier=o;a.vx=(o.toX-o.homeX)/o.duration;a.vy=(o.toY-o.homeY)/o.duration;}
  }
 }
 if(a.armed&&!a.completed&&p.x>=r.end-20&&p.onGround&&p.y>=(r.finishY||0)-4)a.completed=true;
}
// No local retries (owner 7.233: "never any auto-checkpoints beyond the start of every new level").
function retryAvailable(){return false;}
function retry(){return false;}
function legacyRetry(){
 if(!active()||!G.earlyPlatforming)return false;
 const a=G.earlyPlatforming;if(!a.armed||a.completed||G.p.x<a.room.start-40||G.p.x>a.room.end+40)return false;
 const [x,y]=a.room.spawn,p=G.p;a.used={};a.grace=0;a.retries++;
 Object.assign(p,{x,y,vx:0,vy:0,jumps:0,onGround:false,floorPlat:null,jumpBuf:0,slamming:false,pogoSwing:false,upSlashSwing:false,bladeChordT:0,atkCd:0,swingT:0,_ballisticT:0,dodgeTimer:0,invuln:Math.max(p.invuln||0,.3)});
 return true;
}
function late(dt,p){
 if(!active()||!G.earlyPlatforming)return;
 const a=G.earlyPlatforming;
 if(a.grace>0&&!p.onGround&&p.vy< -100){
  p.vx+=a.vx;p.vy-=a.vy;p.jumpCutOk=false;p._ballisticT=1;
  a.used[a.carrier.earlyId]=a.carrier.cycle;a.grace=0;
 }
}
function bladeAvailable(){return active()&&G.p?.weapon?.cls==='melee'&&G.obstacles.some(o=>o.type==='earlyBlade'&&Math.abs(o.x-G.p.x)<180&&Math.abs(o.y-G.p.y)<220);}
function swing(p){
 if(!active()||!G.earlyPlatforming)return;
 const a=G.earlyPlatforming;
 for(const o of G.obstacles){
  if(o.type!=='earlyBlade'||p.swingHits.includes(o)||(a.used[o.earlyId]||0)>G.time)continue;
  const horizontal=Math.abs(p.x-o.x)<o.w/2+12;
  const down=p.pogoSwing&&o.direction==='down'&&p.y>=o.y-10&&p.y<=o.y+65;
  const up=p.upSlashSwing&&o.direction==='up'&&o.y>=p.y+p.h-10&&o.y<=p.y+p.h+64;
  if(!horizontal||(!down&&!up))continue;
  p.swingHits.push(o);a.used[o.earlyId]=G.time+.6;
  if(o.direction==='up'&&G.stageIndex===1&&typeof meta!=='undefined'&&!meta.upStrikeTaught){meta.upStrikeTaught=true;if(typeof persist==='function')persist();}
  p.vy=-o.speed;p.onGround=false;p.floorPlat=null;p.jumpCutOk=false;p.slamming=false;p.pogoSwing=false;p.upSlashSwing=false;p.swingT=0;p.atkCd=.20;
  // Launch is a device impulse. It does not grant another jump, dash or enemy-pogo ability.
  break;
 }
}
function draw(c,o){
 if(!o.earlyPlatform)return false;
 if(o.earlyBridge&&!circuitOpen(o.gate))return true;
 const x=o.x,y=GROUND_Y-o.y,a=G.earlyPlatforming;
 c.save();
 if(o.type==='earlyDressing'){
  const w=o.w,crack=o.source.crT?1-o.source.crT/(o.source.crDur||.45):0;if(o.source.gone){c.restore();return true;}
  c.fillStyle='#4c5242';c.fillRect(x-w/2,y+3,w,8);c.fillStyle='#333d36';c.fillRect(x-w/2+5,y+11,w-10,12);
  for(let k=0;k<w;k+=13){c.fillStyle=k%2?'#728361':'#8a936c';c.fillRect(x-w/2+k,y-2,Math.min(10,w-k),3);c.fillStyle='#58634a';c.fillRect(x-w/2+k+3,y+18,4,8+(k%4)*3);}
  if(o.source.crumble){c.strokeStyle='#202d28';c.lineWidth=2+crack*3;c.beginPath();c.moveTo(x-12,y);c.lineTo(x-5,y+8);c.lineTo(x-18,y+22);c.stroke();}
 }else if(o.earlyCarrier){
  // Freight hoist: the path, wheel, cable and counterweight explain its movement.
  const top=GROUND_Y-Math.max(o.homeY,o.toY)-125;
  c.fillStyle='#414842';c.fillRect(o.homeX-15,top,9,GROUND_Y-o.homeY-top+24);c.fillRect(o.toX+8,top,9,GROUND_Y-o.toY-top+24);c.fillRect(o.homeX-15,top,o.toX-o.homeX+32,10);
  c.strokeStyle='#8f8065';c.lineWidth=2;c.beginPath();c.moveTo(x,y-8);c.lineTo(x,top+12);c.lineTo(o.toX+28,top+12);c.lineTo(o.toX+28,top+55+(o.y-o.homeY)*.35);c.stroke();
  c.fillStyle='#625c4f';c.fillRect(o.toX+19,top+55+(o.y-o.homeY)*.35,18,27);
  for(const xx of [o.homeX,o.toX]){c.fillStyle='#746d58';c.fillRect(xx-8,top+6,16,16);c.fillStyle='#b6a981';c.fillRect(xx-2,top+11,4,7);}
  c.strokeStyle='#685b45';c.lineWidth=3;c.beginPath();c.moveTo(o.homeX,GROUND_Y-o.homeY+12);c.lineTo(o.toX,GROUND_Y-o.toY+12);c.stroke();
  c.fillStyle='#514b44';c.fillRect(x-o.w/2,y,o.w,15);c.fillStyle=o.charged?'#f4d48a':'#8d8065';c.fillRect(x-o.w/2,y-5,o.w,5);
  for(const dx of [-o.w/2+6,o.w/2-12]){c.fillStyle='#c9b785';c.fillRect(x+dx,y+7,6,10);}
 }else if(o.type==='earlyBlade'){
  const spent=(a?.used[o.earlyId]||0)>G.time;
  const kick=spent?Math.max(0,((a.used[o.earlyId]||0)-G.time)/.6):0;
  // Resin pod rooted in the canopy, with a pale, exposed underside for the upward strike.
  c.strokeStyle='#495b3d';c.lineWidth=4;c.beginPath();c.moveTo(x,y-130);c.bezierCurveTo(x-14,y-95,x+12,y-60,x,y-15);c.stroke();
  for(let k=0;k<4;k++){c.fillStyle=k%2?'#687d49':'#7e9256';c.fillRect(x+(k%2?-10:1),y-115+k*23,12,4);}
  c.translate(x,y-kick*9);const w=o.w/2;
  for(let yy=-17;yy<17;yy+=3){const ww=Math.max(6,w-Math.abs(yy)*.55);c.fillStyle=spent?'#66664d':yy<0?'#b19b65':'#927c50';c.fillRect(-ww,yy,ww*2,3);c.fillStyle='#6c6947';c.fillRect(-2,yy,4,3);}
  c.fillStyle=spent?'#3a4333':'#e4d6a1';c.fillRect(-w*.65,14,w*1.3,4);
  if(spent){c.fillStyle='#d0be7d';for(let k=0;k<5;k++)c.fillRect((k-2)*(1-kick)*20,18+(1-kick)*k*12,3,3);}
  // The first up-blade the knight ever meets names the move once, until it is first struck.
  if(a?.room?.teach===o.earlyId&&typeof meta!=='undefined'&&!meta.upStrikeTaught){
   c.font='bold 14px system-ui';c.textAlign='center';c.fillStyle='#0c1410cc';c.fillRect(-78,-86,156,40);
   c.fillStyle='#ece0bc';c.fillText('Up and strike',0,-68);c.font='12px system-ui';c.fillStyle='#b9d4de';
   c.fillText('(↑ + '+keyLabel(kbCode('attack'))+')',0,-52);
  }
 }else if(o.type==='earlySign'){
  c.fillStyle='#756549';c.fillRect(x-2,y-48,4,48);c.fillStyle='#27322d';c.fillRect(x-46,y-64,92,21);
  if(Math.abs(G.p.x-x)<160){c.font='13px system-ui';c.textAlign='center';c.fillStyle='#ece0bc';
   const label=a.room.blades.length?'UP / DOWN + ATTACK': 'JUMP WHILE LIT';c.fillText(label,x,y-78);
   c.fillText(keyLabel(kbCode('checkpoint'))+' · RETRY CROSSING',x,y-97);
  }
 }else{c.fillStyle='#716c5b';c.fillRect(x-o.w/2,y,o.w,14);c.fillStyle='#c0b187';c.fillRect(x-o.w/2,y,o.w,3);}
 c.restore();return true;
}
root.BladefallEarlyPlatforming=Object.freeze({install,tick,syncClock,receive,before,late,swing,draw,retry,retryAvailable,bladeAvailable,motion,rooms:ROOMS,active});
})(globalThis);
