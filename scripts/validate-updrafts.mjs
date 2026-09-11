import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';
import puppeteer from 'puppeteer';

const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const FOLDER=resolve(ROOT,'docs/charters/04-updrafts/evidence/validation');
const URL=process.env.BLADEFALL_URL||'http://127.0.0.1:8371/index.html';
const delay=ms=>new Promise(done=>setTimeout(done,ms));
await mkdir(FOLDER,{recursive:true});
const source=await readFile(resolve(ROOT,'public/index.html'),'utf8');
const expectedVersion=source.match(/const VERSION='([^']+)'/)?.[1]||null;
const browser=await puppeteer.launch({headless:true,args:['--no-sandbox','--disable-background-timer-throttling']});
const page=await browser.newPage();await page.setViewport({width:1440,height:900,deviceScaleFactor:1});
const errors=[];page.on('pageerror',error=>errors.push(error.message));
await page.goto(URL,{waitUntil:'domcontentloaded',timeout:60000});
await page.waitForFunction(version=>window.__BF?.VERSION===version,{},expectedVersion);

const topology=await page.evaluate(()=>{
  beginRun(0,null,null,{levelSelect:true,startStage:3});mode='play';meta.testMode=false;
  const g=window.__BF.G,landmarks=g.obstacles.filter(o=>o.roomLandmark).map(o=>o.kind);
  return{name:'authored-topology',pass:g.levelLength===18000&&g.portal===null&&g.geometryAudit?.ok===true&&
    ['rootbreach-lift','bellows-rest','kite-stair','windwright-brace','needlewind-labyrinth','rain-catcher','signal-crown'].every(k=>landmarks.includes(k)),
    length:g.levelLength,landmarks,checks:g.obstacles.filter(o=>o.type==='check').length,geometry:g.geometryAudit};
});

const progression=await page.evaluate(()=>({name:'clean-level-select-prefix',pass:hasCapability('jump')&&hasCapability('weapon')&&hasCapability('dash')&&!hasCapability('portal-single')&&updraftsGateCount()===0,
  acquired:[...activeCapabilityProgress().acquired],gates:updraftsGateCount(),shortcut:updraftsShortcutOpen('rain-service-lift')}));

// The first gap is a real runtime proof, not coordinate arithmetic: identical
// jump input fails without Dash and lands on the authored shelf with Dash.
const dashGate=await page.evaluate(()=>{
  function trial(dash){
    beginRun(0,null,null,{levelSelect:true,startStage:3});mode='play';meta.testMode=false;
    const g=window.__BF.G,p=g.p,keys=window.__BF.input.keys,pressed=window.__BF.input.pressed;
    Object.assign(p,{x:280,y:0,vx:0,vy:0,onGround:true,face:1,ckX:70,ckY:0,dead:false,invuln:99});
    let maxX=p.x,landed=null;
    for(let frame=0;frame<180;frame++){
      keys.ArrowRight=true;keys.Space=frame<42;if(frame===2)pressed.Space=true;
      if(dash&&frame===14){pressed.KeyD=true;keys.KeyD=true;}if(frame===15)keys.KeyD=false;
      update(1/60);BFKeyboard.clearPressed();maxX=Math.max(maxX,p.x);
      if(frame>20&&p.onGround&&p.floorPlat?.dashLanding){landed=p.floorPlat.dashLanding;break;}
      if(frame>45&&p.x===70)break;
    }
    keys.ArrowRight=keys.Space=keys.KeyD=false;return{dash,landed,maxX:+maxX.toFixed(1),x:+p.x.toFixed(1),y:+p.y.toFixed(1)};
  }
  const plain=trial(false),dashed=trial(true);
  return{name:'opening-requires-dash',pass:plain.landed===null&&dashed.landed===1,plain,dashed};
});

const bellows=await page.evaluate(()=>{
  beginRun(0,null,null,{levelSelect:true,startStage:3});mode='play';meta.testMode=false;
  const g=window.__BF.G,p=g.p,pack=g.pickups.find(o=>o.jetpack),release=g.obstacles.find(o=>o.aeriePackRelease),
    returnLift=g.obstacles.find(o=>o.rainShortcutReturn);
  Object.assign(p,{x:returnLift.x,y:returnLift.y});const hidden=outskirtsInteractionCandidate()!==returnLift;
  const before={locked:pack.ritualLocked,door:circuitOpen('aerie-pack-owned'),returnHidden:hidden};
  pullLever(release);Object.assign(p,{x:pack.x,y:pack.y});update(1/60);
  return{name:'bellows-commissioning',pass:before.locked&&!before.door&&before.returnHidden&&!pack.ritualLocked&&p.hasJetpack&&circuitOpen('aerie-pack-owned'),
    before,after:{released:!pack.ritualLocked,pack:p.hasJetpack,door:circuitOpen('aerie-pack-owned')}};
});

