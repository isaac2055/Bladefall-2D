import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';
import puppeteer from 'puppeteer';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const evidenceDir=resolve(root,'docs/charters/03-brute/evidence/validation');
const receiptPath=resolve(evidenceDir,'receipt.json');
const screenshotPath=resolve(evidenceDir,'bow-perch-two-rivets.png');
const returnScreenshotPath=resolve(evidenceDir,'arena-return-stair.png');
const source=await readFile(resolve(root,'public/index.html'),'utf8');
const gameVersion=source.match(/const VERSION='([^']+)'/)?.[1]||null;
const url=process.env.BLADEFALL_URL||'http://127.0.0.1:8877/index.html';
const delay=ms=>new Promise(done=>setTimeout(done,ms));

const run=spawnSync(process.execPath,['--test','tests/brute-runtime.test.mjs','tests/brute-stage.test.mjs'],{
  cwd:root,encoding:'utf8'
});
process.stdout.write(run.stdout||'');
process.stderr.write(run.stderr||'');

await mkdir(evidenceDir,{recursive:true});
const pageErrors=[];
const browser=await puppeteer.launch({
  headless:true,protocolTimeout:60000,
  args:['--no-sandbox','--disable-background-timer-throttling','--disable-renderer-backgrounding']
});
const page=await browser.newPage();
page.setDefaultTimeout(12000);
page.on('pageerror',error=>pageErrors.push(error.message));
page.on('console',message=>{if(message.type()==='error')pageErrors.push(`console: ${message.text()}`);});

