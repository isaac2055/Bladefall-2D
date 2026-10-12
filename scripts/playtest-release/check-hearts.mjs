import assert from 'node:assert/strict';
import fs from 'node:fs';import vm from 'node:vm';
import {handle} from '../../server/playtest-service.mjs';
const M=globalThis.BladefallPlaytestModel;
const sample=(id,ms,hearts,extra={})=>({id,season:M.SEASON,mode:'survival',campaign:'base',world:'1',player:'heart-player-1',name:'Heart runner',ms,deaths:3,hearts,eligible:true,at:'2026-10-09',...extra});
const fast=sample('heart-fast-001',1000,0),full=sample('heart-full-001',2000,1),betterFull=sample('heart-full-002',1500,1);
assert.equal(M.best([full,fast])[0].id,fast.id);
assert.equal(M.best([fast,full,betterFull],{sort:'hearts'})[0].id,betterFull.id);
assert.deepEqual(new Set(M.publicBest([fast,full,betterFull]).map(r=>r.id)),new Set([fast.id,betterFull.id]));
// (7.316) World 1 holds two hearts: a purple one (Rowan's route) and the secret's
for(const hearts of [-1,1.5,3,Infinity,'1'])assert.equal(M.valid({...full,hearts}),false);
const all=M.catalog.filter(w=>w.mode==='survival'&&w.campaign==='base').map(w=>sample('heart-world-'+w.id,2000,1,{world:w.id}));
assert.equal(M.aggregate(all,'survival','base','hearts')[0].hearts,20);
assert.equal(M.aggregate(all.slice(1),'survival','base','hearts').length,0);
const data=new Map(),store={get:async k=>data.get(k)||null,setJSON:async(k,v,{onlyIfNew}={})=>{if(!onlyIfNew||!data.has(k))data.set(k,v);},list:async({prefix})=>({blobs:[...data.keys()].filter(k=>k.startsWith(prefix)).map(key=>({key}))})};
for(const record of [fast,full,betterFull]){
 const response=await handle(new Request('https://test.invalid/api/playtest',{method:'POST',headers:{Origin:'https://test.invalid'},body:JSON.stringify({kind:'time',player:record.player,token:'heart-token-'.repeat(6),record})}),store);assert.equal(response.status,200);
}
const body=await (await handle(new Request('https://test.invalid/api/playtest'),store)).json();
assert.equal(body.records.length,2);assert.equal(body.records.find(r=>r.id===betterFull.id).hearts,1);
const saved=new Map([['bladefall.playtest.v1',JSON.stringify({season:'previous-course',records:[{id:'previous-time'}],remote:[],feedback:[{id:'private-old-feedback'}],outbox:[],unlocks:{explore:[],survival:[]}})]]);
const ctx={crypto,console,location:{hostname:'localhost',protocol:'http:'},navigator:{onLine:false},localStorage:{getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,v)}};vm.createContext(ctx);
for(const f of ['bladefall-playtest-worlds.js','bladefall-playtest-model.js','bladefall-playtest.js'])vm.runInContext(fs.readFileSync('public/'+f,'utf8'),ctx);
const P=ctx.BladefallPlaytest;
assert.equal(P.state().data.archives[0].records[0].id,'previous-time');
assert.equal(P.state().data.archives[0].feedback[0].id,'private-old-feedback');
P.start('survival',1);assert.equal(P.collectHeart('secret-1'),true);assert.equal(P.collectHeart('secret-1'),false);assert.equal(P.collectHeart('rowan'),true);assert.equal(P.collectHeart('secret-other'),false);
assert.equal(P.state().run.hearts,2);P.death();assert.equal(P.state().run.hearts,2);
P.start('survival',1,{force:true});assert.equal(P.state().run.hearts,0);assert.equal(P.collectHeart('secret-1'),true,'a fresh time trial can re-earn a previously owned heart');
await P.complete({offer:false});assert.equal(P.collectHeart('secret-other'),false);
P.start('explore',0);assert.equal(P.collectHeart('secret-1'),false);
console.log('PASS heart collection: once per run, fresh-run re-earning, limits, archive preservation, API round-trip, independent fast/heart bests, and twenty-world totals.');
