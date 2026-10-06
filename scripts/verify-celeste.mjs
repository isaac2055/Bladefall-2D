import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {launchChrome} from '../tests/launch-chrome.mjs';
import {bootstrapStage} from './bladefall-bot.mjs';
import {verifyBladeMechanics} from './verify-celeste-blades.mjs';
import {verifyCourseFeedback} from './verify-celeste-feedback.mjs';
import {verifyCourseExtensions} from './verify-celeste-extensions.mjs';
const root=resolve('public'),folder='docs/charters/celeste/evidence';
const server=createServer(async(req,res)=>{try{const p=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://x').pathname));if(!p.startsWith(root+'/'))throw Error();res.setHeader('Content-Type',extname(p)==='.js'?'text/javascript':extname(p)==='.html'?'text/html':'application/octet-stream');res.end(await readFile(p));}catch{res.statusCode=404;res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await launchChrome({headless:true,executablePath:process.env.PUPPETEER_EXECUTABLE_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--no-sandbox']});
const page=await browser.newPage(),errors=[],receipt={replay:[],retry:[],ui:[]};page.on('pageerror',e=>errors.push(e.message));await page.setViewport({width:1440,height:900});
const url=`http://127.0.0.1:${server.address().port}/index.html`;
try{
 await mkdir(folder,{recursive:true});
 await page.goto(url+'?tas=1',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__BF?.tas);
 const routes=JSON.parse(await readFile(folder+'/routes.json','utf8'));
 assert.deepEqual(routes.map(r=>r.stage),[41,42]);
 for(const route of routes){
  assert.ok(route.final.complete&&route.rooms.every(r=>r.pass),'recorded course must be complete');
  await page.evaluate(bootstrapStage,route.stage);
  const {shots,...playback}=await page.evaluate(rooms=>{
   const a=G.celeste,events=[],shots=[];
   for(const room of rooms){
    const required=a.rooms[room.room].required.slice(),used=new Set();let captureDelay=0;
    for(const keys of room.tape){
     for(const id of a.used)used.add(id);__BF.tas.stepFrames(1,keys);for(const id of a.used)used.add(id);
     if(['pogo','uppercut','pogo-tear','uppercut-ring','inversion-relay','gale','gale-tear','portal-gale'].includes(room.kind)&&a.used.length>=2&&++captureDelay===6){
      recalcVP();render();shots.push({name:routeName(a.stage,room.kind),png:mainCanvas.toDataURL('image/png').split(',')[1]});
     }
    }
    events.push({room:room.room,kind:room.kind,next:G.celeste.room,complete:G.celeste.complete,required,used:[...used]});
   }
   function routeName(stage,kind){return stage+'-'+kind+'.png';}
   return {stage:G.stageIndex,complete:a.complete,deaths:a.deaths,blood:G.p.blood,mode,events,shots,frames:rooms.reduce((s,r)=>s+r.tape.length,0)};
  },route.rooms);
  for(const shot of shots)await writeFile(folder+'/'+shot.name,Buffer.from(shot.png,'base64'));
  for(const event of playback.events)assert.ok(event.required.every(id=>event.used.includes(id)),JSON.stringify(event));
  assert.ok(playback.complete);assert.equal(playback.deaths,0);assert.equal(playback.mode,'celeste-complete');receipt.replay.push(playback);
 }
 await page.evaluate(bootstrapStage,41);
 receipt.normalization=await page.evaluate(()=>{const p=G.p;p.stats.speed=99;p.stats.dodgeCd=99;p.stats.atkSpeed=99;p.armorMods={speedMul:99,dodgeMul:99};return {speed:movementProfile().tuning.runSpeed*effSpeed(p),dashCooldown:effDodgeCd(p),movementGift:hasGift('pure-nail'),attackSpeed:effAtkSpeed(p),directionalBlade:directionalBladeAvailable(),weapon:p.weapon.cls,stowed:p.stowedWeapon};});
 assert.deepEqual(receipt.normalization,{speed:212,dashCooldown:.75,movementGift:false,attackSpeed:1,directionalBlade:true,weapon:'melee',stowed:null});
 const registration=await page.evaluate(()=>({campaign:BFCampaignModule.validateBlueprints(),world:BFWorldModule.validateGraph(),progression:window.BladefallProgression.validate()}));
 for(const result of Object.values(registration))assert.ok(result.ok,JSON.stringify(result.errors));receipt.registration=registration;
 // Retry after movement, including a moving counterweight and consumed flight source. Each fixture
 // begins at an authored checkpoint. Only legal controls change state during the trial.
 for(const [stage,room]of [[41,3],[41,7],[42,1],[42,2],[41,5],[41,6],[42,6],[42,7]]){
  await page.evaluate(bootstrapStage,stage);
  await page.evaluate(i=>{G.celeste.room=i;G.celeste.checkpoint=G.celeste.rooms[i].x+120;BladefallCeleste.retry();G.celeste.deaths=0;},room);
  const retry=await page.evaluate(()=>{
   const t=__BF.tas;
   function read(){const a=G.celeste;return {x:G.p.x,y:G.p.y,blood:G.p.blood,clock:a.clock,used:a.used.slice(),flip:G.gravityFlipped,flight:a.flight,hook:G.p.actHook,seam:G.p.seamRide,objects:G.obstacles.filter(o=>o.ceRoom===a.room&&(o.ceWeight||o.type==='ceGale'||o.ceGate||o.ceBoundary)).map(o=>({x:o.x,y:o.y,t:o.ceT||0,armed:!!o.ceArmed,spent:!!o.ceSpent,gone:!!o.gone}))};}
   t.stepFrames(1,{checkpoint:true});t.stepFrames(5,{});const clean=read();
   t.stepFrames(40,{right:true});t.stepFrames(1,{attack:true,jump:true});t.stepFrames(35,{right:true,jump:true});
   t.stepFrames(1,{checkpoint:true});t.stepFrames(5,{});return {clean,reset:read()};
  });
  assert.deepEqual(retry.reset,retry.clean);receipt.retry.push({stage,room,pass:true});
 }
 receipt.bladeMechanics=await verifyBladeMechanics(page,bootstrapStage);
 receipt.feedbackChecks=await verifyCourseFeedback(page,bootstrapStage,folder);
 receipt.extensions=await verifyCourseExtensions(page,bootstrapStage,routes);
 // Both courses can be started from an untouched browser save, with actual UI clicks.
 const ui=await browser.newPage();ui.on('pageerror',e=>errors.push(e.message));await ui.setViewport({width:1440,height:900});
 await ui.goto(url,{waitUntil:'domcontentloaded'});await ui.waitForSelector('#precisionBtn');await ui.click('#precisionBtn');
 await ui.screenshot({path:folder+'/menu.png'});
 await ui.click('#ceStandard');await ui.waitForFunction(()=>window.__BF.G?.stageIndex===41&&window.__BF.mode==='play');
 await ui.keyboard.down('ArrowRight');await new Promise(r=>setTimeout(r,300));await ui.keyboard.up('ArrowRight');
 const standard=await ui.evaluate(()=>({stage:__BF.G.stageIndex,x:__BF.G.p.x,name:__BF.STAGES[__BF.G.stageIndex].name}));assert.ok(standard.x>120);receipt.ui.push(standard);
 await ui.screenshot({path:folder+'/standard.png'});
 receipt.nativeBlade=[];
 for(const [kind,attackFirst] of [['pogo',false],['uppercut',false],['pogo',true],['uppercut',true]]){
  await ui.evaluate(kind=>{
   const a=G.celeste;a.room=a.rooms.findIndex(r=>r.kind===kind);a.checkpoint=a.rooms[a.room].x+120;BladefallCeleste.retry();
   const o=G.obstacles.find(o=>o.ceRoom===a.room&&o.ceBlade===kind);
   Object.assign(G.p,{x:o.x,y:kind==='pogo'?o.y+45:0,onGround:kind==='uppercut',vy:0,vx:0});
  },kind);
  const direction=kind==='pogo'?'ArrowDown':'ArrowUp';
  if(attackFirst){await ui.keyboard.down('w');await ui.evaluate(()=>new Promise(requestAnimationFrame));await ui.keyboard.down(direction);}
  else{await ui.keyboard.down(direction);await ui.keyboard.down('w');}
  try{await ui.waitForFunction(()=>G.celeste.used.length>0,{timeout:2000});}catch(error){console.error(kind,await ui.evaluate(()=>({room:G.celeste.room,used:G.celeste.used,deaths:G.celeste.deaths,p:{x:G.p.x,y:G.p.y,vy:G.p.vy,slam:G.p.slamming,attack:G.p.bladeDirection,at:G.p.atkCd},input:{down:input.down,attackHeld:input.attackHeld},keys:meta.keybinds})));throw error;}
  await ui.keyboard.up('w');await ui.keyboard.up(direction);
  await ui.waitForFunction(()=>!input.attackHeld);
  const hit=await ui.evaluate(()=>({used:G.celeste.used.slice(),slamming:G.p.slamming,vy:G.p.vy}));
  assert.equal(hit.slamming,false);assert.ok(hit.vy<0);receipt.nativeBlade.push({kind,attackFirst,pass:true});
 }

 await ui.evaluate(()=>titleScreen());await ui.click('#precisionBtn');await ui.click('#ceFractured');await ui.waitForFunction(()=>window.__BF.G?.stageIndex===42&&window.__BF.mode==='play');
 receipt.ui.push(await ui.evaluate(()=>({stage:__BF.G.stageIndex,name:__BF.STAGES[__BF.G.stageIndex].name})));
 await ui.screenshot({path:folder+'/fractured.png'});
 // Both courses are reached from the title screen's Precision Courses; Level Select no longer lists them (owner, 2026-09-26).
 await ui.evaluate(()=>openLevelSelect());assert.equal(await ui.$('.lvlbtn[data-i="41"]'),null);
 await ui.click('[data-tab="fx"]');assert.equal(await ui.$('.lvlbtn[data-fx="42"]'),null);
 receipt.sourceHashes={};for(const file of ['index.html','bladefall-celeste.js','bladefall-celeste-art.js','bladefall-act-two.js','bladefall-platformer.js','bladefall-respec-renderer.js'])receipt.sourceHashes[file]=createHash('sha256').update(await readFile(resolve(root,file))).digest('hex');
 receipt.errors=errors;assert.deepEqual(errors,[]);
 await writeFile(folder+'/verification.json',JSON.stringify(receipt,null,2)+'\n');
 console.log(JSON.stringify({replays:receipt.replay.map(({stage,complete,deaths,frames})=>({stage,complete,deaths,frames})),retries:receipt.retry.length,bladeChecks:receipt.bladeMechanics.length,feedbackChecks:receipt.feedbackChecks.length,ui:receipt.ui,errors}));
}finally{await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