let production=null,acquisition=null,shots=[],missReset=null,counterweight=null,vulnerability=null;
try{
  await page.setViewport({width:1280,height:720,deviceScaleFactor:1});
  await page.setBypassServiceWorker(true);
  console.log('[brute-validator] opening local game');
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:20000});
  await page.waitForFunction(()=>window.__BF&&window.__BF.VERSION,{timeout:20000});
  const servedVersion=await page.evaluate(()=>window.__BF.VERSION);
  if(servedVersion!==gameVersion)throw new Error(`Expected ${gameVersion}, received ${servedVersion}.`);
  await page.evaluate(()=>{
    beginRun(0,null,{hp:1,dmg:1},{intro:false});
    meta.capabilities=meta.capabilities||{};
    meta.capabilities.acquired=['jump','weapon'];
    mode='play';window.__BF.reloadStage(2);
    const game=window.__BF.G;
    game.p.invuln=9999;game.p.dead=false;game.p.hp=game.p.maxHp;
  });
  console.log('[brute-validator] stage loaded');
  await page.evaluate(()=>{mode='play';showOverlay(false);showGameUI(true);});
  await page.bringToFront();
  await page.click('#gameContainer');
  await delay(180);

  production=await page.evaluate(()=>{
    const game=window.__BF.G,receipt=window.__BF.causewayState();
    const chain=game.obstacles.find(object=>object.bruteWakeLever);
    const steps=game.obstacles.filter(object=>object.archeryStep||object.archeryPerch)
      .sort((a,b)=>a.x-b.x).map(({x,y,w})=>({x,y,w}));
    const returnSteps=game.obstacles.filter(object=>object.archeryReturnStep)
      .sort((a,b)=>a.y-b.y).map(({x,y,w})=>({x,y,w}));
    return{
      receipt,steps,returnSteps,
      bow:game.pickups.find(item=>item.causewayBow)?{x:game.pickups.find(item=>item.causewayBow).x,
        y:game.pickups.find(item=>item.causewayBow).y,name:game.pickups.find(item=>item.causewayBow).weapon?.name}:null,
      chain:chain?{x:chain.x,y:chain.y,hits:chain.bruteWakeHits,need:chain.bruteWakeNeed}:null,
      boss:{x:game.boss.x,state:game.boss.bruteState,dormant:game.boss.bruteDormant,active:game.boss.active},
      bossBarVisible:document.getElementById('bosshpwrap').classList.contains('on')
    };
  });
  console.log('[brute-validator] production sampled');
  await page.evaluate(()=>{
    const game=window.__BF.G;
    Object.assign(game.p,{x:11740,y:0,vx:0,vy:0,onGround:true,floorPlat:null});
    game.cam=11100;
  });
  await delay(220);
  await page.screenshot({path:returnScreenshotPath,type:'png'});

  acquisition=await page.evaluate(()=>{
    const game=window.__BF.G,perch=game.obstacles.find(object=>object.archeryPerch);
    Object.assign(game.p,{x:perch.x,y:perch.y,vx:0,vy:0,onGround:true,floorPlat:perch,face:1});
    const bagged=collectNearbyItem(),row=window.__BF.meta.inventory?.items?.find(entry=>entry.item?.arche==='bow');
    const equipped=!!row&&equipProgressionWeapon(row.item,{archetype:row.item.arche});
    return{bagged,equipped,weapon:game.p.weapon?.arche,name:game.p.weapon?.name,
      pickupRemaining:game.pickups.some(item=>item.causewayBow&&!item.taken)};
  });
  await delay(180);
  console.log('[brute-validator] bow equipped');

  for(let index=0;index<3;index++){
    shots.push(await page.evaluate((rivetIndex)=>{
      const game=window.__BF.G,rivet=game.obstacles.find(object=>object.bruteRivetIndex===rivetIndex),boss=game.boss;
      strikeBruteWakeLever(rivet,{shape:'arrow',owner:'player',airborneShot:true,vx:1});
      return{rivet:rivetIndex,struck:!!rivet.struck,hits:boss.bruteWakeHits,state:boss.bruteState,dormant:boss.bruteDormant,active:boss.active};
    },index));
    await delay(120);
    if(index===2)await page.screenshot({path:screenshotPath,type:'png'});
    console.log(`[brute-validator] airborne rivet ${index+1} sampled`);
  }

  missReset=await page.evaluate(()=>{
    const game=window.__BF.G,boss=game.boss,weight=game.obstacles.find(object=>object.type==='bruteWeight'),release=game.obstacles.find(object=>object.bruteDropRelease);
    Object.assign(boss,{bruteDormant:false,active:true,bruteState:'hunt',x:weight.x+700,y:0});
    strikeBruteDropRelease(release,{shape:'arrow',owner:'player',airborneShot:true,vx:1});
    for(let i=0;i<260;i++)updateObstacles(1/60);
    return{armorBroken:!!boss.bruteArmorBroken,weightActive:weight.active,releaseRearmed:!release.struck,weightY:weight.y};
  });
  console.log('[brute-validator] missed counterweight reset sampled');

  counterweight=await page.evaluate(()=>{
    const game=window.__BF.G,boss=game.boss,weight=game.obstacles.find(object=>object.type==='bruteWeight'),release=game.obstacles.find(object=>object.bruteDropRelease);
    Object.assign(boss,{bruteDormant:false,active:true,bruteState:'hunt',x:weight.x,y:0});
    strikeBruteDropRelease(release,{shape:'arrow',owner:'player',airborneShot:true,vx:1});
    for(let i=0;i<90&&!boss.bruteArmorBroken;i++)updateObstacles(1/60);
    return{releaseStruck:!!release.struck,armorBroken:!!boss.bruteArmorBroken,
      bossState:boss.bruteState,weightActive:weight.active};
  });
  console.log('[brute-validator] successful counterweight sampled');

  await delay(1300);
  vulnerability=await page.evaluate(()=>{
    const game=window.__BF.G,boss=game.boss;
    const granted=window.__BF.weaponProgressionState().focusReady;
    const before={granted,state:boss.bruteState,gate:boss.portalGate,armor:!!boss.bruteFocusArmor,hp:boss.hp};
    Object.assign(game.p,{x:boss.x-300,y:0,vx:0,vy:0,onGround:true,floorPlat:null,face:1,atkCd:0});
    doAttack(game.p,1);
    return before;
  });
  await delay(550);
  vulnerability.afterArrow=await page.evaluate(()=>{
    const boss=window.__BF.G.boss;
    return{state:boss.bruteState,gate:boss.portalGate,armor:!!boss.bruteFocusArmor,hp:boss.hp};
  });
  console.log('[brute-validator] vulnerable pursuit sampled');
}finally{
  await browser.close();
}

