import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const FOLDER=resolve(ROOT,'docs/charters/06-ruined-keep/evidence/validation');
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
async function reset(){await page.evaluate(()=>{if(G)G.sessionCapabilities=null;beginRun(0,null,{hp:1,dmg:1},{startStage:5,levelSelect:true});});}
await reset();

const topology=await page.evaluate(()=>({name:'six-room-folded-keep',pass:G.levelLength===18000&&G.portal===null&&G.geometryAudit.ok&&
  G.obstacles.filter(o=>o.roomLandmark).length===6&&G.obstacles.filter(o=>o.belfryWeight).length===2&&
  G.obstacles.some(o=>o.belfryFoldGate)&&G.obstacles.some(o=>o.belfryArchiveGate)&&!hasCapability('wall-jump'),
  rooms:G.obstacles.filter(o=>o.roomLandmark).map(o=>o.kind),weights:G.obstacles.filter(o=>o.belfryWeight).length,
  music:currentLevelMusicCue(),geometry:G.geometryAudit}));

const gripContract=await page.evaluate(()=>{const before=meta.bestStage||0,grip=G.obstacles.find(o=>o.keepWallJump);
  Object.assign(G.p,{x:grip.x,y:0,onGround:true,vx:0,vy:0});beginOutskirtsInteraction();
  return{name:'grip-grants-only-wall-jump',pass:hasCapability('wall-jump')&&!G.ruinedKeepArchiveComplete&&(meta.bestStage||0)===before,
    wallJump:hasCapability('wall-jump'),archiveComplete:!!G.ruinedKeepArchiveComplete,bestBefore:before,bestAfter:meta.bestStage||0};});

const bilateral=await page.evaluate(()=>{const wall=G.obstacles.find(o=>o.type==='wall'&&o.x===13480),p=G.p,results=[];
  for(const side of [-1,1]){Object.assign(p,{x:wall.x+side*(wall.w/2+p.w/2),y:260,vx:0,vy:80,onGround:false,onWall:false,wallDir:0,invuln:9999});
    update(1/120);results.push({side,onWall:p.onWall,wallDir:p.wallDir});}
  return{name:'bilateral-wall-contact',pass:results[0].onWall&&results[0].wallDir===1&&results[1].onWall&&results[1].wallDir===-1,results};});

const archiveTraversal=await page.evaluate(()=>{
  beginRun(0,null,{hp:1,dmg:1},{startStage:5,levelSelect:true});mode='play';meta.testMode=false;
  grantMasonsGrip();for(const id of ['belfry-fold','belfry-bell']){const plate=G.obstacles.find(o=>o.id===id);plate.pressed=true;}
  const p=G.p,keys=window.__BF.input.keys,pressed=window.__BF.input.pressed,jump=kbCode('jump'),dash=kbCode('dash');
  const waypoints=[
    {x:14900,y:30},{x:15110,y:270},{x:15490,y:460},{x:15870,y:650},
    {x:16250,y:860},{x:16395,y:900},{x:16560,y:890},{x:16620,y:990},{x:16740,y:1070},{x:16810,y:1070}
  ];
  Object.assign(p,{x:14580,y:0,vx:0,vy:0,onGround:true,dead:false,invuln:9999,ckX:14580,ckY:0,ckSet:true});
  let targetIndex=0,lastJump=-99,lastDash=-99,maxY=0,minX=p.x,trace=[];
  for(let frame=0;frame<3600&&targetIndex<waypoints.length&&!p.dead;frame++){
    const target=waypoints[targetIndex],dx=target.x-p.x;
    keys.ArrowRight=dx>16;keys.ArrowLeft=dx<-16;
    const shouldJump=(p.onGround||p.onWall)&&frame-lastJump>20;
    if(shouldJump){pressed[jump]=true;lastJump=frame;}
    keys[jump]=frame-lastJump<16;
    // The crown is deliberately wider than a wall-jump. The route composes the
    // previously earned Dash with the new Grip for its final commitment.
    if(targetIndex>=4&&p.y>820&&dx>120&&frame-lastDash>70){pressed[dash]=true;keys[dash]=true;lastDash=frame;}
    else keys[dash]=false;
    update(1/60);BFKeyboard.clearPressed();maxY=Math.max(maxY,p.y);minX=Math.min(minX,p.x);
    if(Math.abs(dx)<105&&p.y>=target.y-85){trace.push({target:targetIndex,x:Math.round(p.x),y:Math.round(p.y),frame});targetIndex++;}
  }
  keys.ArrowRight=keys.ArrowLeft=keys[jump]=keys[dash]=false;
  return{name:'archive-climb-uses-live-wall-jump-physics',pass:targetIndex===waypoints.length&&!p.dead&&p.x>16680&&maxY>1030,
    reached:targetIndex,total:waypoints.length,player:{x:Math.round(p.x),y:Math.round(p.y),dead:p.dead},maxY:Math.round(maxY),minX:Math.round(minX),trace};
});

