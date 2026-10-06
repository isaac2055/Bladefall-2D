// Smoke every generated section and character pose through the presentation hooks.
// The drawing context rejects invalid coordinates and checks balanced canvas state;
// frozen game objects catch accidental writes into the simulation.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {Core} from './rbr-lib.mjs';
const worlds=[];
const scope={BladefallClimb:{addWorld:w=>worlds.push(w)},BladefallPrecisionDeviceViews:[]};
vm.createContext(scope);
for(const file of ['bladefall-pcore-pitches-view.js','bladefall-climb-worlds.js','bladefall-climb-art.js'])vm.runInContext(readFileSync(new URL('../public/'+file,import.meta.url),'utf8'),scope);
const folk=scope.BladefallPitchView.helpers.FOLK;
worlds.forEach(w=>Object.assign(folk,w.folk));
const art=scope.BladefallClimbArt,pal={sky0:'#101820',sky1:'#354657',far:'#263444',rock:'#4a4658',rockD:'#2b2937',edge:'#8f88a6',moss:'#6f8d5a',accent:'#e9c47a'};
let draws=0,stack=0;
const numeric=(...args)=>{for(const arg of args)assert.ok(Number.isFinite(arg),'non-finite drawing coordinate: '+arg);draws++;};
const ctx=new Proxy({save(){stack++;},restore(){assert.ok(stack>0);stack--;},fillRect(x,y,w,h){numeric(x,y,w,h);assert.ok(w>=0&&h>=0);},createLinearGradient(...args){numeric(...args);return {addColorStop(){}};},beginPath(){},closePath(){},fill(){},stroke(){},setLineDash(){},moveTo:numeric,lineTo:numeric,quadraticCurveTo:numeric,arc:numeric,strokeRect:numeric},{set(o,k,v){if(k==='globalAlpha')assert.ok(v>=0&&v<=1);o[k]=v;return true;}});
function freeze(obj,seen=new Set()) {if(!obj||typeof obj!=='object'||seen.has(obj)||ArrayBuffer.isView(obj))return;seen.add(obj);for(const value of Object.values(obj))freeze(value,seen);Object.freeze(obj);}
let rooms=0;
for(const w of worlds)for(const def of w.rooms){
 const g=Core.createGame([def]);freeze(g);art.terrain(ctx,g,pal);
 for(const cam of [{x:0,y:0},{x:-981,y:-334},{x:14421,y:322}])art.background(ctx,g,cam,320,184,pal);
 assert.equal(stack,0);rooms++;
}
const g={room:{id:'cl2-test',def:{palette:'woods'}},frame:31,roomFrame:31};
for(const who of new Set(['vey','mara','sentinel','nim',...Object.keys(folk)]))for(const face of [-1,1])for(const t of [0,37,181]){art.person(ctx,40,80,who,t,face);assert.equal(stack,0);}
for(const kind of ['moth','shell','ram','spit'])for(const state of ['walk','flip','stun','tell','charge']){const f={kind,state,x:30,y:50,w:16,h:12,alive:true};freeze(f);art.foeDetail(ctx,g,f);}
for(const kind of ['guard','wing','hound','archer'])for(const state of ['idle','tell','attack'])for(const face of [-1,1])for(const exposed of [0,20]){const e={kind,state,x:30,y:50,face,exposed,flash:0};freeze(e);art.combatDetail(ctx,g,e);}
const boss=scope.BladefallPrecisionDeviceViews.find(d=>d.name==='climb-art');
for(const state of ['idle','draw','tell','rush','back','crash','kneel','broken','blink','leave','down'])for(const face of [-1,1]){
 const actor={state,face,dir:face,x:30,y:40,w:16,h:24};const scene={...g,mk:actor,warden:actor,sorc:actor};freeze(scene);boss.draw(ctx,scene);assert.equal(stack,0);
}
const before=draws,other={...g,room:{id:'r1',def:{}}};art.terrain(ctx,other,pal);art.foeDetail(ctx,other,{alive:true});art.combatDetail(ctx,other,{});boss.draw(ctx,other);assert.equal(draws,before,'art must not leak into other game modes');
assert.equal(stack,0);
console.log(`PASS: ${rooms} sections across ${worlds.length} worlds; NPCs, enemies and boss poses; finite drawing coordinates, balanced canvas state, frozen simulation and non-Climb isolation.`);
