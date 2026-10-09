// Regression for a human Echo press while Grab remains held: never retain the old spatial tether.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {Core,runRoom,keysToInput,expand} from './pcore-tape.mjs';
const load=p=>JSON.parse(fs.readFileSync(new URL(p,import.meta.url),'utf8'));
const before=load('./room-bank/archive/runs-2-3-before-review/fractured/30-bank-f30.json');
const current=load('./room-bank/fractured/30-bank-f30.json');
const devices=globalThis.BladefallPrecisionDevices,at=devices.findIndex(d=>d.name==='throne'),fixed=devices[at];
vm.runInThisContext(fs.readFileSync(new URL('./room-bank/evidence/run23/echo-throne-before.js',import.meta.url),'utf8'));
const old=devices.pop();
const direct=[...before.tape.slice(0,16),[1,'rgq'],[180,'rg']];
devices[at]=old;
const bug=runRoom([before.room],0,direct,{trace:true});
assert.equal(bug.exited,false);assert.ok(bug.log.some(t=>Math.abs(t.vx)>1000));
assert.ok(runRoom([before.room],0,before.tape).exited,'old preview masked the held-Grab failure');
devices[at]=fixed;
const corrected=runRoom([before.room],0,direct,{trace:true});
assert.equal(corrected.exited,true);assert.equal(corrected.deaths,0);
assert.ok(corrected.log.every(t=>Math.abs(t.vx)<500));
assert.ok(runRoom([before.room],0,before.tape).exited,'release-first behavior remains valid');
const g=Core.createGame([current.room],{room:0});
for(const keys of expand(current.tape.slice(0,16)))Core.step(g,keysToInput(keys));
assert.equal(g.p.state,'hook');const ring=g.p.hook.ring,echo={...g.echo},velocity=g.p.vx,dashes=g.p.dashes;
Core.step(g,keysToInput('rgq'));
assert.equal(g.p.hook,null);assert.equal(g.p.lastRing,ring);assert.equal(g.p.state,'normal');
assert.ok(Math.abs(g.p.x-echo.x)<8&&Math.abs(g.p.y-echo.y)<8);
assert.equal(g.p.vx,velocity);assert.equal(g.p.dashes,dashes);
assert.ok(g.events.some(e=>e.type==='unhook'&&e.why==='echo'));
// A solid destination rejects the exchange without discarding the useful tether.
const blocked=Core.createGame([current.room],{room:0});
for(const keys of expand(current.tape.slice(0,16)))Core.step(blocked,keysToInput(keys));
blocked.echo.x=8;blocked.echo.y=0;const blockedRing=blocked.p.hook.ring;
Core.step(blocked,keysToInput('rgq'));
assert.ok(blocked.events.some(e=>e.type==='echo-fizzle'));assert.equal(blocked.p.hook.ring,blockedRing);
// A real moving-ring catch uses the same release path and cannot re-add carrier speed.
const moving=load('./room-bank/base/37-bank-f37.json');
const mg=Core.createGame([{...moving.room,echo:true,lock:(moving.room.lock||[]).filter(k=>k!=='portal')}],{room:0});
for(const keys of expand(moving.tape)){Core.step(mg,keysToInput(keys));if(mg.p.hook)break;}
assert.ok(mg.p.hook?.ring.movingHook);mg.echo={type:'echo',dev:true,presses:true,x:24,y:24,w:mg.p.w,h:mg.p.h,id:'echo'};mg.ents.push(mg.echo);
const mv=mg.p.vx;Core.step(mg,keysToInput('gq'));
assert.equal(mg.p.hook,null);assert.ok(Math.abs(mg.p.vx-mv)<20);assert.ok(mg.events.some(e=>e.type==='moving-unhook'&&e.why==='echo'));
const samples=[];const prefix=before.tape.slice(0,14);
for(const mode of ['rgq','rjgq'])for(const reel of [2,4,6])for(let wait=14;wait<=35;wait++){
 const tape=[...prefix,[wait,'rg'],[reel,'rug'],[1,mode],[180,'rg']];
 const r=runRoom([current.room],0,tape);samples.push({mode,reel,wait,exited:r.exited,deaths:r.deaths,frames:r.exitFrame+1});
}
const canonical=runRoom([current.room],0,current.tape);
assert.equal(canonical.exited,true);assert.equal(canonical.deaths,0);
for(let wait=19;wait<=32;wait++)assert.ok(samples.some(s=>s.mode==='rgq'&&s.reel===4&&s.wait===wait&&s.exited&&!s.deaths));
if(process.argv.includes('--write')){
 const positives=samples.filter(s=>s.exited&&!s.deaths);const chosen=[];
 for(const mode of ['rgq','rjgq'])for(const reel of [2,4,6]){
  const ok=positives.filter(s=>s.mode===mode&&s.reel===reel);for(const s of [ok[0],ok.at(-1)])chosen.push({name:`${mode==='rgq'?'Held Grab + Echo':'Held Grab + Jump + Echo'}, reel ${reel}, departure ${s.wait}`,normalSpawn:true,tape:[...prefix,[s.wait,'rg'],[reel,'rug'],[1,mode],[180,'rg']],frames:s.frames,deaths:0});
 }
 current.bank.positiveChecks=chosen;
 const types=canonical.events.map(e=>e.type);current.bank.route={frames:canonical.exitFrame+1,deaths:0,events:[...new Set(types)],eventCounts:Object.fromEntries([...new Set(types)].map(t=>[t,types.filter(x=>x===t).length]))};
 for(const c of current.bank.shortcutChecks){const r=runRoom([current.room],0,c.tape);assert.equal(r.exited,false);c.after={exited:r.exited,deaths:r.deaths,firstFailure:r.events.find(e=>e.type==='death')||null};}
 fs.writeFileSync(new URL('./room-bank/fractured/30-bank-f30.json',import.meta.url),JSON.stringify(current,null,2)+'\n');
 fs.writeFileSync(new URL('./room-bank/evidence/run23/f30-echo.json',import.meta.url),JSON.stringify({cause:'Echo exchange retained the old hook; hook forces converted teleport displacement into extreme velocity.',before:{exited:bug.exited,deaths:bug.deaths,maxAbsVx:Math.max(...bug.log.map(t=>Math.abs(t.vx)))},sameRoomAfterFix:{exited:corrected.exited,deaths:corrected.deaths},revisedCanonical:{exited:canonical.exited,deaths:canonical.deaths,frames:canonical.exitFrame+1},samples,summary:{samples:samples.length,clean:positives.length,consecutiveDirectSwapTimings:14,representativeTapes:chosen.length}},null,2)+'\n');
}
console.log(`PASS: held-Grab echo regression, rejected-swap tether retention, moving-ring release, unchanged release-first route; ${samples.filter(s=>s.exited&&!s.deaths).length}/${samples.length} varied full-room finishes.`);