const refillTransfers=await page.evaluate(()=>{
  function bellowsTrial(useCrystal){
    beginRun(0,null,null,{levelSelect:true,startStage:3});mode='play';meta.testMode=false;
    const g=window.__BF.G,p=g.p,keys=window.__BF.input.keys,pressed=window.__BF.input.pressed;
    const crystal=g.obstacles.find(o=>o.type==='crystal'&&Math.abs(o.x-2940)<3),
      target=g.obstacles.find(o=>o.packSanctum),start=g.obstacles.find(o=>o.packApproach===2);
    if(!useCrystal)crystal.cdT=999;
    Object.assign(p,{x:start.x,y:start.y,vx:0,vy:0,onGround:true,floorPlat:start,face:1,invuln:99,
      ckX:start.x,ckY:start.y+40,ckSet:true,dodgeCdT:0,dodgeTimer:0,jumps:0,airRefill:false});
    let touched=false,touchFrame=-1,landed=false,maxX=p.x,maxY=p.y,trace=[];
    for(let frame=0;frame<260;frame++){
      keys.ArrowRight=p.x<target.x-18;keys.ArrowLeft=p.x>target.x+18;keys.Space=frame<24;
      if(frame===0)pressed.Space=true;
      if(frame===8){pressed.KeyD=true;keys.KeyD=true;}else keys.KeyD=false;
      if(useCrystal&&!touched&&crystal.cdT>0){touched=true;touchFrame=frame;}
      // Hold the restored jump long enough to exercise the same variable-height
      // jump a player would use, instead of cutting it on the following frame.
      if(touched&&frame>touchFrame&&frame<=touchFrame+18)keys.Space=true;
      if(touched&&frame===touchFrame+1){pressed.Space=true;pressed.KeyD=true;keys.Space=true;keys.KeyD=true;}
      update(1/60);BFKeyboard.clearPressed();maxX=Math.max(maxX,p.x);maxY=Math.max(maxY,p.y);
      if(touched&&frame<=touchFrame+4)trace.push({frame,x:Math.round(p.x),y:Math.round(p.y),vy:Math.round(p.vy),jumps:p.jumps,airRefill:p.airRefill,dash:+p.dodgeTimer.toFixed(2)});
      if(p.onGround&&p.floorPlat===target){landed=true;break;}
      if(frame>100&&p.onGround&&p.y<start.y-80)break;
    }
    keys.ArrowRight=keys.ArrowLeft=keys.Space=keys.KeyD=false;
    return{useCrystal,touched,landed,maxX:Math.round(maxX),maxY:Math.round(maxY),x:Math.round(p.x),y:Math.round(p.y),trace};
  }
  function kiteTrial({pack,dash,crystal:useCrystal}){
    beginRun(0,null,null,{levelSelect:true,startStage:3});mode='play';meta.testMode=false;
    const g=window.__BF.G,p=g.p,keys=window.__BF.input.keys,pressed=window.__BF.input.pressed,
      crystal=g.obstacles.find(o=>o.type==='crystal'&&Math.abs(o.x-5260)<3),
      target=g.obstacles.find(o=>o.threeVerbLanding),start=g.obstacles.find(o=>o.aerieNest&&o.x===4780);
    if(!useCrystal)crystal.cdT=999;
    Object.assign(p,{x:start.x,y:start.y,vx:0,vy:0,onGround:true,floorPlat:start,face:1,invuln:99,
      hasJetpack:pack,fuel:pack?100:0,ckX:start.x,ckY:start.y+40,ckSet:true,dodgeCdT:0,dodgeTimer:0,jumps:0,airRefill:false});
    let touched=false,touchFrame=-1,landed=false,maxX=p.x,maxY=p.y,minFuel=p.fuel;
    for(let frame=0;frame<720;frame++){
      keys.ArrowRight=p.x<target.x-16;keys.ArrowLeft=p.x>target.x+16;
      keys.Space=pack?frame<360:frame<24;
      if(frame===0)pressed.Space=true;
      if(dash&&frame===8){pressed.KeyD=true;keys.KeyD=true;}else keys.KeyD=false;
      if(useCrystal&&!touched&&crystal.cdT>0){touched=true;touchFrame=frame;keys.Space=false;}
      if(touched&&frame===touchFrame+1){pressed.Space=true;keys.Space=true;if(dash){pressed.KeyD=true;keys.KeyD=true;}}
      update(1/60);BFKeyboard.clearPressed();maxX=Math.max(maxX,p.x);maxY=Math.max(maxY,p.y);minFuel=Math.min(minFuel,p.fuel||0);
      if(p.onGround&&p.floorPlat===target){landed=true;break;}
      if(frame>180&&p.onGround&&p.y<start.y-80)break;
    }
    keys.ArrowRight=keys.ArrowLeft=keys.Space=keys.KeyD=false;
    return{pack,dash,useCrystal,touched,landed,maxX:Math.round(maxX),maxY:Math.round(maxY),minFuel:Math.round(minFuel),x:Math.round(p.x),y:Math.round(p.y)};
  }
  const bellowsPlain=bellowsTrial(false),bellowsRefill=bellowsTrial(true),
    allThree=kiteTrial({pack:true,dash:true,crystal:true}),
    noCrystal=kiteTrial({pack:true,dash:true,crystal:false}),
    noDash=kiteTrial({pack:true,dash:false,crystal:true}),
    noPack=kiteTrial({pack:false,dash:true,crystal:true});
  return{name:'crystals-own-both-transfers',pass:!bellowsPlain.landed&&bellowsRefill.touched&&bellowsRefill.landed&&
    allThree.landed&&!noCrystal.landed&&!noDash.landed&&!noPack.landed,
    bellowsPlain,bellowsRefill,kiteMatrix:{allThree,noCrystal,noDash,noPack}};
});

