// Every region's quest shortcut (7.344–7.346, public/bladefall-explore-mounts.js), in a real browser. For each region:
//   - with the story finished, only the home roost (the region's far end) stands until the knight reaches it on foot
//     (the Outskirts excepted); reaching it opens the roost at the entrance;
//   - with the region's ability not yet held, the roost refuses ("Not yet");
//   - with it held, a ride from the home roost sets the knight down by the entrance roost, alive and in play, and
//     the ride back sets him down by the home roost; a mount that travels is perched wherever it set him down;
//   - no page errors.
//   node scripts/explore/mounts-tour.mjs [stage…] [--shots dir] [--ghost]      (serves public/ itself; --ghost: faded rides)
import http from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {extname,join,normalize} from 'node:path';
import {fileURLToPath} from 'node:url';
import {launchChrome} from '../../tests/launch-chrome.mjs';

const ROOT=fileURLToPath(new URL('../../public/',import.meta.url));
const TYPES={'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.png':'image/png','.svg':'image/svg+xml'};
const server=http.createServer(async(req,res)=>{
 try{const path=normalize(decodeURIComponent(new URL(req.url,'http://x').pathname)).replace(/^\/+/,'')||'index.html';
  const body=await readFile(join(ROOT,path));res.writeHead(200,{'content-type':TYPES[extname(path)]||'application/octet-stream'});res.end(body);}
 catch{res.writeHead(404);res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const args=process.argv.slice(2),shots=args.includes('--shots')?args[args.indexOf('--shots')+1]:null,ghost=args.includes('--ghost');
const asked=args.filter((a,i)=>/^\d+$/.test(a)&&args[i-1]!=='--shots').map(Number);
const stages=asked.length?asked:[1,2,3,4,5,6,7,8,9,10,11,12,13,16,17,18,19,20];
if(shots)await mkdir(shots,{recursive:true});
const browser=await launchChrome({headless:true,args:['--no-sandbox','--disable-background-timer-throttling','--disable-renderer-backgrounding']});
const sleep=ms=>new Promise(r=>setTimeout(r,ms)),fails=[],rows=[];
for(const stage of stages){
 const page=await browser.newPage();await page.setViewport({width:1280,height:720});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const fail=why=>{fails.push(`stage ${stage}: ${why}`);};
 try{
  await page.goto(`http://127.0.0.1:${server.address().port}/index.html?nosw=1`,{waitUntil:'load'});
  await page.waitForFunction(()=>typeof beginRun==='function'&&window.BladefallMounts,{timeout:60000});await sleep(800);
  await page.evaluate(s=>beginRun(0,null,{hp:1,dmg:1},{startStage:s,levelSelect:true}),stage);await sleep(1500);
  if(ghost)await page.evaluate(()=>{meta.rideGhost=true;});   // Settings › Faded rides
  const m=await page.evaluate(s=>{const m=BladefallMounts.MOUNTS[s];G.sessionSideStories={quests:{[m.story]:{phase:'completed',claimed:true}}};BladefallMounts.install();
   return {name:m.name,kind:m.kind,roosts:(BladefallMounts.roosts()||[]).map(r=>({id:r.id,x:Math.round(r.x),y:Math.round(r.y)})),missing:BladefallMounts.missing(),
    placed:G.obstacles.filter(o=>o.mountRoost).map(o=>o.mountRoost)};},stage);
  if(m.roosts.length!==2){fail('roosts '+JSON.stringify(m.roosts));continue;}
  // Not played through yet: only the home roost.
  if(m.placed.length!==1||m.placed[0]!==m.roosts[0].id)fail('before reaching the home roost: '+JSON.stringify(m.placed));
  // Walk up to it (stand by it): the way back opens.
  await page.evaluate(id=>{const r=BladefallMounts.roosts().find(r=>r.id===id);G.p.x=r.x+60;G.p.y=r.y;G.p.vx=0;G.p.vy=0;},m.roosts[0].id);await sleep(900);
  const opened=await page.evaluate(()=>({reached:BladefallMounts.reached(),placed:G.obstacles.filter(o=>o.mountRoost).length}));
  if(!opened.reached||opened.placed!==2)fail('reaching the home roost did not open the way back '+JSON.stringify(opened));
  // The gate: before the region's ability is held the roost refuses.
  if(m.missing.length){
   await page.evaluate(id=>{const r=G.obstacles.find(o=>o.mountRoost===id);G.p.x=r.x;G.p.y=r.y;G.p.vx=0;G.p.vy=0;BladefallMounts.interact(r);},m.roosts[0].id);await sleep(900);
   const refused=await page.evaluate(()=>document.querySelector('#fieldConversation')?.textContent||'');
   if(!/Not yet/.test(refused))fail('the gate did not refuse without '+m.missing.join(','));
   await page.evaluate(()=>BladefallConversation.close());await sleep(300);
   await page.evaluate(s=>{G.sessionCapabilities=levelSelectCapabilitiesForStage(s+1);},stage);
  }
  const ride=async(fromIdx,label)=>{
   const from=m.roosts[fromIdx],to=m.roosts[1-fromIdx];
   await page.evaluate(id=>{const r=G.obstacles.find(o=>o.mountRoost===id);G.p.x=r.x;G.p.y=r.y;G.p.vx=0;G.p.vy=0;G.p.dead=false;},from.id);await sleep(500);
   const prompt=await page.evaluate(()=>{const t=outskirtsInteractionCandidate();return t?.mountRoost?interactionPrompt()?.verb:null;});
   const opened=await page.evaluate(id=>BladefallMounts.interact(G.obstacles.find(o=>o.mountRoost===id)),from.id);await sleep(900);
   const clicked=await page.evaluate(()=>{for(const b of document.querySelectorAll('#fieldConversation button'))if(!/Not now|Leave|▼/.test(b.textContent)){b.click();return b.textContent;}return null;});
   if(!clicked){fail(label+': no ride offered');return null;}
   const t0=Date.now();let shot=false,high=-1e9;
   while(Date.now()-t0<25000){await sleep(250);const s=await page.evaluate(()=>({f:G.mountFlight?.kind==='ride',u:G.mountFlight?.u||G.mountFlight?.t/G.mountFlight?.dur||0,y:G.p.y}));
    high=Math.max(high,s.y);
    if(shots&&!shot&&s.f&&s.u>.4){shot=true;await page.screenshot({path:`${shots}/s${String(stage).padStart(2,'0')}-${label}.png`});}
    if(!s.f&&Date.now()-t0>1500)break;}
   const end=await page.evaluate(()=>({x:Math.round(G.p.x),y:Math.round(G.p.y),mode,dead:G.p.dead,flight:!!G.mountFlight,hidden:!!G.p.mergeHidden}));
   await sleep(700);const settled=await page.evaluate(()=>({x:Math.round(G.p.x),y:Math.round(G.p.y),onGround:G.p.onGround,dead:G.p.dead}));
   if(end.flight)fail(label+': still riding after 25 s');
   if(m.kind==='flight'&&await page.evaluate(()=>BladefallMounts.perch())!==to.id)fail(label+': not perched where it set him down');
   if(end.mode!=='play')fail(label+': mode '+end.mode);
   if(end.dead||settled.dead)fail(label+': died');
   if(end.hidden)fail(label+': knight left hidden');
   if(Math.abs(end.x-to.x)>260)fail(label+`: set down at x=${end.x}, far from the roost at ${to.x}`);
   if(Math.abs(settled.y-to.y)>60)fail(label+`: settled at y=${settled.y}, the roost floor is ${to.y}`);
   return {prompt,clicked,end,settled,high:Math.round(high)};
  };
  if(shots){await page.evaluate(id=>{const r=G.obstacles.find(o=>o.mountRoost===id);G.p.x=r.x+90;G.p.y=r.y;G.p.vx=0;},m.roosts[0].id);await sleep(2200);await page.screenshot({path:`${shots}/s${String(stage).padStart(2,'0')}-roost.png`});}
  const there=await ride(0,'there'),back=await ride(1,'back');
  rows.push(`stage ${stage} ${m.name} (${m.kind}): ${m.roosts.map(r=>r.id+'@'+r.x+'/'+r.y).join(' ↔ ')}; there → x=${there?.end.x} y=${there?.settled.y}, back → x=${back?.end.x} y=${back?.settled.y}${there?` · "${there.prompt}"`:''}`);
 }catch(e){fail('error '+e.message);}
 finally{if(errors.length)fail('page errors: '+errors.slice(0,3).join(' | '));await page.close();}
}
await browser.close();server.close();
console.log(rows.join('\n'));
if(fails.length){console.log('FAIL:\n  '+fails.join('\n  '));process.exit(1);}
console.log(`PASS: ${stages.length} regions' shortcuts open only once their home roost is reached, refuse before the region's ability, then ride there and back (both ways), setting the knight down by the far roost and leaving the mount perched there.`);