async function routeWeight({floorX,wallX,wallY,wallNX,releaseId,plateId}){await reset();return page.evaluate(({floorX,wallX,wallY,wallNX,releaseId,plateId})=>{
  const weight=G.obstacles.find(o=>o.belfryWeight&&o.targetPlate===plateId),release=G.obstacles.find(o=>o.belfryRelease===releaseId),plate=G.obstacles.find(o=>o.id===plateId);
  G.cratePortals=[{x:floorX,y:0,nx:0,ny:1,surf:'floor',side:0},{x:wallX,y:wallY,nx:wallNX,ny:0,surf:'wall',side:1}];
  pullLever(release);Object.assign(G.p,{x:release.x,y:release.y,invuln:9999});let transited=false;
  for(let frame=0;frame<720;frame++){update(1/120);if(weight._portalExit)transited=true;if(plate.pressed)break;}
  return{name:`${plateId}-portal-weight`,pass:transited&&plate.pressed&&circuitOpen(plateId),transited,pressed:plate.pressed,
    weight:{x:weight.x,y:weight.y,vx:weight.vx,vy:weight.vy,released:weight.belfryReleased},release:{timer:release.timer,dur:release.dur,circuit:circuitOpen(`belfry-release-${releaseId==='fold'?'a':'b'}`)},mouths:G.cratePortals.map(m=>({x:m.x,y:m.y,nx:m.nx,ny:m.ny}))};
},{floorX,wallX,wallY,wallNX,releaseId,plateId});}
const folded=await routeWeight({floorX:11580,wallX:12720,wallY:256,wallNX:-1,releaseId:'fold',plateId:'belfry-fold'});
const bell=await routeWeight({floorX:13540,wallX:14160,wallY:736,wallNX:1,releaseId:'bell',plateId:'belfry-bell'});

await reset();
const completion=await page.evaluate(()=>{const fold=G.obstacles.find(o=>o.id==='belfry-fold'),bell=G.obstacles.find(o=>o.id==='belfry-bell');fold.pressed=true;bell.pressed=true;
  const grip=G.obstacles.find(o=>o.keepWallJump);Object.assign(G.p,{x:grip.x,y:0,onGround:true});beginOutskirtsInteraction();
  const key=G.obstacles.find(o=>o.keepVaultKey);Object.assign(G.p,{x:key.x,y:key.y,onGround:true,vx:0,vy:0});beginOutskirtsInteraction();
  return{name:'level-select-archive-completes-and-opens-its-session-seal',pass:!!G.ruinedKeepArchiveComplete&&!!G.keepWestSealOpen&&
    !meta.world.keepWestSealOpen&&key.read&&key.used,complete:!!G.ruinedKeepArchiveComplete,sessionSeal:!!G.keepWestSealOpen,
    campaignSeal:!!meta.world.keepWestSealOpen,key:{read:key.read,used:key.used}};});

const solvedDoorReturn=await page.evaluate(()=>{
  const before=G.obstacles.filter(o=>o.type==='door'&&['keep-weight','belfry-fold','belfry-bell'].includes(o.circuit))
    .map(o=>({id:o.circuit,x:o.x,open:doorOpen(o)}));
  captureCurrentZonePersistence();loadStage(5);
  const after=G.obstacles.filter(o=>o.type==='door'&&['keep-weight','belfry-fold','belfry-bell'].includes(o.circuit))
    .map(o=>({id:o.circuit,x:o.x,open:doorOpen(o),persistent:persistentCircuitOpen(o.circuit)}));
  const first=after.slice().sort((a,b)=>b.x-a.x)[0];
  return{name:'solved-keep-doors-remain-open-on-the-actual-westward-return',pass:before.length===3&&before.every(o=>o.open)&&
    after.length===3&&after.every(o=>o.open&&o.persistent)&&first.id==='belfry-bell',before,after,firstBacktrackDoor:first};
});

