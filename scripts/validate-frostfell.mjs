import {createServer} from 'node:http';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import puppeteer from 'puppeteer';
const root=resolve('public'),out=resolve('docs/charters/08-frostfell/evidence');
await mkdir(out,{recursive:true});
const server=createServer(async(req,res)=>{try{const path=resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!path.startsWith(root+'/'))throw Error();const bytes=await readFile(path);res.writeHead(200,{'Content-Type':{'.html':'text/html','.js':'application/javascript','.ogg':'audio/ogg','.mp3':'audio/mpeg'}[extname(path)]||'application/octet-stream'});res.end(bytes);}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await puppeteer.launch({headless:true,executablePath:process.env.PUPPETEER_EXECUTABLE_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--no-sandbox']});
const page=await browser.newPage();await page.setViewport({width:1440,height:900,deviceScaleFactor:1});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto(`http://127.0.0.1:${server.address().port}/index.html?tas=1`,{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.__BF?.tas);
 const routes=await import('./frostfell-route.mjs'),results={};
 for(const name of ['initialRoute','thermalRoute','rewardRoute','galleryRoute','optionalAndRevisit','counterCheck','finaleRoute']){
   results[name]=await page.evaluate(routes[name]);console.log(name+' complete');
 }
 const musterChecks=await import('./frostfell-muster-checks.mjs');
 results.muster=await page.evaluate(musterChecks.musterScenario);
 results.mine=await musterChecks.mineAndMusicScenario(browser,`http://127.0.0.1:${server.address().port}/index.html`);
 // Repeat the progression-critical route in isolated campaign mode, verifying
 // actual rewards and permanent capabilities rather than only preview state.
 results.campaignApproach=await page.evaluate(routes.initialRoute,true);
 results.campaignThermal=await page.evaluate(routes.thermalRoute);
 results.campaignReward=await page.evaluate(routes.rewardRoute);
 results.campaignProgress=await page.evaluate(()=>{
   const before=BFAdvancementModule.profile(meta.advancement).forgeSeals;
   updateFrostfell(1/60);updateFrostfell(1/60);
   const after=BFAdvancementModule.profile(meta.advancement);
   const earned=meta.capabilities.acquired.includes('double-jump');
   const clear=meta.world.cleared.includes('frostfell');
   captureCurrentZonePersistence();loadStage(7);window.__BF.tas.stepFrames(2,{});
   return {before,seals:after.forgeSeals,source:after.sources.includes('authored:frost-hearths'),earned,clear,
     gates:G.obstacles.filter(o=>o.frostGate).every(o=>doorOpen(o)),nimX:G.npcs.find(n=>n.profileId==='nim').x};
 });
 const music=await page.evaluate(async()=>{const cue=currentLevelMusicCue(),r=await fetch(cue.src);return{cue,ok:r.ok,bytes:(await r.arrayBuffer()).byteLength};});
 const checks={
   authoredApproach:results.initialRoute.player.x>5100&&!results.initialRoute.player.dead,
   hearths:['first-hearth','washhouse','workers-hearth'].every(id=>results.initialRoute.circuits['frost-brazier-'+id]?.open),
   realPortalFire:results.thermalRoute.placed&&results.thermalRoute.open,
   reward:results.rewardRoute.teleported&&results.rewardRoute.doubleJump&&!results.rewardRoute.after.dead,
   gallery:results.galleryRoute.first&&results.galleryRoute.second&&results.galleryRoute.shortcut&&Math.abs(results.galleryRoute.after.x-1330)<1,
   optionalRecollection:results.optionalAndRevisit.optional.landed&&results.optionalAndRevisit.optional.relic.found,
   restoreIdentity:results.optionalAndRevisit.replayIdentical,
   persistentReturn:results.optionalAndRevisit.revisit.gates.every(g=>g.open)&&results.optionalAndRevisit.revisit.hearths.every(Boolean)&&results.optionalAndRevisit.revisit.shortcut&&results.optionalAndRevisit.revisit.nim[0].x===4350,
   finale:results.finaleRoute.pass,
   muster:results.muster.pass,
   mineAndMusic:results.mine.pass,
   counterLesson:results.counterCheck.stunned&&results.counterCheck.unhurt,
   campaignProgress:results.campaignProgress.earned&&results.campaignProgress.clear&&results.campaignProgress.seals===1&&results.campaignProgress.before===1&&results.campaignProgress.source&&results.campaignProgress.gates&&results.campaignProgress.nimX===4350,
   music:music.ok&&music.bytes>10000&&music.cue.id==='frostfell-drifting-memories',
   runtimeErrors:errors.length===0,
 };
 // Capture the canvas in the same task as render: LittleJS clears it on the next
 // automatic frame even when TAS has deliberately disabled automatic rendering.
 const screens=[];
 for(const [name,x,branch]of [['refuge',0,'returned'],['cold-works',4700,'works'],['thawed-works',5000,'signal'],['double-jump-court',6780,'reward'],['muster-engine',13750,'muster-engine'],['exposed-galleries',10500,'frost-rest-9'],['muster-activation',13680,'muster-strike'],['muster-patrols',1670,'muster-awake']]){
  const png=await page.evaluate(({x,branch})=>{window.__BF.tas.restoreState(branch);G.cam=x;G.camY=branch==='muster-strike'?720:branch==='muster-engine'?620:branch==='frost-rest-9'?420:0;G.shake=0;G.stageBanner=0;G.outskirtsAnnotation=null;recalcVP();render();return mainCanvas.toDataURL('image/png').split(',')[1];},{x,branch});
  const filename=name+'.png';await writeFile(resolve(out,filename),Buffer.from(png,'base64'));screens.push(filename);
 }
 const receipt={schema:'bladefall.frostfell-validation',version:1,pass:Object.values(checks).every(Boolean),checks,results,music,errors,screens,
   limitations:['Traversal is TAS playback at the real fixed timestep, starting with the Level Select constitutional loadout.',
   'Counter uses a separate staged encounter to verify the contact window.',
   'No enemy or collision is disabled on the main route; there are no player position edits between entry and the service passage.',
   'The folded Warden mine is additionally checked with real keyboard input and automatic updates; the later White Court aqueduct is not exercised.']};
 await writeFile(resolve(out,'receipt.json'),JSON.stringify(receipt,null,2)+'\n');
 console.log(JSON.stringify({pass:receipt.pass,checks,errors},null,2));if(!receipt.pass)process.exitCode=1;
}finally{await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
