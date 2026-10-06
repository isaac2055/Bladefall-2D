/* Separately authored review rooms. Only P-F intentionally retains its approved
   arrangement; the other fractured routes have independent geometry and order. */
(function(root){
'use strict';
// Open chambers: flight is steered around separate islands. Pods provide an
// impulse, never a position snap or a prescribed path. Docks allow deliberate exits.
function flightCourse(kind,b){
 const {r,x,add,hazard,gale,tear,portal,plat}=b,hard=kind==='storm-fractured';
 r.cameraHigh=true;r.ceiling=1250;r.flightBudgeted=true;r.noDashFlight=true;r.openFlight=true;
 const rock=(px,y,w,h)=>{const n=Math.ceil(h/65);for(let j=0;j<n;j++){const yy=y+j*65,hh=Math.min(65,h-j*65),tip=y<0?j===n-1:j===0;Object.assign(hazard(px+Math.sin(j*1.9)*w*.12,yy,w*(tip?.62:.85+Math.sin(j*1.7)**2*.3),hh),{ceCrag:true});}};
 const seed=(px,y,time,refill=false)=>{const o=gale(px,y,refill);o.ceFlightTime=time;return o;};
 const pod=(px,y,dx,dy)=>add({type:'ceAetherSpring',x:x+px,y,w:46,h:46,dx,dy});
 const mover=(px,y,span,period,phase=0)=>add({type:'ceHazard',x:x+px,y,w:34,h:46,ceMover:true,ceHomeY:y,ceSpan:span,cePeriod:period,cePhase:phase});
 const dock=(px,y)=>plat(px,150,y,{ceDock:true});
 if(!hard){
  portal(305,35,565,228);seed(620,250,5.1);seed(2200,450,3.1,true);
  rock(1170,-400,150,655);rock(1680,575,260,500);rock(1980,-400,180,700);rock(2440,590,190,450);rock(2670,-400,150,580);
  pod(1590,445,.8,-.6);mover(2350,420,110,3.2,.8);
  r.openPaths=[[[900,300],[1090,350],[1380,435],[1590,445],[1820,350],[2110,450],[2200,450],[2500,450],[2830,240]],[[4900,330],[5090,485],[5430,230],[5570,250],[5510,400],[5680,480],[5930,475],[6180,280],[6500,340],[6660,560],[6900,350]]];
  dock(2950,140);tear(3060,175,4510,240,{setDown:1});plat(4640,400,240,{ceDock:true});seed(4760,280,5.2);seed(6180,280,3.4,true);
  rock(5060,-400,150,720);rock(5420,520,210,650);rock(5820,-400,190,705);rock(6360,500,180,550);
  pod(5570,250,-.6,.8);mover(6640,340,130,3.4,1.1);dock(6980,140);tear(7090,175,8650,140,{setDown:1});dock(8660,140);
  r.openZips=[[3060,175,4510,240],[7090,175,8650,140]];r.end=x+8960;plat(9000,520,0,{deep:1,h:800});
 }else{
  portal(305,35,565,678);seed(620,700,5.6);seed(1920,290,3.1,true);
  rock(1010,575,210,650);rock(1330,-400,190,650);rock(1660,490,180,750);rock(2180,-400,190,600);rock(2510,520,160,700);
  pod(1490,460,-.6,-.8);mover(2010,385,100,2.8,.9);
  r.openPaths=[[[760,650],[790,480],[1050,440],[1230,430],[1490,460],[1420,370],[1550,340],[1710,260],[1920,290],[2220,370],[2480,330],[2760,480]],[[4550,410],[4730,190],[4930,270],[4960,450],[5180,530],[5260,530],[5510,660],[5780,410],[6090,250],[6370,470],[6680,640],[6970,570]]];
  dock(2910,390);tear(3020,425,4240,530,{setDown:1});plat(4380,400,530,{ceDock:true});seed(4490,565,6.4);seed(6090,250,3.7,true);
  rock(4820,480,200,730);rock(5130,-400,180,775);rock(5700,650,220,570);rock(6000,390,160,830);rock(6440,-400,200,820);rock(6880,740,170,480);
  pod(5390,530,.6,.8);pod(6230,370,.8,.6);mover(6690,575,120,2.9,1.2);dock(7140,440);tear(7250,475,8940,140,{setDown:1});dock(8950,140);
  r.openZips=[[3020,425,4240,530],[7250,475,8940,140]];r.end=x+9260;plat(9300,520,0,{deep:1,h:800});
 }
 return true;
}

function build(kind,b){
 if(['storm-chase','storm-fractured'].includes(kind))return flightCourse(kind,b);
 const map={'lantern-fractured':'lantern-thief'};
 if(!map[kind]&&!['switchback-fractured','wake-fractured','recoil-fractured','rootworks-fractured','return-stroke','return-stroke-fractured'].includes(kind))return false;
 const {r,x,add,plat,hazard,tear,ring,blade,roof,gravity}=b,owned=[];
 const crag=(px,y,w,h)=>Object.assign(hazard(px,y,w,h),{ceCrag:true});
 const vein=(px,y,w=150,h=120)=>add({type:'ceVein',x:x+px,y,w,h,ceVault:true,ceId:r.i+':vein:'+px});
 const bell=(px,y,dx=.78,dy=.63)=>add({type:'ceRicochet',x:x+px,y,w:38,h:38,dx,dy});
 const prism=(px,y,up)=>add({type:'cePrism',x:x+px,y,w:34,h:92,ceUp:up});
 const anvil=(px,y,w=66)=>{const id=r.i+':anvil';r.required.push(id);return plat(px,w,y,{ceAnvil:true,ceMark:id});};
 r.cameraHigh=true;r.fracturedVariant=kind.endsWith('-fractured');
 if(map[kind]){
  const wrapped={...b};for(const method of ['add','plat','hazard'])wrapped[method]=(...args)=>{const o=b[method](...args);owned.push(o);return o;};
  root.BladefallPrecisionCandidates.build(map[kind],wrapped);
 }
 if(kind==='switchback-fractured'){
  r.dashSwitch=true;r.noDashFlight=true;r.escape='switch-ring-pogo-bell-rift';
  r.folds=[[570,120,1,64],[920,270,0,58],[1550,230,1,58],[2180,420,1,56],[2510,260,0,54],[3150,440,1,56]];
  for(const [px,y,phase,w]of r.folds)plat(px,w,y,{ceFold:true,cePhase:phase,gone:phase!==0,ceFoldT:phase===0?1:0});
  ring(1240,370,true);blade(1830,100,'pogo');bell(2800,390);Object.assign(vein(3510,350,200,220),{ceVault:false});
  crag(770,-400,44,600);crag(1430,560,340,850);crag(1930,-400,50,650);crag(2490,545,420,850);crag(3010,-400,46,710);
  add({type:'ceSwitchMotor',x:x+2040,y:640,w:40,h:40});
 }
 if(kind==='wake-fractured'){
  r.wake=true;r.noDashFlight=true;r.escape='falling-pursuit-bell-vault-pogo-ring';
  tear(300,40,680,650,{setDown:1});
  for(const [px,y,w]of [[910,480,56],[1240,280,52],[1850,450,52],[2180,250,50]])plat(px,w,y,{ceWakePerch:true,...(px===2180?{ceCrumble:true,ceHomeY:y,ceCrumbleTime:.3}:{})});
  bell(1520,410,.72,.69);vein(2470,260,140,100);blade(2800,360,'pogo');Object.assign(ring(3110,610,true),{ceLineOfSight:true});crag(3000,-400,52,940);
  crag(1090,-400,45,710);crag(2040,-400,48,680);crag(2190,480,180,700);crag(2660,-400,50,700);crag(3360,-400,46,1035);
  for(const delay of [1.02,1.64])add({type:'ceHazard',x:x+120,y:0,w:18,h:32,ceWake:true,ceLag:delay,gone:true});
 }
 if(kind==='recoil-fractured'){
  r.noDashFlight=true;r.escape='aimed-recoil-return-climb-inversion';
  for(const [px,y,w]of [[630,180,90],[860,300,90],[1010,460,82],[780,560,82],[1100,610,74],[1500,590,74],[1780,650,80]])plat(px,w,y,{cePressurePerch:true});
  for(const [id,px,y]of [[0,520,90],[1,1110,360],[2,1430,520]])add({type:'cePressurePod',x:x+px,y,w:54,h:54,cePodId:id,ceRecoilCd:0,ceAimGuide:true});
  for(const [id,px]of [[0,690],[1,1220],[2,1870]])add({type:'wall',x:x+px,y:1080,w:28,h:1480,noCling:1,cePressureGate:id,ceCandidateGate:true});
  crag(980,810,250,360);crag(1480,-400,54,700);crag(1620,450,130,35);
  gravity();prism(2040,690,true);roof(1900,2360,820);prism(2420,720,false);tear(2640,650,2950,360,{setDown:1});ring(3240,440,true);
 }
 if(kind==='lantern-fractured'){
  r.dashSwitch=true;r.noDashFlight=true;r.lanternRecall=true;
  for(const o of owned){
   const px=o.x-x;
   if(o.ceSeedPerch){o.w=Math.max(50,o.w-16);if(px===1350||px===1480||px===2150){o.ceFold=true;o.cePhase=px===1350?0:1;o.ceFoldT=o.cePhase?0:1;o.gone=!!o.cePhase;}if(px===1690||px===2540){o.ceCrumble=true;o.ceHomeY=o.y;o.ceCrumbleTime=.32;}}
   if(o.type==='ceSeedSocket')o.ceCatchRadius=22;
  }
  add({type:'ceSwitchMotor',x:x+1920,y:675,w:40,h:40});r.escape='carry-fold-crumble';
 }
 if(kind==='rootworks-fractured'){
  r.noDashFlight=true;r.escape='vertical-hoist-root-return-bell-pound-ring';
  const hoist=(px,y,tx,ty,trap=false)=>plat(px,76,y,{ceHoist:true,ceOriginX:x+px,ceOriginY:y,ceTargetX:x+tx,ceTargetY:ty,ceTrap:trap,ceAge:-1,ceDuration:.9});
  const root=(px,y)=>plat(px,104,y,{ceRoot:true,ceOriginX:x+px,ceOriginY:y,ceFullWidth:104,ceAnchorX:x+px-52,ceRootDir:1,ceRootAge:-1,ceRootLife:1.8,gone:true});
  hoist(430,30,430,280);root(810,250);crag(731,-400,52,632);
  hoist(1100,340,1420,480,true);hoist(1100,80,1580,200);root(1950,320);crag(1870,-400,52,703);
  crag(1350,290,420,25);crag(1430,660,500,700);crag(1470,250,50,550);add({type:'wall',x:x+1470,y:250,w:40,h:650,noCling:1,ceReturnGate:true,ceCandidateGate:true});
  bell(2240,450);hoist(2550,470,2850,660);crag(2390,-400,42,770);
  anvil(3330,240,58);tear(3570,600,4000,240,{setDown:1});crag(3780,-400,60,800);ring(4280,350,true);
 }
 if(kind==='return-stroke-fractured'){
  r.noDashFlight=true;r.escape='rebound-zip-vertical-weight-rebound-zip-blade-bell-rift';
  anvil(520,0,64);crag(655,-400,40,670);tear(760,330,1360,260,{setDown:1});
  const id=r.i+':weight';r.required.push(id);plat(1430,84,240,{ceWeight:true,ceMark:id,ceHomeX:x+1430,ceHomeY:240,ceToX:x+1430,ceToY:530,ceT:0,ceArmed:false});
  Object.assign(anvil(2660,150,54),{ceBrakeRebound:true});crag(2610,360,40,1140);crag(2930,-400,60,900);tear(2950,535,4050,360,{setDown:1});
  ring(4350,450,true);blade(4670,640,'uppercut');bell(4940,730);Object.assign(vein(5310,600,180,350),{ceVault:false});
 }
 if(kind==='return-stroke'){
  const hard=r.fracturedVariant,id=r.i+':weight',ax=hard?1910:1880;r.noDashFlight=true;
  r.required.push(id);plat(280,hard?94:130,0,{ceWeight:true,ceMark:id,ceHomeX:x+280,ceHomeY:0,ceToX:x+610,ceToY:hard?225:205,ceT:0,ceArmed:false});
  Object.assign(anvil(ax,hard?180:145,hard?54:78),{ceBrakeRebound:!hard});r.liftTarget=x+ax;
  if(!hard){crag(2150,-400,60,900);crag(1830,360,40,1140);}
  tear(hard?ax+230:2170,hard?415:530,hard?2370:3360,hard?260:260,{setDown:1});if(hard)crag(2220,-400,54,700);ring(hard?2660:3660,315,true);crag(hard?2510:3500,-400,70,535);
  if(hard){blade(3020,480,'uppercut');bell(3240,585);vein(3660,610,142,104);crag(3470,-400,54,1060);crag(3950,-400,46,1220);r.escape='lift-pound-ring-blade-vault';}
  else{
   plat(2170,120,495,{ceDock:true});plat(3360,140,260,{ceDock:true});
   plat(3850,120,210,{ceHoist:true,ceOriginX:x+3850,ceOriginY:210,ceTargetX:x+4210,ceTargetY:350,ceAge:-1,ceDuration:.9});
   crag(4050,-400,60,650);crag(4490,570,280,620);
   Object.assign(anvil(4650,230,110),{ceBrakeRebound:true});crag(4830,-400,50,920);
   plat(4930,110,520,{ceDock:true});tear(4930,555,6090,250,{setDown:1});plat(6090,160,250,{ceDock:true});ring(6350,360,true);bell(6670,430,.8,.6);
   r.end=x+7160;plat(7210,540,0,{deep:1,h:800});r.escape='two-lifts-two-pounds-resting-ziplines';
  }
 }
 return true;
}
root.BladefallPrecisionFractured=Object.freeze({build});
})(typeof window!=='undefined'?window:globalThis);
