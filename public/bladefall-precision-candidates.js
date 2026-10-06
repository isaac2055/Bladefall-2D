/* Second workshop review: independent layouts, never aliases of banked rooms.
   All transient entities belong to the current room and reset with an attempt. */
(function(root){
'use strict';
const kinds=['rootworks','wake-behind','recoil-well','lantern-thief','switchback-engine'];
const active=()=>typeof G!=='undefined'&&G?.stageIndex===44&&G.celeste;
const obs=()=>G.obstacles.filter(o=>o.ceRoom===G.celeste.room);
const room=()=>G.celeste.rooms[G.celeste.room];
const state=()=>G.celeste.candidates||(G.celeste.candidates={shots:0,hits:0,hoists:0,returns:0,roots:0,switches:0,rebounds:0,throws:0,catches:0,trail:[]});
const hit=(p,o)=>p.x+p.w/2>o.x-o.w/2&&p.x-p.w/2<o.x+o.w/2&&p.y+p.h>o.y&&p.y<o.y+o.h;
function finishStorm(b){
 const {r,x,add,hazard,gale,tear}=b;
 r.flightBudgeted=true;r.fracturedVariant=r.kind==='storm-fractured';
 const hard=r.fracturedVariant,gap=hard?132:162;
 const low=px=>158+27*Math.sin((px-5760)*Math.PI/285)+9*Math.sin((px-5780)*Math.PI/97);
 r.flightPath3=[];
 for(let px=5780;px<7100;px+=20){const floor=low(px+10),top=floor+gap+6*Math.sin(px*.018);for(const o of [hazard(px+10,-400,20,floor+400),hazard(px+10,top,20,920-top)])Object.assign(o,{ceCrag:true,ceContour:true,ceTunnel:true});}
 for(let px=5840;px<=7060;px+=80){let target=low(px)+(gap-44)/2+(px>=6640&&px<=6880?(hard?25:42):hard&&px>=6000&&px<=6160?24:0);if(hard&&px>=6640&&px<=6880)target=Math.max(215,target);r.flightPath3.push([px,target]);}
 r.flightPath3.push([7120,205]);
 const refill1=hard?6360:6400,refill2=hard?6970:7030;gale(refill1,low(refill1)+(gap-44)/2+22,true);gale(refill2,low(refill2)+(gap-44)/2+22,true);
 for(const [px,phase]of [[6140,0],[6900,.7]]){const y=low(px)+18;add({type:'ceSpitter',x:x+px,y,w:32,h:30,ceDelay:phase,ceMouthY:y,ceNext:0,ceTell:0});}
 for(let i=0;i<12;i++)add({type:'ceHazard',x:x+5800,y:0,w:10,h:10,ceSpore:true,gone:true,ceLife:0});
 tear(7160,225,hard?7360:7300,hard?250:0,{setDown:1});
 if(hard){b.ring(7620,420,true);Object.assign(hazard(7810,-400,48,820),{ceCrag:true});add({type:'ceVein',x:x+8070,y:435,w:150,h:126,ceVault:true,ceId:r.i+':escape-vault'});Object.assign(hazard(8370,-400,52,1050),{ceCrag:true});}

}
function build(kind,b){
 if(!kinds.includes(kind))return false;const {r,x,add,plat,hazard}=b;r.candidate=true;r.cameraHigh=true;
 const crag=(px,y,w,h)=>Object.assign(hazard(px,y,w,h),{ceCrag:true});
 const hoist=(px,y,tx,ty,trap=false)=>plat(px,96,y,{ceHoist:true,ceOriginX:x+px,ceOriginY:y,ceTargetX:x+tx,ceTargetY:ty,ceTrap:trap,ceAge:-1,ceDuration:.9});
 const vine=(px,y,w)=>plat(px,w,y,{ceRoot:true,ceOriginX:x+px,ceOriginY:y,ceFullWidth:w,ceAnchorX:x+px-w/2,ceRootDir:1,ceRootAge:-1,gone:true});
 if(kind==='switchback-engine'){r.dashSwitch=true;
  const folds=[[560,80,1,88],[940,215,0,74],[620,355,1,68],[990,515,0,70],[1370,580,1,62],[1750,415,0,66],[2100,270,1,60],[2410,110,0,60]];
  for(const [px,y,phase,w]of folds)plat(px,w,y,{ceFold:true,cePhase:phase,gone:phase!==0,ceFoldT:phase===0?1:0});
  crag(875,420,210,26);crag(1310,-400,68,900);crag(1950,540,190,310);crag(2275,-400,52,520);
  for(const [px,low,high,phase]of [[1180,510,720,1],[1600,300,540,0],[2260,80,300,0]]){crag(px,-400,32,low+400);crag(px,high,32,940-high);add({type:'wall',x:x+px,y:high,w:26,h:high-low,noCling:1,ceFoldGate:phase,ceCandidateGate:true});}
  add({type:'ceSwitchMotor',x:x+1300,y:735,w:40,h:40});r.folds=folds;
 }
 if(kind==='wake-behind'){r.wake=true;
  for(const [px,y,w]of [[580,80,80],[990,145,74],[1460,190,70],[1290,390,68],[950,455,64],[600,525,62],[2010,330,62],[2370,145,58]])plat(px,w,y,{ceWakePerch:true});
  crag(855,300,610,26);crag(1620,-400,75,1060);crag(2100,-400,52,655);crag(2240,440,170,410);
  b.tear(455,610,1840,550,{setDown:1});
  for(const delay of [1.08,1.8])add({type:'ceHazard',x:x+120,y:0,w:18,h:32,ceWake:true,ceLag:delay,gone:true});
 }
 if(kind==='recoil-well'){
  for(const [px,y,w]of [[270,335,92],[1000,590,86],[1710,270,90],[2250,115,66]])plat(px,w,y,{cePressurePerch:true});
  for(const [id,px,y]of [[0,515,90],[1,710,360],[2,1460,595]])add({type:'cePressurePod',x:x+px,y,w:48,h:48,cePodId:id,ceRecoilCd:0});
  for(const [id,px]of [[0,680],[1,1260],[2,2060]])add({type:'wall',x:x+px,y:940,w:28,h:1340,noCling:1,cePressureGate:id,ceCandidateGate:true});
  crag(900,-400,70,660);crag(1250,790,350,130);crag(1650,560,180,380);crag(1930,-400,45,560);crag(2420,330,140,610);
 }
 if(kind==='lantern-thief'){
  add({type:'ceSeed',x:x+260,y:42,w:14,h:14,ceOriginX:x+260,ceOriginY:42,ceCarried:false,ceVx:0,ceVy:0,ceRest:true});
  const sockets=[[0,1040,148,1170],[1,1690,565,1830],[2,2540,142,2780]];
  for(const [id,px,y,gx]of sockets){add({type:'ceSeedSocket',x:x+px,y,w:30,h:30,ceSocketId:id,ceLit:false,ceCloseAt:0});add({type:'wall',x:x+gx,y:940,w:26,h:1340,noCling:1,ceSeedGate:id,ceCandidateGate:true});}
  for(const [px,y,w]of [[530,110,100],[720,0,72],[925,0,80],[1040,94,74],[1350,230,80],[1480,345,66],[1690,511,80],[2150,500,90],[2540,88,74],[2980,0,68]])plat(px,w,y,{ceSeedPerch:true});
  // A seed-sized upper opening and a separate lower passage for the knight.
  b.floor(680,1000);crag(800,-400,54,400);crag(800,90,54,44);crag(800,164,54,776);
  crag(1980,-400,50,730);crag(2390,360,80,580);crag(2870,280,50,660);
 }
 if(kind==='rootworks'){
  r.noDashFlight=true;
  hoist(440,30,700,200);hoist(1080,300,1410,300,true);hoist(1080,45,1840,145);Object.assign(hoist(2520,230,2920,250),{ceRootLocked:true});
  // Upper machinery must be ridden BACK to the hatch. The low return route runs beneath it.
  crag(1350,210,420,22);crag(1370,455,570,395);crag(1580,180,50,675);add({type:'wall',x:x+1580,y:180,w:40,h:580,noCling:1,ceReturnGate:true,ceCandidateGate:true});
  crag(960,-400,40,400);crag(2000,-400,50,510);
  Object.assign(vine(2210,180,150),{ceRootRelease:true});crag(2109,-400,52,566);vine(3300,320,160);crag(3193,-400,54,704);
  crag(3305,415,90,900);crag(3570,-400,50,880);
  // Weight on the first vine releases the following hoist through its root cable.

 }
 return true;
}
function reset(){if(!active())return;G.celeste.candidates=null;for(const o of obs()){if(o.cePressurePod!==undefined||o.type==='cePressurePod'){o.ceRecoilCd=0;o.ceBurst=0;}if(o.ceCandidateGate)o.gone=false;if(o.type==='ceSeed'){Object.assign(o,{x:o.ceOriginX,y:o.ceOriginY,ceCarried:false,ceVx:0,ceVy:0,ceDock:null,ceRest:true,cePickupCd:0,ceRecallHold:0,ceThrowAge:0,ceReturnX:o.ceOriginX,ceReturnY:o.ceOriginY});}if(o.type==='ceSeedSocket'){o.ceLit=false;o.ceCloseAt=0;}if(o.ceFold){o.gone=o.cePhase!==0;o.ceFoldT=o.gone?0:1;}if(o.ceWake)o.gone=true;if(o.ceHoist){o.x=o.ceOriginX;o.y=o.ceOriginY;o.ceAge=-1;o.gone=false;o.ceGold=false;o.ceOpened=false;}if(o.ceRoot){o.x=o.ceOriginX;o.y=o.ceOriginY;o.w=o.ceFullWidth;o.ceRootAge=-1;o.ceGrowth=0;o.gone=true;}if(o.ceSpore){o.gone=true;o.ceLife=0;}if(o.type==='ceSpitter'){o.ceNext=0;o.ceTell=0;o.ceAiming=false;}}}
function dash(p,a){
 if(!active())return;const s=state();
 if(room().dashSwitch){s.phase=1-(s.phase||0);s.switches++;}
 if(p.onGround&&p.floorPlat?.ceHoist){const o=p.floorPlat;if(o.ceRootLocked&&!s.rootReleased){o.ceLockedFlash=.5;return;}if(o.ceAge<0){o.ceAge=0;o.ceOpened=false;s.hoists++;}a.ride=true;}
 for(const o of obs())if(o.ceRoot&&Math.abs(p.x-o.ceAnchorX)<600){o.ceRootAge=0;s.roots++;}
}
function before(dt,p){
 if(!active())return;const a=state(),list=obs(),clock=G.celeste.clock;
 if(p.onGround&&p.floorPlat?.ceRootRelease)a.rootReleased=true;
 if(room().wake&&(a.wakeStarted||p.x>room().x+340)){
  a.wakeStarted=true;a.trail.push({x:p.x,y:p.y,t:clock});while(a.trail.length&&a.trail[0].t<clock-2.1)a.trail.shift();
 }
 for(const o of list){
  if(o.ceFoldGate!==undefined)o.gone=(a.phase||0)===o.ceFoldGate;
  if(o.ceReturnGate)o.gone=a.returns>0;
  if(o.cePressureGate!==undefined)o.gone=!!a.pods?.includes(o.cePressureGate);
  if(o.type==='cePressurePod'){o.ceRecoilCd=Math.max(0,o.ceRecoilCd-dt);o.ceBurst=Math.max(0,(o.ceBurst||0)-dt);}
  if(o.ceSeedGate!==undefined){const node=list.find(n=>n.type==='ceSeedSocket'&&n.ceSocketId===o.ceSeedGate);o.gone=!!node&&(node.ceLit||clock<node.ceCloseAt);}
  if(o.type==='ceSeed'){
   const recover=()=>{o.x=o.ceReturnX??o.ceOriginX;o.y=o.ceReturnY??o.ceOriginY;o.ceRest=true;o.ceCarried=false;o.ceDock=null;o.ceVx=o.ceVy=0;o.ceThrowAge=0;o.cePickupCd=.25;o.ceRecallFlash=.6;a.recalls=(a.recalls||0)+1;};
   o.ceRecallFlash=Math.max(0,(o.ceRecallFlash||0)-dt);
   if(room().lanternRecall){
    o.ceRecallHold=keyDownFor('hook')?(o.ceRecallHold||0)+dt:0;
    if(o.ceRecallHold>=.55&&!o.ceCarried&&o.ceDock==null){recover();o.ceRecallHold=-999;}
    if(o.ceCarried&&p.onGround){o.ceReturnX=p.x;o.ceReturnY=p.y+p.h-6;}
    if(!o.ceCarried&&!o.ceRest&&o.ceDock==null){o.ceThrowAge=(o.ceThrowAge||0)+dt;if(o.ceThrowAge>3.2)recover();}
   }
   o.cePickupCd=Math.max(0,(o.cePickupCd||0)-dt);
   if(keyPressedFor('hook')&&(o.ceCarried||!o.cePickupCd&&Math.hypot(p.x-o.x,p.y+p.h*.7-o.y)<76)){
    if(o.ceCarried){const d={x:(keyDownFor('right')?1:0)-(keyDownFor('left')?1:0),y:((BF_TAS_ENABLED?keyDownFor('up'):BFKeyboard.isDown('ArrowUp'))?1:0)-(keyDownFor('slam')?1:0)};if(!d.x&&!d.y)d.x=p.face;const n=Math.hypot(d.x,d.y);o.ceVx=d.x/n*480;o.ceVy=d.y/n*480;o.ceCarried=false;o.ceRest=false;o.ceThrowAge=0;o.cePickupCd=.22;a.throws++;}
    else{if(o.ceDock!=null){const node=list.find(n=>n.type==='ceSeedSocket'&&n.ceSocketId===o.ceDock);node.ceLit=false;node.ceCloseAt=clock+1.8;}o.ceDock=null;o.ceCarried=true;o.ceRest=false;a.catches++;}
   }
   if(o.ceCarried){o.x=p.x+p.face*20;o.y=p.y+p.h-6;p.vy=Math.min(p.vy,160);}
   else if(!o.ceRest&&o.ceDock==null){
    o.x+=o.ceVx*dt;o.y+=o.ceVy*dt;
    const socket=list.find(n=>n.type==='ceSeedSocket'&&Math.hypot(o.x-n.x,o.y-n.y)<(n.ceCatchRadius||29));
    if(socket){o.ceDock=socket.ceSocketId;o.x=socket.x;o.y=socket.y;socket.ceLit=true;socket.ceCloseAt=0;o.ceVx=0;o.ceVy=0;a.sockets=(a.sockets||0)+1;}
    else if(o.y< -100||o.y>900||o.x<room().x||o.x>room().x+room().width||list.some(z=>z.ceCrag&&hit({...o,y:o.y-7},z))){if(room().lanternRecall)recover();else{o.x=o.ceOriginX;o.y=o.ceOriginY;o.ceRest=true;o.ceVx=o.ceVy=0;}}
   }
  }
  if(o.ceFold){const solid=(a.phase||0)===o.cePhase;o.ceFoldT=Math.max(0,Math.min(1,o.ceFoldT+(solid?dt:-dt)*7));o.gone=!solid;if(o.gone&&p.floorPlat===o){p.floorPlat=null;p.onGround=false;p.coyote=.1;}}
  if(o.ceWake){const point=a.trail.find(q=>q.t>=clock-o.ceLag);o.gone=!point||!a.trail.length||clock-a.trail[0].t<o.ceLag-.02;if(point){o.x=point.x;o.y=point.y;}}
  if(o.ceHoist){
   const wasX=o.x,wasY=o.y;if(o.ceAge>=0)o.ceAge+=dt;const t=o.ceAge,d=o.ceDuration;
   const f=t<0?0:t<d?t/d:t<d+.22?1:Math.max(0,1-(t-d-.22)/1.2);
   o.x=o.ceOriginX+(o.ceTargetX-o.ceOriginX)*f;o.y=o.ceOriginY+(o.ceTargetY-o.ceOriginY)*f;
   o.ceGold=t>=d-.12&&t<=d+.16;o.gone=o.ceTrap&&t>=d+1.42;
   if(o.gone){o.y-=Math.pow(t-d-1.42,2)*760;if(!o.ceOpened){o.ceOpened=true;a.returns++;}}
   if(p.onGround&&p.floorPlat===o){p.x+=o.x-wasX;p.y+=o.y-wasY;p.vx=0;p._ballisticT=0;if(o.ceGold){const l=root.BladefallCeleste.labState();l.grace=.12;l.lift=(o.ceTargetX-o.ceOriginX)/d;a.hoistLift=(o.ceTargetY-o.ceOriginY)/d;a.hoistGrace=.12;}if(o.gone){p.onGround=false;p.floorPlat=null;p.coyote=.1;}}
   if(t>d+2.2){o.ceAge=-1;o.gone=false;}
  }
  if(o.ceRoot){
   if(o.ceRootAge>=0)o.ceRootAge+=dt;const t=o.ceRootAge;o.ceGrowth=t<0?0:Math.min(1,t/.28,Math.max(0,((o.ceRootLife||3.4)-t)/.65));
   o.w=Math.max(1,o.ceFullWidth*o.ceGrowth);o.x=o.ceAnchorX+(o.ceRootDir||-1)*o.w/2;o.gone=o.ceGrowth<.05;
   if(o.gone&&p.floorPlat===o){p.floorPlat=null;p.onGround=false;p.coyote=.1;}
  }
  if(o.ceSpore&&!o.gone){o.x+=o.ceVx*dt;o.y+=o.ceVy*dt;o.ceLife-=dt;if(o.ceLife<=0||list.some(z=>z.ceCrag&&z!==o&&hit(o,z)))o.gone=true;}
  if(o.type!=='ceSpitter')continue;
  if(!o.ceNext&&Math.abs(p.x-o.x)<640)o.ceNext=clock+o.ceDelay+.65;
  if(!o.ceNext||Math.abs(p.x-o.x)>800)continue;
  if(clock>=o.ceNext-.6&&!o.ceAiming){o.ceAiming=true;const dx=p.x-o.x,dy=p.y+p.h*.55-o.ceMouthY,n=Math.hypot(dx,dy)||1;o.ceAimX=dx/n;o.ceAimY=dy/n;}
  o.ceTell=o.ceAiming?Math.max(0,o.ceNext-clock):0;
  if(clock>=o.ceNext){const shot=list.find(s=>s.ceSpore&&s.gone);if(shot){Object.assign(shot,{x:o.x+o.ceAimX*24,y:o.ceMouthY+o.ceAimY*24-5,gone:false,ceVx:o.ceAimX*110,ceVy:o.ceAimY*110,ceLife:4.5});a.shots++;}o.ceNext=clock+1.85;o.ceTell=0;o.ceAiming=false;}
 }
}
function late(dt,p){if(!active())return;const a=state();if(a.hoistGrace>0){a.hoistGrace-=dt;if(!p.onGround&&p.vy< -100){p.vy-=a.hoistLift;p.jumpCutOk=false;a.hoistGrace=0;}}for(const o of obs()){
 if(o.type==='cePressurePod'&&!o.ceRecoilCd&&p.dodgeTimer>0&&hit(p,o)){
  const l=root.BladefallCeleste.labState();o.ceRecoilCd=.5;o.ceBurst=.45;p.dodgeTimer=0;p.dodgeCdT=0;p.vx=-l.dx*1120;p.vy=l.dy*1120;p._ballisticT=.32;p.jumpCutOk=false;p.slamming=false;p.jumps=1;l.charge=1;a.rebounds++;if(!(a.pods||(a.pods=[])).includes(o.cePodId))a.pods.push(o.cePodId);
 }
 }for(const o of obs())if(o.ceSpore&&!o.gone&&hit(p,o)){o.gone=true;state().hits++;state().lastSpore={x:p.x-room().x,y:p.y,shotX:o.x-room().x,shotY:o.y};root.BladefallPrecisionWorkshop.contact(p,o);}}
function draw(phase,api,o){
 if(api.G.stageIndex!==44)return false;const {B,WX,WY,Z,ctx:c}=api;
 if(phase==='plat'&&o.ceWeight&&!o.ceHoist)return draw(phase,api,{...o,ceWeight:false,ceHoist:true,ceOriginX:o.ceHomeX,ceOriginY:o.ceHomeY,ceTargetX:o.ceToX,ceTargetY:o.ceToY,ceGold:o.ceT>.88&&!o.ceLaunchSpent&&(o.ceTopAge||0)<.2});
 if(phase==='plat'&&o.ceAnvil){const x=WX(o.x),y=WY(o.y),w=o.w*Z,s=(o.ceFlash||0)*9;B(x-w/2,y,w,5*Z,'#c0a374');B(x-w/2+3*Z,y+5*Z,w-6*Z,9*Z,'#777664');B(x-w*.28,y+14*Z,w*.56,9*Z+s,'#3e4942');for(let j=0;j<3;j++)B(x-12*Z+j*7*Z,y+(22+j*3)*Z,5*Z,3*Z,'#9a9679');B(x-2*Z,y-9*Z,4*Z,6*Z,'#e0c594');B(x-6*Z,y-4*Z,12*Z,3*Z,'#e0c594');if(s>0)for(let j=0;j<4;j++)B(x+(j-1.5)*12*Z,y-18*Z-s*(j+1),3*Z,3*Z,'#e1cf9f');return true;}
 if(phase==='object'&&o.ceCandidateGate){
  const x=WX(o.x),top=WY(Math.min(760,o.y)),bottom=WY(o.y-o.h),h=o.gone?18:bottom-top;
  B(x-19*Z,top-6,38*Z,8*Z,'#6c7763');for(let k=-2;k<=2;k++)B(x+k*6*Z,top,3*Z,h,'#74816b');B(x-5*Z,top-14,10*Z,7*Z,o.gone?'#c2d29a':'#a48b5d');return true;
 }
 if(phase==='object'&&o.type==='cePressurePod'){
  const x=WX(o.x),y=WY(o.y+24),s=o.ceBurst?1+o.ceBurst*2:1;
  if(o.ceAimGuide){c.save();c.strokeStyle='#8f866a';c.lineWidth=1.5*Z;for(const dx of [-1,1]){c.beginPath();c.moveTo(x+dx*26*Z,y-26*Z);c.lineTo(x+dx*49*Z,y-49*Z);c.lineTo(x+dx*38*Z,y-47*Z);c.moveTo(x+dx*49*Z,y-49*Z);c.lineTo(x+dx*47*Z,y-38*Z);c.stroke();}c.restore();}
  for(let k=0;k<6;k++){const ang=k*Math.PI/3;B(x+Math.cos(ang)*19*Z*s-5,y+Math.sin(ang)*19*Z*s-5,10*Z,10*Z,'#a19172');}B(x-13*Z,y-13*Z,26*Z,26*Z,o.ceRecoilCd?'#756c58':'#d0b886');B(x-6*Z,y-6*Z,12*Z,12*Z,'#665e4c');B(x-3*Z,y-3*Z,6*Z,6*Z,'#edd9a2');return true;
 }
 if(phase==='object'&&o.type==='ceSeedSocket'){
  const x=WX(o.x),y=WY(o.y);B(x-18*Z,y-15*Z,36*Z,6*Z,'#4d6754');B(x-18*Z,y+11*Z,36*Z,6*Z,'#4d6754');B(x-18*Z,y-15*Z,6*Z,30*Z,'#4d6754');B(x+12*Z,y-15*Z,6*Z,30*Z,'#4d6754');B(x-7*Z,y-7*Z,14*Z,14*Z,o.ceLit?'#bce0ae':'#263e32');return true;
 }
 if(phase==='object'&&o.type==='ceSeed'){
  const x=WX(o.x),y=WY(o.y);
  if(o.ceCarried){const px=WX(api.G.p.x),py=WY(api.G.p.y+20);c.save();c.strokeStyle='rgba(176,219,166,.45)';c.lineWidth=1;for(let j=0;j<3;j++){c.beginPath();c.ellipse(px,py,(30+j*4)*Z,(34+j*4)*Z,0,0,Math.PI*2);c.stroke();}c.fillStyle='rgba(156,209,147,.07)';c.beginPath();c.ellipse(px,py,38*Z,42*Z,0,0,Math.PI*2);c.fill();c.restore();for(let j=0;j<9;j++){const rise=(G.celeste.clock*34+j*11)%78;B(px+Math.sin(j*2.3)*29*Z,py+(38-rise)*Z,2*Z,3*Z,'#b9d5a0');}B(px-12*Z,py+26*Z,24*Z,2*Z,'#8fb997');}
  B(x-6*Z,y-8*Z,12*Z,16*Z,'#aecba0');B(x-3*Z,y-5*Z,6*Z,10*Z,'#e2e6af');B(x-10*Z,y-3*Z,4*Z,6*Z,'#617d5b');B(x+6*Z,y-3*Z,4*Z,6*Z,'#617d5b');return true;
 }
 if(phase==='plat'&&o.ceFold){
  const x=WX(o.x),y=WY(o.y),w=o.w*Z,col=o.cePhase?'#c3a168':'#83aca8',g=o.ceFoldT||0;
  B(x-w/2-6,y-2,4,22,'#4f5851');B(x+w/2+2,y-2,4,22,'#4f5851');
  for(let q=0;q<w;q+=9){B(x-w/2+q,y,5,2,col);if(g>0)B(x-w/2+q,y+2,8,Math.max(2,12*g),g>.7?col:'#4c5750');}return true;
 }
 if(phase==='object'&&o.type==='ceSwitchMotor'){const x=WX(o.x),y=WY(o.y);B(x-18,y-18,36,36,'#4e5951');B(x-12,y-12,24,24,state().phase?'#c3a168':'#83aca8');B(x-3,y-23,6,46,'#283831');return true;}
 if(phase==='object'&&o.ceWake){if(!o.gone){const x=WX(o.x),y=WY(o.y+18),t=G.celeste.clock,flap=Math.sin(t*15)*4;c.save();c.globalAlpha=.75;B(x-5,y-13,10,25,'#9b88b6');B(x-16,y-5+flap,11,8,'#66527e');B(x+5,y-5-flap,11,8,'#66527e');B(x-4,y-7,3,3,'#e3c5c5');B(x+1,y-7,3,3,'#e3c5c5');c.restore();}return true;}
 if(phase==='world'){for(const q of obs())if(q.ceRoot&&q.gone)draw('plat',api,q);for(const v of obs().filter(q=>q.ceRootRelease)){const h=obs().find(q=>q.ceRootLocked);if(h){c.save();c.strokeStyle=state().rootReleased?'#b0bd79':'#526b4f';c.lineWidth=2*Z;c.beginPath();c.moveTo(WX(v.ceAnchorX),WY(v.ceOriginY+5));c.lineTo(WX(h.ceOriginX),WY(h.ceOriginY+12));c.stroke();c.restore();}}}
 if(phase==='plat'&&o.ceHoist){
  const x=WX(o.x),y=WY(o.y),ax=WX(o.ceOriginX),ay=WY(o.ceOriginY+24),bx=WX(o.ceTargetX),by=WY(o.ceTargetY+24),w=o.w*Z;
  c.save();c.strokeStyle='#626a59';c.lineWidth=2;c.beginPath();c.moveTo(ax,ay);c.lineTo(bx,by);c.stroke();c.restore();
  for(const [xx,yy]of [[ax,ay],[bx,by]]){B(xx-7,yy-7,14,14,'#39453f');B(xx-3,yy-3,6,6,'#aa9c73');}
  if(o.ceRootLocked&&!state().rootReleased){B(x-7*Z,y-19*Z,14*Z,13*Z,'#b0bd79');B(x-3*Z,y-25*Z,6*Z,9*Z,'#65774d');}if(!o.gone){B(x-w/2,y,w,5,'#9b926d');B(x-w/2+3,y+5,w-6,7,'#4d594f');B(x-w/2+5,y-3,w-10,3,o.ceGold?'#f1c475':'#91b6ad');if(o.ceTrap){B(x-1,y,2,12,'#232e29');B(x-8,y+5,3,3,'#c6a879');B(x+5,y+5,3,3,'#c6a879');}}
  if(o.gone&&o.ceTrap){B(x-w/2,y+2,w/2-3,6,'#746f55');B(x+3,y+7,w/2-3,6,'#746f55');for(let j=0;j<4;j++)B(x+(j-1.5)*12,y+20+j*7,3,3,'#a89a76');}
  const travel=(o.y-o.ceOriginY)*Z,weight=(o.ceTargetY-o.ceOriginY+65)*Z-travel,wx=bx+22*Z;B(bx-5,by-5,10,10,'#adb08a');B(bx,by-2,22*Z,2,'#899274');B(wx-1,by,2,Math.max(1,weight),'#899274');B(wx-11*Z,by+weight,22*Z,27*Z,'#4e5b50');for(let k=0;k<3;k++)B(wx-9*Z,by+weight+(5+k*8)*Z,18*Z,3*Z,'#8b947c');B(wx-14*Z,by-5,2,weight+36*Z,'#35463d');B(wx+13*Z,by-5,2,weight+36*Z,'#35463d');return true;
 }
 if(phase==='plat'&&o.ceRoot){
  const ax=WX(o.ceAnchorX),y=WY(o.ceOriginY),growth=o.ceGrowth||0,w=o.ceFullWidth*Z*growth,dir=o.ceRootDir||-1,decay=o.ceRootAge>(o.ceRootLife||3.4)-.65;
  if(growth<.98){c.save();c.strokeStyle='#b0bd79';c.lineWidth=3*Z;c.beginPath();for(let j=0;j<32;j++){const t=j*.29,rr=(3+j*.35)*(1-growth);const xx=ax+dir*(14+Math.cos(t)*rr)*Z,yy=y-9*Z+Math.sin(t)*rr*Z;j?c.lineTo(xx,yy):c.moveTo(xx,yy);}c.stroke();c.restore();}B(ax-2,y-7,14*Z,20*Z,'#37463a');B(ax,y-4,8*Z,12*Z,'#141e1a');B(ax-4,y-6,4*Z,16*Z,'#82916d');
  for(let q=0;q<w;q+=4){const yy=y+Math.sin(q*.06)*2;B(ax+dir*q-2,yy,5,5,decay?'#82714d':'#7e9b63');if(q%12===0){B(ax+dir*q-4,yy-4,8,3,decay?'#a68a57':'#b0bd79');B(ax+dir*q-1,yy+6,7,3,'#586f47');}}
  if(decay)for(let j=0;j<6;j++)B(ax+dir*w*j/6,y+10+((o.ceRootAge*32+j*7)%25),3,2,'#ac945e');return true;
 }
 if(phase==='object'&&o.type==='ceSpitter'){
  const x=WX(o.x),y=WY(o.ceMouthY),sw=o.ceTell>0?1+(.6-Math.min(.6,o.ceTell))*.7:1;
  B(x-13*Z,y-7*Z,26*Z,24*Z,'#334938');for(let k=0;k<5;k++){B(x+(k-2)*5*Z,y+14*Z,3*Z,(8+k%2*6)*Z,'#6b8051');B(x+(k-2)*6*Z,y-12*Z,5*Z,9*Z,'#789465');}
  B(x-9*Z*sw,y-5*Z*sw,18*Z*sw,13*Z*sw,o.ceTell?'#d3ac75':'#a0a981');B(x-5*Z,y-2*Z,10*Z,5*Z,'#242a2b');B(x-8*Z,y-8*Z,3*Z,3*Z,'#e8d6ac');B(x+5*Z,y-8*Z,3*Z,3*Z,'#e8d6ac');
  if(o.ceTell>0)for(let j=1;j<4;j++)B(x+o.ceAimX*j*9*Z,y-o.ceAimY*j*9*Z,2*Z,2*Z,'#d7bf87');return true;
 }
 if(phase==='object'&&o.ceSpore){if(!o.gone){const x=WX(o.x),y=WY(o.y+5);B(x-4*Z,y-4*Z,8*Z,8*Z,'#c5a976');B(x-2*Z,y-2*Z,4*Z,4*Z,'#f0dab0');for(let k=0;k<3;k++)B(x-o.ceVx*.045*k*Z,y+o.ceVy*.045*k*Z,2*Z,2*Z,'#827753');}return true;}
 return false;
}
root.BladefallPrecisionCandidates=Object.freeze({build,finishStorm,reset,dash,before,late,draw});
})(typeof window!=='undefined'?window:globalThis);
