import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const FOLDER=resolve(ROOT,'docs/charters/07-warden/evidence/validation');
const OUTPUT=resolve(FOLDER,'receipt.json');
const BASE_URL=process.env.BLADEFALL_URL||'http://127.0.0.1:8371/index.html';
const URL=`${BASE_URL}${BASE_URL.includes('?')?'&':'?'}validation=${Date.now()}`;
const source=await readFile(resolve(ROOT,'public/index.html'),'utf8');
const expectedVersion=source.match(/const VERSION='([^']+)'/)?.[1]||null;
await mkdir(resolve(FOLDER,'screens'),{recursive:true});
const browser=await puppeteer.launch({headless:true,protocolTimeout:60000,
  executablePath:process.env.PUPPETEER_EXECUTABLE_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  args:['--no-sandbox','--disable-background-timer-throttling','--disable-renderer-backgrounding']});
const page=await browser.newPage();await page.setViewport({width:1440,height:900,deviceScaleFactor:1});
const pageErrors=[];page.on('pageerror',e=>pageErrors.push(e.message));page.on('console',m=>{if(m.type()==='error')pageErrors.push(`console: ${m.text()}`);});
await page.goto(URL,{waitUntil:'domcontentloaded',timeout:30000});
async function reset(){await page.evaluate(()=>{if(G)G.sessionCapabilities=null;beginRun(0,null,{hp:1,dmg:1},{startStage:6,levelSelect:true});});}
await reset();
const topology=await page.evaluate(()=>({name:'reverse-authored-topology',pass:G.levelLength===15000&&G.portal===null&&G.geometryAudit.ok&&G.suppressVariantEnemies&&
  Math.abs(G.p.x-14480)<2&&G.p.face===-1&&G.obstacles.filter(o=>o.roomLandmark).length===6&&G.enemies.filter(e=>!e.boss).length===6&&
  G.obstacles.filter(o=>o.wardenHushField).length===1&&G.obstacles.filter(o=>o.wardenRotor).length===2&&portalProgressionProfile().mode==='pair'&&hasCapability('wall-jump')&&!hasCapability('counter'),
  spawn:{x:G.p.x,y:G.p.y,face:G.p.face},length:G.levelLength,landmarks:G.obstacles.filter(o=>o.roomLandmark).map(o=>o.kind),
  enemies:G.enemies.filter(e=>!e.boss).map(e=>e.wardenRole),music:currentLevelMusicCue(),geometry:G.geometryAudit,restSite:G.zoneRestSite}));

const shieldLesson=await page.evaluate(()=>{const guards=G.enemies.filter(e=>e.wardenRole==='turnkey');return{name:'authored-shield-turn-delay',pass:guards.length===4&&guards.every(e=>e.frontShield&&e.turnDelay>=1),guards:guards.map(e=>({x:e.x,shield:e.shieldFace,delay:e.turnDelay}))};});

const turningCells=await page.evaluate(()=>{const rotors=G.obstacles.filter(o=>o.wardenCellRotor),slates=G.obstacles.filter(o=>o.wardenCellSlate);
  const grounds=G.obstacles.filter(o=>o.deep&&o.x+o.w/2>5100&&o.x-o.w/2<7700);
  return{name:'turning-cells-are-three-required-mechanisms',pass:rotors.length===3&&slates.length===2&&grounds.length===4&&rotors.every(o=>o.hazard),
    rotors:rotors.map(o=>({cell:o.cellIndex,speed:o.speed,length:o.length})),slates:slates.map(o=>o.wardenCellSlate),groundSegments:grounds.length};});

