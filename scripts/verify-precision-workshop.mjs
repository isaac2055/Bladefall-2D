import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,extname} from 'node:path';
import {launchChrome} from '../tests/launch-chrome.mjs';
import {bootstrapStage} from './bladefall-bot.mjs';
const out='docs/charters/celeste/evidence/workshop',root=resolve('public'),errors=[];
await mkdir(out,{recursive:true});
const server=createServer(async(req,res)=>{try{const p=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://x').pathname));if(!p.startsWith(root+'/'))throw Error();res.setHeader('Content-Type',extname(p)==='.js'?'text/javascript':extname(p)==='.mp3'?'audio/mpeg':'text/html');res.end(await readFile(p));}catch{res.statusCode=404;res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await launchChrome({headless:true});
try{
 const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));await page.setViewport({width:1440,height:900});await page.goto(`http://127.0.0.1:${server.address().port}/index.html?tas=1`);await page.waitForFunction(()=>window.__BF?.tas);
 const routes=JSON.parse(await readFile(`${out}/routes.json`));assert.equal(routes.length,30);const runs=[],counterfactuals=[];
 for(const r of routes){
  for(const variant of r.index>=25?['normal']:['normal','no-dash',...([10,13,18].includes(r.index)?[]:['missing-feature']),...(r.index===4?['no-rebound']:[])]){
   await page.evaluate(bootstrapStage,44);await page.evaluate(i=>{BladefallPrecisionWorkshop.select(i);__BF.tas.stepFrames(2,{});},r.index);
   const result=await page.evaluate(({r,variant})=>{
    const a=G.celeste,start=a.room,shape=a.room,obs=G.obstacles.filter(o=>o.ceRoom===start),t=__BF.tas;let delayed=false,stats={},lab={},candidate={},positions=[],capture;
    if(variant==='missing-feature')for(const o of obs){if(start>=12){if(o.ceHoist)o.ceDuration=100;if(o.ceFold)o.cePhase=9;if(o.ceFoldGate!==undefined)o.ceFoldGate=9;if(o.type==='cePressurePod')o.ceRecoilCd=1e9;if(start===18&&o.type==='ceGale')o.ceSpent=true;if(start===20&&o.type==='actRing')o.gone=true;if(start>=23&&o.ceAnvil)o.ceAnvil=false;continue;}if(shape%6===0&&o.ceDelay)o.ceDelay=100;if(shape%6===1)o.ceVault=false;if(shape%6===3&&o.type==='cePrism')o.ceSpent=true;if(shape%6===4&&o.type==='ceGale')o.ceSpent=true;if(shape%6===5&&o.type==='ceRicochet')o.ceSpent=true;if(start===12&&o.type==='ceGrowthLink')o.ceDuration=0;}
    if(variant==='no-rebound')for(const o of obs)if(o.type==='ceAetherSpring')o.ceSpent=true;
    for(let i=0;i<r.tape.length;i++){
     if(variant==='missing-feature'&&shape<12&&shape%6===2&&!delayed&&G.p.onGround&&G.p.floorPlat?.ceCrumble){delayed=true;t.stepFrames(30,{});}
     const k={...r.tape[i]};if(variant==='no-dash')k.dodge=false;if(variant==='missing-feature'&&start===15)k.hook=false;t.stepFrames(1,k);
     if(a.deaths)break;stats={...a.workshop};lab={...a.lab};candidate={...a.candidates,trail:undefined};positions.push([G.p.x-a.rooms[start].x,G.p.y]);
     if(variant==='normal'&&i===Math.floor(r.tape.length*.55)){recalcVP();render();capture=mainCanvas.toDataURL('image/png').split(',')[1];}
    }
    return {room:start,landingRoom:G.p.floorPlat?.ceRoom,used:a.used,variant,complete:a.complete,deaths:a.deaths,stats,lab,candidate,positions,capture};
   },{r,variant});
   if(variant==='normal'){
    assert.equal(result.complete,true,JSON.stringify(result));assert.equal(result.deaths,0);assert.ok(result.lab.dashes>0);
    assert.equal(result.landingRoom,r.index,'finish on this room’s authored landing');
    const expected=[{},{vaults:2},{crumbles:4},{prisms:2,vaults:1},{springs:1},{bells:3},{vaults:2,bells:1,crumbles:1},{vaults:4,bells:2,crumbles:1},{crumbles:5,bells:1,vaults:1},{prisms:4,vaults:1,bells:1},{springs:14},{bells:4,vaults:1,crumbles:1},{vaults:2,bells:1,crumbles:1},{bells:4,vaults:1,crumbles:1},{vaults:2,bells:1,crumbles:1},{prisms:4,vaults:1,bells:1}][r.index];
    for(const [k,v]of Object.entries(r.index<12&&r.index!==10?expected:{}))assert.equal(result.stats[k],v,`room ${r.index} ${k}`);
    if(r.index<12&&r.index%6===0)assert.equal(result.lab.launches,2);
    if(r.index<12&&r.index%6===4)assert.equal(result.stats.wind,0);
    if(r.index===8)assert.ok(result.used.some(v=>v.includes(':pogo-')));
    if(r.index===11)assert.ok(result.used.some(v=>v.includes(':uppercut-')));
    await writeFile(`${out}/room-${r.index===16?'H-new':String.fromCharCode(65+r.index)}.png`,Buffer.from(result.capture,'base64'));delete result.capture;runs.push(result);
    // Retry from a completed room, through the same public entry, must restore all one-use objects.
    await page.evaluate(i=>{BladefallPrecisionWorkshop.select(i);__BF.tas.stepFrames(2,{});},r.index);
    assert.ok(await page.evaluate(()=>G.obstacles.filter(o=>o.ceRoom===G.celeste.room).every(o=>!o.ceSpent&&!o.ceTimer)));
   }else{assert.equal(result.complete,false,`room ${r.index} unexpectedly completed ${variant}`);delete result.capture;counterfactuals.push({...result,positions:undefined});}
  }
  console.log('PASS room',r.index);
 }
 // Input timing sweep, keeping the rest of each recorded route unchanged.
 const timing=[];
 for(const [room,event]of [[0,'jump'],[1,'vault'],[5,'bell'],[6,'jump'],[7,'vault'],[8,'bell'],[9,'bell'],[10,'zip'],[11,'bell']]){
  const r=routes[room];let target;
  if(event==='jump')target=r.tape.findIndex((k,i)=>i>100&&k.jump);
  if(event==='vault')target=r.tape.findIndex((k,i)=>i>75&&k.jump&&!r.tape[i-1]?.jump);
  if(event==='bell'||event==='zip')target=r.tape.findIndex((k,i)=>i>100&&k.dodge);
  const key=['bell','zip'].includes(event)?'dodge':'jump',outcomes=[];
  for(const shift of [-8,-4,-2,0,2,4,8]){
   await page.evaluate(bootstrapStage,44);await page.evaluate(i=>{BladefallPrecisionWorkshop.select(i);__BF.tas.stepFrames(2,{});},room);
   const ok=await page.evaluate(({tape,target,key,shift})=>{const keys=tape.map(k=>({...k}));let end=target;while(keys[end]?.[key])end++;for(let i=target;i<end;i++)delete keys[i][key];for(let i=target+shift;i<end+shift&&i<keys.length;i++)if(i>=0)keys[i][key]=true;for(const k of keys){__BF.tas.stepFrames(1,k);if(G.celeste.deaths||G.celeste.complete)break;}return G.celeste.complete&&G.celeste.deaths===0;},{tape:r.tape,target,key,shift});outcomes.push({shift,ok});
  }
  assert.ok(outcomes.some(r=>r.ok));assert.ok(outcomes.some(r=>!r.ok));timing.push({room,event,outcomes});
 }
 // All three visible playlists use automatic transitions; no setup writes between rooms.
 for(const ids of [[6,7,8,9,11,17,19,20,22,24],[16,13,14,15],[10,18,12,21,23,25,26,27,28,29]]){
  await page.evaluate(bootstrapStage,44);await page.evaluate(i=>{BladefallPrecisionWorkshop.select(i,false);__BF.tas.stepFrames(2,{});},ids[0]);
  for(const [j,id]of ids.entries()){const r=routes[id];const result=await page.evaluate(r=>{for(const k of r.tape){__BF.tas.stepFrames(1,k);if(G.celeste.deaths||G.celeste.complete)break;}if(!G.celeste.complete)__BF.tas.stepFrames(2,{});return {room:G.celeste.room,deaths:G.celeste.deaths,complete:G.celeste.complete};},r);assert.equal(result.deaths,0);assert.equal(result.room,ids[Math.min(j+1,ids.length-1)]);if(j===ids.length-1)assert.ok(result.complete);}
 }
 // A: waiting on the second train cannot ride its return stroke.
 await page.evaluate(bootstrapStage,44);await page.evaluate(()=>{BladefallPrecisionWorkshop.select(0);__BF.tas.stepFrames(2,{});});
 const railDrop=await page.evaluate(tape=>{let caught=false;for(const k of tape){__BF.tas.stepFrames(1,k);if(G.p.onGround&&G.p.floorPlat?.ceDelay>0){caught=true;break;}}const rail=G.p.floorPlat;let dropped=false;for(let i=0;i<100&&!G.celeste.deaths;i++){__BF.tas.stepFrames(1,{});if(rail.gone){dropped=true;if(G.p.floorPlat===rail)throw Error('rider retained on missing rail');}}return {caught,dropped,retries:G.celeste.deaths};},routes[0].tape);assert.ok(railDrop.caught&&railDrop.dropped&&railDrop.retries===1);
 // C: visible sag before collapse, then a genuine ground jump during the coyote window.
 await page.evaluate(bootstrapStage,44);await page.evaluate(()=>{BladefallPrecisionWorkshop.select(2);__BF.tas.stepFrames(2,{});});
 const crumble=await page.evaluate(tape=>{for(const k of tape){__BF.tas.stepFrames(1,k);if(G.p.onGround&&G.p.floorPlat?.ceCrumble)break;}const rock=G.p.floorPlat,home=rock.y;let sag=0;for(let i=0;i<60&&!rock.gone;i++){__BF.tas.stepFrames(1,{});sag=Math.max(sag,home-rock.y);}__BF.tas.stepFrames(2,{});const grace=G.p.coyote;__BF.tas.stepFrames(1,{jump:true});return {gone:rock.gone,sag,grace,vy:G.p.vy,jumps:G.p.jumps};},routes[2].tape);assert.ok(crumble.gone&&crumble.sag>4&&crumble.grace>0&&crumble.vy<0);assert.equal(crumble.jumps,1);
 const nativeUi=!process.argv.includes('--movement');let music=null;
 if(nativeUi){
 // Native fresh-save UI: all twenty-five independently accessible, double jump available, pause picker and room replay work.
 const ui=await browser.newPage();ui.on('pageerror',e=>errors.push(e.message));await ui.setViewport({width:1440,height:900});await ui.goto(`http://127.0.0.1:${server.address().port}/index.html`);await ui.waitForSelector('#precisionBtn');await ui.click('#precisionBtn');await ui.click('#ceFracturedWorkshop');assert.ok(await ui.evaluate(()=>{const c=document.getElementById('ovcard');return c.scrollWidth<=c.clientWidth+1;}),'picker fits its actual overlay wrapper');await ui.screenshot({path:`${out}/room-picker.png`});
 await ui.setViewport({width:390,height:844});assert.ok(await ui.evaluate(()=>{const c=document.getElementById('ovcard');return c.scrollWidth<=c.clientWidth+1;}),'mobile picker has no horizontal clipping');await ui.setViewport({width:1440,height:900});
 for(let i=6;i<30;i++){
  await ui.click([6,7,8,9,11,17,19,20,22,24].includes(i)?'#pwBankTab':[13,14,15,16].includes(i)?'#pwBaseBankTab':'#pwHardTab');if(i===17)await ui.screenshot({path:`${out}/fractured-picker.png`});if(i===6)await ui.screenshot({path:`${out}/banked-picker.png`});
  await ui.click('#pw'+i);await ui.waitForFunction(i=>mode==='play'&&G.stageIndex===44&&G.celeste.room===i,{},i);assert.equal(await ui.evaluate(()=>G.p.maxJumps),2);
  await ui.evaluate(()=>openPause());await ui.click('#pwPauseRooms');
 }
 await ui.click('#pwHardTab');await ui.click('#pw10');await ui.keyboard.press('Space');await new Promise(r=>setTimeout(r,160));await ui.keyboard.press('Space');await ui.waitForFunction(()=>G.p.jumps===2);await ui.keyboard.press('r');await ui.waitForFunction(()=>G.celeste.deaths===1);
 music=await ui.evaluate(()=>currentLevelMusicCue());assert.equal(music.title,'Crystalline Trials');assert.ok((await readFile(resolve(root,music.src))).length>1000);
 }
 assert.deepEqual(errors,[]);
 const hashes={};for(const file of ['index.html','bladefall-act-two.js','bladefall-celeste.js','bladefall-celeste-art.js','bladefall-precision-workshop.js','bladefall-precision-art.js','bladefall-precision-candidates.js','bladefall-precision-fractured.js','bladefall-precision-puzzles.js'])hashes[file]=createHash('sha256').update(await readFile(resolve(root,file))).digest('hex');
 await writeFile(`${out}/${nativeUi?'verification':'movement-verification'}.json`,JSON.stringify({runs:runs.map(({positions,...r})=>r),counterfactuals,timing,railDrop,crumble,playlists:['Fractured Bank (10)','Base Bank (4)','Candidates (10)'],nativeDoubleJump:nativeUi,uiSkipped:!nativeUi,music,errors,hashes},null,2));console.log('PASS: thirty legal routes and applicable counterfactuals, rail drop, stone sag/coyote jump and timing sweeps.'+(nativeUi?' Native room picker passed.':' Native UI skipped in movement-only mode.'));
}finally{await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
