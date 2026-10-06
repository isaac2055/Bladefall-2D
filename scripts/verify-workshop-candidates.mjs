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
 const routes=JSON.parse(await readFile(`${out}/routes.json`)),report={routes:[],bypasses:[]};
 const select=async i=>{await page.evaluate(bootstrapStage,44);await page.evaluate(i=>{BladefallPrecisionWorkshop.select(i);__BF.tas.stepFrames(2,{});},i);};
 for(const i of [17,10,18,12,19,20,21,22,23,24]){
  await select(i);
  const r=await page.evaluate(r=>{const a=G.celeste,p=G.p,list=G.obstacles.filter(o=>o.ceRoom===r.index),frames=[],pictures=[],pods=[],zipEntries=[],contacts=[];let previousZip=null,previousContacts=0;let previous=0,maxX=p.x,minX=p.x,backtrack=0,rootMax=0,shrunk=false,maxTrail=0;
   for(let n=0;n<r.tape.length;n++){
    __BF.tas.stepFrames(1,r.tape[n]);const s=a.candidates;if(p.seamRide&&p.seamRide.o!==previousZip){zipEntries.push({x:p.x-a.rooms[r.index].x,flight:!!a.flight,expired:a.flightEvents?.length||0});}previousZip=p.seamRide?.o;if((a.contacts||0)>previousContacts){contacts.push(a.lastContact);previousContacts=a.contacts;}
    if(p.x<previous-1)backtrack++;previous=p.x;maxX=Math.max(maxX,p.x);minX=Math.min(minX,p.x);
    if(s.rebounds>pods.length)pods.push({dx:a.lab.dx,dy:a.lab.dy,vx:p.vx,vy:p.vy});
    if(list.some(o=>o.ceSpore&&!o.gone&&!Number.isFinite(o.x+o.y+o.ceVx+o.ceVy)))throw Error('non-finite projectile');
    maxTrail=Math.max(maxTrail,s.trail.length);for(const o of list)if(o.ceRoot){rootMax=Math.max(rootMax,o.ceGrowth);shrunk ||= o.ceRootAge>(o.ceRootLife||3.4)-.6&&o.ceGrowth<.9;}
    if(n%20===0)frames.push({n,x:p.x-a.rooms[r.index].x,y:p.y,flight:!!a.flight,shots:s.shots,rebounds:s.rebounds,catches:s.catches,phase:s.phase});
    const cuts=[10,18].includes(r.index)?[500,1100,1750]:[60,Math.floor(r.tape.length*.38),Math.floor(r.tape.length*.7)];
    if(cuts.includes(n)){recalcVP();render();pictures.push({n,png:mainCanvas.toDataURL('image/png').split(',')[1]});}
   }
   const stats={...a.candidates,trail:undefined};return {i:r.index,complete:a.complete,deaths:a.deaths,stats,workshop:{...a.workshop},used:a.used,anvilHits:a.anvilHits||0,refills:a.flightReceipts||[],gravity:G.gravityFlipped,backtrack,rootMax,shrunk,maxTrail,pods,frames,pictures,zipEntries,contacts,flightEvents:a.flightEvents||[]};},routes[i]);
  assert.ok(r.complete&&!r.deaths);assert.equal(r.stats.hits,0);assert.equal(r.stats.wakeHits||0,0);
  if([10,18].includes(i)){assert.ok(r.stats.shots>=5&&r.frames.some(f=>f.x>7000&&f.flight));const pickups=r.refills.filter(f=>f.refill);assert.equal(pickups.length,3);assert.ok(pickups.every(f=>f.remaining>0&&f.remaining<.5),JSON.stringify(pickups));assert.equal(r.flightEvents.length,3);assert.equal(r.zipEntries.length,3);assert.ok(r.zipEntries.every((z,j)=>!z.flight&&z.expired===j+1));}
  if([12,19].includes(i))assert.ok(r.stats.hoists===4&&r.stats.returns===1&&r.rootMax===1&&r.shrunk&&r.backtrack>40);
  if(i===20){assert.ok(r.maxTrail<132&&r.workshop.bells===1&&r.workshop.crumbles===1&&r.used.some(k=>k.includes(':pogo')));assert.ok(r.used.some(k=>k.endsWith(':tension'))&&r.workshop.vaults===1);}
  if(i===21){assert.equal(r.pods.length,3);assert.ok(r.pods.every(p=>p.vx*p.dx-p.vy*p.dy< -1000));assert.equal(new Set(r.pods.map(p=>`${Math.sign(p.dx)},${Math.sign(p.dy)}`)).size,3);assert.equal(r.workshop.prisms,2);assert.equal(r.workshop.crumbles,1);assert.equal(r.gravity,false);}
  if(i===22){assert.ok(r.stats.catches===4&&r.stats.throws===3&&r.stats.sockets===3);assert.ok(r.stats.switches>=10&&r.workshop.crumbles===2);}
  if(i===17)assert.ok(r.stats.switches>=8&&r.workshop.bells===1&&r.workshop.vaults===0&&r.used.some(k=>k.includes(':pogo'))&&r.used.some(k=>k.endsWith(':tension')));
  if([17,19,20,21,23,24].includes(i))assert.ok(r.used.some(k=>k.endsWith(':tension')));
  if([19,23].includes(i))assert.equal(r.anvilHits,1);if(i===24)assert.equal(r.anvilHits,2);if(i===12)assert.ok(!r.contacts.some(c=>c.x>1700&&c.x<2250),'first vine transfer must clear the pillar');
  if([18,24].includes(i))assert.equal(r.workshop.vaults,0);
  if(i===24)assert.ok(r.workshop.bells===1&&r.used.some(k=>k.includes(':uppercut-')));
  for(const p of r.pictures)await writeFile(`${out}/candidate-${i}-${p.n}.png`,Buffer.from(p.png,'base64'));delete r.pictures;report.routes.push(r);
  // Public retry must clear all candidate-specific state, including carried objects and pooled hazards.
  const clean=await page.evaluate(()=>{BladefallPrecisionWorkshop.select(G.celeste.room);__BF.tas.stepFrames(2,{});const s=G.celeste.candidates,list=G.obstacles.filter(o=>o.ceRoom===G.celeste.room);return {zero:['shots','hits','hoists','returns','roots','switches','rebounds','throws','catches'].every(k=>!s[k]),objects:list.every(o=>!o.ceSpore||o.gone)&&list.every(o=>!o.ceHoist||o.ceAge===-1)&&list.every(o=>!o.ceRoot||o.ceRootAge===-1)&&list.every(o=>o.type!=='ceSeed'||!o.ceCarried&&o.ceRest&&o.x===o.ceOriginX)};});assert.ok(clean.zero&&clean.objects,JSON.stringify({i,clean}));
  // Three deliberately simple skip policies, using only normal movement inputs.
  for(const policy of ['diagonal-spam','horizontal-spam','jump-run']){await select(i);const result=await page.evaluate(policy=>{const a=G.celeste;let maxX=0;for(let n=0;n<1800&&!a.deaths&&!a.complete;n++){const k={right:true,jump:n%28===0};if(policy!=='jump-run'){k.dodge=n%25===0;k.up=policy==='diagonal-spam';}__BF.tas.stepFrames(1,k);maxX=Math.max(maxX,G.p.x-a.rooms[a.room].x);}return {complete:a.complete,deaths:a.deaths,maxX};},policy);assert.equal(result.complete,false,JSON.stringify({i,policy,result}));report.bypasses.push({i,policy,...result});}
  console.log('PASS candidate',i);
 }
 // Every added combination must matter to its own recorded route.
 report.dependencies=[];
 for(const [i,feature]of [[17,'bell'],[17,'pogo'],[17,'ring'],[19,'anvil'],[19,'roots'],[19,'bell'],[20,'ring'],[20,'vault'],[20,'pogo'],[21,'prism'],[21,'pressure'],[22,'folds'],[22,'lantern'],[23,'lift-momentum'],[23,'anvil'],[23,'ring'],[24,'lift-momentum'],[24,'anvil'],[24,'uppercut'],[24,'bell']]){
  await select(i);const result=await page.evaluate(({r,feature})=>{for(const o of G.obstacles.filter(o=>o.ceRoom===r.index)){if(feature==='bell'&&o.type==='ceRicochet'||feature==='prism'&&o.type==='cePrism'||feature==='uppercut'&&o.ceBlade==='uppercut')o.ceSpent=true;if(feature==='pogo'&&o.ceBlade==='pogo')o.ceSpent=true;if(feature==='pressure'&&o.type==='cePressurePod')o.ceRecoilCd=1e9;if(feature==='lift-momentum'&&o.ceWeight)o.ceLaunchSpent=true;if(feature==='vault')o.ceVault=false;if(feature==='ring'&&o.type==='actRing')o.gone=true;if(feature==='anvil')o.ceAnvil=false;if(feature==='roots'&&o.ceRoot){o.ceRoot=false;o.gone=true;}if(feature==='folds'&&o.ceFold)o.cePhase=99;}for(const k of r.tape){__BF.tas.stepFrames(1,feature==='lantern'?{...k,hook:false}:k);if(G.celeste.deaths||G.celeste.complete)break;}return {complete:G.celeste.complete,deaths:G.celeste.deaths};},{r:routes[i],feature});assert.equal(result.complete,false,JSON.stringify({i,feature,result}));report.dependencies.push({i,feature,...result});
 }
 report.refillRemoval=[];report.contours=[];
 for(const i of [10,18]){
  await select(i);const setup=await page.evaluate(()=>{const r=G.celeste.rooms[G.celeste.room],o=G.obstacles.filter(o=>o.ceRoom===r.i),contours=o.filter(o=>o.ceContour);let samples=0,blocked=0;
   for(const ch of r.flightChapters)for(let j=1;j<ch.path.length;j++){const a=ch.path[j-1],b=ch.path[j],n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/20);for(let k=0;k<=n;k++){const px=r.x+a[0]+(b[0]-a[0])*k/n,py=a[1]+(b[1]-a[1])*k/n-22;samples++;if(contours.some(c=>px+13>c.x-c.w/2&&px-13<c.x+c.w/2&&py+44>c.y&&py<c.y+c.h))blocked++;}}
   return {refills:o.filter(o=>o.ceRefill).map(o=>o.x-r.x),strips:contours.length,curvedHeights:new Set(contours.map(o=>Math.round(o.h))).size,samples,blocked};});assert.ok(setup.curvedHeights>10&&setup.samples>300&&setup.blocked===0);report.contours.push({i,...setup});
  for(const x of setup.refills){await select(i);const result=await page.evaluate(({r,x})=>{
   const a=G.celeste;G.obstacles.find(o=>o.ceRoom===r.index&&o.ceRefill&&Math.abs(o.x-a.rooms[r.index].x-x)<1).ceSpent=true;
   let expiredBeforeZipline=false;
   for(const k of r.tape){const flying=!!a.flight;__BF.tas.stepFrames(1,k);if(flying&&!a.flight&&!G.p.seamRide)expiredBeforeZipline=true;if(a.deaths||a.complete)break;}
   return {complete:a.complete,deaths:a.deaths,expiredBeforeZipline};
  },{r:routes[i],x});
  assert.equal(result.complete,false,JSON.stringify({i,x,result}));
  report.refillRemoval.push({i,x,...result});}

 }
 report.rightwardRoots=[];
 for(const i of [12,19]){await select(i);const v=await page.evaluate(()=>{const p=G.p,o=G.obstacles.find(o=>o.ceRoom===G.celeste.room&&o.ceRoot);Object.assign(p,{x:o.ceAnchorX-100,y:400,onGround:false,floorPlat:null});BladefallPrecisionCandidates.dash(p,BladefallCeleste.labState());const edge=()=>({left:o.x-o.w/2,right:o.x+o.w/2,gone:o.gone});BladefallPrecisionCandidates.before(.14,p);const half=edge();BladefallPrecisionCandidates.before(.14,p);const full=edge();BladefallPrecisionCandidates.before(o.ceRootLife||3.4,p);return {anchor:o.ceAnchorX,half,full,expired:o.gone};});assert.ok(Math.abs(v.half.left-v.anchor)<.001&&Math.abs(v.full.left-v.anchor)<.001&&v.full.right>v.half.right&&v.expired);report.rightwardRoots.push({i,...v});}
 // Banked P's lift comes only from carrying the lantern; its aura must follow that state.
 await select(15);report.lanternLift=await page.evaluate(tape=>{for(let n=0;n<380;n++)__BF.tas.stepFrames(1,tape[n]);const seed=G.obstacles.find(o=>o.ceRoom===15&&o.type==='ceSeed');if(!seed.ceCarried)throw Error('no carried lantern at visual capture');recalcVP();render();const png=mainCanvas.toDataURL('image/png').split(',')[1];G.p.vy=500;BladefallPrecisionCandidates.before(.001,G.p);const carried=G.p.vy;seed.ceCarried=false;seed.ceRest=true;G.p.vy=500;BladefallPrecisionCandidates.before(.001,G.p);return {carried,released:G.p.vy,png};},routes[15].tape);assert.equal(report.lanternLift.carried,160);assert.equal(report.lanternLift.released,500);await writeFile(`${out}/base-P-lantern-lift.png`,Buffer.from(report.lanternLift.png,'base64'));delete report.lanternLift.png;
 // M: observe the complete return with the knight aboard, then home-position collapse.
 await select(12);report.returnTrap=await page.evaluate(tape=>{for(const k of tape){__BF.tas.stepFrames(1,k);if(G.p.onGround&&G.p.floorPlat?.ceTrap)break;}const o=G.p.floorPlat;if(!o?.ceTrap)throw Error('no trap boarding');__BF.tas.stepFrames(1,{dodge:true});let sawReturn=false,premature=false,result;for(let n=0;n<180;n++){__BF.tas.stepFrames(1,{});if(o.ceAge>1.2&&o.ceAge<2.3&&G.p.floorPlat===o&&!o.gone)sawReturn=true;if(o.gone){premature=Math.abs(o.x-o.ceOriginX)>1;result={age:o.ceAge,detached:G.p.floorPlat!==o,returns:G.celeste.candidates.returns};break;}}return {sawReturn,premature,...result};},routes[12].tape);assert.ok(report.returnTrap.sawReturn&&!report.returnTrap.premature&&report.returnTrap.detached&&report.returnTrap.age>=2.32);
 // M: the recorded transfer also depends on the growing wall roots.
 await select(12);report.withoutRoots=await page.evaluate(tape=>{for(const o of G.obstacles)if(o.ceRoom===12&&o.ceRoot){o.ceRoot=false;o.gone=true;}for(const k of tape){__BF.tas.stepFrames(1,k);if(G.celeste.deaths||G.celeste.complete)break;}return {complete:G.celeste.complete,deaths:G.celeste.deaths};},routes[12].tape);assert.equal(report.withoutRoots.complete,false);
 // N: this legal route deliberately waits at its first perch until its own wake catches it.
 await select(13);report.wakeWait=await page.evaluate(tape=>{for(const k of tape){__BF.tas.stepFrames(1,k);if(G.p.onGround&&G.p.floorPlat?.ceWakePerch)break;}let hits=0;for(let n=0;n<150&&!G.celeste.deaths;n++){__BF.tas.stepFrames(1,{});hits=Math.max(hits,G.celeste.candidates.wakeHits||0);}return {hits,deaths:G.celeste.deaths};},routes[13].tape);assert.ok(report.wakeWait.hits>0);
 // K: a stationary target in the real firing lane is struck by a finite slow projectile.
 await select(10);report.sporeHit=await page.evaluate(()=>{const p=G.p,a=G.celeste,o=G.obstacles.find(o=>o.ceRoom===10&&o.type==='ceSpitter'),x=o.x-130,y=o.ceMouthY+18;Object.assign(p,{x,y,onGround:false,floorPlat:null});let hit=false,finite=true;for(let n=0;n<180;n++){Object.assign(p,{x,y,vx:0,vy:0});BladefallPrecisionCandidates.before(1/60,p);BladefallPrecisionCandidates.late(1/60,p);a.clock+=1/60;const shots=G.obstacles.filter(o=>o.ceRoom===10&&o.ceSpore&&!o.gone);finite &&= shots.every(o=>Number.isFinite(o.x+o.y)&&Math.abs(Math.hypot(o.ceVx,o.ceVy)-110)<.001);hit ||= a.candidates.hits>0;}return {hit,finite,shots:a.candidates.shots};});assert.ok(report.sporeHit.hit&&report.sporeHit.finite&&report.sporeHit.shots>0);
 // P: removing a lantern starts a grace interval; leaving it empty really closes the gate.
 await select(15);report.lanternGate=await page.evaluate(tape=>{let socket,gate;for(const k of tape){__BF.tas.stepFrames(1,k);socket=G.obstacles.find(o=>o.ceRoom===15&&o.type==='ceSeedSocket'&&o.ceCloseAt>0);if(socket)break;}gate=G.obstacles.find(o=>o.ceRoom===15&&o.ceSeedGate===socket.ceSocketId);const at=G.celeste.clock,initial=gate.gone;G.celeste.clock=socket.ceCloseAt-.02;BladefallPrecisionCandidates.before(.001,G.p);const grace=gate.gone;G.celeste.clock=socket.ceCloseAt+.02;BladefallPrecisionCandidates.before(.001,G.p);return {initial,grace,closed:!gate.gone,duration:socket.ceCloseAt-at};},routes[15].tape);assert.ok(report.lanternGate.initial&&report.lanternGate.grace&&report.lanternGate.closed&&report.lanternGate.duration>1.7);
 // Refresh only the changed stage in the existing authored mechanics inventory.
 const inventory=JSON.parse(await readFile('docs/design/mechanics-inventory-runtime.json'));
 inventory[44]=await page.evaluate(()=>{const L=BladefallCeleste.level(44),objects={};for(const o of L.objects){const flags=['ceHoist','ceTrap','ceRoot','ceFold','ceWake','ceSpore','ceCandidateGate'].filter(k=>o[k]),key=o.type+(flags.length?' ['+flags.join(',')+']':'');const entry=objects[key]||(objects[key]={count:0,examples:[]});entry.count++;if(entry.examples.length<8)entry.examples.push({x:o.x,y:o.y,room:o.ceRoom});}return {index:44,name:'Precision Workshop',precision:true,objects};});
 await writeFile('docs/design/mechanics-inventory-runtime.json',JSON.stringify(inventory)+'\n');
 assert.deepEqual(errors,[]);report.errors=errors;report.scope='Successful legal input tapes, 30 simple bypass attempts, stateful mechanic assertions and isolated failure fixtures. The separate shortcut and flight-omission scripts explore adaptive alternatives; none is an exhaustive path search or a human difficulty rating.';await writeFile(`${out}/candidate-verification.json`,JSON.stringify(report,null,2));console.log('PASS: ten candidate routes, integrated-mechanic dependencies, near-empty refills, curved collision, right-growing roots, carried lift, retries and bypass trials.');
}finally{await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
