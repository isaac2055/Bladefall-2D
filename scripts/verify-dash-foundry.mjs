import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {launchChrome} from '../tests/launch-chrome.mjs';
import {bootstrapStage} from './bladefall-bot.mjs';
const root=resolve('public'),out='docs/charters/celeste/evidence/foundry';await mkdir(out,{recursive:true});
const server=createServer(async(req,res)=>{try{const p=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://x').pathname));if(!p.startsWith(root+'/'))throw Error();res.setHeader('Content-Type',extname(p)==='.js'?'text/javascript':'text/html');res.end(await readFile(p));}catch{res.statusCode=404;res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await launchChrome({headless:true});
try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewport({width:1280,height:800});await page.goto(`http://127.0.0.1:${server.address().port}/index.html?tas=1`);await page.waitForFunction(()=>window.__BF?.tas);
 const geometry=()=>{
  function rooms(C,stage){const L=C.level(stage);return L.ceRooms.map(r=>({kind:r.kind,width:r.width,objects:L.objects.filter(o=>o.ceRoom===r.i).map(o=>JSON.parse(JSON.stringify(o,(k,v)=>{if(k==='ceRoom'||(k==='t'&&o.type==='lportal')||(k==='spin'&&o.type==='crystal'))return 0;if(typeof v==='number'&&['x','x0','ax','bx','x1','x2','ceHomeX','ceToX'].includes(k))return v-r.x;if(k==='pg'&&/^celeste-\d+$/.test(v))return 'celeste-room';if(typeof v==='string'&&/^\d+:/.test(v))return v.replace(/^\d+:/,'room:');return v;})))}));}
  return {standard:rooms(window.__CelesteBaseline||BladefallCeleste,41),fractured:rooms(window.__CelesteBaseline||BladefallCeleste,42)};
 };
 if(process.argv[2]==='--baseline'){
  const old=await readFile(process.argv[3],'utf8');
  await page.evaluate(src=>{(0,eval)(src.replace('for(const stage of [41,42])A2.register','for(const stage of [])A2.register').replace('root.BladefallCeleste=Object.freeze','root.__CelesteBaseline=Object.freeze'));},old);
  await writeFile(`${out}/baseline.json`,JSON.stringify(await page.evaluate(geometry),null,2));await page.evaluate(()=>delete window.__CelesteBaseline);
 }
 const baseline=JSON.parse(await readFile(`${out}/baseline.json`)),current=await page.evaluate(geometry);
 assert.deepEqual(current.fractured,baseline.fractured,'Fractured geometry stays unchanged');
 assert.deepEqual(current.standard.slice(1),baseline.standard,'All previous Standard rooms retain their geometry');
 const routes=JSON.parse(await readFile('docs/charters/celeste/evidence/routes.json'));
 const tape=routes.find(r=>r.stage===41).rooms[0].tape;
 assert.equal(routes[0].rooms[0].kind,'dash-lab');
 const trials=[];
 for(const variant of ['normal','no-refill','no-shuttle-motion','no-exit-dash','no-diagonal-entry']){
  await page.evaluate(bootstrapStage,41);
  const result=await page.evaluate(({tape,variant})=>{
   const t=__BF.tas;let dash=0,stats={},images=[];
   if(variant==='no-refill')G.obstacles.find(o=>o.type==='ceDashRefill').ceSpent=true;
   if(variant==='no-shuttle-motion'){const o=G.obstacles.find(o=>o.ceShuttle);o.ceToX=o.ceHomeX;}
   for(const recorded of tape){const k={...recorded};if(k.dodge)dash++;
    if(variant==='no-exit-dash'&&dash===5)k.dodge=false;
    if(variant==='no-diagonal-entry'&&dash===1)k.up=false;
    t.stepFrames(1,k);if(G.celeste.lab)stats={...G.celeste.lab};
    if(variant==='normal'&&((stats.refill&&!images.length)||(stats.launches&&images.length===1)||(stats.veins&&images.length===2))){recalcVP();render();images.push(mainCanvas.toDataURL('image/png').split(',')[1]);}
    if(G.celeste.deaths)break;
   }
   t.stepFrames(2,{});
   return {variant,room:G.celeste.room,retries:G.celeste.deaths,maxJumps:G.p.maxJumps,stats,images};
  },{tape,variant});
  for(const [i,png]of result.images.entries())await writeFile(`${out}/step-${i}.png`,Buffer.from(png,'base64'));delete result.images;
  console.log(JSON.stringify(result));trials.push(result);
  if(variant==='normal'){assert.equal(result.room,1);assert.equal(result.retries,0);assert.equal(result.stats.veins,1);assert.equal(result.stats.launches,1);assert.equal(result.maxJumps,2);}
  else assert.equal(result.room,0,variant+' should not complete the recorded route');
 }
 await page.evaluate(bootstrapStage,41);
 const doubleJump=await page.evaluate(()=>{const t=__BF.tas;t.stepFrames(1,{jump:true});t.stepFrames(12,{});const before=G.p.vy;t.stepFrames(1,{jump:true});return {before,after:G.p.vy,jumps:G.p.jumps,maxJumps:G.p.maxJumps};});
 assert.equal(doubleJump.jumps,2);assert.equal(doubleJump.maxJumps,2);assert.ok(doubleJump.after<doubleJump.before&&doubleJump.after<0,'second press launches an airborne jump');
 for(const [stage,file] of [[41,'towering-sea-cliffs.mp3'],[42,'through-the-void-breach.mp3']]){await page.evaluate(bootstrapStage,stage);const cue=await page.evaluate(()=>currentLevelMusicCue());assert.ok(cue.src.endsWith(file));assert.equal(cue.artist,'Aerth score');assert.ok((await readFile(resolve(root,cue.src))).length>1000);}
 await page.evaluate(bootstrapStage,41);
 const remoteDash=await page.evaluate(()=>{Object.assign(G.p,{x:540,y:160,vx:0,vy:0,onGround:false,floorPlat:null});__BF.tas.stepFrames(1,{right:true,dodge:true});const x=G.obstacles.find(o=>o.ceShuttle).x;__BF.tas.stepFrames(4,{right:true});return {moved:G.obstacles.find(o=>o.ceShuttle).x>x,carried:G.celeste.lab.ride,vx:G.p.vx};});assert.ok(remoteDash.moved&&!remoteDash.carried&&remoteDash.vx>700);
 const vectors=[];
 for(const [x,y]of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]){
  await page.evaluate(bootstrapStage,41);
  const row=await page.evaluate(({x,y})=>{
   const t=__BF.tas,p=G.p;Object.assign(p,{x:220,y:350,vx:0,vy:0,onGround:false,floorPlat:null});
   t.stepFrames(1,{right:x>0,left:x<0,up:y>0,down:y<0,dodge:true});const initial={vx:p.vx,vy:p.vy};
   t.stepFrames(4,{right:x<0,left:x>0,up:y<0,down:y>0});const locked={vx:p.vx,vy:p.vy};
   t.stepFrames(12,{});t.stepFrames(1,{dodge:true,right:true});const a=G.celeste.lab,spent={charge:a.charge,dashes:a.dashes,slamming:p.slamming};
   t.stepFrames(1,{checkpoint:true});return {x,y,initial,locked,spent,reset:{charge:G.celeste.lab?.charge??1,refill:!!G.celeste.lab?.refill,phase:G.celeste.lab?.phase??null}};
  },{x,y});
  assert.deepEqual(row.initial,row.locked);assert.ok(Math.abs(Math.hypot(row.initial.vx,row.initial.vy)-720)<.001);assert.deepEqual(row.spent,{charge:0,dashes:1,slamming:false});assert.deepEqual(row.reset,{charge:1,refill:false,phase:null});vectors.push(row);
 }
 const ui=await browser.newPage();ui.on('pageerror',e=>errors.push(e.message));await ui.setViewport({width:1280,height:800});await ui.goto(`http://127.0.0.1:${server.address().port}/index.html`);await ui.waitForSelector('#precisionBtn');await ui.click('#precisionBtn');await ui.click('#ceStandard');await ui.waitForFunction(()=>window.BladefallCeleste?.lab());
 await ui.screenshot({path:`${out}/entrance.png`});
 await ui.evaluate(()=>Object.assign(G.p,{x:220,y:350,vx:0,vy:0,onGround:false,floorPlat:null}));
 await ui.keyboard.down('ArrowUp');await ui.keyboard.down('ArrowRight');await ui.keyboard.down('d');await ui.waitForFunction(()=>G.celeste.lab?.dashes===1);
 const native=await ui.evaluate(()=>({dx:G.celeste.lab.dx,dy:G.celeste.lab.dy}));assert.ok(native.dx>0&&native.dy>0);
 await ui.keyboard.up('d');await ui.keyboard.up('ArrowUp');await ui.keyboard.up('ArrowRight');await ui.keyboard.press('r');await ui.waitForFunction(()=>G.celeste.lab?.dashes===0&&G.p.x===120);
 assert.deepEqual(errors,[]);await writeFile(`${out}/verification.json`,JSON.stringify({preserved:{fractured:true,previousStandardRooms:true},trials,remoteDash,vectors,native,errors},null,2));console.log('PASS: legal route, resource counterfactuals, eight committed directions, no timed air recharge, clean retry and legacy kit restoration.');
}finally{await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