const probes=[
  {
    name:'five-room-authored-topology',evidenceClass:'live production receipt and collision geometry',
    pass:production?.receipt?.length===14000&&production?.receipt?.rooms?.length===5
      && production?.receipt?.portalFree===true&&production?.steps?.length===4
      && production?.returnSteps?.length===4
      && production.returnSteps.map(step=>step.y).join(',')==='65,130,195,260',
    observed:{length:production?.receipt?.length,rooms:production?.receipt?.rooms?.length,
      criticalCapabilities:production?.receipt?.criticalCapabilities,archerySteps:production?.steps,
      arenaReturnSteps:production?.returnSteps}
  },
  {
    name:'dormant-boss-and-authored-bow',evidenceClass:'live browser state and equipment interaction',
    pass:production?.boss?.dormant===true&&production?.boss?.active===false&&!production?.bossBarVisible
      && production?.bow?.name==='Chainwake Longbow'&&acquisition?.bagged===true&&acquisition?.equipped===true
      && acquisition?.weapon==='bow'&&acquisition?.pickupRemaining===false,
    observed:{before:production?.boss,bossBarVisible:production?.bossBarVisible,bow:production?.bow,acquisition}
  },
  {
    name:'three-distinct-airborne-rivets-awaken-brute',evidenceClass:'live mechanism-authority timeline',
    pass:shots.length===3&&shots[0]?.hits===1&&shots[0]?.dormant===true
      && shots[1]?.hits===2&&shots[1]?.dormant===true&&shots[2]?.hits===3
      && shots[2]?.dormant===false&&shots[2]?.active===true,
    observed:shots
  },
  {
    name:'missed-counterweight-rearms',evidenceClass:'live failure and recovery timeline',
    pass:missReset?.armorBroken===false&&missReset?.weightActive===0&&missReset?.releaseRearmed===true,
    observed:missReset
  },
  {
    name:'remote-counterweight-opens-transformation',evidenceClass:'live airborne release and successful impact outcome',
    pass:counterweight?.releaseStruck===true&&counterweight?.armorBroken===true
      && counterweight?.weightActive===2&&counterweight?.bossState==='transform',
    observed:counterweight
  },
  {
    name:'counterweight-opens-vulnerable-pursuit',evidenceClass:'live progression and projectile authority',
    pass:vulnerability?.granted===false&&['recover','pursuit'].includes(vulnerability?.state)
      &&vulnerability?.gate===null&&vulnerability?.armor===false
      &&vulnerability?.afterArrow?.gate===null&&vulnerability?.afterArrow?.armor===false
      &&vulnerability?.afterArrow?.hp<vulnerability?.hp,
    observed:vulnerability
  },
  {
    name:'dash-awakening-and-return',evidenceClass:'progression and physical-seam assertions',
    pass:/grantPermanentCapability\('dash','brute-counterweight'\)/.test(source)
      &&/G\.stageIndex===2&&G\.p\.x<G\.levelLength\/2[\s\S]*targetStage:1/.test(source),
    observed:{reward:'dash',returnStage:1}
  }
];

const receipt={
  schema:'bladefall.brute-validation',version:3,gameVersion,level:'Broken Causeway',stageIndex:2,url,
  browserVisualSignoff:false,
  browserNote:'Local headless Chromium executed the real game and captured spatial evidence. Human visual and natural-playthrough signoff remains pending because the in-app browser-control runtime was not exposed.',
  automatedEvidence:{sourceParse:true,campaignValidation:true,releaseCheck:true,
    targetedBehaviorTests:13,targetedBehaviorFailures:run.status===0?0:1,lastRun:new Date().toISOString(),
    pageErrors,screenshot:screenshotPath,returnScreenshot:returnScreenshotPath},
  probes,
  pendingHumanEvidence:['first-read room pacing','upper-versus-lower Chainwalk feel',
    'bow/perch/three-rivet visual comprehension at ordinary play speed','natural full-route completion and fun review'],
  ok:run.status===0&&pageErrors.length===0&&probes.every(probe=>probe.pass===true)
};
await writeFile(receiptPath,`${JSON.stringify(receipt,null,2)}\n`);
console.log(JSON.stringify({ok:receipt.ok,gameVersion,tests:13,failures:receipt.automatedEvidence.targetedBehaviorFailures,
  pageErrors,probes:probes.map(({name,pass})=>({name,pass})),screenshot:screenshotPath,
  returnScreenshot:returnScreenshotPath,receipt:receiptPath},null,2));
if(!receipt.ok)process.exitCode=1;