const turningTraversal=await page.evaluate(()=>{
  beginRun(0,null,{hp:1,dmg:1},{startStage:6,levelSelect:true});mode='play';meta.testMode=false;
  const p=G.p,keys=window.__BF.input.keys,pressed=window.__BF.input.pressed,jump=kbCode('jump'),dash=kbCode('dash');
  const clear=()=>{keys.ArrowLeft=keys.ArrowRight=keys[jump]=keys[dash]=false;BFKeyboard.clearPressed();};
  const drive=(start,waypoints,frames=2600)=>{
    Object.assign(p,{x:start.x,y:start.y,vx:0,vy:0,onGround:start.y===0,dead:false,invuln:9999,ckX:start.x,ckY:start.y,ckSet:true});
    let targetIndex=0,lastJump=-99,lastDash=-99,maxY=p.y,minX=p.x,wallContacts=0,wallJumps=0;
    for(let frame=0;frame<frames&&targetIndex<waypoints.length&&!p.dead;frame++){
      const target=waypoints[targetIndex],dx=target.x-p.x;
      keys.ArrowLeft=dx<-14;keys.ArrowRight=dx>14;
      if(p.onWall)wallContacts++;
      if((p.onGround||p.onWall)&&frame-lastJump>20){if(p.onWall&&!p.onGround)wallJumps++;pressed[jump]=true;lastJump=frame;}
      keys[jump]=frame-lastJump<16;
      if(Math.abs(dx)>190&&p.y>120&&frame-lastDash>65){pressed[dash]=true;keys[dash]=true;lastDash=frame;}else keys[dash]=false;
      update(1/60);BFKeyboard.clearPressed();maxY=Math.max(maxY,p.y);minX=Math.min(minX,p.x);
      const landed=target.land&&p.onGround&&p.floorPlat&&Math.abs((p.floorPlat.x||0)-target.x)<125;
      if(landed||(!target.land&&Math.abs(dx)<100&&p.y>=target.y-70))targetIndex++;
    }
    clear();return{reached:targetIndex,total:waypoints.length,x:Math.round(p.x),y:Math.round(p.y),maxY:Math.round(maxY),minX:Math.round(minX),wallContacts,wallJumps,wallJumpOwned:hasCapability('wall-jump'),dead:p.dead};
  };
  const firstTwo=drive({x:7560,y:0},[
    {x:7340,y:60,land:true},{x:7250,y:110},{x:7350,y:220},{x:7250,y:320},{x:7350,y:410},{x:7130,y:510},{x:6950,y:360,land:true},
    {x:6710,y:310,land:true},{x:6600,y:560},{x:6480,y:650},{x:6280,y:500,land:true}
  ]);
  // The last cell is intentionally not another heroic dash. Its opposed slate
  // faces consume the independent pair earned from the Marksman.
  Object.assign(p,{x:6055,y:540,vx:-180,vy:0,onGround:false,dead:false,invuln:9999,_restMouth:null,_tpCd:0});
  G.cratePortals=[
    {x:6030,y:560,nx:1,ny:0,surf:'wall',face:'wall',side:0,pair:'personal',kind:'personal',colors:['#4fc3ff','#ff9a3b']},
    {x:5660,y:610,nx:-1,ny:0,surf:'wall',face:'wall',side:1,pair:'personal',kind:'personal',colors:['#4fc3ff','#ff9a3b']}
  ];
  const pairCount=portalPairs().length,directExit=portalTransit(p,1/60);
  keys.ArrowLeft=true;let transited=!!directExit,landedWest=false;
  for(let frame=0;frame<360&&!p.dead;frame++){update(1/60);BFKeyboard.clearPressed();
    if(p._portalExit)transited=true;if(p.x<5660&&p.onGround){landedWest=true;break;}}
  clear();
  return{name:'turning-cells-run-on-live-movement-and-portal-physics',pass:firstTwo.reached===firstTwo.total&&!firstTwo.dead&&
      firstTwo.minX<6370&&transited&&landedWest&&!p.dead,firstTwo,finalCell:{pairCount,transited,landedWest,x:Math.round(p.x),y:Math.round(p.y),dead:p.dead}};
});

const authoredAI=await page.evaluate(()=>{const e=G.enemies.find(q=>q.wardenRole==='turnkey'),target=G.p;
  Object.assign(e,{x:7000,y:0,active:true,wardenState:'guard',wardenCooldown:0});Object.assign(target,{x:7140,y:0,invuln:9999});
  const start=e.x;let committed=false,recovered=false;
  for(let i=0;i<180;i++){updateWardenEnemy(e,target,1/120,e.speed,{attack:true});if(e.wardenState==='commit')committed=true;if(committed&&e.wardenState==='recover')recovered=true;}
  return{name:'turnkey-commits-and-yields-a-recovery-opening',pass:committed&&recovered&&Math.abs(e.x-start)>8,state:e.wardenState,start,end:e.x,committed,recovered};});

await reset();
const sameSide=await page.evaluate(()=>{const e=G.boss;G.cratePortals=[{x:600,y:0,side:0,face:'floor',pair:'personal',kind:'personal',colors:['#4fc3ff','#ff9a3b']},{x:1000,y:0,side:1,face:'floor',pair:'personal',kind:'personal',colors:['#4fc3ff','#ff9a3b']}];
  Object.assign(G.p,{x:600,y:0,vx:0,vy:120,onGround:false,_restMouth:null,_tpCd:0});portalTransit(G.p,1/60);return{name:'same-side-does-not-open-guard',pass:!(G.p.wardenFlankT>0),flank:G.p.wardenFlankT||0,bossX:e.x};});

