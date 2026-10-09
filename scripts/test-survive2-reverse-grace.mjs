// Focused human-input contracts for the F31/F32 forgiveness revision.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Core,keysToInput,runRoom} from './pcore-tape.mjs';
const load=n=>JSON.parse(readFileSync(new URL(`./room-bank/fractured/${n}-bank-f${n}.json`,import.meta.url)));
const f31=load(31),f32=load(32);
const ev=(r,t)=>r.events.some(e=>e.type===t);
let checks=0;
for(const d of [f31,f32]){
 for(const check of d.bank.positiveChecks){const r=runRoom([d.room],0,check.tape);assert.ok(r.exited&&r.deaths===0,`${d.room.id}: ${check.name}`);assert.equal(r.events.filter(e=>e.type==='reverse-hyper').length,1);assert.equal(r.events.filter(e=>e.type==='phase').length,1);assert.equal(r.events.filter(e=>e.type==='dash').length,1);checks++;}
 for(const check of d.bank.shortcutChecks){const r=runRoom([d.room],0,check.tape);assert.ok(!r.exited,`${d.room.id}: ${check.name}`);checks++;}
}
for(const delay of [21,25]){const r=runRoom([f31.room],0,[[delay,'rdxs'],[12,'lj'],[80,'l']]);assert.ok(!ev(r,'late-reverse'));assert.ok(!ev(r,'reverse-hyper'));checks++;}
const legacy=structuredClone(f31.room);delete legacy.movement;
{const r=runRoom([legacy],0,[[13,'rdxs'],[12,'lj'],[80,'l']]);assert.ok(!ev(r,'late-reverse'));assert.ok(!ev(r,'reverse-hyper'));checks++;}
// An ordinary midair dash never acquires a floor launch, even near the visible floor.
{const g=Core.createGame([f31.room]);Object.assign(g.p,{x:210,y:148,onGround:false,wasGround:false,jumpGrace:0});for(let i=0;i<14;i++)Core.step(g,keysToInput('rx'));Core.step(g,keysToInput('lj'));assert.ok(!g.events.some(e=>e.type==='late-reverse'||e.type==='reverse-super'));checks++;}
for(const action of ['g','p']){const def=structuredClone(f31.room);def.lock=def.lock.filter(k=>k!=='parry');const g=Core.createGame([def]);for(let i=0;i<14;i++)Core.step(g,keysToInput('rdxs'));Core.step(g,keysToInput(action));Core.step(g,keysToInput('lj'));assert.ok(!g.events.some(e=>e.type==='late-reverse'||e.type==='reverse-hyper'),`new ${action} clears the launch`);checks++;}
// One late reversal cannot be saved for a second jump or carried through reset.
{const g=Core.createGame([f31.room]);for(let i=0;i<14;i++)Core.step(g,keysToInput('rdxs'));Core.step(g,keysToInput('lj'));Core.step(g,keysToInput('l'));Core.step(g,keysToInput('lj'));assert.equal(g.events.filter(e=>e.type==='reverse-hyper').length,1);Core.resetRoom(g);assert.equal(g.p.move2.reverse,null);checks++;}
// A delayed turn is also valid while still standing on the source runway.
{const def=structuredClone(f31.room),row=def.map[20].split('');for(let c=33;c<=38;c++)row[c]='Y';def.map[20]=row.join('');const g=Core.createGame([def]);for(let i=0;i<15;i++)Core.step(g,keysToInput('rdxs'));assert.equal(g.p.onGround,true);Core.step(g,keysToInput('lj'));assert.ok(g.events.some(e=>e.type==='late-reverse'));checks++;}
// Touching a receiving surface spends the contact memory even if the player does not jump.
{const g=Core.createGame([f31.room]);for(let i=0;i<14;i++)Core.step(g,keysToInput('rdxs'));assert.ok(g.p.move2.reverse);Object.assign(g.p,{x:150,y:157,vx:0,vy:0,onGround:false,wasGround:false,remX:0,remY:0});Core.step(g,keysToInput(''));assert.equal(g.p.onGround,true);assert.equal(g.p.move2.reverse,null);checks++;}
// A Jump already buffered when new ground is detected must make an ordinary landing jump.
{const g=Core.createGame([f31.room]);for(let i=0;i<14;i++)Core.step(g,keysToInput('rdxs'));assert.ok(g.p.move2.reverse);Object.assign(g.p,{x:150,y:157,vx:0,vy:0,onGround:false,wasGround:false,jumpGrace:0,remX:0,remY:0});g.buf.jump=3;g.prev.jump=true;const frame=g.frame+1;Core.step(g,keysToInput('lj'));const events=g.events.filter(e=>e.frame===frame);assert.ok(events.some(e=>e.type==='jump'));assert.ok(!events.some(e=>e.type==='late-reverse'||e.type==='reverse-hyper'));assert.equal(g.p.move2.reverse,null);checks++;}
console.log(`PASS ${checks} reverse-grace, late-cut, resource and dependency checks.`);
