// Draft routes (7.340): a copied level keeps the game's route, Test play checks and watches it, a clean clear
// records a new one, and the solver repairs one broken by an edit (from the old route or from a run with deaths).
import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {JSDOM} from 'jsdom';import {Core,Rooms} from '../pcore-tape.mjs';
function fixture(query){
 const dom=new JSDOM('<canvas id="pcCanvas"></canvas><div id="pcOverlay"></div>',{url:'http://localhost/precision.html?'+query,runScripts:'outside-only'}),w=dom.window;Object.defineProperty(w.document,'readyState',{value:'complete'});w.structuredClone=structuredClone;w.requestAnimationFrame=()=>0;w.matchMedia=()=>({matches:false});w.Audio=class{constructor(){this.dataset={};}pause(){}play(){return Promise.resolve();}};
 const brush=new Proxy({measureText:s=>({width:String(s).length*5}),createLinearGradient:()=>({addColorStop(){}}),createPattern:()=>null,globalAlpha:1},{get:(t,k)=>k in t?t[k]:()=>{},set:(t,k,v)=>(t[k]=v,true)});w.HTMLCanvasElement.prototype.getContext=()=>brush;
 w.BladefallPrecisionCore=Core;w.BladefallPrecisionRooms=Rooms;const load=name=>w.eval(readFileSync('public/'+name+'.js','utf8'));
 for(const name of ['bladefall-workshop-model','bladefall-workshop-ascend','bladefall-route-solver','bladefall-workshop-routes'])load(name);return {dom,w,load};
}
const tick=()=>new Promise(r=>setTimeout(r,0));
// A spike pit between spawn and the right-hand exit.
const room={id:'route-fixture',name:'Route fixture',cols:32,rows:12,exit:'right',map:[...Array(9).fill('#'+'.'.repeat(31)),'#.P'+'.'.repeat(29),'#'.repeat(12)+'^^^^^^'+'#'.repeat(14),'#'.repeat(32)]};
const home=fixture('chapter=0'),{w}=home,M=w.BladefallWorkshopModel,A=w.BladefallWorkshopAscend,RS=w.BladefallRouteSolver,W=w.BladefallWorkshopRoutes;
// The solver finds a route with no old route at all (it heads for the exit), and a copy keeps it.
const found=RS.solve(room,{});assert(found.ok,'solver crosses the fixture with no guidance: '+found.reason);
const original=A.fromRoom(room),definition=W.attach(original,found.route.tape,{});assert(definition.route.ok&&definition.route.path.length>5,'a copied level keeps the game route and its path');
const draft=M.create({id:'route-draft',mode:'ascend',name:'Route draft',source:{mode:'ascend',id:'fixture'},definition});assert.match(W.describe(draft),/fits this version/);
// A test play of the draft: the route is checked, registered for Watch, and plays to the exit.
async function preview(doc){
 const p=fixture('workshopPlay='+doc.id),messages=[];p.load('bladefall-workshop-sandbox');p.w.BladefallWorkshopStore={create:()=>({load:async()=>doc})};
 p.w.postMessage=m=>{if(m?.type==='bladefall-workshop-route-command')p.w.dispatchEvent(new p.w.MessageEvent('message',{source:p.w,origin:p.w.location.origin,data:m}));else messages.push(m);};
 p.load('bladefall-input');p.load('bladefall-pcore-view');p.load('bladefall-workshop-bridge');for(let i=0;i<10;i++)await tick();
 const command=(action,extra={})=>p.w.postMessage({type:'bladefall-workshop-route-command',document:doc.id,action,...extra});
 const route=ev=>messages.filter(m=>m.type==='bladefall-workshop-route'&&m.event===ev);
 const wait=async(ev,after=0,ms=120000)=>{const t=Date.now();while(route(ev).length<=after&&!route('failed').length){if(Date.now()-t>ms)throw Error('timed out waiting for '+ev);await new Promise(r=>setTimeout(r,20));}assert(!route('failed').length,'solver failed: '+route('failed')[0]?.reason);return route(ev).at(-1);};
 return {...p,messages,command,route,wait,V:p.w.BladefallPrecisionView};
}
let t=await preview(draft);
assert.equal(t.route('status')[0].ok,true,'Test play reports that the route fits');assert(t.w.BladefallPrecisionRooms.tapes[room.id],'a fitting route is the draft\'s intended route');
t.command('watch');assert(t.V.view.replay,'Watch route starts the replay');t.V.advance(Array(found.route.frames+20).fill(''));
assert(t.route('watched').length,'the watched route reaches the exit');assert(t.messages.some(m=>m.type==='bladefall-workshop-complete'&&m.watched));
// A clean clear by the player (the same inputs, typed in) is recorded as a route.
t.V.view.paused=false;t.V.retryRoom();t.V.advance(RS.expand(found.route.tape));
const clean=t.route('route').at(-1);assert.equal(clean?.kind,'clean','a deathless clear is offered as the route');assert(clean.route.ok&&clean.route.source==='recorded');
t.dom.window.close();
// An edit that breaks the route: a wall where the route ran. The test reports it, and Find a route repairs it.
const [x,y]=definition.route.path[Math.floor(definition.route.path.length*.25)],c=Math.floor((x+4)/8),r=Math.floor((y+5)/8);
const edited=M.validate({...draft,id:'route-draft-edited',revision:1,definition:{...draft.definition,bodies:{...draft.definition.bodies,wall:{glyph:'#',c,r:r-1,w:1,h:2}}}});
const editedRoom=A.compile(edited.definition);assert(!RS.play(editedRoom,draft.definition.route.tape).ok,'the fixture edit breaks the old route');assert.match(W.describe(edited),/edited since/);
delete Rooms.tapes[room.id];   // each real test play is a fresh page; these fixtures share Node's room table, so the edit gets its own ID
t=await preview(edited);const st=t.route('status')[0];assert(st.has&&!st.ok,'Test play reports a broken route');assert(!t.w.BladefallPrecisionRooms.tapes[room.id],'a broken route is not offered to Watch');
t.command('solve');const solved=await t.wait('route');assert.equal(solved.kind,'solved');assert(RS.play(editedRoom,solved.route.tape).ok,'the repaired route clears the edited room');assert(t.route('progress').length,'the search reports progress');
// A clear with deaths: the player falls in the pit, then clears it; Use my run makes a clean route from it.
t.V.view.paused=false;t.V.retryRoom();const pit=room.map[10].indexOf('^')*8,steps=RS.expand(solved.route.tape);let n=0;while(t.V.view.g.p.state!=='dead'&&n<600)t.V.advance([t.V.view.g.p.x<pit-8?steps[n++]||'r':(n++,'d')]);assert(n<600,'the fixture run dies in the pit');
t.V.advance(Array(120).fill(''));t.V.advance(RS.expand(solved.route.tape));const attempt=t.route('attempt').at(-1);assert(attempt?.deaths>=1,'a clear with deaths is offered as a run to follow');
const before=t.route('route').length;t.command('solve-run');const fromRun=await t.wait('route',before);assert(t.route('route').length>before&&RS.play(editedRoom,fromRun.route.tape).ok,'Use my run makes a clean route');
t.command('adopted',{route:fromRun.route});assert.equal(JSON.stringify(t.w.BladefallPrecisionRooms.tapes[room.id]),JSON.stringify(fromRun.route.tape),'an adopted route can be watched straight away');
t.dom.window.close();
// The builder's Test play bar: a fitting route is not replaced by a clear unless asked; a solved one is saved.
{const doc=home.w.document,bar=doc.createElement('div'),status=doc.createElement('span'),applied=[],sent=[];doc.body.append(bar);
 const frame={contentWindow:home.w};const cleanup=W.bar({bar,status,frame,doc:draft,ui:{apply:e=>{applied.push(e);return true;}}});
 const real=home.w.postMessage;home.w.postMessage=m=>sent.push(m);
 const say=data=>home.w.dispatchEvent(new home.w.MessageEvent('message',{source:home.w,origin:home.w.location.origin,data:{type:'bladefall-workshop-route',document:draft.id,...data}}));
 const button=text=>[...bar.querySelectorAll('button')].find(b=>b.textContent===text);
 say({event:'status',has:true,ok:true,frames:200,source:'original'});assert(!button('Watch route').hidden);button('Watch route').click();assert.equal(sent.at(-1).action,'watch');
 say({event:'route',kind:'clean',route:clean.route});assert.equal(applied.length,0,'a clear never silently replaces a fitting route');assert(!button('Use my run').hidden);button('Use my run').click();assert.equal(applied.at(-1).path.join('.'),'definition.route');assert.equal(sent.at(-1).action,'adopted');
 say({event:'route',kind:'solved',route:solved.route});assert.equal(applied.length,2,'a found route is saved');
 say({event:'attempt',deaths:2});button('Use my run').click();assert.equal(sent.at(-1).action,'solve-run');
 cleanup();home.w.postMessage=real;}
home.dom.window.close();
console.log('PASS: draft routes: copied route kept and checked, Watch to the exit, clean clear recorded, broken route reported and repaired, run with deaths made clean, builder bar adopts/saves without overwriting.');
