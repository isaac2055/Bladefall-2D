import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,writeFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {launchChrome} from '../tests/launch-chrome.mjs';
const root=resolve('public'),out='docs/charters/celeste/evidence/workshop';
const server=createServer(async(req,res)=>{try{const p=resolve(root,'.'+new URL(req.url,'http://x').pathname);if(!p.startsWith(root+'/'))throw Error();res.setHeader('Content-Type',extname(p)==='.js'?'text/javascript':'text/html');res.end(await readFile(p));}catch{res.statusCode=404;res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await launchChrome({headless:true});
const host=await browser.newPage(),guest=await browser.newPage(),errors=[],runs=[];
const pump=async()=>{for(let n=0;n<20;n++){let count=0;for(const [from,to]of [[host,guest],[guest,host]]){const ms=await from.evaluate(()=>window.__out.splice(0));count+=ms.length;if(ms.length)await to.evaluate(ms=>ms.forEach(netOnMessage),ms);}if(!count)return;}throw Error('transport did not settle');};
try{
 for(const [page,role]of [[host,'host'],[guest,'guest']]){page.on('pageerror',e=>errors.push(e.message));await page.goto(`http://127.0.0.1:${server.address().port}/index.html?tas=1`);await page.waitForFunction(()=>window.__BF?.tas);await page.evaluate(role=>{window.__out=[];NET.role=role;netInitProtocol(role);NET.conn={open:true,send:m=>__out.push(m)};},role);}
 const selected=process.argv[2]?.split(',').map(Number);
 const routes=JSON.parse(await readFile(`${out}/routes.json`)).filter(r=>!selected||selected.includes(r.index));
 for(const together of [true,false])for(const r of routes){
  await host.evaluate(i=>BladefallPrecisionWorkshop.start(i),r.index);await pump();
  for(const p of [host,guest])assert.deepEqual(await p.evaluate(()=>[G.stageIndex,G.celeste.room,!!G.celeste.single]),[44,r.index,true]);
  for(const p of [host,guest])await p.evaluate(()=>__BF.tas.stepFrames(2,{}));await pump();
  for(const [lead,follow]of(together?[[host,guest]]:[[host,guest],[guest,host]])){
   // A fixed recording has a particular cutter phase. Align the waiting partner by
   // legal idle frames (never reset world state) before replaying that recording.
   if(!together&&lead===guest){const wait=await guest.evaluate(()=>{const gcd=(a,b)=>b?gcd(b,a%b):a;const periods=G.obstacles.filter(o=>o.ceRoom===G.celeste.room&&(o.ceMover||o.ceOrbit)).map(o=>Math.round(o.cePeriod*60));if(!periods.length)return 0;const cycle=periods.reduce((a,b)=>a*b/gcd(a,b),1),frame=Math.round(G.celeste.clock*60);return ((2-frame)%cycle+cycle)%cycle;});if(wait){for(const p of [host,guest])await p.evaluate(n=>{for(let i=0;i<n;i++)__BF.tas.stepFrames(1,{});},wait);await pump();}}

   for(const k of r.tape.concat(Array.from({length:20},()=>({right:true})))){
    const done=await lead.evaluate(()=>G.celeste.complete||G.celeste.ready);if(done)break;
    await lead.evaluate(k=>__BF.tas.stepFrames(1,k),k);
    await follow.evaluate(k=>{if(!G.celeste.complete)__BF.tas.stepFrames(1,k);},together?k:{});await pump();
    const deaths=await lead.evaluate(()=>G.celeste.deaths);assert.equal(deaths,0,JSON.stringify({room:r.index,together,k,state:await lead.evaluate(()=>({x:G.p.x-G.celeste.rooms[G.celeste.room].x,y:G.p.y,lab:G.celeste.lab}))}));
   }
  }
  const states=await Promise.all([host,guest].map(p=>p.evaluate(()=>({complete:G.celeste.complete,deaths:G.celeste.deaths}))));assert.ok(states.every(s=>s.complete&&!s.deaths),JSON.stringify({room:r.index,together,states}));runs.push({room:r.index,together,states});console.log('PASS',r.index,together);
 }
 assert.deepEqual(errors,[]);await writeFile(`${out}/${selected?'coop-revised-verification':'coop-verification'}.json`,JSON.stringify({scope:'Two browsers using production packet handlers over in-memory transport; simultaneous and staggered legal routes. Staggered moving-cutter recordings wait on the entrance for their recorded world phase using only idle frames.',runs,errors},null,2));
}finally{await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
