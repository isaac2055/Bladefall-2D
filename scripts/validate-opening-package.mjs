import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';
import puppeteer from 'puppeteer';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const output=resolve(root,'docs/charters/opening-package-integration.json');
const url=process.env.BLADEFALL_URL||'http://127.0.0.1:8877/index.html';
const source=await readFile(resolve(root,'public/index.html'),'utf8');
const gameVersion=source.match(/const VERSION='([^']+)'/)?.[1]||null;
const delay=ms=>new Promise(done=>setTimeout(done,ms));
const tests=['tests/authored-advancement.test.mjs','tests/weapon-progression.test.mjs',
  'tests/outskirts-stage.test.mjs','tests/black-woods-stage.test.mjs','tests/black-woods-runtime.test.mjs',
  'tests/brute-stage.test.mjs','tests/brute-runtime.test.mjs'];
const run=spawnSync(process.execPath,['--test',...tests],{cwd:root,encoding:'utf8'});
process.stdout.write(run.stdout||'');process.stderr.write(run.stderr||'');

const pageErrors=[];
const browser=await puppeteer.launch({headless:true,protocolTimeout:60000,args:[
  '--no-sandbox','--disable-background-timer-throttling','--disable-renderer-backgrounding']});
const page=await browser.newPage();
page.on('pageerror',error=>pageErrors.push(error.message));
page.on('console',message=>{if(message.type()==='error')pageErrors.push(`console: ${message.text()}`);});
let fresh=null,interaction=null,vigil=null,deadDrop=null,damage=null,dialogue=null,clockDrift=null,perception=null;
try{
  await page.setBypassServiceWorker(true);
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:20000});
  await page.waitForFunction(()=>window.__BF&&window.__BF.VERSION,{timeout:20000});
  const served=await page.evaluate(()=>window.__BF.VERSION);
  if(served!==gameVersion)throw new Error(`Expected ${gameVersion}, received ${served}.`);
  await page.evaluate(()=>{
    beginRun(0,null,{hp:1,dmg:1},{intro:false});mode='play';
    meta.soundOn=false;meta.capabilities.acquired=['jump'];window.__BF.reloadStage(0);
    window.__BF.G.p.invuln=9999;
  });
  await delay(150);
  fresh=await page.evaluate(()=>{
    const game=window.__BF.G,before={texts:game.texts.length,blocked:{...game.movementDiagnostics.blocked}};
    const dash=lockedMovementFeedback('dash'),doubleJump=lockedMovementFeedback('double-jump');
    return{before,after:{texts:game.texts.length,blocked:{...game.movementDiagnostics.blocked}},dash,doubleJump,
      acquired:[...(meta.capabilities.acquired||[])]};
  });
  interaction=await page.evaluate(()=>{
    const game=window.__BF.G,clock=game.obstacles.find(o=>o.fieldClock),surveyLore=game.obstacles.find(o=>o.loreId==='first-breach');
    Object.assign(game.p,{x:clock.x,y:clock.y||0,vx:0,vy:0,onGround:true,floorPlat:null});
    const candidate=outskirtsInteractionCandidate();beginOutskirtsInteraction();
    const target=game.outskirtsInteractionTarget;
    return{clock:{x:clock.x,y:clock.y||0},surveyLore:surveyLore?{x:surveyLore.x,y:surveyLore.y||0}:null,
      candidate:{fieldClock:!!candidate?.fieldClock,loreId:candidate?.loreId||null,x:candidate?.x},
      target:{fieldClock:!!target?.fieldClock,loreId:target?.loreId||null,x:target?.x}};
  });
  await page.evaluate(()=>{
    meta.capabilities.acquired=['jump','weapon'];window.__BF.reloadStage(0);mode='play';
    const game=window.__BF.G,mark=game.obstacles.find(o=>o.sentinelVigil&&o.type==='scenery');
    Object.assign(game.p,{x:mark.x,y:mark.y||0,vx:0,vy:0,onGround:true,floorPlat:null,invuln:9999});
  });
  await delay(450);
  vigil=await page.evaluate(()=>{
    const game=window.__BF.G,mark=game.obstacles.find(o=>o.sentinelVigil&&o.type==='scenery'),enemy=game.enemies.find(e=>e.sentinelVigil);
    const before={challenge:!!enemy.vigilChallenge,active:!!enemy.active,opened:!!mark.vigilOpened};
    const interacted=beginOutskirtsInteraction();
    return{before,interacted,after:{challenge:!!enemy.vigilChallenge,active:!!enemy.active,
      awakenT:enemy.vigilAwakenT,opened:!!mark.vigilOpened}};
  });
  await page.evaluate(()=>{
    meta.capabilities.acquired=['jump','weapon','dash'];window.__BF.reloadStage(0);mode='play';
  });
  deadDrop=await page.evaluate(()=>{
    const game=window.__BF.G,cache=game.obstacles.find(o=>o.dashOverlook&&o.type==='scenery');
    Object.assign(game.p,{x:cache.x,y:cache.y||0,vx:0,vy:0,onGround:true,floorPlat:null});
    const floating=outskirtsInteractionCandidate();
    const floor=game.obstacles.find(o=>o.dashOverlook&&o.type==='plat');
    Object.assign(game.p,{x:cache.x,y:cache.y||0,onGround:true,floorPlat:floor});
    const supported=outskirtsInteractionCandidate();
    return{cache:{x:cache.x,y:cache.y||0},floor:floor?{x:floor.x,y:floor.y}:null,
      floating:!!floating?.dashOverlook,supported:!!supported?.dashOverlook};
  });
  damage=await page.evaluate(()=>{
    const game=window.__BF.G,p=game.p;
    Object.assign(p,{x:520,y:0,vx:0,vy:0,hp:100,maxHp:100,ckSet:true,ckX:120,ckY:0,
      invuln:0,dodgeTimer:0,dead:false,starT:0});
    const before={x:p.x,hp:p.hp};
    hurtPlayer(9,1,true);
    return{before,after:{x:p.x,hp:p.hp,vx:p.vx,invuln:p.invuln},checkpoint:p.ckX};
  });
  dialogue=await page.evaluate(()=>{
    meta.openingClockMinute=0;meta.outskirtsMaraRelocated=true;
    meta.capabilities.acquired=['jump'];window.__BF.reloadStage(0);mode='play';
    const game=window.__BF.G;
    const kinds={};
    for(const [name,source] of Object.entries({
      person:{type:'ambientFigure',x:100,y:0},sign:{type:'sign',x:100,y:0},
      marker:{type:'surveyStake',x:100,y:0},memory:{type:'storyRelic',x:100,y:0},
      object:{type:'scenery',x:100,y:0}
    })){showOutskirtsAnnotation(source,'<b>SAMPLE</b><br>Copy.');kinds[name]=game.outskirtsAnnotation?.kind;}
    const iron=game.obstacles.find(o=>o.type==='surveyStake'&&o.bearingName==='IRON');
    const mara=(game.npcs||[]).find(o=>o.profileId==='mara'||o.name==='Mara');
    window.__BF.reloadStage(1);mode='play';
    const hale=window.__BF.G.obstacles.find(o=>o.residentId==='woods-veteran');
    const before=ambientFigureDialogue(hale,false);
    meta.capabilities.acquired=['jump','weapon'];
    const after=ambientFigureDialogue(hale,true);
    return{kinds,iron:iron?{x:iron.x,y:iron.y}:null,mara:mara?{x:mara.x,y:mara.y}:null,
      hale:{before,after}};
  });
  clockDrift=await page.evaluate(()=>{
    meta.openingClockMinute=0;
    const initial=openingClockTime(),advanced=advanceOpeningClock('black-woods-return');
    window.__BF.reloadStage(0);mode='play';
    const field=window.__BF.G.obstacles.find(o=>o.fieldClock)?.clockTime;
    window.__BF.reloadStage(1);mode='play';
    const orra=window.__BF.G.obstacles.find(o=>o.clockId==='pulse-one');
    return{initial,advanced,field,orra:ambientFigureDialogue(orra,true),saved:meta.openingClockMinute};
  });
  perception=await page.evaluate(()=>{
    meta.capabilities.acquired=['jump'];window.__BF.reloadStage(0);mode='play';
    const game=window.__BF.G,e=game.enemies.find(enemy=>enemy.encounterRole==='turn-and-pass'),p=game.p;
    Object.assign(e,{face:1,openingSight:0,openingAlertT:0,openingAwareness:'unaware'});
    Object.assign(p,{x:e.x+145,y:e.y,vx:0,vy:0,cloakT:0});
    let sense=null;for(let i=0;i<12;i++)sense=updateOutskirtsPerception(e,p,.1);
    const beforeX=e.x,patrolMax=e.patrolMax;
    updateOutskirtsAvoidanceEncounter(e,p,.5,120);
    return{sense:{clear:sense.clear,awareness:sense.awareness,engaged:sense.engaged,lastX:sense.lastX},
      state:e.openingState,beforeX,afterX:e.x,patrolMax,alertT:e.openingAlertT};
  });
}finally{await browser.close();}

