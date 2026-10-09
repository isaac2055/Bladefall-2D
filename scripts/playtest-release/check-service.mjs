import assert from 'node:assert/strict';
import {handle,importSeed} from '../../server/playtest-service.mjs';
const M=globalThis.BladefallPlaytestModel;
const sample=(world,over={})=>({id:'record-0000-'+world,player:'player-00001',season:M.SEASON,mode:'explore',campaign:'base',world:String(world),name:'Tester',ms:1000,deaths:2,at:'2026-10-09T00:00:00Z',eligible:true,...over});
const worlds=M.catalog.filter(w=>w.mode==='explore'&&w.campaign==='base');
const rows=worlds.map(w=>sample(w.id));assert.equal(rows.length,20);assert.equal(M.aggregate(rows.slice(1),'explore','base').length,0);assert.equal(M.aggregate(rows,'explore','base')[0].ms,20000);assert.equal(M.aggregate(rows,'explore','fractured').length,0);assert.equal(M.aggregate(rows,'survival','base').length,0);
const improved=sample(worlds[0].id,{id:'record-improved',ms:500,deaths:25});assert.equal(M.aggregate([...rows,improved],'explore','base')[0].ms,19500);assert.equal(M.aggregate([...rows,improved],'explore','base')[0].deaths,63);assert.equal(M.aggregate([...rows,...rows],'explore','base')[0].ms,20000);
assert.equal(M.best([sample(0,{id:'record-slow',player:'player-slower',ms:2000,deaths:0}),sample(0,{deaths:100})])[0].deaths,100);
for(const bad of [{ms:0},{ms:NaN},{campaign:'fractured'},{world:'99'},{deaths:-1},{name:''}])assert.equal(M.valid(sample(0,bad)),false);
const memory=new Map(),store={get:async k=>memory.get(k)??null,setJSON:async(k,v,o)=>{if(o?.onlyIfNew&&memory.has(k))return {modified:false};memory.set(k,structuredClone(v));return {modified:true};},list:async({prefix=''})=>({blobs:[...memory.keys()].filter(k=>k.startsWith(prefix)).map(key=>({key}))})};
const token='test-token-'.repeat(7),post=async(record,kind='time',extra={})=>handle(new Request('http://localhost/.netlify/functions/playtest',{method:'POST',headers:{Origin:'http://localhost'},body:JSON.stringify({player:record.player,token,record,kind,...extra})}),store);
assert.equal((await post(rows[0])).status,200);assert.equal((await post(rows[0])).status,200);assert.equal(memory.size,2);assert.equal((await post(rows[1],'time',{token:'wrong-token-'.repeat(7)})).status,403);assert.equal((await post(sample(0,{id:'practice-0001',eligible:false}))).status,400);
assert.equal((await post(sample(0,{id:'feedback-0001',room:'room-1',fun:9,difficulty:3,comment:'private note'}),'feedback')).status,200);
const publicRows=await(await handle(new Request('http://localhost/.netlify/functions/playtest'),store)).json();assert.equal(publicRows.records.length,1);assert.ok(!JSON.stringify(publicRows).includes('private note'));assert.ok(!JSON.stringify(publicRows).includes('token'));
await importSeed(store,[...memory.entries()]);assert.equal(memory.size,3);
const cross=await handle(new Request('http://localhost/.netlify/functions/playtest',{method:'POST',headers:{Origin:'https://other.example'},body:'{}'}),store);assert.equal(cross.status,403);
console.log('PASS: all-world aggregates, improved personal bests, separate modes/campaigns, time-only ranks, validation, ownership, idempotent retries, private feedback and seed replay.');

const {mkdtemp,rm}=await import('node:fs/promises'),{tmpdir}=await import('node:os'),{join}=await import('node:path'),{localStore}=await import('./local-store.mjs');
const temp=await mkdtemp(join(tmpdir(),'bladefall-store-test-'));
try{const disk=localStore(temp),key='feedback/test-atomic',results=await Promise.all(Array.from({length:12},(_,i)=>disk.setJSON(key,{i},{onlyIfNew:true})));assert.equal(results.filter(r=>r.modified).length,1);assert.ok(Number.isInteger((await disk.get(key)).i));assert.equal((await disk.list({prefix:'feedback/'})).blobs.length,1);console.log('PASS: concurrent immutable local writes produce one complete, private JSON record.');}finally{await rm(temp,{recursive:true,force:true});}
