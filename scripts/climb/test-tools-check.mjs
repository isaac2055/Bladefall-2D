import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
import {Core,Rooms,runRoom,expand,keysToInput} from '../pcore-tape.mjs';
const pub=new URL('../../public/',import.meta.url);
const dom=new JSDOM('<!doctype html><html><head></head><body><canvas id="pcCanvas"></canvas><div id="pcOverlay"></div></body></html>',{url:'http://localhost:8371/precision.html?chapter=0',runScripts:'outside-only'}),w=dom.window;
Object.defineProperty(w.document,'readyState',{value:'complete'});
w.structuredClone=structuredClone;w.requestAnimationFrame=()=>0;w.matchMedia=()=>({matches:false});w.Audio=class{constructor(){this.dataset={};}pause(){}play(){return Promise.resolve();}};
const draws=[];const brush=new Proxy({measureText:s=>({width:String(s).length*5}),createLinearGradient:()=>({addColorStop(){}}),createPattern:()=>null,globalAlpha:1},{get:(target,key)=>key in target?target[key]:(...args)=>{draws.push([key,...args]);},set:(target,key,value)=>(target[key]=value,true)});
w.HTMLCanvasElement.prototype.getContext=()=>brush;
w.HTMLCanvasElement.prototype.getBoundingClientRect=()=>({x:0,y:0,left:0,top:0,width:w.innerWidth,height:w.innerHeight});w.HTMLCanvasElement.prototype.setPointerCapture=function(id){this.capture=id;};w.HTMLCanvasElement.prototype.releasePointerCapture=function(){delete this.capture;};
w.BladefallPrecisionCore=Core;w.BladefallPrecisionRooms=Rooms;w.localStorage.setItem('bladefall.pcore.v1',JSON.stringify({options:{sound:false,music:false,shake:true}}));
for(const f of ['bladefall-input.js','bladefall-route-recording.js','bladefall-pcore-test-tools.js','bladefall-pcore-view.js'])w.eval(readFileSync(new URL(f,pub),'utf8'));
const V=w.BladefallPrecisionView,T=w.BladefallPrecisionTestTools;V.pump(1);const view=V.view,canvas=view.canvas;
const key=(type,code,extra={})=>w.dispatchEvent(new w.KeyboardEvent(type,{code,key:code.slice(3),bubbles:true,...extra}));
function pointer(type,x,y,over={}){const e=new w.Event(type,{bubbles:true,cancelable:true});Object.assign(e,{pointerId:1,pointerType:'mouse',button:0,clientX:x,clientY:y,...over});canvas.dispatchEvent(e);return e;}
const uiErrors=[];dom.virtualConsole.on('jsdomError',e=>uiErrors.push(e));
const recordings=[];w.BladefallPlaytest={saveRecording:r=>{recordings.push(r);return r.id;},recordingState:()=> 'synced',state:()=>({run:null}),unlock(){},isPublic:()=>false,feedbackEnabled:()=>false,clockShown:()=>false,setFeedback(){},setClock(){}};
// Outside test mode I still strikes; no checkpoint or panning.
key('keydown','KeyI');V.pump(1);assert(view.lastInput.strike);key('keyup','KeyI');assert.equal(T.state().flag,null);pointer('pointerdown',300,200);pointer('pointermove',200,100);assert.equal(T.state().pan,null);
key('keydown','KeyY');key('keyup','KeyY');assert(w.BladefallRouteRecording.state());V.pump(10);key('keydown','KeyY');key('keyup','KeyY');assert(!w.BladefallRouteRecording.state());assert.equal(recordings.length,1);assert.equal(recordings[0].frames,10);
// The same five clicks which enable stamina/skips enable both new aids.
V.options(()=>{});const shake=w.document.getElementById('opShake');for(let i=0;i<4;i++)shake.click();assert.equal(V.testMode(),false);shake.click();assert.equal(V.testMode(),true);assert(view.g.assist.infiniteStamina);assert(w.document.getElementById('asNote').textContent.includes('I places'));
w.document.getElementById('pcBack').click();w.document.getElementById('pcOverlay').classList.remove('show');view.paused=false;
const core=JSON.parse(readFileSync(new URL('../room-bank/fractured/96-bank-f96.json',import.meta.url)));view.g=Core.createGame([core.room],{assist:{infiniteStamina:true,testMode:true}});V.pump(1);const g=view.g;
// Real I input places a visible flag and reserves the former blade binding.
g.p.x=460;g.p.y=760;g.p.vx=130;g.p.vy=-25;g.p.state='dash';g.p.dashTimer=8;g.p.dashes=0;g.resinWind={t:123,phase:0};
const flagged={x:g.p.x,y:g.p.y,vx:g.p.vx,vy:g.p.vy,state:g.p.state,dashTimer:g.p.dashTimer};key('keydown','KeyI');assert.equal(T.state().flag.x,flagged.x);key('keyup','KeyI');draws.length=0;V.advance([]);assert(draws.some(d=>d[0]==='fillRect'&&d[1]===flagged.x+4&&d[4]===7),'flag rendered');
g.p.x=900;g.p.y=100;g.p.state='dead';g.deaths=7;g.resinWind.t=777;g.ents.find(e=>e.type==='crumble').gone=true;
key('keydown','KeyR');key('keyup','KeyR');for(const [key,value]of Object.entries(flagged))assert.equal(g.p[key],value,key+' restored');assert.equal(g.deaths,7);assert.equal(g.resinWind.t,123);assert(!g.ents.find(e=>e.type==='crumble').gone);
// Every retry clones again: changing the restored graph never changes the saved flag.
g.resinWind.t=999;V.retryRoom();assert.equal(g.resinWind.t,123);
key('keydown','KeyI');const second=T.state().flag;key('keydown','KeyI',{repeat:true});assert.deepEqual(T.state().flag,second);key('keyup','KeyI');
// Typing, menus and watched routes cannot create a test flag.
T.clearFlag();const input=w.document.createElement('input');w.document.body.appendChild(input);input.dispatchEvent(new w.KeyboardEvent('keydown',{code:'KeyI',bubbles:true}));assert.equal(T.state().flag,null);view.replay={frames:[],i:0};key('keydown','KeyI');assert.equal(T.state().flag,null);view.replay=null;
// Mouse movement is converted from CSS pixels using actual render scale, in both axes.
view.cam={x:200,y:350};view.camRoom=g.room.id;const scale=view.scale,frame=g.frame;pointer('pointerdown',400,300);const moved=pointer('pointermove',310,240);assert(moved.defaultPrevented);assert.equal(T.state().pan.x,200+90/scale);assert.equal(T.state().pan.y,350+60/scale);pointer('pointerup',310,240);assert(!canvas.capture);
V.pump(10);assert.equal(g.frame,frame,'inspection freezes gameplay after release');assert.equal(view.cam.x,T.state().pan.x);assert.equal(view.cam.y,T.state().pan.y);assert.equal(w.document.querySelector('[data-follow]').hidden,false);
let copiedCoordinates='';Object.defineProperty(w.navigator,'clipboard',{value:{writeText:async t=>{copiedCoordinates=t;}},configurable:true});canvas.dispatchEvent(new w.MouseEvent('dblclick',{clientX:310,clientY:240,bubbles:true}));await new Promise(resolve=>setImmediate(resolve));assert(copiedCoordinates.includes(g.room.id+' · x '));assert(copiedCoordinates.includes(' · tile '));pointer('pointermove',350,280);assert(w.document.querySelector('[data-note]').textContent.includes('Copied: '+copiedCoordinates));
w.document.querySelector('[data-follow]').click();assert.equal(T.state().pan,null);V.pump(1);assert.equal(g.frame,frame+1);
// Touch gestures retain their normal control path, and overlays never drag the scene.
pointer('pointerdown',400,300,{pointerType:'touch'});pointer('pointermove',100,50,{pointerType:'touch'});assert.equal(T.state().pan,null);V.options(()=>{});pointer('pointerdown',400,300);assert.equal(T.state().pan,null);w.document.getElementById('pcBack').click();w.document.getElementById('pcOverlay').classList.remove('show');
// Disable test mode: both aids disappear and I becomes the normal blade key again.
V.options(()=>{});for(let i=0;i<5;i++)w.document.getElementById('opShake').click();assert.equal(V.testMode(),false);assert(!g.assist.infiniteStamina);assert.equal(T.state().flag,null);assert.equal(T.state().pan,null);assert(w.document.getElementById('pcTestTools').hidden);w.document.getElementById('pcBack').click();w.document.getElementById('pcOverlay').classList.remove('show');key('keydown','KeyI');V.pump(1);assert(view.lastInput.strike);key('keyup','KeyI');
// Every active bank scene can be captured, including native devices with shared entity references.
V.options(()=>{});for(let i=0;i<5;i++)w.document.getElementById('opShake').click();w.document.getElementById('pcBack').click();w.document.getElementById('pcOverlay').classList.remove('show');
const {records}=await import('../room-bank/register.mjs');
for(const {room}of records){view.g=Core.createGame([room],{assist:{testMode:true,infiniteStamina:true}});const scene=view.g,pose={x:scene.p.x,y:scene.p.y};scene.testLink={body:scene.ents[0]};assert(T.place(),room.id+' captured');scene.p.x+=200;scene.testLink.body=null;assert(T.restore(),room.id+' restored');assert.equal(scene.p.x,pose.x);assert.equal(scene.p.y,pose.y);assert.equal(scene.testLink.body,scene.ents[0],room.id+' graph alias restored');}
// Water callbacks still read the restored game; mirrored rooms preserve the copied tile graph.
const tidal=records.find(r=>r.room.tide);assert(tidal);view.g=Core.createGame([tidal.room]);const water=view.g.water,tideClock=water.tide.clock,surface=globalThis.BladefallPrecisionWater.surfaceY(view.g);assert(T.place());view.g.water.tide.clock+=300;assert(T.restore());assert.equal(view.g.water.tide.clock,tideClock);assert.equal(globalThis.BladefallPrecisionWater.surfaceY(view.g),surface);assert.equal(typeof view.g.spikeSafe,'function');
const inverted=records.find(r=>r.room.map.some(row=>row.includes('Q')));assert(inverted);view.g=Core.createGame([inverted.room]);globalThis.BladefallPrecisionGravity.mirror(view.g);assert(view.g.flipped);assert(T.place());globalThis.BladefallPrecisionGravity.mirror(view.g);assert(!view.g.flipped);assert(T.restore());assert(view.g.flipped);assert(view.g.room.mirrored);globalThis.BladefallPrecisionGravity.mirror(view.g);assert(!view.g.flipped);
// Flag retries restore clocks, so the same input produces the same physical outcome.
const woods=records.find(r=>r.room.id==='bank-f97');view.g=runRoom([woods.room],0,woods.verification.partTapes[0]).g;assert(T.place());for(let i=0;i<20;i++)Core.step(view.g,keysToInput(''));const first=Core.digest(view.g),wind=view.g.resinWind.t;assert(T.restore());for(let i=0;i<20;i++)Core.step(view.g,keysToInput(''));assert.equal(Core.digest(view.g),first);assert.equal(view.g.resinWind.t,wind);
// Leaving and returning to another room in the same game does not discard the flag.
view.g=Core.createGame([core.room,woods.room]);assert(T.place());Core.enterRoom(view.g,1);T.sync();assert(T.state().flag);V.retryRoom();assert.equal(view.g.room.id,core.room.id);assert.equal(view.g.roomIndex,0);
// A click with no drag does not stop normal play.
T.clearFlag();pointer('pointerdown',300,200);pointer('pointerup',300,200);assert.equal(T.state().pan,null);const clickFrame=view.g.frame;V.pump(1);assert.equal(view.g.frame,clickFrame+1);
// The real Climb camera and terrain renderer honor the held viewport, not the knight's position.
w.BLADEFALL_CLIMB=true;w.BladefallClimbSession={init(){},start(){},tick(){},invalidate(){},state:()=>({mode:'play'}),complete:()=>false};
for(const name of ['pcore-pitches','pcore-pitches-view','climb','climb-bank-passages','climb-atlas','climb-passages','climb-passage-tapes','climb-worlds','climb-core-tapes','climb-cores','climb-geography','climb-geography-build','climb-art','climb-passage-art','climb-view'])w.eval(readFileSync(new URL('bladefall-'+name+'.js',pub),'utf8'));
const overlay=w.document.getElementById('pcOverlay'),api={view,startChapter:V.startChapter,showOverlay:html=>{overlay.innerHTML=html;overlay.classList.add('show');},hideOverlay:()=>{overlay.classList.remove('show');overlay.innerHTML='';},music(){}};
w.BladefallPitchView.start(new w.URLSearchParams('pitch=climb&world=101&review'),api);V.advance([]);const world=w.BladefallPitchView.climb.state(),place=w.BladefallPitchView.climb.sectionOf(view.g),initial={...view.cam};
pointer('pointerdown',500,300);pointer('pointermove',200,150);pointer('pointerup',200,150);const held={...T.state().pan};V.advance([]);assert.equal(view.cam.x,held.x);assert.equal(view.cam.y,held.y);assert.equal(world.cam.x,place.x+held.x);assert.equal(world.cam.y,place.y+held.y);assert.notEqual(view.cam.x,initial.x);assert.notEqual(view.cam.y,initial.y);
const bounds=w.BladefallPitchView.climb.testCameraBounds();assert(bounds.w>view.g.room.w);assert(bounds.h>view.g.room.h);w.document.querySelector('[data-follow]').click();V.advance([]);assert.equal(T.state().pan,null);assert.notEqual(view.cam.x,held.x);
// Checkpoint returns across a branch restore the view's quest/entrance context too.
world.quest={id:'checkpoint-fixture'};world.branchVia='door';world.enteredAt=77;assert(T.place());world.quest=null;world.branchVia='back';world.enteredAt=999;assert(T.restore());assert.equal(world.quest.id,'checkpoint-fixture');assert.equal(world.branchVia,'door');assert.equal(world.enteredAt,77);
// Route demonstrations release inspection; an explicit Core restart clears the test flag.
pointer('pointerdown',500,300);pointer('pointermove',300,200);pointer('pointerup',300,200);assert(T.inspecting());key('keydown','Escape');key('keyup','Escape');w.document.getElementById('pcWatch').click();assert(!T.inspecting());assert(view.replay);V.retryRoom();assert(!view.replay);
view.g.p.x=100;assert(T.place());key('keydown','Escape');key('keyup','Escape');w.document.getElementById('pcCoreRestart').click();assert.equal(T.state().flag,null);assert.equal(view.g.coreRun.index,-1);assert.equal(view.g.p.x,view.g.room.spawn.x);
// Death uses exactly the same full-scene test snapshot as R.
view.g.p.x=350;view.g.p.y=600;view.g.p.vx=0;view.g.p.vy=0;view.g.p.state='normal';assert(T.place());const deathPose={x:view.g.p.x,y:view.g.p.y};Core.kill(view.g,view.g.p,'flag-fixture');let returned=false;for(let i=0;i<100;i++){V.pump(1);if(view.g.p.state==='normal'&&view.g.p.x===deathPose.x&&view.g.p.y===deathPose.y){returned=true;break;}}assert(returned,'automatic death restores test flag');
// A newly earned real anchor wins over an earlier test flag.
const cp=view.g.room.def.coreCheckpoints[0];view.g.p.x=cp.c*8;view.g.p.y=(cp.r+1)*8-view.g.p.h;view.g.p.vy=0;view.g.p.onGround=true;V.pump(1);assert.equal(view.g.coreRun.index,0);assert.equal(T.state().flag,null);
// Pointer I uses world coordinates under the held camera, with a visible coordinate readout.
view.cam={x:200,y:300};pointer('pointerdown',500,300);pointer('pointermove',420,260);pointer('pointerup',420,260);pointer('pointermove',450,280);assert(!w.document.getElementById('pcTestCoords').hidden);assert(w.document.getElementById('pcTestCoords').textContent.includes('tile'));
key('keydown','KeyI');key('keyup','KeyI');const pointed=T.state().flag;assert(pointed);assert.notEqual(pointed.x,view.g.p.x);V.retryRoom();assert.equal(view.g.p.x,pointed.x);assert.equal(view.g.p.y,pointed.y);assert(!T.inspecting());
// Taking over the real demo retains its later checkpoint for both retry paths.
key('keydown','Escape');key('keyup','Escape');w.document.getElementById('pcWatch').click();for(let n=0;n<1800&&view.g.coreRun.index<1;n++)V.pump(1);assert.equal(view.g.coreRun.index,1);assert(view.replay);key('keydown','ArrowRight');key('keyup','ArrowRight');assert(!view.replay);assert.equal(view.coreReplayCheckpoint,undefined);V.retryRoom();assert.equal(view.g.coreRun.index,1);const anchorX=view.g.p.x;Core.kill(view.g,view.g.p,'takeover-death');for(let i=0;i<100&&view.g.p.state!=='respawn';i++)V.pump(1);assert.equal(view.g.p.x,anchorX);assert.equal(view.g.coreRun.index,1);
// Outside test mode the demonstration is view-only, including a Room Bank/standalone context.
V.options(()=>{});for(let i=0;i<5;i++)w.document.getElementById('opShake').click();w.document.getElementById('pcBack').click();w.document.getElementById('pcOverlay').classList.remove('show');view.paused=false;key('keydown','Escape');key('keyup','Escape');w.document.getElementById('pcWatch').click();assert(view.replay);key('keydown','ArrowRight');key('keyup','ArrowRight');assert(view.replay);const savedPitch=w.BladefallPitchView;w.BladefallPitchView=null;key('keydown','Space');key('keyup','Space');assert(view.replay);w.BladefallPitchView=savedPitch;V.retryRoom();assert.equal(view.g.coreRun.index,1);
// The actual five-click full-map switch exposes the same override consumed by Garden.
for(const name of ['climb-finale-tapes','climb-finale','climb-rewards'])w.eval(readFileSync(new URL('bladefall-'+name+'.js',pub),'utf8'));
V.options(()=>{},{fromMenu:true});for(let i=0;i<4;i++)w.document.getElementById('opFinaleMap').click();assert(!w.BladefallClimbFinale.unlockedAll());w.document.getElementById('opFinaleMap').click();assert(w.BladefallClimbFinale.unlockedAll());for(const k of [3,4,5])assert(w.BladefallClimbRewards.coreOpen(k));for(let i=0;i<5;i++)w.document.getElementById('opFinaleMap').click();assert(!w.BladefallClimbFinale.unlockedAll());for(const k of [3,4,5])assert(!w.BladefallClimbRewards.coreOpen(k));w.document.getElementById('pcBack').click();w.document.getElementById('pcOverlay').classList.remove('show');
// At each resin launch edge the next branch is visible in the native Bank camera.
const oldPitch=w.BladefallPitchView;w.BladefallPitchView=null;view.g=Core.createGame([woods.room]);for(const [x,next]of [[848,640],[640,432]]){view.g.p.x=x;view.g.p.y=205;view.camRoom=null;V.advance([]);assert(next+40>view.cam.x&&next<view.cam.x+view.viewportW,'next resin branch visible from launch');assert(x>=view.cam.x&&x+8<=view.cam.x+view.viewportW,'knight remains visible');}w.BladefallPitchView=oldPitch;
// Core reviews inherit the same world palettes and scenery as Ascend.
w.BLADEFALL_ROOM_BANK=true;w.BladefallClimbSession.refresh=()=>{};
for(const f of ['bladefall-room-bank.js','bladefall-room-bank-view.js'])w.eval(readFileSync(new URL(f,pub),'utf8'));
const coreSkies=new Set();for(const id of Array.from({length:10},(_,i)=>'bank-f'+(96+i))){
 w.BladefallPitchView.start(new w.URLSearchParams('pitch=bank&group=cores&room='+id),api);
 const def=view.g.room.def,pal=w.BladefallPitchView.palette({bank:true});assert.equal(pal,w.BladefallPitchView.climb.palette(def.palette));assert.notEqual(pal,V.palettes.throne);
 assert(w.BladefallClimbArt.active(view.g),'Core terrain receives its origin-world details');coreSkies.add(pal.sky0);
 assert(w.BladefallPitchView.background(brush,pal,view,320,184),'Core bank background uses world scenery');
}
assert.equal(coreSkies.size,10,'ten distinct world palettes');
assert.deepEqual(uiErrors,[],'no swallowed DOM handler errors');
console.log('PASS: actual five-click switch, I/normal blade binding, flag drawing, R/repeated state restore, preserved deaths, typing/menu/replay guards, mouse pan scaling, held screenshots, follow/resume, touch isolation, and mode-off cleanup, native scene snapshots across the complete bank, deterministic device clocks, cross-room return, real Climb terrain/camera framing, and branch context.');
dom.window.close();
