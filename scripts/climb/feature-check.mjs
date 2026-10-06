// Quick checks of The Climb's controls (node scripts/climb/feature-check.mjs): co-op between two tabs (?coop=local),
// hold T to go to your partner, N to skip, the intended route handing the room back, walking back by a dash.
// Needs the dev server on :8371.
import {launchChrome} from '../../tests/launch-chrome.mjs';
import {fileURLToPath} from 'node:url';
const OUT=fileURLToPath(new URL('./.cache/',import.meta.url));
const b=await launchChrome({headless:true,args:['--no-sandbox']});
const open=async()=>{const p=await b.newPage();await p.setViewport({width:1280,height:720});p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));
 await p.goto('http://localhost:8371/precision.html?pitch=climb&coop=local',{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>window.BladefallPitchView?.climb?.state());return p;};
const host=await open(),guest=await open();
const wait=ms=>new Promise(r=>setTimeout(r,ms));
// co-op: host links, guest links, host picks world 1 → guest follows
await host.evaluate(()=>BladefallClimbCoop.host());await guest.evaluate(()=>BladefallClimbCoop.join('LOCAL'));await wait(300);
await host.evaluate(()=>BladefallPitchView.climb.startWorld(1));await wait(800);
const linked=await guest.evaluate(()=>({status:BladefallClimbCoop.state().status,world:BladefallPitchView.climb.state().world?.n}));
console.log('co-op linked:',JSON.stringify(linked));
// host walks on two sections (by its own routes); guest sees him
await host.evaluate(()=>{const V=BladefallPrecisionView,R=BladefallPrecisionRooms,v=V.view,st=BladefallPitchView.climb.state();v.paused=false;
 for(const s of st.world.sections.slice(0,2)){const f=[];for(const [m,k] of R.tapes[s.room])for(let i=0;i<m;i++)f.push(k);for(const k of f){V.advance([k]);if(v.g.room.id!==s.room)break;}}});
await wait(400);
const seen=await guest.evaluate(()=>{const r=BladefallClimbCoop.state().remote;return r?{room:r.room,x:r.x,y:r.y}:null;});
console.log('guest sees host at:',JSON.stringify(seen));
// guest holds T → goes to the host
const tele=await guest.evaluate(async()=>{const V=BladefallPrecisionView,v=V.view,CO=BladefallClimbCoop;v.paused=false;const before=v.g.room.id;CO.state().tDown=true;
 for(let i=0;i<70;i++)V.advance(['']);CO.state().tDown=false;for(let i=0;i<20;i++)V.advance(['']);return {before,after:v.g.room.id,remote:CO.state().remote?.room};});
console.log('hold T:',JSON.stringify(tele),tele.after===tele.remote?'OK':'FAILED');
await guest.screenshot({path:OUT+'coop-guest.png'});
// N: skip to the next section, three times only
const skip=await host.evaluate(()=>{const V=BladefallPrecisionView,v=V.view,st=BladefallPitchView.climb.state();const out=[];
 for(let i=0;i<4;i++){const a=v.g.room.id;dispatchEvent(new KeyboardEvent('keydown',{key:'n'}));V.advance(['']);out.push(`${a.replace(/^cl\d-/,'')}→${v.g.room.id.replace(/^cl\d-/,'')} (${st.skips} left)`);}return out;});
console.log('N skips:',skip.join(' | '));
// the intended route: shows the way, then hands the room back
const replay=await host.evaluate(()=>{const V=BladefallPrecisionView,R=BladefallPrecisionRooms,v=V.view;const room=v.g.room.id;V.retryRoom();
 const f=[];for(const [m,k] of R.tapes[room])for(let i=0;i<m;i++)f.push(k);v.replay={frames:f,i:0};for(let i=0;i<f.length+30&&v.replay;i++)V.advance(['']);
 return {room,after:v.g.room.id,replayOver:!v.replay};});
console.log('watch the route:',JSON.stringify(replay),replay.after===replay.room?'OK (your turn)':'FAILED (it skipped)');
// explore at leisure: the guest goes to another world; the host is not pulled along
await guest.evaluate(()=>BladefallPitchView.climb.startWorld(2));await wait(600);
const apart=await host.evaluate(()=>({hostWorld:BladefallPitchView.climb.state().world.n,partner:BladefallClimbCoop.state().remote?.world}));
console.log('guest went to world 2:',JSON.stringify(apart),apart.hostWorld===1?'OK (host stays)':'FAILED (host was pulled)');
// hold T across worlds: the guest comes back to the host in world 1
const cross=await guest.evaluate(()=>{const V=BladefallPrecisionView,v=V.view,CO=BladefallClimbCoop;v.paused=false;CO.state().tDown=true;for(let i=0;i<70;i++)V.advance(['']);CO.state().tDown=false;for(let i=0;i<10;i++)V.advance(['']);
 return {world:BladefallPitchView.climb.state().world.n,room:v.g.room.id,remote:CO.state().remote?.room};});
console.log('hold T across worlds:',JSON.stringify(cross),cross.room===cross.remote?'OK':'FAILED');
// a partner in a folded passage is placed along its route, near its mouth, not in the off-map fold space
const fold=await host.evaluate(()=>{const V=BladefallPrecisionView,R=BladefallPrecisionRooms,v=V.view,st=BladefallPitchView.climb.state();
 const pass=R.chapters[st.chapter].rooms.findIndex(r=>r.atlasFold);if(pass<0)return null;V.goRoom(R.chapters.slice(0,st.chapter).reduce((n,c)=>n+c.rooms.length,0)+pass);for(let i=0;i<20;i++)V.advance(['r']);return v.g.room.id;});
await wait(400);
const seenFold=await guest.evaluate(()=>{const V=BladefallPrecisionView,v=V.view,P=BladefallPitchView,CO=BladefallClimbCoop,r=CO.state().remote,pl=P.climb.sectionOf(v.g);
 // distance from me to where I draw my partner, versus the raw (fold-space) distance
 const raw=Math.round(Math.hypot(r.x-pl.x-v.g.p.x,r.y-pl.y-v.g.p.y));let drawn=null;const was=BladefallPrecisionView.drawKnight;BladefallPrecisionView.drawKnight=(b,x,y)=>{drawn={x,y};};
 CO.draw(new Proxy({},{get:(t,k)=>k==='globalAlpha'?1:()=>{},set:()=>true}),v.g,pl);BladefallPrecisionView.drawKnight=was;
 return {partnerRoom:r.room,rawDistance:raw,drawnDistance:drawn?Math.round(Math.hypot(drawn.x-v.g.p.x,drawn.y-v.g.p.y)):null};});
console.log('partner in a passage (',fold,'):',JSON.stringify(seenFold));
const tfold=await guest.evaluate(()=>{const V=BladefallPrecisionView,v=V.view,CO=BladefallClimbCoop;CO.state().tDown=true;for(let i=0;i<70;i++)V.advance(['']);CO.state().tDown=false;for(let i=0;i<10;i++)V.advance(['']);return {room:v.g.room.id,dead:v.g.p.state};});
console.log('hold T into the passage:',JSON.stringify(tfold),tfold.room===fold?'OK':'FAILED');
await guest.screenshot({path:OUT+'coop-passage.png'});
console.log('page errors:',host.errs.concat(guest.errs).length?host.errs.concat(guest.errs):'none');
await b.close();