const bellowsRetry=await page.evaluate(()=>{
  beginRun(0,null,null,{levelSelect:true,startStage:3});mode='play';meta.testMode=false;
  const g=window.__BF.G,p=g.p,keys=window.__BF.input.keys,pressed=window.__BF.input.pressed,
    road=g.obstacles.find(o=>o.deep&&3180>=o.x-o.w/2&&3180<=o.x+o.w/2),
    retry=g.obstacles.find(o=>o.bellowsRetryStep),perch=g.obstacles.find(o=>o.packApproach===2);
  Object.assign(p,{x:3180,y:0,vx:0,vy:0,onGround:true,floorPlat:road,face:-1,invuln:99,
    ckX:3180,ckY:40,ckSet:true,dodgeCdT:0,dodgeTimer:0,jumps:0,airRefill:false});
  let phase=0,launched=false,landedRetry=false,landedPerch=false;
  for(let frame=0;frame<360;frame++){
    const target=phase===0?retry:perch,dx=target.x-p.x;
    keys.ArrowLeft=dx<-6;keys.ArrowRight=dx>6;keys.Space=false;keys.KeyD=false;
    const readyToLaunch=phase===0||p.x<=retry.x-retry.w/2+25;
    if(!launched&&p.onGround&&readyToLaunch){pressed.Space=true;keys.Space=true;launched=true;}
    else if(launched&&!p.onGround&&p.vy<0)keys.Space=true;
    update(1/60);BFKeyboard.clearPressed();
    if(phase===0&&p.onGround&&p.floorPlat===retry){landedRetry=true;phase=1;launched=false;}
    if(phase===1&&p.onGround&&p.floorPlat===perch){landedPerch=true;break;}
  }
  keys.ArrowLeft=keys.ArrowRight=keys.Space=keys.KeyD=false;
  return{name:'bellows-miss-is-reversible',pass:landedRetry&&landedPerch,landedRetry,landedPerch,x:Math.round(p.x),y:Math.round(p.y)};
});

