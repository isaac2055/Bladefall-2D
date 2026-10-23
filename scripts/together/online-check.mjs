// Ascend Together over the real link: two pages of precision.html?pitch=climb&coop=local (the co-op panel's
// BroadcastChannel stand-in for PeerJS), host and partner. The host starts the puzzles; each page plays its own
// knight's half of the room's proven route, a frame at a time, through BladefallClimbTogether.tick; frames travel
// host → partner as in an online game. Passes when both pages finish all three rooms with the same final state.
//   node scripts/together/online-check.mjs
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {extname,join,normalize} from 'node:path';
import {fileURLToPath} from 'node:url';
import {launchChrome} from '../../tests/launch-chrome.mjs';
const ROOT=fileURLToPath(new URL('../../public/',import.meta.url));
const TYPES={'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.png':'image/png','.mp3':'audio/mpeg'};
const server=http.createServer(async(req,res)=>{try{const p=normalize(decodeURIComponent(new URL(req.url,'http://x').pathname)).replace(/^\/+/,'')||'index.html';const body=await readFile(join(ROOT,p));res.writeHead(200,{'content-type':TYPES[extname(p)]||'application/octet-stream'});res.end(body);}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await launchChrome({headless:true,args:['--no-sandbox']});
const errors=[];let fail=null;
try{
 const pages=[];
 for(const role of ['host','guest']){
  const page=await browser.newPage();await page.setViewport({width:1280,height:800});page.on('pageerror',e=>errors.push(role+': '+e.message));
  await page.evaluateOnNewDocument(()=>{localStorage.setItem('bladefall.climb.unlock-all.v1','1');});
  await page.goto(`http://127.0.0.1:${server.address().port}/precision.html?pitch=climb&world=1&coop=local&nosw=1`,{waitUntil:'load'});
  await page.waitForFunction(()=>!!window.BladefallClimbTogether&&!!window.BladefallPitchView?.climb?.startWorld,{timeout:30000});
  await new Promise(r=>setTimeout(r,1200));pages.push(page);
 }
 const [host,guest]=pages;
 await host.evaluate(()=>BladefallClimbCoop.host());await guest.evaluate(()=>BladefallClimbCoop.join('LOCAL'));
 await host.waitForFunction(()=>BladefallClimbCoop.state().status==='on',{timeout:10000});
 // the panel shows the host the button
 const button=await host.evaluate(()=>{BladefallPitchView.climb.menu();return !!document.getElementById('coTogether');});
 if(!button)throw Error('the Co-op panel has no Two-player puzzles button for the host');
 await host.evaluate(()=>document.getElementById('coTogether').click());
 const routes=await host.evaluate(()=>BladefallClimbTogetherRooms.routes);
 const expand=t=>{const o=[];for(const [n,k] of t)for(let i=0;i<n;i++)o.push(k);return o;};
 const toInput=k=>({l:k.includes('l'),r:k.includes('r'),u:k.includes('u'),d:k.includes('d'),jump:k.includes('j'),dash:k.includes('x'),grab:k.includes('g'),strike:k.includes('s'),parry:k.includes('p'),portal:k.includes('q')});
 for(let room=0;room<3;room++){
  await guest.waitForFunction(i=>BladefallClimbTogether.state()?.index===i,{timeout:10000},room);
  // the pages' own frame loops stand still; this test is each knight's hands
  for(const p of pages)await p.evaluate(()=>{BladefallPrecisionView.view.mode='test';});
  const id=Object.keys(routes)[room],tapes=routes[id].map(expand),n=Math.max(...tapes.map(t=>t.length))+120;
  // let the two engines see each other's 'ready'
  for(let i=0;i<5;i++){await guest.evaluate(()=>BladefallClimbTogether.tick({}));await host.evaluate(()=>BladefallClimbTogether.tick({}));}
  const hostLead=await host.evaluate(()=>BladefallClimbTogether.state().frame);
  for(let i=0;i<n;i++){
   await guest.evaluate(k=>BladefallClimbTogether.tick(k),toInput(tapes[1][i]||''));
   await host.evaluate(k=>BladefallClimbTogether.tick(k),toInput(tapes[0][i]||''));
   if(i%30===0&&await host.evaluate(()=>BladefallClimbTogether.state()?.done))break;
  }
  for(let i=0;i<40;i++)await guest.evaluate(()=>BladefallClimbTogether.tick({}));
  const states=await Promise.all(pages.map(p=>p.evaluate(()=>{const s=BladefallClimbTogether.state();return s&&{done:s.done,index:s.index,frame:s.frame,players:s.simulation.g.players.map(q=>[Math.round(q.x),Math.round(q.y)])};})));
  console.log('room',room+1,JSON.stringify(states),'(host started',hostLead,'frames ahead)');
  if(!states[0]?.done){fail=`room ${room+1}: host did not finish`;break;}
  if(!states[1]?.done){fail=`room ${room+1}: partner did not finish`;break;}
  if(JSON.stringify(states[0].players)!==JSON.stringify(states[1].players)){fail=`room ${room+1}: the two games disagree`;break;}
  // the host goes on
  await host.evaluate(()=>{BladefallPrecisionView.view.mode='play';document.getElementById('tgNext').click();});
 }
 if(!fail){const end=await guest.waitForFunction(()=>/All 3 rooms/.test(document.getElementById('pcOverlay')?.textContent||''),{timeout:10000}).then(()=>true,()=>false);if(!end)fail='the partner did not see the end card';}
}catch(e){fail=e.message;}
await browser.close();server.close();
const real=errors.filter(e=>!/register/.test(e));
if(real.length)console.log('page errors:\n  '+real.join('\n  '));
if(fail||real.length){console.log('FAIL: '+(fail||'page errors'));process.exit(1);}
console.log('PASS: both games finished all three rooms in step');