const probes=[
  {name:'silent-undiscovered-movement',pass:fresh?.acquired?.join(',')==='jump'&&fresh?.dash&&fresh?.doubleJump
    &&fresh?.after?.texts===fresh?.before?.texts&&fresh?.after?.blocked?.dash===1&&fresh?.after?.blocked?.['double-jump']===1,observed:fresh},
  {name:'clock-wins-nearby-discovery-overlap',pass:interaction?.candidate?.fieldClock===true
    &&interaction?.target?.fieldClock===true&&interaction?.candidate?.loreId===null,observed:interaction},
  {name:'armed-vigil-remains-opt-in',pass:vigil?.before?.challenge===false&&vigil?.before?.active===false
    &&vigil?.before?.opened===false&&vigil?.interacted===true&&vigil?.after?.challenge===true
    &&vigil?.after?.opened===true,observed:vigil},
  {name:'dead-drop-requires-physical-footing',pass:deadDrop?.floating===false&&deadDrop?.supported===true,observed:deadDrop},
  {name:'enemy-damage-spends-hp-without-rewind',pass:damage?.after?.hp<damage?.before?.hp
    &&Math.abs(damage?.after?.x-damage?.before?.x)<1&&damage?.after?.x!==damage?.checkpoint,observed:damage},
  {name:'source-specific-dialogue-and-local-mara-backtrack',pass:dialogue?.kinds?.person==='person'
    &&dialogue?.kinds?.sign==='sign'&&dialogue?.kinds?.marker==='marker'
    &&dialogue?.kinds?.memory==='memory'&&dialogue?.kinds?.object==='object'
    &&dialogue?.iron?.x>dialogue?.mara?.x&&dialogue?.iron?.x-dialogue?.mara?.x>=800
    &&dialogue?.iron?.x-dialogue?.mara?.x<=1400
    &&/blade is caught in the roots/.test(dialogue?.hale?.before||'')&&/blade knows this road/.test(dialogue?.hale?.after||''),observed:dialogue},
  {name:'opening-clock-advances-and-stays-consistent',pass:clockDrift?.initial==='3:40'
    &&clockDrift?.advanced==='3:41'&&clockDrift?.field==='3:41'&&clockDrift?.saved===1
    &&/3:41/.test(clockDrift?.orra||''),observed:clockDrift},
  {name:'visible-cone-produces-alert-pursuit',pass:perception?.sense?.clear===true
    &&perception?.sense?.awareness==='alert'&&perception?.sense?.engaged===true
    &&perception?.state==='pursue'&&perception?.afterX>perception?.beforeX,observed:perception},
];
const receipt={schema:'bladefall.opening-package-integration',version:2,gameVersion,url,
  automatedEvidence:{targetedFiles:tests.length,targetedPass:run.status===0,pageErrors},probes,
  linkedReceipts:['docs/charters/02-black-woods/evidence/validation/receipt.json',
    'docs/charters/03-brute/evidence/validation/receipt.json'],
  pendingHumanEvidence:['natural fresh route','natural armed revisit','pacing and first-read clarity'],
  ok:run.status===0&&pageErrors.length===0&&probes.every(probe=>probe.pass)};
await mkdir(dirname(output),{recursive:true});await writeFile(output,`${JSON.stringify(receipt,null,2)}\n`);
console.log(JSON.stringify({ok:receipt.ok,gameVersion,pageErrors,probes:probes.map(({name,pass})=>({name,pass})),output},null,2));
if(!receipt.ok)process.exitCode=1;