const machinery=await page.evaluate(()=>{
  beginRun(0,null,null,{levelSelect:true,startStage:3});mode='play';meta.testMode=false;
  const g=window.__BF.G,cinder=g.obstacles.find(o=>o.cinderVessel),channel=g.obstacles.find(o=>o.choirIgnitable),
    vane=g.obstacles.find(o=>o.windVane),collectors=g.obstacles.filter(o=>o.windCollector);
  pullLever(cinder);
  const fireEnemy=g.enemies.find(e=>e.updraftRole==='current-diver');fireEnemy.hp=fireEnemy.maxHp;fireEnemy.burnT=0;fireEnemy.burnDps=0;
  const fireHp=fireEnemy.hp;
  for(let frame=0;frame<90;frame++){fireEnemy.x=channel.x;fireEnemy.y=260;fireEnemy.baseY=260;fireEnemy.active=true;update(1/60);}
  const fireHurts=fireEnemy.hp<fireHp;
  for(let frame=0;frame<60*9;frame++)update(1/60);
  Object.assign(g.p,{hasJetpack:true,x:vane.x,y:vane.y+30,onGround:false});updateObstacles(1/60);
  const west=collectors.find(o=>o.collectorIndex===1),heart=collectors.find(o=>o.collectorIndex===2),east=collectors.find(o=>o.collectorIndex===3);
  heart.x=heart.collectorAt;pullLever(heart);const heartRejected=!heart.timer;
  west.y=west.collectorAt;pullLever(west);const westLatched=west.timer>0&&circuitOpen('collector-west');
  heart.x=heart.collectorAt;pullLever(heart);const heartLatched=heart.timer>0&&circuitOpen('collector-heart');
  east.y=east.collectorAt;pullLever(east);const eastLatched=east.timer>0;
  const forbidden=(g.texts||[]).map(row=>row.text).filter(text=>/THE WAY OPENS|CINDERS RISE|COLLECTOR|THIRD SAIL/.test(text));
  return{name:'three-reliable-machines',pass:circuitOpen('wind-gate-1')&&circuitOpen('wind-gate-2')&&circuitOpen('wind-gate-3')&&
    updraftsGateCount()===3&&channel._bfReaction?.element==='fire'&&channel._bfReaction.time>1e8&&fireHurts&&
    heartRejected&&westLatched&&heartLatched&&eastLatched&&forbidden.length===0,
    gates:['wind-gate-1','wind-gate-2','wind-gate-3'].map(id=>({id,open:circuitOpen(id)})),
    fire:{element:channel._bfReaction?.element,time:channel._bfReaction?.time,hpBefore:fireHp,hpAfter:fireEnemy.hp,hurts:fireHurts},
    collectorSequence:{heartRejected,westLatched,heartLatched,eastLatched},collectors:collectors.map(o=>({id:o.id,aligned:o.aligned})),forbidden};
});

const shortcut=await page.evaluate(()=>{
  const g=window.__BF.G,p=g.p,far=g.obstacles.find(o=>o.rainShortcut),ret=g.obstacles.find(o=>o.rainShortcutReturn);
  Object.assign(p,{x:far.x,y:far.y});beginOutskirtsInteraction();const opened=updraftsShortcutOpen('rain-service-lift'),westX=p.x;
  Object.assign(p,{x:ret.x,y:ret.y});const candidate=outskirtsInteractionCandidate();beginOutskirtsInteraction();
  return{name:'optional-two-way-service-lift',pass:opened&&westX===2410&&candidate===ret&&p.x===13790,opened,westX,returnCandidate:candidate===ret,eastX:p.x};
});

const rainReturn=await page.evaluate(()=>{
  beginRun(0,null,null,{levelSelect:true,startStage:3});mode='play';meta.testMode=false;
  const g=window.__BF.G,p=g.p,keys=window.__BF.input.keys,target=g.obstacles.find(o=>o.x===15020&&o.y===300),
    vent=g.obstacles.find(o=>o.rainReturnVent),wall=g.obstacles.find(o=>o.cisternWall&&o.basinSide==='east');
  g.sessionCapabilities=levelSelectCapabilitiesForStage(6);syncMovementCapabilities();restoreSolvedBacktrackDoors();
  Object.assign(p,{hasJetpack:true,fuel:100,x:15325,y:0,vx:0,vy:0,onGround:true,floorPlat:null,dead:false,invuln:9999});
  let phase='cross',crossed=false,clearedLip=false,landed=false,maxY=0,minX=p.x;
  for(let frame=0;frame<720&&!p.dead;frame++){
    if(phase==='cross'&&p.x<=15148)phase='rise';
    if(phase==='rise'&&p.y>=345){phase='drift';clearedLip=true;}
    keys.ArrowLeft=phase==='cross'||(phase==='drift'&&p.x>15035);keys.ArrowRight=false;keys.Space=false;
    update(1/60);BFKeyboard.clearPressed();maxY=Math.max(maxY,p.y);minX=Math.min(minX,p.x);
    if(p.x<wall.x-wall.w/2-p.w/2)crossed=true;
    if(p.onGround&&p.floorPlat===target){landed=true;break;}
  }
  keys.ArrowLeft=keys.ArrowRight=keys.Space=false;
  return{name:'solved-rain-catcher-has-a-live-westbound-return',pass:!!vent&&circuitOpen('wind-gate-3')&&crossed&&landed&&!p.dead,
    vent:{x:vent&&vent.x,w:vent&&vent.w,active:vent&&circuitOpen(vent.requiresCircuit)},wall:{x:wall.x,w:wall.w},
    crossed,clearedLip,landed,phase,maxY:Math.round(maxY),minX:Math.round(minX),player:{x:Math.round(p.x),y:Math.round(p.y),dead:p.dead}};
});

