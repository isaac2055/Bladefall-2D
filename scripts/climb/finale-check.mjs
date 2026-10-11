// Survive's finale (7.309): node scripts/climb/finale-check.mjs
// Replays the intended route through every room of Worlds 41 and 42 (Vesper merged), proves the bypasses fail
// (walking past your Echo, Vesper's ward without the merge) and that geography places both worlds clear of the rest.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {Core,keysToInput,expand} from '../pcore-tape.mjs';
const require=createRequire(import.meta.url);
const store={};
globalThis.localStorage={getItem:k=>store[k]??null,setItem:(k,v)=>{store[k]=String(v);},removeItem:k=>{delete store[k];}};
globalThis.BLADEFALL_CLIMB=true;
// Vesper's ward reads the save only inside Survive's World 42; stand there for these probes
globalThis.BladefallPitchView={climb:{state:()=>({world:{n:42}})}};
for(const f of ['climb','climb-bank-passages','climb-atlas','climb-passages','climb-passage-tapes','climb-worlds','climb-finale-tapes','climb-finale','climb-geography','climb-geography-build'])
 require(`../../public/bladefall-${f}.js`);
const CL=globalThis.BladefallClimb,FIN=globalThis.BladefallClimbFinale;
const def=id=>CL.worlds.flatMap(w=>w.rooms).find(d=>d.id===id);
const choose=c=>localStorage.setItem('bladefall.climb.finale.v1',JSON.stringify(c?{echo:true,choice:c}:{}));
const DONE={'cl41-mirror':'exit','cl41-part':'exit','cl41-stay':'echo-yield','cl42-road':'exit','cl42-throne':'vesper-still'};
function play(id,tape,extra=0){
 const g=Core.createGame([def(id)]),keys=expand(tape);let deaths=0,done=null;
 for(let i=0;i<keys.length+extra;i++){Core.step(g,keysToInput(keys[i]||''));for(const e of g.events){if(e.type==='death')deaths++;if(e.type===DONE[id]&&done==null)done=i;}g.events.length=0;if(done!=null)break;}
 return {deaths,done,g};
}
const rows=[];
// 1. the intended routes
choose('merge');
for(const w of [41,42])for(const s of CL.world(w).sections){
 const tape=CL.world(w).tapes[s.room];assert(tape,'no route for '+s.room);
 const r=play(s.room,tape);rows.push(`${s.room}: ${r.done!=null?'completes':'FAILS'} at frame ${r.done} with ${r.deaths} deaths`);
 assert.equal(r.deaths,0,s.room+' route dies');assert.notEqual(r.done,null,s.room+' route does not finish');
}
// 2. bypasses that must fail
for(const id of ['cl41-mirror','cl41-part']){const r=play(id,[[900,'r']]);rows.push(`${id}: walking past your Echo ${r.done!=null?'EXITS':'is stopped'}`);assert.equal(r.done,null,id+' can be walked past');}
{const r=play('cl41-stay',[[600,'r'],[600,'rs']]);rows.push(`cl41-stay: cutting blindly ${r.g.duel.wounds?'WOUNDS':'never wounds'} it`);}
for(const [c,need] of [[null,15],['kill',10],['forget',18]]){choose(c);const r=play('cl42-throne',CL.world(42).tapes['cl42-throne'],600);
 rows.push(`cl42-throne (${c||'not merged'}): ward ${r.g.vesper.need} a form; the merged route ${r.done!=null?'STILL WINS':'falls short'} (form ${r.g.vesper.form}, ${r.g.vesper.wounds}/${r.g.vesper.need})`);
 assert.equal(r.g.vesper.need,need);assert.equal(r.done,null,'Vesper falls without the merge');}
choose('merge');
// 3. geography: both regions clear of every footprint
const built=globalThis.BladefallClimbGeographyBuild.build(CL.worlds);
for(const n of [41,42]){const b=built.geo.regions.get(n).bounds;rows.push(`world ${n}: region ${b.w}x${b.h} at ${b.x},${b.y}`);}
// 4. the finale stays hidden until all forty worlds are complete
assert.equal(FIN.open(),false,'the finale is open with no save');
console.log(rows.join('\n'));
console.log('finale-check: OK');