const westwardRoute=await page.evaluate(()=>{
  const legs=[];
  const inspect=(stage,x,y,face)=>{beginRun(0,null,{hp:1,dmg:1},{startStage:stage,levelSelect:true});
    Object.assign(G.p,{x,y,face});const spec=physicalSeamSpec();legs.push({stage,x,y,face,
      connector:spec&&spec.connector,targetStage:spec&&spec.targetStage,cross:!!(spec&&spec.cross),requires:spec&&spec.requires,
      requiresWorld:spec&&spec.requiresWorld});};
  // Archive -> Marksman -> Updrafts -> Black Woods -> Outskirts -> Warden.
  inspect(5,20,0,-1);inspect(4,20,0,-1);inspect(3,20,0,-1);inspect(1,20,0,-1);
  inspect(0,20,500,-1);inspect(6,14980,0,1);
  const expected=[4,3,1,0,6,0];
  return{name:'archive-key-opens-the-westward-seam-chain',evidenceClass:'seam-contract-not-full-route-input',
    pass:legs.every((leg,i)=>leg.cross&&leg.targetStage===expected[i])&&
      legs[4].requires==='wall-jump'&&legs[4].requiresWorld==='keep-west-seal'&&hasCapability('wall-jump'),legs};
});

const returnClingSurfaces=await page.evaluate(()=>{
  const stages=[5,4,1],surfaces=[];let liveRefectoryContact=null;
  for(const stage of stages){beginRun(0,null,{hp:1,dmg:1},{startStage:stage,levelSelect:true});
    G.sessionCapabilities=levelSelectCapabilitiesForStage(6);syncMovementCapabilities();
    for(const o of G.obstacles.filter(q=>q.returnClingAfterGrip))surfaces.push({stage,x:o.x,slickL:!!o.slickL,slickR:!!o.slickR,
      westFaceCling:!wallFaceSlick(o,1),eastFaceCling:!wallFaceSlick(o,-1),refectoryScreen:!!o.refectoryScreen});
    if(stage===5){const wall=G.obstacles.find(o=>o.refectoryScreen),p=G.p;
      Object.assign(p,{x:wall.x+wall.w/2+p.w/2,y:120,vx:0,vy:80,onGround:false,onWall:false,wallDir:0,wallObj:null,invuln:9999});
      update(1/120);liveRefectoryContact={onWall:p.onWall,wallDir:p.wallDir,isScreen:p.wallObj===wall,x:p.x,y:p.y};}
  }
  const refectory=surfaces.find(o=>o.stage===5&&o.refectoryScreen&&o.x===4270);
  return{name:'every-marked-barrier-including-the-first-refectory-wall-becomes-a-grip-surface',pass:surfaces.length===4&&
    surfaces.every(o=>o.slickL&&o.slickR&&o.westFaceCling&&o.eastFaceCling)&&!!refectory&&liveRefectoryContact&&
    liveRefectoryContact.onWall&&liveRefectoryContact.wallDir===-1&&liveRefectoryContact.isScreen&&hasCapability('wall-jump'),
    surfaces,refectory,liveRefectoryContact};
});