const needlewind=await page.evaluate(()=>{
  const g=window.__BF.G,tunnels=g.obstacles.filter(o=>o.type==='windTunnel'),main=tunnels.find(o=>o.id==='needlewind-main'),
    inner=tunnels.find(o=>o.id==='needlewind-inner-eye'),high=tunnels.find(o=>o.id==='needlewind-high-arc'),dead=tunnels.find(o=>o.id==='needlewind-torn-sail');
  const mainSamples=windTunnelSamples(main),innerSamples=windTunnelSamples(inner),highSamples=windTunnelSamples(high),deadSamples=windTunnelSamples(dead);
  return{name:'extended-branching-needlewind',pass:tunnels.length===4&&mainSamples.length>250&&innerSamples.length>55&&highSamples.length>40&&
    dead.force===0&&deadSamples.length>15&&g.obstacles.filter(o=>o.safePocket).length===3,
    tunnels:tunnels.map(o=>({id:o.id,branch:!!o.optionalNeedleBranch,deadEnd:!!o.deadEndBranch,force:o.force,samples:windTunnelSamples(o).length})),
    safePockets:g.obstacles.filter(o=>o.safePocket).map(o=>o.safePocket)};
});

const normalFlight=await page.evaluate(()=>{
  beginRun(0,null,null,{levelSelect:true,startStage:3});mode='play';meta.testMode=false;
  const g=window.__BF.G,p=g.p,main=g.obstacles.find(o=>o.id==='needlewind-main'),samples=windTunnelSamples(main),keys=window.__BF.input.keys;
  // Invulnerability isolates route/fuel connectivity from the intentional
  // damage difficulty; boundary lethality is covered by the stage unit contract.
  Object.assign(p,{hasJetpack:true,fuel:100,x:samples[0].x,y:samples[0].y-p.h/2,vx:0,vy:0,onGround:false,floorPlat:null,invuln:999,blood:5,hp:100,ckX:8520,ckY:105});
  let progress=0,minFuel=100,resets=0,maxX=p.x;
  for(let frame=0;frame<60*60&&progress<samples.length-3;frame++){
    let best=progress,bestDistance=Infinity;
    for(let i=Math.max(0,progress-4);i<=Math.min(samples.length-1,progress+16);i++){
      const distance=Math.hypot(p.x-samples[i].x,p.y+p.h/2-samples[i].y);if(distance<bestDistance){bestDistance=distance;best=i;}
    }
    if(best>progress&&bestDistance<90)progress=best;
    const target=samples[Math.min(samples.length-1,progress+8)],dx=target.x-p.x,dy=target.y-(p.y+p.h/2),desiredVy=Math.max(-220,Math.min(220,-dy*2.4));
    keys.ArrowRight=dx>5;keys.ArrowLeft=dx<-5;keys.Space=p.vy>desiredVy+12;
    if(p.onGround){window.__BF.input.pressed.Space=true;keys.Space=true;}
    update(1/60);BFKeyboard.clearPressed();minFuel=Math.min(minFuel,p.fuel);maxX=Math.max(maxX,p.x);if(p.dead||p.x<8400){resets++;break;}
  }
  keys.ArrowRight=keys.ArrowLeft=keys.Space=false;const ratio=progress/(samples.length-1);
  return{name:'normal-speed-route-connectivity',pass:ratio>.95&&maxX>12800&&!p.dead&&resets===0,ratio:+ratio.toFixed(3),maxX:Math.round(maxX),x:Math.round(p.x),y:Math.round(p.y),fuel:+p.fuel.toFixed(1),minFuel:+minFuel.toFixed(1),blood:p.blood,resets};
});