await reset();
const crossSide=await page.evaluate(()=>{const e=G.boss;G.cratePortals=[{x:600,y:0,side:0,face:'floor',pair:'personal',kind:'personal',colors:['#4fc3ff','#ff9a3b']},{x:2400,y:0,side:1,face:'floor',pair:'personal',kind:'personal',colors:['#4fc3ff','#ff9a3b']}];
  Object.assign(G.p,{x:600,y:0,vx:0,vy:120,onGround:false,_restMouth:null,_tpCd:0});portalTransit(G.p,1/60);const before=e.hp;G.p.x=e.x+100;e.shieldFace=-1;hitEnemy(e,20,1,0,0,null,'melee');
  return{name:'opposed-cross-opens-punish',pass:G.p.wardenFlankT>0&&e.hp<before,flank:G.p.wardenFlankT,crosses:e.wardenCrosses,hpBefore:before,hpAfter:e.hp};});

await reset();
const verticalSentence=await page.evaluate(()=>{const e=G.boss,p=G.p;e.wardenPhase=3;
  G.cratePortals=[{x:600,y:0,nx:0,ny:1,side:0},{x:2400,y:0,nx:0,ny:1,side:1}];Object.assign(p,{x:600,y:0,vx:0,vy:140,_restMouth:null,_tpCd:0,wardenFlankT:0});portalTransit(p,1/60);const flat=p.wardenFlankT||0;
  G.cratePortals=[{x:600,y:0,nx:0,ny:1,side:0},{x:2400,y:300,nx:0,ny:1,side:1}];Object.assign(p,{x:600,y:0,vx:0,vy:140,_restMouth:null,_tpCd:0,wardenFlankT:0});portalTransit(p,1/60);const folded=p.wardenFlankT||0;
  return{name:'final-sentence-requires-height-and-side-fold',pass:flat===0&&folded>0,flat,folded};});

await reset();
const portalBreak=await page.evaluate(()=>{const e=G.boss,p=G.p;e.active=true;e.hp=e.maxHp*.5;e.wardenPhase=2;e.phase=2;e.wardenState='pursuit';e.wardenPortalBreakCd=-1;
  G.cratePortals=[{x:610,y:0,nx:0,ny:1,side:0},{x:2390,y:0,nx:0,ny:1,side:1}];Object.assign(p,{x:2100,y:0,invuln:9999});
  updateWardenPortalFight(e,p,1/60,e.speed);const wind=e.wardenState;for(let i=0;i<120;i++)updateWardenPortalFight(e,p,1/120,e.speed);
  return{name:'warden-telegraphs-and-breaks-one-mouth',pass:wind==='portalBreakWind'&&G.cratePortals.length===1,wind,mouths:G.cratePortals.length};});

await reset();
const finalPortalPressure=await page.evaluate(()=>{const e=G.boss,p=G.p;e.active=true;e.hp=e.maxHp*.3;e.wardenPhase=3;e.phase=3;
  Object.assign(e,{wardenState:'pursuit',wardenPortalBreakCd:-1,wardenSentenceCd:9,wardenRushCd:-1,wardenSlamCd:5});
  G.cratePortals=[{x:610,y:0,nx:0,ny:1,side:0},{x:2390,y:210,nx:0,ny:1,side:1}];Object.assign(p,{x:2100,y:0,invuln:9999});
  updateWardenPortalFight(e,p,1/60,e.speed);const wind=e.wardenState;
  for(let i=0;i<150;i++)updateWardenPortalFight(e,p,1/120,e.speed);
  const remoteHit=G.aoes.some(a=>a.real&&a.type==='sentence');
  Object.assign(e,{wardenState:'pursuit',wardenRushCd:-1,wardenSentenceCd:5,wardenPortalBreakCd:5,wardenSlamCd:5});
  updateWardenPortalFight(e,p,1/60,e.speed);
  return{name:'final-portal-pair-survives-remote-pressure-without-an-extra-dash',pass:wind==='portalBreakWind'&&remoteHit&&
    G.cratePortals.length===2&&e.wardenState==='pursuit',wind,remoteHit,mouths:G.cratePortals.length,postPressureState:e.wardenState};});

await reset();
const phases=await page.evaluate(()=>{const e=G.boss,p=G.p;Object.assign(p,{x:2100,y:0,invuln:9999});e.active=true;
  e.hp=e.maxHp*.64;updateWardenPortalFight(e,p,1/60,e.speed);const two={phase:e.wardenPhase,rotors:G.obstacles.filter(o=>o.wardenCourtRotor&&o.hazard).length};
  e.hp=e.maxHp*.31;updateWardenPortalFight(e,p,1/60,e.speed);e.wardenState='pursuit';e.wardenSentenceCd=-1;updateWardenPortalFight(e,p,1/60,e.speed);
  const three={phase:e.wardenPhase,state:e.wardenState,movers:G.obstacles.filter(o=>o.wardenTurningCourt&&o.move).length};
  return{name:'three-distinct-court-phases',pass:two.phase===2&&two.rotors===2&&three.phase===3&&three.state==='sentenceWind'&&three.movers===5,two,three};});