const wardenBreachTraversal=await page.evaluate(()=>{
  beginRun(0,null,{hp:1,dmg:1},{startStage:0,levelSelect:true});mode='play';meta.testMode=false;
  G.sessionCapabilities=levelSelectCapabilitiesForStage(6);syncMovementCapabilities();syncPortalCapabilities();syncWeaponCapabilities();
  meta.world=meta.world||{};meta.world.keepWestSealOpen=true;
  const p=G.p,keys=window.__BF.input.keys,pressed=window.__BF.input.pressed,jump=kbCode('jump');
  Object.assign(p,{x:190,y:0,vx:0,vy:0,onGround:true,dead:false,invuln:9999,ckX:190,ckY:0,ckSet:true});
  let lastJump=-99,maxY=0,wallJumps=0,climbDir=1,jumpSamples=[],crossed=false;
  for(let frame=0;frame<1800&&!p.dead&&!crossed;frame++){
    // Walk under the open threshold to its spring, then preserve each wall
    // jump's away-vector until the opposite face is reached. Above the crown,
    // commit west into the physical seam.
    if(p.onGround&&p.x>90)climbDir=-1;
    else if(wallJumps===0&&p.y>18&&p.y<440)climbDir=1;
    if(p.y>=440)climbDir=-1;
    const wallJumpFrame=p.onWall&&!p.onGround&&frame-lastJump>20;
    const groundedTakeoff=p.onGround&&p.x<110;
    if((groundedTakeoff||p.onWall)&&frame-lastJump>20){
      if(wallJumpFrame){wallJumps++;climbDir=-p.wallDir;}
      pressed[jump]=true;lastJump=frame;
    }
    keys.ArrowLeft=climbDir<0;keys.ArrowRight=climbDir>0;
    keys[jump]=frame-lastJump<16;update(1/60);BFKeyboard.clearPressed();maxY=Math.max(maxY,p.y);
    if(wallJumpFrame&&jumpSamples.length<8)jumpSamples.push({frame,x:Math.round(p.x),y:Math.round(p.y),vy:Math.round(p.vy),onWall:p.onWall});
    crossed=G.stage===6;
  }
  keys.ArrowLeft=keys.ArrowRight=keys[jump]=false;const seam=physicalSeamSpec();
  if(seam&&seam.cross)updatePhysicalWorldSeams();
  return{name:'western-breach-is-a-live-unlocked-return',pass:crossed&&maxY>=440&&!p.dead,
    crossed,maxY:Math.round(maxY),wallJumps,jumpSamples,wallJumpCapability:hasCapability('wall-jump'),
    player:{stage:G.stage,x:Math.round(p.x),y:Math.round(p.y),dead:p.dead},
    seam:seam&&{connector:seam.connector,targetStage:seam.targetStage,cross:seam.cross}};
});
if(!wardenBreachTraversal.crossed&&wardenBreachTraversal.seam?.cross){
  try{await page.waitForFunction(()=>G&&G.stageIndex===6,{timeout:5000});}catch{}
  const arrival=await page.evaluate(()=>({stage:G.stageIndex,x:Math.round(G.p.x),y:Math.round(G.p.y),crossing:!!G.physicalSeamCrossing,
    streamer:BFZoneStreamer.diagnostics()}));
  wardenBreachTraversal.crossed=arrival.stage===6;wardenBreachTraversal.arrival=arrival;
  wardenBreachTraversal.pass=wardenBreachTraversal.crossed&&wardenBreachTraversal.maxY>=440&&!wardenBreachTraversal.player.dead;
}

const focals=[{x:3900,y:260},{x:6500,y:300},{x:12800,y:520},{x:13900,y:820},{x:16400,y:930}];
await reset();for(let i=0;i<focals.length;i++){await page.evaluate(({x,y})=>{Object.assign(G.p,{x,y,vx:0,vy:0,invuln:9999});G.stageBanner=0;G.texts=[];G.cam=Math.max(0,Math.min(G.levelLength-VW,x-VW*.5));G.camY=Math.max(0,y-VH*.52);render();},focals[i]);await page.screenshot({path:resolve(FOLDER,'screens',`room-${i+1}.png`)});}
const probes=[topology,gripContract,bilateral,archiveTraversal,folded,bell,completion,solvedDoorReturn,westwardRoute,returnClingSurfaces,wardenBreachTraversal];
const receipt={schema:'bladefall.ruined-keep-validation',version:2,generatedAt:new Date().toISOString(),url:URL,
  gameVersion:await page.evaluate(()=>VERSION),expectedVersion,pass:pageErrors.length===0&&probes.every(p=>p.pass),pageErrors,probes,
  screenshots:focals.map((f,i)=>({file:`screens/room-${i+1}.png`,...f}))};
await writeFile(OUTPUT,`${JSON.stringify(receipt,null,2)}\n`);await browser.close();console.log(JSON.stringify(receipt,null,2));if(!receipt.pass)process.exitCode=1;
