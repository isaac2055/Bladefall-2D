import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {JSDOM} from 'jsdom';
import {Core,Rooms,runRoom,expand,keysToInput} from '../pcore-tape.mjs';
const require=createRequire(import.meta.url),storage=new Map();
globalThis.localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)};
globalThis.BLADEFALL_CLIMB=true;
for(const f of ['climb','climb-bank-passages','climb-atlas','climb-passages','climb-passage-tapes','climb-worlds','climb-finale-tapes','climb-finale','climb-core-tapes','climb-cores','climb-rewards','climb-geography','climb-geography-build','pcore-dev-core-checkpoints-view'])require('../../public/bladefall-'+f+'.js');
const CL=globalThis.BladefallClimb,progress=globalThis.BladefallCoreProgress,cores=globalThis.BladefallClimbCores;
assert.deepEqual(cores.worlds.map(w=>w.n),Array.from({length:20},(_,i)=>101+i));assert.equal(CL.worlds.length,62);assert(!existsSync(new URL('../../public/bladefall-climb-csides.js',import.meta.url)));
const rows=[];
for(const [i,w] of cores.worlds.entries()){
 assert.equal(w.rooms.length,1);assert.equal(w.sections.length,1);assert(w.rooms[0].coreCheckpoints.length>=2);const d=w.rooms[0],source=globalThis.BladefallClimbCoreData[i];
 assert.deepEqual(w.kit,i===0?['dash']:i>=5?['dash','strike','parry','portal']:i===4?['dash','strike','parry']:['dash','strike']);assert.equal(source.fire.r,d.map.findIndex(row=>row.includes('P')));assert.equal(source.fire.c,d.map[source.fire.r].indexOf('P'));
 const full=runRoom([d],0,w.tapes[d.id]);assert.equal(full.exited,true,d.id);assert.equal(full.deaths,0,d.id);assert.equal(full.events.filter(e=>e.type==='core-checkpoint').length,d.coreCheckpoints.length);
 const parts=[];
 for(let part=0;part<=d.coreCheckpoints.length;part++){
  const g=Core.createGame([d]);if(part){g.coreRun={room:g.room.id,index:part-1};Core.resetRoom(g);g.p.state='normal';g.p.respawnTimer=0;}
  let death=0,done=false,frames=0;for(const k of expand(source.partTapes[part])){Core.step(g,keysToInput(k));frames++;for(const e of g.events){death+=e.type==='death';if(part<d.coreCheckpoints.length&&e.type==='core-checkpoint'&&e.index===part||part===d.coreCheckpoints.length&&e.type==='exit')done=true;}g.events.length=0;if(done)break;}
  assert.equal(death,0,d.id+' part '+(part+1));assert(done,d.id+' restart part '+(part+1));parts.push(frames);
 }
 const g=Core.createGame([d]);g.coreRun={room:d.id,index:1};Core.resetRoom(g);g.p.state='normal';g.p.respawnTimer=0;const pose={x:g.p.x,y:g.p.y};
 assert(progress.save(g));const restored=Core.createGame([d]);assert(progress.restore(restored));assert.equal(restored.coreRun.index,1);assert.equal(restored.p.x,pose.x);assert.equal(restored.p.y,pose.y);
 for(const e of g.ents)if(e.type==='crumble')e.gone=true;if(g.resinWind)g.resinWind.t=999;if(g.rootLash?.crown)g.rootLash.crown.cut=true;
 Core.kill(g,g.p,'test');let respawn=false;for(let n=0;n<200;n++){Core.step(g,keysToInput(''));if(g.events.some(e=>e.type==='respawn')){respawn=true;break;}g.events.length=0;}
 assert(respawn);assert.equal(g.p.x,pose.x);assert.equal(g.p.y,pose.y);assert.equal(g.coreRun.index,1);assert(g.ents.filter(e=>e.type==='crumble').every(e=>!e.gone));if(g.rootLash?.crown)assert(!g.rootLash.crown.cut);
 const altered={...d,coreProgressRevision:(d.coreProgressRevision||1)+1};assert.equal(progress.saved(altered),null);progress.clear(d);assert.equal(progress.saved(d),null);
 const probes=[[[900,'r']],Array.from({length:30},()=>[[8,'rj'],[8,'rx'],[20,'r']]).flat()];for(const tape of probes)assert.equal(runRoom([d],0,tape).exited,false);
 rows.push({world:w.n,name:d.name,draft:w.draft,wholeFrames:full.exitFrame+1,partFrames:parts,deaths:full.deaths,checkpointDeathReset:true,durableRestore:true,ordinaryProbesStopped:probes.length});
}
for(const [i,w]of cores.worlds.entries()){assert.equal(w.rooms[0].crumbleExtraFrames,i<5?60:i<10?40:i<15?20:0);assert.equal(w.rooms[0].coreCheckpoints.length,i<5?[6,8,4,4,4][i]:5);}
// The player's exact requested supplemental platforms and one-second Woods grace.
const trumpet=cores.worlds[0].rooms[0],woods=cores.worlds[1].rooms[0];assert(trumpet.coreCheckpoints.some(q=>q.c===116&&q.r===11));assert(woods.coreCheckpoints.some(q=>q.c===108&&q.r===26));assert(woods.coreCheckpoints.some(q=>q.c===88&&q.r===11));assert.equal(woods.crumbleExtraFrames,60);const opening=Core.createGame([woods]);Core.step(opening,keysToInput(''));assert.equal(opening.ents.find(e=>e.type==='crumble'&&e.shaking)?.shaking,84);
for(const [d,revision,index,expected]of [[trumpet,1,1,3],[woods,2,1,5]]){storage.set('bladefall.cores.checkpoints.v1',JSON.stringify({[d.coreProgressKey]:{revision,index}}));assert.equal(progress.saved(d).index,expected);progress.clear(d);}
// The grace is opt-in: ordinary rooms stay at 24f.
const small={id:'timing-fixture',cols:40,rows:23,map:Array.from({length:23},(_,r)=>r===21?'..P.....................................':r===22?'..~~~~~.................................':'.'.repeat(40)),exit:'right',movement:'survive-2'};
for(const [core,extra,expected] of [[undefined,60,24],[1,60,84],[2,45,69]]){const g=Core.createGame([{...small,core,crumbleExtraFrames:extra}]);Core.step(g,keysToInput(''));const e=g.ents.find(e=>e.type==='crumble'&&e.shaking);assert(e);assert.equal(e.shaking,expected);}
const built=globalThis.BladefallClimbGeographyBuild.build(CL.worlds),map=globalThis.BladefallClimbGeography.mapSvg(built.geo);assert(!map.includes('101 ·'));assert(!map.includes('102 ·'));for(const n of Array.from({length:18},(_,i)=>103+i))assert(!map.includes(n+' ·'));
const reward=globalThis.BladefallClimbRewards;assert(!reward.coreOpen(1));reward.perfect(1);assert(!reward.coreOpen(1));reward.perfect(21);assert(reward.coreOpen(1));assert(!reward.coreOpen(2));
// Exercise the actual entry and completion hooks without a browser or gameplay UI.
const dom=new JSDOM('<main id="overlay"></main>');globalThis.document=dom.window.document;
globalThis.document.defaultView.HTMLCanvasElement.prototype.getContext=()=>new Proxy({globalAlpha:1},{get:(t,k)=>k in t?t[k]:()=>{},set:(t,k,v)=>(t[k]=v,true)});
let overlay='';const api={view:{chapter:0,chapterStats:{frames:0,deaths:0},scarf:[]},showOverlay:html=>{overlay=html;document.getElementById('overlay').innerHTML=html;},hideOverlay(){},music(){},startChapter(c){api.view.chapter=c;api.view.g=Core.createGame(Rooms.all,{room:Rooms.chapters.slice(0,c).reduce((n,ch)=>n+ch.rooms.length,0)});}};
globalThis.BladefallPrecisionView={palettes:{footing:{}},pureMode:()=>false,persist(){},clearInput(){},retryRoom(){Core.resetRoom(api.view.g);api.view.g.p.state='normal';api.view.g.p.respawnTimer=0;}};
globalThis.BladefallPitchView={helpers:{FOLK:{}},start(){},menu(){},holding(){},exit(){},chapterDone(){},palette(){},draw(){}};
globalThis.BladefallClimbSession={init(){},start(){},invalidate(){},state:()=>({mode:'play'}),complete:()=>false};
globalThis.BladefallPlaytest={unlock(){},state:()=>({run:null}),complete(){throw Error('Core must use its own completion flow');}};
require('../../public/bladefall-climb-view.js');const PV=globalThis.BladefallPitchView;
PV.start(new URLSearchParams('pitch=climb&world=101&legacygeography=1'),api);assert.equal(PV.climb.state().world.n,101);
assert.equal(PV.climb.startWorld(102),false,'both Woods plant halves required');
progress.save(Object.assign(api.view.g,{coreRun:{room:api.view.g.room.id,index:0}}));PV.climb.startWorld(101);assert.equal(api.view.g.coreRun.index,0);assert.equal(api.view.g.p.x,trumpet.coreCheckpoints[0].c*8);
reward.card(api,()=>{});assert(overlay.includes('Continue Core · Part 2/'+(trumpet.coreCheckpoints.length+1)));assert(!overlay.includes('C-side'));document.getElementById('rwBack').onclick();
PV.climb.startWorld(101,null,true);assert.equal(api.view.g.coreRun.index,-1);assert.equal(progress.saved(api.view.g.room.def),null);
api.view.g.coreDemo=true;PV.exit(api.view,()=>{});assert(!reward.state().csides[1]);api.view.g.coreDemo=false;
PV.exit(api.view,()=>{});assert(reward.state().csides[1]);assert(overlay.includes('The trumpet sounds.'));
reward.perfect(2);reward.perfect(22);assert(PV.climb.startWorld(102));PV.exit(api.view,()=>{});assert(reward.state().csides[2],'approved Woods Core earns completion reward');
for(const k of [3,4,5]){assert(!reward.coreOpen(k));reward.perfect(k);assert(!reward.coreOpen(k));reward.perfect(k+20);assert(PV.climb.startWorld(100+k));PV.exit(api.view,()=>{});assert(reward.state().csides[k]);}
for(const k of [6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]){assert(!reward.coreOpen(k));reward.perfect(k);assert(!reward.coreOpen(k));reward.perfect(k+20);assert(PV.climb.startWorld(100+k));PV.exit(api.view,()=>{});assert(reward.state().csides[k],'published Core earns its completion reward');}
for(const [file,sha] of Object.entries(JSON.parse(readFileSync(new URL('../../docs/room-bank/cores-ordinary-baseline.json',import.meta.url)))))assert.equal(createHash('sha256').update(readFileSync(file)).digest('hex'),sha,file+' unchanged');
writeFileSync(new URL('../../docs/room-bank/cores-proof.json',import.meta.url),JSON.stringify({version:'7.339.0',method:'Native simulation, saved-pose part routes, persistence and DOM entry/completion hooks; no live browser verification',ordinarySourcesUnchanged:132,cores:rows},null,2)+'\n');
console.log('PASS: twenty Core whole routes and all authored restart parts, death/terrain resets, durable saves, ordinary crumble timing, Garden gating/resume/restart, demo protection, approved Core rewards, hidden geography, and 132 unchanged ordinary sources.');