const crown=await page.evaluate(()=>{
  const g=window.__BF.G,p=g.p,floor=g.obstacles.find(o=>o.crownRecoveryFloor),ilyra=g.npcs.find(o=>o.profileId==='ilyra');
  pullLever(g.obstacles.find(o=>o.cinderVessel));g.obstacles.find(o=>o.windVane).pressed=true;
  for(const o of g.obstacles.filter(o=>o.windCollector).sort((a,b)=>a.collectorIndex-b.collectorIndex)){
    o[o.collectorAxis]=o.collectorAt;pullLever(o);
  }
  Object.assign(p,{hasJetpack:true,fuel:0,x:16500,y:0,onGround:true,floorPlat:floor});update(1/60);const fuel=p.fuel;
  // The safe claim position is deliberately outside the Crown lift. It must
  // remain grounded while the three-gate updraft is active.
  Object.assign(p,{x:16540,y:0,vx:0,vy:0,onGround:true,floorPlat:floor});let safe=true;
  for(let frame=0;frame<90;frame++){update(1/60);if(p.y>8)safe=false;}
  Object.assign(p,{x:16440,y:0,vx:0,vy:0,onGround:true,floorPlat:floor});ilyra.x=16440;ilyra.y=0;
  interactWithIlyra(ilyra);
  const gun=g.pickups.find(pk=>pk.portalSingle),authorized=!!(gun&&!gun.ritualLocked),premature=hasCapability('portal-single');
  Object.assign(p,{x:16540,y:0,vx:0,vy:0,onGround:true,floorPlat:floor});
  window.__BF.input.pressed.KeyR=true;update(1/60);BFKeyboard.clearPressed();
  const claimed=hasCapability('portal-single');
  const acquisition=G.outskirtsAnnotation&&{title:G.outskirtsAnnotation.title,body:G.outskirtsAnnotation.body,
    kind:G.outskirtsAnnotation.kind,radius:G.outskirtsAnnotation.radius,anchored:G.outskirtsAnnotation.source===gun};
  Object.assign(p,{x:g.levelLength-40,y:780,face:1});const seam=physicalSeamSpec();
  return{name:'recoverable-crown-and-exit',pass:fuel===100&&safe&&authorized&&!premature&&claimed&&hasCapability('portal-single')&&ilyra.done&&
    acquisition?.title==='LINKED PORTAL REMEMBERED'&&acquisition.kind==='marker'&&acquisition.radius===420&&acquisition.anchored&&
    circuitOpen('updrafts-clearance')&&seam?.connector==='updrafts-marksman'&&seam.cross,
    fuel,safe,authorized,premature,claimed,acquisition,portal:hasCapability('portal-single'),ilyraDone:ilyra.done,clearance:circuitOpen('updrafts-clearance'),seam};
});

const bloodAndRecovery=await page.evaluate(()=>{
  beginRun(0,null,null,{levelSelect:true,startStage:3});mode='play';meta.testMode=false;
  let g=window.__BF.G,p=g.p;Object.assign(p,{blood:5,maxBlood:5,bloodGuard:0,bloodRecovery:0,invuln:0,onGround:true,x:17000,y:0});
  p.armorMods=Object.assign({},p.armorMods||{},{defense:.2});
  const hits=[];
  for(let i=0;i<5;i++){p.invuln=0;hurtPlayer(20,1,true);hits.push({blood:p.blood,guard:+p.bloodGuard.toFixed(3)});}
  Object.assign(p,{blood:3,bloodRecovery:0});syncBloodMirror(p);restoreBlood(p,.4);const partial={blood:p.blood,recovery:p.bloodRecovery};restoreBlood(p,.6);
  hudUpdate();const widths=[...document.querySelectorAll('#bloodMeasures .blood-measure>i')].map(node=>node.style.width);
  const integerHits=hits.every(row=>Number.isInteger(row.blood)),wholePixels=widths.every(width=>width==='0%'||width==='100%');

  // A lethal fall reloads without exposing the recovery system's internal id.
  activateRuntimeCheckpoint('updrafts:objects:check:13470:0:77',{x:17020,y:0},'checkpoint',null,true);
  p.blood=1;p.bloodGuard=0;p.invuln=0;hurtPlayer(0,0,false,1);g=window.__BF.G;
  const notice=(document.getElementById('stationNotice')?.textContent||'')+' '+(document.getElementById('toast')?.textContent||'');
  const cleanRespawn=!/objects:check|13470:0:77/.test(notice)&&g.stageBanner===0;

  // Missing the final lip is a retry, never a pocket behind an unclimbable wall.
  p=g.p;Object.assign(p,{blood:5,bloodGuard:0,invuln:0,x:17905,y:110,vx:0,vy:0,onGround:false,
    ckSet:true,ckX:17020,ckY:0,floorPlat:null});
  let returned=false;
  for(let frame=0;frame<240;frame++){update(1/60);if(p.x<17500){returned=true;break;}}
  return{name:'whole-blood-clean-respawn-and-crown-retry',pass:integerHits&&hits[0].blood===4&&hits[3].blood===1&&hits[4].blood===1&&
    partial.blood===3&&p.bloodRecovery===0&&wholePixels&&cleanRespawn&&returned,
    hits,partial,afterRecovery:p.blood,widths,notice,stageBanner:g.stageBanner,returned,x:Math.round(p.x),y:Math.round(p.y)};
});