await reset();
const returnedSentence=await page.evaluate(()=>{const e=G.boss,p=G.p;e.active=true;e.hp=e.maxHp*.3;e.wardenPhase=3;e.phase=3;
  Object.assign(e,{x:600,y:0,vx:0,vy:0,wardenState:'sentenceRush',wardenStateT:1,wardenSentenceChain:3,wardenRushDir:1,_tpCd:0,_restMouth:null});
  const mouthY=e.h*.5-20;G.cratePortals=[
    {x:613,y:mouthY,nx:-1,ny:0,side:0,face:'wall',pair:'personal',kind:'personal',colors:['#4fc3ff','#ff9a3b']},
    {x:2300,y:mouthY+210,nx:-1,ny:0,side:1,face:'wall',pair:'personal',kind:'personal',colors:['#4fc3ff','#ff9a3b']}
  ];Object.assign(p,{wardenFlankT:0,invuln:9999});updateWardenPortalFight(e,p,1/60,e.speed);
  return{name:'threefold-sentence-can-be-returned-through-player-pair',pass:e.wardenState==='sentenceCrash'&&e.wardenSentenceReturns===1&&p.wardenFlankT>2&&e.x>2200,
    state:e.wardenState,returns:e.wardenSentenceReturns,flank:p.wardenFlankT,x:e.x,y:e.y};});

await reset();
const deathReturn=await page.evaluate(()=>{const checkpoint=G.obstacles.find(o=>o.type==='check'&&Math.abs(o.x-2760)<2);
  const barrier=G.obstacles.find(o=>o.wardenArenaBarrier),threshold=G.obstacles.find(o=>o.wardenArenaThreshold);
  return{name:'sentence-well-death-return-cannot-be-barred',pass:!!checkpoint&&!barrier&&!!threshold,checkpoint:checkpoint&&checkpoint.x,barrier:!!barrier,threshold:!!threshold};});

await reset();
const reward=await page.evaluate(()=>{const e=G.boss;e.hp=0;killEnemy(e);const mine=G.obstacles.find(o=>o.wardenMineGate);
  const briefing=!!document.getElementById('wardenRoadContinue');Object.assign(G.p,{x:55,y:0,face:-1});const seam=physicalSeamSpec();
  return{name:'counter-reward-and-physical-road',pass:hasCapability('counter')&&G.portal===null&&mine.gone&&briefing&&G.p.blood===G.p.maxBlood&&seam.connector==='warden-frostfell'&&seam.targetStage===7,
    counter:hasCapability('counter'),portal:G.portal,mineGone:mine.gone,briefing,blood:[G.p.blood,G.p.maxBlood],seam};});

const counterTiming=await page.evaluate(()=>{mode='play';showOverlay(false);showGameUI(true);const p=G.p;
  Object.assign(p,{face:-1,counterT:.2,counterCd:.7,counterRiposteT:0,invuln:0});
  const direct=tryPlayerCounter('projectile',1,null),riposte=p.counterRiposteT>0;
  Object.assign(p,{counterT:.2,face:-1,invuln:0});const ground=tryPlayerCounter('aoe',1,null);
  return{name:'counter-is-directional-and-direct-only',pass:direct&&riposte&&!ground,direct,riposte,ground};});

const focals=[{x:13800,y:700},{x:11400,y:260},{x:8900,y:300},{x:6400,y:500},{x:4000,y:0},{x:1500,y:0}];
await reset();for(let i=0;i<focals.length;i++){await page.evaluate(({x,y})=>{Object.assign(G.p,{x,y,vx:0,vy:0});G.stageBanner=0;G.texts=[];G.outskirtsAnnotation=null;
  const toast=document.getElementById('toast'),notice=document.getElementById('stationNotice');if(toast)toast.classList.remove('show');if(notice)notice.classList.remove('show');
  G.cam=Math.max(0,Math.min(G.levelLength-VW,x-VW*.5));G.camY=Math.max(0,y-VH*.52);render();},focals[i]);await page.screenshot({path:resolve(FOLDER,'screens',`room-${i+1}.png`)});}

const probes=[topology,shieldLesson,turningCells,turningTraversal,authoredAI,sameSide,crossSide,verticalSentence,portalBreak,finalPortalPressure,phases,returnedSentence,deathReturn,reward,counterTiming];
const receipt={schema:'bladefall.warden-validation',version:1,generatedAt:new Date().toISOString(),url:URL,gameVersion:await page.evaluate(()=>VERSION),expectedVersion,
  pass:pageErrors.length===0&&probes.every(p=>p.pass),pageErrors,probes,screenshots:focals.map((f,i)=>({file:`screens/room-${i+1}.png`,...f}))};
await writeFile(OUTPUT,`${JSON.stringify(receipt,null,2)}\n`);await browser.close();console.log(JSON.stringify(receipt,null,2));if(!receipt.pass)process.exitCode=1;