// Evidence images use the exact same browser state as validation. No gameplay
// object is moved except the invulnerable camera proxy.
await page.evaluate(()=>{beginRun(0,null,null,{levelSelect:true,startStage:3});mode='play';meta.testMode=false;window.__BF.G.p.hasJetpack=true;window.__BF.G.p.fuel=100;});
for(const [name,x,y,action] of [['rootbreach',760,180],['bellows-rest',2900,300],['kite-refill',5350,1150],['choir-lit',7200,280,'cinder'],['needlewind-entry',9300,560],['needlewind-forks',11900,650],['rain-catcher',14600,300],['signal-crown',16540,0,'authorized'],['signal-crown-acquisition',16540,0,'claim']]){
  await page.evaluate(({x,y,action})=>{const g=window.__BF.G;if(action==='cinder')pullLever(g.obstacles.find(o=>o.cinderVessel));if(action==='gates'){
    pullLever(g.obstacles.find(o=>o.cinderVessel));g.obstacles.find(o=>o.windVane).pressed=true;
    for(const o of g.obstacles.filter(o=>o.windCollector).sort((a,b)=>a.collectorIndex-b.collectorIndex)){o[o.collectorAxis]=o.collectorAt;pullLever(o);}}
    if(action==='authorized'){
      pullLever(g.obstacles.find(o=>o.cinderVessel));g.obstacles.find(o=>o.windVane).pressed=true;
      for(const o of g.obstacles.filter(o=>o.windCollector).sort((a,b)=>a.collectorIndex-b.collectorIndex)){o[o.collectorAxis]=o.collectorAt;pullLever(o);}
      const ilyra=g.npcs.find(n=>n.profileId==='ilyra');Object.assign(g.p,{x:16440,y:0,onGround:true});interactWithIlyra(ilyra);
    }
    if(action==='claim'){Object.assign(g.p,{x:16540,y:0,onGround:true});window.__BF.input.pressed.KeyR=true;update(1/60);BFKeyboard.clearPressed();}
    Object.assign(g.p,{x,y,vx:0,vy:0,invuln:99});g.cam=Math.max(0,x-720);g.camY=Math.max(0,y-450);g.shake=0;g.stageBanner=0;g.texts.length=0;g.particles.length=0;
    const toastNode=document.getElementById('toast'),station=document.getElementById('stationNotice');
    if(toastNode)toastNode.classList.remove('show');if(station)station.classList.remove('show');
    window.__BF.camera.reset(g.cam,g.camY);window.__BF.camera.sync(g.cam,g.camY);},{x,y,action});
  await delay(80);await page.screenshot({path:resolve(FOLDER,`${name}.png`),type:'png'});
}

const probes=[topology,progression,dashGate,bellows,refillTransfers,bellowsRetry,machinery,shortcut,rainReturn,needlewind,normalFlight,crown,bloodAndRecovery];
const receipt={version:expectedVersion,url:URL,generatedAt:new Date().toISOString(),pass:errors.length===0&&probes.every(probe=>probe.pass),errors,probes};
await writeFile(resolve(FOLDER,'receipt.json'),JSON.stringify(receipt,null,2)+'\n');
await browser.close();console.log(JSON.stringify(receipt,null,2));if(!receipt.pass)process.exitCode=1;
